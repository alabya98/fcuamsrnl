export interface EquipmentRequestColumns {
  request_id: number;
  coach_id: number;
  sport: string;
  equipment_name: string;
  quantity_requested: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  is_printed: boolean;
  printed_at?: string;
  printed_by?: number;
  print_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;

  // Relationships
  coach?: {
    coach_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    sport: string;
  };
  reviewer?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
  printer?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

export interface EquipmentRequestFieldErrors {
  coach_id?: string[];
  sport?: string[];
  equipment_name?: string[];
  quantity_requested?: string[];
  reason?: string[];
}