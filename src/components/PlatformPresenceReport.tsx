import { CheckCircle, XCircle, AlertCircle, MapPin, Download } from 'lucide-react';
import { MultiPlatformAnalysis } from '../services/platformPresence';
import * as XLSX from 'xlsx';

interface PlatformPresenceReportProps {
  analysis: MultiPlatformAnalysis;
  onNewAnalysis: () => void;
}

export function PlatformPresenceReport({ analysis, onNewAnalysis }: PlatformPresenceReportProps) {
  const platforms = [
    { key: 'google_maps', data: analysis.google_maps, color: 'blue' },
    { key: 'apple_maps', data: analysis.apple_maps, color: 'gray' },
    { key: 'waze', data: analysis.waze, color: 'cyan' },
    { key: 'uber', data: analysis.uber, color: 'green' },
    { key: 'ninety_nine', data: analysis.ninety_nine, color: 'yellow' },
    { key: 'tripadvisor', data: analysis.tripadvisor, color: 'red' }
  ];

  const getStatusIcon = (present: boolean, verified: boolean) => {
    if (present && verified) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (present && !verified) return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['ANÁLISE DE PRESENÇA MULTIPLATAFORMA'],
      [],
      ['Empresa:', analysis.company_name],
      ['Score Geral de Presença:', `${analysis.overall_presence_score}/100`],
      ['Plataformas Ausentes:', analysis.missing_platforms.join(', ')],
      [],
      ['PLATAFORMA', 'PRESENTE', 'VERIFICADO', 'SCORE', 'DETALHES'],
    ];

    platforms.forEach(({ data }) => {
      summaryData.push([
        data.platform,
        data.present ? 'Sim' : 'Não',
        data.verified ? 'Sim' : 'Não',
        data.score.toString(),
        data.details
      ]);
    });

    summaryData.push([]);
    summaryData.push(['RECOMENDAÇÕES']);
    analysis.recommendations.forEach((rec, idx) => {
      summaryData.push([`${idx + 1}. ${rec}`]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 60 }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!autofilter'] = { ref: `A7:E7` };

    if (!worksheet['!margins']) {
      worksheet['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
    }

    if (!worksheet['!printOptions']) {
      worksheet['!printOptions'] = {};
    }
    worksheet['!printOptions'].orientation = 'landscape';

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s.font = { name: 'Segoe UI', sz: 10 };
        worksheet[cellAddress].s.alignment = {
          wrapText: true,
          vertical: 'top',
          horizontal: 'left'
        };

        if (R === 0 || R === 6) {
          worksheet[cellAddress].s.fill = { fgColor: { rgb: '000000' } };
          worksheet[cellAddress].s.font = { name: 'Segoe UI', sz: 10, color: { rgb: 'FFFFFF' }, bold: true };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presença Multiplataforma');

    const now = new Date();
    const dateTimeStr = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    if (!workbook.Props) workbook.Props = {};
    workbook.Props.Comments = `Gerado em: ${dateTimeStr}`;

    const fileName = `Presenca_Multiplataforma_${analysis.company_name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName, { cellStyles: true, bookType: 'xlsx' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onNewAnalysis}
          className="text-white hover:text-blue-200 transition-colors flex items-center gap-2"
        >
          ← Nova Análise
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{analysis.company_name}</h2>
              <p className="text-sm text-gray-600">Análise de Presença Multiplataforma</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{analysis.overall_presence_score}</div>
            <div className="text-sm text-gray-600">Score Geral</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportToExcel}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar Excel
          </button>

          <button
            onClick={() => generatePlatformAnalysisPDF(analysis)}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Gerar Relatório PDF Completo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {platforms.map(({ data, color }) => (
          <div
            key={data.platform}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{data.platform}</h3>
              {getStatusIcon(data.present, data.verified)}
            </div>

            <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg inline-block ${getScoreColor(data.score)}`}>
              {data.score}
            </div>

            <p className="text-sm text-gray-600 mt-3">{data.details}</p>

            {data.present && data.latitude && data.longitude && (
              <div className="mt-3">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${data.latitude},${data.longitude}&zoom=15&size=280x150&markers=color:red%7C${data.latitude},${data.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                  alt={`Mapa de ${data.platform}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Ver Perfil →
              </a>
            )}
          </div>
        ))}
      </div>

      {analysis.missing_platforms.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-red-800 mb-3">Plataformas Ausentes</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_platforms.map((platform) => (
              <span
                key={platform}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recomendações Priorizadas</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-gray-700 pt-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
