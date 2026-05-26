export interface CourseGrade {
  course_code: string;
  course_name: string;
    grade: number | 'INC' | 'DRP';  // ✅ Allow string values
  credits: number;
  teacher?: string;
  term?: string;
}

export interface AcademicRecordColumns {
  academic_record_id: number;
  athlete_id: number;
  semester_term: string;
  grade_image_path: string;
  courses: CourseGrade[];
  calculated_percentage: number;
  gwa_grade: number;
  total_units: number;
  status: 'pending' | 'approved' | 'rejected';
  verified_by: number | null;
  verification_date: string | null;
  verification_notes: string | null;
  upload_date: string;
  created_at: string;
  updated_at: string;
  verifier?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

export interface EligibilityReviewColumns {
  review_id: number;
  athlete_id: number;
  academic_record_id: number;
  previous_status: 'Eligible' | 'Under Review' | 'Ineligible';
  new_status: 'Eligible' | 'Under Review' | 'Ineligible';
  grade_percentage: number;
  review_reason: string | null;
  coach_decision: 'approved' | 'denied' | 'pending';
  coach_notes: string | null;
  reviewed_by: number | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradeCalculation {
  gwa: number;
  percentage: number;
  total_units: number;
  has_failed_course: boolean;
}