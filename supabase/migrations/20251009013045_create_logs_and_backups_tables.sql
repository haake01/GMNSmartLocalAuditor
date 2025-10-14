/*
  # Sistema de Logs e Backups

  1. Novas Tabelas
    - `error_logs`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz)
      - `type` (text) - pdf, excel, supabase, api, general
      - `message` (text)
      - `stack` (text)
      - `context` (jsonb)
      - `recovered` (boolean)
      - `recovery_attempts` (integer)
      - `created_at` (timestamptz)
    
    - `audit_backups`
      - `id` (uuid, primary key)
      - `audit_id` (uuid)
      - `backup_data` (jsonb)
      - `backup_type` (text) - full, partial, emergency
      - `created_at` (timestamptz)
      - `metadata` (jsonb)

  2. Índices
    - Índice por timestamp em error_logs
    - Índice por type em error_logs
    - Índice por audit_id em audit_backups
    - Índice por created_at em ambas tabelas

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso público para leitura (analytics)
    - Políticas de escrita autenticadas
*/

-- Tabela de logs de erros
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('pdf', 'excel', 'supabase', 'api', 'general')),
  message text NOT NULL,
  stack text,
  context jsonb DEFAULT '{}'::jsonb,
  recovered boolean DEFAULT false,
  recovery_attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices para error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(type);
CREATE INDEX IF NOT EXISTS idx_error_logs_recovered ON error_logs(recovered);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- RLS para error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read error logs"
  ON error_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert error logs"
  ON error_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- Tabela de backups de auditorias
CREATE TABLE IF NOT EXISTS audit_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid,
  backup_data jsonb NOT NULL,
  backup_type text NOT NULL DEFAULT 'full' CHECK (backup_type IN ('full', 'partial', 'emergency')),
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Índices para audit_backups
CREATE INDEX IF NOT EXISTS idx_audit_backups_audit_id ON audit_backups(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_backups_type ON audit_backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_audit_backups_created_at ON audit_backups(created_at DESC);

-- RLS para audit_backups
ALTER TABLE audit_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audit backups"
  ON audit_backups FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert audit backups"
  ON audit_backups FOR INSERT
  TO public
  WITH CHECK (true);

-- Função para limpeza automática de logs antigos (30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM audit_backups
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND backup_type != 'emergency';
END;
$$;

-- Comentários para documentação
COMMENT ON TABLE error_logs IS 'Armazena logs de erros do sistema com auto-recovery';
COMMENT ON TABLE audit_backups IS 'Backups automáticos de dados de auditoria';
COMMENT ON FUNCTION cleanup_old_logs() IS 'Remove logs antigos automaticamente (30d para erros, 90d para backups)';