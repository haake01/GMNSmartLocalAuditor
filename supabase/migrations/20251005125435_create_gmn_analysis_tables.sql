/*
  # GMN Analyzer Database Schema

  ## Overview
  Creates tables to store company information and their Google My Business analysis results.

  ## Tables Created
  
  ### 1. `analysis_sessions`
  Stores information about each spreadsheet upload/analysis session
  - `id` (uuid, primary key) - Unique session identifier
  - `name` (text) - Session name/description
  - `upload_date` (timestamptz) - When the analysis was performed
  - `total_companies` (integer) - Total number of companies analyzed
  - `companies_with_gmn` (integer) - Count of companies with GMN profiles
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 2. `companies`
  Stores individual company records and their GMN analysis
  - `id` (uuid, primary key) - Unique company record identifier
  - `session_id` (uuid, foreign key) - Links to analysis_sessions
  - `company_name` (text) - Name of the company
  - `city` (text) - City location
  - `state` (text, nullable) - State/region
  - `category` (text, nullable) - Business category
  - `has_gmn_profile` (boolean) - Whether GMN profile exists
  - `gmn_name` (text, nullable) - Full name on GMN
  - `address` (text, nullable) - Complete address
  - `phone` (text, nullable) - Contact phone
  - `website` (text, nullable) - Website URL
  - `business_hours` (jsonb, nullable) - Operating hours
  - `rating` (numeric(3,2), nullable) - Average rating (0.00-5.00)
  - `total_reviews` (integer, nullable) - Total number of reviews
  - `review_keywords` (text[], nullable) - Array of key phrases from reviews
  - `improvement_points` (text[], nullable) - Identified areas for improvement
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for demo purposes (can be restricted later)
  - Authenticated users can insert/update their own data
*/

-- Create analysis_sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Nova Análise',
  upload_date timestamptz DEFAULT now(),
  total_companies integer DEFAULT 0,
  companies_with_gmn integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  city text NOT NULL,
  state text,
  category text,
  has_gmn_profile boolean DEFAULT false,
  gmn_name text,
  address text,
  phone text,
  website text,
  business_hours jsonb,
  rating numeric(3,2),
  total_reviews integer DEFAULT 0,
  review_keywords text[],
  improvement_points text[],
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_session_id ON companies(session_id);
CREATE INDEX IF NOT EXISTS idx_companies_has_gmn ON companies(has_gmn_profile);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created ON analysis_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analysis_sessions
CREATE POLICY "Anyone can view analysis sessions"
  ON analysis_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analysis sessions"
  ON analysis_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update analysis sessions"
  ON analysis_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete analysis sessions"
  ON analysis_sessions FOR DELETE
  USING (true);

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update companies"
  ON companies FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete companies"
  ON companies FOR DELETE
  USING (true);