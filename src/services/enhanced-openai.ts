import { getOpenAIKey, hasOpenAIKey } from '../config/apiConfig';

const FALLBACK_API_KEY = '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';

function getApiKeyWithFallback(): string {
  try {
    const key = getOpenAIKey();
    if (key && key.length > 20) {
      console.log('✅ Usando API Key do config:', key.substring(0, 20) + '...');
      return key;
    }
  } catch (e) {
    console.warn('⚠️ Erro ao buscar chave do config:', e);
  }
  console.log('🔄 Usando chave fallback');
  return FALLBACK_API_KEY;
}

console.log('OpenAI API Key configurada:', hasOpenAIKey() ? 'Sim (tamanho: ' + getOpenAIKey().length + ')' : 'NÃO');

export interface ComprehensiveAuditResult {
  overallScore: number;
  companies: CompanyFullAudit[];
  bestInSegment: {
    companyName: string;
    score: number;
    highlightedFeatures: string[];
  };
}

export interface CompanyFullAudit {
  razaoSocial: string;
  cidade: string;
  statusGMN: 'possui' | 'não possui';
  scoreGeral: number;
  melhoriasPrioritarias: string[];
  comparativoMelhorGMN: string;
  criterios: AuditCriteria;
}

export interface AuditCriteria {
  presencaVerificacao: CriterionResult;
  consistenciaNAP: CriterionResult;
  categorias: CriterionResult;
  horarioFuncionamento: CriterionResult;
  fotosVideos: CriterionResult;
  postagensRecentes: CriterionResult;
  avaliacoes: CriterionResult;
  palavrasChaveSEO: CriterionResult;
  linkagemSiteRedes: CriterionResult;
  respostasProprietario: CriterionResult;
  conformidadeGBP: CriterionResult;
  performanceComparativa: CriterionResult;
}

export interface CriterionResult {
  status: 'green' | 'yellow' | 'red';
  score: number;
  detalhes: string;
}

