import { useState, useEffect } from "react";
import AthleteProfileService from "../../../services/AthleteProfileService";
import AttendanceService from "../../../services/AttendanceService";
import type { AttendanceColumns, AttendanceStats } from "../../../interfaces/AttendanceInterface";

const AthleteAttendanceView = () => {
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<AttendanceColumns[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_practices: 0, present: 0, absent: 0, excused: 0, late: 0, attendance_percentage: 0,
  });
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");

  useEffect(() => { loadAttendanceData(); }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const profileRes = await AthleteProfileService.getMyProfile();
      if (profileRes.status === 200) {
        const profile = profileRes.data.athlete;
        const attendanceRes = await AttendanceService.getAthleteAttendance(profile.athlete_id);
        if (attendanceRes.status === 200) {
          setAttendances(attendanceRes.data.attendances);
          setStats(attendanceRes.data.stats);
        }
      }
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => (!time ? "" : time.substring(0, 5));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "Absent": return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      case "Excused": return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
      case "Late": return "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300";
      default: return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const filteredAttendances = attendances.filter((attendance) => {
    if (filter === "all") return true;
    if (filter === "present") return attendance.attendance_status === "Present";
    if (filter === "absent") return attendance.attendance_status === "Absent" || attendance.attendance_status === "Late";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-sm dark:shadow-black/30 p-6 border border-gray-200 dark:border-white/5 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          My Attendance
        </h2>

        <div className="flex gap-2">
          {([
            { key: "all", label: "All", active: "bg-blue-600" },
            { key: "present", label: "Present", active: "bg-green-600" },
            { key: "absent", label: "Absent", active: "bg-red-600" },
          ] as const).map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === key
                  ? `${active} text-white shadow-md`
                  : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Attendance Rate — vivid, kept as-is */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-xs mb-1">Attendance Rate</p>
          <p className="text-3xl font-bold">{stats.attendance_percentage.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Practices</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_practices}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 border border-green-200 dark:border-green-500/20">
          <p className="text-green-600 dark:text-green-400 text-xs mb-1">Present</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.present}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20">
          <p className="text-red-600 dark:text-red-400 text-xs mb-1">Absent</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.absent}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-500/20">
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mb-1">Excused</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.excused}</p>
        </div>
      </div>

      {/* Attendance History */}
      {filteredAttendances.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No attendance records found</p>
          <p className="text-gray-400 dark:text-gray-500 mt-1">Your attendance will appear here after practices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttendances.map((attendance) => (
            <div
              key={attendance.attendance_id}
              className="bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-[#1e2433] border-2 border-gray-200 dark:border-white/5 rounded-xl p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-sm ${getStatusColor(attendance.attendance_status)}`}>
                      {attendance.attendance_status}
                    </span>
                    {attendance.practice_schedule && (
                      <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-sm font-bold rounded-full shadow-sm">
                        {attendance.practice_schedule.sport}
                      </span>
                    )}
                  </div>

                  {attendance.practice_schedule && (
                    <>
                      <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2">
                        {attendance.practice_schedule.venue}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {formatTime(attendance.practice_schedule.start_time)} - {formatTime(attendance.practice_schedule.end_time)}
                          </span>
                        </div>
                        {attendance.practice_schedule.coach && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">
                              Coach: {attendance.practice_schedule.coach.first_name} {attendance.practice_schedule.coach.last_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {attendance.attendance_notes && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">Note:</span> {attendance.attendance_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Date Badge */}
                <div className="text-right ml-6">
                  {attendance.practice_schedule && (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-500/30 rounded-xl flex flex-col items-center justify-center shadow-md">
                      <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                        {new Date(attendance.practice_schedule.practice_date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                        {new Date(attendance.practice_schedule.practice_date).getDate()}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                        {new Date(attendance.practice_schedule.practice_date).getFullYear()}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Marked: {new Date(attendance.marked_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthleteAttendanceView;