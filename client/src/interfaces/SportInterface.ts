export interface SportColumns {
  sport_id: number;
  sport: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SportFieldErrors {
  sport?: string[];
}