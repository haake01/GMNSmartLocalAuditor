import jsPDF from 'jspdf';
import { CompetitiveComparison, ComparisonCriteria } from './competitiveComparison';

export async function generateComparisonPDF(data: CompetitiveComparison): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.35;

    addNewPageIfNeeded(lines.length * lineHeight + 5);

    doc.text(lines, margin, yPos);
    yPos += (lines.length * lineHeight) + 3;
  };

  const addSection = (title: string, items: string[]) => {
    addNewPageIfNeeded(30);

    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPos - 5, maxWidth, 10, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, yPos);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    items.forEach((item, index) => {
      addNewPageIfNeeded(15);

      const bullet = `${index + 1}.`;
      const lines = doc.splitTextToSize(item, maxWidth - 10);

      doc.text(bullet, margin + 2, yPos);
      doc.text(lines, margin + 8, yPos);

      yPos += (lines.length * 4) + 3;
    });

    yPos += 5;
  };

  doc.setFillColor(231, 76, 60);
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ANÁLISE COMPARATIVA COMPETITIVA', margin, 18);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.company_name} vs ${data.leader_name}`, margin, 30);

  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Relatório gerado em: ${currentDate}`, margin, 42);

  yPos = 65;

  const gapColor = data.overall_gap <= 15 ? [39, 174, 96] :
                   data.overall_gap <= 30 ? [243, 156, 18] :
                   [231, 76, 60];

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, maxWidth / 2 - 5, 30, 'F');
  doc.rect(margin + maxWidth / 2 + 5, yPos, maxWidth / 2 - 5, 30, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SUA EMPRESA', margin + 3, yPos + 8);
  doc.text('LÍDER DO MERCADO', margin + maxWidth / 2 + 8, yPos + 8);

  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185);
  doc.text(`${data.company_data.overall_score}`, margin + 20, yPos + 22);
  doc.setTextColor(39, 174, 96);
  doc.text(`${data.leader_data.overall_score}`, margin + maxWidth / 2 + 25, yPos + 22);

  yPos += 35;

  doc.setFillColor(gapColor[0], gapColor[1], gapColor[2]);
  doc.rect(margin, yPos, maxWidth, 12, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`GAP COMPETITIVO: ${data.overall_gap} PONTOS`, margin + 3, yPos + 8);

  yPos += 20;

  addText('RESUMO EXECUTIVO', 14, true, [41, 128, 185]);
  addText(data.executive_summary, 10, false);
  yPos += 5;

  addText('ANÁLISE DE GAP GERAL', 14, true, [41, 128, 185]);
  addText(data.summary_gap_analysis, 10, false);
  yPos += 5;

  const gmnAnalysis = generateGMNComparison(data);
  addSection('1. ANÁLISE COMPARATIVA DO GOOGLE MEU NEGÓCIO', gmnAnalysis);

  const criteriaAnalysis = generateCriteriaAnalysis(data);
  addSection('2. ANÁLISE DETALHADA POR CRITÉRIO', criteriaAnalysis);

  const digitalPresenceAnalysis = generateDigitalPresenceAnalysis(data);
  addSection('3. ANÁLISE DE PRESENÇA DIGITAL GERAL', digitalPresenceAnalysis);

  const competitivePositioning = generateCompetitivePositioning(data);
  addSection('4. POSICIONAMENTO COMPETITIVO E BENCHMARKING', competitivePositioning);

  const customerEngagement = generateCustomerEngagementAnalysis(data);
  addSection('5. ANÁLISE DE ENGAJAMENTO COM CLIENTES', customerEngagement);

  addSection('6. RECOMENDAÇÕES ESTRATÉGICAS PRIORITÁRIAS', data.strategic_recommendations);

  addSection('7. VITÓRIAS RÁPIDAS (30-60 DIAS)', data.quick_wins);

  addSection('8. OBJETIVOS DE LONGO PRAZO (90+ DIAS)', data.long_term_goals);

  const actionRoadmap = generateDetailedRoadmap(data);
  addSection('9. ROADMAP DE IMPLEMENTAÇÃO DETALHADO', actionRoadmap);

  addNewPageIfNeeded(40);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('_______________________________________________________________________________________________________________', margin, yPos);
  yPos += 5;
  doc.text('Relatório gerado por GMN SmartLocal Auditor PRO - Análise Comparativa Competitiva', margin, yPos);
  doc.text(`Página ${doc.internal.pages.length - 1}`, pageWidth - margin - 20, yPos);

  const filename = `Analise_Comparativa_${data.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_vs_${data.leader_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function generateGMNComparison(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  const companyVerified = data.company_data.verification_status === 'Verificado';
  const leaderVerified = data.leader_data.verification_status === 'Verificado';

  if (data.company_data.has_gmn_profile) {
    analysis.push(
      `PERFIL GMN DA SUA EMPRESA: ${companyVerified ? 'VERIFICADO ✓' : 'NÃO VERIFICADO ⚠'} | ` +
      `${data.company_data.rating}⭐ (${data.company_data.total_reviews} avaliações) | ` +
      `${data.company_data.images_count} imagens | ` +
      `${data.company_data.posts_per_week} posts/semana`
    );
  } else {
    analysis.push(
      'ALERTA CRÍTICO: Sua empresa NÃO possui perfil no Google Meu Negócio. Isso representa uma desvantagem competitiva SEVERA, ' +
      'com perda estimada de 70-80% do potencial de captura de clientes via busca local.'
    );
  }

  if (data.leader_data.has_gmn_profile) {
    analysis.push(
      `PERFIL GMN DO LÍDER (${data.leader_name}): ${leaderVerified ? 'VERIFICADO ✓' : 'NÃO VERIFICADO'} | ` +
      `${data.leader_data.rating}⭐ (${data.leader_data.total_reviews} avaliações) | ` +
      `${data.leader_data.images_count} imagens | ` +
      `${data.leader_data.posts_per_week} posts/semana`
    );
  }

  if (!companyVerified && leaderVerified) {
    analysis.push(
      'GAP CRÍTICO DE VERIFICAÇÃO: O líder possui perfil verificado, ganhando até 70% mais visibilidade nos resultados de busca. ' +
      'Verificação da sua empresa deve ser PRIORIDADE MÁXIMA para reduzir essa desvantagem.'
    );
  } else if (companyVerified && leaderVerified) {
    analysis.push(
      'PARIDADE DE VERIFICAÇÃO: Ambos os perfis são verificados, estabelecendo base igualitária para competição. ' +
      'Diferenciação agora depende de conteúdo, engajamento e otimização.'
    );
  }

  if (data.company_data.has_gmn_profile && data.leader_data.has_gmn_profile) {
    const reviewGap = data.leader_data.total_reviews - data.company_data.total_reviews;
    const ratingGap = data.leader_data.rating - data.company_data.rating;

    if (reviewGap > 50) {
      analysis.push(
        `GAP DE AVALIAÇÕES: O líder tem ${reviewGap} avaliações a mais (${data.leader_data.total_reviews} vs ${data.company_data.total_reviews}). ` +
        `Volume de reviews é fator de ranqueamento crítico. Meta: alcançar ${Math.round(data.leader_data.total_reviews * 0.7)}+ avaliações em 6 meses.`
      );
    } else if (reviewGap > 20) {
      analysis.push(
        `GAP MODERADO DE AVALIAÇÕES: ${reviewGap} avaliações de diferença. Gap recuperável com estratégia agressiva de solicitação de reviews ` +
        '(taxa de 10-15 reviews/mês).'
      );
    } else if (reviewGap > 0) {
      analysis.push(
        `PARIDADE DE AVALIAÇÕES: Diferença de apenas ${reviewGap} reviews. Manter ritmo constante de novas avaliações para não perder terreno.`
      );
    }

    if (ratingGap >= 0.5) {
      analysis.push(
        `GAP DE RATING: O líder tem rating ${ratingGap.toFixed(1)} estrelas maior (${data.leader_data.rating} vs ${data.company_data.rating}). ` +
        'Foco em excelência operacional e resposta proativa a avaliações negativas é essencial para recuperar este gap.'
      );
    } else if (ratingGap > 0) {
      analysis.push(
        `RATING COMPETITIVO: Diferença de ${ratingGap.toFixed(1)} estrelas é mínima. Manter qualidade de serviço e responder 100% das avaliações.`
      );
    } else if (ratingGap < 0) {
      analysis.push(
        `VANTAGEM DE RATING: Sua empresa tem rating ${Math.abs(ratingGap).toFixed(1)} estrelas MAIOR que o líder. ` +
        'Este é um diferencial competitivo significativo - capitalize comunicando este fato em marketing.'
      );
    }

    const imageGap = data.leader_data.images_count - data.company_data.images_count;
    if (imageGap > 30) {
      analysis.push(
        `GAP DE CONTEÚDO VISUAL: O líder tem ${imageGap} imagens a mais. Perfis com 40+ imagens recebem 50% mais solicitações de direção. ` +
        `Meta imediata: adicionar ${Math.min(imageGap, 50)} imagens profissionais nos próximos 30 dias.`
      );
    } else if (imageGap > 10) {
      analysis.push(
        `CONTEÚDO VISUAL MODERADO: Diferença de ${imageGap} imagens. Adicionar 15-20 fotos de qualidade pode equalizar este gap rapidamente.`
      );
    }

    const postsGap = data.leader_data.posts_per_week - data.company_data.posts_per_week;
    if (postsGap > 1) {
      analysis.push(
        `GAP DE ATIVIDADE: O líder publica ${postsGap} posts/semana a mais. Posts regulares mantêm perfil fresco nos resultados de busca ` +
        'e demonstram negócio ativo. Meta: mínimo 2-3 posts/semana sobre promoções, novidades, horários especiais.'
      );
    }

    const responseGap = data.leader_data.review_response_rate - data.company_data.review_response_rate;
    if (responseGap > 30) {
      analysis.push(
        `GAP DE ENGAJAMENTO: O líder responde ${responseGap}% mais avaliações. Taxa de resposta acima de 80% aumenta confiança ` +
        'do consumidor em 35%. Implementar processo de resposta sistemática a TODAS avaliações em até 48h.'
      );
    }
  }

  if (data.company_data.has_gmn_profile) {
    analysis.push(
      `SCORE NAP (Name-Address-Phone) DA SUA EMPRESA: ${data.company_data.nap_consistency_score}/100. ` +
      (data.company_data.nap_consistency_score >= 90
        ? 'Excelente consistência de dados. Manter auditoria trimestral.'
        : data.company_data.nap_consistency_score >= 70
        ? 'Consistência moderada. Auditar e corrigir discrepâncias em diretórios e citações locais.'
        : 'CRÍTICO: Baixa consistência NAP prejudica ranqueamento. Correção urgente necessária em todos os diretórios.')
    );
  }

  return analysis;
}

function generateCriteriaAnalysis(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  const sortedCriteria = [...data.criteria_comparison].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || b.gap - a.gap;
  });

  sortedCriteria.forEach((criterion, index) => {
    const priorityLabel = criterion.priority === 'high' ? '🔴 ALTA' :
                          criterion.priority === 'medium' ? '🟡 MÉDIA' : '🟢 BAIXA';

    const gapStatus = criterion.gap > 20 ? 'GAP CRÍTICO' :
                      criterion.gap > 10 ? 'GAP SIGNIFICATIVO' :
                      criterion.gap > 0 ? 'GAP MODERADO' : 'PARIDADE/VANTAGEM';

    analysis.push(
      `${criterion.name} | Prioridade: ${priorityLabel} | Status: ${gapStatus} | ` +
      `Sua empresa: ${criterion.company_score}/100 | Líder: ${criterion.leader_score}/100 | Gap: ${criterion.gap} pontos`
    );

    if (criterion.gap > 15) {
      analysis.push(
        `   ANÁLISE: Este critério apresenta defasagem significativa que impacta diretamente a competitividade. ` +
        `Gap de ${criterion.gap} pontos requer ação imediata. Cada ponto recuperado pode aumentar visibilidade em 1-2%.`
      );
    } else if (criterion.gap > 5) {
      analysis.push(
        `   ANÁLISE: Gap moderado, recuperável com ações focadas em 30-60 dias. Priorizar conforme recursos disponíveis.`
      );
    } else if (criterion.gap <= 0) {
      analysis.push(
        `   ANÁLISE: Paridade ou vantagem competitiva neste critério. Manter padrão atual e usar como diferencial em marketing.`
      );
    }

    if (criterion.improvements.length > 0) {
      const topImprovements = criterion.improvements.slice(0, 2);
      analysis.push(
        `   MELHORIAS PRIORITÁRIAS: ${topImprovements.join(' | ')}`
      );
    }
  });

  const highPriorityCriteria = sortedCriteria.filter(c => c.priority === 'high' && c.gap > 10);
  if (highPriorityCriteria.length > 0) {
    analysis.push(
      `FOCO ESTRATÉGICO: ${highPriorityCriteria.length} critério(s) de alta prioridade com gap significativo. ` +
      'Estes são os "pilares" que, se corrigidos, têm maior impacto no fechamento do gap competitivo geral. ' +
      'Recomenda-se alocar 60-70% dos recursos de otimização nestes itens.'
    );
  }

  return analysis;
}

