import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Clock } from 'lucide-react';
import { performCompetitiveComparison, CompetitiveComparison } from '../services/competitiveComparison';
import { saveComparison } from '../services/comparisonStorage';

interface ComparisonProcessorProps {
  companyName: string;
  city: string;
  segment: string;
  onComplete: (comparison: CompetitiveComparison) => void;
  onBack: () => void;
}

export const ComparisonProcessor = ({
  companyName,
  city,
  segment,
  onComplete,
  onBack
}: ComparisonProcessorProps) => {
  const [status, setStatus] = useState<string>('Iniciando análise...');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const performAnalysis = async () => {
    try {
      setStatus('Buscando líder do segmento...');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(25);
      setStatus('Analisando sua empresa...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(50);
      setStatus('Analisando empresa líder...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(75);
      setStatus('Gerando comparação detalhada...');
      const comparison = await performCompetitiveComparison(companyName, city, segment);

      setProgress(90);
      setStatus('Salvando análise...');
      await saveComparison(comparison, city, segment);

      setProgress(95);
      setStatus('Análise concluída!');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      onComplete(comparison);
    } catch (err) {
      console.error('Erro na comparação:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        setError('Chave da API OpenAI inválida ou expirada. Configure uma chave válida no arquivo .env (VITE_OPENAI_API_KEY).');
      } else if (errorMessage.includes('rate limit')) {
        setError('Limite de requisições atingido. Aguarde alguns minutos e tente novamente.');
      } else if (errorMessage.includes('timeout')) {
        setError('Tempo limite excedido. Tente novamente ou reduza o tamanho da análise.');
      } else {
        setError(`Erro ao realizar a comparação: ${errorMessage}`);
      }
    }
  };

  useEffect(() => {
    performAnalysis();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl mb-6 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Análise em Andamento</h2>
          <p className="text-gray-600 mb-8">
            Comparando {companyName} com o líder do segmento
          </p>

          {!error ? (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">{status}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progresso</span>
                  <span className="text-lg font-bold text-green-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Tempo decorrido:</span>
                  <span className="text-xl font-bold">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>📍 Cidade: {city}</p>
                <p>🏢 Segmento: {segment}</p>
                <p>⏱️ Tempo estimado: 2-3 minutos</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">{error}</p>
              </div>

              <button
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all"
              >
                Voltar e Tentar Novamente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
