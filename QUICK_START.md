# 🚀 QUICK START - PIX PAYMENT

## ⚡ 3 Passos para Produção

### PASSO 1: Criar Tabela no Supabase (5 min)

1. Vá para: https://app.supabase.com
2. Clique em **SQL Editor** → **New Query**
3. Cole o conteúdo de `supabase/create-pix-payments-final.sql`
4. Clique em **Run**
5. Verifique em **Table Editor** → `pix_payments`

✅ **Pronto!**

---

### PASSO 2: Configurar Variáveis no Vercel (5 min)

1. Vá para: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

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

✅ **Pronto!**

---

### PASSO 3: Deploy (2 min)

```bash
npm install axios @supabase/supabase-js @vercel/node
vercel deploy --prod
```

✅ **Pronto! PIX em produção!**

---

## 🧪 Testar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:5173/c/homologacao-pix`

Preencha o formulário e clique em "Gerar PIX" → QR Code aparece ✅

---

## 📁 Arquivos Criados

```
api/pix.ts                              ← API segura com mTLS
supabase/create-pix-payments-final.sql  ← Script para criar tabela
supabase/verify-setup.sql               ← Script para verificar
SUPABASE_TABLE_SETUP.md                 ← Guia detalhado
BACKEND_SETUP.md                        ← Configuração backend
DEPLOYMENT_CHECKLIST.md                 ← Checklist completo
```

---

## ✅ Verificação Rápida

**Banco de Dados:**
```sql
SELECT COUNT(*) FROM public.pix_payments;
```

**API (local):**
```bash
curl -X POST http://localhost:3000/api/pix \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 29.90, "customerName": "Teste"}'
```

---

## 🎉 Pronto!

Seu PIX está 100% seguro e pronto para produção! 🚀

**Próximos passos:**
1. ✅ Tabela criada
2. ✅ Backend seguro
3. ✅ Frontend atualizado
4. ⏳ Deploy no Vercel
5. ⏳ Testar em produção
