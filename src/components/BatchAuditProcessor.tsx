import { useState, useEffect, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseFile, CompanyInput } from '../utils/spreadsheetParser';
import { BatchProgress, RealCompanyAudit } from '../services/batchAudit';
import { saveAuditToDatabase } from '../services/auditStorage';

interface BatchAuditProcessorProps {
  onComplete: (auditId: string, results: RealCompanyAudit[]) => void;
}

export const BatchAuditProcessor = ({ onComplete }: BatchAuditProcessorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<CompanyInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [, setShouldStop] = useState(false);
  const [partialResults, setPartialResults] = useState<RealCompanyAudit[]>([]);
  const shouldStopRef = useRef(false);

  useEffect(() => {
    if (isProcessing) {
      setElapsedTime(0);
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    try {
      const parsed = await parseFile(selectedFile);
      setCompanies(parsed);
      console.log(`Arquivo carregado: ${parsed.length} empresas encontradas`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao ler arquivo';
      setError(message);
      setFile(null);
      setCompanies([]);
    }
  };

  const handleStopProcessing = () => {
    console.log('🛑 Usuário solicitou parar o processamento');
    shouldStopRef.current = true;
    setShouldStop(true);
  };

  const handleRestartProcessing = () => {
    console.log('🔄 Reiniciando processamento');
    shouldStopRef.current = false;
    setProgress(null);
    setError(null);
    setPartialResults([]);
    setShouldStop(false);
  };

  const handleStartProcessing = async () => {
    if (companies.length === 0) return;

    setIsProcessing(true);
    setError(null);
    shouldStopRef.current = false;
    setShouldStop(false);
    setPartialResults([]);

    try {
      console.log(`🚀 Iniciando processamento de ${companies.length} empresas...`);

      const results: RealCompanyAudit[] = [];

      for (let i = 0; i < companies.length; i++) {
        if (shouldStopRef.current) {
          console.log('⏹️ Processamento interrompido pelo usuário');
          setError('Processamento interrompido pelo usuário');
          break;
        }

        setProgress({
          current: i + 1,
          total: companies.length,
          percentage: Math.round(((i + 1) / companies.length) * 100),
          currentCompany: companies[i].company_name,
          status: 'processing'
        });

        try {
          const { auditSingleCompany } = await import('../services/batchAudit');
          const result = await auditSingleCompany(companies[i]);
          results.push(result);
          setPartialResults([...results]);
          console.log(`✅ ${i + 1}/${companies.length} - ${companies[i].company_name}`);
        } catch (error) {
          console.error(`❌ Erro em ${companies[i].company_name}:`, error);
          results.push({
            ...companies[i],
            has_gmn_profile: false,
            verification_status: 'Erro na análise',
            nap_consistency_score: 0,
            has_products: false,
            images_count: 0,
            has_geotags: false,
            posts_per_week: 0,
            rating: 0,
            total_reviews: 0,
            review_response_rate: 0,
            seo_score: 0,
            engagement_score: 0,
            overall_score: 0,
            improvement_points: ['Erro ao processar'],
            should_invite_for_optimization: true
          });
        }

        if (i < companies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!shouldStopRef.current && results.length > 0) {
        console.log('✅ Todas as empresas foram processadas!');
        console.log('📊 Total de resultados:', results.length);

        const segment = companies[0]?.category || 'Diversos';
        const city = companies[0]?.city || 'Múltiplas cidades';
        const state = companies[0]?.state;

        console.log('💾 Salvando no banco de dados...');
        const auditId = await saveAuditToDatabase(segment, city, state, results);
        console.log(`✅ Auditoria salva com ID: ${auditId}`);

        console.log('🎯 Chamando onComplete com', results.length, 'resultados');
        onComplete(auditId, results);
      } else if (shouldStopRef.current && results.length > 0) {
        console.log('⚠️ Processamento interrompido. Mostrando resultados parciais:', results.length);
        const auditId = await saveAuditToDatabase('Parcial', companies[0]?.city || 'N/A', companies[0]?.state, results);
        onComplete(auditId, results);
      }
    } catch (err) {
      console.error('❌ Erro no processamento:', err);
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao processar: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Auditoria em Lote
          </h2>
          <p className="text-gray-600">
            Analise centenas de empresas reais do Google Meu Negócio
          </p>
        </div>

        {!isProcessing && !progress && (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Clique para selecionar arquivo
                </p>
                <p className="text-sm text-gray-500">
                  Formatos: CSV, XLS, XLSX
                </p>
              </label>
            </div>

            {file && companies.length > 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-green-900 font-medium">
                      Arquivo carregado com sucesso!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {companies.length} empresas encontradas
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Tempo estimado: {Math.ceil(companies.length / 10)} minutos
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-medium">Erro</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {companies.length > 0 && (
              <button
                onClick={handleStartProcessing}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Iniciar Análise de {companies.length} Empresas
              </button>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Formato da Planilha:
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <p className="mb-3 font-semibold text-gray-800">Formatos aceitos: CSV, XLS, XLSX</p>
                <p className="mb-2">Colunas obrigatórias:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="font-mono font-semibold">Nome da Empresa</span>, <span className="font-mono">Empresa</span>, ou <span className="font-mono">Razão Social</span></li>
                  <li><span className="font-mono font-semibold">Cidade</span> ou <span className="font-mono">Município</span></li>
                </ul>
                <p className="mt-3 mb-2">Colunas opcionais (melhoram a análise):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="font-mono">Estado</span> ou <span className="font-mono">UF</span></li>
                  <li><span className="font-mono">Categoria</span> ou <span className="font-mono">Segmento</span></li>
                  <li><span className="font-mono">Telefone</span></li>
                  <li><span className="font-mono">Endereço</span></li>
                  <li><span className="font-mono">Website</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {isProcessing && progress && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-blue-900">
                    Processando empresas...
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {progress.current} de {progress.total} empresas ({progress.percentage}%)
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>Empresa atual: {progress.currentCompany}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-blue-600 mt-4">
                <div>
                  <p>⏱️ Tempo decorrido: <span className="font-bold">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span></p>
                  <p className="mt-1">⏳ Tempo estimado restante: <span className="font-bold">{Math.ceil((progress.total - progress.current) / 10)} minutos</span></p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-700">
                    {progress.current}/{progress.total} empresas
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3 font-medium">
                ⚠️ Não feche esta janela durante o processamento
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleStopProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  ⏹️ Parar Processamento
                </button>
                <button
                  onClick={handleRestartProcessing}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🔄 Reiniciar
                </button>
              </div>
            </div>

            {partialResults.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✅ Processados:</strong> {partialResults.length} resultados prontos
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Como funciona:</strong> A IA está analisando cada empresa individualmente
                no Google Meu Negócio, verificando os 12 critérios de auditoria. Isso pode levar alguns minutos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
