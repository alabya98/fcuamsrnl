import { useState, useEffect } from "react";
import Modal from "../../../components/Modal/index";
import AttendanceService from "../../../services/AttendanceService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AttendanceColumns, AttendanceStats } from "../../../interfaces/AttendanceInterface";

interface ViewAttendanceModalProps {
  athlete: AthleteColumns | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const ViewAttendanceModal = ({
  athlete,
  isOpen,
  onClose,
  onSuccess,
}: ViewAttendanceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceColumns[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_practices: 0,
    present: 0,
    absent: 0,
    excused: 0,
    late: 0,
    attendance_percentage: 0,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && athlete) {
      loadAttendanceData();
    }
  }, [isOpen, athlete]);

  const loadAttendanceData = async () => {
    if (!athlete) return;

    try {
      setLoading(true);
      const response = await AttendanceService.getAthleteAttendance(
        athlete.athlete_id
      );

      if (response.status === 200) {
        setAttendances(response.data.attendances);
        const backendPercentage = response.data.stats.attendance_percentage;
        setStats({
          ...response.data.stats,
          attendance_percentage: Number(backendPercentage || 0),
        });
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId: number) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      setDeletingId(attendanceId);
      const response = await AttendanceService.deleteAttendance(attendanceId);

      if (response.status === 200) {
        if (onSuccess) {
          onSuccess("Attendance record deleted successfully!");
        }
        await loadAttendanceData();
      }
    } catch (error: any) {
      console.error("Error deleting attendance:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete attendance record";
      if (onSuccess) {
        onSuccess(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Excused":
        return "bg-yellow-100 text-yellow-800";
      case "Late":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAthleteFullName = () => {
    if (!athlete) return "";
    let name = athlete.first_name;
    if (athlete.middle_name) {
      name += ` ${athlete.middle_name.charAt(0)}.`;
    }
    name += ` ${athlete.last_name}`;
    if (athlete.suffix_name) {
      name += ` ${athlete.suffix_name}`;
    }
    return name;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large" className="!bg-white dark:!bg-white">
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 px-4 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Attendance Record
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {athlete && (
            <>
              {/* Athlete Info Card */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-2xl font-bold text-blue-700">
                      {athlete.first_name.charAt(0)}
                      {athlete.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                      {formatAthleteFullName()}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {athlete.school_id} • {athlete.sport} • {athlete.position}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 text-white">
                  <p className="text-blue-100 text-xs mb-1">Attendance Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {Number(stats.attendance_percentage || 0).toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                  <p className="text-gray-600 text-xs mb-1">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {stats.total_practices}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <p className="text-green-600 text-xs mb-1">Present</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    {stats.present}
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200">
                  <p className="text-red-600 text-xs mb-1">Absent</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">
                    {stats.absent}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
                  <p className="text-yellow-600 text-xs mb-1">Excused</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-700">
                    {stats.excused}
                  </p>
                </div>
              </div>

              {/* Attendance Records List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {attendances.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm sm:text-base mt-2">
                        No attendance records yet
                      </p>
                    </div>
                  ) : (
                    attendances.map((attendance) => (
                      <div
                        key={attendance.attendance_id}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded-full ${getStatusColor(
                                  attendance.attendance_status
                                )}`}
                              >
                                {attendance.attendance_status}
                              </span>
                              {attendance.practice_schedule && (
                                <span className="text-xs sm:text-sm text-gray-600">
                                  {formatDate(
                                    attendance.practice_schedule.practice_date
                                  )}
                                </span>
                              )}
                            </div>

                            {attendance.practice_schedule && (
                              <>
                                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                  {attendance.practice_schedule.venue}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {formatTime(
                                    attendance.practice_schedule.start_time
                                  )}{" "}
                                  -{" "}
                                  {formatTime(
                                    attendance.practice_schedule.end_time
                                  )}
                                </p>
                                {attendance.practice_schedule.coach && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                                    Coach:{" "}
                                    {attendance.practice_schedule.coach.first_name}{" "}
                                    {attendance.practice_schedule.coach.last_name}
                                  </p>
                                )}
                              </>
                            )}

                            {attendance.attendance_notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs sm:text-sm text-blue-800 break-words">
                                  <span className="font-semibold">Note:</span>{" "}
                                  {attendance.attendance_notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:ml-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  attendance.marked_at
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  attendance.marked_at
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteAttendance(attendance.attendance_id)
                              }
                              disabled={deletingId === attendance.attendance_id}
                              className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 px-3 py-1 sm:px-0 sm:py-0 bg-red-50 sm:bg-transparent rounded sm:rounded-none hover:bg-red-100 sm:hover:bg-transparent transition-colors"
                            >
                              {deletingId === attendance.attendance_id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default ViewAttendanceModal;