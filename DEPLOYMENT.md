# 🚀 Guia de Deploy - Pixflow Checkout

## Opções de Deploy

### 1. Netlify (Recomendado)

**Vantagens:**
- ✅ Fácil de usar
- ✅ Deploy automático via Git
- ✅ SSL/TLS grátis
- ✅ CDN global
- ✅ Suporte a funções serverless

**Passo a Passo:**

1. **Criar conta em Netlify**
   ```
   https://app.netlify.com
   ```

2. **Conectar repositório Git**
   - Clique em "New site from Git"
   - Selecione seu repositório
   - Autorize o acesso

3. **Configurar build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Adicionar variáveis de ambiente**
   - Vá em Settings → Environment
   - Adicione todas as variáveis do `.env.production`

5. **Deploy**
   ```
   git push origin main
   ```

### 2. Vercel

**Vantagens:**
- ✅ Otimizado para React
- ✅ Deploy instantâneo
- ✅ Preview automático
- ✅ Analytics integrado

**Passo a Passo:**

1. **Criar conta em Vercel**
   ```
   https://vercel.com
   ```

2. **Importar projeto**
   - Clique em "Import Project"
   - Selecione seu repositório

3. **Configurar variáveis**
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis

4. **Deploy**
   ```
   vercel --prod
   ```

### 3. Docker + AWS/GCP/Azure

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build e Push:**

```bash
# Build
docker build -t pixflow-checkout:latest .

# Push para Docker Hub
docker push seu-usuario/pixflow-checkout:latest

# Deploy em AWS
aws ecs create-service \
  --cluster pixflow \
  --service-name checkout \
  --task-definition pixflow-checkout:latest
```

### 4. GitHub Pages

**Vantagens:**
- ✅ Grátis
- ✅ Integrado com Git
- ✅ Sem configuração

**Passo a Passo:**

1. **Configurar repositório**
   ```
   Settings → Pages → Source: GitHub Actions
   ```

2. **Criar workflow**
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

---

## Configuração de Domínio

### 1. Registrar Domínio

- GoDaddy: https://www.godaddy.com
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google

### 2. Apontar para Netlify

**DNS Records:**

```
Type: CNAME
Name: www
Value: seu-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### 3. Configurar SSL/TLS

- ✅ Netlify: Automático
- ✅ Vercel: Automático
- ✅ AWS: Use ACM (AWS Certificate Manager)

---

## Variáveis de Ambiente em Produção

### Netlify

```bash
# Settings → Environment Variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RESEND_API_KEY=...
VITE_WEBHOOK_SECRET=...
VITE_ENVIRONMENT=production
VITE_API_URL=https://seu-dominio.com/api
```

### Vercel

```bash
# Settings → Environment Variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RESEND_API_KEY=...
VITE_WEBHOOK_SECRET=...
VITE_ENVIRONMENT=production
VITE_API_URL=https://seu-dominio.com/api
```

### Docker

```bash
# .env.production
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RESEND_API_KEY=...
VITE_WEBHOOK_SECRET=...
VITE_ENVIRONMENT=production
VITE_API_URL=https://seu-dominio.com/api
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Monitoramento Pós-Deploy

### 1. Verificar Status

```bash
# Netlify
netlify status

# Vercel
vercel status
```

### 2. Testar Funcionalidades

- [ ] Checkout funcionando
- [ ] Emails sendo enviados
- [ ] Webhooks disparando
- [ ] WhatsApp conectado
- [ ] CRM carregando
- [ ] Marketing funcionando

### 3. Monitorar Performance

- Google PageSpeed Insights
- WebPageTest
- Lighthouse

### 4. Monitorar Erros

- Sentry
- LogRocket
- Rollbar

---

## Rollback

### Se algo der errado:

**Netlify:**
```bash
# Voltar para deploy anterior
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Voltar para versão anterior
vercel rollback
```

**Git:**
```bash
# Reverter commit
git revert HEAD
git push origin main
```

---

## Checklist de Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados Supabase pronto
- [ ] Resend API Key validada
- [ ] Domínio apontando corretamente
- [ ] SSL/TLS ativado
- [ ] Build sem erros
- [ ] Testes passando
- [ ] Performance otimizada
- [ ] Monitoramento ativado
- [ ] Backup configurado
- [ ] Plano de rollback pronto

---

## Suporte

- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs
- AWS Docs: https://docs.aws.amazon.com
