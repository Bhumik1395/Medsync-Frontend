import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Info,
  Search,
  Upload,
  UploadCloud,
  User as UserIcon,
  Fingerprint,
  Stethoscope,
  ClipboardList,
  Clock3
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Toast } from "../components/ui/Toast";
import { TopNav } from "../components/ui/TopNav";
import type { HospitalPatient, HospitalPatientPreview, ToastState, User } from "../types/app";

type UploadFormState = {
  doctorName: string;
  fileName: string;
  findings: string;
  patientAbha: string;
  patientName: string;
  reportDateTime: string;
  type: string;
};

type HospitalPageProps = {
  hospitalPatients: HospitalPatient[];
  onLogout: () => void;
  onNavigateHome: () => void;
  onRequestPatientPreview: (name: string, abhaNumber: string) => Promise<HospitalPatientPreview>;
  onSubmitUpload: (event: React.FormEvent<HTMLFormElement>) => void;
  onUploadFormChange: (nextValue: UploadFormState) => void;
  pageLoading: boolean;
  toast: ToastState | null;
  uploadForm: UploadFormState;
  user: User;
};

export function HospitalPage({
  hospitalPatients,
  onLogout,
  onNavigateHome,
  onRequestPatientPreview,
  onSubmitUpload,
  onUploadFormChange,
  pageLoading,
  toast,
  uploadForm,
  user
}: HospitalPageProps) {
  const [activeSection, setActiveSection] = useState<"upload" | "history">("upload");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [patientPreview, setPatientPreview] = useState<HospitalPatientPreview | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const historyRows = useMemo(() => {
    const reportTypes = ["Radiology", "Blood Work", "Pathology", "Cardiology"];

    return hospitalPatients.map((patient, index) => ({
      date: new Date(Date.now() - index * 86400000).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      doctor: uploadForm.doctorName || user.name,
      id: patient.id,
      patientAbha: patient.abhaNumber,
      patientName: patient.name,
      reportType: reportTypes[index % reportTypes.length]
    }));
  }, [hospitalPatients, uploadForm.doctorName]);

  const filteredHistoryRows = historyRows.filter((row) => {
    const matchesSearch =
      !searchTerm ||
      `${row.patientAbha} ${row.patientName} ${row.doctor}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All Types" || row.reportType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalReports = hospitalPatients.reduce((sum, patient) => sum + patient.latestReportCount, 0);
  const verifiedPercent = filteredHistoryRows.length ? Math.min(100, 88 + filteredHistoryRows.length * 2) : 0;
  const pendingReview = Math.max(0, filteredHistoryRows.length - 1);

  function badgeClasses(reportType: string) {
    if (reportType === "Radiology") return "bg-blue-50 text-blue-700 border-blue-100";
    if (reportType === "Blood Work") return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100";
    if (reportType === "Pathology") return "bg-orange-50 text-orange-700 border-orange-100";
    return "bg-cyan-50 text-cyan-700 border-cyan-100";
  }

  useEffect(() => {
    const trimmedName = uploadForm.patientName.trim();
    const trimmedAbha = uploadForm.patientAbha.trim();

    if (!trimmedName || !trimmedAbha) {
      setPatientPreview(null);
      setPreviewError("");
      setPreviewLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");
        const payload = await onRequestPatientPreview(trimmedName, trimmedAbha);
        setPatientPreview(payload);
      } catch (error) {
        setPatientPreview(null);
        setPreviewError(error instanceof Error ? error.message : "Could not load patient preview.");
      } finally {
        setPreviewLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [onRequestPatientPreview, uploadForm.patientAbha, uploadForm.patientName]);

  return (
    <main className="min-h-screen bg-app-bg text-app-text">
      <TopNav
        navItems={[
          {
            id: "upload",
            isActive: activeSection === "upload",
            label: "Upload Report",
            onClick: () => setActiveSection("upload")
          },
          {
            id: "history",
            isActive: activeSection === "history",
            label: "History",
            onClick: () => setActiveSection("history")
          }
        ]}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        userLabel={`${user.name} - Hospital`}
      />
      <Container>
        {toast ? (
          <section className="pt-6">
            <Toast message={toast.message} title={toast.title} variant={toast.variant} />
          </section>
        ) : null}

        {activeSection === "upload" ? (
          <section className="pb-12 pt-10">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-bold tracking-tight-heading text-brand-blue">Upload Medical Report</h1>
              <p className="mt-3 text-base text-app-text-secondary">
                Digitize patient records securely in the MedSync infrastructure.
              </p>
              {pageLoading ? <p className="mt-4 text-sm text-app-text-secondary">Loading data...</p> : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="rounded-[28px] border-slate-100 p-8 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <form className="space-y-6" onSubmit={onSubmitUpload}>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                      Patient Name
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        className="w-full rounded-2xl border border-app-border py-3 pl-10 pr-4 outline-none transition focus:border-brand-blue"
                        onChange={(event) => onUploadFormChange({ ...uploadForm, patientName: event.target.value })}
                        placeholder="Enter full name"
                        value={uploadForm.patientName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Patient ABHA Number
                      </label>
                      <div className="relative">
                        <Fingerprint className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          className="w-full rounded-2xl border border-app-border py-3 pl-10 pr-4 outline-none transition focus:border-brand-blue"
                          onChange={(event) => onUploadFormChange({ ...uploadForm, patientAbha: event.target.value })}
                          placeholder="12-3456-7890-1234"
                          value={uploadForm.patientAbha}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Attending Doctor
                      </label>
                      <div className="relative">
                        <Stethoscope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          className="w-full rounded-2xl border border-app-border bg-slate-50 py-3 pl-10 pr-4 text-slate-600 outline-none"
                          onChange={(event) => onUploadFormChange({ ...uploadForm, doctorName: event.target.value })}
                          value={uploadForm.doctorName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Report Date & Time
                      </label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          className="w-full rounded-2xl border border-app-border py-3 pl-10 pr-4 outline-none transition focus:border-brand-blue"
                          onChange={(event) => onUploadFormChange({ ...uploadForm, reportDateTime: event.target.value })}
                          type="datetime-local"
                          value={uploadForm.reportDateTime}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Report Type
                      </label>
                      <div className="relative">
                        <FileText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          className="w-full appearance-none rounded-2xl border border-app-border bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-blue"
                          onChange={(event) => onUploadFormChange({ ...uploadForm, type: event.target.value })}
                          value={uploadForm.type}
                        >
                          <option value="CBC Report">Blood Work</option>
                          <option value="Radiology">Radiology</option>
                          <option value="Pathology">Pathology</option>
                          <option value="Cardiology">Cardiology</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                      Observations & Clinical Findings
                    </label>
                    <textarea
                      className="min-h-[140px] w-full rounded-2xl border border-app-border p-4 outline-none transition focus:border-brand-blue"
                      onChange={(event) => onUploadFormChange({ ...uploadForm, findings: event.target.value })}
                      placeholder="Enter detailed patient observations, symptoms, and initial diagnosis..."
                      value={uploadForm.findings}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                      Report Documents
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-app-border bg-slate-50 px-6 py-10 text-center transition hover:bg-slate-100">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
                        <UploadCloud className="text-brand-blue" size={28} />
                      </div>
                      <p className="font-semibold text-brand-blue">Click to upload or drag and drop</p>
                      <p className="mt-1 text-sm text-app-text-secondary">PDF, JPG, or PNG (Max 10MB)</p>
                      <input
                        className="hidden"
                        onChange={(event) =>
                          onUploadFormChange({
                            ...uploadForm,
                            fileName: event.target.files?.[0]?.name || uploadForm.fileName
                          })
                        }
                        type="file"
                      />
                    </label>
                    {uploadForm.fileName ? <p className="text-sm text-app-text-secondary">Selected: {uploadForm.fileName}</p> : null}
                  </div>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <Button className="flex-1 gap-2 py-4" type="submit">
                      <Upload size={18} />
                      Finalize & Sync Report
                    </Button>
                    <Button className="px-8 py-4" type="button" variant="secondary">
                      Save Draft
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="h-fit rounded-[28px] border-slate-100 p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <div className="flex items-center gap-2">
                  <Info className="text-brand-blue" size={18} />
                  <h3 className="text-2xl font-semibold text-brand-blue">Patient Preview</h3>
                </div>

                {!uploadForm.patientName.trim() || !uploadForm.patientAbha.trim() ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-app-border bg-slate-50 p-5 text-sm text-app-text-secondary">
                    Enter both patient name and ABHA number to load a live summary on the right.
                  </div>
                ) : previewLoading ? (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-sm text-app-text-secondary">
                    <Activity className="animate-pulse text-brand-blue" size={18} />
                    Loading patient preview...
                  </div>
                ) : previewError ? (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                    {previewError}
                  </div>
                ) : patientPreview ? (
                  <div className="mt-6 space-y-5">
                    <div className="rounded-3xl bg-brand-blue p-5 text-white">
                      <p className="text-3xl font-semibold text-white">{patientPreview.patient.name}</p>
                      <p className="mt-2 text-sm text-sky-100">ABHA {patientPreview.patient.abhaNumber}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">Age</p>
                        <p className="mt-2 text-xl font-semibold text-app-text">{patientPreview.patient.age || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">Blood Group</p>
                        <p className="mt-2 text-xl font-semibold text-app-text">{patientPreview.patient.bloodGroup || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">Sex</p>
                        <p className="mt-2 text-xl font-semibold text-app-text">{patientPreview.patient.sex || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">Phone</p>
                        <p className="mt-2 text-base font-semibold text-app-text">{patientPreview.patient.phone || "-"}</p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-brand-blue">Past Records Summary</h4>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-app-text-secondary">
                          {patientPreview.reportSummary.totalReports} reports
                        </span>
                      </div>

                      {patientPreview.reportSummary.recentReports.length ? (
                        <div className="space-y-3">
                          {patientPreview.reportSummary.recentReports.map((report) => (
                            <div className="rounded-2xl border border-app-border p-4" key={report.id}>
                              <p className="font-semibold text-app-text">{report.type}</p>
                              <p className="mt-1 text-sm text-app-text-secondary">
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}{" "}
                                • {report.doctorName}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-app-text-secondary">
                          No previous reports found for this patient yet.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-brand-blue">Clinical Notes</h4>
                      {patientPreview.patient.history.length ? (
                        <div className="space-y-2">
                          {patientPreview.patient.history.slice(0, 3).map((item) => (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-app-text-secondary" key={item}>
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-app-text-secondary">
                          No prior clinical history recorded.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          </section>
        ) : (
          <section className="pb-12 pt-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-5xl font-bold tracking-tight-heading text-brand-blue">Report History</h1>
                <p className="mt-2 text-base text-app-text-secondary">
                  Review and manage clinical diagnostic reports for your patients.
                </p>
              </div>
              <Button className="gap-2 self-start px-6 py-3" onClick={() => setActiveSection("upload")}>
                <Upload size={16} />
                Upload New Report
              </Button>
            </div>

            <Card className="mb-6 rounded-2xl border-app-border/30 p-6">
              <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                    Search Records
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      className="w-full rounded-xl border border-app-border bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-brand-blue"
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by Patient ABHA, Name or Doctor..."
                      value={searchTerm}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                    Report Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-app-border bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-blue"
                    onChange={(event) => setTypeFilter(event.target.value)}
                    value={typeFilter}
                  >
                    <option>All Types</option>
                    <option>Radiology</option>
                    <option>Blood Work</option>
                    <option>Pathology</option>
                    <option>Cardiology</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                    Date Range
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      className="w-full rounded-xl border border-app-border bg-slate-50 py-3 pl-10 pr-4 outline-none"
                      readOnly
                      value="Last 30 Days"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-app-border/30 p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-app-border">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Patient ABHA
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Doctor
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Report Type
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-app-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryRows.length ? (
                      filteredHistoryRows.map((row, index) => (
                        <tr className="border-b border-app-border/60 hover:bg-slate-50/60" key={row.id}>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-brand-blue">{row.patientAbha}</span>
                              <span className="text-xs text-app-text-secondary">{row.patientName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-app-text">{row.doctor}</td>
                          <td className="px-6 py-5 text-sm text-app-text">{row.date}</td>
                          <td className="px-6 py-5">
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeClasses(row.reportType)}`}>
                              {row.reportType}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button className="rounded-lg p-2 text-brand-blue transition-colors hover:bg-slate-100" type="button">
                                <Eye size={18} />
                              </button>
                              <button
                                className={`rounded-lg p-2 transition-colors ${
                                  index === 2 ? "cursor-not-allowed text-slate-300" : "text-brand-blue hover:bg-slate-100"
                                }`}
                                disabled={index === 2}
                                type="button"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-8 text-sm text-app-text-secondary" colSpan={5}>
                          No history records match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-app-border bg-slate-50/60 px-6 py-5">
                <p className="text-sm text-app-text-secondary">
                  Showing 1 to {filteredHistoryRows.length} of {historyRows.length} reports
                </p>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text-secondary" disabled type="button">
                    ‹
                  </button>
                  <button className="h-10 w-10 rounded-lg bg-brand-blue text-sm font-bold text-white" type="button">
                    1
                  </button>
                  <button className="h-10 w-10 rounded-lg border border-app-border bg-white text-sm font-bold text-app-text" type="button">
                    2
                  </button>
                  <button className="h-10 w-10 rounded-lg border border-app-border bg-white text-sm font-bold text-app-text" type="button">
                    3
                  </button>
                  <button className="rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text" type="button">
                    ›
                  </button>
                </div>
              </div>
            </Card>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card className="flex items-center gap-4 rounded-2xl border-app-border/30 p-6 shadow-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/5 text-brand-blue">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-brand-blue">{totalReports}</h4>
                  <p className="text-sm text-app-text-secondary">Total Reports This Month</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 rounded-2xl border-app-border/30 p-6 shadow-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-brand-blue">{verifiedPercent}%</h4>
                  <p className="text-sm text-app-text-secondary">Verified Documents</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 rounded-2xl border-app-border/30 p-6 shadow-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Clock3 size={22} />
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-brand-blue">{pendingReview}</h4>
                  <p className="text-sm text-app-text-secondary">Pending Review</p>
                </div>
              </Card>
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
