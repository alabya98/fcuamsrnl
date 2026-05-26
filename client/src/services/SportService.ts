import AxiosInstance from "./AxiosInstance";

const SportService = {
  loadSports: async () => {
    try {
      const response = await AxiosInstance.get("/sport/loadSports");
      return response;
    } catch (error) {
      throw error;
    }
  },
  getSport: async (sportId: string | number) => {
    try {
      const response = await AxiosInstance.get(`/sport/getSport/${sportId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeSport: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/sport/storeSport", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateSport: async (sportId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/sport/updateSport/${sportId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroySport: async (sportId: string | number) => {
    try {
      const response = await AxiosInstance.put(`/sport/destroySport/${sportId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default SportService;