import AxiosInstance, { cachedGet } from "./AxiosInstance";

const DashboardService = {
  // Single call that replaces all 5 separate dashboard calls
  getAllDashboardData: () => cachedGet("/dashboard/all"),

  // Keep individual endpoints for any other pages that use them
  getDashboardStats: () => cachedGet("/dashboard/stats"),
  getUpcomingEvents: () => cachedGet("/dashboard/upcoming-events"),
  getRecentRecords: () => cachedGet("/dashboard/recent-records"),
  getAthleteRetention: () => cachedGet("/dashboard/athlete-retention"),
  getSportParticipation: () => cachedGet("/dashboard/sport-participation"),

  searchAthletes: async (query: string) => {
    try {
      const response = await AxiosInstance.get(
        `/dashboard/search-athletes?query=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  searchCoaches: async (query: string) => {
    try {
      const response = await AxiosInstance.get(
        `/dashboard/search-coaches?query=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default DashboardService;