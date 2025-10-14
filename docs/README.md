# GMN SmartLocal Auditor PRO

## Visão Geral

O GMN SmartLocal Auditor PRO é uma plataforma completa para auditoria de presença digital de empresas locais, com foco em Google Meu Negócio (GMN) e presença multiplataforma.

## Funcionalidades Principais

### 1. Auditoria GMN Completa
- Análise de 12 critérios essenciais do Google Meu Negócio
- Score detalhado por critério
- Identificação de pontos de melhoria
- Comparativo com líderes do segmento

### 2. Importação de Dados da Receita Federal
- Suporte a arquivos CSV/TXT com dados CNPJ
- Validação automática de CNPJ
- Importação em lote com tratamento de erros
- Mapeamento automático para análise GMN

### 3. Verificação Multiplataforma
- **Google Maps**: Análise completa de perfil GMN
- **Apple Maps**: Verificação de presença e dados
- **Waze**: Checagem de localização
- **Uber**: Listagem de estabelecimentos
- **99**: Presença no app
- **TripAdvisor**: Perfil e avaliações

### 4. Relatórios Profissionais

#### Excel
- Layout horizontal (paisagem)
- Fonte Segoe UI 10pt
- Cabeçalho preto com texto branco
- Quebra de texto automática
- Filtros ativos em todas colunas
- Largura de colunas otimizada
- Truncamento de textos longos (>2000 chars)

#### PDF
- Geração via jsPDF e html2canvas
- Orientação paisagem
- Cabeçalho e rodapé profissionais
- Suporte a múltiplas páginas
- Exportação de análises completas

### 5. Sistema de Auto-Recuperação
- Retry automático (até 3 tentativas)
- Logging de erros em localStorage
- Recuperação offline sem consumo de tokens
- Exportação de logs para análise
- Categorização por tipo de erro

### 6. Armazenamento e Histórico
- Integração com Supabase
- Histórico completo de auditorias
- Comparativos salvos
- Recuperação de relatórios anteriores

## Arquitetura

```
/src
├── components/          # Componentes React
├── services/            # Lógica de negócio
│   ├── batchAudit.ts           # Auditoria em lote
│   ├── cnpjImport.ts           # Importação CNPJ
│   ├── platformPresence.ts     # Análise multiplataforma
│   ├── pdfExport.ts            # Exportação PDF
│   └── openai.ts               # Integração IA
├── utils/               # Utilitários
│   ├── excelExport.ts          # Exportação Excel
│   ├── errorLogger.ts          # Sistema de logs
│   └── spreadsheetParser.ts    # Parser de planilhas
└── lib/                 # Bibliotecas
    └── supabase.ts             # Cliente Supabase

/docs                    # Documentação
/logs                    # Logs de erro
/reports                 # Relatórios gerados
```

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase
- **IA**: OpenAI GPT-4o-mini
- **Excel**: SheetJS (xlsx)
- **PDF**: jsPDF + html2canvas
- **Ícones**: Lucide React

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_OPENAI_API_KEY=sua_chave_openai
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

## Uso

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testes de Tipo
```bash
npm run typecheck
```

## Fluxos Principais

### 1. Auditoria em Lote

1. Upload de planilha Excel/CSV
2. Parser automático de dados
3. Análise paralela com IA
4. Progresso em tempo real
5. Geração de relatório Excel
6. Opção de exportar PDF

### 2. Comparação Competitiva

1. Informar empresa alvo
2. Sistema busca líder do segmento
3. Análise comparativa detalhada
4. Sugestões de melhorias
5. Relatório com gaps identificados

### 3. Importação CNPJ

1. Upload de arquivo da Receita Federal
2. Validação de CNPJ
3. Parsing de dados estruturados
4. Importação para Supabase
5. Disponível para auditoria

### 4. Análise Multiplataforma

1. Informar dados da empresa
2. Verificação automática em 6 plataformas
3. Score por plataforma
4. Recomendações priorizadas
5. Exportação de relatório

## Sistema de Erro e Recuperação

### Tipos de Erro Tratados

- **PDF**: Problemas de renderização
- **Excel**: Dados muito grandes
- **Supabase**: Falhas de conexão
- **API**: Timeout ou rate limit
- **General**: Erros não categorizados

### Estratégias de Recuperação

1. **Retry Automático**: 3 tentativas com backoff
2. **Truncamento**: Textos >2000 chars
3. **Fallback**: Dados parciais em caso de falha
4. **Logging**: Todos erros registrados
5. **Offline**: Correções sem consumo de tokens

## Performance

- **Batch Processing**: 10 empresas por vez
- **Delay entre batches**: 2 segundos
- **Timeout API**: 15 segundos
- **Max Tokens por request**: 1500-2000
- **Retry delay**: 2-6 segundos (progressivo)

## Segurança

- Validação de CNPJ
- Sanitização de inputs
- Rate limiting em APIs
- Tratamento de dados sensíveis
- Row Level Security (RLS) no Supabase

## Suporte

Para questões técnicas ou bugs, consulte os logs em `/logs` ou exporte via sistema de logging.

## Roadmap

- [ ] Integração com mais plataformas (Booking, Airbnb)
- [ ] Dashboard analytics
- [ ] Alertas automáticos de oportunidades
- [ ] API pública
- [ ] Mobile app

## Licença

Proprietary - Todos os direitos reservados
