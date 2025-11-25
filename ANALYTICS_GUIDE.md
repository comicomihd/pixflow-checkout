# 📊 Guia de Analytics - Pixflow Checkout

## 📋 Visão Geral

Sistema completo de analytics para rastrear conversões e métricas de desempenho.

---

## 🎯 Funcionalidades

### ✅ Implementado

- [x] Rastreamento de eventos
- [x] Rastreamento de conversões
- [x] Rastreamento de visualizações
- [x] Rastreamento de produtos
- [x] Rastreamento de carrinho
- [x] Rastreamento de checkout
- [x] Rastreamento de upsell/downsell
- [x] Rastreamento de presells
- [x] Rastreamento de erros
- [x] Rastreamento de formulários
- [x] Rastreamento de vídeos
- [x] Métricas de conversão
- [x] Métricas de sessão
- [x] Exportação de dados
- [x] Página de analytics

---

## 📁 Arquivos Criados

### Serviço (1 arquivo)
- ✅ `src/services/analyticsService.ts` - Serviço de analytics

### Página (1 arquivo)
- ✅ `src/pages/Analytics.tsx` - Página de analytics

### Rotas (1 atualização)
- ✅ `src/App.tsx` - Rota `/analytics` adicionada

---

## 🚀 Como Usar

### 1. Acessar Página de Analytics

```
URL: /analytics
Rota: Protegida (requer autenticação)
```

### 2. Rastrear Eventos

```typescript
import { analyticsService } from '@/services/analyticsService';

// Evento customizado
analyticsService.trackEvent('custom_event', {
  userId: '123',
  action: 'some-action'
}, 100, 'BRL');

// Visualização de página
analyticsService.trackPageView('/products');

// Clique
analyticsService.trackClick('buy-button');

// Visualização de produto
analyticsService.trackProductView('prod-123', 'Produto X', 99.90);

// Adição ao carrinho
analyticsService.trackAddToCart('prod-123', 'Produto X', 99.90, 1);

// Remoção do carrinho
analyticsService.trackRemoveFromCart('prod-123', 'Produto X', 99.90, 1);

// Início de checkout
analyticsService.trackCheckoutStart(99.90, 1);

// Compra
analyticsService.trackPurchase('order-123', 99.90, [
  { productId: 'prod-123', productName: 'Produto X', price: 99.90, quantity: 1 }
], 'pix');

// Upsell
analyticsService.trackUpsell('prod-456', 'Upsell Product', 49.90);

// Downsell
analyticsService.trackDownsell('prod-789', 'Downsell Product', 29.90);

// Presell
analyticsService.trackPresellView('presell-123', 'Presell Page');

// Erro
analyticsService.trackError('fetch_error', 'Failed to fetch data', {
  endpoint: '/api/products'
});

// Formulário
analyticsService.trackFormSubmit('contact_form', {
  name: 'João',
  email: 'joao@example.com'
});

// Vídeo
analyticsService.trackVideoPlay('video-123', 'Tutorial Video');
```

### 3. Definir ID do Usuário

```typescript
analyticsService.setUserId('user-123');
```

### 4. Consultar Métricas

```typescript
// Métricas de conversão
const conversions = analyticsService.getConversionMetrics();

// Métricas de sessão
const session = analyticsService.getSessionMetrics();

// Todos os eventos
const events = analyticsService.getEvents();

// Eventos de um tipo
const purchases = analyticsService.getEventsByType('purchase');

// Conversões
const allConversions = analyticsService.getConversions();
```

### 5. Exportar Dados

```typescript
// Exportar como JSON
const json = analyticsService.exportEvents();

// Exportar como CSV
const csv = analyticsService.exportEventsAsCSV();

// Download de arquivo
analyticsService.downloadEvents('json');
analyticsService.downloadEvents('csv');
```

---

## 📊 Estrutura de Evento

