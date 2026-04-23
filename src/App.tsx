import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiGetFile, apiPost } from "./services/api";
import type {
  HospitalPatient,
  HospitalPatientPreview,
  InsuranceRecord,
  PatientProfile,
  Report,
  Role,
  RouteName,
  ToastState,
  User
} from "./types/app";
import { AuthPage } from "./pages/AuthPage";
import { HospitalPage } from "./pages/HospitalPage";
import { InsurancePage } from "./pages/InsurancePage";
import { LandingPage } from "./pages/LandingPage";
import { PatientPage } from "./pages/PatientPage";
import { UnsupportedRolePage } from "./pages/UnsupportedRolePage";

type UploadFormState = {
  doctorName: string;
  fileName: string;
  findings: string;
  patientAbha: string;
  patientName: string;
  reportDateTime: string;
  type: string;
};

type PatientProfileFormPayload = {
  abhaNumber: string;
  age: string;
  bloodGroup: string;
  email: string;
  fullName: string;
  phone: string;
  sex: string;
};

function getRouteFromHash(): RouteName {
  const hash = window.location.hash.replace("#", "");

  if (hash === "auth") {
    return "auth";
  }

  if (hash === "app") {
    return "app";
  }

  return "landing";
}

function setHashRoute(route: RouteName) {
  window.location.hash = route === "landing" ? "" : route;
}

