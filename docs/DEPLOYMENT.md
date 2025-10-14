# Guia de Deploy

## Pré-requisitos

- Node.js 18+
- Conta Vercel (ou similar)
- Conta Supabase
- OpenAI API Key

---

## 1. Configuração do Ambiente

### Variáveis de Ambiente

Crie arquivo `.env`:

```env
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Variáveis de Produção (Vercel)

Configure no painel da Vercel:
- `VITE_OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 2. Build Local

### Instalação de Dependências
```bash
npm install
```

### Validação de Tipos
```bash
npm run typecheck
```

### Build de Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

---

## 3. Deploy Vercel

### Via CLI

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Via GitHub

1. Conecte repositório ao Vercel
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### Configuração `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_OPENAI_API_KEY": "@openai-key",
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-key"
  }
}
```

---

## 4. Configuração Supabase

### Migrations

Execute as migrations na ordem:

```bash
# 1. Tabelas de análise
supabase migration up 20251005125435_create_gmn_analysis_tables.sql

# 2. Auditorias
supabase migration up 20251007022750_create_gmn_audits_table.sql

# 3. Comparações
supabase migration up 20251008001656_create_competitive_comparisons_table.sql
```

### Row Level Security (RLS)

Certifique-se de que RLS está ativo em todas as tabelas:

```sql
ALTER TABLE gmn_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON gmn_audits FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert"
ON gmn_audits FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

### Índices

Crie índices para performance:

```sql
CREATE INDEX idx_gmn_audits_city ON gmn_audits(city);
CREATE INDEX idx_gmn_audits_segment ON gmn_audits(segment);
CREATE INDEX idx_gmn_audits_created_at ON gmn_audits(created_at DESC);

CREATE INDEX idx_comparisons_company ON competitive_comparisons(company_name);
CREATE INDEX idx_comparisons_city_segment ON competitive_comparisons(city, segment);
```

---

## 5. Otimizações de Produção

### Build Otimizado

Vite já aplica otimizações automáticas:
- Tree shaking
- Code splitting
- Minificação
- Compressão

### Variáveis de Build

```json
{
  "build": {
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "supabase": ["@supabase/supabase-js"],
          "xlsx": ["xlsx"]
        }
      }
    }
  }
}
```

### Headers de Cache

Configure em `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 6. Monitoramento

### Vercel Analytics

Ative no painel:
- Web Vitals
- Real-time analytics
- Error tracking

### Supabase Logs

Monitore:
- Queries lentas
- Erros de conexão
- Rate limits

### Application Logs

Sistema de logging interno:

```typescript
import { getErrorLogs } from './utils/errorLogger';

setInterval(() => {
  const errors = getErrorLogs();
  if (errors.length > 100) {
    console.warn('Alto volume de erros detectado');
  }
}, 60000);
```

---

## 7. Rollback

### Vercel

Rollback via CLI:
```bash
vercel rollback [deployment-url]
```

Ou pelo painel: Deployments → Previous → Promote to Production

### Supabase

Rollback de migration:
```bash
supabase migration down
```

---

## 8. Testes Pré-Deploy

### Checklist

- [ ] `npm run typecheck` - sem erros
- [ ] `npm run lint` - sem erros críticos
- [ ] `npm run build` - build sucesso
- [ ] `npm run preview` - app funcional
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas
- [ ] RLS ativo
- [ ] Testes de integração

### Script de Validação

```bash
#!/bin/bash
echo "🔍 Validando build..."

npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Erro de tipos"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build falhou"
  exit 1
fi

echo "✅ Validação completa - pronto para deploy"
```

---

## 9. CI/CD com GitHub Actions

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Type check
        run: npm run typecheck

      - name: Build
        run: npm run build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 10. Troubleshooting

### Build Fails

**Erro**: "Cannot find module 'X'"
**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Erro**: "OpenAI API key not configured"
**Solução**: Verificar variáveis de ambiente no Vercel

**Erro**: "Supabase connection failed"
**Solução**:
1. Verificar URL e Key
2. Testar conexão manualmente
3. Verificar RLS policies

### Performance Issues

**Problema**: Build muito lento
**Solução**: Ativar cache no Vercel

**Problema**: App lento em produção
**Solução**:
1. Verificar bundle size
2. Implementar lazy loading
3. Otimizar queries Supabase

---

## 11. Manutenção

### Atualizações de Dependências

```bash
npm outdated
npm update
```

### Security Audit

```bash
npm audit
npm audit fix
```

### Backup Supabase

Configure backups automáticos:
- Daily backups (retenção 7 dias)
- Point-in-time recovery

---

## 12. Limites e Quotas

### Vercel Free Tier
- 100 GB bandwidth/mês
- 100 horas build/mês
- Serverless functions: 100 GB-Hrs

### Supabase Free Tier
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth

### OpenAI
- Rate limit: varia por tier
- Monitorar uso no dashboard

---

## Comandos Rápidos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy Vercel
vercel --prod

# Logs Vercel
vercel logs

# Status deploy
vercel inspect [url]
```

---

## Contato e Suporte

Em caso de problemas críticos:
1. Verificar logs de erro (`/logs`)
2. Exportar error logs
3. Verificar status Vercel/Supabase
4. Rollback se necessário
