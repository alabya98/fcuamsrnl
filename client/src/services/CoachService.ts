import AxiosInstance from "./AxiosInstance";

const CoachService = {
  loadCoaches: async (sport?: string) => {
    try {
      const params = sport ? { sport } : {};
      const response = await AxiosInstance.get("/coach/loadCoaches", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeCoach: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/coach/storeCoach", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateCoach: async (coachId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/coach/updateCoach/${coachId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyCoach: async (coachId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/coach/destroyCoach/${coachId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  // ✅ Get athletes by coach ID
  getCoachAthletes: async (coachId: string | number) => {
    try {
      const response = await AxiosInstance.get(
        `/coach/getCoachAthletes/${coachId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default CoachService;