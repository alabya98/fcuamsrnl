import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReportService from "../../../services/ReportService";
import GameReports from "../../../pages/Reports/Components/GameReports";
import PracticeScheduleReports from "../../../pages/Reports/Components/PracticeScheduleReports";
import PrintPreviewModal from "../../../pages/Reports/Components/PrintPreviewModal";
import PrintableDemographicsReport from "../../../pages/Reports/Components/PrintableDemographicsReport";
import PrintableAttendanceReport from "../../../pages/Reports/Components/PrintableAttendanceReport";
import PrintableEventReport from "../../../pages/Reports/Components/PrintableEventReport";
import PrintableGameReport from "../../../pages/Reports/Components/PrintableGameReport";
import PrintablePracticeReport from "../../../pages/Reports/Components/PrintablePracticeReport";
import ReportsPDFButton, {
  type ReportsPDFButtonProps,
} from "../../../components/button/ReportsPDFButton";
import type {
  AthleteDemographicsReport,
  AttendanceAnalyticsReport,
  EventParticipationReport,
  ReportFilters,
} from "../../../interfaces/ReportInterface";
import type { GameReportData } from "../../../interfaces/GameReportInterface";
import type { PracticeReportData } from "../../../interfaces/PracticeReportInterface";

const ReportsMainPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "demographics" | "attendance" | "events" | "games" | "practices"
  >("demographics");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const pdfButtonRef = useRef<{ triggerDownload: () => Promise<void> }>(null);

  const [filters, setFilters] = useState<ReportFilters>({
    start_date: "",
    end_date: "",
    sport: "",
  });
  const [gameFilters, setGameFilters] = useState({ venue: "", team: "" });
  const [practiceFilters, setPracticeFilters] = useState({
    coach_id: "",
    venue: "",
  });

  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<any[]>([]);

  const [demographicsReport, setDemographicsReport] =
    useState<AthleteDemographicsReport | null>(null);
  const [attendanceAnalytics, setAttendanceAnalytics] =
    useState<AttendanceAnalyticsReport | null>(null);
  const [eventParticipation, setEventParticipation] =
    useState<EventParticipationReport | null>(null);
  const [gameReport, setGameReport] = useState<GameReportData | null>(null);
  const [practiceReport, setPracticeReport] =
    useState<PracticeReportData | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: "success" | "error" | "info") =>
    setToast({ show: true, message, type });

  const loadAvailableOptions = async () => {
    try {
      const sportsRes = await ReportService.getAvailableSports();
      if (sportsRes.status === 200) setAvailableSports(sportsRes.data.sports);
      const coachesRes = await ReportService.getAvailableCoaches();
      if (coachesRes.status === 200)
        setAvailableCoaches(coachesRes.data.coaches);
    } catch (error) {
      console.error("Error loading options:", error);
      showToast("Failed to load filter options", "error");
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      if (activeTab === "demographics") {
        const res = await ReportService.getAthleteDemographicsReport(filters);
        if (res.status === 200) {
          setDemographicsReport(res.data);
          showToast("Demographics report generated successfully", "success");
        }
      } else if (activeTab === "attendance") {
        const res = await ReportService.getAttendanceAnalyticsReport(filters);
        if (res.status === 200) {
          setAttendanceAnalytics(res.data);
          showToast("Attendance report generated successfully", "success");
        }
      } else if (activeTab === "events") {
        const res = await ReportService.getEventParticipationReport(filters);
        if (res.status === 200) {
          setEventParticipation(res.data);
          showToast(
            "Event participation report generated successfully",
            "success",
          );
        }
      } else if (activeTab === "games") {
        const res = await ReportService.getGameReport({
          ...filters,
          ...gameFilters,
        });
        if (res.status === 200) {
          setGameReport(res.data);
          showToast("Game report generated successfully", "success");
        }
      } else if (activeTab === "practices") {
        const res = await ReportService.getPracticeReport({
          ...filters,
          ...practiceFilters,
        });
        if (res.status === 200) {
          setPracticeReport(res.data);
          showToast("Practice report generated successfully", "success");
        }
      }
    } catch (error) {
      console.error("Error loading report:", error);
      showToast("Failed to generate report. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ start_date: "", end_date: "", sport: "" });
    setGameFilters({ venue: "", team: "" });
    setPracticeFilters({ coach_id: "", venue: "" });
    showToast("Filters cleared", "info");
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.sport) params.append("sport", filters.sport);

      let response;
      if (activeTab === "demographics") {
        if (!demographicsReport) {
          showToast("Please generate a report first before exporting", "error");
          return;
        }
        response = await ReportService.exportReportExcel(
          "athlete-demographics",
          params.toString(),
        );
      } else if (activeTab === "attendance") {
        if (!attendanceAnalytics) {
          showToast("Please generate a report first before exporting", "error");
          return;
        }
        response = await ReportService.exportReportExcel(
          "attendance-analytics",
          params.toString(),
        );
      } else if (activeTab === "events") {
        if (!eventParticipation) {
          showToast("Please generate a report first before exporting", "error");
          return;
        }
        response = await ReportService.exportReportExcel(
          "event-participation",
          params.toString(),
        );
      } else if (activeTab === "games") {
        if (!gameReport) {
          showToast("Please generate a report first before exporting", "error");
          return;
        }
        if (gameFilters.venue) params.append("venue", gameFilters.venue);
        if (gameFilters.team) params.append("team", gameFilters.team);
        response = await ReportService.exportGameReportExcel(params.toString());
      } else if (activeTab === "practices") {
        if (!practiceReport) {
          showToast("Please generate a report first before exporting", "error");
          return;
        }
        if (practiceFilters.coach_id)
          params.append("coach_id", practiceFilters.coach_id);
        if (practiceFilters.venue)
          params.append("venue", practiceFilters.venue);
        response = await ReportService.exportPracticeReportExcel(
          params.toString(),
        );
      }

      if (response) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeTab}-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("Excel file exported successfully!", "success");
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
      showToast("Failed to export Excel. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const toggleEventExpand = (eventId: number) =>
    setExpandedEventId(expandedEventId === eventId ? null : eventId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const hasReportData = () => {
    if (activeTab === "demographics") return !!demographicsReport;
    if (activeTab === "attendance") return !!attendanceAnalytics;
    if (activeTab === "events") return !!eventParticipation;
    if (activeTab === "games") return !!gameReport;
    if (activeTab === "practices") return !!practiceReport;
    return false;
  };

  const handleConfirmDownload = async () => {
    await pdfButtonRef.current?.triggerDownload();
    setShowPreview(false);
    showToast("PDF downloaded successfully", "success");
  };

  const renderPreviewContent = () => {
    if (activeTab === "demographics" && demographicsReport)
      return (
        <PrintableDemographicsReport
          data={demographicsReport}
          filters={filters}
        />
      );
    if (activeTab === "attendance" && attendanceAnalytics)
      return (
        <PrintableAttendanceReport
          data={attendanceAnalytics}
          filters={filters}
        />
      );
    if (activeTab === "events" && eventParticipation)
      return (
        <PrintableEventReport data={eventParticipation} filters={filters} />
      );
    if (activeTab === "games" && gameReport)
      return (
        <PrintableGameReport
          data={gameReport}
          filters={{ ...filters, ...gameFilters }}
        />
      );
    if (activeTab === "practices" && practiceReport)
      return (
        <PrintablePracticeReport
          data={practiceReport}
          filters={{ ...filters, ...practiceFilters }}
        />
      );
    return null;
  };

  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
            >
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-2"></div>
              <div className="h-10 bg-gray-300 dark:bg-white/15 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  const pdfButtonProps: ReportsPDFButtonProps = {
    activeTab,
    demographicsReport,
    attendanceReport: attendanceAnalytics,
    eventReport: eventParticipation,
    gameReport,
    practiceReport,
    filters,
    disabled: loading || !hasReportData(),
  };

  // Shared input classes
  const inputClass =
    "w-full px-4 py-2 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300";
  const labelClass =
    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-500/20 border-green-500 text-green-800 dark:text-green-300"
                : toast.type === "error"
                  ? "bg-red-50 dark:bg-red-500/20 border-red-500 text-red-800 dark:text-red-300"
                  : "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300"
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {toast.type === "success"
                  ? "✓"
                  : toast.type === "error"
                    ? "✕"
                    : "ℹ"}
              </span>
              <p className="font-semibold">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-blue-100 text-base font-medium">
                Comprehensive insights into athlete demographics, performance
                and attendance
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
          <div className="flex flex-wrap gap-3">
            {(
              [
                "demographics",
                "attendance",
                "events",
                "games",
                "practices",
              ] as const
            ).map((tab) => {
              const labels: Record<string, string> = {
                demographics: "Athlete Demographics",
                attendance: "Attendance Analytics",
                events: "Event Participation",
                games: "Game Reports",
                practices: "Practice Schedules",
              };
              const colors: Record<string, string> = {
                demographics: "from-blue-600 to-blue-700",
                attendance: "from-green-600 to-green-700",
                events: "from-purple-600 to-purple-700",
                games: "from-red-600 to-red-700",
                practices: "from-teal-600 to-teal-700",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? `bg-gradient-to-r ${colors[tab]} text-white shadow-lg transform scale-105`
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Filters
            </h2>
            {hasReportData() && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 rounded-lg text-sm font-semibold">
                ✓ Report Generated
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab !== "demographics" && (
              <>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) =>
                      setFilters({ ...filters, start_date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) =>
                      setFilters({ ...filters, end_date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </>
            )}
            <div>
              <label className={labelClass}>Sport</label>
              <select
                value={filters.sport}
                onChange={(e) =>
                  setFilters({ ...filters, sport: e.target.value })
                }
                className={inputClass}
              >
                <option value="" className="dark:bg-[#1a1f2e]">
                  All Sports
                </option>
                {availableSports.map((sport) => (
                  <option
                    key={sport}
                    value={sport}
                    className="dark:bg-[#1a1f2e]"
                  >
                    {sport}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "games" && (
              <>
                <div>
                  <label className={labelClass}>Venue</label>
                  <input
                    type="text"
                    value={gameFilters.venue}
                    onChange={(e) =>
                      setGameFilters({ ...gameFilters, venue: e.target.value })
                    }
                    placeholder="Filter by venue"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Team</label>
                  <input
                    type="text"
                    value={gameFilters.team}
                    onChange={(e) =>
                      setGameFilters({ ...gameFilters, team: e.target.value })
                    }
                    placeholder="Filter by team"
                    className={inputClass}
                  />
                </div>
              </>
            )}
            {activeTab === "practices" && (
              <>
                <div>
                  <label className={labelClass}>Coach</label>
                  <select
                    value={practiceFilters.coach_id}
                    onChange={(e) =>
                      setPracticeFilters({
                        ...practiceFilters,
                        coach_id: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="" className="dark:bg-[#1a1f2e]">
                      All Coaches
                    </option>
                    {availableCoaches.map((coach) => (
                      <option
                        key={coach.coach_id}
                        value={coach.coach_id}
                        className="dark:bg-[#1a1f2e]"
                      >
                        {coach.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Venue</label>
                  <input
                    type="text"
                    value={practiceFilters.venue}
                    onChange={(e) =>
                      setPracticeFilters({
                        ...practiceFilters,
                        venue: e.target.value,
                      })
                    }
                    placeholder="Filter by venue"
                    className={inputClass}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            <button
              onClick={loadReport}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-white/15 transition-all duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowPreview(true)}
              disabled={loading || !hasReportData()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
            <div className="hidden">
              <ReportsPDFButton ref={pdfButtonRef} {...pdfButtonProps} />
            </div>
            <button
              onClick={handleExportExcel}
              disabled={exporting || !hasReportData()}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {activeTab === "games" && (
              <GameReports data={gameReport} loading={loading} />
            )}
            {activeTab === "practices" && (
              <PracticeScheduleReports
                data={practiceReport}
                loading={loading}
              />
            )}

            {/* Demographics */}
            {activeTab === "demographics" && demographicsReport && (
              <div className="space-y-6">
                {/* Overall Statistics */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Overall Statistics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Athletes",
                        value: demographicsReport.overall.total_athletes,
                        color:
                          "from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 border-blue-200 dark:border-blue-500/20",
                        text: "text-blue-600 dark:text-blue-300",
                      },
                      {
                        label: "Male",
                        value: demographicsReport.overall.male_count,
                        color:
                          "from-cyan-50 to-cyan-100 dark:from-cyan-500/10 dark:to-cyan-500/20 border-cyan-200 dark:border-cyan-500/20",
                        text: "text-cyan-600 dark:text-cyan-300",
                      },
                      {
                        label: "Female",
                        value: demographicsReport.overall.female_count,
                        color:
                          "from-pink-50 to-pink-100 dark:from-pink-500/10 dark:to-pink-500/20 border-pink-200 dark:border-pink-500/20",
                        text: "text-pink-600 dark:text-pink-300",
                      },
                      {
                        label: "Eligible",
                        value: demographicsReport.overall.eligible_count,
                        color:
                          "from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/20 border-green-200 dark:border-green-500/20",
                        text: "text-green-600 dark:text-green-300",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-5 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-shadow`}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          {item.label}
                        </p>
                        <p className={`text-4xl font-bold ${item.text}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Distribution */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Gender Distribution
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demographicsReport.by_gender.map((gender, index) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              {gender.gender}
                            </p>
                            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">
                              {gender.count}
                            </p>
                          </div>
                          <p className="text-5xl font-bold text-purple-600 dark:text-purple-300">
                            {gender.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Athletes by Sport */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Athletes by Sport
                  </h2>
                  <div className="space-y-4">
                    {demographicsReport.by_sport.map((sport, index) => (
                      <div
                        key={index}
                        className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {sport.sport}
                          </h3>
                          <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold">
                            {sport.count} Athletes
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            {
                              label: "Male",
                              value: sport.male,
                              color: "text-blue-600 dark:text-blue-300",
                            },
                            {
                              label: "Female",
                              value: sport.female,
                              color: "text-pink-600 dark:text-pink-300",
                            },
                            {
                              label: "Eligible",
                              value: sport.eligible,
                              color: "text-green-600 dark:text-green-300",
                            },
                            {
                              label: "Ineligible",
                              value: sport.ineligible,
                              color: "text-red-600 dark:text-red-300",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="text-center p-3 bg-white dark:bg-white/5 rounded-lg"
                            >
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                                {item.label}
                              </p>
                              <p className={`text-2xl font-bold ${item.color}`}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Athletes by Department */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Athletes by Department
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demographicsReport.by_department.map((dept, index) => (
                      <div
                        key={index}
                        className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 hover:shadow-md transition-shadow"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                          {dept.department}
                        </p>
                        <p className="text-4xl font-bold text-amber-600 dark:text-amber-300 mb-3">
                          {dept.count}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600 dark:text-blue-300 font-semibold">
                            M: {dept.male}
                          </span>
                          <span className="text-pink-600 dark:text-pink-300 font-semibold">
                            F: {dept.female}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Status */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Academic Status
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demographicsReport.by_academic_status.map(
                      (status, index) => (
                        <div
                          key={index}
                          className={`p-6 rounded-xl border hover:shadow-md transition-shadow ${
                            status.status === "Eligible"
                              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-green-200 dark:border-green-500/20"
                              : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 border-red-200 dark:border-red-500/20"
                          }`}
                        >
                          <p className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                            {status.status}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-4xl font-bold text-gray-800 dark:text-white">
                              {status.count}
                            </p>
                            <p className="text-5xl font-bold text-purple-600 dark:text-purple-300">
                              {status.percentage}%
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Athletes by Coach */}
                {demographicsReport.by_coach.length > 0 && (
                  <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      Athletes by Coach
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {demographicsReport.by_coach.map((coach, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/20 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">
                              {coach.coach_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {coach.sport}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-300">
                              {coach.count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              athletes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health & Medical */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Health & Medical Records
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demographicsReport.health_overview.map((health, index) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-500/10 dark:to-red-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20 hover:shadow-md transition-shadow"
                      >
                        <p className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                          {health.status}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-4xl font-bold text-rose-600 dark:text-rose-300">
                            {health.count}
                          </p>
                          <p className="text-5xl font-bold text-purple-600 dark:text-purple-300">
                            {health.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollment Trends */}
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Enrollment Trends
                  </h2>
                  <div className="space-y-3">
                    {demographicsReport.enrollment_trends.map(
                      (trend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10 rounded-xl border border-sky-200 dark:border-sky-500/20 hover:shadow-md transition-shadow"
                        >
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            Year {trend.year}
                          </p>
                          <p className="text-3xl font-bold text-sky-600 dark:text-sky-300">
                            {trend.count} athletes
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance */}
            {activeTab === "attendance" && attendanceAnalytics && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Overall Attendance Statistics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      {
                        label: "Total Entries",
                        value: attendanceAnalytics.overall.total_records,
                        color:
                          "from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 border-blue-200 dark:border-blue-500/20",
                        text: "text-blue-600 dark:text-blue-300",
                      },
                      {
                        label: "Present",
                        value: attendanceAnalytics.overall.present,
                        color:
                          "from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/20 border-green-200 dark:border-green-500/20",
                        text: "text-green-600 dark:text-green-300",
                      },
                      {
                        label: "Absent",
                        value: attendanceAnalytics.overall.absent,
                        color:
                          "from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/20 border-red-200 dark:border-red-500/20",
                        text: "text-red-600 dark:text-red-300",
                      },
                      {
                        label: "Excused",
                        value: attendanceAnalytics.overall.excused,
                        color:
                          "from-yellow-50 to-yellow-100 dark:from-yellow-500/10 dark:to-yellow-500/20 border-yellow-200 dark:border-yellow-500/20",
                        text: "text-yellow-600 dark:text-yellow-300",
                      },
                      {
                        label: "Attendance Rate",
                        value: `${attendanceAnalytics.overall.attendance_rate}%`,
                        color:
                          "from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20 border-purple-200 dark:border-purple-500/20",
                        text: "text-purple-600 dark:text-purple-300",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-5 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-shadow`}
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          {item.label}
                        </p>
                        <p className={`text-3xl font-bold ${item.text}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Attendance by Sport
                  </h2>
                  <div className="space-y-4">
                    {attendanceAnalytics.by_sport.map((sport, index) => (
                      <div
                        key={index}
                        className="p-5 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-white/3 rounded-xl border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {sport.sport}
                          </h3>
                          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded-lg font-bold">
                            {sport.attendance_rate}% Rate
                          </span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {[
                            {
                              label: "Athletes",
                              value: sport.total_athletes,
                              color: "text-gray-800 dark:text-white",
                            },
                            {
                              label: "Total",
                              value: sport.total_records,
                              color: "text-gray-800 dark:text-white",
                            },
                            {
                              label: "Present",
                              value: sport.present,
                              color: "text-green-600 dark:text-green-300",
                            },
                            {
                              label: "Absent",
                              value: sport.absent,
                              color: "text-red-600 dark:text-red-300",
                            },
                            {
                              label: "Excused",
                              value: sport.excused,
                              color: "text-yellow-600 dark:text-yellow-300",
                            },
                            {
                              label: "Late",
                              value: sport.late,
                              color: "text-orange-600 dark:text-orange-300",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="text-center p-3 bg-white dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10"
                            >
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                                {item.label}
                              </p>
                              <p className={`text-lg font-bold ${item.color}`}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Monthly Trends
                  </h2>
                  <div className="space-y-3">
                    {attendanceAnalytics.by_month.map((month, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-white dark:from-blue-500/10 dark:to-transparent rounded-xl border border-blue-200 dark:border-blue-500/20 hover:shadow-md transition-shadow"
                      >
                        <div>
                          <span className="font-bold text-lg text-gray-800 dark:text-white">
                            {month.month}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {month.total} records • {month.rate}% rate
                          </p>
                        </div>
                        <div className="flex gap-6">
                          {[
                            {
                              label: "Present",
                              value: month.present,
                              color: "text-green-600 dark:text-green-300",
                            },
                            {
                              label: "Absent",
                              value: month.absent,
                              color: "text-red-600 dark:text-red-300",
                            },
                            {
                              label: "Excused",
                              value: month.excused,
                              color: "text-yellow-600 dark:text-yellow-300",
                            },
                            {
                              label: "Late",
                              value: month.late,
                              color: "text-orange-600 dark:text-orange-300",
                            },
                          ].map((item, i) => (
                            <div key={i} className="text-center">
                              <p className={`text-2xl font-bold ${item.color}`}>
                                {item.value}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events */}
            {activeTab === "events" && eventParticipation && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Event Overview
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[
                      {
                        label: "Total Events",
                        value: eventParticipation.overall.total_events,
                        color:
                          "from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20 border-purple-200 dark:border-purple-500/20",
                        text: "text-purple-600 dark:text-purple-300",
                      },
                      {
                        label: "Upcoming",
                        value: eventParticipation.overall.upcoming,
                        color:
                          "from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 border-blue-200 dark:border-blue-500/20",
                        text: "text-blue-600 dark:text-blue-300",
                      },
                      {
                        label: "Ongoing",
                        value: eventParticipation.overall.ongoing,
                        color:
                          "from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/20 border-green-200 dark:border-green-500/20",
                        text: "text-green-600 dark:text-green-300",
                      },
                      {
                        label: "Completed",
                        value: eventParticipation.overall.completed,
                        color:
                          "from-teal-50 to-teal-100 dark:from-teal-500/10 dark:to-teal-500/20 border-teal-200 dark:border-teal-500/20",
                        text: "text-teal-600 dark:text-teal-300",
                      },
                      {
                        label: "Cancelled",
                        value: eventParticipation.overall.cancelled,
                        color:
                          "from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/20 border-red-200 dark:border-red-500/20",
                        text: "text-red-600 dark:text-red-300",
                      },
                      {
                        label: "Total Records",
                        value: eventParticipation.overall.total_records,
                        color:
                          "from-yellow-50 to-yellow-100 dark:from-yellow-500/10 dark:to-yellow-500/20 border-yellow-200 dark:border-yellow-500/20",
                        text: "text-yellow-600 dark:text-yellow-300",
                      },
                      {
                        label: "Participants",
                        value: eventParticipation.overall.unique_participants,
                        color:
                          "from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/20 border-orange-200 dark:border-orange-500/20",
                        text: "text-orange-600 dark:text-orange-300",
                      },
                      {
                        label: "Avg/Event",
                        value:
                          eventParticipation.overall.avg_participants_per_event,
                        color:
                          "from-pink-50 to-pink-100 dark:from-pink-500/10 dark:to-pink-500/20 border-pink-200 dark:border-pink-500/20",
                        text: "text-pink-600 dark:text-pink-300",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-shadow text-center`}
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          {item.label}
                        </p>
                        <p className={`text-2xl font-bold ${item.text}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Events List ({eventParticipation.events.length})
                  </h2>
                  <div className="space-y-4">
                    {eventParticipation.events.map((event) => (
                      <div
                        key={event.event_id}
                        className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div
                          onClick={() => toggleEventExpand(event.event_id)}
                          className="p-5 bg-gradient-to-r from-purple-50 to-white dark:from-purple-500/10 dark:to-transparent cursor-pointer hover:from-purple-100 dark:hover:from-purple-500/15 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                  {event.event_name}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    event.status === "Upcoming"
                                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300"
                                      : event.status === "Ongoing"
                                        ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                                        : event.status === "Completed"
                                          ? "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300"
                                          : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                                  }`}
                                >
                                  {event.status}
                                </span>
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300">
                                  {event.event_type}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                  <span className="font-semibold">Sport:</span>{" "}
                                  {event.sport}
                                </div>
                                <div>
                                  <span className="font-semibold">Date:</span>{" "}
                                  {formatDate(event.event_date)}
                                </div>
                                <div>
                                  <span className="font-semibold">Venue:</span>{" "}
                                  {event.venue}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Organizer:
                                  </span>{" "}
                                  {event.organizer || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                                  {event.participant_count}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Participants
                                </p>
                              </div>
                              <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                                  {event.total_records}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  Records
                                </p>
                              </div>
                              <svg
                                className={`w-6 h-6 text-gray-400 transition-transform ${expandedEventId === event.event_id ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {expandedEventId === event.event_id && (
                          <div className="p-5 bg-gray-50 dark:bg-[#252b3b] border-t border-gray-200 dark:border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                                  Event Information
                                </h4>
                                <div className="space-y-2 text-sm bg-white dark:bg-[#1a1f2e] text-gray-700 dark:text-gray-300 p-4 rounded-lg">
                                  <p>
                                    <span className="font-semibold">
                                      Description:
                                    </span>{" "}
                                    {event.description}
                                  </p>
                                  {event.max_participants && (
                                    <p>
                                      <span className="font-semibold">
                                        Max Participants:
                                      </span>{" "}
                                      {event.max_participants}
                                    </p>
                                  )}
                                  {event.creator && (
                                    <p>
                                      <span className="font-semibold">
                                        Created By:
                                      </span>{" "}
                                      {event.creator.name} ({event.creator.role}
                                      )
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                                  Participants ({event.participants.length})
                                </h4>
                                {event.participants.length > 0 ? (
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {event.participants.map(
                                      (participant, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10"
                                        >
                                          <p className="font-semibold text-gray-800 dark:text-white">
                                            {participant.athlete_name}
                                          </p>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded text-xs font-semibold">
                                              {participant.achievement}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded text-xs">
                                              {participant.competition_level}
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 rounded text-xs">
                                              {participant.record_type}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1f2e] p-4 rounded-lg text-center">
                                    No participants recorded yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Top Athletes (Most Records)
                  </h2>
                  <div className="space-y-3">
                    {eventParticipation.top_athletes.map((athlete, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-500/10 dark:to-transparent rounded-xl border border-yellow-200 dark:border-yellow-500/20 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-xl font-bold text-white">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">
                              {athlete.athlete_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {athlete.sport}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-300">
                            {athlete.total_records}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            records
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading &&
              ((activeTab === "demographics" && !demographicsReport) ||
                (activeTab === "attendance" && !attendanceAnalytics) ||
                (activeTab === "events" && !eventParticipation) ||
                (activeTab === "games" && !gameReport) ||
                (activeTab === "practices" && !practiceReport)) && (
                <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-white/5 text-center transition-colors duration-300">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                    No data available
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Apply filters and click "Generate Report" to view data
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      <PrintPreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmDownload}
        type="pdf"
      >
        {renderPreviewContent()}
      </PrintPreviewModal>
    </div>
  );
};

export default ReportsMainPage;
