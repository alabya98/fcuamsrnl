import AxiosInstance from "./AxiosInstance";

const EventService = {
  loadEvents: async () => {
    try {
      const response = await AxiosInstance.get("/event/loadEvents");
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAthletesForEvent: async (sport: string) => {
    try {
      const response = await AxiosInstance.get(`/event/athletes-for-event?sport=${sport}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getCoachesForEvent: async (sport: string) => {
    try {
      const response = await AxiosInstance.get(`/event/coaches-for-event?sport=${sport}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  storeEvent: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/event/storeEvent", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  storeEventWithParticipants: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/event/storeEventWithParticipants", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  updateEvent: async (eventId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/event/updateEvent/${eventId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  updateEventWithParticipants: async (eventId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/event/updateEventWithParticipants/${eventId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getEventParticipants: async (eventId: string | number) => {
    try {
      const response = await AxiosInstance.get(`/event/participants/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  destroyEvent: async (eventId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/event/destroyEvent/${eventId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default EventService;