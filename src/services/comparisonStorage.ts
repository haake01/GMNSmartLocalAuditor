import { supabase } from '../lib/supabase';
import { CompetitiveComparison } from './competitiveComparison';

export interface StoredComparison {
  id: string;
  company_name: string;
  leader_name: string;
  city: string | null;
  segment: string | null;
  overall_gap: number;
  comparison_data: CompetitiveComparison;
  created_at: string;
}

export async function saveComparison(
  comparison: CompetitiveComparison,
  city: string,
  segment: string,
  tenantId?: string
): Promise<void> {
  const insertData: Record<string, unknown> = {
    company_name: comparison.company_name,
    leader_name: comparison.leader_name,
    city,
    segment,
    overall_gap: comparison.overall_gap,
    comparison_data: comparison
  };

  if (tenantId) {
    insertData.tenant_id = tenantId;
  }

  const { error } = await supabase
    .from('competitive_comparisons')
    .insert(insertData);

  if (error) {
    console.error('Erro ao salvar comparação:', error);
    throw error;
  }
}

export async function getComparisonHistory(): Promise<StoredComparison[]> {
  const { data, error } = await supabase
    .from('competitive_comparisons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }

  return data || [];
}
