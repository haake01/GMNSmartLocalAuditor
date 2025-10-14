import { X, Star, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { CompanyAuditData } from '../services/openai';

interface PremiumReportProps {
  companies: CompanyAuditData[];
  segment: string;
  city: string;
  onClose: () => void;
}

export const PremiumReport = ({ companies, segment, city, onClose }: PremiumReportProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 50) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const topPerformers = [...companies].sort((a, b) => b.score - a.score).slice(0, 3);
  const needsOptimization = companies.filter(c => c.shouldInviteForOptimization);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Relatório Premium
            </h2>
            <p className="text-gray-800">
              Análise Comparativa: <span className="font-semibold">{segment}</span> em <span className="font-semibold">{city}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Performers do Segmento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((company, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <h4 className="font-bold text-gray-900">{company.companyName}</h4>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(company.score)}`}>
                    <span className={getScoreColor(company.score)}>Score: {company.score}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{company.rating}</span>
                    <span className="text-gray-500">({company.totalReviews} avaliações)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Oportunidades de Otimização Paga
            </h3>
            {needsOptimization.length > 0 ? (
              <div className="space-y-3">
                {needsOptimization.map((company, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{company.companyName}</h4>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Lead Qualificado
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                      <div>Score: <span className={`font-semibold ${getScoreColor(company.score)}`}>{company.score}</span></div>
                      <div>Avaliações: <span className="font-semibold">{company.totalReviews}</span></div>
                      <div>Taxa de Resposta: <span className="font-semibold">{company.reviewResponseRate}%</span></div>
                      <div>SEO: <span className="font-semibold">{company.seoScore}/100</span></div>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      Potencial alto para otimização profissional
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">
                  Todas as empresas analisadas estão bem otimizadas
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Análise Detalhada por Empresa
            </h3>
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{company.companyName}</h4>
                      <p className="text-sm text-gray-600">
                        {company.hasGmnProfile ? (
                          <span className="text-green-600 font-medium">✓ Possui perfil GMN</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ Sem perfil GMN</span>
                        )}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border-2 ${getScoreBg(company.score)}`}>
                      <span className={`text-2xl font-bold ${getScoreColor(company.score)}`}>
                        {company.score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <p className="text-sm font-semibold text-gray-900">{company.verificationStatus}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">NAP</p>
                      <p className="text-sm font-semibold text-gray-900">{company.napConsistencyScore}/100</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Imagens</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {company.imagesCount} {company.hasGeotags ? '📍' : ''}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Posts/semana</p>
                      <p className="text-sm font-semibold text-gray-900">{company.postsPerWeek}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Avaliação</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ⭐ {company.rating} ({company.totalReviews})
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Taxa Resposta</p>
                      <p className="text-sm font-semibold text-gray-900">{company.reviewResponseRate}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">SEO Local</p>
                      <p className="text-sm font-semibold text-gray-900">{company.seoScore}/100</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Engajamento</p>
                      <p className="text-sm font-semibold text-gray-900">{company.engagementScore}/100</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h5 className="font-semibold text-gray-900">Pontos de Melhoria</h5>
                    </div>
                    <ul className="space-y-2">
                      {company.improvementPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
