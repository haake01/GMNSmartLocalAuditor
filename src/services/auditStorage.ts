import { supabase } from '../lib/supabase';
import { RealCompanyAudit } from './batchAudit';

export interface SavedAudit {
  audit_id: string;
  segment: string;
  city: string;
  overall_score: number;
  companies_analyzed: number;
  created_at: string;
}

export async function saveAuditToDatabase(
  segment: string,
  city: string,
  state: string | undefined,
  companies: RealCompanyAudit[],
  tenantId?: string
): Promise<string> {
  if (companies.length === 0) {
    throw new Error('No companies to save');
  }

  const overallScore = Math.round(
    companies.reduce((sum, c) => sum + c.overall_score, 0) / companies.length
  );

  const companiesWithProfile = companies.filter(c => c.has_gmn_profile).length;
  const profilePercentage = Math.round((companiesWithProfile / companies.length) * 100);

  let complianceStatus: 'green' | 'yellow' | 'red';
  if (overallScore >= 80) {
    complianceStatus = 'green';
  } else if (overallScore >= 50) {
    complianceStatus = 'yellow';
  } else {
    complianceStatus = 'red';
  }

  const opportunities = [
    `${companies.length - companiesWithProfile} empresas sem perfil GMN (${100 - profilePercentage}%)`,
    `${companies.filter(c => c.overall_score < 70).length} empresas precisam de otimização urgente`,
    `${companies.filter(c => c.review_response_rate < 50).length} empresas com baixa taxa de resposta a avaliações`
  ];

  const suggestions = [
    'Criar perfis GMN para empresas sem presença online',
    'Implementar estratégia de solicitação de avaliações',
    'Adicionar pelo menos 10 fotos de qualidade em cada perfil',
    'Responder todas as avaliações (meta: 80% de taxa de resposta)',
    'Publicar 2-3 vezes por semana no GMN'
  ];

  const localComparison = {
    segmentAverage: overallScore,
    positionInSegment: overallScore >= 70 ? 'Acima da média' : 'Abaixo da média',
    keyDifferentiators: [
      `${profilePercentage}% das empresas possui perfil GMN`,
      `Média de ${Math.round(companies.reduce((sum, c) => sum + c.total_reviews, 0) / companies.length)} avaliações por empresa`,
      `Nota média do segmento: ${(companies.reduce((sum, c) => sum + c.rating, 0) / companies.length).toFixed(1)}`
    ]
  };

  const auditInsert: Record<string, unknown> = {
    segment,
    city,
    state,
    overall_score: overallScore,
    compliance_status: complianceStatus,
    opportunities: opportunities,
    suggestions: suggestions,
    local_comparison: localComparison,
    ai_analysis: `Análise de ${companies.length} empresas reais do segmento ${segment} em ${city}. Score médio: ${overallScore}/100. ${companiesWithProfile} empresas possuem perfil GMN verificado.`,
    companies_analyzed: companies.length
  };

  if (tenantId) {
    auditInsert.tenant_id = tenantId;
  }

  const { data: auditData, error: auditError } = await supabase
    .from('gmn_audits')
    .insert(auditInsert)
    .select()
    .single();

  if (auditError) {
    console.error('Error saving audit:', auditError);
    throw new Error(`Failed to save audit: ${auditError.message}`);
  }

  const auditId = auditData.id;

  const companiesData = companies.map(company => {
    const companyData: Record<string, unknown> = {
      audit_id: auditId,
      company_name: company.company_name,
      city: company.city,
      state: company.state,
      category: company.category,
      has_gmn_profile: company.has_gmn_profile,
      address: company.address,
      phone: company.phone,
      website: company.website,
      rating: company.rating,
      total_reviews: company.total_reviews,
      verification_status: company.verification_status,
      nap_consistency_score: company.nap_consistency_score,
      has_products: company.has_products,
      images_count: company.images_count,
      has_geotags: company.has_geotags,
      posts_per_week: company.posts_per_week,
      review_response_rate: company.review_response_rate,
      seo_score: company.seo_score,
      engagement_score: company.overall_score,
      improvement_points: company.improvement_points,
      should_invite_for_optimization: company.should_invite_for_optimization
    };

    if (tenantId) {
      companyData.tenant_id = tenantId;
    }

    return companyData;
  });

  const { error: companiesError } = await supabase
    .from('gmn_empresas')
    .insert(companiesData);

  if (companiesError) {
    console.error('Error saving companies:', companiesError);
    throw new Error(`Failed to save companies: ${companiesError.message}`);
  }

  return auditId;
}

export async function getAuditById(auditId: string) {
  const { data: audit, error: auditError } = await supabase
    .from('gmn_audits')
    .select('*')
    .eq('id', auditId)
    .single();

  if (auditError) {
    throw new Error(`Failed to fetch audit: ${auditError.message}`);
  }

  const { data: companies, error: companiesError } = await supabase
    .from('gmn_empresas')
    .select('*')
    .eq('audit_id', auditId)
    .order('overall_score', { ascending: false });

  if (companiesError) {
    throw new Error(`Failed to fetch companies: ${companiesError.message}`);
  }

  return {
    audit,
    companies
  };
}

export async function getRecentAudits(limit: number = 10): Promise<SavedAudit[]> {
  const { data, error } = await supabase
    .from('gmn_audits')
    .select('id, segment, city, overall_score, companies_analyzed, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch audits: ${error.message}`);
  }

  return data.map(audit => ({
    audit_id: audit.id,
    segment: audit.segment,
    city: audit.city,
    overall_score: audit.overall_score,
    companies_analyzed: audit.companies_analyzed,
    created_at: audit.created_at
  }));
}
