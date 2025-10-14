import { useState } from 'react';
import { calculateTenantRoyalty, generateRoyaltyPDF, getAllTenantsRoyalty, type RoyaltyReport } from '../services/royaltyReports';
import { useTenant } from '../contexts/TenantContext';
import { Download, Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';

export function RoyaltyReports() {
  const { currentTenant } = useTenant();
  const [reports, setReports] = useState<RoyaltyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'current' | 'all'>('current');

  const handleGenerateReport = async () => {
    if (!currentTenant) return;

    try {
      setLoading(true);
      const start = new Date(periodStart);
      const end = new Date(periodEnd);

      if (reportType === 'current') {
        const report = await calculateTenantRoyalty(currentTenant.id, start, end);
        setReports([report]);
      } else {
        const allReports = await getAllTenantsRoyalty(start, end);
        setReports(allReports);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (report: RoyaltyReport) => {
    try {
      const blob = await generateRoyaltyPDF(report);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `royalty-report-${report.tenant_name}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erro ao baixar PDF');
    }
  };

  const totalRoyalties = reports.reduce((sum, r) => sum + r.total_royalty_amount, 0);
  const totalAudits = reports.reduce((sum, r) => sum + r.total_audits, 0);
  const totalComparisons = reports.reduce((sum, r) => sum + r.total_comparisons, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Relatórios de Royalty</h2>
        <p className="text-gray-600 mt-1">Geração e visualização de relatórios financeiros</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Configuração do Relatório</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'current' | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Tenant Atual</option>
              <option value="all">Todos os Tenants</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <FileText className="w-5 h-5" />
          {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
        </button>
      </div>

      {reports.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  R$ {totalRoyalties.toFixed(2)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Royalties</h3>
              <p className="text-xs text-gray-500 mt-1">Período selecionado</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{totalAudits}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Auditorias</h3>
              <p className="text-xs text-gray-500 mt-1">Total processadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{totalComparisons}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Comparações</h3>
              <p className="text-xs text-gray-500 mt-1">Total realizadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{reports.length}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Tenants</h3>
              <p className="text-xs text-gray-500 mt-1">Com atividade</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Relatórios Gerados</h3>

            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.tenant_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{report.tenant_name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(report.period_start).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(report.period_end).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(report)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Auditorias</div>
                      <div className="text-lg font-bold text-gray-900">{report.total_audits}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Comparações</div>
                      <div className="text-lg font-bold text-gray-900">{report.total_comparisons}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Transações</div>
                      <div className="text-lg font-bold text-gray-900">{report.total_transactions}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">% Royalty</div>
                      <div className="text-lg font-bold text-gray-900">{report.royalty_percentage}%</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Total Royalty</div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {report.total_royalty_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Transações Detalhadas</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Tipo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Descrição</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Qtd</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Valor Unit.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Total</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Royalty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-t">
                              <td className="px-4 py-2">
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-900">{transaction.description}</td>
                              <td className="px-4 py-2 text-right text-gray-900">{transaction.quantity}</td>
                              <td className="px-4 py-2 text-right text-gray-900">
                                R$ {transaction.unit_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-900">
                                R$ {transaction.total_amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-green-600">
                                R$ {transaction.royalty_amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
