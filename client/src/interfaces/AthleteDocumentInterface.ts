export interface AthleteDocumentColumns {
  document_id: number;
  athlete_id: number;
  document_type: 'Parent Consent' | 'Medical Record' | 'School ID' | 'Physical Exam' | 'Injury Report' | 'Medical Clearance';
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_size_formatted?: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  valid_until?: string;
  notes?: string;
  is_visible_to_admin: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
  is_valid?: boolean;
  days_until_expiry?: number;
}

export interface AthleteDocumentFieldErrors {
  athlete_id?: string[];
  document_type?: string[];
  file?: string[];
  notes?: string[];
}

export interface DocumentUploadData {
  athlete_id: number;
  document_type: string;
  file: File;
  notes?: string;
}

export interface DocumentStatusUpdate {
  status: 'Approved' | 'Rejected';
  rejection_reason?: string;
  valid_until?: string;
}