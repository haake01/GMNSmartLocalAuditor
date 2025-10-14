interface PrintHeaderProps {
  sessionName: string;
  totalCompanies: number;
}

export const PrintHeader = ({ sessionName, totalCompanies }: PrintHeaderProps) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Relatório de Análise GMN - {sessionName}
      </h1>
      <div className="flex justify-between text-sm text-gray-600">
        <div>
          <p><strong>Segmento:</strong> {sessionName}</p>
          <p><strong>Total de Empresas:</strong> {totalCompanies}</p>
        </div>
        <div className="text-right">
          <p><strong>Data:</strong> {dateStr}</p>
          <p><strong>Hora:</strong> {timeStr}</p>
        </div>
      </div>
    </div>
  );
};