const COMPREHENSIVE_AUDIT_PROMPT = `
Você é um especialista em auditoria completa de Google Meu Negócio (Google Business Profile).

Faça uma auditoria detalhada e abrangente de 5 empresas reais do segmento "{segment}" na cidade "{city}".

⚠️ REGRAS CRÍTICAS PARA JSON:
- Use apenas aspas duplas (")
- NÃO use quebras de linha dentro de strings
- NÃO use aspas simples (') ou caracteres especiais sem escapar
- Textos de "detalhes" devem ter no máximo 150 caracteres
- Use ponto final simples, sem quebras de linha

📋 CRITÉRIOS DE AUDITORIA (12 ASPECTOS):

1. **Presença e Verificação da Conta GMN**
   - Perfil existe e está verificado
   - Badge de verificação ativo
   - Reivindicação de propriedade confirmada

2. **Consistência de NAP (Nome, Endereço, Telefone)**
   - Dados consistentes em todas as plataformas
   - Sem divergências entre GMN, site e redes sociais
   - Informações atualizadas

3. **Categoria Principal e Secundárias**
   - Categoria principal correta e específica
   - Categorias secundárias relevantes (mínimo 3)
   - Alinhamento com serviços oferecidos

4. **Horário de Funcionamento e Atualizações**
   - Horários completos e precisos
   - Horários especiais (feriados) configurados
   - Atualização regular

5. **Fotos e Vídeos Recentes**
   - Mínimo de 20 fotos de qualidade
   - Fotos com geotag ativado
   - Atualização mensal (mínimo 2 novas fotos/mês)
   - Presença de vídeos

6. **Postagens Recentes e Engajamento**
   - Mínimo de 2 postagens por semana
   - Engajamento (curtidas, comentários, compartilhamentos)
   - Conteúdo relevante e atrativo

7. **Avaliações (Quantidade, Nota, Tempo de Resposta, Sentimento)**
   - Mínimo de 50 avaliações
   - Nota média acima de 4.0
   - Tempo de resposta inferior a 24h
   - Análise de sentimento positiva (>80%)

8. **Palavras-chave e SEO Local**
   - Uso estratégico de palavras-chave na descrição
   - Otimização para busca local
   - Presença em queries relevantes do segmento

9. **Linkagem com Site e Redes Sociais**
   - Site vinculado e funcional
   - Links para redes sociais ativas
   - Integração completa

10. **Respostas do Proprietário e Engajamento**
    - Taxa de resposta acima de 80%
    - Respostas personalizadas e profissionais
    - Tempo médio de resposta rápido

11. **Conformidade com Diretrizes GBP**
    - Sem violações de políticas
    - Informações precisas e verdadeiras
    - Sem spam ou conteúdo inadequado

12. **Performance Comparada ao Melhor GMN do Segmento**
    - Posicionamento relativo no segmento
    - Gaps de oportunidade identificados
    - Benchmarking com líder local

---

ANALISE 8 EMPRESAS fictícias mas realistas do segmento "{segment}" em "{city}".

Para cada empresa, forneça:
- Razão Social (nome realista, sem caracteres especiais)
- Cidade
- Status GMN (possui/não possui)
- Score geral (0-100)
- 3-5 melhorias prioritárias (textos curtos, máximo 100 caracteres cada)
- Comparativo textual com o melhor GMN (máximo 150 caracteres)
- Avaliação dos 12 critérios com status (green/yellow/red), score (0-100) e detalhes (máximo 120 caracteres)

Identifique automaticamente qual empresa tem o MELHOR GMN (maior score + engajamento) para usar como benchmark.

IMPORTANTE: Retorne EXCLUSIVAMENTE no formato JSON abaixo. Use textos curtos e objetivos:

{
  "overallScore": 72,
  "companies": [
    {
      "razaoSocial": "Nome Empresa 1",
      "cidade": "Cidade",
      "statusGMN": "possui",
      "scoreGeral": 85,
      "melhoriasPrioritarias": [
        "Aumentar frequência de postagens para 3x por semana",
        "Responder 100% das avaliações em menos de 12h",
        "Adicionar 5 categorias secundárias relevantes",
        "Implementar geotag em todas as fotos",
        "Criar vídeos de apresentação dos serviços"
      ],
      "comparativoMelhorGMN": "Score 15 pontos abaixo do líder. Principal gap: frequência de postagens e engajamento com avaliações.",
      "criterios": {
        "presencaVerificacao": {
          "status": "green",
          "score": 100,
          "detalhes": "Perfil verificado e ativo desde 2021"
        },
        "consistenciaNAP": {
          "status": "green",
          "score": 95,
          "detalhes": "Dados consistentes em todas as plataformas"
        },
        "categorias": {
          "status": "yellow",
          "score": 70,
          "detalhes": "Apenas categoria principal configurada, faltam secundárias"
        },
        "horarioFuncionamento": {
          "status": "green",
          "score": 90,
          "detalhes": "Horários completos, incluindo feriados"
        },
        "fotosVideos": {
          "status": "yellow",
          "score": 65,
          "detalhes": "12 fotos, sem geotag. Precisa adicionar vídeos"
        },
        "postagensRecentes": {
          "status": "red",
          "score": 40,
          "detalhes": "Apenas 1 post por mês, baixo engajamento"
        },
        "avaliacoes": {
          "status": "yellow",
          "score": 75,
          "detalhes": "32 avaliações, nota 4.2, taxa de resposta 60%"
        },
        "palavrasChaveSEO": {
          "status": "green",
          "score": 85,
          "detalhes": "Boa otimização com palavras-chave relevantes"
        },
        "linkagemSiteRedes": {
          "status": "green",
          "score": 90,
          "detalhes": "Site e redes sociais vinculados e ativos"
        },
        "respostasProprietario": {
          "status": "red",
          "score": 50,
          "detalhes": "Taxa de resposta 60%, tempo médio 3 dias"
        },
        "conformidadeGBP": {
          "status": "green",
          "score": 100,
          "detalhes": "Totalmente conforme com diretrizes"
        },
        "performanceComparativa": {
          "status": "yellow",
          "score": 70,
          "detalhes": "Top 5 no segmento, mas com gaps nos critérios 6 e 10"
        }
      }
    }
  ],
  "bestInSegment": {
    "companyName": "Nome da Melhor Empresa",
    "score": 95,
    "highlightedFeatures": [
      "Postagens diárias com alto engajamento",
      "Resposta 100% das avaliações em menos de 2h",
      "80 fotos profissionais com geotag",
      "150+ avaliações com nota 4.8",
      "Presença em todas as queries relevantes"
    ]
  }
}
`;

