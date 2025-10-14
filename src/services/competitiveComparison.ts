import { analyzeCompanyWithOpenAI } from './enhanced-openai';

export interface ComparisonCriteria {
  name: string;
  company_score: number;
  leader_score: number;
  gap: number;
  improvements: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface CompetitiveComparison {
  company_name: string;
  company_data: {
    has_gmn_profile: boolean;
    verification_status: string;
    rating: number;
    total_reviews: number;
    nap_consistency_score: number;
    has_products: boolean;
    images_count: number;
    has_geotags: boolean;
    posts_per_week: number;
    review_response_rate: number;
    seo_score: number;
    engagement_score: number;
    overall_score: number;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    website?: string;
    gmn_url?: string;
  };
  leader_name: string;
  gmn_position?: string;
  leader_data: {
    has_gmn_profile: boolean;
    verification_status: string;
    rating: number;
    total_reviews: number;
    nap_consistency_score: number;
    has_products: boolean;
    images_count: number;
    has_geotags: boolean;
    posts_per_week: number;
    review_response_rate: number;
    seo_score: number;
    engagement_score: number;
    overall_score: number;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  criteria_comparison: ComparisonCriteria[];
  overall_gap: number;
  strategic_recommendations: string[];
  quick_wins: string[];
  long_term_goals: string[];
  executive_summary: string;
  improvement_roadmap: string[];
  summary_gap_analysis: string;
  criteria_gap_analysis: string;
}

export async function performCompetitiveComparison(
  companyName: string,
  city: string,
  segment: string
): Promise<CompetitiveComparison> {
  console.log(`🔍 Buscando líder do segmento "${segment}" em "${city}"...`);

  const leaderPrompt = `Encontre a empresa líder do segmento "${segment}" em "${city}" no Google Meu Negócio.

Retorne APENAS um JSON com o nome da empresa líder:
{
  "leader_name": "Nome Completo da Empresa Líder"
}`;

  const leaderResponse = await analyzeCompanyWithOpenAI(leaderPrompt, '');
  const leaderData = JSON.parse(leaderResponse);
  const leaderName = leaderData.leader_name;

  console.log(`👑 Líder identificado: ${leaderName}`);
  console.log(`📊 Analisando ${companyName}...`);

  const companyPrompt = `Você é analista de GMN. Crie uma análise REALISTA e VARIADA de "${companyName}" em "${city}", segmento "${segment}".

IMPORTANTE - DADOS DEVEM SER DIFERENTES E REALISTAS:
- Esta é a empresa ANALISADA (normalmente tem scores MENORES que o líder)
- Rating: varie entre 3.5 a 4.5 (use decimais diferentes como 3.8, 4.2)
- Reviews: varie entre 30-180 (números ESPECÍFICOS, não redondos)
- Images: varie entre 15-65
- Overall score: entre 50-75 para empresa analisada
- NÃO invente email/telefone - use null
- Endereço: apenas cidade e bairro estimado

Retorne APENAS JSON:
{
  "has_gmn_profile": true,
  "verification_status": "Verificado",
  "rating": 4.1,
  "total_reviews": 87,
  "nap_consistency_score": 65,
  "has_products": true,
  "images_count": 32,
  "has_geotags": true,
  "posts_per_week": 1,
  "review_response_rate": 55,
  "seo_score": 60,
  "engagement_score": 58,
  "overall_score": 62,
  "email": null,
  "phone": null,
  "whatsapp": null,
  "address": "${city}, Centro",
  "gmn_url": "https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyName + ' ' + city)}",
  "website": null,
  "instagram": null,
  "facebook": null,
  "waze": false,
  "uber": false,
  "99": false,
  "ifood": false
}`;

  const companyAnalysis = await analyzeCompanyWithOpenAI(companyPrompt, '');
  const companyData = JSON.parse(companyAnalysis);

  console.log(`📊 Analisando ${leaderName} (líder)...`);

  const leaderAnalysisPrompt = `Você é analista de GMN. Crie uma análise REALISTA do LÍDER "${leaderName}" em "${city}", segmento "${segment}".

IMPORTANTE - EMPRESA LÍDER TEM MELHORES SCORES:
- Esta é a empresa LÍDER (deve ter scores MAIORES)
- Rating: entre 4.4 a 4.9 (use decimais específicos como 4.7, 4.8)
- Reviews: entre 120-350 (números ESPECÍFICOS e DIFERENTES da empresa analisada)
- Images: entre 45-95 (DIFERENTE da outra empresa)
- Overall score: entre 75-88 para líder
- NÃO invente email/telefone - use null
- Dados DEVEM ser DIFERENTES dos da empresa analisada

Retorne APENAS JSON com dados DIFERENTES:
{
  "has_gmn_profile": true,
  "verification_status": "Verificado",
  "rating": 4.6,
  "total_reviews": 218,
  "nap_consistency_score": 88,
  "has_products": true,
  "images_count": 67,
  "has_geotags": true,
  "posts_per_week": 3,
  "review_response_rate": 92,
  "seo_score": 85,
  "engagement_score": 82,
  "overall_score": 81,
  "email": null,
  "phone": null,
  "whatsapp": null,
  "address": "${city}, região nobre",
  "gmn_url": "https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leaderName + ' ' + city)}",
  "website": null,
  "instagram": null,
  "facebook": null,
  "waze": true,
  "uber": true,
  "99": true,
  "ifood": true
}`;

  const leaderAnalysis = await analyzeCompanyWithOpenAI(leaderAnalysisPrompt, '');
  const leaderDataAnalysis = JSON.parse(leaderAnalysis);

  console.log(`⚖️ Gerando comparação detalhada...`);

  const comparisonPrompt = `Compare "${companyName}" (empresa) com "${leaderName}" (líder do segmento) em 12 critérios.

Dados da Empresa:
${JSON.stringify(companyData, null, 2)}

Dados do Líder:
${JSON.stringify(leaderDataAnalysis, null, 2)}

Retorne um JSON com comparação detalhada em 12 critérios:
{
  "criteria": [
    {
      "name": "Perfil Verificado",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2", "sugestão 3"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Avaliações e Nota",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Consistência NAP",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Produtos/Serviços",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Galeria de Imagens",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Geolocalização",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Frequência de Posts",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Resposta a Avaliações",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Otimização SEO Local",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Engajamento do Público",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Horário de Funcionamento",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    },
    {
      "name": "Atributos e Facilidades",
      "company_score": number (0-10),
      "leader_score": number (0-10),
      "gap": number,
      "improvements": ["sugestão 1", "sugestão 2"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "strategic_recommendations": [
    "Recomendação estratégica detalhada 1 (mínimo 50 caracteres)",
    "Recomendação estratégica detalhada 2 (mínimo 50 caracteres)",
    "Recomendação estratégica detalhada 3 (mínimo 50 caracteres)",
    "Recomendação estratégica detalhada 4 (mínimo 50 caracteres)",
    "Recomendação estratégica detalhada 5 (mínimo 50 caracteres)"
  ],
  "quick_wins": [
    "Vitória rápida detalhada 1 que pode ser implementada em 30 dias",
    "Vitória rápida detalhada 2 que pode ser implementada em 30 dias",
    "Vitória rápida detalhada 3 que pode ser implementada em 30 dias",
    "Vitória rápida detalhada 4 que pode ser implementada em 30 dias",
    "Vitória rápida detalhada 5 que pode ser implementada em 30 dias"
  ],
  "long_term_goals": [
    "Meta de longo prazo detalhada 1 (90+ dias) com descrição completa",
    "Meta de longo prazo detalhada 2 (90+ dias) com descrição completa",
    "Meta de longo prazo detalhada 3 (90+ dias) com descrição completa",
    "Meta de longo prazo detalhada 4 (90+ dias) com descrição completa"
  ]
}

IMPORTANTE: PREENCHA TODOS OS ARRAYS ACIMA COM CONTEÚDO REAL E DETALHADO!`;

  const comparisonResponse = await analyzeCompanyWithOpenAI(comparisonPrompt, '');
  console.log('📋 Resposta da API (comparison):', comparisonResponse);

  let comparisonData;
  try {
    comparisonData = JSON.parse(comparisonResponse);
    console.log('✅ Critérios parseados:', comparisonData.criteria?.length || 0);
  } catch (parseError) {
    console.error('❌ Erro ao fazer parse da resposta:', parseError);
    throw new Error('A API retornou dados inválidos para a comparação.');
  }

  console.log(`📝 Gerando síntese executiva...`);

  const summaryPrompt = `Crie uma SÍNTESE EXECUTIVA comparando "${companyName}" com "${leaderName}" (líder do segmento).

Dados da Empresa:
${JSON.stringify(companyData, null, 2)}

Dados do Líder:
${JSON.stringify(leaderDataAnalysis, null, 2)}

Diferença de Score: ${companyData.overall_score - leaderDataAnalysis.overall_score}

Crie uma síntese com MÁXIMO 1000 caracteres destacando:
- Posição atual da empresa em relação ao líder
- Principais pontos fortes e fracos
- Gap mais crítico
- Perspectiva geral de melhoria

Retorne apenas o texto da síntese, sem JSON.`;

  const executiveSummary = await analyzeCompanyWithOpenAI(summaryPrompt, '');

  console.log(`🗺️ Gerando roadmap de melhorias...`);

  const roadmapPrompt = `Crie um ROADMAP DIDÁTICO (passo a passo) das melhorias que podem levar "${companyName}" ao TOP 3 do segmento.

Critérios analisados:
${JSON.stringify(comparisonData.criteria, null, 2)}

Crie uma lista de 8 a 12 passos em ordem de IMPORTÂNCIA DECRESCENTE (do mais importante ao menos importante).
Cada passo deve ser claro, objetivo e acionável.

Retorne APENAS um JSON:
{
  "roadmap": ["Passo 1: descrição detalhada", "Passo 2: descrição detalhada", ...]
}`;

  const roadmapResponse = await analyzeCompanyWithOpenAI(roadmapPrompt, '');
  const roadmapData = JSON.parse(roadmapResponse);

  console.log(`📋 Gerando análises de gap...`);

  const summaryGapPrompt = `Crie um comentário objetivo explicando o que faz "${companyName}" estar atrás de "${leaderName}".

Dados comparativos:
Empresa: Score ${companyData.overall_score}/100, ${companyData.rating} estrelas, ${companyData.total_reviews} avaliações
Líder: Score ${leaderDataAnalysis.overall_score}/100, ${leaderDataAnalysis.rating} estrelas, ${leaderDataAnalysis.total_reviews} avaliações

Crie um comentário com MÁXIMO 1000 caracteres explicando claramente os principais fatores que fazem a empresa estar atrás.
Retorne apenas o texto do comentário, sem JSON.`;

  const summaryGapAnalysis = await analyzeCompanyWithOpenAI(summaryGapPrompt, '');

  const criteriaGapPrompt = `Analise os critérios de comparação e explique objetivamente o que faz "${companyName}" estar atrás de "${leaderName}".

Critérios:
${JSON.stringify(comparisonData.criteria, null, 2)}

Crie um comentário com MÁXIMO 1000 caracteres destacando os critérios mais críticos e seu impacto.
Retorne apenas o texto do comentário, sem JSON.`;

  const criteriaGapAnalysis = await analyzeCompanyWithOpenAI(criteriaGapPrompt, '');

  const overallGap = companyData.overall_score - leaderDataAnalysis.overall_score;

  // Mapear criteria para o formato correto - manter scores 0-10
  const criteriaComparison = (comparisonData.criteria || []).map((criterion: any) => ({
    name: criterion.name,
    company_score: Number(criterion.company_score) || 0,
    leader_score: Number(criterion.leader_score) || 0,
    gap: Number(criterion.gap) || (Number(criterion.leader_score) - Number(criterion.company_score)) || 0,
    improvements: Array.isArray(criterion.improvements) ? criterion.improvements : [],
    priority: criterion.priority || 'medium'
  }));

  // Validação: se não houver critérios, retornar erro
  if (!criteriaComparison || criteriaComparison.length === 0) {
    throw new Error('Não foi possível obter critérios de comparação. A API pode não ter retornado dados válidos.');
  }

  console.log(`✅ Comparação concluída com ${criteriaComparison.length} critérios`);

  // Gerar posição estimada no GMN baseada no score
  let gmnPosition = '';
  if (companyData.overall_score >= 80) {
    gmnPosition = '1º-3º posição';
  } else if (companyData.overall_score >= 65) {
    gmnPosition = '4º-7º posição';
  } else if (companyData.overall_score >= 50) {
    gmnPosition = '8º-15º posição';
  } else {
    gmnPosition = 'Abaixo do top 15';
  }

  return {
    company_name: companyName,
    company_data: {
      ...companyData,
      website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com.br`,
      gmn_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyName + ' ' + city)}`
    },
    leader_name: leaderName,
    leader_data: leaderDataAnalysis,
    gmn_position: gmnPosition,
    criteria_comparison: criteriaComparison,
    overall_gap: Math.abs(overallGap),
    strategic_recommendations: comparisonData.strategic_recommendations || [],
    quick_wins: comparisonData.quick_wins || [],
    long_term_goals: comparisonData.long_term_goals || [],
    executive_summary: executiveSummary,
    improvement_roadmap: roadmapData.roadmap || [],
    summary_gap_analysis: summaryGapAnalysis,
    criteria_gap_analysis: criteriaGapAnalysis,
  };
}
