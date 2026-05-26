export interface MedicalRecordColumns {
  medical_record_id: number;
  athlete_id: number;
  record_date: string;
  record_type: string;
  diagnosis: string;
  treatment: string;
  prescribed_medication?: string;
  doctor_name: string;
  hospital_clinic?: string;
  notes?: string;
  follow_up_date?: string;
  status: 'Active' | 'Resolved' | 'Ongoing';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordFieldErrors {
  athlete_id?: string[];
  record_date?: string[];
  record_type?: string[];
  diagnosis?: string[];
  treatment?: string[];
  prescribed_medication?: string[];
  doctor_name?: string[];
  hospital_clinic?: string[];
  notes?: string[];
  follow_up_date?: string[];
  status?: string[];
}

export interface AthleteWithMedicalRecords {
  athlete_id: number;
  school_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  sport: string;
  department: string;
  medical_records: MedicalRecordColumns[];
}