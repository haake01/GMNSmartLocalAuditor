import { X } from 'lucide-react';
import { ComparisonReport } from './ComparisonReport';
import { CompetitiveComparison } from '../services/competitiveComparison';

interface ComparisonReportModalProps {
  comparison: CompetitiveComparison;
  onClose: () => void;
}

export const ComparisonReportModal = ({ comparison, onClose }: ComparisonReportModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Relatório de Comparação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <ComparisonReport
            comparison={comparison}
            onNewComparison={onClose}
          />
        </div>
      </div>
    </div>
  );
};
