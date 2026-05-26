import AxiosInstance from "./AxiosInstance";

const MedicalRecordService = {
  loadMedicalRecordsByAthlete: async (athleteId: string | number) => {
    try {
      const response = await AxiosInstance.get(`/medical-record/athlete/${athleteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  storeMedicalRecord: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/medical-record/storeMedicalRecord", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateMedicalRecord: async (medicalRecordId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/medical-record/updateMedicalRecord/${medicalRecordId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  destroyMedicalRecord: async (medicalRecordId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/medical-record/destroyMedicalRecord/${medicalRecordId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default MedicalRecordService;