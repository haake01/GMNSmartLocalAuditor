# API Documentation

## Serviços Principais

### 1. CNPJ Import Service

#### `parseCNPJFile(file: File): Promise<CNPJImportResult>`

Importa e valida dados de arquivo da Receita Federal.

**Parâmetros:**
- `file`: Arquivo CSV/TXT com dados CNPJ

**Retorno:**
```typescript
{
  total: number;
  imported: number;
  errors: string[];
  data: CNPJData[];
}
```

**Formato esperado do arquivo:**
```
CNPJ;Razão Social;Nome Fantasia;Endereço;Cidade;Estado;CEP;Telefone;Email;Atividade;Situação
12.345.678/0001-90;Empresa LTDA;Fantasia;Rua X;São Paulo;SP;01234-567;1199999999;email@empresa.com;Comércio;Ativa
```

**Exemplo:**
```typescript
const result = await parseCNPJFile(uploadedFile);
console.log(`${result.imported}/${result.total} empresas importadas`);
```

---

### 2. Batch Audit Service

#### `auditSingleCompany(company: CompanyInput): Promise<RealCompanyAudit>`

Audita uma única empresa.

**Parâmetros:**
```typescript
{
  company_name: string;
  city: string;
  state?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
}
```

**Retorno:**
```typescript
{
  company_name: string;
  has_gmn_profile: boolean;
  verification_status: string;
  nap_consistency_score: number;
  overall_score: number;
  improvement_points: string[];
  // ... 12 critérios completos
}
```

#### `auditCompaniesBatch(companies, onProgress, batchSize): Promise<RealCompanyAudit[]>`

Audita múltiplas empresas em paralelo.

**Parâmetros:**
- `companies`: Array de CompanyInput
- `onProgress`: Callback com progresso
- `batchSize`: Empresas por batch (padrão: 10)

**Exemplo:**
```typescript
const results = await auditCompaniesBatch(
  companies,
  (progress) => {
    console.log(`${progress.percentage}% - ${progress.currentCompany}`);
  },
  10
);
```

---

### 3. Platform Presence Service

#### `checkMultiPlatformPresence(...): Promise<MultiPlatformAnalysis>`

Verifica presença em 6 plataformas.

**Parâmetros:**
- `companyName`: Nome da empresa
- `city`: Cidade
- `state`: Estado
- `address`: Endereço completo
- `category`: Categoria/segmento

**Retorno:**
```typescript
{
  company_name: string;
  google_maps: PlatformPresenceCheck;
  apple_maps: PlatformPresenceCheck;
  waze: PlatformPresenceCheck;
  uber: PlatformPresenceCheck;
  ninety_nine: PlatformPresenceCheck;
  tripadvisor: PlatformPresenceCheck;
  overall_presence_score: number;
  missing_platforms: string[];
  recommendations: string[];
}
```

**Exemplo:**
```typescript
const analysis = await checkMultiPlatformPresence(
  'Pizzaria do João',
  'São Paulo',
  'SP',
  'Rua das Flores, 123',
  'Restaurante'
);

console.log(`Score geral: ${analysis.overall_presence_score}/100`);
console.log(`Faltam: ${analysis.missing_platforms.join(', ')}`);
```

---

### 4. PDF Export Service

#### `exportAuditsToPDF(audits, options): Promise<void>`

Exporta auditorias para PDF.

**Opções:**
```typescript
{
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
  title: string;
  subtitle?: string;
}
```

**Exemplo:**
```typescript
await exportAuditsToPDF(audits, {
  orientation: 'landscape',
  title: 'Auditoria GMN - Janeiro 2025',
  subtitle: 'Segmento: Restaurantes - Cidade: São Paulo'
});
```

#### `exportHTMLToPDF(elementId, filename, options): Promise<void>`

Converte elemento HTML para PDF.

**Exemplo:**
```typescript
await exportHTMLToPDF(
  'report-container',
  'relatorio_completo.pdf',
  { orientation: 'landscape' }
);
```

#### `exportPlatformAnalysisToPDF(analysis, options): Promise<void>`

Exporta análise multiplataforma para PDF.

---

### 5. Excel Export Service

#### `exportComprehensiveAuditToExcel(companies, segment, city): void`

Exporta auditoria completa para Excel com formatação profissional.

**Características:**
- Orientação paisagem
- Fonte Segoe UI 10pt
- Cabeçalho preto com texto branco
- Quebra de texto automática
- Filtros ativos
- Truncamento de textos longos

