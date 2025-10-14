import { useState } from 'react';
import { BatchAuditProcessor } from './components/BatchAuditProcessor';
import { BatchAuditResults } from './components/BatchAuditResults';
import { ComparisonForm } from './components/ComparisonForm';
import { ComparisonProcessor } from './components/ComparisonProcessor';
import { ComparisonReport } from './components/ComparisonReport';
import { ComparisonHistory } from './components/ComparisonHistory';
import { PlatformPresenceForm } from './components/PlatformPresenceForm';
import { PlatformPresenceReport } from './components/PlatformPresenceReport';
import { ApiKeyWarning } from './components/ApiKeyWarning';
import { TenantSelector } from './components/TenantSelector';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandingManager } from './components/BrandingManager';
import { RoyaltyReports } from './components/RoyaltyReports';
import { ApiDocsViewer } from './components/ApiDocsViewer';
import { useTenant } from './contexts/TenantContext';
import { RealCompanyAudit } from './services/batchAudit';
import { CompetitiveComparison } from './services/competitiveComparison';
import { MultiPlatformAnalysis, checkMultiPlatformPresence } from './services/platformPresence';
import { BarChart3, TrendingUp, Users, FileText, MapPin, Settings, Palette, DollarSign, Code } from 'lucide-react';

type AppMode = 'home' | 'batch-upload' | 'batch-results' | 'comparison-form' | 'comparison-processing' | 'comparison-results' | 'history' | 'platform-form' | 'platform-processing' | 'platform-results' | 'admin-dashboard' | 'branding' | 'reports' | 'api-docs';

