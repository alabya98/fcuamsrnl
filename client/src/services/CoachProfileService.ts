import AxiosInstance, { cachedGet } from "./AxiosInstance";

const CoachProfileService = {
  // Single call that replaces all 4 separate coach dashboard calls
  getAllDashboardData: () => cachedGet("/coach-profile/all"),

  // Keep individual endpoints for other pages that use them
  getMyProfile: async () => {
    try {
      const response = await AxiosInstance.get("/coach-profile/my-profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyAthletes: async () => {
    try {
      const response = await AxiosInstance.get("/coach-profile/my-athletes");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyPracticeSchedules: async () => {
    try {
      const response = await AxiosInstance.get("/coach-profile/my-practice-schedules");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUpcomingEvents: async () => {
    try {
      const response = await AxiosInstance.get("/coach-profile/upcoming-events");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await AxiosInstance.get("/coach-profile/dashboard-stats");
      return response;
    } catch (error) {
      throw error;
      ''
    }
  },
};

export default CoachProfileService;