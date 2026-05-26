export interface AnnouncementColumns {
  announcement_id: number;
  created_by?: number;
  creator_role?: 'Admin' | 'Coach' | 'Athlete';
  title: string;
  content: string;
  announcement_type: 'General' | 'Event' | 'Urgent' | 'Reminder';
  target_audience: 'All' | 'Athletes' | 'Coaches' | 'Staff';
  target_sport?: string;
  priority: 'Low' | 'Medium' | 'High';
  is_published: boolean;
  publish_date: string;
  expiry_date?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface AnnouncementFieldErrors {
  title?: string[];
  content?: string[];
  announcement_type?: string[];
  target_audience?: string[];
  target_sport?: string[];
  priority?: string[];
  publish_date?: string[];
  expiry_date?: string[];
}