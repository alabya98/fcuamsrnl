import AxiosInstance from "./AxiosInstance";

const PracticeScheduleService = {
  loadPracticeSchedules: async () => {
    try {
      const response = await AxiosInstance.get("/practice-schedule/loadPracticeSchedules");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  storePracticeSchedule: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/practice-schedule/storePracticeSchedule", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  updatePracticeSchedule: async (practiceScheduleId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/practice-schedule/updatePracticeSchedule/${practiceScheduleId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  destroyPracticeSchedule: async (practiceScheduleId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/practice-schedule/destroyPracticeSchedule/${practiceScheduleId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  approvePracticeSchedule: async (practiceScheduleId: string | number, data: { admin_notes?: string }) => {
    try {
      const response = await AxiosInstance.put(
        `/practice-schedule/approvePracticeSchedule/${practiceScheduleId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  declinePracticeSchedule: async (practiceScheduleId: string | number, data: { admin_notes: string }) => {
    try {
      const response = await AxiosInstance.put(
        `/practice-schedule/declinePracticeSchedule/${practiceScheduleId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default PracticeScheduleService;