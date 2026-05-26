import type { CoachColumns } from "./CoachInterface";
import type { UserColumns } from "./UserInterface";

export interface PracticeScheduleColumns {
  practice_schedule_id: number;
  coach_id: number;
  coach?: CoachColumns;
  venue: string;
  practice_date: string;
  start_time: string;
  end_time: string;
  total_players: number;
  sport: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Completed' | 'Cancelled';
  attendance_status?: 'pending' | 'partial' | 'completed'; 
  admin_notes?: string;
  approved_by?: number;
  approvedBy?: UserColumns;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeScheduleFieldErrors {
  coach_id?: string[];
  venue?: string[];
  practice_date?: string[];
  start_time?: string[];
  end_time?: string[];
  total_players?: string[];
  sport?: string[];
  notes?: string[];
  status?: string[];
  admin_notes?: string[];
}