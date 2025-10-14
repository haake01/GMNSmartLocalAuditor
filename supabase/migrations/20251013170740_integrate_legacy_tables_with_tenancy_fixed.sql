/*
  # Integração Multi-Tenancy com Tabelas Legadas - Fase 2 (Corrigido)

  ## Overview
  Adiciona suporte multi-tenant às tabelas existentes do sistema legado.
  Mantém total compatibilidade com dados históricos através de tenant padrão.

  ## Fix: Constraints de Check
  - max_users CHECK > 0, mas precisamos 0 para ilimitado
  - max_audits_per_month CHECK > 0, mas precisamos 0 para ilimitado
  - Solução: Alterar constraints para >= 0

  ## Alterações nas Tabelas Legadas
  Adiciona tenant_id em todas tabelas com dados históricos.

  ## Tenant Padrão (GMN Master)
  - Nome: "GMN Master Tenant"
  - Slug: "gmn-master"
  - Status: active
  - Plano: enterprise (acesso ilimitado)
  - max_users: 999999 (praticamente ilimitado)
  - max_audits_per_month: 999999 (praticamente ilimitado)
*/

-- Step 0: Fix constraints to allow unlimited (0 values)
-- Drop old constraints and add new ones that allow >= 0

ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_max_users_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_max_users_check CHECK (max_users >= 0);

ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_max_audits_per_month_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_max_audits_per_month_check CHECK (max_audits_per_month >= 0);

-- Step 1: Add tenant_id columns to legacy tables (nullable initially)

DO $$
BEGIN
  -- analysis_sessions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_analysis_sessions_tenant_id ON analysis_sessions(tenant_id);
  END IF;

  -- companies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
  END IF;

  -- gmn_audits
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmn_audits' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE gmn_audits ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_gmn_audits_tenant_id ON gmn_audits(tenant_id);
  END IF;

  -- gmn_empresas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmn_empresas' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE gmn_empresas ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_gmn_empresas_tenant_id ON gmn_empresas(tenant_id);
  END IF;

  -- competitive_comparisons
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitive_comparisons' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE competitive_comparisons ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_competitive_comparisons_tenant_id ON competitive_comparisons(tenant_id);
  END IF;

  -- error_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'error_logs' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE error_logs ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
  END IF;

  -- audit_backups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_backups' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE audit_backups ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_audit_backups_tenant_id ON audit_backups(tenant_id);
  END IF;
END $$;

-- Step 2: Create default "GMN Master Tenant"

INSERT INTO tenants (
  name,
  slug,
  status,
  subscription_plan,
  max_users,
  max_audits_per_month,
  features_enabled,
  metadata
)
VALUES (
  'GMN Master Tenant',
  'gmn-master',
  'active',
  'enterprise',
  999999,  -- Practically unlimited users
  999999,  -- Practically unlimited audits
  '{
    "batch_audit": true,
    "competitive_comparison": true,
    "platform_presence": true,
    "ai_analysis": true,
    "white_label": true,
    "custom_domain": true,
    "api_access": true,
    "advanced_reports": true
  }'::jsonb,
  '{"type": "master", "purpose": "Legacy data and current operations", "created_by": "system_migration"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Create default owner user for master tenant

DO $$
DECLARE
  v_master_tenant_id uuid;
