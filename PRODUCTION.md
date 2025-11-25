# 🚀 Guia de Produção - Pixflow Checkout

## ✅ Checklist de Produção

### 1. Configuração de Ambiente

- [ ] Copiar `.env.example` para `.env.production`
- [ ] Preencher todas as variáveis de ambiente obrigatórias
- [ ] Validar que todas as chaves estão corretas
- [ ] Nunca commitar `.env.production` no Git

```bash
cp .env.example .env.production
```

### 2. Variáveis de Ambiente Obrigatórias

```env
# Supabase (Banco de Dados)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Resend (Email)
VITE_RESEND_API_KEY=re_seu_token_aqui

# Webhook
VITE_WEBHOOK_SECRET=sua_chave_secreta_aleatoria_de_32_caracteres

# Ambiente
VITE_ENVIRONMENT=production
VITE_API_URL=https://seu-dominio.com/api
```

### 3. Variáveis Opcionais

```env
# WhatsApp Business API
VITE_WHATSAPP_TOKEN=seu_token_aqui
VITE_WHATSAPP_PHONE_ID=seu_phone_id_aqui
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id

# Pixels
VITE_FACEBOOK_PIXEL_ID=seu_pixel_id
VITE_GOOGLE_ANALYTICS_ID=seu_ga_id
VITE_GOOGLE_ADS_ID=seu_ads_id
VITE_TIKTOK_PIXEL_ID=seu_tiktok_id
```

---

## 🔐 Segurança

### 1. Autenticação

- ✅ Supabase Auth implementado
- ✅ Proteção de rotas com ProtectedRoute
- ✅ Tokens JWT armazenados com segurança

### 2. Validação de Entrada

- ✅ Validação de email
- ✅ Validação de telefone
- ✅ Validação de CPF
- ✅ Validação de URL
- ✅ Sanitização de strings

### 3. Rate Limiting

- ✅ Máximo 5 tentativas de checkout por minuto
- ✅ Proteção contra força bruta
- ✅ Implementado em localStorage

### 4. Webhooks

- ✅ HMAC SHA-256 para assinatura
- ✅ Validação de URL
- ✅ Retry com exponential backoff
- ✅ Timeout de 10 segundos

### 5. CORS

Configure CORS no seu servidor:

```javascript
// Backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## 📊 Banco de Dados (Supabase)

### Tabelas Necessárias

```sql
-- Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_cpf TEXT,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  total_spent DECIMAL DEFAULT 0,
  purchase_count INT DEFAULT 0,
  status TEXT DEFAULT 'novo',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campanhas
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  target_segment TEXT,
  status TEXT DEFAULT 'draft',
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automações
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  delay_hours INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📧 Email (Resend)

### Configuração

1. Criar conta em https://resend.com
2. Obter API Key
3. Adicionar domínio customizado
4. Configurar SPF e DKIM

### Testes

```bash
# Testar envio de email
npm run test:email
```

---

## 💬 WhatsApp Business API

### Configuração

1. Criar conta em Meta Business
2. Configurar WhatsApp Business API
3. Obter Token e Phone ID
4. Adicionar números de teste

### Documentação

https://developers.facebook.com/docs/whatsapp/cloud-api

---

## 🚀 Deploy

### Opção 1: Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Opção 2: Vercel

```bash
# Deploy automático via Git
# Configurar variáveis de ambiente em Vercel Dashboard
```

### Opção 3: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📊 Monitoramento

### Logs

- ✅ Logs de email em localStorage
- ✅ Logs de webhooks em localStorage
- ✅ Logs de WhatsApp em localStorage

### Métricas

Integrar com:
- Google Analytics
- Sentry (error tracking)
- LogRocket (session replay)

---

## 🧪 Testes

### Testes Unitários

```bash
npm run test
```

### Testes E2E

```bash
npm run test:e2e
```

---

## 📋 Checklist Final

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados Supabase criado e testado
- [ ] Resend API Key validada
- [ ] WhatsApp configurado (opcional)
- [ ] Domínio customizado configurado
- [ ] SSL/TLS ativado
- [ ] CORS configurado
- [ ] Rate limiting testado
- [ ] Validações funcionando
- [ ] Emails sendo enviados
- [ ] Webhooks funcionando
- [ ] Backups configurados
- [ ] Monitoramento ativado
- [ ] Testes passando

---

## 🆘 Troubleshooting

### Email não está sendo enviado

1. Verificar API Key do Resend
2. Verificar domínio configurado
3. Verificar logs em localStorage
4. Testar com `sendTestEmail()`

### WhatsApp não conecta

1. Verificar Token
2. Verificar Phone ID
3. Testar com `testWhatsAppConnection()`
4. Verificar se números estão em teste

### Webhooks não disparam

1. Verificar URL do webhook
2. Verificar se está HTTPS
3. Verificar logs de webhook
4. Testar manualmente

---

## 📞 Suporte

Para dúvidas sobre produção:
- Documentação: https://docs.pixflow.com
- Email: support@pixflow.com
- WhatsApp: https://wa.link/2g3eh1
