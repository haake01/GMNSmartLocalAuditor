import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

export interface RoyaltyReport {
  tenant_id: string;
  tenant_name: string;
  period_start: string;
  period_end: string;
  total_audits: number;
  total_comparisons: number;
  total_transactions: number;
  total_royalty_amount: number;
  royalty_percentage: number;
  status: 'pending' | 'paid' | 'overdue';
  transactions: RoyaltyTransaction[];
}

export interface RoyaltyTransaction {
  id: string;
  type: 'audit' | 'comparison' | 'subscription';
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  royalty_amount: number;
  created_at: string;
}

export async function calculateTenantRoyalty(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<RoyaltyReport> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', tenantId)
    .single();

  const { data: audits } = await supabase
    .from('gmn_audits')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString());

  const { data: comparisons } = await supabase
    .from('competitive_comparisons')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString());

  const auditPrice = 50;
  const comparisonPrice = 30;
  const royaltyPercentage = 15;

  const transactions: RoyaltyTransaction[] = [];

  if (audits) {
    transactions.push({
      id: crypto.randomUUID(),
      type: 'audit',
      description: 'Auditorias GMN',
      quantity: audits.length,
      unit_price: auditPrice,
      total_amount: audits.length * auditPrice,
      royalty_amount: (audits.length * auditPrice * royaltyPercentage) / 100,
      created_at: periodEnd.toISOString()
    });
  }

  if (comparisons) {
    transactions.push({
      id: crypto.randomUUID(),
      type: 'comparison',
      description: 'Comparações Competitivas',
      quantity: comparisons.length,
      unit_price: comparisonPrice,
      total_amount: comparisons.length * comparisonPrice,
      royalty_amount: (comparisons.length * comparisonPrice * royaltyPercentage) / 100,
      created_at: periodEnd.toISOString()
    });
  }

  const totalTransactions = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalRoyalty = transactions.reduce((sum, t) => sum + t.royalty_amount, 0);

  return {
    tenant_id: tenantId,
    tenant_name: tenant?.name || 'Unknown',
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    total_audits: audits?.length || 0,
    total_comparisons: comparisons?.length || 0,
    total_transactions: transactions.length,
    total_royalty_amount: totalRoyalty,
    royalty_percentage: royaltyPercentage,
    status: 'pending',
    transactions
  };
}

export async function generateRoyaltyPDF(report: RoyaltyReport): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE ROYALTIES', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('GMN SmartLocal Auditor PRO', pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(report.tenant_name, 50, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Período:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${new Date(report.period_start).toLocaleDateString('pt-BR')} - ${new Date(report.period_end).toLocaleDateString('pt-BR')}`,
    50,
    70
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 20, 80);
  doc.setFont('helvetica', 'normal');
  const statusColor = report.status === 'paid' ? [16, 185, 129] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(report.status.toUpperCase(), 50, 80);
  doc.setTextColor(0, 0, 0);

  doc.setFillColor(243, 244, 246);
  doc.rect(15, 95, pageWidth - 30, 40, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO FINANCEIRO', 20, 105);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const summaryY = 115;
  const col1X = 20;
  const col2X = 70;
  const col3X = 120;
  const col4X = 160;

  doc.text('Auditorias:', col1X, summaryY);
  doc.text(report.total_audits.toString(), col1X, summaryY + 7);

  doc.text('Comparações:', col2X, summaryY);
  doc.text(report.total_comparisons.toString(), col2X, summaryY + 7);

  doc.text('% Royalty:', col3X, summaryY);
  doc.text(`${report.royalty_percentage}%`, col3X, summaryY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Royalty:', col4X, summaryY);
  doc.setTextColor(16, 185, 129);
  doc.text(`R$ ${report.total_royalty_amount.toFixed(2)}`, col4X, summaryY + 7);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSAÇÕES DETALHADAS', 20, 150);

  const tableHeaders = ['Tipo', 'Descrição', 'Qtd', 'Valor Unit.', 'Total', 'Royalty'];
  const tableX = 15;
  let tableY = 160;
  const colWidths = [30, 50, 20, 25, 25, 25];
  const rowHeight = 8;

  doc.setFillColor(59, 130, 246);
  doc.rect(tableX, tableY, pageWidth - 30, rowHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let currentX = tableX + 2;
  tableHeaders.forEach((header, i) => {
    doc.text(header, currentX, tableY + 5);
    currentX += colWidths[i];
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  tableY += rowHeight;

  report.transactions.forEach((transaction, index) => {
    if (tableY > pageHeight - 40) {
      doc.addPage();
      tableY = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(tableX, tableY, pageWidth - 30, rowHeight, 'F');
    }

    currentX = tableX + 2;

    const typeMap = {
      audit: 'Auditoria',
      comparison: 'Comparação',
      subscription: 'Assinatura'
    };

    doc.text(typeMap[transaction.type], currentX, tableY + 5);
    currentX += colWidths[0];

    doc.text(transaction.description.substring(0, 20), currentX, tableY + 5);
    currentX += colWidths[1];

    doc.text(transaction.quantity.toString(), currentX, tableY + 5);
    currentX += colWidths[2];

    doc.text(`R$ ${transaction.unit_price.toFixed(2)}`, currentX, tableY + 5);
    currentX += colWidths[3];

    doc.text(`R$ ${transaction.total_amount.toFixed(2)}`, currentX, tableY + 5);
    currentX += colWidths[4];

    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${transaction.royalty_amount.toFixed(2)}`, currentX, tableY + 5);
    doc.setFont('helvetica', 'normal');

    tableY += rowHeight;
  });

  tableY += 10;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(tableX, tableY, pageWidth - 15, tableY);

  tableY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', pageWidth - 80, tableY);
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(
    `R$ ${report.total_royalty_amount.toFixed(2)}`,
    pageWidth - 30,
    tableY,
    { align: 'right' }
  );

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function getAllTenantsRoyalty(
  periodStart: Date,
  periodEnd: Date
): Promise<RoyaltyReport[]> {
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .eq('status', 'active');

  if (!tenants) return [];

  const reports = await Promise.all(
    tenants.map(tenant => calculateTenantRoyalty(tenant.id, periodStart, periodEnd))
  );

  return reports.filter(r => r.total_royalty_amount > 0);
}
