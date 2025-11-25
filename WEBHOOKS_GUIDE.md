# 🔔 Guia de Webhooks - Pixflow Checkout

## 📋 Visão Geral

Sistema completo de webhooks para notificações em tempo real de eventos de pagamento.

---

## 🎯 Funcionalidades

### ✅ Implementado

- [x] Registrar webhooks
- [x] Listar webhooks
- [x] Atualizar webhooks
- [x] Deletar webhooks
- [x] Testar webhooks
- [x] Validar assinatura
- [x] Registrar logs
- [x] Visualizar logs
- [x] Ativar/Desativar webhooks
- [x] Interface de gerenciamento

---

## 📁 Arquivos Criados

### Serviço (1 arquivo)
- ✅ `src/services/webhookService.ts` - Serviço de webhooks

### Página (1 arquivo)
- ✅ `src/pages/Webhooks.tsx` - Página de gerenciamento

### Rotas (1 atualização)
- ✅ `src/App.tsx` - Rota `/webhooks` adicionada

---

## 🚀 Como Usar

### 1. Acessar Página de Webhooks
```
URL: /webhooks
Rota: Protegida (requer autenticação)
```

### 2. Registrar Novo Webhook

```typescript
import { webhookService } from '@/services/webhookService';

const webhook = await webhookService.registerWebhook(
  userId,
  'payment.confirmed',
  'https://seu-dominio.com/webhook'
);
```

### 3. Disparar Evento de Webhook

```typescript
await webhookService.triggerWebhookEvent(
  userId,
  'payment.confirmed',
  {
    id: 'payment-123',
    amount: 100.0,
    status: 'paid',
    customer_email: 'cliente@example.com',
  }
);
```

### 4. Validar Assinatura

```typescript
const isValid = webhookService.validateSignature(
  payload,
  signature,
  secret
);
```

---

## 📊 Eventos Disponíveis

| Evento | Descrição | Quando Dispara |
|--------|-----------|----------------|
| `payment.created` | Pagamento criado | Novo pagamento registrado |
| `payment.confirmed` | Pagamento confirmado | Pagamento recebido |
| `payment.failed` | Pagamento falhou | Pagamento expirou/cancelado |
| `delivery.completed` | Entrega concluída | Arquivo entregue ao cliente |

---

## 🔐 Segurança

### Assinatura de Webhook

Cada webhook é assinado com HMAC-SHA256:

```
Signature = HMAC-SHA256(payload, secret)
```

**Headers enviados:**
- `X-Webhook-Signature` - Assinatura HMAC
- `X-Webhook-Timestamp` - Timestamp do evento

### Validação

```typescript
// Validar assinatura recebida
const signature = req.headers['x-webhook-signature'];
const isValid = webhookService.validateSignature(
  JSON.stringify(req.body),
  signature,
  webhook.secret
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## 📤 Payload do Webhook

### Estrutura

```json
{
  "event": "payment.confirmed",
  "timestamp": "2025-11-22T10:00:00Z",
  "data": {
    "id": "payment-123",
    "amount": 100.0,
    "status": "paid",
    "customer_email": "cliente@example.com",
    "checkout_id": "checkout-456"
  }
}
```

### Exemplo: payment.confirmed

```json
{
  "event": "payment.confirmed",
  "timestamp": "2025-11-22T10:00:00Z",
  "data": {
    "id": "payment-123",
    "checkout_id": "checkout-456",
    "customer_name": "João Silva",
    "customer_email": "joao@example.com",
    "amount": 99.90,
    "status": "paid",
    "pix_key": "abc123def456",
    "created_at": "2025-11-22T09:50:00Z",
    "paid_at": "2025-11-22T10:00:00Z"
  }
}
```

### Exemplo: delivery.completed

```json
{
  "event": "delivery.completed",
  "timestamp": "2025-11-22T11:00:00Z",
  "data": {
    "id": "delivery-789",
    "payment_id": "payment-123",
    "product_id": "product-456",
    "status": "delivered",
    "delivery_url": "deliveries/payment-123/arquivo.pdf",
    "created_at": "2025-11-22T09:50:00Z",
    "updated_at": "2025-11-22T11:00:00Z"
  }
}
```

---

## 🔧 Implementação no Seu Servidor

### Node.js / Express

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Seu secret do webhook
const WEBHOOK_SECRET = 'seu-secret-aqui';

app.post('/webhook', (req, res) => {
  // 1. Validar assinatura
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Processar evento
  const { event, data } = req.body;

  switch (event) {
    case 'payment.confirmed':
      console.log('Pagamento confirmado:', data);
      // Processar pagamento
      break;
    case 'delivery.completed':
      console.log('Entrega concluída:', data);
      // Processar entrega
      break;
  }

  // 3. Responder com sucesso
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Python / Flask

```python
from flask import Flask, request
import hmac
import hashlib
import json

