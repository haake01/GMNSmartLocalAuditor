/*
  # Create competitive comparisons table

  1. New Tables
    - `competitive_comparisons`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `leader_name` (text)
      - `city` (text)
      - `segment` (text)
      - `overall_gap` (numeric)
      - `comparison_data` (jsonb) - stores full comparison details
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `competitive_comparisons` table
    - Add policy for public read access (for history display)
*/

CREATE TABLE IF NOT EXISTS competitive_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  leader_name text NOT NULL,
  city text,
  segment text,
  overall_gap numeric,
  comparison_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitive_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comparisons"
  ON competitive_comparisons
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comparisons"
  ON competitive_comparisons
  FOR INSERT
  WITH CHECK (true);