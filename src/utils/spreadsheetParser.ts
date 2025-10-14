import * as XLSX from 'xlsx';

export interface CompanyInput {
  company_name: string;
  city: string;
  state?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export async function parseFile(file: File): Promise<CompanyInput[]> {
  try {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
      console.log('Processando arquivo Excel:', file.name);
      return await parseExcel(file);
    } else {
      console.log('Processando arquivo CSV:', file.name);
      const text = await file.text();
      return parseCSV(text);
    }
  } catch (error) {
    console.error('Erro em parseFile:', error);
    throw error;
  }
}

export function parseExcel(file: File): Promise<CompanyInput[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log('FileReader onload disparado');
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        console.log('Workbook lido, sheets:', workbook.SheetNames);

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
        console.log('JSON data extraído, linhas:', jsonData.length);

        if (jsonData.length === 0) {
          reject(new Error('Planilha vazia'));
          return;
        }

        const headers = jsonData[0].map(h => (h != null ? String(h) : '').toLowerCase().trim());
        console.log('Headers processados:', headers);
        const rows = jsonData.slice(1);

        const nameIndex = headers.findIndex(h =>
          h && (h.includes('razao') || h.includes('razão') || h.includes('social') || h.includes('empresa') || h.includes('nome') || h === 'name' || h === 'company')
        );
        const cityIndex = headers.findIndex(h =>
          h && (h.includes('cidade') || h.includes('município') || h.includes('municipio') || h === 'city')
        );
        const stateIndex = headers.findIndex(h =>
          h && (h.includes('estado') || h.includes('uf') || h === 'state')
        );
        const categoryIndex = headers.findIndex(h =>
          h && (h.includes('categoria') || h.includes('segmento') || h === 'category')
        );
        const phoneIndex = headers.findIndex(h =>
          h && (h.includes('telefone') || h.includes('phone') || h.includes('celular'))
        );
        const addressIndex = headers.findIndex(h =>
          h && (h.includes('endereço') || h.includes('endereco') || h === 'address')
        );
        const websiteIndex = headers.findIndex(h =>
          h && (h.includes('website') || h.includes('site') || h === 'url')
        );

        console.log('Índices encontrados - Nome:', nameIndex, 'Cidade:', cityIndex);

        if (nameIndex === -1 || cityIndex === -1) {
          reject(new Error('Colunas obrigatórias não encontradas: Nome da Empresa e Cidade'));
          return;
        }

        const companies: CompanyInput[] = [];

        for (const row of rows) {
          if (!row || !Array.isArray(row)) continue;

          const companyName = (row[nameIndex] != null ? String(row[nameIndex]) : '').trim();
          const city = (row[cityIndex] != null ? String(row[cityIndex]) : '').trim();

          if (companyName && city) {
            companies.push({
              company_name: companyName,
              city,
              state: stateIndex !== -1 && row[stateIndex] != null ? String(row[stateIndex]).trim() : undefined,
              category: categoryIndex !== -1 && row[categoryIndex] != null ? String(row[categoryIndex]).trim() : undefined,
              phone: phoneIndex !== -1 && row[phoneIndex] != null ? String(row[phoneIndex]).trim() : undefined,
              address: addressIndex !== -1 && row[addressIndex] != null ? String(row[addressIndex]).trim() : undefined,
              website: websiteIndex !== -1 && row[websiteIndex] != null ? String(row[websiteIndex]).trim() : undefined,
            });
          }
        }

        console.log('Total de empresas extraídas:', companies.length);

        if (companies.length === 0) {
          reject(new Error('Nenhuma empresa válida encontrada na planilha'));
          return;
        }

        resolve(companies);
      } catch (err) {
        console.error('Erro ao processar Excel:', err);
        reject(err instanceof Error ? err : new Error('Erro ao processar planilha'));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
}

const detectDelimiter = (line: string): string => {
  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
};

const splitCSVLine = (line: string, delimiter: string = ','): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const hasHeader = (firstLine: string[]): boolean => {
  const normalized = firstLine.map(cell => cell.toLowerCase().trim());

  const hasNameHeader = normalized.some(cell =>
    cell.includes('razao') ||
    cell.includes('razão') ||
    cell.includes('social') ||
    cell.includes('empresa') ||
    cell.includes('nome') ||
    cell === 'name' ||
    cell === 'company' ||
    cell.includes('restaurante')
  );

  const hasCityHeader = normalized.some(cell =>
    cell.includes('cidade') ||
    cell.includes('município') ||
    cell.includes('municipio') ||
    cell === 'city' ||
    cell.includes('local')
  );

  return hasNameHeader || hasCityHeader;
};

