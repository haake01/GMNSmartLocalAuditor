import { CompetitiveComparison } from '../services/competitiveComparison';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Zap, Target, Trophy, ArrowRight, Printer, Download, FileText } from 'lucide-react';
import { exportComparisonToExcel } from '../utils/comparisonExport';
import { generateEnhancedComparisonPDF } from '../services/enhancedComparisonPdf';

interface ComparisonReportProps {
  comparison: CompetitiveComparison;
  onNewComparison: () => void;
}

export const ComparisonReport = ({ comparison, onNewComparison }: ComparisonReportProps) => {
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 border-red-300';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (priority === 'medium') return <Target className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getGapColor = (gap: number) => {
    if (gap >= 0) return 'text-green-600';
    if (gap >= -2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    exportComparisonToExcel(comparison);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Excel
          </button>
          <button
            onClick={() => generateEnhancedComparisonPDF(comparison)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Relatório PDF Completo
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white/90 hover:bg-white text-gray-800 font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={onNewComparison}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
          >
            ← Voltar
          </button>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Análise Competitiva</h2>
          <p className="text-xl text-gray-600">
            <span className="font-bold text-blue-600">{comparison.company_name}</span> vs <span className="font-bold text-green-600">{comparison.leader_name}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Sua Empresa</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">{comparison.company_name}</p>

            {comparison.company_data.gmn_url && (
              <a
                href={comparison.company_data.gmn_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block mb-1"
              >
                🔗 Link GMN
              </a>
            )}

            {comparison.company_data.website ? (
              <a
                href={comparison.company_data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block mb-1"
              >
                🌐 Site
              </a>
            ) : (
              <span className="text-xs text-gray-400 block mb-1">Site Inexistente</span>
            )}

            {comparison.company_data.instagram && (
              <a href={comparison.company_data.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block mb-1">
                📷 Instagram
              </a>
            )}
            {comparison.company_data.whatsapp && (
              <span className="text-xs text-gray-600 block mb-1">
                📱 WhatsApp: {comparison.company_data.whatsapp}
              </span>
            )}
            {comparison.company_data.phone && (
              <span className="text-xs text-gray-600 block mb-1">
                ☎️ Telefone: {comparison.company_data.phone}
              </span>
            )}
            {comparison.company_data.email && (
              <span className="text-xs text-gray-600 block mb-3">
                ✉️ Email: {comparison.company_data.email}
              </span>
            )}

            <div className="space-y-2 text-sm">
              {comparison.company_data.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-bold text-gray-800">{comparison.company_data.email}</span>
                </div>
              )}
              {comparison.company_data.whatsapp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp:</span>
                  <span className="font-bold text-gray-800">{comparison.company_data.whatsapp}</span>
                </div>
              )}
              {comparison.company_data.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-bold text-gray-800">{comparison.company_data.phone}</span>
                </div>
              )}
              {comparison.company_data.instagram && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instagram:</span>
                  <a href={comparison.company_data.instagram} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">Ver perfil</a>
                </div>
              )}
              {comparison.company_data.facebook && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Facebook:</span>
                  <a href={comparison.company_data.facebook} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">Ver página</a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Score Geral:</span>
                <span className="font-bold text-gray-800">{comparison.company_data.overall_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avaliação:</span>
                <span className="font-bold text-gray-800">{comparison.company_data.rating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Avaliações:</span>
                <span className="font-bold text-gray-800">{comparison.company_data.total_reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-bold text-gray-800">{comparison.company_data.verification_status}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-800">Líder do Segmento</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">{comparison.leader_name.toUpperCase()}</p>

            {comparison.leader_data.gmn_url && (
              <a
                href={comparison.leader_data.gmn_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline block mb-1"
              >
                🔗 Link GMN
              </a>
            )}

            {comparison.leader_data.website ? (
              <a
                href={comparison.leader_data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline block mb-1"
              >
                🌐 Site
              </a>
            ) : (
              <span className="text-xs text-gray-400 block mb-1">Site Inexistente</span>
            )}

            {comparison.leader_data.instagram && (
              <a href={comparison.leader_data.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline block mb-1">
                📷 Instagram
              </a>
            )}
            {comparison.leader_data.whatsapp && (
              <span className="text-xs text-gray-600 block mb-1">
                📱 WhatsApp: {comparison.leader_data.whatsapp}
              </span>
            )}
            {comparison.leader_data.phone && (
              <span className="text-xs text-gray-600 block mb-1">
                ☎️ Telefone: {comparison.leader_data.phone}
              </span>
            )}
            {comparison.leader_data.email && (
              <span className="text-xs text-gray-600 block mb-3">
                ✉️ Email: {comparison.leader_data.email}
              </span>
            )}

            <div className="space-y-2 text-sm">
              {comparison.leader_data.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-bold text-gray-800">{comparison.leader_data.email}</span>
                </div>
              )}
              {comparison.leader_data.whatsapp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp:</span>
                  <span className="font-bold text-gray-800">{comparison.leader_data.whatsapp}</span>
                </div>
              )}
              {comparison.leader_data.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-bold text-gray-800">{comparison.leader_data.phone}</span>
                </div>
              )}
              {comparison.leader_data.instagram && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instagram:</span>
                  <a href={comparison.leader_data.instagram} target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">Ver perfil</a>
                </div>
              )}
              {comparison.leader_data.facebook && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Facebook:</span>
                  <a href={comparison.leader_data.facebook} target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">Ver página</a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Score Geral:</span>
                <span className="font-bold text-gray-800">{comparison.leader_data.overall_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avaliação:</span>
                <span className="font-bold text-gray-800">{comparison.leader_data.rating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Avaliações:</span>
                <span className="font-bold text-gray-800">{comparison.leader_data.total_reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-bold text-gray-800">{comparison.leader_data.verification_status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Diferença de Score Geral</p>
            <div className="flex items-center justify-center gap-3">
              {comparison.overall_gap >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
              <span className={`text-4xl font-bold ${getGapColor(comparison.overall_gap)}`}>
                {comparison.overall_gap > 0 ? '+' : ''}{comparison.overall_gap}
              </span>
              <span className="text-gray-600">pontos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Target className="w-7 h-7 text-blue-600" />
          Comparação por Critério (12 Pontos)
        </h3>

        <div className="space-y-4">
          {comparison.criteria_comparison.map((criterion, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{criterion.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPriorityColor(criterion.priority)}`}>
                      {getPriorityIcon(criterion.priority)}
                      {criterion.priority === 'high' ? 'Alta' : criterion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </span>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getGapColor(criterion.gap)}`}>
                  {criterion.gap > 0 ? '+' : ''}{criterion.gap}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Sua Empresa</span>
                      <span className="text-sm font-bold text-gray-800">{criterion.company_score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(criterion.company_score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Líder</span>
                      <span className="text-sm font-bold text-gray-800">{criterion.leader_score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(criterion.leader_score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Sugestões de Melhoria:</p>
                <ul className="space-y-2">
                  {criterion.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800">Vitórias Rápidas</h3>
          </div>
          <ul className="space-y-3">
            {comparison.quick_wins.map((win, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Estratégias</h3>
          </div>
          <ul className="space-y-3">
            {comparison.strategic_recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-800">Metas de Longo Prazo</h3>
          </div>
          <ul className="space-y-3">
            {comparison.long_term_goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
