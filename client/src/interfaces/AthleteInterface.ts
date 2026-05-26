import type { GenderColumns } from "./GenderInterface";
import type { CoachColumns } from "./CoachInterface";
import type { UserColumns } from "./UserInterface";

export interface AthleteColumns {
  athlete_id: number;
  user_id: number;
  school_id: string;
  email?: string | null;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix_name?: string;
  gender: GenderColumns;
  birth_date: string;
  age: string | number;
  sport: string;
  position: string;
  department: string;
  valid_id: string;
  parent_consent: string;
  academic_status: 'Eligible' | 'Under Review' | 'Ineligible';
  current_grade_percentage: number | null;
  last_grade_upload_date: string | null;
  grace_period_start_date: string | null;
  grace_period_end_date: string | null;
  coach_review_notes: string | null;
  reviewed_by: number | null;
  review_date: string | null;
  attendance_percentage: number;

  athlete_status: 'active' | 'inactive';
  consecutive_absences: number;
  inactive_since: string | null;
  status_changed_by: number | null;

  coach_id?: number;
  coach?: CoachColumns;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;

  has_parent_consent_file?: boolean;
  has_valid_id_file?: boolean;
  medical_documents_count?: number;

  // ✅ Profile photo — optional, populated when the athlete has uploaded one
  profile_photo?: string | null;

  user?: UserColumns;
  reviewer?: UserColumns;
  status_changer?: UserColumns;
}

export interface AthleteFieldErrors {
  school_id?: string[];
  email?: string[];
  first_name?: string[];
  middle_name?: string[];
  last_name?: string[];
  suffix_name?: string[];
  gender?: string[];
  birth_date?: string[];
  sport?: string[];
  position?: string[];
  department?: string[];
  valid_id?: string[];
  parent_consent?: string[];
  academic_status?: string[];
  coach_id?: string[];
}