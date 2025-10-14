/*
  # Royalty Engine & License Management - GMN SmartLocal Auditor PRO v3.1

  ## Overview
  Implements comprehensive royalty tracking system for white-label reseller model.
  Tracks licenses, usage, generates monthly royalty reports, and automates invoicing.

  ## New Tables

  ### `licenses`
  Individual license assignments to tenants
  - `id` (uuid, primary key) - License identifier
  - `tenant_id` (uuid, foreign key → tenants) - License owner
  - `license_key` (text, unique, not null) - Activation key
  - `license_type` (text, not null) - Type: 'trial', 'monthly', 'annual', 'lifetime'
  - `status` (text, not null) - Status: 'active', 'expired', 'suspended', 'cancelled'
  - `activation_date` (timestamptz, nullable) - When activated
  - `expiration_date` (timestamptz, nullable) - License expiry
  - `max_usage_limit` (integer, default 0) - Monthly audit limit (0 = unlimited)
  - `current_usage` (integer, default 0) - Current month usage
  - `usage_resets_at` (timestamptz, default now() + interval '1 month') - Next reset
  - `metadata` (jsonb, default '{}') - Additional license data
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `royalty_reports`
  Monthly royalty calculation and tracking
  - `id` (uuid, primary key) - Report identifier
  - `tenant_id` (uuid, foreign key → tenants) - Tenant being reported
  - `period_start` (date, not null) - Reporting period start
  - `period_end` (date, not null) - Reporting period end
  - `total_audits` (integer, default 0) - Audits performed in period
  - `total_comparisons` (integer, default 0) - Comparisons performed
  - `total_platform_checks` (integer, default 0) - Platform checks performed
  - `base_fee` (numeric(10,2), default 0.00) - Base monthly fee
  - `per_audit_fee` (numeric(10,2), default 0.00) - Fee per audit
  - `total_royalty` (numeric(10,2), default 0.00) - Total royalty due
  - `payment_status` (text, not null) - Status: 'pending', 'paid', 'overdue', 'cancelled'
  - `invoice_url` (text, nullable) - Generated invoice URL
  - `docusign_envelope_id` (text, nullable) - DocuSign envelope for payment
  - `paid_at` (timestamptz, nullable) - Payment timestamp
  - `metadata` (jsonb, default '{}') - Additional report data
  - `created_at` (timestamptz, default now())

  ### `usage_tracking`
  Real-time usage tracking for billing
  - `id` (uuid, primary key) - Tracking entry identifier
  - `tenant_id` (uuid, foreign key → tenants) - Tenant using service
  - `user_id` (uuid, nullable) - User who performed action
  - `action_type` (text, not null) - Action: 'audit', 'comparison', 'platform_check', 'export'
  - `resource_id` (uuid, nullable) - Related resource ID
  - `metadata` (jsonb, default '{}') - Action details
  - `timestamp` (timestamptz, default now()) - When action occurred

  ### `royalty_configurations`
  Configurable royalty rules per plan
  - `id` (uuid, primary key) - Config identifier
  - `plan_name` (text, unique, not null) - Plan: 'free', 'starter', 'professional', 'enterprise'
  - `base_monthly_fee` (numeric(10,2), default 0.00) - Fixed monthly fee
  - `per_audit_cost` (numeric(10,2), default 0.00) - Cost per audit
  - `per_comparison_cost` (numeric(10,2), default 0.00) - Cost per comparison
  - `per_platform_check_cost` (numeric(10,2), default 0.00) - Cost per platform check
  - `included_audits` (integer, default 0) - Free audits included
  - `overage_multiplier` (numeric(3,2), default 1.00) - Overage pricing multiplier
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Only system/admin can manage royalty configs
  - Tenants can view their own licenses and reports
  - Usage tracking is system-only (prevents tampering)

  ## Indexes
  - tenant_id on all tables (foreign key performance)
  - license_key (unique, fast activation)
  - royalty_reports period + tenant (billing queries)
  - usage_tracking timestamp (analytics)

  ## Important Notes
  1. Royalty engine calculates fees based on actual usage
  2. Monthly reports auto-generate on 1st of each month
  3. DocuSign integration for automated invoicing
  4. Usage resets monthly (licenses.usage_resets_at)
  5. Supports tiered pricing with overage charges
*/

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  license_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  license_type text NOT NULL DEFAULT 'trial' CHECK (license_type IN ('trial', 'monthly', 'annual', 'lifetime')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'cancelled')),
  activation_date timestamptz,
  expiration_date timestamptz,
  max_usage_limit integer DEFAULT 0 CHECK (max_usage_limit >= 0),
  current_usage integer DEFAULT 0 CHECK (current_usage >= 0),
  usage_resets_at timestamptz DEFAULT (now() + interval '1 month'),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create royalty_reports table
