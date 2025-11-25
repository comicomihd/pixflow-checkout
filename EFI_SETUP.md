# 🔐 Setup Efí - Credenciais PIX

## ✅ Credenciais que Você Tem:

```
Client ID: 562a05918babc1e248eff06496336cf9d8b3aa17
Client Secret: 59bb74aa66e8d5789be2f1cba794daef282e5504
```

---

## 🔑 Como Obter o Certificado

### Passo 1: Acessar Dashboard Efí

1. Acesse: https://dashboard.efipay.com.br
2. Faça login com suas credenciais

### Passo 2: Baixar Certificado

1. Vá em **Configurações** → **Certificado Digital**
2. Clique em **Baixar Certificado**
3. Escolha o formato **PEM** (se disponível)
4. Salve o arquivo

### Passo 3: Converter para Base64 (se necessário)

Se o certificado for `.p12` ou `.pfx`:

```bash
# Windows PowerShell
$cert = Get-Content "caminho/do/certificado.p12" -Encoding Byte
[Convert]::ToBase64String($cert) | Out-File "certificado_base64.txt"
```

Se for `.pem`:

```bash
# Terminal/PowerShell
certutil -encode certificado.pem certificado_base64.txt
```

### Passo 4: Copiar Conteúdo

Copie todo o conteúdo do arquivo Base64.

---

## 📝 Adicionar no Supabase

1. Vá em **Supabase Dashboard**
2. Selecione seu projeto
3. Vá em **Settings** → **Secrets**
4. Clique em **New Secret**

Adicione:

```
Name: EFI_CLIENT_ID
Value: 562a05918babc1e248eff06496336cf9d8b3aa17
```

```
Name: EFI_CLIENT_SECRET
Value: 59bb74aa66e8d5789be2f1cba794daef282e5504
```

```
Name: EFI_CERTIFICATE
Value: [COLE_O_CERTIFICADO_BASE64_AQUI]
```

```
Name: EFI_SANDBOX
Value: true
```

---

## 🧪 Modo Teste (Sandbox)

Para testar sem certificado real, use:

```
EFI_SANDBOX=true
```

Isso usa o ambiente de teste da Efí.

---

## ✅ Checklist

- [ ] Client ID adicionado
- [ ] Client Secret adicionado
- [ ] Certificado obtido e convertido
- [ ] Certificado adicionado no Supabase
- [ ] EFI_SANDBOX=true configurado

---

**Pronto! Seu PIX estará funcionando! 🚀**
