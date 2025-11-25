# 🔐 Guia de Segurança - Pixflow Checkout

## ✅ Implementações de Segurança

### 1. Autenticação e Autorização

- ✅ **Supabase Auth**: Autenticação segura com JWT
- ✅ **ProtectedRoute**: Rotas protegidas por autenticação
- ✅ **Session Management**: Gerenciamento de sessão automático
- ✅ **Logout**: Limpeza de tokens ao fazer logout

### 2. Validação de Entrada

- ✅ **Email Validation**: Validação de formato de email
- ✅ **Phone Validation**: Validação de telefone brasileiro
- ✅ **CPF Validation**: Validação de CPF com dígitos verificadores
- ✅ **URL Validation**: Validação de URLs
- ✅ **String Sanitization**: Sanitização contra XSS

### 3. Rate Limiting

- ✅ **Checkout Rate Limit**: Máximo 5 tentativas por minuto
- ✅ **API Rate Limit**: Implementado em localStorage
- ✅ **Proteção contra força bruta**: Bloqueio após limite

### 4. Criptografia

- ✅ **HMAC SHA-256**: Assinatura de webhooks
- ✅ **Web Crypto API**: Criptografia no navegador
- ✅ **HTTPS**: Obrigatório em produção

### 5. Webhooks

- ✅ **HMAC Signature**: Verificação de autenticidade
- ✅ **URL Validation**: Apenas URLs HTTPS
- ✅ **Timeout**: 10 segundos máximo
- ✅ **Retry Logic**: Retry com exponential backoff
- ✅ **Logging**: Todos os webhooks são registrados

### 6. Dados Sensíveis

- ✅ **Nunca em localStorage**: Senhas nunca em localStorage
- ✅ **Tokens JWT**: Armazenados com segurança
- ✅ **API Keys**: Apenas em variáveis de ambiente
- ✅ **CPF**: Armazenado com cuidado

---

## 🚨 Riscos e Mitigações

### Risco 1: Exposição de API Keys

**Risco**: API Keys expostas no código

**Mitigação**:
- ✅ Usar `.env` para variáveis sensíveis
- ✅ Nunca commitar `.env` no Git
- ✅ Usar `.env.example` como template
- ✅ Rotacionar chaves regularmente

### Risco 2: XSS (Cross-Site Scripting)

**Risco**: Injeção de scripts maliciosos

**Mitigação**:
- ✅ Sanitizar todas as strings
- ✅ Usar React (escapa por padrão)
- ✅ Validar entrada do usuário
- ✅ Content Security Policy (CSP)

### Risco 3: CSRF (Cross-Site Request Forgery)

**Risco**: Requisições não autorizadas

**Mitigação**:
- ✅ HMAC signature em webhooks
- ✅ Tokens CSRF em formulários
- ✅ SameSite cookies

### Risco 4: Força Bruta

**Risco**: Múltiplas tentativas de login

**Mitigação**:
- ✅ Rate limiting implementado
- ✅ Bloqueio após 5 tentativas
- ✅ Janela de 1 minuto

### Risco 5: Injeção SQL

**Risco**: Queries SQL maliciosas

**Mitigação**:
- ✅ Usar Supabase (prepared statements)
- ✅ Validar entrada
- ✅ Nunca concatenar queries

### Risco 6: Man-in-the-Middle

**Risco**: Interceptação de dados

**Mitigação**:
- ✅ HTTPS obrigatório
- ✅ SSL/TLS configurado
- ✅ HSTS headers

---

## 🔑 Gerenciamento de Chaves

### Resend API Key

```
Tipo: API Key
Escopo: Envio de emails
Rotação: A cada 90 dias
Backup: Armazenar em local seguro
```

### WhatsApp Token

```
Tipo: Bearer Token
Escopo: Envio de mensagens
Rotação: A cada 90 dias
Backup: Armazenar em local seguro
```

### Webhook Secret

```
Tipo: Chave secreta
Escopo: Assinatura de webhooks
Rotação: A cada 180 dias
Geração: openssl rand -hex 32
```

---

## 🛡️ Headers de Segurança

Configure no seu servidor:

```javascript
// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// X-Content-Type-Options
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// X-Frame-Options
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// X-XSS-Protection
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Strict-Transport-Security
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
```

---

## 🔍 Auditoria de Segurança

### Checklist Mensal

- [ ] Revisar logs de acesso
- [ ] Verificar tentativas de ataque
- [ ] Rotacionar chaves de API
- [ ] Atualizar dependências
- [ ] Verificar vulnerabilidades com `npm audit`
- [ ] Revisar permissões de usuários
- [ ] Testar rate limiting
- [ ] Verificar backups

### Checklist Trimestral

- [ ] Teste de penetração
- [ ] Auditoria de código
- [ ] Revisão de segurança
- [ ] Atualizar políticas
- [ ] Treinamento de segurança

---

## 📋 Compliance

### LGPD (Lei Geral de Proteção de Dados)

- ✅ Consentimento para coleta de dados
- ✅ Direito de acesso aos dados
- ✅ Direito de exclusão
- ✅ Política de privacidade
- ✅ Termos de serviço

### PCI DSS (Pagamentos)

- ✅ Nunca armazenar dados de cartão
- ✅ Usar processador de pagamento seguro
- ✅ Criptografia de dados
- ✅ Logs de transações

---

## 🚨 Resposta a Incidentes

### Passo 1: Detectar

- Monitorar logs
- Alertas de segurança
- Relatórios de usuários

### Passo 2: Conter

- Desativar acesso comprometido
- Rotacionar chaves
- Isolar sistemas afetados

### Passo 3: Investigar

- Revisar logs
- Identificar causa raiz
- Documentar incidente

### Passo 4: Recuperar

- Restaurar de backup
- Atualizar sistemas
- Comunicar com usuários

### Passo 5: Melhorar

- Implementar correções
- Atualizar políticas
- Treinar equipe

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades:

- Email: security@pixflow.com
- WhatsApp: https://wa.link/2g3eh1
- Não publicar vulnerabilidades publicamente

---

## 📚 Referências

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CWE Top 25: https://cwe.mitre.org/top25/
