export type Role = "patient" | "hospital" | "insurance" | "path_lab" | "admin";
export type RouteName = "landing" | "auth" | "app";

export type User = {
  email: string;
  id: string;
  name: string;
  role: Role;
};

export type Report = {
  aiSummary: string;
  createdAt: string;
  doctorName: string;
  fileName: string;
  findings: string;
  id: string;
  sharedWith: string[];
  type: string;
};

export type PatientProfile = {
  abhaNumber: string;
  age: number;
  appointments: Array<{ date: string; department: string; id: string; status: string }>;
  bloodGroup: string;
  history: string[];
  id?: string;
  name: string;
  notifications: Array<{ createdAt: string; id: string; text: string }>;
  phone?: string;
  sex?: string;
};

export type HospitalPatient = {
  abhaNumber: string;
  id: string;
  latestReportCount: number;
  name: string;
};

export type HospitalPatientPreview = {
  patient: {
    abhaNumber: string;
    age: number;
    bloodGroup: string;
    history: string[];
    id: string;
    name: string;
    phone?: string;
    sex?: string;
  };
  reportSummary: {
    latestReportDate: string | null;
    recentReports: Array<{
      createdAt: string;
      doctorName: string;
      id: string;
      type: string;
    }>;
    totalReports: number;
  };
};

export type InsuranceRecord = {
  createdAt: string;
  doctorName: string;
  hospitalName: string;
  patientAbha: string;
  patientId: string;
  patientName: string;
  policyNumber: string;
  reportId: string;
  reportType: string;
  status: string;
};

export type ToastState = {
  message: string;
  title: string;
  variant: "error" | "info" | "success";
};