export const parseCSV = (text: string): CompanyInput[] => {
  const allLines = text.split(/\r?\n/);
  console.log('Total de linhas brutas no arquivo:', allLines.length);

  const lines = allLines
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log('Linhas não vazias:', lines.length);

  if (lines.length === 0) {
    throw new Error('Arquivo vazio. Por favor, adicione dados à planilha.');
  }

  const delimiter = detectDelimiter(lines[0]);
  console.log('Delimitador detectado:', delimiter === ',' ? 'vírgula' : delimiter === ';' ? 'ponto-e-vírgula' : 'tab');

  const firstLineValues = splitCSVLine(lines[0], delimiter);
  const hasHeaderRow = hasHeader(firstLineValues);

  console.log('Primeira linha:', firstLineValues);
  console.log('Tem cabeçalho?', hasHeaderRow);

  let nameIndex = 0;
  let cityIndex = 1;
  let stateIndex = 2;
  let categoryIndex = -1;
  let phoneIndex = -1;
  let addressIndex = -1;
  let websiteIndex = -1;

  let startIndex = 0;

  if (hasHeaderRow) {
    startIndex = 1;
    const headers = firstLineValues.map(h =>
      h.trim().toLowerCase().replace(/^"|"$/g, '')
    );

    console.log('Cabeçalhos detectados:', headers);

    const foundNameIndex = headers.findIndex(h =>
      h.includes('razao') || h.includes('razão') || h.includes('social') || h.includes('empresa') || h.includes('nome') || h === 'name' || h === 'company' || h.includes('restaurante')
    );
    const foundCityIndex = headers.findIndex(h =>
      h.includes('cidade') || h.includes('município') || h.includes('municipio') || h === 'city' || h.includes('local')
    );
    const foundStateIndex = headers.findIndex(h =>
      h.includes('estado') || h === 'state' || h === 'uf'
    );
    const foundCategoryIndex = headers.findIndex(h =>
      h.includes('categoria') || h === 'category' || h.includes('tipo') || h.includes('segmento')
    );
    const foundPhoneIndex = headers.findIndex(h =>
      h.includes('telefone') || h.includes('phone') || h.includes('celular') || h.includes('fone')
    );
    const foundAddressIndex = headers.findIndex(h =>
      h.includes('endereço') || h.includes('endereco') || h.includes('address') || h.includes('rua')
    );
    const foundWebsiteIndex = headers.findIndex(h =>
      h.includes('site') || h.includes('website') || h.includes('url') || h.includes('web')
    );

    if (foundNameIndex !== -1) nameIndex = foundNameIndex;
    if (foundCityIndex !== -1) cityIndex = foundCityIndex;
    if (foundStateIndex !== -1) stateIndex = foundStateIndex;
    if (foundCategoryIndex !== -1) categoryIndex = foundCategoryIndex;
    if (foundPhoneIndex !== -1) phoneIndex = foundPhoneIndex;
    if (foundAddressIndex !== -1) addressIndex = foundAddressIndex;
    if (foundWebsiteIndex !== -1) websiteIndex = foundWebsiteIndex;
  }

  console.log(`Índices das colunas - Nome: ${nameIndex}, Cidade: ${cityIndex}, Estado: ${stateIndex}`);

  const companies: CompanyInput[] = [];
  let skippedLines = 0;

  for (let i = startIndex; i < lines.length; i++) {
    try {
      const values = splitCSVLine(lines[i], delimiter);

      if (values.length < 2) {
        if (i < startIndex + 3) {
          console.log(`Linha ${i + 1} tem menos de 2 colunas:`, values);
        }
        skippedLines++;
        continue;
      }

      const company_name = (values[nameIndex] || '').replace(/^"|"$/g, '').trim();
      const city = (values[cityIndex] || '').replace(/^"|"$/g, '').trim();

      if (!company_name || !city) {
        if (i < startIndex + 3) {
          console.log(`Linha ${i + 1} está vazia (nome ou cidade faltando):`, { company_name, city, values });
        }
        skippedLines++;
        continue;
      }

      companies.push({
        company_name,
        city,
        state: stateIndex !== -1 && values[stateIndex]
          ? values[stateIndex].replace(/^"|"$/g, '').trim()
          : undefined,
        category: categoryIndex !== -1 && values[categoryIndex]
          ? values[categoryIndex].replace(/^"|"$/g, '').trim()
          : undefined,
        phone: phoneIndex !== -1 && values[phoneIndex]
          ? values[phoneIndex].replace(/^"|"$/g, '').trim()
          : undefined,
        address: addressIndex !== -1 && values[addressIndex]
          ? values[addressIndex].replace(/^"|"$/g, '').trim()
          : undefined,
        website: websiteIndex !== -1 && values[websiteIndex]
          ? values[websiteIndex].replace(/^"|"$/g, '').trim()
          : undefined,
      });
    } catch (error) {
      console.warn(`Erro ao processar linha ${i + 1}, pulando...`, error);
      skippedLines++;
      continue;
    }
  }

  console.log(`Empresas válidas encontradas: ${companies.length}`);
  console.log(`Linhas puladas: ${skippedLines}`);

  if (companies.length === 0) {
    throw new Error('Nenhuma empresa válida encontrada. Verifique o formato do arquivo.');
  }

  return companies;
};

