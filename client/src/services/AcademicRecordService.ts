import AxiosInstance from "./AxiosInstance";

const AcademicRecordService = {
  uploadGrades: async (data: FormData) => {
    try {
      const response = await AxiosInstance.post("/academic-records/upload-grades", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAthleteAcademicRecords: async (athleteId: number) => {
    try {
      const response = await AxiosInstance.get(`/academic-records/athlete/${athleteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  downloadGradeImage: async (academicRecordId: number) => {
    try {
      const response = await AxiosInstance.get(
        `/academic-records/download-image/${academicRecordId}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  approveRecord: async (academicRecordId: number) => {
    try {
      const response = await AxiosInstance.post(`/academic-records/approve/${academicRecordId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  rejectRecord: async (academicRecordId: number, notes: string) => {
    try {
      const response = await AxiosInstance.post(`/academic-records/reject/${academicRecordId}`, { notes });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAthletesNeedingReview: async () => {
    try {
      const response = await AxiosInstance.get("/academic-records/athletes-needing-review");
      return response;
    } catch (error) {
      throw error;
    }
  },

  reviewEligibility: async (athleteId: number, data: { decision: 'approved' | 'denied', notes?: string }) => {
    try {
      const response = await AxiosInstance.post(`/academic-records/review-eligibility/${athleteId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  expireGracePeriods: async () => {
    try {
      const response = await AxiosInstance.post("/academic-records/expire-grace-periods");
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default AcademicRecordService;