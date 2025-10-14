import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          id: string;
          name: string;
          upload_date: string;
          total_companies: number;
          companies_with_gmn: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          upload_date?: string;
          total_companies?: number;
          companies_with_gmn?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          upload_date?: string;
          total_companies?: number;
          companies_with_gmn?: number;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          session_id: string;
          company_name: string;
          city: string;
          state: string | null;
          category: string | null;
          has_gmn_profile: boolean;
          gmn_name: string | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          business_hours: Record<string, unknown> | null;
          rating: number | null;
          total_reviews: number | null;
          review_keywords: string[] | null;
          improvement_points: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          company_name: string;
          city: string;
          state?: string | null;
          category?: string | null;
          has_gmn_profile?: boolean;
          gmn_name?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          business_hours?: Record<string, unknown> | null;
          rating?: number | null;
          total_reviews?: number | null;
          review_keywords?: string[] | null;
          improvement_points?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          company_name?: string;
          city?: string;
          state?: string | null;
          category?: string | null;
          has_gmn_profile?: boolean;
          gmn_name?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          business_hours?: Record<string, unknown> | null;
          rating?: number | null;
          total_reviews?: number | null;
          review_keywords?: string[] | null;
          improvement_points?: string[] | null;
          created_at?: string;
        };
      };
    };
  };
};
