# Backend PIX Setup - Guia Completo

## 🚀 Arquitetura

```
Frontend (React/Vite)
    ↓ (POST /api/pix com token Supabase)
Backend (Vercel Functions / Node)
    ↓ (valida token, chama Efí com mTLS)
Efí API (PIX)
    ↓ (retorna QR Code)
Frontend (exibe QR Code)
```

---

## 📋 Pré-requisitos

### Variáveis de Ambiente (Backend - NUNCA no frontend)

Armazene estas variáveis no seu provedor:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
EFI_CLIENT_ID=f898e2129e9ce4304b2d8d6e65c6d40da37daf3f
EFI_CLIENT_SECRET=8c8bd2f09fead413606c529f75719a950e894e5b
EFI_PIX_KEY=239d2d04-6f08-47a7-9f94-bdb6d12c7e1f
EFI_CERT_PEM_BASE64=seu-certificado-em-base64
EFI_KEY_PEM_BASE64=sua-chave-privada-em-base64
EFI_ENV=production
```

---

## 🔧 Instalação de Dependências

```bash
npm install axios @supabase/supabase-js @vercel/node
```

---

## 📦 Deployment no Vercel

### 1. Conectar repositório

```bash
vercel link
```

### 2. Adicionar variáveis de ambiente

No dashboard do Vercel:
- Vá em **Settings** → **Environment Variables**
- Adicione todas as variáveis acima

### 3. Deploy

```bash
vercel deploy --prod
```

---

## 🔐 Segurança

✅ **Certificados:**
- Nunca commite `cert.pem` ou `key.pem`
- Armazene em Base64 no Secret Manager
- Use `https.Agent` com mTLS

✅ **Tokens:**
- Valide token Supabase no backend
- Cache token Efí em memória
- Expire cache após 50 minutos

✅ **Logs:**
- Logue erros da Efí (sem secrets)
- Monitore rate limits (429)

---

## 🧪 Teste Local

```bash
npm run dev
```

Acesse: `http://localhost:5173/c/homologacao-pix`

---

## 📞 Suporte

- **Efí Docs:** https://dev.efipay.com.br
- **Supabase Docs:** https://supabase.com/docs