const generatePrioritizedImprovements = (rating: number, totalReviews: number, hasWebsite: boolean, hasPhotos: boolean) => {
  const improvements: Array<{ priority: number; text: string }> = [];

  if (totalReviews < 10) {
    improvements.push({ priority: 10, text: 'URGENTE: Solicitar avaliações de clientes (menos de 10 avaliações impacta muito no ranking)' });
  } else if (totalReviews < 20) {
    improvements.push({ priority: 8, text: 'Aumentar número de avaliações para pelo menos 20' });
  } else if (totalReviews < 50) {
    improvements.push({ priority: 5, text: 'Continuar solicitando avaliações de clientes satisfeitos' });
  }

  if (rating < 3.5) {
    improvements.push({ priority: 10, text: 'CRÍTICO: Melhorar qualidade do atendimento (nota muito baixa)' });
    improvements.push({ priority: 9, text: 'Responder TODAS as avaliações negativas com soluções concretas' });
  } else if (rating < 4.0) {
    improvements.push({ priority: 7, text: 'Melhorar qualidade do atendimento para atingir nota 4.0+' });
    improvements.push({ priority: 6, text: 'Responder avaliações negativas demonstrando atenção ao cliente' });
  } else if (rating < 4.5) {
    improvements.push({ priority: 4, text: 'Otimizar atendimento para alcançar nota superior a 4.5' });
  }

  if (!hasWebsite) {
    improvements.push({ priority: 6, text: 'Adicionar website ao perfil GMN (aumenta credibilidade)' });
  }

  if (!hasPhotos) {
    improvements.push({ priority: 8, text: 'Adicionar fotos de alta qualidade (fachada, interior, produtos/serviços)' });
  } else {
    improvements.push({ priority: 3, text: 'Atualizar fotos regularmente (recomendado mensalmente)' });
  }

  if (totalReviews > 5 && rating >= 4.0) {
    improvements.push({ priority: 5, text: 'Responder todas as avaliações (aumenta engajamento em até 30%)' });
  }

  improvements.push({ priority: 4, text: 'Postar atualizações semanais (ofertas, novidades, eventos)' });
  improvements.push({ priority: 3, text: 'Verificar e atualizar horário de funcionamento regularmente' });
  improvements.push({ priority: 2, text: 'Adicionar atributos do negócio (WiFi, estacionamento, acessibilidade, etc)' });
  improvements.push({ priority: 2, text: 'Incluir produtos/serviços com preços no perfil' });

  if (rating >= 4.5 && totalReviews >= 50) {
    improvements.push({ priority: 1, text: 'Manter excelência: perfil está bem otimizado, continue engajando' });
  }

  return improvements
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.text);
};

export const generateMockAnalysis = (company: CompanyInput) => {
  const hasProfile = Math.random() > 0.3;

  if (!hasProfile) {
    return {
      ...company,
      has_gmn_profile: false,
      gmn_name: null,
      address: null,
      phone: null,
      website: null,
      business_hours: null,
      rating: null,
      total_reviews: 0,
      review_keywords: null,
      improvement_points: [
        'URGENTE: Criar perfil no Google Meu Negócio (essencial para ser encontrado)',
        'Adicionar informações completas (endereço, telefone, horário, fotos)',
        'Solicitar avaliações dos primeiros clientes',
        'Publicar fotos de alta qualidade do estabelecimento',
        'Adicionar produtos/serviços oferecidos'
      ],
    };
  }

  const rating = Number((3.5 + Math.random() * 1.5).toFixed(2));
  const totalReviews = Math.floor(Math.random() * 150) + 5;
  const hasWebsite = Math.random() > 0.4;
  const hasPhotos = Math.random() > 0.3;

  const allKeywords = [
    'atendimento', 'qualidade', 'preço', 'localização', 'rapidez',
    'profissionalismo', 'recomendo', 'excelente', 'ótimo', 'bom',
    'variedade', 'produtos', 'serviços', 'ambiente', 'equipe'
  ];

  const keywords = allKeywords
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 3);

  const improvements = generatePrioritizedImprovements(rating, totalReviews, hasWebsite, hasPhotos);

  return {
    ...company,
    has_gmn_profile: true,
    gmn_name: company.company_name,
    address: `Rua Exemplo, 123 - Centro, ${company.city} - ${company.state || 'SP'}`,
    phone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
    website: hasWebsite ? `https://www.${company.company_name.toLowerCase().replace(/\s+/g, '')}.com.br` : null,
    business_hours: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00',
      saturday: '08:00-12:00',
    },
    rating,
    total_reviews: totalReviews,
    review_keywords: keywords,
    improvement_points: improvements,
  };
};