function generateDigitalPresenceAnalysis(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  analysis.push(
    'ANÁLISE DE PRESENÇA DIGITAL OMNICHANNEL: Empresas líderes mantêm presença consistente em múltiplos canais, ' +
    'não apenas Google Meu Negócio. Avaliação dos principais pontos de contato digital:'
  );

  const channels = [
    {
      name: 'Google Meu Negócio',
      company: data.company_data.has_gmn_profile,
      leader: data.leader_data.has_gmn_profile,
      impact: 'CRÍTICO - 70-80% do tráfego discovery local'
    },
    {
      name: 'Website Próprio',
      company: data.company_data.seo_score > 50,
      leader: data.leader_data.seo_score > 50,
      impact: 'ALTO - Credibilidade e conversão'
    },
    {
      name: 'Telefone/WhatsApp',
      company: !!(data.company_data.phone || data.company_data.whatsapp),
      leader: !!(data.leader_data.phone || data.leader_data.whatsapp),
      impact: 'ALTO - Canal de conversão direta'
    },
    {
      name: 'Email Profissional',
      company: !!data.company_data.email,
      leader: !!data.leader_data.email,
      impact: 'MÉDIO - Profissionalismo e confiança'
    }
  ];

  channels.forEach(channel => {
    const status = channel.company && channel.leader ? '✓ PARIDADE' :
                   !channel.company && channel.leader ? '✗ DESVANTAGEM' :
                   channel.company && !channel.leader ? '✓ VANTAGEM' :
                   '✗ AMBOS AUSENTES';

    analysis.push(
      `${channel.name}: ${status} | Impacto: ${channel.impact}`
    );

    if (!channel.company && channel.leader && channel.impact.includes('CRÍTICO')) {
      analysis.push(
      `   URGENTE: Ausência neste canal representa perda significativa de oportunidades. Implementação imediata requerida.`
      );
    }
  });

  const seoGap = data.leader_data.seo_score - data.company_data.seo_score;
  if (seoGap > 20) {
    analysis.push(
      `GAP DE SEO/WEBSITE: Líder tem score SEO ${seoGap} pontos maior (${data.leader_data.seo_score} vs ${data.company_data.seo_score}). ` +
      'Website bem otimizado aumenta tráfego orgânico em 40-60%. Recomendação: auditoria SEO completa e otimização técnica.'
    );
  } else if (seoGap > 10) {
    analysis.push(
      `SEO/WEBSITE: Gap moderado de ${seoGap} pontos. Melhorias em conteúdo, velocidade e mobile-friendliness podem recuperar rapidamente.`
    );
  }

  if (data.company_data.whatsapp && data.leader_data.whatsapp) {
    analysis.push(
      'PARIDADE WHATSAPP: Ambos oferecem atendimento via WhatsApp. Diferencial agora é tempo de resposta e qualidade do atendimento. ' +
      'Meta: responder mensagens em menos de 15 minutos durante horário comercial.'
    );
  } else if (!data.company_data.whatsapp && data.leader_data.whatsapp) {
    analysis.push(
      'GAP WHATSAPP: Líder oferece atendimento WhatsApp, canal preferido de 70% dos brasileiros. Implementação é gratuita e pode ' +
      'aumentar taxa de conversão em 25-40%. Adicionar número WhatsApp ao GMN e website é vitória rápida.'
    );
  }

  return analysis;
}