```typescript
interface AnalyticsEvent {
  id: string;                    // ID único
  timestamp: string;             // ISO 8601
  eventType: string;             // Tipo de evento
  eventName: string;             // Nome do evento
  userId?: string;               // ID do usuário
  sessionId: string;             // ID da sessão
  properties?: Record<string, any>; // Propriedades
  value?: number;                // Valor (para conversões)
  currency?: string;             // Moeda
}
```

---

## 📈 Métricas de Conversão

```typescript
interface ConversionMetrics {
  totalConversions: number;      // Total de conversões
  totalRevenue: number;          // Receita total
  averageOrderValue: number;     // Ticket médio
  conversionRate: number;        // Taxa de conversão (%)
  conversionsByType: Record<string, number>; // Por tipo
  revenueByType: Record<string, number>;     // Receita por tipo
  topProducts: Array<{           // Top 10 produtos
    name: string;
    count: number;
    revenue: number;
  }>;
  conversionsByPage: Record<string, number>; // Por página
}
```

---

## 📊 Métricas de Sessão

```typescript
interface SessionMetrics {
  sessionId: string;             // ID da sessão
  userId?: string;               // ID do usuário
  startTime: string;             // Hora de início
  endTime?: string;              // Hora de término
  duration: number;              // Duração (ms)
  pageViews: number;             // Páginas vistas
  events: number;                // Total de eventos
  conversions: number;           // Total de conversões
  revenue: number;               // Receita
  source?: string;               // Fonte (direct, google, etc)
  device?: string;               // Dispositivo (mobile, tablet, desktop)
}
```

---

## 🎯 Eventos Pré-configurados

### Eventos de Página

```typescript
// Visualização de página
analyticsService.trackPageView('/checkout');

// Clique em elemento
analyticsService.trackClick('submit-button');
```

### Eventos de Produto

```typescript
// Visualização de produto
analyticsService.trackProductView('prod-123', 'Produto X', 99.90);

// Adição ao carrinho
analyticsService.trackAddToCart('prod-123', 'Produto X', 99.90, 1);

// Remoção do carrinho
analyticsService.trackRemoveFromCart('prod-123', 'Produto X', 99.90, 1);
```

### Eventos de Checkout

```typescript
// Início de checkout
analyticsService.trackCheckoutStart(99.90, 1);

// Compra
analyticsService.trackPurchase('order-123', 99.90, items, 'pix');
```

### Eventos de Upsell/Downsell

```typescript
// Upsell
analyticsService.trackUpsell('prod-456', 'Upsell Product', 49.90);

// Downsell
analyticsService.trackDownsell('prod-789', 'Downsell Product', 29.90);
```

### Eventos de Presell

```typescript
// Visualização de presell
analyticsService.trackPresellView('presell-123', 'Presell Page');
```

### Eventos de Sistema

```typescript
// Erro
analyticsService.trackError('fetch_error', 'Failed to fetch', {
  endpoint: '/api/products'
});

// Formulário
analyticsService.trackFormSubmit('contact_form', {
  name: 'João',
  email: 'joao@example.com'
});

// Vídeo
analyticsService.trackVideoPlay('video-123', 'Tutorial Video');
```

---

## 📊 Página de Analytics

### Funcionalidades

1. **Métricas Principais**
   - Receita Total
   - Total de Conversões
   - Ticket Médio
   - Visualizações de Página

2. **Conversões**
   - Distribuição por tipo
   - Receita por tipo
   - Percentual de cada tipo

3. **Produtos**
   - Top 10 produtos
   - Vendas por produto
   - Receita por produto
   - Ticket médio por produto

4. **Sessão**
   - ID da sessão
   - Duração
   - Dispositivo
   - Fonte
   - Eventos rastreados
   - Páginas vistas
   - Conversões
   - Receita

---

## 🔧 Integração com Componentes

### Exemplo: Página de Produtos

```typescript
import { analyticsService } from '@/services/analyticsService';

const ProductPage = ({ product }) => {
  useEffect(() => {
    // Rastrear visualização
    analyticsService.trackProductView(
      product.id,
      product.name,
      product.price
    );
  }, [product]);

  const handleAddToCart = () => {
    analyticsService.trackAddToCart(
      product.id,
      product.name,
      product.price,
      quantity
    );
    // Adicionar ao carrinho...
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Adicionar ao Carrinho</button>
    </div>
  );
};
```

