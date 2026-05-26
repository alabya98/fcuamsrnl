import AxiosInstance from "./AxiosInstance";

const EquipmentService = {
  loadEquipment: async () => {
    try {
      const response = await AxiosInstance.get("/equipment/loadEquipment");
      return response;
    } catch (error) {
      throw error;
    }
  },
  getEquipmentById: async (equipmentId: number) => {
    try {
      const response = await AxiosInstance.get(`/equipment/getEquipment/${equipmentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeEquipment: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/equipment/storeEquipment", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateEquipment: async (equipmentId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/equipment/updateEquipment/${equipmentId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyEquipment: async (equipmentId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/equipment/destroyEquipment/${equipmentId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default EquipmentService;