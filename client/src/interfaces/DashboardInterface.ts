export interface DashboardStats {
  total_athletes: number;
  total_coaches: number;
  total_events: number;
  total_records: number;
  upcoming_events: number;
  active_sports: number;
  eligible_athletes: number;
  ineligible_athletes: number;
  active_athletes: number;
  inactive_athletes: number;
}

export interface UpcomingEvent {
  event_id: number;
  event_name: string;
  event_date: string;
  start_time: string;
  sport: string;
  venue: string;
  status: string;
}

export interface RecentRecord {
  record_id: number;
  event_name: string;
  athlete_name: string;
  achievement: string;
  competition_level: string;
  event_date: string;
}

export interface AthleteRetention {
  year: string;
  total: number;
}

export interface SportParticipation {
  sport: string;
  count: number;
}