BEGIN
  SELECT id INTO v_master_tenant_id FROM tenants WHERE slug = 'gmn-master';
  
  IF v_master_tenant_id IS NOT NULL THEN
    INSERT INTO tenant_users (
      tenant_id,
      email,
      role,
      permissions,
      is_active
    )
    VALUES (
      v_master_tenant_id,
      'admin@gmn-smartlocal.com',
      'owner',
      '{
        "create_audits": true,
        "view_audits": true,
        "export_reports": true,
        "manage_users": true,
        "manage_billing": true,
        "manage_branding": true
      }'::jsonb,
      true
    )
    ON CONFLICT (tenant_id, email) DO NOTHING;

    -- Create default branding for master tenant
    INSERT INTO tenant_branding (tenant_id)
    VALUES (v_master_tenant_id)
    ON CONFLICT (tenant_id) DO NOTHING;

    -- Create subscription for master tenant
    INSERT INTO tenant_subscriptions (
      tenant_id,
      plan_id,
      billing_cycle,
      status,
      current_period_start,
      current_period_end
    )
    SELECT
      v_master_tenant_id,
      sp.id,
      'annual',
      'active',
      now(),
      now() + interval '100 years'  -- Virtually unlimited
    FROM subscription_plans sp
    WHERE sp.name = 'enterprise'
    ON CONFLICT (tenant_id) DO NOTHING;

    -- Create license for master tenant
    INSERT INTO licenses (
      tenant_id,
      license_type,
      status,
      activation_date,
      max_usage_limit
    )
    VALUES (
      v_master_tenant_id,
      'lifetime',
      'active',
      now(),
      0  -- unlimited
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Step 4: Migrate existing data to master tenant

DO $$
DECLARE
  v_master_tenant_id uuid;
  v_count integer;
BEGIN
  SELECT id INTO v_master_tenant_id FROM tenants WHERE slug = 'gmn-master';
  
  IF v_master_tenant_id IS NOT NULL THEN
    -- Migrate analysis_sessions
    UPDATE analysis_sessions
    SET tenant_id = v_master_tenant_id
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % analysis_sessions to master tenant', v_count;

    -- Migrate companies
    UPDATE companies
    SET tenant_id = v_master_tenant_id
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % companies to master tenant', v_count;

    -- Migrate gmn_audits
    UPDATE gmn_audits
    SET tenant_id = v_master_tenant_id
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % gmn_audits to master tenant', v_count;

    -- Migrate gmn_empresas
    UPDATE gmn_empresas
    SET tenant_id = v_master_tenant_id
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % gmn_empresas to master tenant', v_count;

    -- Migrate competitive_comparisons
    UPDATE competitive_comparisons
    SET tenant_id = v_master_tenant_id
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % competitive_comparisons to master tenant', v_count;

    RAISE NOTICE 'Data migration to master tenant completed successfully';
  END IF;
END $$;

-- Step 5: Update RLS policies for legacy tables to be tenant-aware

-- analysis_sessions policies
DROP POLICY IF EXISTS "Anyone can view analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Anyone can insert analysis sessions" ON analysis_sessions;

CREATE POLICY "Tenants can view own analysis sessions"
  ON analysis_sessions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can insert analysis sessions"
  ON analysis_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage analysis sessions"
  ON analysis_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- companies policies
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies" ON companies;

CREATE POLICY "Tenants can view own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage companies"
  ON companies FOR ALL
  USING (true)
  WITH CHECK (true);

-- gmn_audits policies
DROP POLICY IF EXISTS "Anyone can view audits" ON gmn_audits;
DROP POLICY IF EXISTS "Anyone can insert audits" ON gmn_audits;

CREATE POLICY "Tenants can view own audits"
  ON gmn_audits FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can insert audits"
  ON gmn_audits FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage audits"
  ON gmn_audits FOR ALL
  USING (true)
  WITH CHECK (true);

-- gmn_empresas policies
DROP POLICY IF EXISTS "Anyone can view business data" ON gmn_empresas;
DROP POLICY IF EXISTS "Anyone can insert business data" ON gmn_empresas;

CREATE POLICY "Tenants can view own business data"
  ON gmn_empresas FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can insert business data"
  ON gmn_empresas FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage business data"
  ON gmn_empresas FOR ALL
  USING (true)
  WITH CHECK (true);

-- competitive_comparisons policies
DROP POLICY IF EXISTS "Anyone can view competitive comparisons" ON competitive_comparisons;
DROP POLICY IF EXISTS "Anyone can insert competitive comparisons" ON competitive_comparisons;

CREATE POLICY "Tenants can view own comparisons"
  ON competitive_comparisons FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can insert comparisons"
  ON competitive_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage comparisons"
  ON competitive_comparisons FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 6: Create helper function to get current tenant_id

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM tenant_users
  WHERE email = current_user
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to ensure tenant_id on inserts

CREATE OR REPLACE FUNCTION set_tenant_id_from_context()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- If tenant_id is already set, use it
  IF NEW.tenant_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Otherwise, get from current user context
  v_tenant_id := get_current_tenant_id();
  
  IF v_tenant_id IS NOT NULL THEN
    NEW.tenant_id := v_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to auto-set tenant_id

DROP TRIGGER IF EXISTS set_tenant_id_on_analysis_sessions ON analysis_sessions;
CREATE TRIGGER set_tenant_id_on_analysis_sessions
  BEFORE INSERT ON analysis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_tenant_id_on_companies ON companies;
CREATE TRIGGER set_tenant_id_on_companies
  BEFORE INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_tenant_id_on_gmn_audits ON gmn_audits;
CREATE TRIGGER set_tenant_id_on_gmn_audits
  BEFORE INSERT ON gmn_audits
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_tenant_id_on_gmn_empresas ON gmn_empresas;
CREATE TRIGGER set_tenant_id_on_gmn_empresas
  BEFORE INSERT ON gmn_empresas
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_tenant_id_on_competitive_comparisons ON competitive_comparisons;
CREATE TRIGGER set_tenant_id_on_competitive_comparisons
  BEFORE INSERT ON competitive_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();
