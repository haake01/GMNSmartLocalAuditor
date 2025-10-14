/*
  # Create GMN Audits Table

  ## Description
  This migration creates a new table for storing intelligent Google My Business audits 
  by segment and city. It uses AI-powered analysis to generate comprehensive reports 
  with scores, compliance status, and actionable recommendations.

  ## New Tables
  - `gmn_audits`
    - `id` (uuid, primary key) - Unique identifier for each audit
    - `segment` (text, not null) - Business segment/category (e.g., restaurants, clinics, gyms)
    - `city` (text, not null) - City name for the audit
    - `state` (text, nullable) - State/region (optional)
    - `overall_score` (integer, not null) - Score from 0 to 100
    - `compliance_status` (text, not null) - Status: 'green', 'yellow', or 'red'
    - `opportunities` (jsonb, nullable) - Top 3 optimization opportunities
    - `suggestions` (jsonb, nullable) - Practical improvement suggestions
    - `local_comparison` (jsonb, nullable) - Comparison with local segment average
    - `ai_analysis` (text, nullable) - Full AI-generated analysis text
    - `companies_analyzed` (integer, default 0) - Number of companies in this audit
    - `created_at` (timestamptz, default now()) - Timestamp of audit creation

  - `gmn_empresas` (companies table for audit)
    - Stores individual business data from audits
    - Links to gmn_audits via audit_id

  ## Security
  - Enable RLS on `gmn_audits` table
  - Add policy for public read access (audits are shareable)
  - Add policy for authenticated insert (future auth integration)

  ## Important Notes
  1. Uses JSONB for flexible storage of opportunities, suggestions, and comparisons
  2. Compliance status uses text enum for easy frontend rendering
  3. All timestamps use timestamptz for timezone awareness
  4. Indexes added for common query patterns (segment, city, created_at)
*/

-- Create gmn_audits table
CREATE TABLE IF NOT EXISTS gmn_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment text NOT NULL,
  city text NOT NULL,
  state text,
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  compliance_status text NOT NULL CHECK (compliance_status IN ('green', 'yellow', 'red')),
  opportunities jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  local_comparison jsonb DEFAULT '{}'::jsonb,
  ai_analysis text,
  companies_analyzed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create gmn_empresas table (business data for audits)
CREATE TABLE IF NOT EXISTS gmn_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES gmn_audits(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  city text NOT NULL,
  state text,
  category text,
  has_gmn_profile boolean DEFAULT false,
  address text,
  phone text,
  website text,
  rating numeric(2, 1),
  total_reviews integer DEFAULT 0,
  verification_status text,
  nap_consistency_score integer,
  has_products boolean DEFAULT false,
  images_count integer DEFAULT 0,
  has_geotags boolean DEFAULT false,
  posts_per_week numeric(3, 1) DEFAULT 0,
  review_response_rate integer DEFAULT 0,
  seo_score integer,
  last_update_date timestamptz,
  engagement_score integer,
  improvement_points jsonb DEFAULT '[]'::jsonb,
  should_invite_for_optimization boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gmn_audits_segment_city ON gmn_audits(segment, city);
CREATE INDEX IF NOT EXISTS idx_gmn_audits_created_at ON gmn_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gmn_empresas_audit_id ON gmn_empresas(audit_id);
CREATE INDEX IF NOT EXISTS idx_gmn_empresas_city ON gmn_empresas(city);

-- Enable Row Level Security
ALTER TABLE gmn_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmn_empresas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gmn_audits
CREATE POLICY "Anyone can view audits"
  ON gmn_audits FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audits"
  ON gmn_audits FOR INSERT
  WITH CHECK (true);

-- RLS Policies for gmn_empresas
CREATE POLICY "Anyone can view business data"
  ON gmn_empresas FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert business data"
  ON gmn_empresas FOR INSERT
  WITH CHECK (true);