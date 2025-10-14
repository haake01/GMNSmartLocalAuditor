# Guia de Uso - GMN SmartLocal Auditor PRO

## Início Rápido

### 1. Auditoria em Lote

#### Passo 1: Preparar Planilha

Crie uma planilha Excel ou CSV com as seguintes colunas:

```
Empresa | Cidade | Estado | Categoria | Telefone | Endereço | Site
```

**Exemplo:**
```
Pizzaria do João | São Paulo | SP | Restaurante | (11) 98765-4321 | Rua das Flores, 123 | www.pizzariadojoao.com.br
Padaria Central | São Paulo | SP | Padaria | (11) 91234-5678 | Av. Principal, 456 |
```

#### Passo 2: Upload da Planilha

1. Clique em "Auditoria em Lote"
2. Arraste ou selecione o arquivo
3. Aguarde o processamento

#### Passo 3: Acompanhar Progresso

O sistema exibirá:
- Progresso percentual
- Empresa sendo analisada
- Tempo decorrido
- Tempo estimado

#### Passo 4: Visualizar Resultados

Após conclusão:
- Empresas COM perfil GMN (em ordem alfabética)
- Empresas SEM perfil GMN (em ordem alfabética)
- Scores e métricas detalhadas
- Sugestões de melhoria

#### Passo 5: Exportar Relatórios

- **Excel**: Clique em "Exportar Excel" - formato profissional
- **PDF**: Clique em "Exportar PDF" - documento imprimível

---

### 2. Comparação Competitiva

#### Passo 1: Informar Empresa

Preencha:
- Nome da empresa
- Cidade
- Segmento (ex: Restaurantes, Clínicas)

#### Passo 2: Análise Automática

O sistema irá:
1. Buscar a empresa informada
2. Identificar o líder do segmento na cidade
3. Comparar 12 critérios lado a lado
4. Calcular gaps e oportunidades

#### Passo 3: Relatório Comparativo

Visualize:
- Score geral: Empresa vs Líder
- Gap por critério
- Prioridades de ação
- Sugestões específicas
- Estimativa de investimento

#### Passo 4: Baixar Relatório

- **Excel**: Tabela comparativa completa
- **PDF**: Apresentação executiva

---

### 3. Importação CNPJ (Receita Federal)

#### Formato do Arquivo

Arquivo CSV/TXT com separador `;`:

```
CNPJ;Razão Social;Nome Fantasia;Endereço;Cidade;Estado;CEP;Telefone;Email;Atividade;Situação
12.345.678/0001-90;EMPRESA LTDA;Nome Fantasia;Rua X, 123;São Paulo;SP;01234-567;11999999999;email@empresa.com;Comércio;Ativa
```

#### Importação

1. Clique em "Importar Base CNPJ"
2. Selecione arquivo da Receita Federal
3. Sistema valida CNPJs automaticamente
4. Exibe resumo: Total / Importados / Erros
5. Dados ficam disponíveis para auditoria

#### Validações

O sistema verifica:
- ✅ CNPJ válido (dígitos verificadores)
- ✅ Formato correto
- ✅ Situação cadastral
- ⚠️ Campos obrigatórios preenchidos

---

### 4. Análise Multiplataforma

#### Plataformas Verificadas

1. **Google Maps (GMN)**: Perfil completo
2. **Apple Maps**: Presença iOS
3. **Waze**: Localização ativa
4. **Uber**: Listagem de estabelecimentos
5. **99**: Presença no app
6. **TripAdvisor**: Perfil e reviews

#### Como Usar

1. Informar dados da empresa
2. Sistema faz verificação paralela
3. Recebe score por plataforma (0-100)
4. Identifica plataformas ausentes
5. Recebe recomendações priorizadas

#### Relatório

Contém:
- Score geral de presença
- Status por plataforma
- Verificação (sim/não)
- Detalhes específicos
- 5 ações prioritárias

---

## Funcionalidades Avançadas

### Histórico de Comparações

Acesse comparações anteriores:
1. Clique em "Histórico de Análises"
2. Visualize lista completa
3. Baixe relatórios passados
4. Compare evolução ao longo do tempo

### Sistema de Logs de Erro

Monitore problemas:
```javascript
// Abra o console do navegador (F12)
import { getErrorLogs } from './utils/errorLogger';

// Ver todos os logs
console.table(getErrorLogs());

// Exportar logs
import { exportErrorLogs } from './utils/errorLogger';
exportErrorLogs();
```

### Filtros e Busca

Na tela de resultados:
- Use filtros por status GMN
- Ordene por score
- Busque por nome de empresa
- Filtre por cidade/estado

---

## Interpretação de Scores

### Score Geral (0-100)

