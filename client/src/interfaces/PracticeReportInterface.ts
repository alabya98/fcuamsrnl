// client/src/interfaces/PracticeReportInterface.ts

export interface PracticeReportFilters {
  start_date?: string;
  end_date?: string;
  sport?: string;
  coach_id?: number;
  venue?: string;
}

export interface PracticeSession {
  practice_schedule_id: number;
  coach_id: number;
  coach_name: string;
  sport: string;
  practice_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  total_players: number;
  athletes_present: number;
  athletes_absent: number;
  athletes_excused: number;
  athletes_late: number;
  attendance_rate: number;
  status: string;
  athletes: PracticeAthlete[];
}

export interface PracticeAthlete {
  athlete_id: number;
  athlete_name: string;
  attendance_status: 'Present' | 'Absent' | 'Excused' | 'Late';
  attendance_notes?: string;
}

export interface PracticeReportData {
  overall: {
    total_practices: number;
    completed_practices: number;
    pending_practices: number;
    approved_practices: number;
    total_athletes_involved: number;
    average_attendance_rate: number;
  };
  by_sport: {
    sport: string;
    total_practices: number;
    average_attendance: number;
    total_athletes: number;
  }[];
  by_coach: {
    coach_id: number;
    coach_name: string;
    sport: string;
    total_practices: number;
    average_attendance: number;
    athletes_coached: number;
  }[];
  by_venue: {
    venue: string;
    practice_count: number;
    sports: string[];
  }[];
  by_month: {
    month: string;
    month_name: string;
    total_practices: number;
    average_attendance: number;
  }[];
  practices: PracticeSession[];
}