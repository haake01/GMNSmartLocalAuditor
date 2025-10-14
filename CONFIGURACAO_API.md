# ⚠️ Configuração da Chave OpenAI API

## Problema Detectado

A chave da OpenAI API está **inválida ou expirada**. Você precisa configurar uma chave válida para usar as funcionalidades de IA do sistema.

---

## Solução: Como Obter e Configurar uma Nova Chave

### 1️⃣ Obter Nova Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Dê um nome para a chave (ex: "GMN Auditor")
5. Copie a chave gerada (começa com `sk-proj-...`)

⚠️ **IMPORTANTE**: A chave só é exibida uma vez! Copie imediatamente.

---

### 2️⃣ Configurar no Projeto

#### Opção A: Arquivo .env (Desenvolvimento Local)

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua a linha com a chave antiga:

```env
VITE_OPENAI_API_KEY=sua_nova_chave_aqui
```

**Exemplo:**
```env
VITE_OPENAI_API_KEY=sk-proj-ABC123xyz...
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://cknjwwnyukkonjnayqko.supabase.co
```

3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento:

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

#### Opção B: Vercel/Produção

Se o app está em produção na Vercel:

1. Acesse o painel da Vercel: https://vercel.com
2. Vá em **Settings** → **Environment Variables**
3. Encontre `VITE_OPENAI_API_KEY`
4. Clique em **Edit**
5. Cole a nova chave
6. Clique em **Save**
7. Faça um novo deploy ou aguarde o próximo

---

### 3️⃣ Verificar se Funcionou

1. Recarregue a página do aplicativo
2. Tente fazer uma comparação competitiva novamente
3. Se funcionar, você verá "Análise em Andamento" sem erros

---

## Custos e Limites

### Modelo Usado: GPT-4o-mini

- **Custo**: ~$0.00015 por análise
- **100 análises**: ~$0.015 (1,5 centavos de dólar)
- **1000 análises**: ~$0.15 (15 centavos de dólar)

### Limites por Tier

| Tier | Requisições/min | Tokens/min |
|------|----------------|------------|
| Free | 3 | 200,000 |
| Tier 1 | 60 | 2,000,000 |
| Tier 2 | 5,000 | 10,000,000 |

### Recomendações

- **Tier Free**: Máximo 3 empresas por minuto
- **Tier 1**: Até 50 empresas por lote
- **Tier 2+**: Sem restrições práticas

---

## Troubleshooting

### Erro: "Invalid API key"

**Causa**: Chave incorreta, expirada ou inválida

**Solução**:
1. Gerar nova chave no painel da OpenAI
2. Verificar se copiou a chave completa
3. Não incluir espaços antes/depois da chave
4. Reiniciar servidor após alterar `.env`

---

### Erro: "Rate limit exceeded"

**Causa**: Muitas requisições em curto período

**Solução**:
- Aguardar 60 segundos
- Reduzir tamanho do lote (processar menos empresas)
- Fazer upgrade do tier na OpenAI

---

### Erro: "Insufficient quota"

**Causa**: Créditos esgotados na conta OpenAI

**Solução**:
1. Acessar: https://platform.openai.com/account/billing
2. Adicionar método de pagamento
3. Configurar limite de gastos
4. Aguardar ativação (pode levar minutos)

---

### Erro: "Model not found"

**Causa**: Conta sem acesso ao modelo GPT-4o-mini

**Solução**:
- Verificar se conta está ativa
- Adicionar créditos (mínimo $5)
- Aguardar aprovação da conta

---

## Segurança

### ❌ NÃO FAÇA:

- Compartilhar a chave publicamente
- Fazer commit da chave no GitHub
- Usar a mesma chave em múltiplos projetos

### ✅ FAÇA:

- Manter chave apenas no `.env` (ignorado pelo git)
- Usar chaves diferentes para dev/prod
- Configurar limites de gasto na OpenAI
- Rotacionar chaves periodicamente

---

## Verificação Rápida

Execute no terminal:

```bash
# Ver se a variável está definida
echo $VITE_OPENAI_API_KEY

# Ver arquivo .env
cat .env | grep OPENAI
```

Deve mostrar algo como:
```
VITE_OPENAI_API_KEY=sk-proj-ABC123...
```

---

## Alternativas (Se não quiser usar OpenAI)

Atualmente o sistema usa apenas OpenAI, mas pode ser adaptado para:

- **Anthropic Claude**: API similar, menor custo
- **Google Gemini**: API gratuita (com limites)
- **Local Models**: Ollama (grátis, mas mais lento)

Para trocar o provedor, contacte o suporte técnico.

---

## Links Úteis

- **OpenAI Dashboard**: https://platform.openai.com
- **Pricing**: https://openai.com/pricing
- **API Docs**: https://platform.openai.com/docs
- **Status**: https://status.openai.com

---

## Suporte

Se ainda tiver problemas:

1. Verificar logs do navegador (F12 → Console)
2. Exportar error logs do sistema
3. Verificar status da OpenAI: https://status.openai.com
4. Criar issue no GitHub com detalhes do erro
