import { RealCompanyAudit } from '../services/batchAudit';
import { Download, Printer, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BatchAuditResultsProps {
  results: RealCompanyAudit[];
  onNewAudit: () => void;
}

export const BatchAuditResults = ({ results, onNewAudit }: BatchAuditResultsProps) => {
  console.log('🎯 BatchAuditResults renderizado com', results.length, 'resultados');
  console.log('📊 Primeiros 3 resultados:', results.slice(0, 3));

  const totalCompanies = results.length;
  const withProfile = results.filter(c => c.has_gmn_profile).length;
  const withoutProfile = totalCompanies - withProfile;
  const avgScore = Math.round(results.reduce((sum, c) => sum + c.overall_score, 0) / totalCompanies);
  const needsOptimization = results.filter(c => c.has_gmn_profile && c.should_invite_for_optimization).length;
  const needsCreation = withoutProfile;

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    const segment = results[0]?.category || 'Diversos';
    const city = results[0]?.city || 'Múltiplas cidades';

    const data = results.map(company => {
      const improvements = company.improvement_points;
      const row: any = {
        'Empresa': company.company_name,
        'Cidade': company.city,
        'Estado': company.state || '',
        'Tem Perfil GMN': company.has_gmn_profile ? 'Sim' : 'Não',
        'Status Verificação': company.verification_status,
        'Score Geral': company.overall_score,
        'Nota Google': company.rating,
        'Total Avaliações': company.total_reviews,
        'Score NAP': company.nap_consistency_score,
        'Tem Produtos': company.has_products ? 'Sim' : 'Não',
        'Qtd Imagens': company.images_count,
        'Tem Geotags': company.has_geotags ? 'Sim' : 'Não',
        'Posts/Semana': company.posts_per_week,
        'Taxa Resposta (%)': company.review_response_rate,
        'Score SEO': company.seo_score,
        'Score Engajamento': company.engagement_score,
        'Convidar para Otimização': company.should_invite_for_optimization ? 'Sim' : 'Não',
      };

      for (let i = 0; i < 5; i++) {
        row[`Melhoria ${i + 1}`] = improvements[i] || '';
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    worksheet['!cols'] = [
      { wch: 31 },
      { wch: 22 },
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 }
    ];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;

      worksheet[address].s = {
        fill: { fgColor: { rgb: '000000' } },
        font: { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) continue;

        if (R > 0) {
          worksheet[address].s = {
            font: { name: 'Segoe UI', sz: 10 },
            alignment: { wrapText: true, vertical: 'top' }
          };
        }
      }
    }

    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    const footerRow = range.e.r + 3;
    worksheet[`A${footerRow}`] = {
      v: `Relatório gerado em: ${dateStr} às ${timeStr}`,
      t: 's',
      s: { font: { name: 'Segoe UI', sz: 10, bold: true } }
    };
    worksheet[`A${footerRow + 1}`] = {
      v: `Segmento: ${segment}`,
      t: 's',
      s: { font: { name: 'Segoe UI', sz: 10, bold: true } }
    };
    worksheet[`A${footerRow + 2}`] = {
      v: `Cidade: ${city}`,
      t: 's',
      s: { font: { name: 'Segoe UI', sz: 10, bold: true } }
    };

    range.e.r = footerRow + 2;
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria GMN');

    XLSX.writeFile(workbook, `Auditoria_GMN_${dateStr.replace(/\//g, '-')}.xlsx`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (hasProfile: boolean) => {
    if (hasProfile) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Possui GMN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        <AlertTriangle className="w-3 h-3" />
        Sem GMN
      </span>
    );
  };

  if (results.length === 0) {
    console.warn('⚠️ BatchAuditResults renderizado mas results está vazio!');
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-600">Nenhum resultado disponível</p>
        <button onClick={onNewAudit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Nova Auditoria
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Resultados da Auditoria</h2>
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
          <button
            onClick={onNewAudit}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
          >
            Nova Auditoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Total de Empresas</p>
          <p className="text-3xl font-bold text-gray-900">{totalCompanies}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Com Perfil GMN</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-600">{withProfile}</p>
            <p className="text-sm text-gray-500">({Math.round((withProfile / totalCompanies) * 100)}%)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Sem Perfil GMN</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-red-600">{withoutProfile}</p>
            <p className="text-sm text-gray-500">({Math.round((withoutProfile / totalCompanies) * 100)}%)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Score Médio</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {avgScore}
            </p>
            <span className="text-gray-500">/100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Oportunidades de Negócio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">Criação de Perfil GMN</p>
            <p className="text-2xl font-bold text-blue-900">{needsCreation}</p>
            <p className="text-xs text-blue-600 mt-1">perfis sem GMN</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-2">Otimização Necessária</p>
            <p className="text-2xl font-bold text-orange-900">{needsOptimization}</p>
            <p className="text-xs text-orange-600 mt-1">perfis com GMN a otimizar</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-2">Potencial Total</p>
            <p className="text-2xl font-bold text-green-900">{needsCreation + needsOptimization}</p>
            <p className="text-xs text-green-600 mt-1">leads qualificados</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Empresas Analisadas</h3>
          <p className="text-sm text-gray-600 mt-1">Resultados detalhados de cada empresa</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cidade</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Score</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Nota</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Avaliações</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((company, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{company.company_name}</p>
                      <p className="text-xs text-gray-500">{company.category || 'Sem categoria'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {company.city}{company.state ? `, ${company.state}` : ''}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(company.has_gmn_profile)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(company.overall_score)}`}>
                      {company.overall_score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {company.has_gmn_profile ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium text-gray-900">{company.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {company.has_gmn_profile ? company.total_reviews : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {!company.has_gmn_profile ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                        <TrendingUp className="w-3 h-3" />
                        Criar GMN
                      </span>
                    ) : company.should_invite_for_optimization ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700">
                        <TrendingUp className="w-3 h-3" />
                        Otimizar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Bom
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
