import { useEffect, useState, useRef, type FC } from "react";
import { useNavigate } from "react-router-dom";
import AthleteService from "../../../services/AthleteService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import PrintButton from "../../../components/button/PrintButton";
import PrintableAthleteList from "./PrintableAthleteList";
import Modal from "../../../components/Modal";

interface AthleteListProps {
  onAddAthlete: () => void;
  onEditAthlete: (athlete: AthleteColumns) => void;
  onDeleteAthlete: (athlete: AthleteColumns) => void;
  onToggleStatus: (athlete: AthleteColumns) => void;
  refreshKey: boolean;
}

const AthleteList: FC<AthleteListProps> = ({
  onAddAthlete,
  onEditAthlete,
  onDeleteAthlete,
  onToggleStatus,
  refreshKey,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [athletes, setAthletes] = useState<AthleteColumns[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleLoadAthletes = async () => {
    try {
      setLoading(true);
      const res = await AthleteService.loadAthletes();
      if (res.status === 200) {
        setAthletes(res.data.athletes);
      } else {
        console.error(
          "Unexpected status error occurred during loading athletes: ",
          res.status,
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during loading athletes: ",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAthleteFullNameFormat = (athlete: AthleteColumns) => {
    let fullName = "";
    if (athlete.middle_name) {
      fullName = `${athlete.first_name} ${athlete.middle_name.charAt(0)}. ${athlete.last_name}`;
    } else {
      fullName = `${athlete.first_name} ${athlete.last_name}`;
    }
    if (athlete.suffix_name) fullName += ` ${athlete.suffix_name}`;
    return fullName;
  };

  const handleCoachFullNameFormat = (athlete: AthleteColumns) => {
    if (!athlete.coach) return "Not Assigned";
    const coach = athlete.coach;
    let fullName = "";
    if (coach.middle_name) {
      fullName = `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`;
    } else {
      fullName = `${coach.first_name} ${coach.last_name}`;
    }
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return fullName;
  };

  const uniqueSports = Array.from(
    new Set(athletes.map((a) => a.sport).filter(Boolean)),
  ).sort();

  const filteredAthletes = athletes.filter((athlete) => {
    const fullName = handleAthleteFullNameFormat(athlete);
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.school_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || athlete.academic_status === statusFilter;
    const matchesAttendanceStatus =
      attendanceStatusFilter === "All" ||
      athlete.athlete_status === attendanceStatusFilter;
    const matchesSport = sportFilter === "All" || athlete.sport === sportFilter;
    return (
      matchesSearch && matchesStatus && matchesAttendanceStatus && matchesSport
    );
  });

  useEffect(() => {
    handleLoadAthletes();
  }, [refreshKey]);

  const reportTitle =
    sportFilter === "All" ? "Athlete List" : `${sportFilter} — Athlete List`;

  const renderAthleteAvatar = (athlete: AthleteColumns) => {
    const profilePictureUrl = athlete.user?.profile_picture_url;
    if (profilePictureUrl) {
      return (
        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 flex-shrink-0">
          <img
            src={profilePictureUrl}
            alt={handleAthleteFullNameFormat(athlete)}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold text-sm">${athlete.first_name.charAt(0)}${athlete.last_name.charAt(0)}</span>
                </div>`;
              }
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 flex-shrink-0">
        <span className="text-white font-bold text-sm">
          {athlete.first_name.charAt(0)}
          {athlete.last_name.charAt(0)}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Athlete Management
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Manage athletes, track performance, and monitor attendance
                </p>
              </div>
              <button
                type="button"
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={onAddAthlete}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Athlete
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-white via-gray-50 to-white dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search + Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 blur transition-opacity duration-300"></div>
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by Name / Department / Sports"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Academic Status
                      </option>
                      <option value="Eligible" className="dark:bg-[#1a1f2e]">
                        Eligible
                      </option>
                      <option value="Ineligible" className="dark:bg-[#1a1f2e]">
                        Ineligible
                      </option>
                    </select>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={attendanceStatusFilter}
                      onChange={(e) =>
                        setAttendanceStatusFilter(e.target.value)
                      }
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Attendance Status
                      </option>
                      <option value="active" className="dark:bg-[#1a1f2e]">
                        Active
                      </option>
                      <option value="inactive" className="dark:bg-[#1a1f2e]">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div className="w-full lg:w-48">
                    <select
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Sports
                      </option>
                      {uniqueSports.map((sport) => (
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
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <button
                    onClick={onAddAthlete}
                    className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Athlete
                  </button>

                  <div className="flex flex-wrap gap-3 sm:ml-auto">
                    <button
                      onClick={() => setShowPrintPreview(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Generate Report
                      {sportFilter !== "All" && (
                        <span className="ml-1 px-2 py-0.5 bg-white text-emerald-700 text-xs font-bold rounded-lg">
                          {sportFilter}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "calc(90vh - 500px)", overflowY: "auto" }}
            >
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] sticky top-0 text-white z-10 shadow-lg">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                          />
                        </svg>
                        School ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Full Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Coach
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Sports
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Department
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading athletes...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            No athletes found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAthletes.map((athlete) => (
                      <tr
                        key={athlete.athlete_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {athlete.school_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3.5">
                            {renderAthleteAvatar(athlete)}
                            <button
                              onClick={() =>
                                navigate(`/athletes/${athlete.athlete_id}`)
                              }
                              className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors hover:underline text-left"
                            >
                              {handleAthleteFullNameFormat(athlete)}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span
                            className={
                              athlete.coach
                                ? "text-gray-700 dark:text-gray-300 font-semibold text-sm"
                                : "text-gray-400 dark:text-gray-500 italic text-sm"
                            }
                          >
                            {handleCoachFullNameFormat(athlete)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {athlete.sport}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {athlete.department}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm ${
                                athlete.athlete_status === "active"
                                  ? "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-800 dark:text-green-300"
                                  : "bg-gradient-to-r from-red-100 via-red-200 to-rose-100 dark:from-red-500/20 dark:via-red-500/30 dark:to-rose-500/20 text-red-800 dark:text-red-300"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  athlete.athlete_status === "active"
                                    ? "bg-green-500"
                                    : "bg-red-500 animate-pulse"
                                }`}
                              ></span>
                              {athlete.athlete_status.charAt(0).toUpperCase() +
                                athlete.athlete_status.slice(1)}
                            </span>
                            {athlete.consecutive_absences > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {athlete.consecutive_absences} consecutive
                                absence
                                {athlete.consecutive_absences !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/athletes/${athlete.athlete_id}`)
                              }
                              title="View"
                              className="p-2 bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 hover:from-blue-200 hover:via-blue-300 hover:to-indigo-200 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 dark:hover:from-blue-500/30 dark:hover:via-blue-500/40 dark:hover:to-indigo-500/30 text-blue-700 dark:text-blue-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onEditAthlete(athlete)}
                              title="Edit"
                              className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:via-emerald-500/40 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onToggleStatus(athlete)}
                              title={
                                athlete.athlete_status === "active"
                                  ? "Mark as Inactive"
                                  : "Mark as Active"
                              }
                              className={`p-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                athlete.athlete_status === "active"
                                  ? "bg-gradient-to-r from-orange-100 via-orange-200 to-amber-100 hover:from-orange-200 hover:via-orange-300 hover:to-amber-200 dark:from-orange-500/20 dark:via-orange-500/30 dark:to-amber-500/20 dark:hover:from-orange-500/30 dark:hover:to-amber-500/30 text-orange-700 dark:text-orange-400"
                                  : "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 hover:from-green-200 hover:via-green-300 hover:to-emerald-200 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 dark:hover:from-green-500/30 dark:hover:to-emerald-500/30 text-green-700 dark:text-green-400"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteAthlete(athlete)}
                              title="Delete"
                              className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:via-red-500/40 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filteredAthletes.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredAthletes.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {athletes.length}
                    </span>{" "}
                    athletes
                    {(statusFilter !== "All" ||
                      attendanceStatusFilter !== "All" ||
                      sportFilter !== "All") && (
                      <span className="ml-2">
                        • Filtered by:{" "}
                        {sportFilter !== "All" && (
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {sportFilter}
                          </span>
                        )}
                        {sportFilter !== "All" &&
                          statusFilter !== "All" &&
                          ", "}
                        {statusFilter !== "All" && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {statusFilter}
                          </span>
                        )}
                        {(sportFilter !== "All" || statusFilter !== "All") &&
                          attendanceStatusFilter !== "All" &&
                          ", "}
                        {attendanceStatusFilter !== "All" && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {attendanceStatusFilter}
                          </span>
                        )}
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

      {/* Print Preview Modal */}
      <Modal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        size="large"
      >
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#1a1f2e] dark:to-[#141720] p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-white/10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">
                Athletes Report
              </h2>
              {sportFilter !== "All" && (
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Sport: {sportFilter} · {filteredAthletes.length} athlete
                  {filteredAthletes.length !== 1 ? "s" : ""}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preview and download your report
              </p>
            </div>
            <PrintButton
              athletes={filteredAthletes}
              documentTitle={`Athletes_Report_${sportFilter !== "All" ? `${sportFilter}_` : ""}${new Date().toISOString().split("T")[0]}`}
            />
          </div>
          <div className="border-2 border-gray-300 dark:border-white/10 rounded-2xl overflow-hidden max-h-[65vh] overflow-y-auto bg-white dark:bg-[#1a1f2e] shadow-2xl">
            <PrintableAthleteList
              ref={printRef}
              athletes={filteredAthletes}
              title={reportTitle}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AthleteList;