**Exemplo:**
```typescript
exportComprehensiveAuditToExcel(
  audits,
  'Restaurantes',
  'São Paulo'
);
```

---

### 6. Error Logger Service

#### `withAutoRecovery<T>(operation, type, context): Promise<T>`

Executa operação com retry automático.

**Exemplo:**
```typescript
const result = await withAutoRecovery(
  async () => await riskyOperation(),
  'api',
  { companyName: 'Empresa X' }
);
```

#### `logError(type, error, context): void`

Registra erro manualmente.

**Tipos:**
- `'pdf'`: Erros de geração PDF
- `'excel'`: Erros de Excel
- `'supabase'`: Erros de banco
- `'api'`: Erros de API externa
- `'general'`: Outros erros

**Exemplo:**
```typescript
try {
  await someOperation();
} catch (error) {
  logError('api', error, { endpoint: '/audit' });
}
```

#### `exportErrorLogs(): string`

Exporta logs para arquivo JSON.

#### `getErrorLogs(): ErrorLog[]`

Retorna todos os logs.

#### `getErrorLogsByType(type): ErrorLog[]`

Retorna logs filtrados por tipo.

#### `clearErrorLogs(): void`

Limpa todos os logs.

---

## Integração com Supabase

### Tabelas

#### `gmn_audits`
Armazena auditorias realizadas.

```sql
CREATE TABLE gmn_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id text NOT NULL,
  companies jsonb NOT NULL,
  segment text,
  city text,
  state text,
  created_at timestamptz DEFAULT now()
);
```

#### `competitive_comparisons`
Armazena comparações competitivas.

```sql
CREATE TABLE competitive_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  city text NOT NULL,
  segment text NOT NULL,
  comparison_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## Rate Limits e Performance

### OpenAI API
- **Rate limit**: 60 requests/minuto (tier 1)
- **Timeout**: 15 segundos
- **Retry**: 3 tentativas
- **Delay entre batches**: 2 segundos

### Supabase
- **Max connections**: 100
- **Timeout**: 30 segundos
- **Chunk size**: 1000 registros

### Recomendações
- Processar no máximo 50 empresas por vez
- Implementar filas para grandes volumes
- Monitorar logs de erro regularmente

---

## Exemplos Completos

### Fluxo Completo: Importação → Auditoria → Exportação

```typescript
import { parseCNPJFile } from './services/cnpjImport';
import { auditCompaniesBatch } from './services/batchAudit';
import { exportAuditsToPDF } from './services/pdfExport';
import { exportComprehensiveAuditToExcel } from './utils/excelExport';
import { withAutoRecovery } from './utils/errorLogger';

async function completeAuditFlow(file: File) {
  const cnpjResult = await withAutoRecovery(
    () => parseCNPJFile(file),
    'general',
    { step: 'cnpj_import' }
  );

  const companies = cnpjResult.data.map(c => ({
    company_name: c.razao_social,
    city: c.cidade,
    state: c.estado,
    phone: c.telefone,
    address: c.endereco,
    category: c.atividade_principal
  }));

  const audits = await withAutoRecovery(
    () => auditCompaniesBatch(companies, (p) => {
      console.log(`Progresso: ${p.percentage}%`);
    }),
    'api',
    { step: 'batch_audit' }
  );

  await withAutoRecovery(
    () => exportComprehensiveAuditToExcel(audits, 'Geral', 'São Paulo'),
    'excel',
    { step: 'excel_export' }
  );

  await withAutoRecovery(
    () => exportAuditsToPDF(audits, {
      orientation: 'landscape',
      title: 'Relatório Completo'
    }),
    'pdf',
    { step: 'pdf_export' }
  );

  console.log('Fluxo completo executado com sucesso!');
}
```

---

## Tratamento de Erros

Todos os serviços implementam tratamento de erros robusto:

```typescript
try {
  const result = await someService();
} catch (error) {
  if (error.message.includes('rate limit')) {
    await delay(60000);
    return await someService();
  }

  if (error.message.includes('timeout')) {
    return fallbackData;
  }

  logError('api', error);
  throw error;
}
```

---

## Debugging

### Ativar logs detalhados
```typescript
localStorage.setItem('DEBUG', 'true');
```

### Ver logs de erro
```typescript
import { getErrorLogs } from './utils/errorLogger';

console.table(getErrorLogs());
```

### Exportar logs
```typescript
import { exportErrorLogs } from './utils/errorLogger';

const filename = exportErrorLogs();
console.log(`Logs exportados: ${filename}`);
```
