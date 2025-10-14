export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  license_key: string;
  max_users: number;
  max_audits_per_month: number;
  features_enabled: {
    batch_audit: boolean;
    competitive_comparison: boolean;
    platform_presence: boolean;
    ai_analysis: boolean;
    white_label: boolean;
    custom_domain: boolean;
    api_access: boolean;
    advanced_reports: boolean;
  };
  metadata: Record<string, unknown>;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: {
    create_audits: boolean;
    view_audits: boolean;
    export_reports: boolean;
    manage_users: boolean;
    manage_billing: boolean;
    manage_branding: boolean;
  };
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface TenantBranding {
  id: string;
  tenant_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  company_name_override: string | null;
  custom_css: string | null;
  footer_text: string | null;
  support_email: string | null;
  support_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'starter' | 'professional' | 'enterprise';
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: {
    max_users: number;
    max_audits_per_month: number;
    max_comparisons_per_month: number;
    max_platform_checks_per_month: number;
    storage_gb: number;
  };
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'annual';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoyaltyReport {
  id: string;
  tenant_id: string;
  period_start: string;
  period_end: string;
  total_audits: number;
  total_comparisons: number;
  total_platform_checks: number;
  base_fee: number;
  per_audit_fee: number;
  total_royalty: number;
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_url: string | null;
  docusign_envelope_id: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface License {
  id: string;
  tenant_id: string;
  license_key: string;
  license_type: 'trial' | 'monthly' | 'annual' | 'lifetime';
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  activation_date: string | null;
  expiration_date: string | null;
  max_usage_limit: number;
  current_usage: number;
  usage_resets_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
