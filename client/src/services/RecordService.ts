import AxiosInstance from "./AxiosInstance";

const RecordService = {
  loadRecords: async () => {
    try {
      const response = await AxiosInstance.get("/record/loadRecords");
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeRecord: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/record/storeRecord", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateRecord: async (recordId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/record/updateRecord/${recordId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyRecord: async (recordId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/record/destroyRecord/${recordId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default RecordService;