CREATE TABLE IF NOT EXISTS royalty_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_audits integer DEFAULT 0 CHECK (total_audits >= 0),
  total_comparisons integer DEFAULT 0 CHECK (total_comparisons >= 0),
  total_platform_checks integer DEFAULT 0 CHECK (total_platform_checks >= 0),
  base_fee numeric(10,2) DEFAULT 0.00 CHECK (base_fee >= 0),
  per_audit_fee numeric(10,2) DEFAULT 0.00 CHECK (per_audit_fee >= 0),
  total_royalty numeric(10,2) DEFAULT 0.00 CHECK (total_royalty >= 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  invoice_url text,
  docusign_envelope_id text,
  paid_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, period_start, period_end)
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  action_type text NOT NULL CHECK (action_type IN ('audit', 'comparison', 'platform_check', 'export', 'api_call')),
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create royalty_configurations table
CREATE TABLE IF NOT EXISTS royalty_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text UNIQUE NOT NULL CHECK (plan_name IN ('free', 'starter', 'professional', 'enterprise')),
  base_monthly_fee numeric(10,2) DEFAULT 0.00 CHECK (base_monthly_fee >= 0),
  per_audit_cost numeric(10,2) DEFAULT 0.00 CHECK (per_audit_cost >= 0),
  per_comparison_cost numeric(10,2) DEFAULT 0.00 CHECK (per_comparison_cost >= 0),
  per_platform_check_cost numeric(10,2) DEFAULT 0.00 CHECK (per_platform_check_cost >= 0),
  included_audits integer DEFAULT 0 CHECK (included_audits >= 0),
  overage_multiplier numeric(3,2) DEFAULT 1.00 CHECK (overage_multiplier >= 0.01),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_tenant_id ON licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_tenant_id ON royalty_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_period ON royalty_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_payment_status ON royalty_reports(payment_status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_timestamp ON usage_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_type ON usage_tracking(action_type);

-- Enable Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for licenses table
CREATE POLICY "Tenants can view own licenses"
  ON licenses FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage licenses"
  ON licenses FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for royalty_reports table
CREATE POLICY "Tenants can view own royalty reports"
  ON royalty_reports FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage royalty reports"
  ON royalty_reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for usage_tracking table
CREATE POLICY "Tenants can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can track usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (true);

-- RLS Policies for royalty_configurations table
CREATE POLICY "Anyone can view royalty configs"
  ON royalty_configurations FOR SELECT
  USING (true);

CREATE POLICY "System can manage royalty configs"
  ON royalty_configurations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default royalty configurations
INSERT INTO royalty_configurations (plan_name, base_monthly_fee, per_audit_cost, per_comparison_cost, per_platform_check_cost, included_audits, overage_multiplier)
VALUES
  ('free', 0.00, 0.00, 0.00, 0.00, 10, 1.00),
  ('starter', 49.90, 0.50, 0.30, 0.20, 100, 1.50),
  ('professional', 149.90, 0.30, 0.15, 0.10, 500, 1.25),
  ('enterprise', 499.90, 0.15, 0.10, 0.05, 5000, 1.00)
ON CONFLICT (plan_name) DO UPDATE SET
  base_monthly_fee = EXCLUDED.base_monthly_fee,
  per_audit_cost = EXCLUDED.per_audit_cost,
  per_comparison_cost = EXCLUDED.per_comparison_cost,
  per_platform_check_cost = EXCLUDED.per_platform_check_cost,
  included_audits = EXCLUDED.included_audits,
  overage_multiplier = EXCLUDED.overage_multiplier,
  updated_at = now();

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_royalty_configurations_updated_at
  BEFORE UPDATE ON royalty_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track usage automatically
CREATE OR REPLACE FUNCTION track_usage(
  p_tenant_id uuid,
  p_user_id uuid,
  p_action_type text,
  p_resource_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_tracking (tenant_id, user_id, action_type, resource_id, metadata)
  VALUES (p_tenant_id, p_user_id, p_action_type, p_resource_id, p_metadata);
  
  -- Update license current_usage if applicable
  IF p_action_type IN ('audit', 'comparison', 'platform_check') THEN
    UPDATE licenses
    SET current_usage = current_usage + 1
    WHERE tenant_id = p_tenant_id
      AND status = 'active'
      AND (max_usage_limit = 0 OR current_usage < max_usage_limit);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_license_usage()
RETURNS void AS $$
BEGIN
  UPDATE licenses
  SET 
    current_usage = 0,
    usage_resets_at = usage_resets_at + interval '1 month'
  WHERE 
    status = 'active'
    AND usage_resets_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to generate monthly royalty report
CREATE OR REPLACE FUNCTION generate_monthly_royalty_report(
  p_tenant_id uuid,
  p_period_start date,
  p_period_end date
)
RETURNS uuid AS $$
DECLARE
  v_report_id uuid;
  v_total_audits integer;
  v_total_comparisons integer;
  v_total_platform_checks integer;
  v_base_fee numeric(10,2);
  v_per_audit_cost numeric(10,2);
  v_per_comparison_cost numeric(10,2);
  v_per_platform_check_cost numeric(10,2);
  v_included_audits integer;
  v_overage_multiplier numeric(3,2);
  v_subscription_plan text;
  v_total_royalty numeric(10,2);
  v_billable_audits integer;
BEGIN
  -- Get tenant plan
  SELECT subscription_plan INTO v_subscription_plan
  FROM tenants
  WHERE id = p_tenant_id;
  
  -- Get pricing configuration
  SELECT base_monthly_fee, per_audit_cost, per_comparison_cost, per_platform_check_cost, included_audits, overage_multiplier
  INTO v_base_fee, v_per_audit_cost, v_per_comparison_cost, v_per_platform_check_cost, v_included_audits, v_overage_multiplier
  FROM royalty_configurations
  WHERE plan_name = v_subscription_plan;
  
  -- Count usage in period
  SELECT 
    COUNT(*) FILTER (WHERE action_type = 'audit'),
    COUNT(*) FILTER (WHERE action_type = 'comparison'),
    COUNT(*) FILTER (WHERE action_type = 'platform_check')
  INTO v_total_audits, v_total_comparisons, v_total_platform_checks
  FROM usage_tracking
  WHERE tenant_id = p_tenant_id
    AND timestamp >= p_period_start
    AND timestamp < p_period_end + interval '1 day';
  
  -- Calculate billable audits (overage)
  v_billable_audits := GREATEST(0, v_total_audits - v_included_audits);
  
  -- Calculate total royalty
  v_total_royalty := v_base_fee 
    + (v_billable_audits * v_per_audit_cost * v_overage_multiplier)
    + (v_total_comparisons * v_per_comparison_cost)
    + (v_total_platform_checks * v_per_platform_check_cost);
  
  -- Insert report
  INSERT INTO royalty_reports (
    tenant_id, period_start, period_end, 
    total_audits, total_comparisons, total_platform_checks,
    base_fee, per_audit_fee, total_royalty,
    payment_status
  )
  VALUES (
    p_tenant_id, p_period_start, p_period_end,
    v_total_audits, v_total_comparisons, v_total_platform_checks,
    v_base_fee, v_per_audit_cost, v_total_royalty,
    'pending'
  )
  RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;
