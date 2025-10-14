import { AlertTriangle, ExternalLink } from 'lucide-react';

export const ApiKeyWarning = () => {
  const hasValidKey = import.meta.env.VITE_OPENAI_API_KEY &&
                      import.meta.env.VITE_OPENAI_API_KEY.startsWith('sk-');

  if (hasValidKey) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-top">
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-orange-900 mb-1">
              Configuração Necessária
            </h3>
            <p className="text-sm text-orange-800 mb-3">
              A chave da OpenAI API não está configurada ou é inválida. Configure no arquivo <code className="bg-orange-100 px-1 rounded">.env</code>
            </p>

            <div className="space-y-2">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-900 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Obter chave da OpenAI
              </a>

              <div className="text-xs text-orange-700 bg-orange-100 rounded p-2 font-mono">
                VITE_OPENAI_API_KEY=sk-proj-...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
