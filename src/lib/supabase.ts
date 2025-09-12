import { createClient } from "@supabase/supabase-js";
import { cfg } from "./config";

export const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  full_name: string;
  role: 'Student' | 'Faculty' | 'Other';
  branch: string;
  class_year?: number;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  phone_e164: string;
  availability: boolean;
  created_at: string;
}

export interface EmergencyRequest {
  id: string;
  requester_name?: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  units_needed: number;
  hospital?: string;
  location?: string;
  contact_phone?: string;
  need_by?: string;
  status: 'open' | 'fulfilled' | 'cancelled';
  created_at: string;
}

// Blood Group Types
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export const USER_ROLES = ['Student', 'Faculty', 'Other'] as const;
export const REQUEST_STATUS = ['open', 'fulfilled', 'cancelled'] as const;