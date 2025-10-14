import * as XLSX from 'xlsx';
import { CompetitiveComparison } from '../services/competitiveComparison';

export function exportComparisonToExcel(comparison: CompetitiveComparison): void {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['COMPARAÇÃO COMPETITIVA - GOOGLE MEU NEGÓCIO'],
    [],
    ['Empresa Analisada:', comparison.company_name.toUpperCase()],
    ['Líder do Segmento:', comparison.leader_name.toUpperCase()],
    ['Diferença de Score:', comparison.overall_gap],
    [],
    ['CRITÉRIOS', comparison.company_name, comparison.leader_name],
    ['Email', comparison.company_data.email || 'Não disponível', comparison.leader_data.email || 'Não disponível'],
    ['Telefone', comparison.company_data.phone || 'Não disponível', comparison.leader_data.phone || 'Não disponível'],
    ['WhatsApp', comparison.company_data.whatsapp || 'Não disponível', comparison.leader_data.whatsapp || 'Não disponível'],
    ['Endereço', comparison.company_data.address || 'Não disponível', comparison.leader_data.address || 'Não disponível'],
    ['Score Geral', comparison.company_data.overall_score, comparison.leader_data.overall_score],
    ['Avaliação', comparison.company_data.rating, comparison.leader_data.rating],
    ['Total de Avaliações', comparison.company_data.total_reviews, comparison.leader_data.total_reviews],
    ['Status de Verificação', comparison.company_data.verification_status, comparison.leader_data.verification_status],
    ['Score NAP', comparison.company_data.nap_consistency_score, comparison.leader_data.nap_consistency_score],
    ['Possui Produtos', comparison.company_data.has_products ? 'Sim' : 'Não', comparison.leader_data.has_products ? 'Sim' : 'Não'],
    ['Quantidade de Imagens', comparison.company_data.images_count, comparison.leader_data.images_count],
    ['Posts por Semana', comparison.company_data.posts_per_week, comparison.leader_data.posts_per_week],
    ['Taxa de Resposta', comparison.company_data.review_response_rate, comparison.leader_data.review_response_rate],
    ['Score SEO', comparison.company_data.seo_score, comparison.leader_data.seo_score],
    ['Score de Engajamento', comparison.company_data.engagement_score, comparison.leader_data.engagement_score],
    [],
    ['ANÁLISE DO GAP'],
    [comparison.summary_gap_analysis]
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet['!cols'] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 35 }
  ];

  const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1');
  summarySheet['!autofilter'] = { ref: `A3:C3` };

  for (let i = 1; i <= summaryData.length; i++) {
    ['A', 'B', 'C'].forEach(col => {
      const cellRef = `${col}${i}`;
      if (summarySheet[cellRef]) {
        if (!summarySheet[cellRef].s) summarySheet[cellRef].s = {};
        summarySheet[cellRef].s.alignment = {
          wrapText: true,
          vertical: 'top',
          horizontal: 'center'
        };
        summarySheet[cellRef].s.font = { name: 'Segoe UI', sz: 10 };

        // Título com fundo azul e fonte 14 negrito
        if (i === 1) {
          summarySheet[cellRef].s.fill = { fgColor: { rgb: '2980B9' } };
          summarySheet[cellRef].s.font = { name: 'Segoe UI', sz: 14, color: { rgb: 'FFFFFF' }, bold: true };
        }
      }
    });
  }

  const gapRowIndex = summaryData.length - 1;
  const gapCellRef = `A${gapRowIndex}`;
  if (summarySheet[gapCellRef] && summarySheet[gapCellRef].s) {
    summarySheet[gapCellRef].s.alignment = {
      wrapText: true,
      vertical: 'top',
      horizontal: 'left'
    };
  }

  if (!summarySheet['!margins']) {
    summarySheet['!margins'] = { left: 0.3, right: 0.3, top: 0.3, bottom: 0.3, header: 0.2, footer: 0.2 };
  }
  if (!summarySheet['!printOptions']) {
    summarySheet['!printOptions'] = {};
  }
  summarySheet['!printOptions'].orientation = 'landscape';
  summarySheet['!printOptions'].scale = 80;

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  const criteriaData = [
    ['COMPARAÇÃO POR CRITÉRIO'],
    [],
    ['Critério', 'Score Empresa', 'Score Líder', 'Gap', 'Prioridade', 'Sugestões de Melhoria']
  ];

  comparison.criteria_comparison.forEach(criterion => {
    criteriaData.push([
      criterion.name,
      criterion.company_score.toString(),
      criterion.leader_score.toString(),
      criterion.gap.toString(),
      criterion.priority === 'high' ? 'Alta' : criterion.priority === 'medium' ? 'Média' : 'Baixa',
      criterion.improvements.join('\n')
    ]);
  });

  criteriaData.push([]);
  criteriaData.push(['ANÁLISE DO GAP']);
  criteriaData.push([comparison.criteria_gap_analysis]);

  const criteriaSheet = XLSX.utils.aoa_to_sheet(criteriaData);

  criteriaSheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 45 }
  ];

  const criteriaRange = XLSX.utils.decode_range(criteriaSheet['!ref'] || 'A1');
  criteriaSheet['!autofilter'] = { ref: `A3:F3` };

  for (let i = 1; i <= criteriaData.length; i++) {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
      const cellRef = `${col}${i}`;
      if (criteriaSheet[cellRef]) {
        if (!criteriaSheet[cellRef].s) criteriaSheet[cellRef].s = {};

        // Coluna F com quebra e alinhamento esquerdo, demais centralizadas
        const alignment = col === 'F'
          ? { wrapText: true, vertical: 'top', horizontal: 'left' }
          : { wrapText: true, vertical: 'top', horizontal: 'center' };

        criteriaSheet[cellRef].s.alignment = alignment;
        criteriaSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10 };

        if (i === 3) {
          criteriaSheet[cellRef].s.fill = { fgColor: { rgb: '000000' } };
          criteriaSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true };
        }
      }
    });
  }

  // Mesclar linha da "ANÁLISE DO GAP" (A até E)
  const gapTitleRowIndex = criteriaData.length - 2; // Linha "ANÁLISE DO GAP"
  if (gapTitleRowIndex > 0) {
    if (!criteriaSheet['!merges']) criteriaSheet['!merges'] = [];
    criteriaSheet['!merges'].push({ s: { r: gapTitleRowIndex - 1, c: 0 }, e: { r: gapTitleRowIndex - 1, c: 4 } });
  }

  const criteriaGapRowIndex = criteriaData.length - 1;
  const criteriaGapCellRef = `A${criteriaGapRowIndex}`;
  if (criteriaSheet[criteriaGapCellRef] && criteriaSheet[criteriaGapCellRef].s) {
    criteriaSheet[criteriaGapCellRef].s.alignment = {
      wrapText: true,
      vertical: 'top',
      horizontal: 'left'
    };
  }

  // Configurar impressão: A4 horizontal, 80% escala, margens reduzidas
  if (!criteriaSheet['!margins']) {
    criteriaSheet['!margins'] = { left: 0.3, right: 0.3, top: 0.3, bottom: 0.3, header: 0.2, footer: 0.2 };
  }
  if (!criteriaSheet['!printOptions']) {
    criteriaSheet['!printOptions'] = {};
  }
  criteriaSheet['!printOptions'].orientation = 'landscape';
  criteriaSheet['!printOptions'].scale = 80;

  XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Critérios');

  const recommendationsData = [
    ['VITÓRIAS RÁPIDAS'],
    [],
    ...comparison.quick_wins.map(win => [win]),
    [],
    ['RECOMENDAÇÕES ESTRATÉGICAS'],
    [],
    ...comparison.strategic_recommendations.map(rec => [rec]),
    [],
    ['METAS DE LONGO PRAZO'],
    [],
    ...comparison.long_term_goals.map(goal => [goal])
  ];

  const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);

  recommendationsSheet['!cols'] = [{ wch: 45 }];

  const recRange = XLSX.utils.decode_range(recommendationsSheet['!ref'] || 'A1');
  recommendationsSheet['!autofilter'] = { ref: `A1:A1` };

  for (let i = 1; i <= recommendationsData.length; i++) {
    const cellRef = `A${i}`;
    if (recommendationsSheet[cellRef]) {
      if (!recommendationsSheet[cellRef].s) recommendationsSheet[cellRef].s = {};
      recommendationsSheet[cellRef].s.alignment = {
        wrapText: true,
        vertical: 'top',
        horizontal: 'center'
      };
      recommendationsSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10 };

      if (i === 1 || recommendationsData[i-1][0] === 'RECOMENDAÇÕES ESTRATÉGICAS' || recommendationsData[i-1][0] === 'METAS DE LONGO PRAZO') {
        recommendationsSheet[cellRef].s.fill = { fgColor: { rgb: '000000' } };
        recommendationsSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true };
      }
    }
  }

  if (!recommendationsSheet['!margins']) {
    recommendationsSheet['!margins'] = { left: 0.3, right: 0.3, top: 0.3, bottom: 0.3, header: 0.2, footer: 0.2 };
  }
  if (!recommendationsSheet['!printOptions']) {
    recommendationsSheet['!printOptions'] = {};
  }
  recommendationsSheet['!printOptions'].orientation = 'landscape';
  recommendationsSheet['!printOptions'].scale = 80;

  XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recomendações');

  const evaluationData = [
    ['AVALIAÇÃO COMENTADA'],
    [],
    ['SÍNTESE DA EMPRESA ANALISADA EM RELAÇÃO À EMPRESA LÍDER'],
    [],
    [],
    [],
    ['SÍNTESE DIDÁTICA - MELHORIAS PARA CHEGAR AO TOP 3'],
    ['Passo a passo em ordem de importância decrescente:'],
    []
  ];

  comparison.improvement_roadmap.forEach((step, index) => {
    evaluationData.push([`${index + 1}. ${step}`]);
  });

  const evaluationSheet = XLSX.utils.aoa_to_sheet(evaluationData);

  evaluationSheet['!cols'] = [{ wch: 120 }];

  const evalRange = XLSX.utils.decode_range(evaluationSheet['!ref'] || 'A1');
  evaluationSheet['!autofilter'] = { ref: `A1:A1` };

  evaluationSheet['A4'] = {
    t: 's',
    v: comparison.executive_summary,
    s: {
      alignment: {
        wrapText: true,
        vertical: 'top',
        horizontal: 'left'
      }
    }
  };

  // A4 já está configurada com quebra de texto, não precisa mesclar

  if (!evaluationSheet['!rows']) evaluationSheet['!rows'] = [];
  evaluationSheet['!rows'][3] = { hpt: 100 };

  for (let i = 1; i <= evaluationData.length; i++) {
    const cellRef = `A${i}`;
    if (evaluationSheet[cellRef] && i !== 4) {
      if (!evaluationSheet[cellRef].s) evaluationSheet[cellRef].s = {};
      evaluationSheet[cellRef].s.alignment = {
        wrapText: true,
        vertical: 'top',
        horizontal: 'center'
      };
      evaluationSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10 };

      if (i === 1 || i === 3 || i === 7) {
        evaluationSheet[cellRef].s.fill = { fgColor: { rgb: '000000' } };
        evaluationSheet[cellRef].s.font = { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true };
      }
    }
  }

  for (let i = 10; i <= evaluationData.length; i++) {
    const cellRef = `A${i}`;
    if (evaluationSheet[cellRef] && evaluationSheet[cellRef].s) {
      evaluationSheet[cellRef].s.alignment = {
        wrapText: true,
        vertical: 'top',
        horizontal: 'left'
      };
    }
  }

  if (!evaluationSheet['!margins']) {
    evaluationSheet['!margins'] = { left: 0.3, right: 0.3, top: 0.3, bottom: 0.3, header: 0.2, footer: 0.2 };
  }
  if (!evaluationSheet['!printOptions']) {
    evaluationSheet['!printOptions'] = {};
  }
  evaluationSheet['!printOptions'].orientation = 'landscape';
  evaluationSheet['!printOptions'].scale = 80;

  XLSX.utils.book_append_sheet(workbook, evaluationSheet, 'AVALIAÇÃO COMENTADA');

  const now = new Date();
  const dateTimeStr = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (!workbook.Props) {
    workbook.Props = {};
  }
  workbook.Props.Comments = `Gerado em: ${dateTimeStr}`;

  const fileName = `Comparacao_${comparison.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Gerar buffer e fazer download manual
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
