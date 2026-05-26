export interface RecordColumns {
  record_id: number;
  created_by?: number;
  creator_role?: 'Admin' | 'Coach' | 'Athlete';
  athlete_id?: number;
  event_name: string;
  competition_level: string;
  sport: string;
  event_date: string;
  venue: string;
  achievement: string;
  athlete_name: string;
  coach_name?: string;
  category: 'Team' | 'Individual';
  record_type: string;
  points_score?: string;
  remarks?: string;
  year: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  athlete?: {
    athlete_id: number;
    first_name: string;
    last_name: string;
    school_id: string;
    sport: string;
  };
}

export interface RecordFieldErrors {
  athlete_id?: string[];
  event_name?: string[];
  competition_level?: string[];
  sport?: string[];
  event_date?: string[];
  venue?: string[];
  achievement?: string[];
  athlete_name?: string[];
  coach_name?: string[];
  category?: string[];
  record_type?: string[];
  points_score?: string[];
  remarks?: string[];
}