function generateCompetitivePositioning(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  const gap = data.overall_gap;

  analysis.push(
    `POSICIONAMENTO ATUAL: Sua empresa está ${gap} pontos atrás do líder de mercado ` +
    `(${data.company_data.overall_score} vs ${data.leader_data.overall_score} pontos).`
  );

  if (gap > 30) {
    analysis.push(
      'SITUAÇÃO CRÍTICA: Gap acima de 30 pontos indica desvantagem competitiva severa. Empresa líder está capturando ' +
      '50-70% mais clientes via canais digitais. Fechamento deste gap requer investimento intensivo e coordenado em ' +
      'múltiplas frentes simultaneamente. Prazo estimado de recuperação: 4-6 meses com execução agressiva.'
    );
    analysis.push(
      'RECOMENDAÇÃO ESTRATÉGICA: Considerar abordagem de nicho - focar em sub-segmento específico ou região geográfica ' +
      'onde é possível estabelecer liderança antes de expandir para competição direta com líder geral.'
    );
  } else if (gap > 15) {
    analysis.push(
      'SITUAÇÃO DESAFIADORA: Gap de 15-30 pontos representa desvantagem significativa mas recuperável. Líder está ' +
      'capturando 25-40% mais demanda digital. Com plano de ação focado nos critérios de alta prioridade, gap pode ' +
      'ser reduzido pela metade em 2-3 meses. Investimento moderado e consistência são chave.'
    );
    analysis.push(
      'OPORTUNIDADE: Identificados quick wins que podem gerar 8-12 pontos rapidamente. Combinados com melhorias de ' +
      'médio prazo, possível alcançar paridade competitiva em 90-120 dias.'
    );
  } else {
    analysis.push(
      'SITUAÇÃO COMPETITIVA: Gap menor que 15 pontos indica competição próxima. Diferença de market share digital é ' +
      'marginal (10-20%). Pequenas melhorias podem alterar significativamente o equilíbrio. Foco deve ser em ' +
      'diferenciação qualitativa e capitalização de pontos fortes únicos.'
    );
    analysis.push(
      'ESTRATÉGIA RECOMENDADA: Manter paridade nos critérios básicos enquanto desenvolve vantagens competitivas ' +
      'sustentáveis em 2-3 critérios específicos onde pode estabelecer liderança clara.'
    );
  }

  analysis.push(
    'BENCHMARKING DE MERCADO: Baseado em dados de milhares de perfis GMN, scores típicos por segmento: ' +
    'Líderes de mercado: 75-85 pontos | Competidores médios: 55-70 pontos | Iniciantes/desotimizados: 30-50 pontos. ' +
    `Sua empresa (${data.company_data.overall_score} pontos) está posicionada no segmento: ` +
    (data.company_data.overall_score >= 75 ? 'LÍDER/TOP TIER' :
     data.company_data.overall_score >= 55 ? 'COMPETIDOR MÉDIO' :
     'INICIANTE/SUBOTIMIZADO')
  );

  if (data.company_data.overall_score < 55) {
    analysis.push(
      'ANÁLISE DE RISCO: Score abaixo de 55 pontos coloca a empresa em desvantagem contra TODOS os competidores ' +
      'médios do mercado, não apenas o líder. Risco de erosão contínua de market share. Prioridade deve ser alcançar ' +
      'patamar de competidor médio (55-70 pontos) antes de almejar liderança.'
    );
  }

  return analysis;
}

