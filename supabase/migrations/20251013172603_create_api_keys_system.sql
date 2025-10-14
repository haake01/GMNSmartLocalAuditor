/*
  # Sistema de API Keys - GMN SmartLocal Auditor PRO v3.1

  ## Overview
  Sistema completo de gerenciamento de API keys para acesso programático à plataforma.
  Suporta criação, revogação, rate limiting e monitoramento de uso.

  ## New Tables

  ### `api_keys`
  Armazena as API keys geradas para cada tenant.
  
  Columns:
  - `id` (uuid, PK) - ID único da key
  - `tenant_id` (uuid, FK → tenants) - Tenant proprietário
  - `key_hash` (text) - Hash SHA-256 da key (não armazena plain text)
  - `key_prefix` (text) - Prefixo visível da key (ex: "gmn_live_abc...")
  - `name` (text) - Nome descritivo da key
  - `permissions` (jsonb) - Permissões específicas da key
  - `rate_limit_per_minute` (integer) - Limite de requisições/minuto
  - `rate_limit_per_day` (integer) - Limite de requisições/dia
  - `is_active` (boolean) - Se a key está ativa
  - `last_used_at` (timestamptz) - Última vez que foi usada
  - `expires_at` (timestamptz, nullable) - Data de expiração (null = nunca)
  - `created_at` (timestamptz) - Data de criação
  - `revoked_at` (timestamptz, nullable) - Data de revogação

  ### `api_key_usage`
  Log de uso de API keys para monitoramento e rate limiting.
  
  Columns:
  - `id` (uuid, PK) - ID único do log
  - `api_key_id` (uuid, FK → api_keys) - Key utilizada
  - `tenant_id` (uuid, FK → tenants) - Tenant (denormalizado para performance)
  - `endpoint` (text) - Endpoint acessado
  - `method` (text) - Método HTTP (GET, POST, etc)
  - `status_code` (integer) - Status HTTP da resposta
  - `response_time_ms` (integer) - Tempo de resposta em ms
  - `ip_address` (inet) - IP de origem
  - `user_agent` (text) - User agent do cliente
  - `error_message` (text, nullable) - Mensagem de erro se houver
  - `created_at` (timestamptz) - Timestamp da requisição

  ## Security
  - RLS habilitado em todas tabelas
  - Keys são hasheadas (SHA-256), nunca armazenadas em plain text
  - Permissões granulares por key
  - Rate limiting configurável
  - Logs completos de auditoria

  ## Rate Limiting
  - Por minuto: Prevenção de abuse em curto prazo
  - Por dia: Controle de cota diária
  - Implementação via query agregada (últimas N mins/24h)

  ## Permissions Structure
  ```json
  {
    "read_audits": boolean,
    "create_audits": boolean,
    "read_comparisons": boolean,
    "create_comparisons": boolean,
    "read_reports": boolean,
    "webhook_access": boolean
  }
  ```
*/

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  name text NOT NULL,
  permissions jsonb DEFAULT '{
    "read_audits": true,
    "create_audits": false,
    "read_comparisons": true,
    "create_comparisons": false,
    "read_reports": true,
    "webhook_access": false
  }'::jsonb,
  rate_limit_per_minute integer DEFAULT 60 CHECK (rate_limit_per_minute > 0),
  rate_limit_per_day integer DEFAULT 10000 CHECK (rate_limit_per_day > 0),
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  
  CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create api_key_usage table
CREATE TABLE IF NOT EXISTS api_key_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL CHECK (response_time_ms >= 0),
  ip_address inet,
  user_agent text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_tenant_id ON api_key_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created_at ON api_key_usage(created_at DESC);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Tenants can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can create API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "Tenants can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can manage all API keys"
  ON api_keys FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for api_key_usage
CREATE POLICY "Tenants can view own usage logs"
  ON api_key_usage FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE email = current_user
    )
  );

CREATE POLICY "System can insert usage logs"
  ON api_key_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can manage all usage logs"
  ON api_key_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_api_key_rate_limit(
  p_api_key_id uuid,
  p_check_period text DEFAULT 'minute'
)
RETURNS boolean AS $$
DECLARE
  v_rate_limit integer;
  v_usage_count integer;
  v_time_window interval;
