import AxiosInstance from "./AxiosInstance";

const AthleteService = {
  loadAthletes: async (sport?: string) => {
    try {
      const params = sport ? { sport } : {};
      const response = await AxiosInstance.get("/athlete/loadAthletes", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  getAthleteById: async (athleteId: number) => {
    try {
      const response = await AxiosInstance.get(`/athlete/getAthlete/${athleteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getMyStatus: async () => {
    try {
      const response = await AxiosInstance.get("/athlete/my-status"); // ✅ matches fixed route
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeAthlete: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/athlete/storeAthlete", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateAthlete: async (athleteId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/athlete/updateAthlete/${athleteId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyAthlete: async (athleteId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/athlete/destroyAthlete/${athleteId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  toggleAthleteStatus: async (athleteId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/athlete/toggleStatus/${athleteId}` // ✅ matches fixed route
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AthleteService;