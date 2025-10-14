import { Code, Key, Zap, BookOpen, CheckCircle } from 'lucide-react';

export function ApiDocsViewer() {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || 'https://your-project.supabase.co';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Documentação da API</h2>
        <p className="text-gray-600 mt-1">Referência completa para integração programática</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">GMN SmartLocal API v3.1</h3>
            <p className="text-white/90">RESTful API para auditorias e análises competitivas</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">REST</div>
            <div className="text-sm text-white/80">Arquitetura</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">JSON</div>
            <div className="text-sm text-white/80">Formato</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">OAuth 2.0</div>
            <div className="text-sm text-white/80">Autenticação</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Key className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Autenticação</h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Todas as requisições à API requerem uma API key válida enviada no header <code className="bg-gray-100 px-2 py-1 rounded">Authorization</code>.
          </p>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`curl -X GET "${baseUrl}/api/v1/audits" \\
  -H "Authorization: Bearer gmn_live_your_api_key_here" \\
  -H "Content-Type: application/json"`}</code>
            </pre>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-900">
              <strong>Dica:</strong> Gere sua API key na aba "API Keys" do painel administrativo.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Code className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Endpoints Disponíveis</h3>
        </div>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">GET</span>
              <code className="text-sm font-mono">/api/v1/audits</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Lista todas as auditorias do tenant</p>
            <div className="bg-gray-50 rounded p-3 text-sm">
              <strong>Query Parameters:</strong>
              <ul className="list-disc list-inside mt-1 text-gray-600">
                <li><code>limit</code> - Número de resultados (padrão: 50, max: 100)</li>
                <li><code>offset</code> - Paginação (padrão: 0)</li>
                <li><code>segment</code> - Filtrar por segmento</li>
                <li><code>city</code> - Filtrar por cidade</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 mt-3 overflow-x-auto">
              <pre className="text-green-400 text-xs">
                <code>{`{
  "data": [
    {
      "id": "uuid",
      "segment": "Restaurantes",
      "city": "São Paulo",
      "overall_score": 85,
      "companies_analyzed": 50,
      "created_at": "2025-10-13T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1
}`}</code>
              </pre>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">POST</span>
              <code className="text-sm font-mono">/api/v1/audits</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Cria uma nova auditoria</p>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <pre className="text-green-400 text-xs">
                <code>{`{
  "segment": "Restaurantes",
  "city": "São Paulo",
  "state": "SP",
  "companies": [
    {
      "company_name": "Restaurante Exemplo",
      "address": "Rua Exemplo, 123",
      "category": "Restaurante"
    }
  ]
}`}</code>
              </pre>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">GET</span>
              <code className="text-sm font-mono">/api/v1/audits/:id</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Obtém detalhes de uma auditoria específica</p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">GET</span>
              <code className="text-sm font-mono">/api/v1/comparisons</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Lista comparações competitivas</p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">POST</span>
              <code className="text-sm font-mono">/api/v1/comparisons</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Cria nova comparação competitiva</p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">GET</span>
              <code className="text-sm font-mono">/api/v1/reports/royalty</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Gera relatório de royalty do período</p>
            <div className="bg-gray-50 rounded p-3 text-sm mt-2">
              <strong>Query Parameters:</strong>
              <ul className="list-disc list-inside mt-1 text-gray-600">
                <li><code>start_date</code> - Data inicial (ISO 8601)</li>
                <li><code>end_date</code> - Data final (ISO 8601)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Rate Limiting</h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            A API implementa rate limiting para garantir fair usage:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">60 req/min</div>
              <div className="text-sm text-gray-600">Limite por minuto</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">10.000 req/dia</div>
              <div className="text-sm text-gray-600">Limite diário</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Atenção:</strong> Limites podem ser ajustados por tenant. Verifique os headers de resposta:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-yellow-800">
              <li><code>X-RateLimit-Limit</code> - Limite total</li>
              <li><code>X-RateLimit-Remaining</code> - Requisições restantes</li>
              <li><code>X-RateLimit-Reset</code> - Timestamp do reset</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Códigos de Status</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
            <span className="px-3 py-1 bg-green-600 text-white rounded font-bold text-sm">200</span>
            <span className="text-gray-700">Sucesso - Requisição processada com sucesso</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
            <span className="px-3 py-1 bg-green-600 text-white rounded font-bold text-sm">201</span>
            <span className="text-gray-700">Criado - Recurso criado com sucesso</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
            <span className="px-3 py-1 bg-yellow-600 text-white rounded font-bold text-sm">400</span>
            <span className="text-gray-700">Bad Request - Parâmetros inválidos</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
            <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-sm">401</span>
            <span className="text-gray-700">Unauthorized - API key inválida ou ausente</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
            <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-sm">403</span>
            <span className="text-gray-700">Forbidden - Sem permissão para este recurso</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
            <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-sm">429</span>
            <span className="text-gray-700">Too Many Requests - Rate limit excedido</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
            <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-sm">500</span>
            <span className="text-gray-700">Internal Server Error - Erro no servidor</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SDKs e Bibliotecas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🐍</div>
            <div className="font-semibold">Python</div>
            <code className="text-xs text-gray-600">pip install gmn-api</code>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <div className="font-semibold">Node.js</div>
            <code className="text-xs text-gray-600">npm install @gmn/api</code>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="font-semibold">Ruby</div>
            <code className="text-xs text-gray-600">gem install gmn-api</code>
          </div>
        </div>
      </div>
    </div>
  );
}