app = Flask(__name__)
WEBHOOK_SECRET = 'seu-secret-aqui'

@app.route('/webhook', methods=['POST'])
def webhook():
    # 1. Validar assinatura
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()
    
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        return {'error': 'Invalid signature'}, 401
    
    # 2. Processar evento
    data = request.get_json()
    event = data.get('event')
    
    if event == 'payment.confirmed':
        print(f"Pagamento confirmado: {data['data']}")
        # Processar pagamento
    elif event == 'delivery.completed':
        print(f"Entrega concluída: {data['data']}")
        # Processar entrega
    
    # 3. Responder com sucesso
    return {'success': True}

if __name__ == '__main__':
    app.run(port=3000)
```

### PHP

```php
<?php

$WEBHOOK_SECRET = 'seu-secret-aqui';

// 1. Validar assinatura
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$payload = file_get_contents('php://input');

$expected_signature = hash_hmac('sha256', $payload, $WEBHOOK_SECRET);

if ($signature !== $expected_signature) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// 2. Processar evento
$data = json_decode($payload, true);
$event = $data['event'];

switch ($event) {
    case 'payment.confirmed':
        echo "Pagamento confirmado: " . json_encode($data['data']);
        // Processar pagamento
        break;
    case 'delivery.completed':
        echo "Entrega concluída: " . json_encode($data['data']);
        // Processar entrega
        break;
}

// 3. Responder com sucesso
http_response_code(200);
echo json_encode(['success' => true]);
?>
```

---

## 📊 Banco de Dados

### Tabela: webhooks

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_event_type ON webhooks(event_type);
```

### Tabela: webhook_logs

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  status_code INTEGER NOT NULL,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
```

---

## 🧪 Testando Webhooks

### 1. Usar Ferramentas Online

- [webhook.site](https://webhook.site) - Teste webhooks facilmente
- [RequestBin](https://requestbin.com) - Inspecione requisições HTTP
- [Postman](https://www.postman.com) - Teste APIs

### 2. Testar Localmente

```bash
# Usar ngrok para expor servidor local
ngrok http 3000

# Usar o URL gerado no webhook
# https://abc123.ngrok.io/webhook
```

### 3. Usar Página de Webhooks

1. Acesse `/webhooks`
2. Clique em "Novo Webhook"
3. Preencha URL e evento
4. Clique em "Testar"
5. Verifique logs

---

## 📈 Monitoramento

### Verificar Logs

```sql
SELECT 
  wl.id,
  wl.event_type,
  wl.status_code,
  wl.created_at,
  w.url
FROM webhook_logs wl
JOIN webhooks w ON wl.webhook_id = w.id
ORDER BY wl.created_at DESC
LIMIT 100;
```

### Verificar Webhooks Ativos

```sql
SELECT 
  id,
  event_type,
  url,
  active,
  created_at
FROM webhooks
WHERE active = true
ORDER BY created_at DESC;
```

### Contar Tentativas por Status

```sql
SELECT 
  status_code,
  COUNT(*) as count
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status_code;
```

---

## 🚨 Tratamento de Erros

### Retry Policy

Se o webhook retornar erro (status >= 400):

1. **Primeira tentativa:** Imediato
2. **Segunda tentativa:** 5 minutos depois
3. **Terceira tentativa:** 30 minutos depois
4. **Quarta tentativa:** 2 horas depois
5. **Quinta tentativa:** 24 horas depois

### Implementar Retry

```typescript
async function sendWebhookWithRetry(
  url: string,
  secret: string,
  payload: WebhookPayload,
  retries: number = 5
) {
  for (let i = 0; i < retries; i++) {
    const success = await webhookService.sendWebhook(url, secret, payload);
    
    if (success) {
      return true;
    }
    
    // Aguardar antes de tentar novamente
    const delay = Math.pow(2, i) * 60000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return false;
}
```

---

## 📞 Suporte

### Problemas Comuns

**Webhook não recebe eventos**
- Verifique se webhook está ativo
- Verifique URL é acessível
- Verifique logs para erros

**Assinatura inválida**
- Verifique se secret está correto
- Verifique se payload não foi modificado
- Verifique algoritmo HMAC

**Timeout**
- Webhook levando muito tempo para responder
- Aumente timeout ou processe assincronamente

---

## 🎉 Próximas Melhorias

- [ ] Implementar retry automático
- [ ] Adicionar rate limiting
- [ ] Suportar múltiplos eventos por webhook
- [ ] Adicionar filtros de eventos
- [ ] Implementar webhook signing com RSA
- [ ] Adicionar dashboard de estatísticas
- [ ] Suportar transformação de payload
- [ ] Integração com Slack/Discord

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Uso
