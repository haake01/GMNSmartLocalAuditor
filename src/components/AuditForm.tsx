import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { hasOpenAIKey, getOpenAIKey } from '../config/apiConfig';

interface AuditFormProps {
  onSubmit: (segment: string, city: string) => void;
  isProcessing: boolean;
}

export const AuditForm = ({ onSubmit, isProcessing }: AuditFormProps) => {
  const [segment, setSegment] = useState('');
  const [city, setCity] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const keyExists = hasOpenAIKey();
    const keyLength = keyExists ? getOpenAIKey().length : 0;
    setApiKeyStatus(`API Key: ${keyExists ? '✅ Configurada' : '❌ NÃO configurada'} (${keyLength} chars)`);
    console.log('=== DEBUG API KEY ===');
    console.log('Has key:', keyExists);
    console.log('Key length:', keyLength);
    console.log('Key preview:', keyExists ? getOpenAIKey().substring(0, 20) + '...' : 'N/A');
  }, []);

  useEffect(() => {
    if (isProcessing) {
      setElapsedTime(0);
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (segment.trim() && city.trim()) {
      onSubmit(segment.trim(), city.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {apiKeyStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-mono">
          {apiKeyStatus}
        </div>
      )}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Auditoria Inteligente GMN
          </h2>
          <p className="text-gray-600">
            Análise completa do Google Meu Negócio com inteligência artificial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="segment" className="block text-sm font-semibold text-gray-700 mb-2">
              Segmento
            </label>
            <input
              type="text"
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: restaurantes, clínicas, academias, salões de beleza"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
              disabled={isProcessing}
              required
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
              placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
              disabled={isProcessing}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !segment.trim() || !city.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analisando com IA...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Analisar com IA</span>
              </>
            )}
          </button>

          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Processando com OpenAI GPT-4o-mini...</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Processando há <span className="font-bold">{elapsedTime}s</span> • Aguarde até 60 segundos • Não recarregue a página
                  </p>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min((elapsedTime / 60) * 100, 100)}%` }}
                ></div>
              </div>
              {elapsedTime >= 60 && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  ⚠️ Processamento está demorando mais que o esperado... Aguardando resposta da OpenAI...
                </p>
              )}
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            12 Critérios de Auditoria:
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Presença e verificação</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Consistência NAP</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Categorias</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Horário de funcionamento</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Fotos e vídeos</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Postagens recentes</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Avaliações</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Palavras-chave e SEO</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Linkagem site/redes</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Respostas proprietário</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Conformidade GBP</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <span>Performance comparativa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
