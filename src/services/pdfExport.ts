import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RealCompanyAudit } from './batchAudit';
import { MultiPlatformAnalysis } from './platformPresence';
import { withAutoRecovery, logError } from '../utils/errorLogger';

export interface PDFExportOptions {
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
  title: string;
  subtitle?: string;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  orientation: 'landscape',
  includeHeader: true,
  includeFooter: true,
  title: 'Relatório de Auditoria GMN',
  subtitle: undefined
};

export async function exportAuditsToPDF(
  audits: RealCompanyAudit[],
  options: Partial<PDFExportOptions> = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return await withAutoRecovery(
    async () => {
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    if (config.includeHeader) {
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(config.title, margin, 12);

      if (config.subtitle) {
        pdf.setFontSize(10);
        pdf.text(config.subtitle, margin, 17);
      }
    }

    let yPosition = config.includeHeader ? 25 : margin;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Total de empresas analisadas: ${audits.length}`, margin, yPosition);
    yPosition += 10;

    const withGMN = audits.filter(a => a.has_gmn_profile).length;
    const withoutGMN = audits.length - withGMN;

    pdf.setFontSize(10);
    pdf.text(`Com perfil GMN: ${withGMN}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Sem perfil GMN: ${withoutGMN}`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(8);
    const headers = ['Empresa', 'Cidade', 'GMN', 'Score', 'Avaliações', 'Fotos'];
    const colWidths = [60, 40, 20, 20, 25, 20];
    let xPosition = margin;

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, 'F');

    headers.forEach((header, i) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[i];
    });

    yPosition += 8;

    audits.forEach((audit, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      xPosition = margin;
      const rowData = [
        audit.company_name.substring(0, 30),
        audit.city.substring(0, 20),
        audit.has_gmn_profile ? 'Sim' : 'Não',
        audit.overall_score.toString(),
        audit.total_reviews.toString(),
        audit.images_count.toString()
      ];

      rowData.forEach((data, i) => {
        pdf.text(data, xPosition, yPosition);
        xPosition += colWidths[i];
      });

      yPosition += 6;

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 6, 'F');
      }
    });

    if (config.includeFooter) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em ${dateStr} às ${timeStr}`, margin, pageHeight - 5);
      pdf.text('GMN SmartLocal Auditor PRO', pageWidth - margin - 50, pageHeight - 5);
    }

      pdf.save(`Auditoria_GMN_${new Date().getTime()}.pdf`);
    },
    'pdf',
    { operation: 'export_audits_pdf', auditCount: audits.length }
  );
}

export async function exportHTMLToPDF(
  elementId: string,
  filename: string,
  options: Partial<PDFExportOptions> = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return await withAutoRecovery(
    async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

      pdf.save(filename);
    },
    'pdf',
    { operation: 'export_html_pdf', elementId, filename }
  );
}

export async function exportPlatformAnalysisToPDF(
  analysis: MultiPlatformAnalysis,
  options: Partial<PDFExportOptions> = {}
): Promise<void> {
  const config = {
    ...DEFAULT_OPTIONS,
    title: 'Análise de Presença Multiplataforma',
    subtitle: analysis.company_name,
    ...options
  };

  return await withAutoRecovery(
    async () => {
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    if (config.includeHeader) {
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(config.title, margin, 12);

      if (config.subtitle) {
        pdf.setFontSize(10);
        pdf.text(config.subtitle, margin, 17);
      }
    }

    let yPosition = config.includeHeader ? 30 : margin;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(`Score Geral de Presença: ${analysis.overall_presence_score}/100`, margin, yPosition);
    yPosition += 15;

    const platforms = [
      analysis.google_maps,
      analysis.apple_maps,
      analysis.waze,
      analysis.uber,
      analysis.ninety_nine,
      analysis.tripadvisor
    ];

    pdf.setFontSize(12);
    pdf.text('Análise por Plataforma:', margin, yPosition);
    yPosition += 10;

    platforms.forEach(platform => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${platform.platform}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');

      pdf.text(`Presente: ${platform.present ? 'Sim' : 'Não'}`, margin + 50, yPosition);
      yPosition += 6;
      pdf.text(`Verificado: ${platform.verified ? 'Sim' : 'Não'}`, margin + 50, yPosition);
      yPosition += 6;
      pdf.text(`Score: ${platform.score}/100`, margin + 50, yPosition);
      yPosition += 6;
      pdf.text(`Detalhes: ${platform.details}`, margin + 50, yPosition);
      yPosition += 10;
    });

    if (analysis.recommendations.length > 0) {
      pdf.setFontSize(12);
      pdf.text('Recomendações:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      analysis.recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(`${index + 1}. ${rec}`, margin + 5, yPosition);
        yPosition += 6;
      });
    }

    if (config.includeFooter) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em ${dateStr} às ${timeStr}`, margin, pageHeight - 5);
    }

      pdf.save(`Analise_Plataformas_${analysis.company_name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    },
    'pdf',
    { operation: 'export_platform_pdf', companyName: analysis.company_name }
  );
}

export async function exportPDFWithFallback(
  exportFunction: () => Promise<void>,
  fallbackMessage: string
): Promise<boolean> {
  try {
    await exportFunction();
    return true;
  } catch (error) {
    console.error('PDF export failed, attempting fallback:', error);
    logError('pdf', error as Error, { fallback: true });

    try {
      alert(`⚠️ Erro ao gerar PDF: ${fallbackMessage}\n\nTentando método alternativo...`);
      return false;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      logError('pdf', fallbackError as Error, { fallbackFailed: true });
      alert('❌ Não foi possível gerar o PDF. Por favor, tente novamente mais tarde.');
      return false;
    }
  }
}
