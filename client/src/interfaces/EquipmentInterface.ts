import type { CoachColumns } from "./CoachInterface";

export interface EquipmentColumns {
  equipment_id: number;
  coach_id: number;
  sport: string;
  equipment_name: string;
  total_quantity: number;
  available_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  last_updated_by: number;
  notes?: string;
  is_request_printed: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;

  // Relationships
  coach?: CoachColumns;
  updater?: {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface EquipmentFieldErrors {
  coach_id?: string[];
  sport?: string[];
  equipment_name?: string[];
  total_quantity?: string[];
  available_quantity?: string[];
  damaged_quantity?: string[];
  lost_quantity?: string[];
  condition?: string[];
  notes?: string[];
}