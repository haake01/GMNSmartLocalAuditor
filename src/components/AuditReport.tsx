import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb, BarChart3, Crown, ChevronRight } from 'lucide-react';
import { AuditResult } from '../services/openai';
import { PremiumReport } from './PremiumReport';

interface AuditReportProps {
  audit: AuditResult;
  segment: string;
  city: string;
}

export const AuditReport = ({ audit, segment, city }: AuditReportProps) => {
  const [showPremium, setShowPremium] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'yellow':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'red':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'green':
        return '🟢';
      case 'yellow':
        return '🟡';
      case 'red':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Relatório de Auditoria GMN
          </h2>
          <p className="text-gray-600">
            <span className="font-semibold">{segment}</span> em <span className="font-semibold">{city}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Score Geral</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-end gap-3">
                <div className={`text-6xl font-bold ${getScoreColor(audit.overallScore)}`}>
                  {audit.overallScore}
                </div>
                <div className="text-2xl text-gray-400 mb-2">/100</div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(audit.overallScore)} transition-all duration-1000`}
                  style={{ width: `${audit.overallScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className={`rounded-2xl p-6 border-2 ${getStatusColor(audit.complianceStatus)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Status de Conformidade</h3>
                {getStatusIcon(audit.complianceStatus)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getStatusEmoji(audit.complianceStatus)}</span>
                <div>
                  <div className="text-2xl font-bold capitalize">
                    {audit.complianceStatus === 'green' && 'Excelente'}
                    {audit.complianceStatus === 'yellow' && 'Moderado'}
                    {audit.complianceStatus === 'red' && 'Crítico'}
                  </div>
                  <p className="text-sm mt-1 opacity-80">
                    {audit.complianceStatus === 'green' && 'Perfil bem otimizado'}
                    {audit.complianceStatus === 'yellow' && 'Necessita melhorias'}
                    {audit.complianceStatus === 'red' && 'Requer ação urgente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Principais Oportunidades de Otimização
            </h3>
          </div>
          <div className="space-y-3">
            {audit.opportunities.map((opportunity, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-cyan-100 flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1 pt-1">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Sugestões Práticas de Melhoria
            </h3>
          </div>
          <div className="space-y-2">
            {audit.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                <ChevronRight className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Comparativo com a Média Local
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Score do Segmento</p>
              <p className="text-3xl font-bold text-gray-900">
                {audit.overallScore}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Média Local</p>
              <p className="text-3xl font-bold text-blue-600">
                {audit.localComparison.segmentAverage}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 mb-4">
            <p className="text-sm text-gray-600 mb-2">Posição no Segmento</p>
            <p className="text-lg font-semibold text-gray-900">
              {audit.localComparison.positionInSegment}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Diferenciadores-Chave das Empresas Líderes:
            </p>
            <div className="space-y-2">
              {audit.localComparison.keyDifferentiators.map((diff, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">{diff}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl border-2 border-amber-300 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              Relatório Premium
            </h3>
            <p className="text-gray-600">
              Análise comparativa detalhada com concorrentes
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 mb-4 border border-amber-200">
          <h4 className="font-semibold text-gray-900 mb-3">Inclui:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Análise individual das 5 empresas do segmento
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Matriz de posicionamento competitivo
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Pontos de melhoria específicos por empresa
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Identificação de leads para otimização paga
            </li>
          </ul>
        </div>
        <button
          onClick={() => setShowPremium(true)}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" />
          Ver Relatório Premium
        </button>
      </div>

      {showPremium && (
        <PremiumReport
          companies={audit.companiesData}
          segment={segment}
          city={city}
          onClose={() => setShowPremium(false)}
        />
      )}
    </div>
  );
};
