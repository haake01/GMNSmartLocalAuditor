import { CompanyInput } from '../utils/spreadsheetParser';

const OPENAI_API_KEY =
  process.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

export interface RealCompanyAudit {
  company_name: string;
  city: string;
  state?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
  has_gmn_profile: boolean;
  verification_status: string;
  nap_consistency_score: number;
  has_products: boolean;
  images_count: number;
  has_geotags: boolean;
  posts_per_week: number;
  rating: number;
  total_reviews: number;
  review_response_rate: number;
  seo_score: number;
  engagement_score: number;
  overall_score: number;
  improvement_points: string[];
  should_invite_for_optimization: boolean;
}

export interface BatchProgress {
  current: number;
  total: number;
  percentage: number;
  currentCompany: string;
  status: 'processing' | 'completed' | 'error';
}

const BATCH_AUDIT_PROMPT = `
Você é um especialista em auditoria de Google Meu Negócio (GMB/GMN).

Analise a seguinte empresa REAL e forneça uma auditoria completa baseada nos 12 critérios:

EMPRESA: {company_name}
CIDADE: {city}
ESTADO: {state}
CATEGORIA: {category}
TELEFONE: {phone}
ENDEREÇO: {address}
WEBSITE: {website}

📋 12 CRITÉRIOS DE AUDITORIA GMN:

1. Presença e verificação - Perfil existe e está verificado?
2. Consistência NAP - Nome, Endereço, Telefone consistentes?
3. Categorias - Categorias principais e secundárias corretas?
4. Horário de funcionamento - Horário atualizado e correto?
5. Fotos e vídeos - Mínimo de 10 fotos de qualidade?
6. Geotags nas imagens - Fotos com geolocalização?
7. Postagens recentes - Pelo menos 2 postagens por semana?
8. Avaliações - Quantidade e qualidade das avaliações?
9. Taxa de resposta - Proprietário responde avaliações?
10. Palavras-chave e SEO - Perfil otimizado para busca local?
11. Linkagem site/redes - Links para site e redes sociais?
12. Performance comparativa - Como está versus concorrentes?

IMPORTANTE: Retorne APENAS um JSON válido (sem markdown, sem texto adicional):

{
  "has_gmn_profile": true,
  "verification_status": "Verificado" | "Não verificado" | "Perfil não encontrado",
  "nap_consistency_score": 85,
  "has_products": true,
  "images_count": 15,
  "has_geotags": true,
  "posts_per_week": 2.5,
  "rating": 4.5,
  "total_reviews": 127,
  "review_response_rate": 85,
  "seo_score": 78,
  "engagement_score": 82,
  "overall_score": 75,
  "improvement_points": [
    "Adicionar mais 5 fotos de produtos",
    "Responder todas avaliações antigas",
    "Criar 2 postagens por semana",
    "Otimizar descrição com palavras-chave locais",
    "Adicionar horários especiais de feriados"
  ],
  "should_invite_for_optimization": true
}

REGRAS:
- has_gmn_profile: false se empresa NÃO tem perfil no GMN
- verification_status: "Perfil não encontrado" se não tiver perfil
- Todos os scores de 0 a 100
- overall_score: média ponderada de todos critérios
- improvement_points: 5 ações prioritárias e específicas
- should_invite_for_optimization: true se score < 70 ou não tem perfil
- rating: 0 a 5.0 (nota do Google)
- Se não tiver perfil, coloque valores baixos/zero nos campos numéricos
`;

export async function auditSingleCompany(
  company: CompanyInput
): Promise<RealCompanyAudit> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = BATCH_AUDIT_PROMPT
    .replace('{company_name}', company.company_name)
    .replace('{city}', company.city)
    .replace('{state}', company.state || 'N/A')
    .replace('{category}', company.category || 'N/A')
    .replace('{phone}', company.phone || 'N/A')
    .replace('{address}', company.address || 'N/A')
    .replace('{website}', company.website || 'N/A');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em auditoria de Google Meu Negócio. Responda SEMPRE em formato JSON válido, sem markdown ou texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const parsedResult = JSON.parse(jsonContent);

    return {
      ...company,
      ...parsedResult
    };
  } catch (error) {
    console.error(`Error auditing ${company.company_name}:`, error);
    throw error;
  }
}

export async function auditCompaniesBatch(
  companies: CompanyInput[],
  onProgress: (progress: BatchProgress) => void,
  batchSize: number = 10
): Promise<RealCompanyAudit[]> {
  const results: RealCompanyAudit[] = [];
  const total = companies.length;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);

    const batchPromises = batch.map(async (company, batchIndex) => {
      const currentIndex = i + batchIndex;

      onProgress({
        current: currentIndex + 1,
        total,
        percentage: Math.round(((currentIndex + 1) / total) * 100),
        currentCompany: company.company_name,
        status: 'processing'
      });

      try {
        const result = await auditSingleCompany(company);
        return result;
      } catch (error) {
        console.error(`Failed to audit ${company.company_name}:`, error);
        return {
          ...company,
          has_gmn_profile: false,
          verification_status: 'Erro na análise',
          nap_consistency_score: 0,
          has_products: false,
          images_count: 0,
          has_geotags: false,
          posts_per_week: 0,
          rating: 0,
          total_reviews: 0,
          review_response_rate: 0,
          seo_score: 0,
          engagement_score: 0,
          overall_score: 0,
          improvement_points: ['Erro ao processar: tente novamente'],
          should_invite_for_optimization: true
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < companies.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  onProgress({
    current: total,
    total,
    percentage: 100,
    currentCompany: 'Concluído',
    status: 'completed'
  });

  return results;
}
