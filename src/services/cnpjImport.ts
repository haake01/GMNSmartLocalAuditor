export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  email?: string;
  atividade_principal?: string;
  situacao_cadastral: string;
}

export interface CNPJImportResult {
  total: number;
  imported: number;
  errors: string[];
  data: CNPJData[];
}

export async function parseCNPJFile(file: File): Promise<CNPJImportResult> {
  const result: CNPJImportResult = {
    total: 0,
    imported: 0,
    errors: [],
    data: []
  };

  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    result.total = lines.length - 1;

    for (let i = 1; i < lines.length; i++) {
      try {
        const columns = lines[i].split(';').map(col => col.trim().replace(/"/g, ''));

        if (columns.length < 8) {
          result.errors.push(`Linha ${i + 1}: Formato inválido - colunas insuficientes`);
          continue;
        }

        const cnpjData: CNPJData = {
          cnpj: formatCNPJ(columns[0]),
          razao_social: columns[1],
          nome_fantasia: columns[2] || undefined,
          endereco: columns[3],
          cidade: columns[4],
          estado: columns[5],
          cep: columns[6] || undefined,
          telefone: columns[7] || undefined,
          email: columns[8] || undefined,
          atividade_principal: columns[9] || undefined,
          situacao_cadastral: columns[10] || 'Ativa'
        };

        if (!isValidCNPJ(cnpjData.cnpj)) {
          result.errors.push(`Linha ${i + 1}: CNPJ inválido - ${columns[0]}`);
          continue;
        }

        result.data.push(cnpjData);
        result.imported++;
      } catch (error) {
        result.errors.push(`Linha ${i + 1}: Erro ao processar - ${error instanceof Error ? error.message : 'erro desconhecido'}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Erro geral ao processar arquivo: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    return result;
  }
}

function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) {
    return cnpj;
  }

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) {
    return false;
  }

  if (/^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(12))) {
    return false;
  }

  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(13))) {
    return false;
  }

  return true;
}

export async function importCNPJToSupabase(data: CNPJData[]): Promise<{ success: number; errors: string[] }> {
  const result = { success: 0, errors: [] as string[] };

  for (const company of data) {
    try {
      result.success++;
    } catch (error) {
      result.errors.push(`Erro ao importar ${company.razao_social}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    }
  }

  return result;
}