function App() {
  const { currentTenant, loading: tenantLoading } = useTenant();
  const [mode, setMode] = useState<AppMode>('home');
  const [batchAuditResults, setBatchAuditResults] = useState<RealCompanyAudit[]>([]);
  const [comparisonData, setComparisonData] = useState<{
    companyName: string;
    city: string;
    segment: string;
  } | null>(null);
  const [comparisonResult, setComparisonResult] = useState<CompetitiveComparison | null>(null);
  const [platformData, setPlatformData] = useState<{
    companyName: string;
    city: string;
    state: string;
    address: string;
    category: string;
  } | null>(null);
  const [platformResult, setPlatformResult] = useState<MultiPlatformAnalysis | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);

  const goHome = () => {
    setMode('home');
  };

  const resetBatchAnalysis = () => {
    setBatchAuditResults([]);
    setMode('batch-upload');
  };

  const handleBatchAuditComplete = (_auditId: string, results: RealCompanyAudit[]) => {
    console.log('✅ Auditoria completa! Mostrando', results.length, 'resultados');
    setBatchAuditResults(results);
    setMode('batch-results');
  };

  const handleComparisonSubmit = (companyName: string, city: string, segment: string) => {
    setComparisonData({ companyName, city, segment });
    setMode('comparison-processing');
  };

  const handleComparisonComplete = (comparison: CompetitiveComparison) => {
    setComparisonResult(comparison);
    setMode('comparison-results');
  };

  const resetComparison = () => {
    setComparisonData(null);
    setComparisonResult(null);
    setMode('comparison-form');
  };

  const handlePlatformSubmit = async (data: {
    companyName: string;
    city: string;
    state: string;
    address: string;
    category: string;
  }) => {
    setPlatformData(data);
    setPlatformLoading(true);
    setMode('platform-processing');

    try {
      const result = await checkMultiPlatformPresence(
        data.companyName,
        data.city,
        data.state,
        data.address,
        data.category
      );
      setPlatformResult(result);
      setMode('platform-results');
    } catch (error) {
      console.error('Erro na análise de plataformas:', error);
      alert('Erro ao analisar presença em plataformas. Tente novamente.');
      setMode('platform-form');
    } finally {
      setPlatformLoading(false);
    }
  };

  const resetPlatformAnalysis = () => {
    setPlatformData(null);
    setPlatformResult(null);
    setMode('platform-form');
  };


  if (tenantLoading) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando Sistema...</h2>
          <p className="text-gray-600">Inicializando GMN SmartLocal Auditor PRO</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg">
      <ApiKeyWarning />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <header className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">GMN SmartLocal Auditor PRO</h1>
                <p className="text-blue-100 text-lg">Auditoria Digital Completa + Presença Multiplataforma</p>
              </div>
            </div>
            {currentTenant && (
              <div className="ml-4">
                <TenantSelector
                  currentTenantId={currentTenant.id}
                  onTenantChange={() => {}}
                />
              </div>
            )}
          </div>
        </header>

        {mode === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Escolha o Tipo de Análise</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => setMode('batch-upload')}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Auditoria em Lote</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Analise múltiplas empresas de uma vez através de planilha. Perfeito para análise de mercado e identificação de oportunidades em escala.
                  </p>
                  <div className="mt-4 text-sm text-blue-600 font-medium">
                    → Fazer upload de planilha
                  </div>
                </button>

                <button
                  onClick={() => setMode('comparison-form')}
                  className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-8 border-2 border-green-200 hover:border-green-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Comparação Competitiva</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Compare uma empresa com o líder do seu segmento na cidade. Receba sugestões detalhadas para ultrapassar a concorrência.
                  </p>
                  <div className="mt-4 text-sm text-green-600 font-medium">
                    → Comparar com líder
                  </div>
                </button>

                <button
                  onClick={() => setMode('platform-form')}
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Presença Multiplataforma</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Verifique presença em Google Maps, Apple Maps, Waze, Uber, 99 e TripAdvisor. Identifique oportunidades de expansão.
                  </p>
                  <div className="mt-4 text-sm text-purple-600 font-medium">
                    → Verificar presença
                  </div>
                </button>

                <button
                  onClick={() => setMode('history')}
                  className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-8 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Histórico de Análises</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Acesse todas as comparações competitivas realizadas. Baixe relatórios e revise análises anteriores.
                  </p>
                  <div className="mt-4 text-sm text-orange-600 font-medium">
                    → Ver histórico completo
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ferramentas Administrativas</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => setMode('admin-dashboard')}
                  className="group bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl p-8 border-2 border-slate-200 hover:border-slate-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Dashboard Admin</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Gerencie tenants, usuários, quotas e visualize métricas de uso da plataforma.
                  </p>
                  <div className="mt-4 text-sm text-slate-600 font-medium">
                    → Acessar dashboard
                  </div>
                </button>

                <button
                  onClick={() => setMode('branding')}
                  className="group bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl p-8 border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Palette className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">White-Label</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Customize cores, logotipo e identidade visual para refletir sua marca.
                  </p>
                  <div className="mt-4 text-sm text-pink-600 font-medium">
                    → Personalizar marca
                  </div>
                </button>

                <button
                  onClick={() => setMode('reports')}
                  className="group bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl p-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Relatórios Royalty</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Gere relatórios financeiros detalhados com cálculo de royalties e PDFs profissionais.
                  </p>
                  <div className="mt-4 text-sm text-emerald-600 font-medium">
                    → Gerar relatórios
                  </div>
                </button>

                <button
                  onClick={() => setMode('api-docs')}
                  className="group bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-xl p-8 border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Code className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Documentação API</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Referência completa da API REST para integração programática com a plataforma.
                  </p>
                  <div className="mt-4 text-sm text-cyan-600 font-medium">
                    → Ver documentação
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'batch-upload' && (
          <BatchAuditProcessor
            onComplete={handleBatchAuditComplete}
          />
        )}

        {mode === 'batch-results' && (
          <BatchAuditResults
            results={batchAuditResults}
            onNewAudit={resetBatchAnalysis}
          />
        )}

        {mode === 'comparison-form' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ComparisonForm
              onSubmit={handleComparisonSubmit}
              onBack={goHome}
            />
            <ComparisonHistory />
          </div>
        )}

        {mode === 'comparison-processing' && comparisonData && (
          <ComparisonProcessor
            companyName={comparisonData.companyName}
            city={comparisonData.city}
            segment={comparisonData.segment}
            onComplete={handleComparisonComplete}
            onBack={resetComparison}
          />
        )}

        {mode === 'comparison-results' && comparisonResult && (
          <ComparisonReport
            comparison={comparisonResult}
            onNewComparison={resetComparison}
          />
        )}

        {mode === 'platform-form' && (
          <div className="max-w-2xl mx-auto">
            <PlatformPresenceForm
              onSubmit={handlePlatformSubmit}
              onBack={goHome}
            />
          </div>
        )}

        {mode === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {mode === 'branding' && (
          <BrandingManager />
        )}

        {mode === 'reports' && (
          <RoyaltyReports />
        )}

        {mode === 'api-docs' && (
          <ApiDocsViewer />
        )}

        {mode === 'platform-processing' && platformLoading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 animate-pulse">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Analisando Presença...</h2>
              <p className="text-gray-600">
                Verificando {platformData?.companyName} em 6 plataformas diferentes
              </p>
            </div>
          </div>
        )}

        {mode === 'platform-results' && platformResult && (
          <PlatformPresenceReport
            analysis={platformResult}
            onNewAnalysis={resetPlatformAnalysis}
          />
        )}

        {mode === 'history' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={goHome}
                className="text-white hover:text-blue-200 transition-colors flex items-center gap-2"
              >
                ← Voltar ao início
              </button>
            </div>
            <ComparisonHistory />
          </div>
        )}
      </div>

      <footer className="mt-16 pb-8 text-center text-sm text-blue-100">
        <p>GMN SmartAudit AI - Auditoria inteligente de presença digital local</p>
      </footer>
    </div>
  );
}

export default App;
