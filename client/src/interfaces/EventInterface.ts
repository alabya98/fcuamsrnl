export interface EventColumns {
  event_id: number;
  created_by: number;
  creator_role: string;
  event_scope: 'System-wide' | 'Team';
  event_name: string;
  description: string;
  event_type: string;
  sport: string;
  event_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  venue: string;
  organizer?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'; 
  manual_status: 'Active' | 'Cancelled';  
  max_participants?: number;
  registration_deadline?: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  coaches?: CoachParticipant[];
  athletes?: AthleteParticipant[];
}

export interface CoachParticipant {
  coach_id: number;
  full_name: string;
  staff_id: string;
  position: string;
}

export interface AthleteParticipant {
  athlete_id: number;
  full_name: string;
  school_id: string;
  sport?: string;
}

export interface EventFieldErrors {
  event_name?: string[];
  description?: string[];
  event_type?: string[];
  sport?: string[];
  event_date?: string[];
  end_date?: string[];
  start_time?: string[];
  end_time?: string[];
  venue?: string[];
  organizer?: string[];
  status?: string[];
  max_participants?: string[];
  registration_deadline?: string[];
  notes?: string[];
}