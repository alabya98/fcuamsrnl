import AxiosInstance, { cachedGet } from "./AxiosInstance";

const AthleteProfileService = {
  // Single call that replaces all separate athlete dashboard calls
  getAllDashboardData: () => cachedGet("/athlete-profile/all"),

  // Keep individual endpoints for other pages that use them
  getMyProfile: async () => {
    try {
      const response = await AxiosInstance.get("/athlete-profile/my-profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyMedicalRecords: async () => {
    try {
      const response = await AxiosInstance.get("/athlete-profile/my-medical-records");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyPracticeSchedules: async () => {
    try {
      const response = await AxiosInstance.get("/athlete-profile/my-practice-schedules");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyRecords: async () => {
    try {
      const response = await AxiosInstance.get("/athlete-profile/my-records");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AthleteProfileService;