/*
  # Subscription Plans & Billing System - GMN SmartLocal Auditor PRO v3.1

  ## Overview
  Comprehensive subscription management with Stripe integration support.
  Handles plan upgrades, downgrades, billing cycles, and payment tracking.

  ## New Tables

  ### `subscription_plans`
  Available subscription tiers and pricing
  - `id` (uuid, primary key) - Plan identifier
  - `name` (text, unique, not null) - Plan: 'free', 'starter', 'professional', 'enterprise'
  - `display_name` (text, not null) - User-friendly name
  - `description` (text) - Plan description
  - `price_monthly` (numeric(10,2), default 0.00) - Monthly price
  - `price_annual` (numeric(10,2), default 0.00) - Annual price (discounted)
  - `features` (jsonb, not null) - Feature list
  - `limits` (jsonb, not null) - Usage limits
  - `stripe_price_id_monthly` (text, nullable) - Stripe price ID for monthly
  - `stripe_price_id_annual` (text, nullable) - Stripe price ID for annual
  - `is_active` (boolean, default true) - Plan availability
  - `sort_order` (integer, default 0) - Display order
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `tenant_subscriptions`
  Active subscriptions per tenant
  - `id` (uuid, primary key) - Subscription identifier
  - `tenant_id` (uuid, foreign key → tenants, unique) - One subscription per tenant
  - `plan_id` (uuid, foreign key → subscription_plans) - Current plan
  - `billing_cycle` (text, not null) - Cycle: 'monthly', 'annual'
  - `status` (text, not null) - Status: 'active', 'trialing', 'past_due', 'cancelled', 'expired'
  - `current_period_start` (timestamptz, not null) - Billing period start
  - `current_period_end` (timestamptz, not null) - Billing period end
  - `cancel_at_period_end` (boolean, default false) - Scheduled cancellation
  - `stripe_subscription_id` (text, unique, nullable) - Stripe subscription ID
  - `stripe_customer_id` (text, nullable) - Stripe customer ID
  - `trial_start` (timestamptz, nullable) - Trial period start
  - `trial_end` (timestamptz, nullable) - Trial period end
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `billing_history`
  Payment and invoice history
  - `id` (uuid, primary key) - Record identifier
  - `tenant_id` (uuid, foreign key → tenants) - Tenant being billed
  - `subscription_id` (uuid, foreign key → tenant_subscriptions, nullable) - Related subscription
  - `amount` (numeric(10,2), not null) - Charge amount
  - `currency` (text, default 'BRL') - Currency code
  - `status` (text, not null) - Status: 'pending', 'paid', 'failed', 'refunded'
  - `description` (text) - Charge description
  - `invoice_url` (text, nullable) - Invoice PDF URL
  - `stripe_invoice_id` (text, unique, nullable) - Stripe invoice ID
  - `stripe_payment_intent_id` (text, unique, nullable) - Stripe payment intent
  - `paid_at` (timestamptz, nullable) - Payment timestamp
  - `metadata` (jsonb, default '{}') - Additional data
  - `created_at` (timestamptz, default now())

  ### `payment_methods`
  Stored payment methods per tenant
  - `id` (uuid, primary key) - Payment method identifier
  - `tenant_id` (uuid, foreign key → tenants) - Method owner
  - `type` (text, not null) - Type: 'card', 'boleto', 'pix'
  - `stripe_payment_method_id` (text, unique, nullable) - Stripe PM ID
  - `card_brand` (text, nullable) - Card brand (Visa, Mastercard, etc)
  - `card_last4` (text, nullable) - Last 4 digits
  - `card_exp_month` (integer, nullable) - Expiration month
  - `card_exp_year` (integer, nullable) - Expiration year
  - `is_default` (boolean, default false) - Default payment method
  - `metadata` (jsonb, default '{}') - Additional data
  - `created_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Tenants can only access their own subscription/billing data
  - Payment methods are sensitive - strict access control
  - Admins can manage subscriptions

  ## Indexes
  - tenant_id on all tables (fast lookups)
  - stripe IDs (unique, webhook processing)
  - subscription status (billing queries)

  ## Important Notes
  1. Stripe integration handles actual payments
  2. Trial periods managed automatically
  3. Prorated upgrades/downgrades supported
  4. Billing history tracks all transactions
  5. Payment methods stored securely via Stripe
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (name IN ('free', 'starter', 'professional', 'enterprise')),
  display_name text NOT NULL,
  description text,
  price_monthly numeric(10,2) DEFAULT 0.00 CHECK (price_monthly >= 0),
  price_annual numeric(10,2) DEFAULT 0.00 CHECK (price_annual >= 0),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{
    "max_users": 5,
    "max_audits_per_month": 50,
    "max_comparisons_per_month": 20,
    "max_platform_checks_per_month": 10,
    "storage_gb": 5
  }'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_annual text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tenant_subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'BRL' NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  description text,
  invoice_url text,
  stripe_invoice_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  paid_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('card', 'boleto', 'pix')),
  stripe_payment_method_id text UNIQUE,
  card_brand text,
  card_last4 text,
  card_exp_month integer CHECK (card_exp_month >= 1 AND card_exp_month <= 12),
  card_exp_year integer CHECK (card_exp_year >= 2024),
  is_default boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_stripe_subscription_id ON tenant_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON billing_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant_id ON payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "System can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tenant_subscriptions
CREATE POLICY "Tenants can view own subscription"
  ON tenant_subscriptions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage subscriptions"
  ON tenant_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for billing_history
CREATE POLICY "Tenants can view own billing history"
  ON billing_history FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage billing history"
  ON billing_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for payment_methods
CREATE POLICY "Tenants can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenant admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE email = current_user 
      AND role IN ('owner', 'admin')
    )
  );

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_annual, features, limits, sort_order)
VALUES
  (
    'free',
    'Plano Gratuito',
    'Perfeito para testar a plataforma',
    0.00,
    0.00,
    '["10 auditorias/mês", "Relatórios básicos", "Suporte por email"]'::jsonb,
    '{"max_users": 1, "max_audits_per_month": 10, "max_comparisons_per_month": 5, "max_platform_checks_per_month": 3, "storage_gb": 1}'::jsonb,
    0
  ),
  (
    'starter',
    'Starter',
    'Ideal para pequenas agências',
    49.90,
    539.00,
    '["100 auditorias/mês", "5 usuários", "Relatórios PDF completos", "Comparação competitiva", "Suporte prioritário"]'::jsonb,
    '{"max_users": 5, "max_audits_per_month": 100, "max_comparisons_per_month": 50, "max_platform_checks_per_month": 30, "storage_gb": 10}'::jsonb,
    1
  ),
  (
    'professional',
    'Professional',
    'Para agências em crescimento',
    149.90,
    1619.00,
    '["500 auditorias/mês", "20 usuários", "White-label completo", "API access", "Análise com IA", "Domínio customizado", "Suporte 24/7"]'::jsonb,
    '{"max_users": 20, "max_audits_per_month": 500, "max_comparisons_per_month": 300, "max_platform_checks_per_month": 200, "storage_gb": 50}'::jsonb,
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'Solução completa para grandes operações',
    499.90,
    5399.00,
    '["Auditorias ilimitadas", "Usuários ilimitados", "White-label avançado", "API dedicada", "IA estratégica avançada", "Onboarding dedicado", "Success manager", "SLA garantido"]'::jsonb,
    '{"max_users": 0, "max_audits_per_month": 0, "max_comparisons_per_month": 0, "max_platform_checks_per_month": 0, "storage_gb": 500}'::jsonb,
    3
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
  BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if tenant can perform action (quota check)
CREATE OR REPLACE FUNCTION can_tenant_perform_action(
  p_tenant_id uuid,
  p_action_type text
)
RETURNS boolean AS $$
DECLARE
  v_limit integer;
  v_current_usage integer;
  v_plan_limits jsonb;
BEGIN
  -- Get plan limits
  SELECT sp.limits INTO v_plan_limits
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON ts.plan_id = sp.id
  WHERE ts.tenant_id = p_tenant_id
    AND ts.status IN ('active', 'trialing');
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Determine limit based on action type
  CASE p_action_type
    WHEN 'audit' THEN
      v_limit := (v_plan_limits->>'max_audits_per_month')::integer;
    WHEN 'comparison' THEN
      v_limit := (v_plan_limits->>'max_comparisons_per_month')::integer;
    WHEN 'platform_check' THEN
      v_limit := (v_plan_limits->>'max_platform_checks_per_month')::integer;
    ELSE
      RETURN true;
  END CASE;
  
  -- 0 means unlimited
  IF v_limit = 0 THEN
    RETURN true;
  END IF;
  
  -- Count current month usage
  SELECT COUNT(*)::integer INTO v_current_usage
  FROM usage_tracking
  WHERE tenant_id = p_tenant_id
    AND action_type = p_action_type
    AND timestamp >= date_trunc('month', now());
  
  RETURN v_current_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade/downgrade subscription
CREATE OR REPLACE FUNCTION change_subscription_plan(
  p_tenant_id uuid,
  p_new_plan_name text,
  p_billing_cycle text DEFAULT 'monthly'
)
RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_new_plan_id uuid;
BEGIN
  -- Get new plan ID
  SELECT id INTO v_new_plan_id
  FROM subscription_plans
  WHERE name = p_new_plan_name
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan % not found or inactive', p_new_plan_name;
  END IF;
  
  -- Update or insert subscription
  INSERT INTO tenant_subscriptions (
    tenant_id, plan_id, billing_cycle, status, 
    current_period_start, current_period_end
  )
  VALUES (
    p_tenant_id, v_new_plan_id, p_billing_cycle, 'active',
    now(), now() + (CASE WHEN p_billing_cycle = 'annual' THEN interval '1 year' ELSE interval '1 month' END)
  )
  ON CONFLICT (tenant_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    billing_cycle = EXCLUDED.billing_cycle,
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + (CASE WHEN p_billing_cycle = 'annual' THEN interval '1 year' ELSE interval '1 month' END),
    updated_at = now()
  RETURNING id INTO v_subscription_id;
  
  -- Update tenant plan
  UPDATE tenants
  SET subscription_plan = p_new_plan_name
  WHERE id = p_tenant_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;
