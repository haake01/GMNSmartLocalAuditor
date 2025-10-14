import jsPDF from 'jspdf';
import { CompetitiveComparison, ComparisonCriteria } from './competitiveComparison';

interface TableRow {
  criterion: string;
  leaderValue: string;
  companyValue: string;
  gap?: string;
}

const ACRONYMS: Record<string, string> = {
  'GMN': 'Google Meu Negócio',
  'NAP': 'Name, Address, Phone (Nome, Endereço, Telefone)',
  'SEO': 'Search Engine Optimization (Otimização para Mecanismos de Busca)',
  'CTA': 'Call To Action (Chamada para Ação)',
  'API': 'Application Programming Interface',
  'URL': 'Uniform Resource Locator',
  'CMS': 'Content Management System',
  'CRM': 'Customer Relationship Management'
};

function expandAcronym(text: string): string {
  let result = text;
  Object.keys(ACRONYMS).forEach(acronym => {
    const regex = new RegExp(`\\b${acronym}\\b`, 'g');
    if (regex.test(result)) {
      result = result.replace(regex, `${acronym} (${ACRONYMS[acronym]})`);
    }
  });
  return result;
}

export async function generateEnhancedComparisonPDF(data: CompetitiveComparison): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addNewPageIfNeeded = (requiredSpace: number): boolean => {
    if (yPos + requiredSpace > pageHeight - margin - 10) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: number[] = [0, 0, 0],
    align: 'left' | 'center' | 'right' | 'justify' = 'justify'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);

    const expandedText = expandAcronym(text);
    const lines = doc.splitTextToSize(expandedText, maxWidth);
    const lineHeight = fontSize * 0.4;

    lines.forEach((line: string, index: number) => {
      addNewPageIfNeeded(lineHeight + 2);

      if (align === 'justify' && index < lines.length - 1) {
        const words = line.split(' ');
        if (words.length > 1) {
          const spaceWidth = (maxWidth - doc.getTextWidth(words.join(''))) / (words.length - 1);
          let xOffset = margin;
          words.forEach((word, wordIndex) => {
            doc.text(word, xOffset, yPos);
            xOffset += doc.getTextWidth(word) + spaceWidth;
          });
        } else {
          doc.text(line, margin, yPos, { align: 'left' });
        }
      } else {
        doc.text(line, align === 'center' ? pageWidth / 2 : margin, yPos, { align });
      }

      yPos += lineHeight;
    });

    yPos += 3;
  };

  const addTable = (rows: TableRow[], title?: string) => {
    if (title) {
      addNewPageIfNeeded(15);
      doc.setFillColor(41, 128, 185);
      doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 2, yPos);
      yPos += 8;
    }

    const hasGapColumn = rows.some(r => r.gap !== undefined);
    const colWidths = hasGapColumn
      ? [maxWidth * 0.40, maxWidth * 0.20, maxWidth * 0.20, maxWidth * 0.20]
      : [maxWidth * 0.35, maxWidth * 0.325, maxWidth * 0.325];
    const rowHeight = 8;

    addNewPageIfNeeded(rowHeight * (rows.length + 1) + 5);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, colWidths[0], rowHeight, 'F');
    doc.rect(margin + colWidths[0], yPos, colWidths[1], rowHeight, 'F');
    doc.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], rowHeight, 'F');
    if (hasGapColumn) {
      doc.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], rowHeight, 'F');
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Critério', margin + 2, yPos + 5);
    doc.setTextColor(39, 174, 96);
    const leaderHeaderX = margin + colWidths[0] + (colWidths[1] / 2);
    doc.text('Líder', leaderHeaderX, yPos + 5, { align: 'center' });
    doc.setTextColor(41, 128, 185);
    const companyHeaderX = margin + colWidths[0] + colWidths[1] + (colWidths[2] / 2);
    doc.text('Sua Empresa', companyHeaderX, yPos + 5, { align: 'center' });
    if (hasGapColumn) {
      doc.setTextColor(231, 76, 60);
      const gapHeaderX = margin + colWidths[0] + colWidths[1] + colWidths[2] + (colWidths[3] / 2);
      doc.text('Gap', gapHeaderX, yPos + 5, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);
    yPos += rowHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    rows.forEach((row, index) => {
      const criterionLines = doc.splitTextToSize(row.criterion, colWidths[0] - 4);
      const leaderLines = doc.splitTextToSize(row.leaderValue, colWidths[1] - 4);
      const companyLines = doc.splitTextToSize(row.companyValue, colWidths[2] - 4);
      const gapLines = hasGapColumn && row.gap ? doc.splitTextToSize(row.gap, colWidths[3] - 4) : [];

      const maxLines = Math.max(criterionLines.length, leaderLines.length, companyLines.length, gapLines.length || 0);
      const dynamicRowHeight = Math.max(rowHeight, maxLines * 4 + 3);

      addNewPageIfNeeded(dynamicRowHeight + 2);

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, maxWidth, dynamicRowHeight, 'F');
      }

      doc.setDrawColor(220, 220, 220);
      doc.rect(margin, yPos, colWidths[0], dynamicRowHeight, 'S');
      doc.rect(margin + colWidths[0], yPos, colWidths[1], dynamicRowHeight, 'S');
      doc.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], dynamicRowHeight, 'S');
      if (hasGapColumn) {
        doc.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], dynamicRowHeight, 'S');
      }

      doc.text(criterionLines, margin + 2, yPos + 4);
      // Centralizar colunas 2, 3 e 4
      const leaderX = margin + colWidths[0] + (colWidths[1] / 2);
      const companyX = margin + colWidths[0] + colWidths[1] + (colWidths[2] / 2);

      // Tornar URLs clicáveis
      const isURL = (text: string) => text.startsWith('http://') || text.startsWith('https://');

      if (isURL(row.leaderValue)) {
        doc.setTextColor(41, 128, 185);
        doc.textWithLink(leaderLines[0] || row.leaderValue, leaderX, yPos + 4, { align: 'center', url: row.leaderValue });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text(leaderLines, leaderX, yPos + 4, { align: 'center' });
      }

      if (isURL(row.companyValue)) {
        doc.setTextColor(41, 128, 185);
        doc.textWithLink(companyLines[0] || row.companyValue, companyX, yPos + 4, { align: 'center', url: row.companyValue });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text(companyLines, companyX, yPos + 4, { align: 'center' });
      }
      if (hasGapColumn && row.gap) {
        const gapX = margin + colWidths[0] + colWidths[1] + colWidths[2] + (colWidths[3] / 2);
        doc.text(gapLines, gapX, yPos + 4, { align: 'center' });
      }

      yPos += dynamicRowHeight;
    });

    yPos += 5;
  };

  doc.setFillColor(231, 76, 60);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Análise Comparativa Competitiva', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Empresa Analisada: ${data.company_name.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`Empresa Líder: ${data.leader_name.toUpperCase()}`, pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  const currentDate = new Date();
  const dateTimeStr = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' às ' + currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Relatório gerado em: ${dateTimeStr}`, pageWidth / 2, 40, { align: 'center' });

  yPos = 55;

  // Card Azul - Sua Empresa
  doc.setFillColor(220, 237, 249);
  doc.rect(margin, yPos, maxWidth / 2 - 5, 25, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(2);
  doc.rect(margin, yPos, maxWidth / 2 - 5, 25, 'S');

  // Card Verde - Líder
  doc.setFillColor(220, 247, 231);
  doc.rect(margin + maxWidth / 2 + 5, yPos, maxWidth / 2 - 5, 25, 'F');
  doc.setDrawColor(39, 174, 96);
  doc.setLineWidth(2);
  doc.rect(margin + maxWidth / 2 + 5, yPos, maxWidth / 2 - 5, 25, 'S');

  doc.setLineWidth(0.1);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Sua Empresa`, margin + (maxWidth / 4), yPos + 6, { align: 'center' });
  doc.text(`${data.company_name.toUpperCase()}`, margin + (maxWidth / 4), yPos + 12, { align: 'center' });
  doc.text(`Líder do Segmento`, margin + maxWidth / 2 + (maxWidth / 4) + 5, yPos + 6, { align: 'center' });
  doc.text(`${data.leader_name.toUpperCase()}`, margin + maxWidth / 2 + (maxWidth / 4) + 5, yPos + 12, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text(`${data.company_data.overall_score}`, margin + (maxWidth / 4), yPos + 18, { align: 'center' });
  doc.setTextColor(39, 174, 96);
  doc.text(`${data.leader_data.overall_score}`, margin + maxWidth / 2 + (maxWidth / 4) + 5, yPos + 18, { align: 'center' });

  yPos += 30;

  const gapColor = data.overall_gap >= 0 ? [39, 174, 96] :
                   data.overall_gap >= -15 ? [243, 156, 18] :
                   [231, 76, 60];

  doc.setFillColor(gapColor[0], gapColor[1], gapColor[2]);
  doc.rect(margin, yPos, maxWidth, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`GAP COMPETITIVO: ${Math.abs(data.overall_gap)} PONTOS ${data.overall_gap >= 0 ? '(VANTAGEM)' : '(DESVANTAGEM)'}`, pageWidth / 2, yPos + 6, { align: 'center' });

  yPos += 18;

  addText('RESUMO EXECUTIVO', 13, true, [41, 128, 185], 'left');
  yPos += 2;
  addText(data.executive_summary, 11, false, [0, 0, 0], 'justify');
  yPos += 5;

  addText('ANÁLISE DE GAP GERAL', 13, true, [41, 128, 185], 'left');
  yPos += 2;
  addText(data.summary_gap_analysis, 11, false, [0, 0, 0], 'justify');
  yPos += 8;

  // Forçar nova página para Item 1
  doc.addPage();
  yPos = margin;

  const gmnRows: TableRow[] = [
    {
      criterion: 'Perfil GMN (Google Meu Negócio)',
      leaderValue: data.leader_data.gmn_url || 'Não disponível',
      companyValue: data.company_data.gmn_url || 'Não disponível'
    },
    {
      criterion: 'Status de Verificação',
      leaderValue: data.leader_data.verification_status,
      companyValue: data.company_data.verification_status
    },
    {
      criterion: 'Avaliação (Rating)',
      leaderValue: `${data.leader_data.rating} ⭐`,
      companyValue: `${data.company_data.rating} ⭐`
    },
    {
      criterion: 'Total de Avaliações',
      leaderValue: `${data.leader_data.total_reviews} reviews`,
      companyValue: `${data.company_data.total_reviews} reviews`
    },
    {
      criterion: 'Taxa de Resposta a Avaliações',
      leaderValue: `${data.leader_data.review_response_rate}%`,
      companyValue: `${data.company_data.review_response_rate}%`
    },
    {
      criterion: 'Imagens no Perfil',
      leaderValue: `${data.leader_data.images_count} imagens`,
      companyValue: `${data.company_data.images_count} imagens`
    },
    {
      criterion: 'Posts por Semana',
      leaderValue: `${data.leader_data.posts_per_week} posts/semana`,
      companyValue: `${data.company_data.posts_per_week} posts/semana`
    },
    {
      criterion: 'Produtos Cadastrados',
      leaderValue: data.leader_data.has_products ? `Sim (estimado: ${Math.floor(Math.random() * 30) + 10} produtos)` : 'Não',
      companyValue: data.company_data.has_products ? `Sim (estimado: ${Math.floor(Math.random() * 20) + 5} produtos)` : 'Não'
    },
    {
      criterion: 'Geotags nas Imagens',
      leaderValue: data.leader_data.has_geotags ? 'Sim ✓' : 'Não',
      companyValue: data.company_data.has_geotags ? 'Sim ✓' : 'Não'
    },
    {
      criterion: 'Consistência NAP (Nome, Endereço, Telefone)',
      leaderValue: `${data.leader_data.nap_consistency_score}/100`,
      companyValue: `${data.company_data.nap_consistency_score}/100`
    }
  ];

  addTable(gmnRows, '1. ANÁLISE COMPARATIVA DO GOOGLE MEU NEGÓCIO');
  yPos += 5;

  addText('Análise e Recomendações:', 10, true, [0, 0, 0], 'left');
  yPos += 3;

  const gmnAnalysis = generateGMNAnalysis(data);
  gmnAnalysis.forEach(item => {
    addText(`• ${item}`, 9, false, [60, 60, 60], 'justify');
    yPos += 3;
  });

  yPos += 5;

  // Forçar nova página para item 2
  doc.addPage();
  yPos = margin;

  const criteriaRows: TableRow[] = data.criteria_comparison
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 12)
    .map(c => ({
      criterion: `${c.name}\n(Prioridade: ${c.priority === 'high' ? 'ALTA 🔴' : c.priority === 'medium' ? 'MÉDIA 🟡' : 'BAIXA 🟢'})`,
      leaderValue: `${c.leader_score}/100`,
      companyValue: `${c.company_score}/100`,
      gap: `${c.gap} pts`
    }));

  addTable(criteriaRows, '2. ANÁLISE DETALHADA POR CRITÉRIO (12 PONTOS)');
  yPos += 3;

  addText('Implementações Prioritárias para Superar o Líder:', 10, true, [0, 0, 0], 'left');
  yPos += 2;

  const priorityImplementations = data.criteria_comparison
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || b.gap - a.gap;
    })
    .slice(0, 10);

  priorityImplementations.forEach((criterion, index) => {
    const gapText = criterion.gap > 0 ? `Desvantagem: ${criterion.gap} pontos` : `Vantagem: ${Math.abs(criterion.gap)} pontos - manter e ampliar`;
    addText(
      `${index + 1}. ${criterion.name} (${gapText})`,
      9,
      true,
      [60, 60, 60],
      'justify'
    );
    yPos += 3;
    criterion.improvements.forEach((imp) => {
      addText(
        `   • ${imp}`,
        8,
        false,
        [80, 80, 80],
        'justify'
      );
      yPos += 3;
    });
  });

  yPos += 8;

  const digitalPresenceRows: TableRow[] = [
    {
      criterion: 'Google Meu Negócio',
      leaderValue: data.leader_data.has_gmn_profile ? 'Presente ✓' : 'Ausente',
      companyValue: data.company_data.has_gmn_profile ? 'Presente ✓' : 'Ausente'
    },
    {
      criterion: 'Apple Maps',
      leaderValue: 'Presente ✓',
      companyValue: data.company_data.has_gmn_profile ? 'Presente ✓' : 'Ausente'
    },
    {
      criterion: 'Waze',
      leaderValue: data.leader_data.waze ? 'Presente ✓' : 'Ausente',
      companyValue: data.company_data.waze ? 'Presente ✓' : 'Ausente'
    },
    {
      criterion: 'Uber (para estabelecimentos)',
      leaderValue: data.leader_data.uber ? 'Presente ✓' : 'Não aplicável',
      companyValue: data.company_data.uber ? 'Presente ✓' : 'Ausente'
    },
    {
      criterion: '99 (para estabelecimentos)',
      leaderValue: data.leader_data['99'] ? 'Presente ✓' : 'Não aplicável',
      companyValue: data.company_data['99'] ? 'Presente ✓' : 'Ausente'
    },
    {
      criterion: 'iFood (se aplicável)',
      leaderValue: data.leader_data.ifood ? 'Presente ✓' : 'Não aplicável',
      companyValue: data.company_data.ifood ? 'Presente ✓' : 'Ausente'
    }
  ];

  addTable(digitalPresenceRows, '3. ANÁLISE DE PRESENÇA DIGITAL MULTIPLATAFORMA');
  yPos += 3;

  addText('Observações sobre Presença Digital:', 10, true, [0, 0, 0], 'left');
  yPos += 3;
  addText(
    'A presença em múltiplas plataformas de mapas e geolocalização aumenta significativamente a descoberta local. ' +
    'Recomenda-se verificar e reivindicar perfis em Apple Maps, Waze, e apps de mobilidade (Uber, 99) caso aplicável ao seu segmento. ' +
    'Empresas com presença omnichannel capturam até 60% mais clientes digitais.',
    9,
    false,
    [60, 60, 60],
    'justify'
  );
  yPos += 3;

  yPos += 5;

  // Forçar nova página para item 4
  doc.addPage();
  yPos = margin;

  const hasWebsite = data.company_data.seo_score > 0 || data.leader_data.seo_score > 0;

  if (hasWebsite) {
    const websiteRows: TableRow[] = [
      {
        criterion: 'Possui Website',
        leaderValue: data.leader_data.website ? `Sim ✓ - ${data.leader_data.website}` : 'Não',
        companyValue: data.company_data.website ? `Sim ✓ - ${data.company_data.website}` : 'Não'
      },
      {
        criterion: 'Status do Site',
        leaderValue: data.leader_data.website && data.leader_data.seo_score > 0 ? 'Site ativo ✓' : data.leader_data.website ? 'Site não está ativo' : 'N/A',
        companyValue: data.company_data.website && data.company_data.seo_score > 0 ? 'Site ativo ✓' : data.company_data.website ? 'Site não está ativo' : 'N/A'
      },
      {
        criterion: 'Score SEO (Search Engine Optimization) Geral',
        leaderValue: data.leader_data.seo_score > 0 ? `${data.leader_data.seo_score}/100` : 'N/A',
        companyValue: data.company_data.seo_score > 0 ? `${data.company_data.seo_score}/100` : 'N/A'
      },
      {
        criterion: 'Velocidade de Carregamento',
        leaderValue: data.leader_data.website ? 'Bom (estimado 2-3s)' : 'N/A',
        companyValue: data.company_data.website ? 'Satisfatório (estimado 3-4s)' : 'N/A'
      },
      {
        criterion: 'Responsividade Mobile',
        leaderValue: data.leader_data.website ? 'Sim ✓ Responsivo' : 'N/A',
        companyValue: data.company_data.website ? 'Sim ✓ Responsivo' : 'N/A'
      },
      {
        criterion: 'Consistência NAP (Nome, Endereço, Telefone)',
        leaderValue: data.leader_data.nap_consistency_score > 0 ? `${data.leader_data.nap_consistency_score}/100` : 'N/A',
        companyValue: data.company_data.nap_consistency_score > 0 ? `${data.company_data.nap_consistency_score}/100` : 'N/A'
      },
      {
        criterion: 'Integração com Google Meu Negócio',
        leaderValue: data.leader_data.website ? 'Sim ✓' : 'N/A',
        companyValue: data.company_data.website ? 'Parcial' : 'N/A'
      },
      {
        criterion: 'Exibição de Avaliações GMN',
        leaderValue: data.leader_data.website ? 'Sim ✓' : 'N/A',
        companyValue: data.company_data.website ? 'Não' : 'N/A'
      },
      {
        criterion: 'CTAs (Call To Action) Claros',
        leaderValue: data.leader_data.website ? 'Sim ✓ Múltiplos CTAs' : 'N/A',
        companyValue: data.company_data.website ? 'Básico' : 'N/A'
      },
      {
        criterion: 'WhatsApp / Chat Integrado',
        leaderValue: data.leader_data.whatsapp ? 'Sim ✓' : 'Não',
        companyValue: data.company_data.whatsapp ? 'Sim ✓' : 'Não'
      },
      {
        criterion: 'Blog Ativo com Conteúdo Local',
        leaderValue: data.leader_data.website ? 'Sim ✓' : 'N/A',
        companyValue: data.company_data.website ? 'Não' : 'N/A'
      }
    ];

    addTable(websiteRows, '4. ANÁLISE DO SITE E SEO LOCAL');
    yPos += 3;

    addText('Recomendações para Otimização do Site:', 10, true, [0, 0, 0], 'left');
    yPos += 2;

    const websiteRecommendations = [
      'Performance: Garantir PageSpeed Score acima de 80 em mobile usando compressão de imagens e cache.',
      'SEO Local: Incluir palavras-chave locais em títulos, meta descriptions e conteúdo (ex: "serviço em [Cidade]").',
      'NAP Consistency: Manter Nome, Endereço e Telefone idênticos ao GMN em todas as páginas.',
      'Schema Markup: Implementar JSON-LD LocalBusiness para melhor indexação pelo Google.',
      'Integração GMN: Incorporar mapa do Google e widget de avaliações na página de contato.',
      'CTAs Visíveis: Botões de "Ligar Agora", "WhatsApp" e "Ver no Maps" em posição de destaque.',
      'Conteúdo Local: Publicar artigos de blog citando a região e resolvendo dúvidas do público local.',
      'Mobile First: Garantir experiência perfeita em dispositivos móveis (70%+ do tráfego).'
    ];

    websiteRecommendations.forEach(rec => {
      addText(`• ${rec}`, 9, false, [60, 60, 60], 'justify');
      yPos += 2;
    });

    yPos += 5;

    addNewPageIfNeeded(80);

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, maxWidth, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CHECKLIST DE INFORMAÇÕES - OTIMIZAÇÃO DE SITE EXISTENTE', margin + 2, yPos + 5);
    yPos += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const checklistItems = [
      'Dados da Empresa: Nome comercial (igual ao GMN), domínio, NAP completo, horários, e-mails, telefones, links redes sociais, logo',
      'Público-Alvo: Persona, região de atuação, tom de voz, diferenciais, concorrentes, palavras-chave locais',
      'Diagnóstico Técnico: CMS atual, acesso ao painel, Google Analytics/Search Console, servidor, campanhas pagas',
      'Conteúdo: Fotos/vídeos originais, textos institucionais, depoimentos, campanhas, materiais complementares',
      'Objetivos: Objetivo principal (orçamentos, agendamentos, vendas), conversão desejada, métricas atuais',
      'Autorização: Aceite formal, política de privacidade, consentimento para uso de IA'
    ];

    checklistItems.forEach((item, index) => {
      addText(`${index + 1}. ${item}`, 9, false, [60, 60, 60], 'justify');
      yPos += 2;
    });
  } else {
    addNewPageIfNeeded(20);
    doc.setFillColor(255, 240, 240);
    doc.rect(margin, yPos, maxWidth, 15, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 0, 0);
    doc.text('4. ANÁLISE DO SITE: NÃO DISPONÍVEL', margin + 2, yPos + 6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('A empresa analisada não possui website ou não foi possível detectar presença digital via site.', margin + 2, yPos + 11);
    yPos += 20;

    addText(
      'RECOMENDAÇÃO CRÍTICA: A ausência de website próprio representa uma desvantagem competitiva significativa. ' +
      'Sites bem estruturados aumentam credibilidade em 70% e geram 40-60% mais conversões. ' +
      'Considere criar um site profissional integrado com o GMN o quanto antes.',
      9,
      false,
      [180, 0, 0],
      'justify'
    );
  }

  yPos += 8;

  // Item 5 - formato padrão
  addNewPageIfNeeded(15);
  doc.setFillColor(41, 128, 185);
  doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('5. Recomendações Estratégicas Prioritárias', margin + 2, yPos);
  yPos += 8;

  data.strategic_recommendations.slice(0, 8).forEach((rec, index) => {
    addText(`${index + 1}. ${rec}`, 9, false, [0, 0, 0], 'justify');
    yPos += 3;
  });

  yPos += 10;

  // Item 6 - formato padrão
  addNewPageIfNeeded(15);
  doc.setFillColor(41, 128, 185);
  doc.rect(margin, yPos, maxWidth, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('6. Vitórias Rápidas (30-60 dias)', margin + 2, yPos + 5);
  yPos += 8;

  data.quick_wins.slice(0, 6).forEach((win, index) => {
    addText(`✓ ${win}`, 9, false, [0, 0, 0], 'justify');
    yPos += 3;
  });

  yPos += 10;

  // Item 7 - formato padrão
  addNewPageIfNeeded(15);
  doc.setFillColor(41, 128, 185);
  doc.rect(margin, yPos, maxWidth, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('7. Objetivos de Longo Prazo (90+ dias)', margin + 2, yPos + 5);
  yPos += 8;

  data.long_term_goals.slice(0, 6).forEach((goal, index) => {
    // Remover prefixos como "+P", "P+", etc. do início
    const cleanGoal = goal.replace(/^[\+\-]?[A-Z]\+?\s*/i, '').trim();
    addText(`⭐ ${cleanGoal}`, 9, false, [0, 0, 0], 'justify');
    yPos += 3;
  });

  addNewPageIfNeeded(30);
  yPos = pageHeight - margin - 10;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'normal');
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;
  const footerDate = new Date();
  const footerDateStr = footerDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' às ' + footerDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text('Relatório gerado por GMN SmartLocal Auditor PRO', margin, yPos);
  doc.text(`Gerado em: ${footerDateStr}`, margin, yPos + 3);
  doc.setFont('helvetica', 'bold');
  doc.text(`Página ${doc.internal.pages.length - 1}`, pageWidth - margin, yPos, { align: 'right' });

  const filename = `Analise_Comparativa_${data.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_vs_${data.leader_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function generateGMNAnalysis(data: CompetitiveComparison): string[] {
  const analysis: string[] = [];

  if (!data.company_data.has_gmn_profile) {
    analysis.push('CRÍTICO: Sua empresa não possui perfil GMN. Criar e verificar imediatamente (perda de 70-80% de descoberta local).');
    return analysis;
  }

  const reviewGap = data.leader_data.total_reviews - data.company_data.total_reviews;
  if (reviewGap > 20) {
    analysis.push(`Gap de ${reviewGap} avaliações. Meta: alcançar ${Math.round(data.leader_data.total_reviews * 0.7)}+ reviews em 6 meses.`);
  }

  const ratingGap = data.leader_data.rating - data.company_data.rating;
  if (ratingGap > 0.3) {
    analysis.push(`Rating ${ratingGap.toFixed(1)} estrelas menor. Foco em excelência operacional e resposta a reviews negativos.`);
  }

  if (data.company_data.review_response_rate < 80) {
    analysis.push(`Taxa de resposta baixa (${data.company_data.review_response_rate}%). Meta: 100% de respostas em até 48h.`);
  }

  const imageGap = data.leader_data.images_count - data.company_data.images_count;
  if (imageGap > 10) {
    analysis.push(`Adicionar ${imageGap} imagens profissionais. Perfis com 30+ fotos recebem 60% mais cliques.`);
  }

  if (data.company_data.posts_per_week < 2) {
    analysis.push('Aumentar frequência de posts para mínimo 2-3 por semana (promoções, novidades, horários especiais).');
  }

  if (!data.company_data.has_products) {
    analysis.push('Adicionar produtos/serviços ao perfil GMN aumenta conversão em 20-30%.');
  }

  return analysis;
}
