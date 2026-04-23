import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Camera,
  ChevronRight,
  ClipboardCheck,
  Trash2,
  Download,
  FileText,
  HeartPulse,
  Image as ImageIcon,
  Mail,
  Phone,
  Plus,
  Share2,
  Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Toast } from "../components/ui/Toast";
import { TopNav } from "../components/ui/TopNav";
import type { PatientProfile, Report, ToastState, User } from "../types/app";

type PatientPageProps = {
  activeSection: "dashboard" | "profile";
  onDownloadReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onGenerateSummary: (reportId: string) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onSaveProfile: (profile: {
    abhaNumber: string;
    age: string;
    bloodGroup: string;
    email: string;
    fullName: string;
    phone: string;
    sex: string;
  }) => Promise<void>;
  onSectionChange: (section: "dashboard" | "profile") => void;
  onSelectReport: (reportId: string) => void;
  onShareReport: (reportId: string, policyNumber: string) => Promise<void>;
  pageLoading: boolean;
  patientProfile: PatientProfile | null;
  reports: Report[];
  selectedReportId: string | null;
  toast: ToastState | null;
  user: User;
};

export function PatientPage({
  activeSection,
  onDownloadReport,
  onDeleteReport,
  onGenerateSummary,
  onLogout,
  onNavigateHome,
  onSaveProfile,
  onSectionChange,
  onSelectReport,
  onShareReport,
  pageLoading,
  patientProfile,
  reports,
  selectedReportId,
  toast,
  user
}: PatientPageProps) {
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const selectedReport = reports.find((report) => report.id === selectedReportId) || null;
  const defaultProfileForm = useMemo(
    () => ({
      abhaNumber: patientProfile?.abhaNumber || "",
      age: patientProfile?.age ? String(patientProfile.age) : "",
      bloodGroup: patientProfile?.bloodGroup || "",
      email: user.email,
      fullName: patientProfile?.name || user.name,
      phone: patientProfile?.phone || "",
      sex: patientProfile?.sex || ""
    }),
    [patientProfile, user.email, user.name]
  );
  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [policyNumber, setPolicyNumber] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    setProfileForm(defaultProfileForm);
  }, [defaultProfileForm]);

  const reportHighlights = selectedReport?.findings
    ? selectedReport.findings
        .split(/[.\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const recentVisit = patientProfile?.appointments[0]?.date
    ? new Date(patientProfile.appointments[0].date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "Not set";

  function updateProfileField(field: keyof typeof profileForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  async function handleForwardToInsurance(reportId: string) {
    if (!policyNumber.trim()) {
      setShareError("Enter your insurance policy number before forwarding the report.");
      return;
    }

    try {
      setShareError("");
      await onShareReport(reportId, policyNumber.trim());
      setPolicyNumber("");
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Could not forward the report.");
    }
  }

  function getReportCategory(reportType: string) {
    const label = reportType.toLowerCase();

    if (label.includes("x-ray") || label.includes("scan") || label.includes("imaging")) {
      return { icon: ImageIcon, tone: "IMAGING" };
    }

    if (label.includes("ecg") || label.includes("card")) {
      return { icon: HeartPulse, tone: "CARDIAC" };
    }

    return { icon: FileText, tone: "LAB TEST" };
  }

  return (
    <main className="min-h-screen bg-app-bg text-app-text">
      <TopNav
        navItems={[
          {
            id: "dashboard",
            isActive: activeSection === "dashboard",
            label: "Dashboard",
            onClick: () => onSectionChange("dashboard")
          },
          {
            id: "patient",
            isActive: activeSection === "profile",
            label: "Patient",
            onClick: () => onSectionChange("profile")
          }
        ]}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        userLabel={`${user.name} - Patient`}
      />
      <Container>
        {toast ? (
          <section className="pt-6">
            <Toast message={toast.message} title={toast.title} variant={toast.variant} />
          </section>
        ) : null}
        {activeSection === "dashboard" ? (
          <>
            <section className="py-8">
              <div className="relative overflow-hidden rounded-[28px] bg-brand-blue px-8 py-10 text-white shadow-card md:px-14">
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold tracking-tight-heading text-white md:text-5xl">
                    Welcome back, {patientProfile?.name?.split(" ")[0] || user.name.split(" ")[0]}
                  </h1>
                  <p className="mt-4 text-lg text-sky-100">
                    {user.email} • Patient ID: {patientProfile?.abhaNumber || "Not set"}
                  </p>
                  {pageLoading ? <p className="mt-4 text-sm text-sky-100/90">Loading your dashboard...</p> : null}
                </div>
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
                <Activity className="absolute right-10 top-10 h-12 w-12 text-white/20" />
              </div>
            </section>

            <section className="grid gap-6 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <Card className="rounded-3xl p-7">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-brand-blue">Patient Profile</h2>
                    <button
                      className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-secondary"
                      onClick={() => onSectionChange("profile")}
                      type="button"
                    >
                      Edit Details
                    </button>
                  </div>

                  {patientProfile ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["ABHA NUMBER", patientProfile.abhaNumber || "Not set"],
                        ["BLOOD GROUP", patientProfile.bloodGroup || "Not set"],
                        ["AGE", patientProfile.age ? `${patientProfile.age} Years` : "Not set"],
                        ["SEX", patientProfile.sex || "Not set"]
                      ].map(([label, value]) => (
                        <div className="rounded-2xl bg-slate-50 p-5" key={label}>
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                            {label}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-app-text">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-app-text-secondary">No patient data available.</p>
                  )}
                </Card>

                <Card className="rounded-3xl p-7">
                  <h3 className="text-2xl font-semibold text-brand-blue">Medical History</h3>
                  <div className="mt-5 space-y-3">
                    {patientProfile?.history.length ? (
                      patientProfile.history.map((item, index) => (
                        <div className="flex items-center gap-4 rounded-2xl border border-app-border p-4" key={item}>
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-brand-blue">
                            {index === 0 ? <Activity size={20} /> : <AlertCircle size={20} />}
                          </div>
                          <div>
                            <p className="font-semibold text-app-text">{item}</p>
                            <p className="text-sm text-app-text-secondary">
                              {index === 0 ? "Recorded in your profile" : "Added to your history"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-app-text-secondary">No medical history added yet.</p>
                    )}
                  </div>
                </Card>

                <Card className="rounded-3xl p-7">
                  <h3 className="text-2xl font-semibold text-brand-blue">Notifications</h3>
                  <div className="mt-5 space-y-4">
                    {patientProfile?.notifications.length ? (
                      patientProfile.notifications.map((notification, index) => (
                        <div className="flex gap-3" key={notification.id}>
                          <span
                            className={`mt-2 h-2.5 w-2.5 rounded-full ${
                              index === 0 ? "bg-brand-blue" : "bg-slate-300"
                            }`}
                          />
                          <p className={index === 0 ? "text-app-text" : "text-app-text-secondary"}>{notification.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-app-text-secondary">No notifications yet.</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-brand-blue">Recent Reports</h3>
                  <div className="space-y-3">
                    {reports.length ? (
                      reports.map((report) => {
                        const category = getReportCategory(report.type);
                        const ReportIcon = category.icon;

                        return (
                          <button
                            className={`w-full rounded-3xl border p-5 text-left transition-all ${
                              selectedReportId === report.id
                                ? "border-brand-blue bg-sky-50"
                                : "border-app-border bg-white hover:border-brand-blue/50"
                            }`}
                            key={report.id}
                            onClick={() => onSelectReport(report.id)}
                            type="button"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <ReportIcon
                                className={selectedReportId === report.id ? "text-brand-blue" : "text-app-text-secondary"}
                                size={18}
                              />
                              <span
                                className={`text-xs font-semibold tracking-[0.15em] ${
                                  selectedReportId === report.id ? "text-brand-blue" : "text-app-text-secondary"
                                }`}
                              >
                                {category.tone}
                              </span>
                            </div>
                            <p className="text-xl font-semibold text-app-text">{report.type}</p>
                            <p className="mt-2 text-sm text-app-text-secondary">
                              {new Date(report.createdAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <Card className="rounded-3xl p-5">
                        <p className="text-sm text-app-text-secondary">No reports are available yet.</p>
                      </Card>
                    )}
                  </div>
                </div>

                <Card className="overflow-hidden rounded-3xl p-0">
                  {selectedReport ? (
                    <>
                      <div className="border-b border-app-border p-7">
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h2 className="text-4xl font-semibold text-brand-blue">{selectedReport.type}</h2>
                            <p className="mt-3 text-lg text-app-text-secondary">
                              Ordered by {selectedReport.doctorName} • {selectedReport.fileName}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold tracking-[0.15em] text-emerald-700">
                            FINALIZED
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button className="gap-2 px-5 py-3" onClick={() => onDownloadReport(selectedReport.id)}>
                            <Download size={16} />
                            Download PDF
                          </Button>
                          <Button
                            className="gap-2 px-5 py-3"
                            onClick={() => onDeleteReport(selectedReport.id)}
                            variant="secondary"
                          >
                            <Trash2 size={16} />
                            Delete Report
                          </Button>
                          <Button
                            className="gap-2 px-5 py-3"
                            onClick={() => handleForwardToInsurance(selectedReport.id)}
                            variant="secondary"
                          >
                            <Share2 size={16} />
                            Forward To Insurance
                          </Button>
                        </div>
                        <div className="rounded-3xl border border-app-border bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-brand-blue">Insurance Forwarding</p>
                          <input
                            className="mt-3 w-full rounded-2xl border border-app-border bg-white px-4 py-3 outline-none transition focus:border-brand-blue"
                            onChange={(event) => setPolicyNumber(event.target.value)}
                            placeholder="Enter your insurance policy number"
                            value={policyNumber}
                          />
                          {shareError ? <p className="mt-2 text-sm text-status-error">{shareError}</p> : null}
                          <p className="mt-3 text-sm text-app-text-secondary">
                            Only the original hospital-issued report is forwarded. Patients cannot change or tamper
                            with report contents.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-8 p-7">
                        <div>
                          <div className="mb-4 flex items-center gap-3">
                            <ClipboardCheck className="text-brand-blue" size={22} />
                            <h3 className="text-2xl font-semibold text-app-text">Clinical Findings</h3>
                          </div>

                          {reportHighlights.length ? (
                            <div className="space-y-3">
                              {reportHighlights.map((item, index) => (
                                <div
                                  className="grid gap-2 border-b border-app-border py-3 text-sm md:grid-cols-[1.2fr_0.8fr]"
                                  key={`${item}-${index}`}
                                >
                                  <span className="font-medium text-app-text">{item}</span>
                                  <span className="text-app-text-secondary">
                                    {index === 0 ? "Within expected range" : index === 1 ? "Needs review" : "Stable"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="leading-copy text-app-text-secondary">{selectedReport.findings}</p>
                          )}

                          <p className="mt-4 text-sm italic text-app-text-secondary">
                            {selectedReport.findings || "No detailed findings were provided for this report."}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Sparkles className="text-amber-700" size={20} />
                              <h4 className="text-2xl font-semibold text-amber-700">MedSync AI Insights</h4>
                            </div>
                            <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-amber-900">
                              EXPERIMENTAL
                            </span>
                          </div>

                          <p className="leading-copy text-amber-950">
                            {selectedReport.aiSummary || "No AI summary has been generated yet."}
                          </p>

                          <button
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition-colors hover:text-amber-900"
                            onClick={() => onGenerateSummary(selectedReport.id)}
                            type="button"
                          >
                            <Sparkles size={16} />
                            Generate deeper AI analysis
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t border-app-border bg-slate-50 p-7">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-blue shadow-sm">
                          {selectedReport.doctorName
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-app-text">Report verified</p>
                          <p className="text-sm text-app-text-secondary">Uploaded by {selectedReport.doctorName}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-7">
                      <p className="text-sm text-app-text-secondary">Select a report to view details.</p>
                    </div>
                  )}
                </Card>
              </div>
            </section>
          </>
        ) : (
          <section className="pb-12 pt-8">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <nav className="mb-3 flex items-center gap-2 text-sm text-app-text-secondary">
                  <span>Patients</span>
                  <ChevronRight size={16} />
                  <span className="font-semibold text-brand-blue">Edit Profile</span>
                </nav>
                <h1 className="text-5xl font-bold tracking-tight-heading text-brand-blue">Patient Profile</h1>
              </div>

              <div className="flex items-center gap-4">
                <Button className="px-6 py-3" onClick={() => setProfileForm(defaultProfileForm)} variant="secondary">
                  Cancel
                </Button>
                <Button className="px-6 py-3" onClick={() => onSaveProfile(profileForm)} type="button">
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-4">
                <Card className="rounded-3xl p-8 text-center">
                  <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 bg-sky-50 text-4xl font-bold text-brand-blue">
                    {profileForm.fullName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("") || "?"}
                    <button
                      className="absolute bottom-1 right-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-white shadow-card"
                      type="button"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  <h2 className="text-4xl font-semibold text-app-text">{profileForm.fullName}</h2>
                  <p className="mt-2 text-lg text-app-text-secondary">
                    Patient ID: {patientProfile?.abhaNumber || "Not set"}
                  </p>

                  <div className="mt-8 space-y-3 text-left">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">STATUS</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-emerald-700">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">LAST VISIT</span>
                      <span className="text-lg text-app-text">{recentVisit}</span>
                    </div>
                  </div>
                </Card>

              </div>

              <div className="space-y-6 lg:col-span-8">
                <Card className="rounded-3xl p-8">
                  <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                    <div className="md:col-span-2 border-b border-app-border pb-4">
                      <h3 className="text-3xl font-semibold text-brand-blue">Personal Information</h3>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">FULL NAME</span>
                      <input
                        className="rounded-2xl border border-app-border px-4 py-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => updateProfileField("fullName", event.target.value)}
                        value={profileForm.fullName}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">
                        ABHA NUMBER (ID)
                      </span>
                      <input
                        className="rounded-2xl border border-app-border px-4 py-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => updateProfileField("abhaNumber", event.target.value)}
                        placeholder="0000 0000 0000 00"
                        value={profileForm.abhaNumber}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">AGE</span>
                      <input
                        className="rounded-2xl border border-app-border px-4 py-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => updateProfileField("age", event.target.value)}
                        value={profileForm.age}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">SEX</span>
                      <select
                        className="rounded-2xl border border-app-border px-4 py-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => updateProfileField("sex", event.target.value)}
                        value={profileForm.sex}
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">
                        BLOOD GROUP
                      </span>
                      <select
                        className="rounded-2xl border border-app-border px-4 py-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => updateProfileField("bloodGroup", event.target.value)}
                        value={profileForm.bloodGroup}
                      >
                        <option value="">Select blood group</option>
                        {bloodGroupOptions.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="md:col-span-2 border-b border-app-border pb-4 pt-6">
                      <h3 className="text-3xl font-semibold text-brand-blue">Contact Details</h3>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">
                        PHONE NUMBER
                      </span>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app-text-secondary"
                          size={18}
                        />
                        <input
                          className="w-full rounded-2xl border border-app-border py-4 pl-12 pr-4 outline-none transition focus:border-brand-blue"
                          onChange={(event) => updateProfileField("phone", event.target.value)}
                          value={profileForm.phone}
                        />
                      </div>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold tracking-[0.15em] text-app-text-secondary">
                        EMAIL ADDRESS
                      </span>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app-text-secondary"
                          size={18}
                        />
                        <input
                          className="w-full rounded-2xl border border-app-border py-4 pl-12 pr-4 outline-none transition focus:border-brand-blue"
                          onChange={(event) => updateProfileField("email", event.target.value)}
                          value={profileForm.email}
                        />
                      </div>
                    </label>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}
      </Container>

      {activeSection === "dashboard" ? (
        <button
          className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-card transition hover:scale-105"
          onClick={() => onSectionChange("profile")}
          type="button"
        >
          <Plus size={24} />
        </button>
      ) : (
        <div className="fixed bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand-blue via-sky-500 to-brand-blue-secondary opacity-50" />
      )}
    </main>
  );
}
