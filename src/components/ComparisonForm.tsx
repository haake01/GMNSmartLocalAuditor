import { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ComparisonFormProps {
  onSubmit: (companyName: string, city: string, segment: string) => void;
  onBack: () => void;
}

export const ComparisonForm = ({ onSubmit, onBack }: ComparisonFormProps) => {
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [segment, setSegment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !city.trim() || !segment.trim()) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setError('');
    onSubmit(companyName.trim(), city.trim(), segment.trim());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
      >
        ← Voltar
      </button>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Comparação Competitiva</h2>
          <p className="text-gray-600">
            Compare sua empresa com o líder do segmento na cidade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Restaurante Bella Italia"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
            />
          </div>

          <div>
            <label htmlFor="segment" className="block text-sm font-semibold text-gray-700 mb-2">
              Segmento
            </label>
            <input
              type="text"
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Restaurante Italiano"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-900 font-medium">Erro</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Como funciona:</strong> Vamos buscar o líder do segmento "{segment || '...'}" em "{city || '...'}"
              e comparar com "{companyName || '...'}" em 12 critérios diferentes, fornecendo sugestões detalhadas
              para ultrapassar a concorrência.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Analisar e Comparar
          </button>
        </form>
      </div>
    </div>
  );
};
