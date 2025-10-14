import { generatePlatformAnalysisPDF } from './src/services/platformPdfExport.js';
import { generateComparisonPDF } from './src/services/comparisonPdfExport.js';

const samplePlatformData = {
  company_name: "Restaurante Bella Vista",
  google_maps: {
    platform: "Google Meu Negócio",
    present: true,
    verified: true,
    score: 85,
    details: "Perfil completo e verificado com 243 avaliações (4.6⭐). 45 fotos, posts semanais ativos.",
    url: "https://maps.google.com",
    latitude: -23.550520,
    longitude: -46.633308
  },
  apple_maps: {
    platform: "Apple Maps",
    present: true,
    verified: false,
    score: 68,
    details: "Perfil ativo com informações básicas. Recomenda-se adicionar mais fotos e horários especiais."
  },
  waze: {
    platform: "Waze",
    present: true,
    verified: true,
    score: 72,
    details: "Localização verificada. 89 relatórios de usuários confirmando presença."
  },
  uber: {
    platform: "Uber",
    present: false,
    verified: false,
    score: 0,
    details: "Estabelecimento não cadastrado. Oportunidade de alcançar 22 milhões de usuários mensais."
  },
  ninety_nine: {
    platform: "99",
    present: false,
    verified: false,
    score: 0,
    details: "Ausente na plataforma. Cadastro recomendado para expandir canais de captação."
  },
  tripadvisor: {
    platform: "TripAdvisor",
    present: true,
    verified: true,
    score: 78,
    details: "157 avaliações (4.5⭐). Perfil bem mantido com fotos do menu e ambiente."
  },
  overall_presence_score: 67,
  missing_platforms: ["Uber", "99"],
  recommendations: [
    "URGENTE: Cadastrar estabelecimento no Uber para alcançar 22 milhões de usuários ativos mensais",
    "Adicionar localização no app 99 para captar usuários de transporte alternativo na região",
    "Otimizar perfil do Apple Maps: adicionar 15+ fotos profissionais de pratos e ambiente",
    "Google Maps: configurar horários especiais (feriados, eventos) e adicionar cardápio completo como produto",
    "TripAdvisor: responder 100% das avaliações pendentes (atualmente 65% de taxa de resposta)"
  ]
};

