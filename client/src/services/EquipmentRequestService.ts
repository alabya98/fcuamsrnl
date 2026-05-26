import AxiosInstance from "./AxiosInstance";

const EquipmentRequestService = {
  loadRequests: async () => {
    try {
      const response = await AxiosInstance.get("/equipment-request/loadRequests");
      return response;
    } catch (error) {
      throw error;
    }
  },

  storeRequest: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/equipment-request/storeRequest", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  approveRequest: async (requestId: number, data: { admin_notes?: string }) => {
    try {
      const response = await AxiosInstance.put(
        `/equipment-request/approveRequest/${requestId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  rejectRequest: async (requestId: number, data: { admin_notes: string }) => {
    try {
      const response = await AxiosInstance.put(
        `/equipment-request/rejectRequest/${requestId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  markAsPrinted: async (requestIds: number[]) => {
    try {
      const response = await AxiosInstance.post("/equipment-request/markAsPrinted", {
        request_ids: requestIds,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default EquipmentRequestService;