import { Download, ExternalLink, TrendingUp, Star, XCircle, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Database } from '../lib/supabase';
import { PrintHeader } from './PrintHeader';

type Company = Database['public']['Tables']['companies']['Row'];

interface ResultsTableProps {
  companies: Company[];
  sessionName: string;
}

export const ResultsTable = ({ companies, sessionName }: ResultsTableProps) => {
  const exportToExcel = () => {
    const flatData: any[] = [];

    companies.forEach(company => {
      const improvementPoints = company.improvement_points || [];
      const maxRows = Math.max(1, improvementPoints.length);

      for (let i = 0; i < maxRows; i++) {
        flatData.push({
          'Nome da Empresa': i === 0 ? company.company_name : '',
          'Cidade': i === 0 ? company.city : '',
          'Estado': i === 0 ? (company.state || '') : '',
          'Status GMN': i === 0 ? (company.has_gmn_profile ? 'Possui' : 'Não possui') : '',
          'Endereço': i === 0 ? (company.address || '') : '',
          'Telefone': i === 0 ? (company.phone || '') : '',
          'Website': i === 0 ? (company.website || '') : '',
          'Nota Média': i === 0 ? (company.rating || '') : '',
          'Total de Avaliações': i === 0 ? (company.total_reviews || 0) : '',
          'Palavras-Chave': i === 0 ? (company.review_keywords?.join(', ') || '') : '',
          'Pontos de Melhoria': improvementPoints[i] || ''
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);

    const columnWidths = [
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 40 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 40 },
      { wch: 80 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análise GMN');
    XLSX.writeFile(workbook, `${sessionName}_analise_gmn.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const companiesWithGMN = companies.filter(c => c.has_gmn_profile).length;
  const companiesWithoutGMN = companies.length - companiesWithGMN;
  const avgRating = companies
    .filter(c => c.rating)
    .reduce((sum, c) => sum + (c.rating || 0), 0) / companiesWithGMN || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
      <PrintHeader sessionName={sessionName} totalCompanies={companies.length} />
      <div className="p-6 border-b border-gray-200 print:p-2 print:border-b-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{sessionName}</h2>
            <p className="text-sm text-gray-500 mt-1">Análise de presença no Google Meu Negócio</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Com Perfil GMN</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companiesWithGMN} <span className="text-sm text-gray-500">({Math.round(companiesWithGMN / companies.length * 100)}%)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sem Perfil GMN</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companiesWithoutGMN} <span className="text-sm text-gray-500">({Math.round(companiesWithoutGMN / companies.length * 100)}%)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-gray-900">{avgRating > 0 ? avgRating.toFixed(2) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-w-full">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status GMN</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Avaliações</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[400px]">Pontos de Melhoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{company.company_name}</p>
                    {company.category && (
                      <p className="text-xs text-gray-500 mt-1">{company.category}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{company.city}</p>
                  {company.state && (
                    <p className="text-xs text-gray-500">{company.state}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    company.has_gmn_profile
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.has_gmn_profile ? 'Possui' : 'Não possui'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {company.has_gmn_profile ? (
                    <div className="space-y-1">
                      {company.phone && (
                        <p className="text-sm text-gray-900">{company.phone}</p>
                      )}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {company.has_gmn_profile && company.rating ? (
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{company.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{company.total_reviews} avaliações</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </td>
                <td className="px-6 py-4 min-w-[400px]">
                  {company.improvement_points && company.improvement_points.length > 0 ? (
                    <div className="space-y-1.5">
                      {company.improvement_points.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 font-medium">Perfil bem otimizado</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
