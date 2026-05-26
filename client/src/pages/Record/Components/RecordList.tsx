import { useEffect, useState, useRef, type FC } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import RecordService from "../../../services/RecordService";
import type { RecordColumns } from "../../../interfaces/RecordInterface";
import RecordPrintButton from "../../../components/button/RecordPrintButton";
import PrintableRecordList from "./PrintableRecordList";
import Modal from "../../../components/Modal";

interface RecordListProps {
  onAddRecord: () => void;
  onEditRecord: (record: RecordColumns) => void;
  onDeleteRecord: (record: RecordColumns) => void;
  refreshKey: boolean;
}

const RecordList: FC<RecordListProps> = ({ onAddRecord, onEditRecord, onDeleteRecord, refreshKey }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordColumns[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleLoadRecords = async () => {
    try {
      setLoading(true);
      const res = await RecordService.loadRecords();
      if (res.status === 200) setRecords(res.data.records);
      else console.error("Unexpected status error:", res.status);
    } catch (error) {
      console.error("Unexpected server error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.athlete_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.achievement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetition = competitionFilter === "All" || record.competition_level === competitionFilter;
    const matchesSport = sportFilter === "All" || record.sport === sportFilter;
    const matchesYear = yearFilter === "All" || record.year.toString() === yearFilter;
    return matchesSearch && matchesCompetition && matchesSport && matchesYear;
  });

  const uniqueSports = Array.from(new Set(records.map((r) => r.sport)));
  const uniqueYears = Array.from(new Set(records.map((r) => r.year))).sort((a, b) => b - a);
  const sportsInView = Array.from(new Set(filteredRecords.map((r) => r.sport)));

  useEffect(() => { handleLoadRecords(); }, [refreshKey]);

  const getAchievementBadgeClass = (achievement: string) => {
    if (achievement.includes("Gold") || achievement.includes("1st") || achievement.includes("Champion"))
      return "bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 dark:from-yellow-500/20 dark:via-yellow-500/30 dark:to-amber-500/20 text-yellow-800 dark:text-yellow-300";
    if (achievement.includes("Silver") || achievement.includes("2nd") || achievement.includes("Runner-up"))
      return "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-800 dark:text-gray-300";
    if (achievement.includes("Bronze") || achievement.includes("3rd"))
      return "bg-gradient-to-r from-orange-100 via-orange-200 to-amber-100 dark:from-orange-500/20 dark:via-orange-500/30 dark:to-amber-500/20 text-orange-800 dark:text-orange-300";
    if (achievement.includes("MVP") || achievement.includes("Best"))
      return "bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300";
    return "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300";
  };

  const canModifyRecord = (record: RecordColumns) => {
    if (user?.role === "Admin") return true;
    if (user?.role === "Coach" && record.created_by === user.user_id) return true;
    return false;
  };

  return (
    <>
      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Records Management</h1>
                <p className="text-blue-100 text-base font-medium">Track achievements, medals, and sports records</p>
              </div>
              {user?.role !== "Athlete" && (
                <button
                  type="button"
                  className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onAddRecord}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Record
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">

          {/* Stats Cards */}
          {!loading && records.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-500/10 dark:to-yellow-500/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-500/20 shadow-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-bold uppercase tracking-wide">Total Records</p>
                <p className="text-4xl font-extrabold text-yellow-900 dark:text-yellow-300 mt-2">{filteredRecords.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-500/20 shadow-lg">
                <p className="text-sm text-green-700 dark:text-green-400 font-bold uppercase tracking-wide">Gold Medals</p>
                <p className="text-4xl font-extrabold text-green-900 dark:text-green-300 mt-2">
                  {filteredRecords.filter((r) => r.achievement.includes("Gold")).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-500/20 shadow-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">Championships</p>
                <p className="text-4xl font-extrabold text-blue-900 dark:text-blue-300 mt-2">
                  {filteredRecords.filter((r) => r.achievement.includes("Champion")).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-500/20 shadow-lg">
                <p className="text-sm text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wide">
                  {user?.role === "Coach" ? "Sport" : "Sports Covered"}
                </p>
                <div className="mt-2">
                  {user?.role === "Coach" ? (
                    <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-300 break-words">
                      {sportsInView.length > 0 ? sportsInView[0] : "N/A"}
                    </p>
                  ) : (
                    <>
                      <p className="text-4xl font-extrabold text-purple-900 dark:text-purple-300">{sportsInView.length}</p>
                      {sportsInView.length > 0 && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1 truncate">
                          {sportsInView.join(", ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-white via-gray-50 to-white dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 blur transition-opacity duration-300"></div>
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by Event / Athlete / Sport / Venue / Achievement"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={competitionFilter}
                      onChange={(e) => setCompetitionFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">All Competitions</option>
                      {["Founders","CAPRISAA","Nationals","Regionals","Inter-School","Provincial","City Meet","Invitational","Other"].map((c) => (
                        <option key={c} value={c} className="dark:bg-[#1a1f2e]">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">All Sports</option>
                      {uniqueSports.map((sport, i) => <option key={i} value={sport} className="dark:bg-[#1a1f2e]">{sport}</option>)}
                    </select>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">All Years</option>
                      {uniqueYears.map((year, i) => <option key={i} value={year} className="dark:bg-[#1a1f2e]">{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {user?.role !== "Athlete" && (
                    <button
                      onClick={onAddRecord}
                      className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Record
                    </button>
                  )}
                  <div className="flex flex-wrap gap-3 sm:ml-auto">
                    <button
                      onClick={() => setShowPrintPreview(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto" style={{ maxHeight: "calc(90vh - 500px)", overflowY: "auto" }}>
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] sticky top-0 text-white z-10 shadow-lg">
                  <tr>
                    {[
                      { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Event Name" },
                      { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", label: "Competition" },
                      { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Sport" },
                      { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "Athlete" },
                      { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Achievement" },
                      { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "Created By" },
                      { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Date" },
                    ].map(({ icon, label }) => (
                      <th key={label} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                          </svg>
                          {label}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">Year</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">Loading records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No records found</p>
                          <p className="text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.record_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {record.event_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">
                          {record.competition_level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {record.sport}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {record.athlete_name}
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getAchievementBadgeClass(record.achievement)}`}>
                            {record.achievement}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${
                            record.creator_role === "Admin"
                              ? "bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300"
                              : "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300"
                          }`}>
                            {record.creator_role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {formatDate(record.event_date)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {record.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {user?.role === "Athlete" ? (
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Only
                            </span>
                          ) : canModifyRecord(record) ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onEditRecord(record)}
                                title="Edit"
                                className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDeleteRecord(record)}
                                title="Delete"
                                className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filteredRecords.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{filteredRecords.length}</span> of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">{records.length}</span> records
                    {(competitionFilter !== "All" || sportFilter !== "All" || yearFilter !== "All") && (
                      <span className="ml-2">
                        • Filtered by:{" "}
                        {competitionFilter !== "All" && <span className="font-bold text-blue-600 dark:text-blue-400">{competitionFilter}</span>}
                        {competitionFilter !== "All" && sportFilter !== "All" && ", "}
                        {sportFilter !== "All" && <span className="font-bold text-blue-600 dark:text-blue-400">{sportFilter}</span>}
                        {(competitionFilter !== "All" || sportFilter !== "All") && yearFilter !== "All" && ", "}
                        {yearFilter !== "All" && <span className="font-bold text-blue-600 dark:text-blue-400">{yearFilter}</span>}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showPrintPreview} onClose={() => setShowPrintPreview(false)} size="large">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#1a1f2e] dark:to-[#141720] p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-white/10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">Sports Records</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preview and download your report</p>
            </div>
            <RecordPrintButton
              records={filteredRecords}
              documentTitle={`Sports_Records_Report_${new Date().toISOString().split("T")[0]}`}
            />
          </div>
          <div className="border-2 border-gray-300 dark:border-white/10 rounded-2xl overflow-hidden max-h-[65vh] overflow-y-auto bg-white dark:bg-[#1a1f2e] shadow-2xl">
            <PrintableRecordList ref={printRef} records={filteredRecords} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RecordList;