export async function generateComprehensiveAudit(
  segment: string,
  city: string
): Promise<ComprehensiveAuditResult> {
  const OPENAI_API_KEY = getApiKeyWithFallback();

  console.log('═══════════════════════════════════════');
  console.log('🚀 INICIANDO AUDITORIA COM OPENAI');
  console.log('═══════════════════════════════════════');
  console.log('📍 Segmento:', segment);
  console.log('🏙️ Cidade:', city);
  console.log('🔑 API Key:', OPENAI_API_KEY.substring(0, 20) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4));
  console.log('📏 Tamanho da chave:', OPENAI_API_KEY.length, 'caracteres');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    console.error('❌ API Key inválida ou não configurada');
    throw new Error('Chave da API OpenAI não configurada. Por favor, configure a variável VITE_OPENAI_API_KEY no arquivo .env');
  }

  const prompt = COMPREHENSIVE_AUDIT_PROMPT
    .replace(/{segment}/g, segment)
    .replace(/{city}/g, city);

  console.log('📝 Tamanho do prompt:', prompt.length, 'caracteres');

  try {
    console.log('⏱️ Enviando requisição para OpenAI...');
    console.log('🌐 URL:', 'https://api.openai.com/v1/chat/completions');
    console.log('🤖 Modelo:', 'gpt-4o-mini');
    const startTime = Date.now();

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
            content: 'Você é um especialista em auditoria de Google Meu Negócio. Responda SEMPRE em formato JSON válido. IMPORTANTE: Use aspas duplas escapadas (\\") para aspas dentro de strings. Evite quebras de linha dentro de strings JSON. Seja conciso nos textos de "detalhes".'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 5000,
        response_format: { type: "json_object" }
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Resposta recebida em ${elapsed}s`);
    console.log('📊 Status HTTP:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erro HTTP detectado:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro da API OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    console.log('📦 Response OK! Fazendo parse do JSON...');
    const data = await response.json();
    console.log('📦 Dados brutos recebidos:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ Nenhum conteúdo recebido da OpenAI');
      console.error('📦 Data completo:', JSON.stringify(data, null, 2));
      throw new Error('No content received from OpenAI');
    }

    console.log('📝 Conteúdo recebido (tamanho):', content.length, 'caracteres');
    console.log('📝 Primeiros 200 chars:', content.substring(0, 200));
    console.log('📝 Processando resposta JSON...');
    let jsonContent = content.trim();

    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    console.log('🧹 Limpando JSON...');
    jsonContent = jsonContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
      .replace(/\r\n/g, ' ') // Remove quebras de linha Windows
      .replace(/\n/g, ' ') // Remove quebras de linha Unix
      .replace(/\t/g, ' ') // Remove tabs
      .replace(/\s{2,}/g, ' ') // Remove espaços múltiplos
      .trim();

    console.log('🔍 Tentando fazer parse do JSON...');
    console.log('📏 Tamanho do conteúdo a parsear:', jsonContent.length, 'caracteres');

    try {
      const parsedResult = JSON.parse(jsonContent);
      console.log('✅ JSON parseado com sucesso!');
      console.log('📊 Estrutura:', {
        hasOverallScore: 'overallScore' in parsedResult,
        hasCompanies: 'companies' in parsedResult,
        companiesCount: parsedResult.companies?.length || 0,
        hasBestInSegment: 'bestInSegment' in parsedResult
      });
      console.log('✅ Auditoria gerada com sucesso!', parsedResult.companies?.length || 0, 'empresas analisadas');
      return parsedResult;
    } catch (parseError) {
      console.error('❌ ERRO ao fazer parse do JSON:', parseError);
      console.error('📄 Conteúdo recebido (primeiros 500 chars):', jsonContent.substring(0, 500));
      console.error('📄 Conteúdo recebido (últimos 500 chars):', jsonContent.substring(Math.max(0, jsonContent.length - 500)));
      console.error('📄 Posição do erro:', parseError instanceof SyntaxError ? (parseError as any).message : 'N/A');

      throw new Error('Erro ao processar resposta da IA. O JSON retornado está malformado. Tente novamente.');
    }
  } catch (error) {
    console.error('❌ ERRO ao gerar auditoria:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
    }
    throw error;
  }
}

export async function analyzeCompanyWithOpenAI(prompt: string, context: string, forceJson: boolean = true): Promise<string> {
  const OPENAI_API_KEY = getApiKeyWithFallback();

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    throw new Error('Chave da API OpenAI não configurada. Por favor, configure a variável VITE_OPENAI_API_KEY no arquivo .env');
  }

  // Detectar se o prompt espera texto ou JSON
  const expectsText = prompt.includes('Retorne apenas o texto') || prompt.includes('sem JSON');
  const shouldForceJson = forceJson && !expectsText;

  const requestBody: any = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: shouldForceJson
          ? 'Você é um especialista em auditoria de Google Meu Negócio. Responda SEMPRE em formato JSON válido.'
          : 'Você é um especialista em auditoria de Google Meu Negócio.'
      },
      {
        role: 'user',
        content: context ? `${context}\n\n${prompt}` : prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  // Só adicionar response_format se forçar JSON
  if (shouldForceJson) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
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

  return content.trim();
}
