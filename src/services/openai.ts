const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface AuditResult {
  overallScore: number;
  complianceStatus: 'green' | 'yellow' | 'red';
  opportunities: string[];
  suggestions: string[];
  localComparison: {
    segmentAverage: number;
    positionInSegment: string;
    keyDifferentiators: string[];
  };
  fullAnalysis: string;
  companiesData: CompanyAuditData[];
}

export interface CompanyAuditData {
  companyName: string;
  score: number;
  hasGmnProfile: boolean;
  verificationStatus: string;
  napConsistencyScore: number;
  hasProducts: boolean;
  imagesCount: number;
  hasGeotags: boolean;
  postsPerWeek: number;
  rating: number;
  totalReviews: number;
  reviewResponseRate: number;
  seoScore: number;
  engagementScore: number;
  improvementPoints: string[];
  shouldInviteForOptimization: boolean;
}

const AUDIT_PROMPT_TEMPLATE = `
Você é um especialista em auditoria de Google Meu Negócio (Google Business Profile).

Faça uma auditoria detalhada considerando este checklist completo:

📋 CHECKLIST DE AUDITORIA GMN 2025:
1. Verificação e propriedade - Perfil verificado e reivindicado corretamente
2. Consistência NAP (Nome, Endereço, Telefone) - Dados consistentes em todas as plataformas
3. Categorias e produtos - Categorias principais e secundárias otimizadas, produtos cadastrados
4. Imagens e geotags - Mínimo de 10 imagens com geolocalização
5. Postagens recentes - Mínimo de 2 postagens por semana
6. Avaliações - Quantidade, frequência, taxa de resposta acima de 80%
7. SEO local do site vinculado - Site otimizado para busca local
8. Conformidade com diretrizes GBP - Seguindo todas as políticas do Google
9. Frequência de atualização e engajamento - Perfil atualizado regularmente

SEGMENTO ANALISADO: {segment}
CIDADE: {city}

Para esta auditoria de segmento, analise as características típicas de empresas de {segment} em {city} e forneça:

1. SCORE GERAL (0 a 100): Um número único representando a média de maturidade do GMN no segmento
2. STATUS DE CONFORMIDADE:
   - 🟢 GREEN (80-100): Excelente otimização
   - 🟡 YELLOW (50-79): Otimização moderada com espaço para melhorias
   - 🔴 RED (0-49): Necessita otimização urgente

3. TOP 3 OPORTUNIDADES: Liste as 3 principais oportunidades de otimização identificadas no segmento

4. SUGESTÕES PRÁTICAS: Forneça 5 ações imediatas que empresas deste segmento podem tomar

5. COMPARATIVO LOCAL:
   - Score médio do segmento na cidade
   - Posição relativa (acima/abaixo da média)
   - 3 diferenciadores-chave que empresas líderes estão usando

6. ANÁLISE DE 5 EMPRESAS SIMULADAS: Para cada empresa fictícia típica deste segmento, forneça:
   - Nome simulado (realista para o segmento)
   - Score individual (0-100)
   - Status do perfil GMN (possui/não possui)
   - Status de verificação
   - Score de consistência NAP (0-100)
   - Possui produtos cadastrados (sim/não)
   - Quantidade de imagens (número)
   - Possui geotags nas imagens (sim/não)
   - Postagens por semana (número decimal)
   - Nota média (0-5)
   - Total de avaliações (número)
   - Taxa de resposta às avaliações (0-100%)
   - Score SEO local (0-100)
   - Score de engajamento (0-100)
   - 3-5 pontos de melhoria específicos
   - Deve ser convidada para otimização paga (sim/não)

IMPORTANTE: Retorne sua resposta EXCLUSIVAMENTE no formato JSON abaixo (sem markdown, sem texto adicional):

{
  "overallScore": 75,
  "complianceStatus": "yellow",
  "opportunities": [
    "Oportunidade 1",
    "Oportunidade 2",
    "Oportunidade 3"
  ],
  "suggestions": [
    "Sugestão 1",
    "Sugestão 2",
    "Sugestão 3",
    "Sugestão 4",
    "Sugestão 5"
  ],
  "localComparison": {
    "segmentAverage": 68,
    "positionInSegment": "Acima da média local",
    "keyDifferentiators": [
      "Diferenciador 1",
      "Diferenciador 2",
      "Diferenciador 3"
    ]
  },
  "fullAnalysis": "Análise detalhada em texto corrido sobre o segmento...",
  "companies": [
    {
      "companyName": "Nome Empresa 1",
      "score": 85,
      "hasGmnProfile": true,
      "verificationStatus": "Verificado",
      "napConsistencyScore": 90,
      "hasProducts": true,
      "imagesCount": 15,
      "hasGeotags": true,
      "postsPerWeek": 2.5,
      "rating": 4.5,
      "totalReviews": 127,
      "reviewResponseRate": 85,
      "seoScore": 78,
      "engagementScore": 82,
      "improvementPoints": [
        "Ponto 1",
        "Ponto 2",
        "Ponto 3"
      ],
      "shouldInviteForOptimization": false
    }
  ]
}
`;

export async function generateAudit(segment: string, city: string): Promise<AuditResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  const prompt = AUDIT_PROMPT_TEMPLATE
    .replace(/{segment}/g, segment)
    .replace(/{city}/g, city);

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
        max_tokens: 3000,
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
      overallScore: parsedResult.overallScore,
      complianceStatus: parsedResult.complianceStatus,
      opportunities: parsedResult.opportunities,
      suggestions: parsedResult.suggestions,
      localComparison: parsedResult.localComparison,
      fullAnalysis: parsedResult.fullAnalysis,
      companiesData: parsedResult.companies,
    };
  } catch (error) {
    console.error('Error generating audit:', error);
    throw error;
  }
}
