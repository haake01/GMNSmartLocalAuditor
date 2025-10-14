/*
  # Multi-Tenancy Infrastructure - GMN SmartLocal Auditor PRO v3.1

  ## Overview
  Implements multi-tenant architecture for white-label SaaS model.
  Each tenant (agency/reseller) gets isolated data and custom branding.

  ## New Tables

  ### `tenants`
  Main tenant registration and management
  - `id` (uuid, primary key) - Unique tenant identifier
  - `name` (text, not null) - Agency/company name
  - `slug` (text, unique, not null) - URL-safe identifier (e.g., "agencia-xyz")
  - `domain` (text, unique, nullable) - Custom domain (e.g., "auditor.agenciaxyz.com")
  - `status` (text, not null) - Status: 'active', 'suspended', 'trial', 'cancelled'
  - `subscription_plan` (text, not null) - Plan: 'free', 'starter', 'professional', 'enterprise'
  - `license_key` (text, unique, not null) - Unique license for activation
  - `max_users` (integer, default 5) - Maximum users allowed
  - `max_audits_per_month` (integer, default 50) - Audit quota
  - `features_enabled` (jsonb, default '{}') - Feature flags per tenant
  - `metadata` (jsonb, default '{}') - Additional tenant data
  - `trial_ends_at` (timestamptz, nullable) - Trial expiration date
  - `created_at` (timestamptz, default now()) - Registration timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### `tenant_users`
  Users belonging to tenants (multi-tenant access control)
  - `id` (uuid, primary key) - User identifier
  - `tenant_id` (uuid, foreign key → tenants) - Tenant association
  - `email` (text, not null) - User email
  - `role` (text, not null) - Role: 'owner', 'admin', 'member', 'viewer'
  - `permissions` (jsonb, default '{}') - Granular permissions
  - `is_active` (boolean, default true) - Account active status
  - `last_login` (timestamptz, nullable) - Last login timestamp
  - `created_at` (timestamptz, default now()) - User creation timestamp

  ### `tenant_branding`
  White-label customization per tenant
  - `id` (uuid, primary key) - Branding config identifier
  - `tenant_id` (uuid, foreign key → tenants, unique) - One branding per tenant
  - `logo_url` (text, nullable) - Custom logo URL
  - `primary_color` (text, default '#1A73E8') - Brand primary color
  - `secondary_color` (text, default '#00E676') - Brand secondary color
  - `accent_color` (text, default '#FF9100') - Brand accent color
  - `font_family` (text, default 'Inter') - Custom font
  - `company_name_override` (text, nullable) - Override "GMN" branding
  - `custom_css` (text, nullable) - Advanced CSS customization
  - `footer_text` (text, nullable) - Custom footer content
  - `support_email` (text, nullable) - Tenant support email
  - `support_phone` (text, nullable) - Tenant support phone
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Tenants can only access their own data
  - Users can only access their tenant's data
  - Owner/admin roles can manage tenant settings
  - Row-level isolation ensures complete data separation

  ## Indexes
  - tenant slug (unique, fast lookup)
  - tenant domain (unique, custom domain routing)
  - tenant_users email + tenant_id (composite, auth)
  - tenant_id on all related tables (foreign key performance)

  ## Important Notes
  1. Multi-tenancy is the foundation for white-label reseller model
  2. All existing tables will need tenant_id column added in Phase 2
  3. License keys are generated on signup for activation tracking
  4. Custom domains require DNS configuration (CNAME)
  5. Feature flags allow per-tenant functionality control
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text UNIQUE,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  subscription_plan text NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
  license_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  max_users integer DEFAULT 5 CHECK (max_users > 0),
  max_audits_per_month integer DEFAULT 50 CHECK (max_audits_per_month > 0),
  features_enabled jsonb DEFAULT '{
    "batch_audit": true,
    "competitive_comparison": true,
    "platform_presence": true,
    "ai_analysis": false,
    "white_label": false,
    "custom_domain": false,
    "api_access": false,
    "advanced_reports": false
  }'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tenant_users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions jsonb DEFAULT '{
    "create_audits": true,
    "view_audits": true,
    "export_reports": true,
    "manage_users": false,
    "manage_billing": false,
    "manage_branding": false
  }'::jsonb,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Create tenant_branding table
CREATE TABLE IF NOT EXISTS tenant_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#1A73E8',
  secondary_color text DEFAULT '#00E676',
  accent_color text DEFAULT '#FF9100',
  font_family text DEFAULT 'Inter',
  company_name_override text,
  custom_css text,
  footer_text text,
  support_email text,
  support_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_tenant_id ON tenant_branding(tenant_id);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
CREATE POLICY "Tenants can view own data"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can insert tenants"
  ON tenants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tenant owners can update own tenant"
  ON tenants FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tenant_users table
CREATE POLICY "Users can view own tenant members"
  ON tenant_users FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Admins can insert users to own tenant"
  ON tenant_users FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update users in own tenant"
  ON tenant_users FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete users in own tenant"
  ON tenant_users FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tenant_branding table
CREATE POLICY "Tenants can view own branding"
  ON tenant_branding FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Admins can insert branding for own tenant"
  ON tenant_branding FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update own tenant branding"
  ON tenant_branding FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_branding_updated_at
  BEFORE UPDATE ON tenant_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
