import AxiosInstance from "./AxiosInstance";
import type { DocumentUploadData, DocumentStatusUpdate } from "../interfaces/AthleteDocumentInterface";

const AthleteDocumentService = {
  getAthleteDocuments: async (athleteId: number) => {
    try {
      const response = await AxiosInstance.get(`/athlete-documents/athlete/${athleteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  uploadDocument: async (data: DocumentUploadData) => {
    try {
      const formData = new FormData();
      formData.append('athlete_id', data.athlete_id.toString());
      formData.append('document_type', data.document_type);
      formData.append('file', data.file);
      if (data.notes) {
        formData.append('notes', data.notes);
      }

      const response = await AxiosInstance.post('/athlete-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  downloadDocument: async (documentId: number) => {
    try {
      const response = await AxiosInstance.get(`/athlete-documents/download/${documentId}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateDocumentStatus: async (documentId: number, data: DocumentStatusUpdate) => {
    try {
      const response = await AxiosInstance.put(`/athlete-documents/status/${documentId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteDocument: async (documentId: number) => {
    try {
      const response = await AxiosInstance.delete(`/athlete-documents/delete/${documentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AthleteDocumentService;