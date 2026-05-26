import { useState } from "react";
import type { PracticeReportData } from "../../../interfaces/PracticeReportInterface";

interface PracticeScheduleReportsProps {
  data: PracticeReportData | null;
  loading: boolean;
}

const PracticeScheduleReports: React.FC<PracticeScheduleReportsProps> = ({
  data,
  loading,
}) => {
  const [expandedPracticeId, setExpandedPracticeId] = useState<number | null>(
    null,
  );

  const togglePracticeExpand = (practiceId: number) =>
    setExpandedPracticeId(
      expandedPracticeId === practiceId ? null : practiceId,
    );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeString: string) =>
    new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-12 border-2 border-gray-100 dark:border-white/5 text-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-semibold">
          Loading practice schedule reports...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-12 border-2 border-gray-100 dark:border-white/5 text-center transition-colors duration-300">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Overall Practice Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Total Practices",
              value: data.overall.total_practices,
              bg: "bg-blue-50 dark:bg-blue-500/10",
              border: "border-blue-200 dark:border-blue-500/20",
              text: "text-blue-600 dark:text-blue-300",
            },
            {
              label: "Completed",
              value: data.overall.completed_practices,
              bg: "bg-green-50 dark:bg-green-500/10",
              border: "border-green-200 dark:border-green-500/20",
              text: "text-green-600 dark:text-green-300",
            },
            {
              label: "Pending",
              value: data.overall.pending_practices,
              bg: "bg-yellow-50 dark:bg-yellow-500/10",
              border: "border-yellow-200 dark:border-yellow-500/20",
              text: "text-yellow-600 dark:text-yellow-300",
            },
            {
              label: "Approved",
              value: data.overall.approved_practices,
              bg: "bg-teal-50 dark:bg-teal-500/10",
              border: "border-teal-200 dark:border-teal-500/20",
              text: "text-teal-600 dark:text-teal-300",
            },
            {
              label: "Athletes Involved",
              value: data.overall.total_athletes_involved,
              bg: "bg-purple-50 dark:bg-purple-500/10",
              border: "border-purple-200 dark:border-purple-500/20",
              text: "text-purple-600 dark:text-purple-300",
            },
            {
              label: "Avg Attendance",
              value: `${data.overall.average_attendance_rate}%`,
              bg: "bg-orange-50 dark:bg-orange-500/10",
              border: "border-orange-200 dark:border-orange-500/20",
              text: "text-orange-600 dark:text-orange-300",
            },
          ].map(({ label, value, bg, border, text }) => (
            <div
              key={label}
              className={`p-4 ${bg} rounded-xl border-2 ${border}`}
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {label}
              </p>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Sessions List */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Practice Sessions ({data.practices.length})
        </h2>
        <div className="space-y-4">
          {data.practices.map((practice) => (
            <div
              key={practice.practice_schedule_id}
              className="border-2 border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200"
            >
              {/* Practice Header */}
              <div
                onClick={() =>
                  togglePracticeExpand(practice.practice_schedule_id)
                }
                className="p-4 bg-gradient-to-r from-green-50 to-white dark:from-green-500/10 dark:to-[#1e2433] cursor-pointer hover:from-green-100 dark:hover:from-green-500/15 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {practice.sport} Practice
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          practice.status === "Completed"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                            : practice.status === "Approved"
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300"
                              : practice.status === "Pending"
                                ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                                : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {practice.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-semibold">Coach:</span>{" "}
                        {practice.coach_name}
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(practice.practice_date)}
                      </div>
                      <div>
                        <span className="font-semibold">Time:</span>{" "}
                        {formatTime(practice.start_time)} -{" "}
                        {formatTime(practice.end_time)}
                      </div>
                      <div>
                        <span className="font-semibold">Venue:</span>{" "}
                        {practice.venue}
                      </div>
                      <div>
                        <span className="font-semibold">Attendance:</span>{" "}
                        {practice.attendance_rate}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {practice.athletes_present}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Present
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {practice.total_players}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total
                      </p>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${expandedPracticeId === practice.practice_schedule_id ? "rotate-180" : ""}`}
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

              {/* Practice Details (Expanded) */}
              {expandedPracticeId === practice.practice_schedule_id && (
                <div className="p-4 bg-gray-50 dark:bg-[#252b3b] border-t-2 border-gray-200 dark:border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attendance Summary */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                        Attendance Summary
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            label: "Present",
                            value: practice.athletes_present,
                            badge:
                              "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300",
                          },
                          {
                            label: "Absent",
                            value: practice.athletes_absent,
                            badge:
                              "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300",
                          },
                          {
                            label: "Excused",
                            value: practice.athletes_excused,
                            badge:
                              "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300",
                          },
                          {
                            label: "Late",
                            value: practice.athletes_late,
                            badge:
                              "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300",
                          },
                        ].map(({ label, value, badge }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10"
                          >
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {label}
                            </span>
                            <span
                              className={`px-3 py-1 ${badge} rounded-lg font-bold`}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Athletes List */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                        Athletes ({practice.athletes.length})
                      </h4>
                      {practice.athletes.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {practice.athletes.map((athlete, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800 dark:text-white">
                                  {athlete.athlete_name}
                                </p>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    athlete.attendance_status === "Present"
                                      ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                                      : athlete.attendance_status === "Absent"
                                        ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                                        : athlete.attendance_status ===
                                            "Excused"
                                          ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                                          : "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300"
                                  }`}
                                >
                                  {athlete.attendance_status}
                                </span>
                              </div>
                              {athlete.attendance_notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {athlete.attendance_notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No athletes recorded yet
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

      {/* By Sport */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Practices by Sport
        </h2>
        <div className="space-y-4">
          {data.by_sport.map((sport, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-[#1e2433] rounded-xl border-2 border-gray-200 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {sport.sport}
                </h3>
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded-lg font-bold">
                  {sport.average_attendance}% Avg Attendance
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Practices
                  </p>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {sport.total_practices}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Avg Attendance
                  </p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {sport.average_attendance}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Athletes</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {sport.total_athletes}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Coach */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Practices by Coach
        </h2>
        <div className="space-y-3">
          {data.by_coach.map((coach, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-white dark:from-cyan-500/10 dark:to-[#1e2433] rounded-xl border-2 border-cyan-200 dark:border-cyan-500/20"
            >
              <div>
                <p className="font-bold text-gray-800 dark:text-white">
                  {coach.coach_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {coach.sport}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">
                  {coach.total_practices}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {coach.average_attendance}% attendance
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Venue */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Practices by Venue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.by_venue.map((venue, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/10 dark:to-[#1e2433] rounded-xl border-2 border-indigo-200 dark:border-indigo-500/20"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {venue.venue}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                {venue.practice_count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sports: {venue.sports.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Monthly Practice Trends
        </h2>
        <div className="space-y-3">
          {data.by_month.map((month, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white dark:from-green-500/10 dark:to-[#1e2433] rounded-xl border-2 border-green-200 dark:border-green-500/20"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-800 dark:text-white">
                  {month.month_name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {month.total_practices} practices • {month.average_attendance}
                  % attendance
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {month.average_attendance}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  avg attendance
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeScheduleReports;
