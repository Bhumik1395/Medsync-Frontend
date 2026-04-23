import { useMemo, useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Hospital,
  Search,
  ShieldCheck,
  Users,
  X
} from "lucide-react";
import type { InsuranceRecord, ToastState, User } from "../types/app";

type InsurancePageProps = {
  insuranceRecords: InsuranceRecord[];
  onLogout: () => void;
  onNavigateHome: () => void;
  pageLoading: boolean;
  toast: ToastState | null;
  user: User;
};

type InsuranceView = "dashboard" | "reports";
type WorkflowStatus = "Approved" | "Rejected" | "Pending" | "Up for Review";

type InsuranceRow = {
  createdAt: string;
  dateLabel: string;
  hospitalName: string;
  id: string;
  initials: string;
  patientId: string;
  patientName: string;
  policyNumber: string;
  reportType: string;
  status: WorkflowStatus;
};

const statusCycle: WorkflowStatus[] = ["Up for Review", "Pending", "Approved", "Rejected"];
const chartSeries: Array<{ color: string; key: "approved" | "pending" | "received" | "rejected" | "review"; label: string }> = [
  { color: "bg-white", key: "received", label: "Received" },
  { color: "bg-emerald-300", key: "approved", label: "Approved" },
  { color: "bg-rose-300", key: "rejected", label: "Rejected" },
  { color: "bg-slate-300", key: "pending", label: "Pending" },
  { color: "bg-sky-300", key: "review", label: "Up for Review" }
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Awaiting date";
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function normalizeStatus(status: string, fallbackIndex: number): WorkflowStatus {
  const normalized = status.toLowerCase();

  if (normalized.includes("approve") || normalized.includes("process")) {
    return "Approved";
  }

  if (normalized.includes("reject")) {
    return "Rejected";
  }

  if (normalized.includes("review")) {
    return "Up for Review";
  }

  if (normalized.includes("pending") || normalized.includes("receive")) {
    return "Pending";
  }

  return statusCycle[fallbackIndex % statusCycle.length];
}

function getStatusBadgeClasses(status: WorkflowStatus) {
  if (status === "Approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Rejected") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "Up for Review") {
    return "bg-[#ffdcc2] text-[#683c10]";
  }

  return "bg-[#cbe6ff] text-[#004b72]";
}

function getInitialBadgeClasses(index: number) {
  const tones = [
    "bg-[#cae6ff] text-[#184b6a]",
    "bg-[#ffdcc2] text-[#683c10]",
    "bg-[#cbe6ff] text-[#004b72]",
    "bg-[#9eccf1] text-[#001e30]"
  ];

  return tones[index % tones.length];
}

function escapeCsv(value: string | number) {
  const stringValue = String(value);

  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

function getMonthBucket(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return {
      label: "Unknown",
      sortKey: "9999-99"
    };
  }

  return {
    label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  };
}

