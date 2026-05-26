import { useEffect, useState, type FC } from "react";
import PracticeScheduleService from "../../../services/PracticeScheduleService";
import { useAuth } from "../../../contexts/AuthContext";
import type { PracticeScheduleColumns } from "../../../interfaces/PracticeScheduleInterface";
import ApproveDeclineModal from "./ApproveDeclineModal";

interface PracticeScheduleListProps {
  onAddPracticeSchedule: () => void;
  onEditPracticeSchedule: (schedule: PracticeScheduleColumns) => void;
  onDeletePracticeSchedule: (schedule: PracticeScheduleColumns) => void;
  onMarkAttendance: (schedule: PracticeScheduleColumns) => void;
  refreshKey: boolean;
}

const PracticeScheduleList: FC<PracticeScheduleListProps> = ({
  onAddPracticeSchedule,
  onEditPracticeSchedule,
  onDeletePracticeSchedule,
  onMarkAttendance,
  refreshKey,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [practiceSchedules, setPracticeSchedules] = useState<
    PracticeScheduleColumns[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("All");
  const [isApproveDeclineModalOpen, setIsApproveDeclineModalOpen] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<PracticeScheduleColumns | null>(null);
  const [actionType, setActionType] = useState<"approve" | "decline">(
    "approve",
  );

  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";
  const isAthlete = user?.role === "Athlete";

  const handleLoadPracticeSchedules = async () => {
    try {
      setLoading(true);
      const res = await PracticeScheduleService.loadPracticeSchedules();
      if (res.status === 200) setPracticeSchedules(res.data.practice_schedules);
    } catch (error) {
      console.error("Error loading practice schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApproveModal = (schedule: PracticeScheduleColumns) => {
    setSelectedSchedule(schedule);
    setActionType("approve");
    setIsApproveDeclineModalOpen(true);
  };

  const handleOpenDeclineModal = (schedule: PracticeScheduleColumns) => {
    setSelectedSchedule(schedule);
    setActionType("decline");
    setIsApproveDeclineModalOpen(true);
  };

  const handleCoachFullNameFormat = (
    practiceSchedule: PracticeScheduleColumns,
  ) => {
    if (!practiceSchedule.coach) return "N/A";
    const coach = practiceSchedule.coach;
    let fullName = coach.middle_name
      ? `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`
      : `${coach.first_name} ${coach.last_name}`;
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return fullName;
  };

  const formatTime = (time: string) => (!time ? "" : time.substring(0, 5));

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Pending:
        "bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 dark:from-yellow-500/20 dark:via-yellow-500/30 dark:to-amber-500/20 text-yellow-800 dark:text-yellow-300",
      Approved:
        "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-800 dark:text-green-300",
      Declined:
        "bg-gradient-to-r from-red-100 via-red-200 to-rose-100 dark:from-red-500/20 dark:via-red-500/30 dark:to-rose-500/20 text-red-800 dark:text-red-300",
      Completed:
        "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300",
      Cancelled:
        "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-800 dark:text-gray-300",
    };
    return (
      badges[status] ||
      "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:to-white/10 text-gray-800 dark:text-gray-300"
    );
  };

  const getAttendanceStatusBadge = (attendanceStatus?: string) => {
    if (!attendanceStatus) return null;
    const badges: Record<
      string,
      { class: string; icon: string; label: string }
    > = {
      pending: {
        class:
          "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-700 dark:text-gray-300",
        icon: "⏳",
        label: "Pending",
      },
      partial: {
        class:
          "bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 dark:from-yellow-500/20 dark:via-yellow-500/30 dark:to-amber-500/20 text-yellow-700 dark:text-yellow-300",
        icon: "📝",
        label: "Partial",
      },
      completed: {
        class:
          "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-700 dark:text-green-300",
        icon: "✅",
        label: "Submitted",
      },
    };
    const badge = badges[attendanceStatus] || badges.pending;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ${badge.class}`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const uniqueSports = Array.from(
    new Set(practiceSchedules.map((s) => s.sport)),
  ).sort();

  const filteredPracticeSchedules = practiceSchedules.filter((schedule) => {
    const coachName = handleCoachFullNameFormat(schedule);
    const matchesSearch =
      coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || schedule.status === statusFilter;
    const matchesSport =
      sportFilter === "All" || schedule.sport === sportFilter;
    const matchesAttendanceStatus =
      attendanceStatusFilter === "All" ||
      schedule.attendance_status === attendanceStatusFilter;
    return (
      matchesSearch && matchesStatus && matchesSport && matchesAttendanceStatus
    );
  });

  const canEdit = (schedule: PracticeScheduleColumns) => {
    if (isAdmin) return true;
    if (isCoach)
      return schedule.status === "Pending" || schedule.status === "Declined";
    return false;
  };

  const canDelete = () => isAdmin || isCoach;

  useEffect(() => {
    handleLoadPracticeSchedules();
  }, [refreshKey]);

  const getPageTitle = () => {
    if (isAdmin) return "Practice Schedule Management";
    if (isCoach) return "My Practice Schedules";
    if (isAthlete) return "Approved Practice Schedules";
    return "Practice Schedules";
  };

  const getPageDescription = () => {
    if (isAdmin) return "Manage and approve practice schedules";
    if (isCoach) return "Request and manage your practice venues";
    if (isAthlete) return "View approved practice schedules";
    return "View practice schedules";
  };

  return (
    <>
      <ApproveDeclineModal
        isOpen={isApproveDeclineModalOpen}
        onClose={() => setIsApproveDeclineModalOpen(false)}
        schedule={selectedSchedule}
        actionType={actionType}
        onSuccess={() => {
          handleLoadPracticeSchedules();
          setIsApproveDeclineModalOpen(false);
        }}
      />

      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  {getPageDescription()}
                </p>
              </div>
              {(isAdmin || isCoach) && (
                <button
                  type="button"
                  className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onAddPracticeSchedule}
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
                  {isCoach ? "Request Practice Venue" : "Add Practice Schedule"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
            {/* Search and Filter Section */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-white via-gray-50 to-white dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
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
                        placeholder="Search by Coach / Venue / Sport"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="w-full lg:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Status
                      </option>
                      <option value="Pending" className="dark:bg-[#1a1f2e]">
                        Pending
                      </option>
                      <option value="Approved" className="dark:bg-[#1a1f2e]">
                        Approved
                      </option>
                      <option value="Declined" className="dark:bg-[#1a1f2e]">
                        Declined
                      </option>
                      <option value="Completed" className="dark:bg-[#1a1f2e]">
                        Completed
                      </option>
                      <option value="Cancelled" className="dark:bg-[#1a1f2e]">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  {/* Sport Filter */}
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

                  {/* Attendance Filter */}
                  <div className="w-full lg:w-48">
                    <select
                      value={attendanceStatusFilter}
                      onChange={(e) =>
                        setAttendanceStatusFilter(e.target.value)
                      }
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Attendance
                      </option>
                      <option value="pending" className="dark:bg-[#1a1f2e]">
                        ⏳ Pending
                      </option>
                      <option value="partial" className="dark:bg-[#1a1f2e]">
                        📝 Partial
                      </option>
                      <option value="completed" className="dark:bg-[#1a1f2e]">
                        ✅ Submitted
                      </option>
                    </select>
                  </div>
                </div>

                {(isAdmin || isCoach) && (
                  <button
                    onClick={onAddPracticeSchedule}
                    className="lg:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                    {isCoach
                      ? "Request Practice Venue"
                      : "Add Practice Schedule"}
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Table */}
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "calc(90vh - 500px)", overflowY: "auto" }}
            >
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] sticky top-0 text-white z-10 shadow-lg">
                  <tr>
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Venue
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Date
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Time
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
                        Sport
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Players
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Status
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        Attendance
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
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading practice schedules...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPracticeSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-20 text-center">
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
                            No practice schedules found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPracticeSchedules.map((schedule) => (
                      <tr
                        key={schedule.practice_schedule_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {handleCoachFullNameFormat(schedule)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">
                          {schedule.venue}
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {formatDate(schedule.practice_date)}
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {schedule.sport}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {schedule.total_players}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getStatusBadge(schedule.status)}`}
                            >
                              {schedule.status}
                            </span>
                            {schedule.admin_notes && (
                              <p
                                className="text-xs text-gray-600 dark:text-gray-400"
                                title={schedule.admin_notes}
                              >
                                Note: {schedule.admin_notes.substring(0, 30)}...
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {schedule.status === "Approved" ||
                          schedule.status === "Completed" ? (
                            getAttendanceStatusBadge(
                              schedule.attendance_status || "pending",
                            )
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {isAdmin && schedule.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleOpenApproveModal(schedule)
                                  }
                                  title="Approve"
                                  className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleOpenDeclineModal(schedule)
                                  }
                                  title="Decline"
                                  className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}

                            {canEdit(schedule) && (
                              <button
                                onClick={() => onEditPracticeSchedule(schedule)}
                                title="Edit"
                                className="p-2 bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 hover:from-blue-200 hover:via-blue-300 hover:to-indigo-200 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 dark:hover:from-blue-500/30 dark:hover:to-indigo-500/30 text-blue-700 dark:text-blue-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                            )}

                            {isCoach &&
                              (schedule.status === "Approved" ||
                                schedule.status === "Completed") && (
                                <button
                                  onClick={() => onMarkAttendance(schedule)}
                                  title="Mark Attendance"
                                  className="p-2 bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 hover:from-purple-200 hover:via-purple-300 hover:to-pink-200 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 dark:hover:from-purple-500/30 dark:hover:to-pink-500/30 text-purple-700 dark:text-purple-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                  </svg>
                                </button>
                              )}

                            {canDelete() && (
                              <button
                                onClick={() =>
                                  onDeletePracticeSchedule(schedule)
                                }
                                title="Delete"
                                className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                            )}

                            {isAthlete && (
                              <span className="text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center gap-1">
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
                                View Only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {!loading && filteredPracticeSchedules.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredPracticeSchedules.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {practiceSchedules.length}
                    </span>{" "}
                    practice schedules
                    {(statusFilter !== "All" ||
                      sportFilter !== "All" ||
                      attendanceStatusFilter !== "All") && (
                      <span className="ml-2">
                        • Filtered by:{" "}
                        {statusFilter !== "All" && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {statusFilter}
                          </span>
                        )}
                        {statusFilter !== "All" &&
                          (sportFilter !== "All" ||
                            attendanceStatusFilter !== "All") &&
                          ", "}
                        {sportFilter !== "All" && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {sportFilter}
                          </span>
                        )}
                        {sportFilter !== "All" &&
                          attendanceStatusFilter !== "All" &&
                          ", "}
                        {attendanceStatusFilter !== "All" && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {attendanceStatusFilter === "pending" &&
                              "⏳ Pending"}
                            {attendanceStatusFilter === "partial" &&
                              "📝 Partial"}
                            {attendanceStatusFilter === "completed" &&
                              "✅ Submitted"}
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
    </>
  );
};

export default PracticeScheduleList;
