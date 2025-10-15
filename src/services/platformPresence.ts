export interface PlatformPresenceCheck {
  platform: string;
  present: boolean;
  verified: boolean;
  score: number;
  details: string;
  url?: string;
  mapImageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface MultiPlatformAnalysis {
  company_name: string;
  google_maps: PlatformPresenceCheck;
  apple_maps: PlatformPresenceCheck;
  waze: PlatformPresenceCheck;
  uber: PlatformPresenceCheck;
  ninety_nine: PlatformPresenceCheck;
  tripadvisor: PlatformPresenceCheck;
  overall_presence_score: number;
  missing_platforms: string[];
  recommendations: string[];
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;


const PLATFORM_ANALYSIS_PROMPT = `
Você é um especialista em presença digital multiplataforma.

Analise a presença da seguinte empresa nas principais plataformas de mapas e mobilidade:

EMPRESA: {company_name}
CIDADE: {city}
ESTADO: {state}
ENDEREÇO: {address}
CATEGORIA: {category}

Plataformas para verificar:
1. Google Maps (GMN/GMB)
2. Apple Maps
3. Waze
4. Uber (listagem de estabelecimentos)
5. 99 (listagem de estabelecimentos)
6. TripAdvisor (se aplicável ao segmento)

Para cada plataforma, avalie:
- Presença (cadastrado ou não) - Se NÃO encontrado, use "present": false e details: "Registro inexistente"
- Verificação (perfil verificado)
- Qualidade das informações
- Score de 0 a 100
- Se presente, incluir URL e coordenadas (latitude/longitude)

IMPORTANTE: Se a empresa NÃO estiver cadastrada em uma plataforma, use:
- "present": false
- "verified": false
- "score": 0
- "details": "Registro inexistente"

Retorne APENAS um JSON válido:

{
  "google_maps": {
    "platform": "Google Maps",
    "present": true,
    "verified": true,
    "score": 85,
    "details": "Perfil completo e verificado com 127 avaliações",
    "url": "https://...",
    "latitude": -23.550520,
    "longitude": -46.633308
  },
  "apple_maps": {
    "platform": "Apple Maps",
    "present": false,
    "verified": false,
    "score": 0,
    "details": "Registro inexistente"
  },
  "waze": {
    "platform": "Waze",
    "present": true,
    "verified": false,
    "score": 60,
    "details": "Localização presente mas sem verificação",
    "url": null
  },
  "uber": {
    "platform": "Uber",
    "present": false,
    "verified": false,
    "score": 0,
    "details": "Não listado no Uber",
    "url": null
  },
  "ninety_nine": {
    "platform": "99",
    "present": false,
    "verified": false,
    "score": 0,
    "details": "Não listado no 99",
    "url": null
  },
  "tripadvisor": {
    "platform": "TripAdvisor",
    "present": true,
    "verified": true,
    "score": 75,
    "details": "Perfil ativo com 43 avaliações",
    "url": "https://..."
  },
  "overall_presence_score": 45,
  "missing_platforms": ["Apple Maps", "Uber", "99"],
  "recommendations": [
    "URGENTE: Criar perfil no Apple Maps para alcançar 30% dos usuários móveis (iOS)",
    "Cadastrar estabelecimento no Uber para aumentar visibilidade em buscas de clientes",
    "Adicionar localização no app 99 para captar usuários de transporte alternativo",
    "Otimizar perfil do TripAdvisor: adicionar 20+ fotos profissionais e responder todas avaliações",
    "Google Maps: atualizar horários especiais, adicionar menu/produtos e fazer posts semanais"
  ]
}

IMPORTANTE SOBRE RECOMENDAÇÕES:
- Sempre forneça 5 recomendações práticas e acionáveis
- Priorize plataformas ausentes primeiro
- Para plataformas existentes, sugira otimizações específicas
- Use dados quantitativos quando possível (ex: "adicionar 20+ fotos")
- Foque em ações que aumentam visibilidade, conversão e reputação
- NUNCA mencione erros técnicos, APIs ou problemas de sistema
- Todas recomendações devem ser voltadas para o NEGÓCIO DO CLIENTE

`;

export async function checkMultiPlatformPresence(
  companyName: string,
  city: string,
  state: string,
  address: string,
  category: string
): Promise<MultiPlatformAnalysis> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = PLATFORM_ANALYSIS_PROMPT
    .replace('{company_name}', companyName)
    .replace('{city}', city)
    .replace('{state}', state)
    .replace('{address}', address)
    .replace('{category}', category);

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
            content: 'Você é um especialista em presença digital multiplataforma. Responda SEMPRE em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        timeout: 15000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || '';

    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(content);

    return {
      company_name: companyName,
      ...analysis
    };
  } catch (error) {
    console.error('Error checking platform presence:', error);

    return {
      company_name: companyName,
      google_maps: { platform: 'Google Maps', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      apple_maps: { platform: 'Apple Maps', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      waze: { platform: 'Waze', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      uber: { platform: 'Uber', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      ninety_nine: { platform: '99', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      tripadvisor: { platform: 'TripAdvisor', present: false, verified: false, score: 0, details: 'Análise indisponível no momento' },
      overall_presence_score: 0,
      missing_platforms: [],
      recommendations: [
        'Realize cadastro gratuito no Google Meu Negócio para aumentar visibilidade local',
        'Considere criar perfis em plataformas de mobilidade (Uber, 99) se aplicável ao seu negócio',
        'Mantenha informações de endereço, telefone e horário sempre atualizados',
        'Solicite avaliações de clientes satisfeitos para melhorar reputação online',
        'Use fotos de qualidade profissional em todos os perfis'
      ]
    };
  }
}
