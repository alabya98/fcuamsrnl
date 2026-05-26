// client/src/services/ReportService.ts

import AxiosInstance from "./AxiosInstance";
import type { ReportFilters } from "../interfaces/ReportInterface";

const ReportService = {
  // Athlete Demographics Report
  getAthleteDemographicsReport: async (filters: ReportFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);

      const response = await AxiosInstance.get(`/report/athlete-demographics?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Attendance Analytics Report
  getAttendanceAnalyticsReport: async (filters: ReportFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.sport) params.append('sport', filters.sport);

      const response = await AxiosInstance.get(`/report/attendance-analytics?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Event Participation Report
  getEventParticipationReport: async (filters: ReportFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.sport) params.append('sport', filters.sport);

      const response = await AxiosInstance.get(`/report/event-participation?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Game Report Methods
  getGameReport: async (filters: any) => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.venue) params.append('venue', filters.venue);
      if (filters.team) params.append('team', filters.team);

      const response = await AxiosInstance.get(`/game-report/data?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  exportGameReportPDF: async (queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/game-report/export-pdf?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  exportGameReportExcel: async (queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/game-report/export-excel?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Practice Report Methods
  getPracticeReport: async (filters: any) => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.coach_id) params.append('coach_id', filters.coach_id);
      if (filters.venue) params.append('venue', filters.venue);

      const response = await AxiosInstance.get(`/practice-report/data?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  exportPracticeReportPDF: async (queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/practice-report/export-pdf?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  exportPracticeReportExcel: async (queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/practice-report/export-excel?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Available Options
  getAvailableSports: async () => {
    try {
      const response = await AxiosInstance.get('/report/available-sports');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAvailableAthletes: async (sport?: string) => {
    try {
      const params = sport ? `?sport=${sport}` : '';
      const response = await AxiosInstance.get(`/report/available-athletes${params}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAvailableCoaches: async (sport?: string) => {
    try {
      const params = sport ? `?sport=${sport}` : '';
      const response = await AxiosInstance.get(`/practice-report/available-coaches${params}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export Legacy Reports (for existing reports)
  exportReportPDF: async (reportType: string, queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/report/export-pdf/${reportType}?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  exportReportExcel: async (reportType: string, queryString: string) => {
    try {
      const response = await AxiosInstance.get(
        `/report/export-excel/${reportType}?${queryString}`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default ReportService;