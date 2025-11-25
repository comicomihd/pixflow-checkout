# 🚀 GUIA DE HOMOLOGAÇÃO - PIX com Efí

## ✅ Suas Credenciais de Homologação

```
Client ID: 562a05918babc1e248eff06496336cf9d8b3aa17
Client Secret: 59bb74aa66e8d5789be2f1cba794daef282e5504
Ambiente: SANDBOX (Homologação)
```

---

## 📋 PASSO A PASSO - HOMOLOGAÇÃO

### **PASSO 1: Adicionar Secrets no Supabase**

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** → **Secrets**
4. Clique em **New Secret** e adicione:

#### Secret 1:
```
Name: EFI_CLIENT_ID
Value: 562a05918babc1e248eff06496336cf9d8b3aa17
```

#### Secret 2:
```
Name: EFI_CLIENT_SECRET
Value: 59bb74aa66e8d5789be2f1cba794daef282e5504
```

#### Secret 3:
```
Name: EFI_SANDBOX
Value: true
```

#### Secret 4:
```
Name: TEST_MODE
Value: false
```

---

### **PASSO 2: Inserir Dados de Homologação**

1. Vá em **SQL Editor** no Supabase
2. Clique em **New Query**
3. Cole o conteúdo de: `supabase/homologacao-data.sql`
4. Clique em **Run**

Isso vai criar:
- ✅ Produto de Homologação (R$ 10.00)
- ✅ Order Bump (R$ 5.00)
- ✅ Checkout com slug: `homologacao-pix`

---

### **PASSO 3: Acessar o Checkout de Homologação**

Acesse no navegador:

```
http://localhost:8083/checkout/homologacao-pix
```

---

### **PASSO 4: Preencher Formulário**

Preencha com dados **reais e válidos**:

```
Nome: Seu Nome Completo
Email: seu-email@exemplo.com
Telefone: 11999999999 (com DDD)
CPF: 12345678901 (ou um CPF válido)
```

---

### **PASSO 5: Clicar em "Pagar com Pix"**

Você verá:
- ✅ QR Code gerado
- ✅ Código Pix para copiar
- ✅ Valor: R$ 10.00 (ou R$ 15.00 com bump)

---

### **PASSO 6: Fazer o Pagamento**

#### Opção 1: Escanear QR Code
1. Abra seu banco no celular
2. Escaneie o QR Code
3. Confirme o pagamento

#### Opção 2: Copiar Código Pix
1. Clique em "Copiar"
2. Abra seu banco
3. Cole o código
4. Confirme o pagamento

---

### **PASSO 7: Verificar Confirmação**

Após o pagamento:
- ✅ Email de confirmação deve ser enviado
- ✅ Página deve mostrar "Pagamento Confirmado"
- ✅ Entregáveis devem aparecer no email

---

## 🔍 **TROUBLESHOOTING**

### Erro: "Credenciais Efí não configuradas"

**Solução:**
1. Verifique se os Secrets foram adicionados no Supabase
2. Aguarde 2-3 minutos para os Secrets serem sincronizados
3. Recarregue a página (F5)

### Erro: "Falha ao gerar Pix"

**Solução:**
1. Verifique se Client ID e Secret estão corretos
2. Verifique se EFI_SANDBOX=true
3. Verifique a conexão com internet

### QR Code não aparece

**Solução:**
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Tente novamente

### Email não é enviado

**Solução:**
1. Verifique se Resend API Key está configurada
2. Verifique se o email está na whitelist do Resend
3. Verifique os logs de email

---

## 📊 **CHECKLIST DE HOMOLOGAÇÃO**

- [ ] Client ID adicionado no Supabase
- [ ] Client Secret adicionado no Supabase
- [ ] EFI_SANDBOX=true configurado
- [ ] TEST_MODE=false configurado
- [ ] Dados de homologação inseridos
- [ ] Checkout acessível em http://localhost:8083/checkout/homologacao-pix
- [ ] Formulário preenchido com dados válidos
- [ ] QR Code gerado com sucesso
- [ ] Código Pix copiado com sucesso
- [ ] Pagamento realizado no banco
- [ ] Email de confirmação recebido
- [ ] Entregáveis aparecem no email

---

## 🎯 **PRÓXIMOS PASSOS APÓS HOMOLOGAÇÃO**

Se tudo funcionar:

### 1. **Testar Múltiplos Pagamentos**
- Faça 5-10 pagamentos
- Verifique se todos são registrados
- Verifique se emails são enviados

### 2. **Testar Webhooks**
- Configure webhooks para receber notificações
- Verifique se os webhooks são disparados

### 3. **Testar Relatórios**
- Verifique CRM
- Verifique Marketing
- Verifique Relatórios

### 4. **Preparar para Produção**
- Obter certificado de produção
- Alterar EFI_SANDBOX=false
- Fazer deploy em produção

---

## 📞 **SUPORTE EFÍ**

Se tiver dúvidas sobre a Efí:

- **Site:** https://www.efipay.com.br
- **Documentação:** https://docs.efipay.com.br
- **Suporte:** https://suporte.efipay.com.br

---

## ✅ **HOMOLOGAÇÃO PRONTA!**

Siga os passos acima e sua homologação estará completa! 🚀

**Dúvidas? Me chame!** 💬