BEGIN
  -- Get rate limit for the key
  IF p_check_period = 'minute' THEN
    SELECT rate_limit_per_minute INTO v_rate_limit
    FROM api_keys
    WHERE id = p_api_key_id;
    v_time_window := interval '1 minute';
  ELSE
    SELECT rate_limit_per_day INTO v_rate_limit
    FROM api_keys
    WHERE id = p_api_key_id;
    v_time_window := interval '1 day';
  END IF;

  -- Count usage in time window
  SELECT COUNT(*) INTO v_usage_count
  FROM api_key_usage
  WHERE api_key_id = p_api_key_id
    AND created_at >= now() - v_time_window;

  -- Return true if under limit
  RETURN v_usage_count < v_rate_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash text)
RETURNS TABLE (
  key_id uuid,
  tenant_id uuid,
  permissions jsonb,
  is_valid boolean,
  rate_limit_ok boolean
) AS $$
DECLARE
  v_key_record RECORD;
BEGIN
  -- Get key details
  SELECT 
    id,
    api_keys.tenant_id,
    api_keys.permissions,
    is_active,
    expires_at,
    revoked_at
  INTO v_key_record
  FROM api_keys
  WHERE key_hash = p_key_hash;

  -- Check if key exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::uuid,
      NULL::uuid,
      NULL::jsonb,
      false,
      false;
    RETURN;
  END IF;

  -- Check if key is valid
  IF v_key_record.is_active = false OR
     v_key_record.revoked_at IS NOT NULL OR
     (v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < now())
  THEN
    RETURN QUERY SELECT 
      v_key_record.id,
      v_key_record.tenant_id,
      v_key_record.permissions,
      false,
      false;
    RETURN;
  END IF;

  -- Check rate limits
  RETURN QUERY SELECT
    v_key_record.id,
    v_key_record.tenant_id,
    v_key_record.permissions,
    true,
    check_api_key_rate_limit(v_key_record.id, 'minute') AND 
    check_api_key_rate_limit(v_key_record.id, 'day');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_key_usage(
  p_api_key_id uuid,
  p_tenant_id uuid,
  p_endpoint text,
  p_method text,
  p_status_code integer,
  p_response_time_ms integer,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO api_key_usage (
    api_key_id,
    tenant_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    ip_address,
    user_agent,
    error_message
  ) VALUES (
    p_api_key_id,
    p_tenant_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_ip_address,
    p_user_agent,
    p_error_message
  );

  -- Update last_used_at
  UPDATE api_keys
  SET last_used_at = now()
  WHERE id = p_api_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get usage statistics
CREATE OR REPLACE FUNCTION get_api_key_usage_stats(
  p_api_key_id uuid,
  p_period interval DEFAULT interval '7 days'
)
RETURNS TABLE (
  total_requests bigint,
  successful_requests bigint,
  failed_requests bigint,
  avg_response_time_ms numeric,
  requests_per_day numeric,
  most_used_endpoint text,
  most_common_error text
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success,
      COUNT(*) FILTER (WHERE status_code >= 400) as failures,
      AVG(response_time_ms) as avg_time,
      COUNT(*)::numeric / EXTRACT(epoch FROM p_period) * 86400 as req_per_day
    FROM api_key_usage
    WHERE api_key_id = p_api_key_id
      AND created_at >= now() - p_period
  ),
  top_endpoint AS (
    SELECT endpoint
    FROM api_key_usage
    WHERE api_key_id = p_api_key_id
      AND created_at >= now() - p_period
    GROUP BY endpoint
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  top_error AS (
    SELECT error_message
    FROM api_key_usage
    WHERE api_key_id = p_api_key_id
      AND created_at >= now() - p_period
      AND error_message IS NOT NULL
    GROUP BY error_message
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT
    stats.total,
    stats.success,
    stats.failures,
    ROUND(stats.avg_time, 2),
    ROUND(stats.req_per_day, 2),
    COALESCE(top_endpoint.endpoint, 'N/A'),
    COALESCE(top_error.error_message, 'N/A')
  FROM stats
  CROSS JOIN top_endpoint
  CROSS JOIN top_error;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
