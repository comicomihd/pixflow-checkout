# ✅ CHECKLIST DE DEPLOYMENT - PIX PAYMENT

## 📋 PRÉ-REQUISITOS

- [ ] Supabase project criado
- [ ] Credenciais Efí obtidas (Client ID, Client Secret)
- [ ] Certificado digital Efí em Base64
- [ ] Chave PIX real ou de teste
- [ ] Vercel account criado

---

## 🗄️ BANCO DE DADOS

### Supabase Setup

- [ ] Executar script `supabase/create-pix-payments-final.sql`
- [ ] Verificar tabela `pix_payments` no Table Editor
- [ ] Executar script `supabase/verify-setup.sql`
- [ ] Confirmar que INSERT/UPDATE funcionam

**Comando para verificar:**
```sql
SELECT COUNT(*) FROM public.pix_payments;
```

---

## 🔧 BACKEND

### Variáveis de Ambiente (Vercel)

- [ ] `VITE_SUPABASE_URL` = URL do seu projeto
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key
- [ ] `EFI_CLIENT_ID` = ID da Efí
- [ ] `EFI_CLIENT_SECRET` = Secret da Efí
- [ ] `EFI_PIX_KEY` = Chave PIX (UUID)
- [ ] `EFI_CERT_PEM_BASE64` = Certificado em Base64
- [ ] `EFI_KEY_PEM_BASE64` = Chave privada em Base64
- [ ] `EFI_ENV` = `production` ou `sandbox`

### API Route

- [ ] Arquivo `api/pix.ts` criado
- [ ] Imports corretos (axios, https, supabase)
- [ ] Função `getEfipayToken()` implementada
- [ ] Função `buildHttpsAgent()` implementada
- [ ] Validação de token Supabase
- [ ] Tratamento de erros completo

---

## 🎨 FRONTEND

### Checkout.tsx

- [ ] Import de `supabase.auth.getSession()`
- [ ] Chamada para `/api/pix` com token Bearer
- [ ] Validação de resposta da API
- [ ] Atualização de `pix_payments` com dados do PIX
- [ ] `setPixData()` com dados corretos
- [ ] Tratamento de erros com `toast.error()`

### Dependências

- [ ] `npm install axios @supabase/supabase-js @vercel/node`
- [ ] Verificar `package.json`

---

## 🧪 TESTES LOCAIS

### Teste 1: Banco de Dados

```bash
# No Supabase SQL Editor
SELECT * FROM public.pix_payments LIMIT 1;
```

**Esperado:** Sem erros, tabela acessível ✅

### Teste 2: Frontend Local

```bash
npm run dev
```

Acesse: `http://localhost:5173/c/homologacao-pix`

**Esperado:** Página carrega sem erros ✅

### Teste 3: Formulário

1. Preencha o formulário
2. Clique em "Gerar PIX"
3. Verifique console (F12)

**Esperado:**
- Pagamento criado no banco ✅
- API chamada com token ✅
- QR Code exibido ✅

### Teste 4: Banco de Dados Após Pagamento

```bash
# No Supabase SQL Editor
SELECT * FROM public.pix_payments ORDER BY created_at DESC LIMIT 1;
```

**Esperado:** Registro com `txid`, `pix_copy_paste`, `pix_qr_code` preenchidos ✅

---

## 🚀 DEPLOYMENT VERCEL

### Pré-Deploy

- [ ] Todos os testes locais passando
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Repositório sincronizado com GitHub

### Deploy

```bash
vercel deploy --prod
```

**Esperado:** Build sucesso, API disponível ✅

### Pós-Deploy

- [ ] Acessar URL de produção
- [ ] Testar fluxo completo
- [ ] Verificar logs no Vercel
- [ ] Confirmar PIX gerado na Efí

---

## 🔍 TROUBLESHOOTING

### ❌ Erro: "relation pix_payments does not exist"

**Solução:**
1. Executar `supabase/create-pix-payments-final.sql`
2. Aguardar 10 segundos
3. Refresh no Table Editor
4. Testar novamente

### ❌ Erro: "No token provided"

**Solução:**
1. Verificar se usuário está autenticado
2. Confirmar `supabase.auth.getSession()` retorna token
3. Verificar header `Authorization: Bearer <token>`

### ❌ Erro: "Efí did not return loc id"

**Solução:**
1. Verificar credenciais Efí
2. Confirmar certificado em Base64
3. Testar em sandbox primeiro (`EFI_ENV=sandbox`)
4. Verificar logs no Vercel

### ❌ Erro: "Invalid Supabase token"

**Solução:**
1. Verificar `SUPABASE_SERVICE_ROLE_KEY`
2. Confirmar que não é a chave anônima
3. Regenerar chave se necessário

---

## 📞 SUPORTE

- **Efí Docs:** https://dev.efipay.com.br
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## ✨ RESUMO FINAL

```
✅ Banco: pix_payments criada
✅ Backend: API segura com mTLS
✅ Frontend: Chamada correta para API
✅ Variáveis: Configuradas no Vercel
✅ Deploy: Pronto para produção
```

**Status:** 🟢 PRONTO PARA PRODUÇÃO

---

**Última atualização:** 24/11/2025
