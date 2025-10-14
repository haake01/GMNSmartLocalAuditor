import * as XLSX from 'xlsx';
import { CompanyFullAudit } from '../services/enhanced-openai';

const getStatusEmoji = (status: 'green' | 'yellow' | 'red'): string => {
  switch (status) {
    case 'green': return '🟢';
    case 'yellow': return '🟡';
    case 'red': return '🔴';
    default: return '⚪';
  }
};

export function exportComprehensiveAuditToExcel(
  companies: CompanyFullAudit[],
  segment: string,
  city: string
) {
  const sortedCompanies = [...companies].sort((a, b) => {
    if (a.statusGMN === 'não possui' && b.statusGMN === 'possui') return -1;
    if (a.statusGMN === 'possui' && b.statusGMN === 'não possui') return 1;
    return a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR');
  });

  const excelData: any[] = [];

  sortedCompanies.forEach((company) => {
    const melhorias = company.melhoriasPrioritarias.join(' | ');

    excelData.push({
      'Razão Social': company.razaoSocial,
      'Cidade': company.cidade,
      'Status GMN': company.statusGMN === 'possui' ? 'Possui' : 'Não Possui',
      'Score Geral': company.scoreGeral,
      'Principais Melhorias Prioritárias': melhorias,
      'Comparativo com Melhor GMN': company.comparativoMelhorGMN,

      '1. Presença e Verificação': `${getStatusEmoji(company.criterios.presencaVerificacao.status)} ${company.criterios.presencaVerificacao.score}/100`,
      'Detalhes - Presença': company.criterios.presencaVerificacao.detalhes,

      '2. Consistência NAP': `${getStatusEmoji(company.criterios.consistenciaNAP.status)} ${company.criterios.consistenciaNAP.score}/100`,
      'Detalhes - NAP': company.criterios.consistenciaNAP.detalhes,

      '3. Categorias': `${getStatusEmoji(company.criterios.categorias.status)} ${company.criterios.categorias.score}/100`,
      'Detalhes - Categorias': company.criterios.categorias.detalhes,

      '4. Horário de Funcionamento': `${getStatusEmoji(company.criterios.horarioFuncionamento.status)} ${company.criterios.horarioFuncionamento.score}/100`,
      'Detalhes - Horário': company.criterios.horarioFuncionamento.detalhes,

      '5. Fotos e Vídeos': `${getStatusEmoji(company.criterios.fotosVideos.status)} ${company.criterios.fotosVideos.score}/100`,
      'Detalhes - Fotos/Vídeos': company.criterios.fotosVideos.detalhes,

      '6. Postagens Recentes': `${getStatusEmoji(company.criterios.postagensRecentes.status)} ${company.criterios.postagensRecentes.score}/100`,
      'Detalhes - Postagens': company.criterios.postagensRecentes.detalhes,

      '7. Avaliações': `${getStatusEmoji(company.criterios.avaliacoes.status)} ${company.criterios.avaliacoes.score}/100`,
      'Detalhes - Avaliações': company.criterios.avaliacoes.detalhes,

      '8. Palavras-chave e SEO': `${getStatusEmoji(company.criterios.palavrasChaveSEO.status)} ${company.criterios.palavrasChaveSEO.score}/100`,
      'Detalhes - SEO': company.criterios.palavrasChaveSEO.detalhes,

      '9. Linkagem Site/Redes': `${getStatusEmoji(company.criterios.linkagemSiteRedes.status)} ${company.criterios.linkagemSiteRedes.score}/100`,
      'Detalhes - Linkagem': company.criterios.linkagemSiteRedes.detalhes,

      '10. Respostas do Proprietário': `${getStatusEmoji(company.criterios.respostasProprietario.status)} ${company.criterios.respostasProprietario.score}/100`,
      'Detalhes - Respostas': company.criterios.respostasProprietario.detalhes,

      '11. Conformidade GBP': `${getStatusEmoji(company.criterios.conformidadeGBP.status)} ${company.criterios.conformidadeGBP.score}/100`,
      'Detalhes - Conformidade': company.criterios.conformidadeGBP.detalhes,

      '12. Performance Comparativa': `${getStatusEmoji(company.criterios.performanceComparativa.status)} ${company.criterios.performanceComparativa.score}/100`,
      'Detalhes - Performance': company.criterios.performanceComparativa.detalhes,
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const columnWidths = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 60 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
    { wch: 25 },
    { wch: 50 },
  ];
  worksheet['!cols'] = columnWidths;

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[headerCell]) continue;

    worksheet[headerCell].s = {
      fill: { fgColor: { rgb: '000000' } },
      font: { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true },
      alignment: { wrapText: true, vertical: 'center', horizontal: 'left' }
    };
  }

  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { name: 'Segoe UI', sz: 10 },
        alignment: { wrapText: true, vertical: 'top', horizontal: 'left' }
      };

      if (typeof worksheet[cellAddress].v === 'string' && worksheet[cellAddress].v.length > 2000) {
        worksheet[cellAddress].v = worksheet[cellAddress].v.substring(0, 2000) + '...';
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria GMN');

  if (!workbook.Workbook) {
    workbook.Workbook = {};
  }

  workbook.Workbook.Views = [{
    RTL: false
  }];

  if (!worksheet['!margins']) {
    worksheet['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
  }

  if (!worksheet['!printOptions']) {
    worksheet['!printOptions'] = {};
  }
  worksheet['!printOptions'].orientation = 'landscape';

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

  const fileName = `Relatorio_GMN_${segment.replace(/\s+/g, '_')}_${city.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName, { cellStyles: true, bookType: 'xlsx' });
}
