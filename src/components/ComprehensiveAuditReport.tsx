import { FileSpreadsheet, TrendingUp, Target, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { ComprehensiveAuditResult } from '../services/enhanced-openai';
import { exportComprehensiveAuditToExcel } from '../utils/excelExport';

interface ComprehensiveAuditReportProps {
  audit: ComprehensiveAuditResult;
  segment: string;
  city: string;
}

export const ComprehensiveAuditReport = ({ audit, segment, city }: ComprehensiveAuditReportProps) => {
  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return <CheckCircle className="w-4 h-4" />;
      case 'yellow': return <AlertCircle className="w-4 h-4" />;
      case 'red': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusEmoji = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
    }
  };

  const handleExportExcel = () => {
    exportComprehensiveAuditToExcel(audit.companies, segment, city);
  };

  const companiesWithoutGMN = audit.companies.filter(c => c.statusGMN === 'não possui');
  const companiesWithGMN = audit.companies.filter(c => c.statusGMN === 'possui');

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Relatório Completo de Auditoria
            </h2>
            <p className="text-gray-600">
              <span className="font-semibold">{segment}</span> em <span className="font-semibold">{city}</span>
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Gerar Relatório Excel (A4 Horizontal)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Total de Empresas</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600">{audit.companies.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Com GMN</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{companiesWithGMN.length}</p>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((companiesWithGMN.length / audit.companies.length) * 100)}% do total
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sem GMN</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{companiesWithoutGMN.length}</p>
            <p className="text-sm text-gray-600 mt-1">
              Oportunidade de otimização
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-300 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Melhor GMN do Segmento - Benchmark
            </h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-2xl font-bold text-gray-900">{audit.bestInSegment.companyName}</h4>
              <div className="text-3xl font-bold text-amber-600">
                {audit.bestInSegment.score}/100
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Destaques:</p>
            <ul className="space-y-2">
              {audit.bestInSegment.highlightedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
          Análise Detalhada por Empresa
        </h3>

        {audit.companies.map((company, index) => (
          <div
            key={index}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">{company.razaoSocial}</h4>
                  <p className="text-blue-100">{company.cidade}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white mb-1">
                    {company.scoreGeral}
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                    company.statusGMN === 'possui'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.statusGMN === 'possui' ? 'Possui GMN' : 'Não Possui GMN'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">
                  Melhorias Prioritárias (Ordem de Importância)
                </h5>
                <div className="space-y-2">
                  {company.melhoriasPrioritarias.map((melhoria, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700 pt-0.5">{melhoria}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h5 className="text-sm font-bold text-gray-900 mb-2">
                  Comparativo com Melhor GMN do Segmento:
                </h5>
                <p className="text-sm text-gray-700">{company.comparativoMelhorGMN}</p>
              </div>

              <div>
                <h5 className="text-lg font-bold text-gray-900 mb-4">
                  12 Critérios de Avaliação
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'presencaVerificacao', label: '1. Presença e Verificação' },
                    { key: 'consistenciaNAP', label: '2. Consistência NAP' },
                    { key: 'categorias', label: '3. Categorias' },
                    { key: 'horarioFuncionamento', label: '4. Horário de Funcionamento' },
                    { key: 'fotosVideos', label: '5. Fotos e Vídeos' },
                    { key: 'postagensRecentes', label: '6. Postagens Recentes' },
                    { key: 'avaliacoes', label: '7. Avaliações' },
                    { key: 'palavrasChaveSEO', label: '8. Palavras-chave e SEO' },
                    { key: 'linkagemSiteRedes', label: '9. Linkagem Site/Redes' },
                    { key: 'respostasProprietario', label: '10. Respostas Proprietário' },
                    { key: 'conformidadeGBP', label: '11. Conformidade GBP' },
                    { key: 'performanceComparativa', label: '12. Performance Comparativa' },
                  ].map((criterio) => {
                    const data = company.criterios[criterio.key as keyof typeof company.criterios];
                    return (
                      <div
                        key={criterio.key}
                        className={`rounded-lg p-4 border-2 ${getStatusColor(data.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(data.status)}
                            <h6 className="font-semibold text-sm">{criterio.label}</h6>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getStatusEmoji(data.status)}</span>
                            <span className="font-bold">{data.score}/100</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">{data.detalhes}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
