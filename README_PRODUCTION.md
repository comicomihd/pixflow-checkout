# 🚀 Pixflow Checkout - Pronto para Produção

Sistema completo de checkout, CRM, marketing e automação pronto para produção.

## ✨ Recursos Implementados

### 💳 Checkout
- ✅ Checkout responsivo
- ✅ Integração com Supabase
- ✅ Processamento de pagamentos
- ✅ Validação de dados
- ✅ Rate limiting

### 📊 CRM
- ✅ Gestão de clientes
- ✅ Histórico de compras
- ✅ Segmentação automática (VIP, Ativo, Novo)
- ✅ Tags e notas
- ✅ Busca e filtros

### 📧 Email
- ✅ Envio automático com Resend
- ✅ Emails com entregáveis
- ✅ Personalização com nome do cliente
- ✅ Link de suporte WhatsApp
- ✅ Logs de envio

### 📱 WhatsApp
- ✅ Integração WhatsApp Business API
- ✅ Envio de mensagens
- ✅ Templates personalizáveis
- ✅ Envio em massa
- ✅ Logs de mensagens

### 📧 Marketing
- ✅ Campanhas de email em massa
- ✅ Automações de follow-up
- ✅ Segmentação por cliente
- ✅ Relatórios avançados
- ✅ Exportação em CSV

### 📊 Pixels
- ✅ Facebook Pixel
- ✅ Google Analytics
- ✅ Google Ads
- ✅ TikTok Pixel
- ✅ Pixels customizados

### 🔗 Webhooks
- ✅ Sistema de webhooks
- ✅ HMAC SHA-256 signature
- ✅ Retry com exponential backoff
- ✅ Logs detalhados
- ✅ Integração com WhatsApp/Zapier

---

## 🔐 Segurança

- ✅ Autenticação com Supabase Auth
- ✅ Validação de entrada
- ✅ Rate limiting
- ✅ HMAC signature em webhooks
- ✅ Sanitização de strings
- ✅ HTTPS obrigatório
- ✅ Variáveis de ambiente seguras

---

## 🚀 Quick Start

### 1. Clonar Repositório

```bash
git clone seu-repositorio
cd pixflow-checkout
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
# Editar .env.local com suas chaves
```

### 4. Iniciar Desenvolvimento

```bash
npm run dev
```

### 5. Build para Produção

```bash
npm run build
npm run preview
```

---

## 📋 Variáveis de Ambiente

### Obrigatórias

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_RESEND_API_KEY=re_seu_token_aqui
VITE_WEBHOOK_SECRET=sua_chave_secreta
VITE_ENVIRONMENT=production
VITE_API_URL=https://seu-dominio.com/api
```

### Opcionais

```env
VITE_WHATSAPP_TOKEN=seu_token_aqui
VITE_WHATSAPP_PHONE_ID=seu_phone_id_aqui
VITE_FACEBOOK_PIXEL_ID=seu_pixel_id
VITE_GOOGLE_ANALYTICS_ID=seu_ga_id
```

---

## 📚 Documentação

- **[PRODUCTION.md](./PRODUCTION.md)** - Guia completo de produção
- **[SECURITY.md](./SECURITY.md)** - Guia de segurança
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guia de deploy

---

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **Email**: Resend
- **WhatsApp**: Meta Business API
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)

---

## 📊 Estrutura de Pastas

```
src/
├── pages/              # Páginas principais
│   ├── Checkout.tsx    # Página de checkout
│   ├── CRM.tsx         # Gestão de clientes
│   ├── Marketing.tsx   # Campanhas e automações
│   ├── EmailTester.tsx # Testador de emails
│   └── Dashboard.tsx   # Dashboard principal
├── components/         # Componentes reutilizáveis
│   ├── PixelTracker.tsx
│   └── CheckoutTimer.tsx
├── lib/                # Funções utilitárias
│   ├── resend-service.ts
│   ├── whatsapp-service.ts
│   ├── webhooks.ts
│   ├── email.ts
│   └── validators.ts
├── config/             # Configurações
│   └── production.ts
└── integrations/       # Integrações externas
    └── supabase/
```

---

## 🚀 Deploy

### Netlify (Recomendado)

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Vercel

```bash
vercel --prod
```

### Docker

```bash
docker build -t pixflow-checkout .
docker run -p 3000:3000 pixflow-checkout
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Lint
npm run lint
```

---

## 📊 Monitoramento

### Logs

- Email logs: `localStorage.getItem('email_logs')`
- Webhook logs: `localStorage.getItem('webhook_logs')`
- WhatsApp logs: `localStorage.getItem('whatsapp_logs')`

### Métricas

- Google Analytics integrado
- Pixels de rastreamento
- Relatórios em CRM

---

## 🆘 Troubleshooting

### Email não está sendo enviado

1. Verificar API Key do Resend
2. Verificar domínio configurado
3. Testar com `sendTestEmail()`

### WhatsApp não conecta

1. Verificar Token e Phone ID
2. Testar com `testWhatsAppConnection()`
3. Verificar se números estão em teste

### Webhooks não disparam

1. Verificar URL do webhook
2. Verificar se está HTTPS
3. Testar manualmente

---

## 📞 Suporte

- Email: support@pixflow.com
- WhatsApp: https://wa.link/2g3eh1
- Documentação: https://docs.pixflow.com

---

## 📄 Licença

MIT

---

## ✅ Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados Supabase pronto
- [ ] Resend API Key validada
- [ ] WhatsApp configurado (opcional)
- [ ] Domínio apontando corretamente
- [ ] SSL/TLS ativado
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Monitoramento ativado
- [ ] Backup configurado

---

**Pronto para produção! 🚀**
