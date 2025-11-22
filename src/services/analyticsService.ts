/**
 * Serviço de Analytics
 * Rastreia eventos, conversões e métricas da aplicação
 */

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventName: string;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
  value?: number;
  currency?: string;
}

export interface ConversionMetrics {
  totalConversions: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  conversionsByType: Record<string, number>;
  revenueByType: Record<string, number>;
  topProducts: Array<{ name: string; count: number; revenue: number }>;
  conversionsByPage: Record<string, number>;
}

export interface SessionMetrics {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  pageViews: number;
  events: number;
  conversions: number;
  revenue: number;
  source?: string;
  device?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: number;
  private maxEvents = 5000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.loadFromLocalStorage();
    this.setupPageTracking();
  }

  /**
   * Rastrear evento customizado
   */
  trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    value?: number,
    currency?: string
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'custom',
      eventName,
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      value,
      currency,
    };

    this.addEvent(event);
  }

  /**
   * Rastrear visualização de página
   */
  trackPageView(pageName: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', {
      pageName,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
    });
  }

  /**
   * Rastrear clique
   */
  trackClick(elementName: string, properties?: Record<string, any>): void {
    this.trackEvent('click', {
      elementName,
      ...properties,
    });
  }

  /**
   * Rastrear visualização de produto
   */
  trackProductView(productId: string, productName: string, price: number): void {
    this.trackEvent('product_view', {
      productId,
      productName,
      price,
    });
  }

  /**
   * Rastrear adição ao carrinho
   */
  trackAddToCart(productId: string, productName: string, price: number, quantity: number): void {
    this.trackEvent('add_to_cart', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity,
    }, price * quantity);
  }

  /**
   * Rastrear remoção do carrinho
   */
  trackRemoveFromCart(productId: string, productName: string, price: number, quantity: number): void {
    this.trackEvent('remove_from_cart', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity,
    }, price * quantity);
  }

  /**
   * Rastrear início de checkout
   */
  trackCheckoutStart(cartValue: number, itemCount: number): void {
    this.trackEvent('checkout_start', {
      cartValue,
      itemCount,
    }, cartValue);
  }

  /**
   * Rastrear conversão de pagamento
   */
  trackPurchase(
    orderId: string,
    totalValue: number,
    items: Array<{ productId: string; productName: string; price: number; quantity: number }>,
    paymentMethod?: string
  ): void {
    this.trackEvent('purchase', {
      orderId,
      totalValue,
      itemCount: items.length,
      items,
      paymentMethod,
    }, totalValue, 'BRL');
  }

  /**
   * Rastrear upsell
   */
  trackUpsell(productId: string, productName: string, price: number): void {
    this.trackEvent('upsell', {
      productId,
      productName,
      price,
    }, price, 'BRL');
  }

  /**
   * Rastrear downsell
   */
  trackDownsell(productId: string, productName: string, price: number): void {
    this.trackEvent('downsell', {
      productId,
      productName,
      price,
    }, price, 'BRL');
  }

  /**
   * Rastrear presell
   */
  trackPresellView(presellId: string, presellName: string): void {
    this.trackEvent('presell_view', {
      presellId,
      presellName,
    });
  }

  /**
   * Rastrear erro
   */
  trackError(errorName: string, errorMessage: string, properties?: Record<string, any>): void {
    this.trackEvent('error', {
      errorName,
      errorMessage,
      ...properties,
    });
  }

  /**
   * Rastrear formulário
   */
  trackFormSubmit(formName: string, fields?: Record<string, any>): void {
    this.trackEvent('form_submit', {
      formName,
      fields,
    });
  }

  /**
   * Rastrear vídeo
   */
  trackVideoPlay(videoId: string, videoName: string): void {
    this.trackEvent('video_play', {
      videoId,
      videoName,
    });
  }

  /**
   * Definir ID do usuário
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Obter ID da sessão
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Obter todos os eventos
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Obter eventos filtrados
   */
  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.eventType === eventType);
  }

  /**
   * Obter eventos de conversão
   */
  getConversions(): AnalyticsEvent[] {
    return this.events.filter((e) =>
      ['purchase', 'upsell', 'downsell'].includes(e.eventName)
    );
  }

  /**
   * Obter métricas de conversão
   */
  getConversionMetrics(): ConversionMetrics {
    const conversions = this.getConversions();
    const metrics: ConversionMetrics = {
      totalConversions: conversions.length,
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      conversionsByType: {},
      revenueByType: {},
      topProducts: [],
      conversionsByPage: {},
    };

    // Calcular receita total
    for (const conversion of conversions) {
      if (conversion.value) {
        metrics.totalRevenue += conversion.value;
      }

      // Contar por tipo
      metrics.conversionsByType[conversion.eventName] =
        (metrics.conversionsByType[conversion.eventName] || 0) + 1;

      // Receita por tipo
      metrics.revenueByType[conversion.eventName] =
        (metrics.revenueByType[conversion.eventName] || 0) + (conversion.value || 0);

      // Página de conversão
      const page = conversion.properties?.pageName || 'unknown';
      metrics.conversionsByPage[page] =
        (metrics.conversionsByPage[page] || 0) + 1;
    }

    // Calcular AOV
    if (conversions.length > 0) {
      metrics.averageOrderValue = metrics.totalRevenue / conversions.length;
    }

    // Calcular taxa de conversão
    const pageViews = this.events.filter((e) => e.eventName === 'page_view').length;
    if (pageViews > 0) {
      metrics.conversionRate = (conversions.length / pageViews) * 100;
    }

    // Top produtos
    const productMap: Record<string, { count: number; revenue: number }> = {};
    for (const conversion of conversions) {
      const items = conversion.properties?.items || [];
      for (const item of items) {
        if (!productMap[item.productName]) {
          productMap[item.productName] = { count: 0, revenue: 0 };
        }
        productMap[item.productName].count += 1;
        productMap[item.productName].revenue += item.price * item.quantity;
      }
    }

    metrics.topProducts = Object.entries(productMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Obter métricas da sessão
   */
  getSessionMetrics(): SessionMetrics {
    const pageViews = this.events.filter((e) => e.eventName === 'page_view').length;
    const conversions = this.getConversions().length;
    const revenue = this.getConversions().reduce((sum, e) => sum + (e.value || 0), 0);

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date(this.sessionStartTime).toISOString(),
      duration: Date.now() - this.sessionStartTime,
      pageViews,
      events: this.events.length,
      conversions,
      revenue,
      source: this.getSessionSource(),
      device: this.getDeviceType(),
    };
  }

  /**
   * Exportar eventos como JSON
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Exportar eventos como CSV
   */
  exportEventsAsCSV(): string {
    if (this.events.length === 0) {
      return 'No events to export';
    }

    const headers = ['Timestamp', 'Event Type', 'Event Name', 'User ID', 'Session ID', 'Value', 'Currency', 'Properties'];
    const rows = this.events.map((event) => [
      event.timestamp,
      event.eventType,
      event.eventName,
      event.userId || '',
      event.sessionId,
      event.value || '',
      event.currency || '',
      JSON.stringify(event.properties || {}),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csv;
  }

  /**
   * Download de eventos
   */
  downloadEvents(format: 'json' | 'csv' = 'json'): void {
    const content = format === 'json' ? this.exportEvents() : this.exportEventsAsCSV();
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Limpar eventos
   */
  clearEvents(): void {
    this.events = [];
    this.saveToLocalStorage();
  }

  /**
   * Adicionar evento
   */
  private addEvent(event: AnalyticsEvent): void {
    this.events.push(event);

    // Manter apenas os últimos N eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Salvar em localStorage
    this.saveToLocalStorage();

    // Enviar para servidor
    this.sendToServer(event);
  }

  /**
   * Setup de rastreamento de página
   */
  private setupPageTracking(): void {
    // Rastrear visualização inicial
    this.trackPageView(window.location.pathname);

    // Rastrear mudanças de página (para SPA)
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });
  }

  /**
   * Obter fonte da sessão
   */
  private getSessionSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('instagram')) return 'instagram';
    return 'referral';
  }

  /**
   * Obter tipo de dispositivo
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  /**
   * Enviar para servidor
   */
  private sendToServer(event: AnalyticsEvent): void {
    // Implementar envio para servidor de analytics
    // Exemplo: Google Analytics, Mixpanel, etc.
    if (import.meta.env.DEV) {
      return; // Não enviar em desenvolvimento
    }

    // Aqui você pode enviar para seu servidor
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
  }

  /**
   * Salvar em localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const recentEvents = this.events.slice(-500); // Últimos 500 eventos
      localStorage.setItem('analyticsEvents', JSON.stringify(recentEvents));
    } catch (error) {
      // Ignorar erros de localStorage
    }
  }

  /**
   * Carregar de localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('analyticsEvents');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      // Ignorar erros de localStorage
    }
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gerar ID da sessão
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const analyticsService = new AnalyticsService();
