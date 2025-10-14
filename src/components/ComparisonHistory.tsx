import { useEffect, useState } from 'react';
import { Download, FileText, Calendar, TrendingDown, Loader2 } from 'lucide-react';
import { getComparisonHistory, StoredComparison } from '../services/comparisonStorage';
import { exportComparisonToExcel } from '../utils/comparisonExport';
import { ComparisonReportModal } from './ComparisonReportModal';

export const ComparisonHistory = () => {
  const [history, setHistory] = useState<StoredComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComparison, setSelectedComparison] = useState<StoredComparison | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getComparisonHistory();
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (comparison: StoredComparison) => {
    exportComparisonToExcel(comparison.comparison_data);
  };

  const handleView = (comparison: StoredComparison) => {
    setSelectedComparison(comparison);
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Histórico de Análises</h2>
          <p className="text-sm text-gray-600">{history.length} comparações realizadas</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma análise realizada ainda.</p>
          <p className="text-sm mt-2">As análises aparecerão aqui após serem concluídas.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-bold text-blue-600 text-lg mb-1">{item.company_name}</h3>
                    {item.comparison_data.company_data.gmn_url && (
                      <a
                        href={item.comparison_data.company_data.gmn_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline block"
                      >
                        🔗 Link GMN
                      </a>
                    )}
                    {item.comparison_data.company_data.website ? (
                      <a
                        href={item.comparison_data.company_data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline block"
                      >
                        🌐 {item.comparison_data.company_data.website}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 block">Site Inexistente</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-800 font-semibold mb-1">vs {item.leader_name}</p>
                    {item.comparison_data.leader_data.gmn_url && (
                      <a
                        href={item.comparison_data.leader_data.gmn_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline block"
                      >
                        🔗 Link GMN
                      </a>
                    )}
                    {item.comparison_data.leader_data.website && (
                      <a
                        href={item.comparison_data.leader_data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 hover:underline block"
                      >
                        🌐 {item.comparison_data.leader_data.website}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {item.segment && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        📊 {item.segment}
                      </span>
                    )}
                    {item.comparison_data.gmn_position && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        📍 Posição GMN: {item.comparison_data.gmn_position}
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      📉 Gap: {item.overall_gap.toFixed(1)} pontos
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Baixar Excel"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleView(item)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Visualizar/Imprimir"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedComparison && (
        <ComparisonReportModal
          comparison={selectedComparison.comparison_data}
          onClose={() => setSelectedComparison(null)}
        />
      )}
    </div>
  );
};