- **90-100**: Excelente - perfil otimizado
- **70-89**: Bom - pequenos ajustes necessários
- **50-69**: Regular - melhorias importantes
- **30-49**: Ruim - necessita otimização urgente
- **0-29**: Crítico - ausência de perfil ou graves problemas

### Critérios Individuais

Cada um dos 12 critérios possui:
- **Score**: 0-100 pontos
- **Status**: 🟢 Verde | 🟡 Amarelo | 🔴 Vermelho
- **Detalhes**: Análise específica
- **Ações**: Sugestões de melhoria

### Priorização

Foque em critérios:
1. **Alta prioridade** (🔴): Impacto imediato
2. **Média prioridade** (🟡): Melhorias relevantes
3. **Baixa prioridade** (🟢): Otimizações finas

---

## Dicas de Otimização GMN

### 1. Presença e Verificação
- Criar perfil GMN (grátis)
- Verificar por SMS/correio
- Manter dados atualizados

### 2. Consistência NAP
- Nome igual em todos canais
- Endereço padronizado
- Telefone sempre atualizado

### 3. Fotos e Vídeos
- Mínimo 10 fotos de qualidade
- Adicionar geotagging
- Atualizar mensalmente
- Incluir produtos/serviços

### 4. Postagens Recentes
- 2-3 posts por semana
- Novidades e promoções
- Eventos e horários especiais
- Responder comentários

### 5. Avaliações
- Incentivar clientes satisfeitos
- Responder TODAS avaliações
- Agradecer feedbacks positivos
- Resolver problemas de negativos
- Tempo resposta < 24h

### 6. SEO Local
- Palavras-chave na descrição
- Mencionar bairro/cidade
- Categorias específicas
- Links para site/redes

---

## Troubleshooting

### Upload Falha

**Problema**: Arquivo não é aceito
**Solução**:
- Verificar formato (Excel ou CSV)
- Máximo 50 MB
- Colunas no formato correto

### Análise Lenta

**Problema**: Processamento demorado
**Solução**:
- Normal para >20 empresas
- Sistema processa 10 por vez
- Não feche a janela

### PDF Não Gera

**Problema**: Erro ao exportar PDF
**Solução**:
- Verificar bloqueador de popups
- Permitir downloads automáticos
- Tentar novamente

### Dados Incorretos

**Problema**: Informações erradas no relatório
**Solução**:
- Verificar planilha original
- Refazer análise
- Reportar bug com exemplo

---

## Boas Práticas

### Frequência de Auditoria
- **Mensal**: Empresas em otimização
- **Trimestral**: Empresas estáveis
- **Anual**: Empresas consolidadas

### Tamanho de Lote
- **Ideal**: 10-30 empresas
- **Máximo**: 100 empresas
- **Crítico**: >100 (dividir)

### Armazenamento de Relatórios
- Exportar Excel de cada análise
- Salvar PDFs para apresentações
- Comparar evolução mensal

### Uso de IA
- Sugestões são orientativas
- Validar recomendações
- Adaptar ao contexto local
- Priorizar ações viáveis

---

## Casos de Uso

### 1. Agência de Marketing

**Objetivo**: Prospectar clientes
**Fluxo**:
1. Importar base CNPJ da região
2. Auditar em lote (100 empresas)
3. Filtrar score < 60
4. Gerar relatórios individuais
5. Apresentar oportunidades

### 2. Consultor GMN

**Objetivo**: Análise competitiva
**Fluxo**:
1. Cliente informa empresa
2. Fazer comparação com líder
3. Identificar gaps principais
4. Priorizar ações (Top 5)
5. Acompanhar evolução mensal

### 3. Gestor de Rede

**Objetivo**: Padronização de unidades
**Fluxo**:
1. Auditar todas unidades
2. Identificar piores scores
3. Criar plano de ação padrão
4. Reavaliar após 30 dias
5. Benchmark interno

---

## FAQ

**P: Quantas empresas posso analisar por vez?**
R: Recomendamos 10-50. Sistema suporta até 100.

**P: Quanto tempo demora uma análise?**
R: ~30 segundos por empresa. 10 empresas = ~5 minutos.

**P: Os dados ficam salvos?**
R: Sim, no Supabase. Acesse via Histórico.

**P: Posso exportar para outros formatos?**
R: Sim, Excel e PDF. Em breve: Word e PowerPoint.

**P: Como funciona a IA?**
R: OpenAI GPT-4o-mini analisa dados públicos e gera insights.

**P: É necessário ter perfil GMN?**
R: Não para auditar. Mas empresa auditada precisa ter.

**P: Funciona para qualquer segmento?**
R: Sim, otimizado para negócios locais.

---

## Suporte

- **Documentação**: `/docs`
- **Logs**: Console do navegador (F12)
- **Exportar erros**: Sistema de logging
- **Issues**: GitHub (se aplicável)