function generateCustomerEngagementAnalysis(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  analysis.push(
    'ANÁLISE DE RELACIONAMENTO E ENGAJAMENTO COM CLIENTES: Métricas que indicam qualidade da interação ' +
    'empresa-cliente e reputação construída ao longo do tempo.'
  );

  if (data.company_data.has_gmn_profile) {
    const engagementScore = data.company_data.engagement_score;

    analysis.push(
      `SCORE DE ENGAJAMENTO DA SUA EMPRESA: ${engagementScore}/100 ` +
      (engagementScore >= 80 ? '(EXCELENTE - Cliente-cêntrico)' :
       engagementScore >= 60 ? '(BOM - Engajamento ativo)' :
       engagementScore >= 40 ? '(MODERADO - Melhorias necessárias)' :
       '(BAIXO - Engajamento negligenciado)')
    );

    if (engagementScore < 60) {
      analysis.push(
        'OPORTUNIDADE DE ENGAJAMENTO: Score abaixo de 60 indica interação insuficiente com base de clientes. ' +
        'Empresas altamente engajadas (score 80+) têm taxa de retenção 40% maior e geram 35% mais indicações boca-a-boca.'
      );
    }

    const responseRate = data.company_data.review_response_rate;
    const leaderResponseRate = data.leader_data.review_response_rate;

    analysis.push(
      `TAXA DE RESPOSTA A AVALIAÇÕES: Sua empresa ${responseRate}% | Líder ${leaderResponseRate}% | ` +
      `${responseRate >= leaderResponseRate ? 'PARIDADE/VANTAGEM ✓' : `GAP de ${leaderResponseRate - responseRate}%`}`
    );

    if (responseRate < 70) {
      analysis.push(
        'CRÍTICO - REPUTAÇÃO: Taxa de resposta abaixo de 70% transmite impressão de empresa que não valoriza feedback. ' +
        'Estudos mostram que 89% dos consumidores leem respostas a avaliações antes de decidir. META: 100% de resposta ' +
        'em até 48h. Benefícios: +25% em taxa de conversão, melhora percepção de marca em 40%.'
      );
    } else if (responseRate < 90) {
      analysis.push(
        'RESPOSTA A REVIEWS: Taxa acima de 70% é positiva, mas líder tipicamente mantém 90%+. Padronizar processo de ' +
        'monitoramento diário e templates de resposta pode fechar este gap rapidamente.'
      );
    }

    if (data.company_data.has_products) {
      analysis.push(
        'PRODUTOS/SERVIÇOS NO GMN: ✓ Sua empresa lista produtos/serviços no perfil. Este recurso aumenta ' +
        'engajamento em 30% e permite descoberta via Google Shopping. Manter catálogo atualizado com preços e fotos.'
      );
    } else {
      analysis.push(
        'OPORTUNIDADE - PRODUTOS: Adicionar produtos/serviços ao GMN permite que clientes vejam ofertas antes de visitar, ' +
        'reduz fricção de compra, e habilita integração com Google Shopping. Implementação leva 1-2h mas aumenta conversão 20-30%.'
      );
    }

    if (data.company_data.has_geotags) {
      analysis.push(
        'GEOTAGS NAS FOTOS: ✓ Imagens contêm dados de localização, melhorando relevância em buscas "perto de mim" ' +
        'e aumentando precisão do Google Maps em até 15%.'
      );
    } else {
      analysis.push(
        'OPORTUNIDADE - GEOTAGS: Adicionar geolocalização às fotos do perfil melhora ranqueamento local. Usar smartphones ' +
        'com GPS ativado ao fotografar estabelecimento e produtos.'
      );
    }
  }

  const reviewVelocity = data.company_data.total_reviews > 0 ?
    'moderada/alta' : 'baixa/inexistente';

  analysis.push(
    `VELOCIDADE DE AQUISIÇÃO DE REVIEWS: Sua empresa tem padrão ${reviewVelocity} de novas avaliações. ` +
    'Empresas líderes geram 2-5 novas reviews por semana através de processos sistemáticos (QR codes na loja, ' +
    'emails pós-compra, treinamento de equipe). Implementar programa de solicitação ativa é essencial.'
  );

  return analysis;
}

