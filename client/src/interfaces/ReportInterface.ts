
export interface AthleteDemographicsReport {
  overall: {
    total_athletes: number;
    male_count: number;
    female_count: number;
    eligible_count: number;
    ineligible_count: number;
    with_coach: number;
    without_coach: number;
    with_medical_records: number;
    with_achievements: number;
    without_achievements: number;
  };
  by_department: DepartmentStats[];
  by_sport: SportDemographics[];
  by_gender: GenderStats[];
  by_academic_status: AcademicStatusStats[];
  age_distribution: AgeDistribution[];
  coach_assignment: CoachAssignmentStats[];
  by_coach: CoachStats[];
  health_overview: HealthStats[];
  achievement_overview: AchievementStats[];
  enrollment_trends: EnrollmentTrend[];
}

export interface DepartmentStats {
  department: string;
  count: number;
  male: number;
  female: number;
}

export interface SportDemographics {
  sport: string;
  count: number;
  male: number;
  female: number;
  eligible: number;
  ineligible: number;
}

export interface GenderStats {
  gender: string;
  count: number;
  percentage: number;
}

export interface AcademicStatusStats {
  status: string;
  count: number;
  percentage: number;
}

export interface AgeDistribution {
  age_range: string;
  count: number;
}

export interface CoachAssignmentStats {
  status: string;
  count: number;
  percentage: number;
}

export interface CoachStats {
  coach_name: string;
  sport: string;
  count: number;
}

export interface HealthStats {
  status: string;
  count: number;
  percentage: number;
}

export interface AchievementStats {
  status: string;
  count: number;
  percentage: number;
}

export interface EnrollmentTrend {
  year: string;
  count: number;
}

export interface AttendanceAnalyticsReport {
  overall: {
    total_records: number;
    present: number;
    absent: number;
    excused: number;
    late: number;
    attendance_rate: number;
  };
  by_sport: SportAttendance[];
  by_month: MonthlyAttendance[];
}

export interface SportAttendance {
  sport: string;
  total_athletes: number;
  total_records: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
  attendance_rate: number;
}

export interface MonthlyAttendance {
  month: string;
  total: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
  rate: number;
}

export interface EventParticipationReport {
  overall: {
    total_events: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    total_records: number;
    unique_participants: number;
    avg_participants_per_event: number;
  };
  events: EventDetail[];
  by_sport: { sport: string; count: number }[];
  by_month: MonthlyEventStats[];
  by_type: { type: string; count: number }[];
  top_athletes: TopAthlete[];
  achievement_distribution: { achievement: string; count: number }[];
}

export interface EventDetail {
  event_id: number;
  event_name: string;
  description: string;
  event_type: string;
  sport: string;
  event_date: string;
  venue: string;
  status: string;
  organizer: string | null;
  max_participants: number | null;
  participant_count: number;
  total_records: number;
  participants: EventParticipant[];
  creator: {
    name: string;
    role: string;
  } | null;
}

export interface EventParticipant {
  athlete_name: string;
  achievement: string;
  competition_level: string;
  record_type: string;
}

export interface MonthlyEventStats {
  month: string;
  month_name: string;
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
}

export interface TopAthlete {
  athlete_name: string;
  sport: string;
  total_records: number;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  sport?: string;
}