export function App() {
  const defaultUploadForm: UploadFormState = {
    doctorName: "Dr.",
    fileName: "",
    findings: "",
    patientAbha: "",
    patientName: "",
    reportDateTime: "",
    type: "CBC Report"
  };
  const [route, setRoute] = useState<RouteName>(getRouteFromHash);
  const [patientSection, setPatientSection] = useState<"dashboard" | "profile">("dashboard");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"patient" | "hospital" | "insurance">("patient");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("medsync_token"));
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [hospitalPatients, setHospitalPatients] = useState<HospitalPatient[]>([]);
  const [insuranceRecords, setInsuranceRecords] = useState<InsuranceRecord[]>([]);
  const [uploadForm, setUploadForm] = useState<UploadFormState>(defaultUploadForm);

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    apiGet("/api/auth/me", token)
      .then((payload) => {
        setUser(payload.user);
        setHashRoute("app");
        setRoute("app");
      })
      .catch(() => {
        localStorage.removeItem("medsync_token");
        setToken(null);
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    setPageLoading(true);
    setPatientProfile(null);
    setReports([]);
    setHospitalPatients([]);
    setInsuranceRecords([]);

    const load = async () => {
      if (user.role === "patient") {
        const [profilePayload, reportsPayload] = await Promise.all([
          apiGet("/api/patient/profile", token),
          apiGet("/api/patient/reports", token)
        ]);

        setPatientProfile(profilePayload.patient);
        setReports(reportsPayload.reports);
        setSelectedReportId(reportsPayload.reports[0]?.id || null);
      }

      if (user.role === "hospital") {
        const payload = await apiGet("/api/hospital/patients", token);
        setHospitalPatients(payload.patients);
      }

      if (user.role === "insurance") {
        const payload = await apiGet("/api/insurance/records", token);
        setInsuranceRecords(payload.records);
      }
    };

    load()
      .catch((error: Error) => {
        setToast({
          message: error.message,
          title: "Could not load data",
          variant: "error"
        });
      })
      .finally(() => setPageLoading(false));
  }, [token, user]);

  function navigate(routeName: RouteName) {
    setHashRoute(routeName);
    setRoute(routeName);
  }

  function resetAuthForm() {
    setAuthError("");
    setEmail("");
    setName("");
    setPassword("");
    setRegisterRole("patient");
  }

  function resetUploadForm() {
    setUploadForm(defaultUploadForm);
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        authMode === "login"
          ? { email, password }
          : { email, name, password, role: registerRole };
      const result = await apiPost(path, payload);

      localStorage.setItem("medsync_token", result.token);
      setToken(result.token);
      setUser(result.user);
      setToast(null);
      resetAuthForm();
      navigate("app");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("medsync_token");
    setToken(null);
    setUser(null);
    setPatientProfile(null);
    setReports([]);
    setHospitalPatients([]);
    setInsuranceRecords([]);
    setSelectedReportId(null);
    setPatientSection("dashboard");
    resetAuthForm();
    resetUploadForm();
    setToast({
      message: "You have been signed out.",
      title: "Logged out",
      variant: "info"
    });
    navigate("landing");
  }

  async function handleShareReport(reportId: string, policyNumber: string) {
    if (!token) {
      return;
    }

    try {
      await apiPost("/api/patient/forward-report", { policyNumber, reportId }, token);
      setToast({
        message: "The hospital-issued report was forwarded to insurance successfully.",
        title: "Forwarded to insurance",
        variant: "success"
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Could not forward the report to insurance.",
        title: "Forward failed",
        variant: "error"
      });
      throw error;
    }
  }

  async function handleDownloadReport(reportId: string) {
    if (!token) {
      return;
    }

    const fileResponse = await apiGetFile(`/api/reports/${reportId}/download`, token);
    const report = reports.find((item) => item.id === reportId);
    const fileName = fileResponse.fileName || report?.fileName || `report-${reportId}.pdf`;
    const downloadUrl = window.URL.createObjectURL(fileResponse.blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    setToast({
      message: `${fileName} was downloaded successfully.`,
      title: "Download ready",
      variant: "success"
    });
  }

  async function handleDeleteReport(reportId: string) {
    if (!token) {
      return;
    }

    try {
      await apiDelete(`/api/reports/${reportId}`, token);
      setReports((currentReports) => {
        const nextReports = currentReports.filter((report) => report.id !== reportId);
        setSelectedReportId((currentSelectedReportId) => {
          if (currentSelectedReportId !== reportId) {
            return currentSelectedReportId;
          }

          return nextReports[0]?.id || null;
        });
        return nextReports;
      });
      setToast({
        message: "The report was deleted successfully.",
        title: "Report deleted",
        variant: "success"
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Could not delete the report.",
        title: "Delete failed",
        variant: "error"
      });
    }
  }

  async function handleSavePatientProfile(profile: PatientProfileFormPayload) {
    if (!token) {
      return;
    }

    try {
      const payload = await apiPost(
        "/api/patient/profile",
        {
          abhaNumber: profile.abhaNumber,
          age: Number(profile.age),
          bloodGroup: profile.bloodGroup,
          email: profile.email,
          name: profile.fullName,
          phone: profile.phone,
          sex: profile.sex
        },
        token
      );

      setPatientProfile(payload.patient);
      setUser(payload.user);
      setToast({
        message: "Patient profile updated successfully.",
        title: "Changes saved",
        variant: "success"
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Could not save patient profile.",
        title: "Save failed",
        variant: "error"
      });
    }
  }

  async function handleUploadReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const payload = await apiPost("/api/hospital/report", uploadForm, token);
    setToast({
      message: `${payload.report.type} uploaded successfully.`,
      title: "Upload complete",
      variant: "success"
    });
    resetUploadForm();

    if (user?.role === "hospital") {
      const refreshedPatients = await apiGet("/api/hospital/patients", token);
      setHospitalPatients(refreshedPatients.patients);
    }
  }

  async function handleHospitalPatientPreview(name: string, abhaNumber: string): Promise<HospitalPatientPreview> {
    if (!token) {
      throw new Error("Authentication required.");
    }

    const params = new URLSearchParams({
      abhaNumber,
      name
    });

    return apiGet(`/api/hospital/patient-preview?${params.toString()}`, token);
  }

  if (!user && route === "landing") {
    return (
      <LandingPage
        onNavigateAuth={() => {
          resetAuthForm();
          setAuthMode("login");
          navigate("auth");
        }}
        onNavigateHome={() => navigate("landing")}
        onNavigateSignup={() => {
          resetAuthForm();
          setAuthMode("register");
          navigate("auth");
        }}
      />
    );
  }

  if (!user && route === "auth") {
    return (
      <AuthPage
        authError={authError}
        authLoading={authLoading}
        authMode={authMode}
        email={email}
        name={name}
        onAuthModeChange={(mode) => {
          resetAuthForm();
          setAuthMode(mode);
        }}
        onEmailChange={setEmail}
        onNavigateAuth={() => {
          resetAuthForm();
          setAuthMode("login");
          navigate("auth");
        }}
        onNavigateHome={() => navigate("landing")}
        onNavigateSignup={() => {
          resetAuthForm();
          setAuthMode("register");
          navigate("auth");
        }}
        onNameChange={setName}
        onPasswordChange={setPassword}
        onRegisterRoleChange={setRegisterRole}
        onSubmit={handleAuthSubmit}
        password={password}
        registerRole={registerRole}
      />
    );
  }

  if (user?.role === "patient") {
    return (
      <PatientPage
        activeSection={patientSection}
        onDeleteReport={handleDeleteReport}
        onDownloadReport={handleDownloadReport}
        onLogout={handleLogout}
        onNavigateHome={() => navigate("landing")}
        onSaveProfile={handleSavePatientProfile}
        onSectionChange={setPatientSection}
        onSelectReport={setSelectedReportId}
        onShareReport={handleShareReport}
        pageLoading={pageLoading}
        patientProfile={patientProfile}
        reports={reports}
        selectedReportId={selectedReportId}
        toast={toast}
        user={user}
      />
    );
  }

  if (user?.role === "hospital") {
    return (
      <HospitalPage
        hospitalPatients={hospitalPatients}
        onLogout={handleLogout}
        onNavigateHome={() => navigate("landing")}
        onRequestPatientPreview={handleHospitalPatientPreview}
        onSubmitUpload={handleUploadReport}
        onUploadFormChange={setUploadForm}
        pageLoading={pageLoading}
        toast={toast}
        uploadForm={uploadForm}
        user={user}
      />
    );
  }

  if (user?.role === "insurance") {
    return (
      <InsurancePage
        insuranceRecords={insuranceRecords}
        onLogout={handleLogout}
        onNavigateHome={() => navigate("landing")}
        pageLoading={pageLoading}
        toast={toast}
        user={user}
      />
    );
  }

  if (user) {
    return (
      <UnsupportedRolePage
        onLogout={handleLogout}
        onNavigateHome={() => navigate("landing")}
        user={user}
      />
    );
  }

  return null;
}
