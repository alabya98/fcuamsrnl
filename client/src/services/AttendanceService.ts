import AxiosInstance from "./AxiosInstance";
import type { MarkAttendanceData } from "../interfaces/AttendanceInterface";

const AttendanceService = {
  // Get attendance for a specific practice schedule
  getAttendanceByPractice: async (practiceScheduleId: number) => {
    try {
      const response = await AxiosInstance.get(`/attendance/practice/${practiceScheduleId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get eligible athletes for attendance marking
  getEligibleAthletes: async (practiceScheduleId: number) => {
    try {
      const response = await AxiosInstance.get(`/attendance/eligible-athletes/${practiceScheduleId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ✅ NEW: Check if attendance can be marked (time validation)
  checkAttendanceEligibility: async (practiceScheduleId: number) => {
    try {
      const response = await AxiosInstance.get(`/attendance/check-eligibility/${practiceScheduleId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark attendance for multiple athletes
  markAttendance: async (data: MarkAttendanceData & { is_draft?: boolean }) => {
    try {
      const response = await AxiosInstance.post("/attendance/mark", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk mark all present
  bulkMarkAllPresent: async (practiceScheduleId: number, isDraft: boolean = false) => {
    try {
      const response = await AxiosInstance.post("/attendance/bulk-mark-all-present", {
        practice_schedule_id: practiceScheduleId,
        is_draft: isDraft
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk mark all absent
  bulkMarkAllAbsent: async (practiceScheduleId: number, isDraft: boolean = false) => {
    try {
      const response = await AxiosInstance.post("/attendance/bulk-mark-all-absent", {
        practice_schedule_id: practiceScheduleId,
        is_draft: isDraft
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Copy from previous practice
  copyFromPreviousPractice: async (practiceScheduleId: number, isDraft: boolean = false) => {
    try {
      const response = await AxiosInstance.post("/attendance/copy-from-previous", {
        practice_schedule_id: practiceScheduleId,
        is_draft: isDraft
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get athlete's attendance history
  getAthleteAttendance: async (athleteId: number) => {
    try {
      const response = await AxiosInstance.get(`/attendance/athlete/${athleteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update single attendance record
  updateAttendance: async (
    attendanceId: number,
    data: { status: 'Present' | 'Absent' | 'Excused' | 'Late'; notes?: string }
  ) => {
    try {
      const response = await AxiosInstance.put(`/attendance/update/${attendanceId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete attendance record (Admin only)
  deleteAttendance: async (attendanceId: number) => {
    try {
      const response = await AxiosInstance.delete(`/attendance/delete/${attendanceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all attendance (Admin only)
  getAllAttendance: async () => {
    try {
      const response = await AxiosInstance.get("/attendance/all");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Recalculate all attendance percentages (Admin only)
  recalculateAllPercentages: async () => {
    try {
      const response = await AxiosInstance.post("/attendance/recalculate-all");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AttendanceService;