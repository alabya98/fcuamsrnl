import AxiosInstance from "./AxiosInstance";

const AnnouncementService = {
  loadAnnouncements: async () => {
    try {
      const response = await AxiosInstance.get("/announcement/loadAnnouncements");
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeAnnouncement: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/announcement/storeAnnouncement", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateAnnouncement: async (announcementId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/announcement/updateAnnouncement/${announcementId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyAnnouncement: async (announcementId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/announcement/destroyAnnouncement/${announcementId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AnnouncementService;