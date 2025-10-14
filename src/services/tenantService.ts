import { supabase } from '../lib/supabase';
import type { Tenant, TenantUser, TenantBranding, SubscriptionPlan, TenantSubscription } from '../types/tenant';

export class TenantService {
  static async createTenant(data: {
    name: string;
    slug: string;
    owner_email: string;
    subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  }): Promise<Tenant> {
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        {
          name: data.name,
          slug: data.slug,
          subscription_plan: data.subscription_plan || 'free',
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      .select()
      .single();

    if (tenantError) throw tenantError;

    const { error: userError } = await supabase
      .from('tenant_users')
      .insert([
        {
          tenant_id: tenant.id,
          email: data.owner_email,
          role: 'owner',
          permissions: {
            create_audits: true,
            view_audits: true,
            export_reports: true,
            manage_users: true,
            manage_billing: true,
            manage_branding: true,
          },
        },
      ]);

    if (userError) throw userError;

    const { error: brandingError } = await supabase
      .from('tenant_branding')
      .insert([
        {
          tenant_id: tenant.id,
        },
      ]);

    if (brandingError) throw brandingError;

    return tenant;
  }

  static async getTenant(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    const { data, error } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addTenantUser(data: {
    tenant_id: string;
    email: string;
    role: 'admin' | 'member' | 'viewer';
  }): Promise<TenantUser> {
    const { data: user, error } = await supabase
      .from('tenant_users')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  static async updateTenantUser(userId: string, updates: Partial<TenantUser>): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('tenant_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeTenantUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('tenant_users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  static async getTenantBranding(tenantId: string): Promise<TenantBranding | null> {
    const { data, error } = await supabase
      .from('tenant_branding')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async updateTenantBranding(tenantId: string, updates: Partial<TenantBranding>): Promise<TenantBranding> {
    const { data, error } = await supabase
      .from('tenant_branding')
      .update(updates)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async changeSubscriptionPlan(
    tenantId: string,
    planName: 'free' | 'starter' | 'professional' | 'enterprise',
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<string> {
    const { data, error } = await supabase.rpc('change_subscription_plan', {
      p_tenant_id: tenantId,
      p_new_plan_name: planName,
      p_billing_cycle: billingCycle,
    });

    if (error) throw error;
    return data;
  }

  static async canPerformAction(tenantId: string, actionType: 'audit' | 'comparison' | 'platform_check'): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_tenant_perform_action', {
      p_tenant_id: tenantId,
      p_action_type: actionType,
    });

    if (error) throw error;
    return data || false;
  }

  static async trackUsage(
    tenantId: string,
    userId: string,
    actionType: 'audit' | 'comparison' | 'platform_check' | 'export',
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase.rpc('track_usage', {
      p_tenant_id: tenantId,
      p_user_id: userId,
      p_action_type: actionType,
      p_resource_id: resourceId || null,
      p_metadata: metadata || {},
    });

    if (error) throw error;
  }
}