### Exemplo: Página de Checkout

```typescript
import { analyticsService } from '@/services/analyticsService';

const CheckoutPage = ({ cart }) => {
  useEffect(() => {
    // Rastrear início de checkout
    analyticsService.trackCheckoutStart(
      cart.total,
      cart.items.length
    );
  }, [cart]);

  const handlePurchase = async () => {
    const order = await createOrder(cart);
    
    // Rastrear compra
    analyticsService.trackPurchase(
      order.id,
      order.total,
      order.items,
      'pix'
    );
  };

  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={handlePurchase}>Finalizar Compra</button>
    </div>
  );
};
```

---

## 📊 Análise de Dados

### Consultar Conversões

```typescript
const metrics = analyticsService.getConversionMetrics();

console.log(`Total de conversões: ${metrics.totalConversions}`);
console.log(`Receita total: R$ ${metrics.totalRevenue}`);
console.log(`Ticket médio: R$ ${metrics.averageOrderValue}`);
console.log(`Taxa de conversão: ${metrics.conversionRate}%`);
```

### Consultar Sessão

```typescript
const session = analyticsService.getSessionMetrics();

console.log(`ID da sessão: ${session.sessionId}`);
console.log(`Duração: ${session.duration}ms`);
console.log(`Páginas vistas: ${session.pageViews}`);
console.log(`Conversões: ${session.conversions}`);
console.log(`Receita: R$ ${session.revenue}`);
```

---

## 🔍 Armazenamento

### localStorage

Os eventos são automaticamente salvos em localStorage:

```typescript
// Últimos 500 eventos são salvos
// Carregados ao iniciar a aplicação
```

### Limite de Eventos

Máximo de 5000 eventos em memória. Eventos mais antigos são removidos.

---

## 📤 Integração com Serviços Externos

### Google Analytics

```typescript
// Integrar com Google Analytics
import { analyticsService } from '@/services/analyticsService';

analyticsService.trackEvent('purchase', {
  orderId: 'order-123',
  value: 99.90,
  currency: 'BRL'
});

// Enviar para Google Analytics
gtag('event', 'purchase', {
  value: 99.90,
  currency: 'BRL'
});
```

### Mixpanel

```typescript
import { analyticsService } from '@/services/analyticsService';

analyticsService.trackEvent('purchase', {
  orderId: 'order-123',
  value: 99.90
});

// Enviar para Mixpanel
mixpanel.track('purchase', {
  orderId: 'order-123',
  value: 99.90
});
```

---

## 🎯 Boas Práticas

### 1. Rastrear Eventos Importantes

```typescript
// ✅ Bom
analyticsService.trackPurchase(orderId, total, items, method);

// ❌ Ruim
analyticsService.trackEvent('purchase');
```

### 2. Incluir Contexto

```typescript
// ✅ Bom
analyticsService.trackEvent('error', {
  errorType: 'network',
  endpoint: '/api/products',
  statusCode: 500
});

// ❌ Ruim
analyticsService.trackEvent('error');
```

### 3. Usar Valores Corretos

```typescript
// ✅ Bom
analyticsService.trackPurchase(orderId, 99.90, items, 'pix');

// ❌ Ruim
analyticsService.trackEvent('purchase', { value: '99.90' });
```

---

## 🚨 Tratamento de Erros

```typescript
try {
  analyticsService.trackPurchase(orderId, total, items, method);
} catch (error) {
  console.error('Erro ao rastrear compra:', error);
  // Continuar mesmo se analytics falhar
}
```

---

## 🎉 Próximas Melhorias

- [ ] Integração com Google Analytics
- [ ] Integração com Mixpanel
- [ ] Dashboard em tempo real
- [ ] Alertas de anomalias
- [ ] Segmentação de usuários
- [ ] Análise de coorte
- [ ] Funil de conversão
- [ ] Atribuição de canal

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Uso