function generateDetailedRoadmap(data: CompetitiveComparison): string[] {
  const roadmap: string[] = [];

  roadmap.push(
    'FASE 1 - FUNDAÇÕES (Dias 1-14): Correções críticas e quick wins que estabelecem base competitiva mínima.'
  );

  if (!data.company_data.has_gmn_profile) {
    roadmap.push(
      '   ⚡ Dia 1-3: Criar e verificar perfil Google Meu Negócio (verificação via cartão postal leva 7-14 dias, iniciar imediatamente).'
    );
    roadmap.push(
      '   ⚡ Dia 4-7: Preencher 100% dos campos obrigatórios + adicionais (descrição, categorias, horários, áreas de atendimento).'
    );
  } else if (data.company_data.verification_status !== 'Verificado') {
    roadmap.push(
      '   🔴 Dia 1-2: Iniciar processo de verificação GMN (CRÍTICO - sem verificação, perfil tem visibilidade 70% menor).'
    );
  }

  const highGapCriteria = data.criteria_comparison
    .filter(c => c.priority === 'high' && c.gap > 15)
    .slice(0, 3);

  if (highGapCriteria.length > 0) {
    roadmap.push(
      `   🔴 Dia 3-14: Focar nos 3 gaps mais críticos: ${highGapCriteria.map(c => c.name).join(', ')}. ` +
      'Cada critério de alta prioridade fechado gera 5-8 pontos de recuperação.'
    );
  }

  if (data.company_data.images_count < 20) {
    roadmap.push(
      '   📸 Dia 5-10: Sessão fotográfica profissional. Meta: 30+ imagens de alta qualidade (fachada, interior, produtos, equipe, clientes). ' +
      'Perfis com 30+ fotos recebem 60% mais solicitações de direção.'
    );
  }

  roadmap.push(
    'FASE 2 - ACELERAÇÃO (Dias 15-45): Implementação de melhorias estruturais e início de atividades contínuas.'
  );

  if (data.company_data.review_response_rate < 90) {
    roadmap.push(
      '   💬 Dia 15: Estabelecer processo de resposta a avaliações. Responsável dedicado, templates de resposta, SLA de 48h. ' +
      'Meta: alcançar 100% de resposta em 30 dias.'
    );
  }

  roadmap.push(
    '   📱 Dia 15-20: Implementar estratégia de geração de reviews (QR codes físicos, email pós-venda, script de solicitação para equipe). ' +
    'Meta: 10-15 novas reviews por mês.'
  );

  if (!data.company_data.has_products) {
    roadmap.push(
      '   🛍️ Dia 20-25: Catalogar e adicionar produtos/serviços ao GMN. Incluir preços, descrições, fotos individuais. ' +
      'Atualizar mensalmente com promoções e novidades.'
    );
  }

  roadmap.push(
    '   📝 Dia 25-30: Estabelecer calendário de posts GMN. Mínimo 2 posts/semana sobre: promoções, horários especiais, ' +
    'novos produtos, eventos, bastidores. Posts mantêm perfil fresco e aumentam engajamento 35%.'
  );

  if (data.company_data.seo_score < 60) {
    roadmap.push(
      '   🌐 Dia 30-45: Website/SEO: Auditoria técnica (velocidade, mobile, estrutura). Otimização on-page (títulos, meta descriptions, ' +
      'conteúdo local). Publicar 4-6 artigos de blog sobre tópicos locais relevantes.'
    );
  }

  roadmap.push(
    'FASE 3 - EXPANSÃO (Dias 46-90): Escalar presença digital e estabelecer vantagens competitivas sustentáveis.'
  );

  roadmap.push(
    '   🚀 Dia 46-60: Expandir para plataformas secundárias (Apple Maps, Waze, TripAdvisor se aplicável). ' +
    'Presença omnichannel aumenta descoberta em 40-60%.'
  );

  roadmap.push(
    '   📊 Dia 50: Primeira avaliação de resultados. Comparar métricas vs. baseline: visualizações de perfil, cliques em telefone/site, ' +
    'solicitações de direção, novas reviews. Esperado: crescimento 20-30% em cada métrica.'
  );

  roadmap.push(
    '   🎯 Dia 60-75: Implementar estratégias avançadas: Google Posts com CTAs, perguntas e respostas proativas no GMN, ' +
    'promoções exclusivas para clientes digitais, integração WhatsApp Business API.'
  );

  roadmap.push(
    '   💰 Dia 75-90: Considerar investimento em Google Ads Local (se budget permitir). Empresas com GMN otimizado + Ads Local ' +
    'veem ROI 4-6x. Começar com budget teste de R$ 500-1000/mês.'
  );

  roadmap.push(
    'FASE 4 - LIDERANÇA (Dias 90+): Consolidar vantagens e estabelecer liderança sustentável no segmento local.'
  );

  roadmap.push(
    '   🏆 Dia 90: Segunda avaliação comparativa completa. Meta: reduzir gap competitivo em 40-60% (de ' +
    `${data.overall_gap} para ~${Math.round(data.overall_gap * 0.5)} pontos).`
  );

  roadmap.push(
    '   📈 Dia 90-120: Escalar o que funciona. Dobrar frequência de posts, expandir catálogo de produtos, implementar ' +
    'programa de fidelidade digital, criar conteúdo em vídeo para GMN.'
  );

  roadmap.push(
    '   🎓 Dia 120+: Governança e melhoria contínua. Auditorias mensais, benchmarking trimestral com concorrentes, ' +
    'testes A/B em descrições/CTAs, expansão para novas plataformas emergentes.'
  );

  return roadmap;
}