export function InsurancePage({
  insuranceRecords,
  onLogout,
  onNavigateHome,
  pageLoading,
  toast,
  user
}: InsurancePageProps) {
  const [activeView, setActiveView] = useState<InsuranceView>("dashboard");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, WorkflowStatus>>({});
  const [selectedHospital, setSelectedHospital] = useState("All Hospitals");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedStatus, setSelectedStatus] = useState<"All Statuses" | WorkflowStatus>("All Statuses");

  const rows = useMemo<InsuranceRow[]>(() => {
    return insuranceRecords.map((record, index) => {
      const resolvedStatus = statusOverrides[record.reportId] || normalizeStatus(record.status, index);

      return {
        createdAt: record.createdAt,
        dateLabel: formatDate(record.createdAt),
        hospitalName: record.hospitalName,
        id: record.reportId,
        initials: getInitials(record.patientName),
        patientId: record.patientAbha || record.patientId,
        patientName: record.patientName,
        policyNumber: record.policyNumber,
        reportType: record.reportType,
        status: resolvedStatus
      };
    });
  }, [insuranceRecords, statusOverrides]);

  const availableHospitals = useMemo(
    () => ["All Hospitals", ...Array.from(new Set(rows.map((row) => row.hospitalName))).filter(Boolean)],
    [rows]
  );

  const availableMonths = useMemo(() => {
    const monthLabels = rows.map((row) => getMonthBucket(row.createdAt).label).filter(Boolean);

    return ["All Months", ...Array.from(new Set(monthLabels))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        `${row.patientName} ${row.patientId} ${row.hospitalName} ${row.reportType} ${row.policyNumber}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesHospital = selectedHospital === "All Hospitals" || row.hospitalName === selectedHospital;
      const matchesStatus = selectedStatus === "All Statuses" || row.status === selectedStatus;
      const rowMonth = getMonthBucket(row.createdAt).label;
      const matchesMonth = selectedMonth === "All Months" || rowMonth === selectedMonth;

      return matchesSearch && matchesHospital && matchesStatus && matchesMonth;
    });
  }, [rows, searchTerm, selectedHospital, selectedMonth, selectedStatus]);

  const totalReceived = rows.length;
  const filteredTotalReceived = filteredRows.length;
  const uniquePatients = new Set(filteredRows.map((row) => row.patientId)).size;
  const hospitalsCovered = new Set(filteredRows.map((row) => row.hospitalName)).size;
  const awaitingReview = filteredRows.filter((row) => row.status === "Up for Review").length;
  const pendingInfo = filteredRows.filter((row) => row.status === "Pending").length;
  const escalated = filteredRows.filter((row) => row.status === "Rejected").length;
  const approvedCount = filteredRows.filter((row) => row.status === "Approved").length;
  const dashboardGrowth = filteredTotalReceived ? "+12.5%" : "0%";
  const patientGrowth = uniquePatients ? "+4.2%" : "0%";
  const coverageSummary = filteredTotalReceived
    ? "Monthly intake now tracks received, approved, rejected, pending, and review-stage reports in one place."
    : "Forwarded insurance reports will appear here once patients begin sharing hospital-issued records.";
  const userDisplayName = user.name || "Insurance Desk";

  const monthlyChart = useMemo(() => {
    const grouped = new Map<
      string,
      { approved: number; label: string; pending: number; received: number; rejected: number; review: number }
    >();

    filteredRows.forEach((row) => {
      const monthBucket = getMonthBucket(row.createdAt);
      const current = grouped.get(monthBucket.sortKey) || {
        approved: 0,
        label: monthBucket.label.toUpperCase(),
        pending: 0,
        received: 0,
        rejected: 0,
        review: 0
      };

      current.received += 1;

      if (row.status === "Approved") {
        current.approved += 1;
      } else if (row.status === "Rejected") {
        current.rejected += 1;
      } else if (row.status === "Pending") {
        current.pending += 1;
      } else {
        current.review += 1;
      }

      grouped.set(monthBucket.sortKey, current);
    });

    return Array.from(grouped.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([, counts]) => ({
        counts,
        label: counts.label
      }));
  }, [filteredRows]);

  const chartMaxValue = useMemo(() => {
    if (!monthlyChart.length) {
      return 1;
    }

    return Math.max(
      ...monthlyChart.flatMap((month) => [
        month.counts.received,
        month.counts.approved,
        month.counts.rejected,
        month.counts.pending,
        month.counts.review
      ]),
      1
    );
  }, [monthlyChart]);

  function updateReportStatus(reportId: string, nextStatus: WorkflowStatus) {
    setStatusOverrides((current) => ({
      ...current,
      [reportId]: nextStatus
    }));
  }

  function resetFilters() {
    setSelectedHospital("All Hospitals");
    setSelectedMonth("All Months");
    setSelectedStatus("All Statuses");
  }

  function handleExportCsv() {
    const header = [
      "Patient Name",
      "Patient ID",
      "Hospital Origin",
      "Report Type",
      "Received Date",
      "Policy Number",
      "Status"
    ];
    const lines = [
      header.join(","),
      ...filteredRows.map((row) =>
        [
          row.patientName,
          row.patientId,
          row.hospitalName,
          row.reportType,
          row.dateLabel,
          row.policyNumber,
          row.status
        ]
          .map(escapeCsv)
          .join(",")
      )
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medsync-insurance-reports.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f9f9fc] font-['Inter',sans-serif] text-[#1a1c1e]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <button
              className="text-xl font-bold tracking-tight text-blue-900"
              onClick={onNavigateHome}
              type="button"
            >
              MedSync
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              <button
                className={`h-16 border-b-2 pb-1 text-sm font-medium transition-colors ${activeView === "dashboard"
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-slate-500 hover:text-blue-700"
                  }`}
                onClick={() => setActiveView("dashboard")}
                type="button"
              >
                Dashboard
              </button>
              <button
                className={`h-16 border-b-2 pb-1 text-sm font-medium transition-colors ${activeView === "reports"
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-slate-500 hover:text-blue-700"
                  }`}
                onClick={() => setActiveView("reports")}
                type="button"
              >
                Reports
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <label className="hidden items-center gap-3 rounded-xl border border-slate-300 bg-[#edeef1] px-4 py-3 md:flex">
              <Search className="text-slate-500" size={18} />
              <input
                className="w-52 border-none bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-500"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search claims..."
                value={searchTerm}
              />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-[#00263c]">
                <ShieldCheck size={18} />
              </div>
              <span className="hidden text-sm text-[#1a1c1e] lg:block">{userDisplayName}</span>
            </div>

            <button
              className="text-sm font-medium text-[#ba1a1a] transition-opacity hover:underline"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-10">
        {activeView === "dashboard" ? (
          <>
            <section className="mb-10">
              <h1 className="font-['Poppins',sans-serif] text-[32px] font-semibold leading-[1.2] text-[#00263c]">
                Operations Dashboard
              </h1>
              <p className="mt-2 text-[18px] leading-[1.6] text-[#41474d]">
                Real-time overview of forwarded reports and clinical coordination status.
              </p>
              {pageLoading ? <p className="mt-3 text-sm text-slate-500">Loading insurance records...</p> : null}
              {toast ? <p className="mt-3 text-sm text-[#41474d]">{toast.title}: {toast.message}</p> : null}
            </section>

            <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border-l-4 border-[#1e638f] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-[#91cdfe] p-3 text-[#065782]">
                    <FileText size={22} />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[12px] font-bold text-emerald-700">
                    {dashboardGrowth}
                  </span>
                </div>
                <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                  Forwarded Reports
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {filteredTotalReceived}
                </div>
              </div>

              <div className="rounded-xl border-l-4 border-[#00263c] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-[#003d5c] p-3 text-white">
                    <Users size={22} />
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[12px] font-bold text-blue-700">
                    {patientGrowth}
                  </span>
                </div>
                <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                  Covered Patients
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {uniquePatients}
                </div>
              </div>

              <div className="rounded-xl border-l-4 border-[#582f03] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-[#ffdcc2] p-3 text-[#683c10]">
                    <Hospital size={22} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[12px] font-bold text-slate-700">
                    Stable
                  </span>
                </div>
                <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                  Hospitals Involved
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {hospitalsCovered}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl bg-white shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
              <div className="flex flex-col justify-between gap-4 border-b border-[#edeef1] px-6 py-6 md:flex-row md:items-center">
                <h2 className="font-['Poppins',sans-serif] text-[20px] font-medium text-[#00263c]">
                  Received Patient Forwarded Reports
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-[#edeef1] px-4 py-2 text-sm font-semibold text-[#1a1c1e] transition-colors hover:bg-[#e2e2e5]"
                    onClick={() => setFilterPanelOpen((current) => !current)}
                    type="button"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00263c] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    onClick={handleExportCsv}
                    type="button"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                </div>
              </div>

              {filterPanelOpen ? (
                <div className="grid gap-4 border-b border-[#edeef1] bg-[#f9f9fc] px-6 py-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                  <label className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                      Hospital
                    </span>
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      onChange={(event) => setSelectedHospital(event.target.value)}
                      value={selectedHospital}
                    >
                      {availableHospitals.map((hospitalName) => (
                        <option key={hospitalName} value={hospitalName}>
                          {hospitalName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                      Month
                    </span>
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      onChange={(event) => setSelectedMonth(event.target.value)}
                      value={selectedMonth}
                    >
                      {availableMonths.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                      Status
                    </span>
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      onChange={(event) =>
                        setSelectedStatus(event.target.value as "All Statuses" | WorkflowStatus)
                      }
                      value={selectedStatus}
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                      <option value="Up for Review">Up for Review</option>
                    </select>
                  </label>

                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-[#41474d] transition-colors hover:bg-white"
                      onClick={resetFilters}
                      type="button"
                    >
                      Reset
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-[#41474d] transition-colors hover:bg-white"
                      onClick={() => setFilterPanelOpen(false)}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-[#f3f3f6]">
                    <tr>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Patient Name
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Hospital Origin
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Report Type
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Received Date
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeef1]">
                    {filteredRows.length ? (
                      filteredRows.map((row, index) => (
                        <tr className="transition-colors hover:bg-[#f9f9fc]" key={row.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getInitialBadgeClasses(index)}`}
                              >
                                {row.initials}
                              </div>
                              <span className="text-[16px] font-medium text-[#1a1c1e]">{row.patientName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#41474d]">{row.hospitalName}</td>
                          <td className="px-6 py-4 text-sm text-[#41474d]">{row.reportType}</td>
                          <td className="px-6 py-4 text-sm text-[#41474d]">{row.dateLabel}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.05em] ${getStatusBadgeClasses(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="rounded-full p-2 text-[#1e638f] transition-colors hover:bg-[#cbe6ff]"
                              onClick={() => setActiveView("reports")}
                              type="button"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-10 text-sm text-[#41474d]" colSpan={6}>
                          No forwarded reports match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#edeef1] px-6 py-4">
                <span className="text-sm text-[#41474d]">
                  Showing 1 to {filteredRows.length} of {totalReceived} reports
                </span>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-slate-300 p-2 text-slate-500" disabled type="button">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="rounded-lg bg-[#00263c] px-4 py-2 text-sm font-semibold text-white" type="button">
                    1
                  </button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-[#1a1c1e]" type="button">
                    2
                  </button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-[#1a1c1e]" type="button">
                    3
                  </button>
                  <button className="rounded-lg border border-slate-300 p-2 text-slate-500" type="button">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-12 overflow-hidden rounded-xl bg-[#00263c] p-8 text-white shadow-xl">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-4">
                  <h3 className="font-['Poppins',sans-serif] text-[20px] font-medium">Patient Coverage Insights</h3>
                  <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-white/80">{coverageSummary}</p>

                  <div className="mt-6 space-y-3">
                    {chartSeries.map((item) => (
                      <div className="flex items-center gap-3" key={item.key}>
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-white/90">{item.label}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-sm text-white/80">
                      Approved now: {approvedCount} of {filteredTotalReceived} filtered reports
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="relative h-80">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          className={`border-b ${index === 4 ? "border-white/20" : "border-white/10"}`}
                          key={index}
                        />
                      ))}
                    </div>

                    <div className="relative flex h-full items-end justify-around gap-6 px-4 pb-8">
                      {monthlyChart.length ? (
                        monthlyChart.map((month) => (
                          <div className="flex min-w-[110px] flex-1 flex-col items-center" key={month.label}>
                            <div className="flex h-full items-end gap-2">
                              {chartSeries.map((series) => {
                                const value = month.counts[series.key];
                                const height = `${Math.max(8, Math.round((value / chartMaxValue) * 100))}%`;

                                return (
                                  <div className="flex flex-col items-center" key={series.key}>
                                    <div className="mb-2 text-[10px] text-white/75">{value}</div>
                                    <div className={`w-4 rounded-t-md ${series.color}`} style={{ height }} />
                                  </div>
                                );
                              })}
                            </div>
                            <span className="mt-4 text-[12px] font-semibold tracking-[0.2em] text-white">
                              {month.label}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                          No chart data available for the current filters.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-12 border-t border-[#edeef1] py-12">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#00263c]">MedSync</span>
                  <span className="text-sm text-[#41474d]">
                    © 2023 MedSync Insurance Services. All rights reserved.
                  </span>
                </div>
                <div className="flex gap-8">
                  <a className="text-sm text-[#41474d] transition-colors hover:text-[#00263c]" href="#">
                    Security Policy
                  </a>
                  <a className="text-sm text-[#41474d] transition-colors hover:text-[#00263c]" href="#">
                    Support Center
                  </a>
                  <a className="text-sm text-[#41474d] transition-colors hover:text-[#00263c]" href="#">
                    Hospital Network
                  </a>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <>
            <section className="mb-8">
              <h1 className="font-['Poppins',sans-serif] text-[32px] font-semibold leading-[1.2] text-[#00263c]">
                Patient Medical Reports
              </h1>
              <p className="mt-2 text-[16px] text-[#41474d]">
                Review and process incoming medical documentation from policy holders.
              </p>
            </section>

            <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-[#e2e2e5] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#1e638f]">
                  Total Reports
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {totalReceived}
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e2e5] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#582f03]">
                  Awaiting Review
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {awaitingReview}
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e2e5] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#065782]">
                  Pending Info
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {pendingInfo}
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e2e5] bg-white p-6 shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.05em] text-[#ba1a1a]">
                  Escalated
                </span>
                <div className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  {String(escalated).padStart(2, "0")}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#e2e2e5] bg-white shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#e2e2e5] bg-[#f3f3f6]">
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Patient Name
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Report Type
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Date Received
                      </th>
                      <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-[#41474d]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e2e5]">
                    {filteredRows.length ? (
                      filteredRows.map((row, index) => (
                        <tr className="transition-colors hover:bg-[#f3f3f6]" key={row.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${getInitialBadgeClasses(index)}`}
                              >
                                {row.initials}
                              </div>
                              <div>
                                <div className="text-[16px] font-medium text-[#1a1c1e]">{row.patientName}</div>
                                <div className="text-sm text-[#41474d]">ID: {row.patientId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[16px] text-[#1a1c1e]">{row.reportType}</td>
                          <td className="px-6 py-4 text-sm text-[#41474d]">{row.dateLabel}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[12px] font-semibold ${getStatusBadgeClasses(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="rounded bg-[#00263c] px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                onClick={() => updateReportStatus(row.id, "Approved")}
                                type="button"
                              >
                                Approve
                              </button>
                              <button
                                className="rounded border border-[#ba1a1a] px-3 py-1.5 text-sm font-semibold text-[#ba1a1a] transition-colors hover:bg-[#ffdad6]"
                                onClick={() => updateReportStatus(row.id, "Rejected")}
                                type="button"
                              >
                                Reject
                              </button>
                              <button
                                className="rounded border border-[#72787e] px-3 py-1.5 text-sm font-semibold text-[#41474d] transition-colors hover:bg-[#e2e2e5]"
                                onClick={() => updateReportStatus(row.id, "Pending")}
                                type="button"
                              >
                                Pending
                              </button>
                              <button
                                className="rounded bg-[#582f03] px-3 py-1.5 text-sm font-semibold text-[#ffdcc2] transition-opacity hover:opacity-90"
                                onClick={() => updateReportStatus(row.id, "Up for Review")}
                                type="button"
                              >
                                Up for Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-10 text-sm text-[#41474d]" colSpan={5}>
                          No reports match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#e2e2e5] bg-[#f3f3f6] px-6 py-4">
                <span className="text-sm text-[#41474d]">
                  Showing 1 to {filteredRows.length} of {totalReceived} reports
                </span>
                <div className="flex gap-2">
                  <button className="rounded p-2 text-[#41474d] transition-colors hover:bg-[#e2e2e5]" type="button">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="rounded p-2 text-[#41474d] transition-colors hover:bg-[#e2e2e5]" type="button">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </section>

            {!filteredRows.length && !pageLoading ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-[#c1c7ce] bg-white px-6 py-5 text-sm text-[#41474d]">
                <Activity size={18} className="text-[#1e638f]" />
                Patient-forwarded reports will appear here once claims intake begins.
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
