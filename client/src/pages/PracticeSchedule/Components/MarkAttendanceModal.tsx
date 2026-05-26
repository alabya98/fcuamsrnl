import { useState, useEffect } from "react";
import Modal from "../../../components/Modal/index";
import AttendanceService from "../../../services/AttendanceService";
import type { PracticeScheduleColumns } from "../../../interfaces/PracticeScheduleInterface";
import type { AthleteWithAttendance } from "../../../interfaces/AttendanceInterface";

interface MarkAttendanceModalProps {
  practiceSchedule: PracticeScheduleColumns | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const MarkAttendanceModal = ({
  practiceSchedule,
  isOpen,
  onClose,
  onSuccess,
}: MarkAttendanceModalProps) => {
  const [athletes, setAthletes] = useState<AthleteWithAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  // ✅ NEW: Time validation states
  const [timeValidation, setTimeValidation] = useState<{
    canMark: boolean;
    timeStatus: string;
    message: string;
    checking: boolean;
  }>({
    canMark: true,
    timeStatus: '',
    message: '',
    checking: false
  });

  const [attendanceData, setAttendanceData] = useState <
    Record<number, { status: "Present" | "Absent" | "Excused" | "Late"; notes: string }>
  >({});

  useEffect(() => {
    if (isOpen && practiceSchedule) {
      checkTimeEligibility();
      loadEligibleAthletes();
    } else {
      // Reset state when modal closes
      setAthletes([]);
      setAttendanceData({});
      setErrors({});
      setTimeValidation({
        canMark: true,
        timeStatus: '',
        message: '',
        checking: false
      });
    }
  }, [isOpen, practiceSchedule]);

  // ✅ NEW: Check if attendance can be marked based on time
  const checkTimeEligibility = async () => {
    if (!practiceSchedule) return;

    try {
      setTimeValidation(prev => ({ ...prev, checking: true }));
      const response = await AttendanceService.checkAttendanceEligibility(
        practiceSchedule.practice_schedule_id
      );

      if (response.status === 200) {
        setTimeValidation({
          canMark: response.data.can_mark,
          timeStatus: response.data.time_status,
          message: response.data.message,
          checking: false
        });
      }
    } catch (error) {
      console.error("Error checking time eligibility:", error);
      setTimeValidation(prev => ({ ...prev, checking: false }));
    }
  };

  const loadEligibleAthletes = async () => {
    if (!practiceSchedule) return;

    try {
      setLoading(true);
      const response = await AttendanceService.getEligibleAthletes(
        practiceSchedule.practice_schedule_id
      );

      if (response.status === 200) {
        const athletesList = response.data.athletes;
        setAthletes(athletesList);

        const initialData: Record <
          number,
          { status: "Present" | "Absent" | "Excused" | "Late"; notes: string }
        > = {};

        athletesList.forEach((athlete: AthleteWithAttendance) => {
          if (athlete.attendance_status) {
            initialData[athlete.athlete_id] = {
              status: athlete.attendance_status as "Present" | "Absent" | "Excused" | "Late",
              notes: athlete.attendance_notes || "",
            };
          } else {
            initialData[athlete.athlete_id] = {
              status: "Present",
              notes: "",
            };
          }
        });

        setAttendanceData(initialData);
      }
    } catch (error) {
      console.error("Error loading athletes:", error);
      onSuccess("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    athleteId: number,
    status: "Present" | "Absent" | "Excused" | "Late"
  ) => {
    setAttendanceData((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status,
      },
    }));
  };

  const handleNotesChange = (athleteId: number, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        notes,
      },
    }));
  };

  const handleMarkAllPresent = async () => {
    if (!practiceSchedule || !timeValidation.canMark) return;
    
    setBulkLoading(true);
    try {
      const response = await AttendanceService.bulkMarkAllPresent(
        practiceSchedule.practice_schedule_id,
        false
      );
      
      if (response.status === 200) {
        onSuccess(response.data.message);
        onClose();
      }
    } catch (error: any) {
      onSuccess(error.response?.data?.message || "Failed to mark all present");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMarkAllAbsent = async () => {
    if (!practiceSchedule || !timeValidation.canMark) return;
    
    setBulkLoading(true);
    try {
      const response = await AttendanceService.bulkMarkAllAbsent(
        practiceSchedule.practice_schedule_id,
        false
      );
      
      if (response.status === 200) {
        onSuccess(response.data.message);
        onClose();
      }
    } catch (error: any) {
      onSuccess(error.response?.data?.message || "Failed to mark all absent");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCopyFromPrevious = async () => {
    if (!practiceSchedule || !timeValidation.canMark) return;
    
    setBulkLoading(true);
    try {
      const response = await AttendanceService.copyFromPreviousPractice(
        practiceSchedule.practice_schedule_id,
        false
      );
      
      if (response.status === 200) {
        onSuccess(response.data.message);
        onClose();
      }
    } catch (error: any) {
      onSuccess(error.response?.data?.message || "Failed to copy from previous practice");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    // ✅ NEW: Prevent submission if time validation fails
    if (!timeValidation.canMark && !isDraft) {
      onSuccess(timeValidation.message);
      return;
    }

    setSubmitting(true);
    setErrors({});

    if (!practiceSchedule) return;

    try {
      const attendances = Object.entries(attendanceData).map(
        ([athleteId, data]) => {
          const attendance: any = {
            athlete_id: parseInt(athleteId),
            status: data.status,
          };

          if (data.notes && data.notes.trim() !== "") {
            attendance.notes = data.notes.trim();
          }

          return attendance;
        }
      );

      const response = await AttendanceService.markAttendance({
        practice_schedule_id: practiceSchedule.practice_schedule_id,
        attendances,
        is_draft: isDraft,
      });

      if (response.status === 200) {
        onSuccess(response.data.message || "Attendance marked successfully!");
        onClose();
      }
    } catch (error: any) {
      console.error("Attendance submission error:", error.response?.data);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        onSuccess(error.response?.data?.message || "Failed to mark attendance");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatAthleteFullName = (athlete: AthleteWithAttendance) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-500";
      case "Absent":
        return "bg-red-500";
      case "Excused":
        return "bg-yellow-500";
      case "Late":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusCount = (status: string) => {
    return Object.values(attendanceData).filter(
      (data) => data.status === status
    ).length;
  };

  const getAttendanceStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const colors = {
      pending: "bg-gray-100 text-gray-700 border-gray-300",
      partial: "bg-yellow-100 text-yellow-700 border-yellow-300",
      completed: "bg-green-100 text-green-700 border-green-300",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ✅ NEW: Get time warning alert component
  const getTimeWarningAlert = () => {
    if (timeValidation.checking) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 text-sm font-medium">Checking time eligibility...</p>
          </div>
        </div>
      );
    }

    if (!timeValidation.canMark) {
      const isEarly = timeValidation.timeStatus === 'too_early';
      const bgColor = isEarly ? 'bg-yellow-50' : 'bg-red-50';
      const borderColor = isEarly ? 'border-yellow-300' : 'border-red-300';
      const textColor = isEarly ? 'text-yellow-800' : 'text-red-800';
      const icon = isEarly ? '⏰' : '⚠️';

      return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-3 mb-3`}>
          <div className="flex items-start gap-2">
            <span className="text-xl">{icon}</span>
            <div className="flex-1">
              <p className={`${textColor} text-sm font-bold mb-1`}>
                {isEarly ? 'Too Early to Mark Attendance' : 'Too Late to Mark Attendance'}
              </p>
              <p className={`${textColor} text-xs`}>
                {timeValidation.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (timeValidation.timeStatus === 'upcoming' || timeValidation.timeStatus === 'ongoing_or_recent') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="text-green-800 text-sm font-bold mb-1">Ready to Mark Attendance</p>
              <p className="text-green-700 text-xs">{timeValidation.message}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <div className="flex flex-col h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)]">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Mark Attendance
            </h2>
            {practiceSchedule?.attendance_status && (
              getAttendanceStatusBadge(practiceSchedule.attendance_status)
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {practiceSchedule && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Practice Date
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(
                      practiceSchedule.practice_date
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Venue</p>
                  <p className="font-semibold text-gray-800">
                    {practiceSchedule.venue}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Time</p>
                  <p className="font-semibold text-gray-800">
                    {practiceSchedule.start_time?.substring(0, 5)} -{" "}
                    {practiceSchedule.end_time?.substring(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Sport</p>
                  <p className="font-semibold text-gray-800">
                    {practiceSchedule.sport}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Time Warning Alert */}
          {getTimeWarningAlert()}

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <p className="text-xs text-green-600 mb-0.5">Present</p>
              <p className="text-xl font-bold text-green-700">
                {getStatusCount("Present")}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-200">
              <p className="text-xs text-red-600 mb-0.5">Absent</p>
              <p className="text-xl font-bold text-red-700">
                {getStatusCount("Absent")}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs text-yellow-600 mb-0.5">Excused</p>
              <p className="text-xl font-bold text-yellow-700">
                {getStatusCount("Excused")}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
              <p className="text-xs text-orange-600 mb-0.5">Late</p>
              <p className="text-xl font-bold text-orange-700">
                {getStatusCount("Late")}
              </p>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mb-3 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                disabled={bulkLoading || submitting || !timeValidation.canMark}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? "Processing..." : "Mark All Present"}
              </button>
              <button
                type="button"
                onClick={handleMarkAllAbsent}
                disabled={bulkLoading || submitting || !timeValidation.canMark}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? "Processing..." : "Mark All Absent"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyFromPrevious}
              disabled={bulkLoading || submitting || !timeValidation.canMark}
              className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {bulkLoading ? "Copying..." : "Copy from Previous Practice"}
            </button>
          </div>

          {errors.attendances && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
              <p className="text-red-800 text-xs">{errors.attendances[0]}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {athletes.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">
                  No athletes found for this sport
                </p>
              ) : (
                athletes.map((athlete) => (
                  <div
                    key={athlete.athlete_id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {formatAthleteFullName(athlete)}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {athlete.school_id} • {athlete.position}
                        </p>
                        {athlete.attendance_status && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-blue-600">
                              Previously: {athlete.attendance_status}
                            </p>
                            {athlete.is_submitted && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                Submitted
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
attendanceData[athlete.athlete_id]?.status
)}`}
></div>
</div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {(["Present", "Absent", "Excused", "Late"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          handleStatusChange(athlete.athlete_id, status)
                        }
                        disabled={!timeValidation.canMark}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          attendanceData[athlete.athlete_id]?.status ===
                          status
                            ? status === "Present"
                              ? "bg-green-600 text-white"
                              : status === "Absent"
                              ? "bg-red-600 text-white"
                              : status === "Excused"
                              ? "bg-yellow-600 text-white"
                              : "bg-orange-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>

                <textarea
                  value={attendanceData[athlete.athlete_id]?.notes || ""}
                  onChange={(e) =>
                    handleNotesChange(athlete.athlete_id, e.target.value)
                  }
                  placeholder="Add notes (optional)"
                  disabled={!timeValidation.canMark}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {/* Footer with Draft and Submit */}
    <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2.5 space-y-2">
      {/* Draft and Submit Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={submitting || bulkLoading || athletes.length === 0}
          className="flex-1 px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Draft</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={submitting || bulkLoading || athletes.length === 0 || !timeValidation.canMark}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="hidden sm:inline">Submitting...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Submit Attendance</span>
              <span className="sm:hidden">Submit</span>
            </>
          )}
        </button>
      </div>
      
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        disabled={submitting || bulkLoading}
      >
        Cancel
      </button>
    </div>
  </div>
</Modal>
);
};
export default MarkAttendanceModal;