export interface CoachColumns {
  coach_id: number;
  user_id: number | null;
  staff_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix_name: string | null;
  position: string;
  sports_coached: string;
  sport?: string; // 
  contact_email: string;
  gender_id: number;
  birth_date: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user?: any;
  gender?: any;
  athletes_count?: number;
}

export interface CoachFieldErrors {
  staff_id?: string[];
  first_name?: string[];
  middle_name?: string[];
  last_name?: string[];
  suffix_name?: string[];
  position?: string[];
  sports_coached?: string[];
  contact_email?: string[];
  gender_id?: string[];
  birth_date?: string[];
}