const sampleComparisonData = {
  company_name: "Padaria Pão Quente",
  company_data: {
    has_gmn_profile: true,
    verification_status: "Não Verificado",
    rating: 4.2,
    total_reviews: 87,
    nap_consistency_score: 75,
    has_products: true,
    images_count: 18,
    has_geotags: false,
    posts_per_week: 1,
    review_response_rate: 45,
    seo_score: 52,
    engagement_score: 58,
    overall_score: 62,
    email: "contato@paoqueente.com.br",
    phone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    address: "Rua das Flores, 123 - Centro"
  },
  leader_name: "Panificadora Estrela",
  leader_data: {
    has_gmn_profile: true,
    verification_status: "Verificado",
    rating: 4.7,
    total_reviews: 342,
    nap_consistency_score: 95,
    has_products: true,
    images_count: 67,
    has_geotags: true,
    posts_per_week: 3,
    review_response_rate: 98,
    seo_score: 85,
    engagement_score: 92,
    overall_score: 88,
    email: "contato@estrela.com.br",
    phone: "(11) 3456-7890",
    whatsapp: "(11) 99876-5432",
    address: "Av. Principal, 456 - Centro"
  },
  criteria_comparison: [
    {
      name: "Verificação do Perfil",
      company_score: 0,
      leader_score: 100,
      gap: 100,
      improvements: [
        "Iniciar processo de verificação GMN imediatamente (via cartão postal)",
        "Completar todas informações obrigatórias para qualificar verificação"
      ],
      priority: "high"
    },
    {
      name: "Volume de Avaliações",
      company_score: 55,
      leader_score: 95,
      gap: 40,
      improvements: [
        "Implementar QR codes na loja solicitando avaliações",
        "Enviar email pós-compra com link direto para avaliar",
        "Treinar equipe para solicitar reviews de clientes satisfeitos"
      ],
      priority: "high"
    },
    {
      name: "Qualidade do Rating",
      company_score: 84,
      leader_score: 94,
      gap: 10,
      improvements: [
        "Manter excelência no atendimento e produtos",
        "Responder proativamente avaliações negativas em até 24h"
      ],
      priority: "medium"
    },
    {
      name: "Conteúdo Visual (Fotos)",
      company_score: 45,
      leader_score: 90,
      gap: 45,
      improvements: [
        "Contratar sessão fotográfica profissional (30+ imagens)",
        "Incluir fotos de: fachada, interior, produtos, equipe, bastidores",
        "Adicionar fotos novas mensalmente (promoções, produtos novos)"
      ],
      priority: "high"
    },
    {
      name: "Taxa de Resposta a Avaliações",
      company_score: 45,
      leader_score: 98,
      gap: 53,
      improvements: [
        "Designar responsável para monitorar reviews diariamente",
        "Criar templates de resposta para agilizar processo",
        "Estabelecer SLA de 48h para responder 100% das avaliações"
      ],
      priority: "high"
    },
    {
      name: "Frequência de Posts",
      company_score: 33,
      leader_score: 100,
      gap: 67,
      improvements: [
        "Criar calendário editorial com 2-3 posts por semana",
        "Postar sobre: promoções, horários especiais, produtos novos, bastidores"
      ],
      priority: "medium"
    },
    {
      name: "SEO e Website",
      company_score: 52,
      leader_score: 85,
      gap: 33,
      improvements: [
        "Auditoria técnica SEO (velocidade, mobile-friendly)",
        "Otimizar meta tags e criar conteúdo local relevante",
        "Adicionar schema markup para negócio local"
      ],
      priority: "medium"
    },
    {
      name: "Engajamento Geral",
      company_score: 58,
      leader_score: 92,
      gap: 34,
      improvements: [
        "Responder 100% perguntas e mensagens em até 2h durante horário comercial",
        "Criar programa de fidelidade digital integrado ao GMN"
      ],
      priority: "medium"
    }
  ],
  overall_gap: 26,
  strategic_recommendations: [
    "PRIORIDADE MÁXIMA: Iniciar verificação do perfil GMN imediatamente - sem verificação, visibilidade é 70% menor",
    "Implementar estratégia agressiva de geração de reviews: meta de 15-20 novas avaliações por mês nos próximos 3 meses",
    "Sessão fotográfica profissional urgente: contratar fotógrafo para capturar 30+ imagens de alta qualidade",
    "Estabelecer processo sistemático de resposta a avaliações: 100% de resposta em até 48h",
    "Criar calendário editorial de posts GMN: mínimo 2 posts por semana sobre promoções e novidades"
  ],
  quick_wins: [
    "Dia 1-3: Iniciar processo de verificação GMN via correios (chega em 7-14 dias)",
    "Dia 1-7: Adicionar 20+ fotos existentes de produtos e ambiente ao perfil GMN",
    "Dia 3-5: Implementar QR codes físicos na loja solicitando avaliações Google",
    "Dia 5-10: Responder TODAS as avaliações pendentes (87 reviews) com mensagens personalizadas",
    "Dia 7-14: Configurar posts semanais automáticos sobre promoções e horário de funcionamento"
  ],
  long_term_goals: [
    "90 dias: Alcançar 150+ avaliações totais (atualmente 87) com rating mantido em 4.2+",
    "90 dias: Reduzir gap competitivo de 26 para menos de 15 pontos",
    "120 dias: Atingir 100% de taxa de resposta a avaliações e manter consistentemente",
    "120 dias: Perfil GMN verificado com 50+ imagens profissionais e 3 posts por semana",
    "180 dias: Score geral acima de 75 pontos, posicionando-se como competidor direto do líder"
  ],
  executive_summary: "A Padaria Pão Quente possui presença digital estabelecida mas subotimizada, com score de 62 pontos contra 88 do líder Panificadora Estrela (gap de 26 pontos). Este gap representa aproximadamente 25-35% menos captação de clientes via canais digitais. O principal problema crítico é a falta de verificação do perfil GMN, que sozinha reduz visibilidade em até 70%. Além disso, gaps significativos em volume de avaliações (87 vs 342), conteúdo visual (18 vs 67 fotos), taxa de resposta (45% vs 98%) e frequência de posts (1 vs 3 por semana) criam desvantagem competitiva substancial. Entretanto, o gap é totalmente recuperável em 90-120 dias com execução focada nas prioridades identificadas. Quick wins como verificação, fotos e resposta a reviews podem gerar 10-12 pontos de melhoria nos primeiros 30 dias. A boa notícia é que o rating de 4.2⭐ é competitivo, indicando qualidade de produto/serviço sólida - o desafio é puramente de otimização de presença digital.",
  improvement_roadmap: [
    "Semana 1-2: Verificação GMN + responder todas reviews pendentes + adicionar 20+ fotos",
    "Semana 3-4: Implementar QR codes + iniciar posts semanais + otimizar informações do perfil",
    "Mês 2: Sessão fotográfica profissional + campanha reviews + estabelecer processo resposta sistemático",
    "Mês 3: Avaliar resultados + ajustar estratégia + escalar o que funciona",
    "Mês 4-6: Manter consistência + expandir para outras plataformas + considerar Google Ads Local"
  ],
  summary_gap_analysis: "Com 26 pontos de diferença (62 vs 88), a Padaria Pão Quente está em posição desafiadora mas não crítica. O gap está concentrado em 4 áreas principais: (1) Verificação inexistente do perfil (-100 pontos no critério), (2) Volume insuficiente de avaliações (-40 pontos), (3) Baixa taxa de resposta a reviews (-53 pontos), e (4) Conteúdo visual limitado (-45 pontos). Positivamente, o rating de 4.2 e presença ativa no GMN demonstram fundação sólida. A estratégia recomendada é atacar os 4 critérios de alta prioridade simultaneamente nos primeiros 30 dias (verificação, reviews, resposta, fotos), o que deve gerar 8-12 pontos de recuperação. Nos 60 dias seguintes, focar em consistência e melhorias estruturais (posts regulares, SEO, engajamento). Prazo realista para reduzir gap pela metade (de 26 para 13 pontos): 90 dias com execução disciplinada.",
  criteria_gap_analysis: "Análise dos 8 critérios principais revela padrão claro: empresa tem presença básica estabelecida mas carece de otimização avançada e consistência. Critérios de alta prioridade com maior gap: Verificação (gap 100), Taxa de Resposta (gap 53), Frequência Posts (gap 67), Volume Reviews (gap 40) e Fotos (gap 45). Juntos, estes representam 75% do gap total. Critérios onde empresa está mais competitiva: Rating (gap 10) e NAP Consistency (gap moderado). Isso sugere que operação do negócio é boa (clientes satisfeitos = bom rating), mas marketing digital e gestão de reputação online estão negligenciados. Estratégia vencedora: alavancar qualidade existente do produto/serviço para gerar mais reviews e conteúdo visual, enquanto corrige gaps técnicos (verificação, resposta sistemática, posts regulares)."
};

console.log('Gerando Relatório 1: Presença Multiplataforma...');
await generatePlatformAnalysisPDF(samplePlatformData);
console.log('✓ Relatório 1 gerado com sucesso!');

console.log('\nGerando Relatório 2: Análise Comparativa Competitiva...');
await generateComparisonPDF(sampleComparisonData);
console.log('✓ Relatório 2 gerado com sucesso!');

console.log('\n✅ Ambos os relatórios PDF modelo foram gerados!');
console.log('Verifique os arquivos na pasta do projeto.');
