import type { AthleteColumns } from "./AthleteInterface";
import type { PracticeScheduleColumns } from "./PracticeScheduleInterface";
import type { UserColumns } from "./UserInterface";

export interface AttendanceColumns {
  attendance_id: number;
  practice_schedule_id: number;
  athlete_id: number;
  practice_date: string;
  attendance_status: 'Present' | 'Absent' | 'Excused' | 'Late';
  attendance_notes?: string;
  marked_by: number;
  marked_at: string;
  is_submitted: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  athlete?: AthleteColumns;
  practice_schedule?: PracticeScheduleColumns;
  marked_by_user?: UserColumns;
}

export interface AttendanceStats {
  total_practices: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
  attendance_percentage: number;
}

export interface MarkAttendanceData {
  practice_schedule_id: number;
  attendances: {
    athlete_id: number;
    status: 'Present' | 'Absent' | 'Excused' | 'Late';
    notes?: string;
  }[];
  is_draft?: boolean;
}

export interface AthleteWithAttendance {
  athlete_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix_name?: string;
  school_id: string;
  position: string;
  sport: string;
  gender: any;
  attendance_status?: 'Present' | 'Absent' | 'Excused' | 'Late' | null;
  attendance_notes?: string;
  is_submitted?: boolean;
}

export interface AttendanceFieldErrors {
  practice_schedule_id?: string[];
  attendances?: string[];
  status?: string[];
  notes?: string[];
}