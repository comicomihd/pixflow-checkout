import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, ShoppingCart, XCircle, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface SaleEvent {
  id: string;
  type: "view" | "add_to_cart" | "purchase" | "upsell_accept" | "upsell_reject" | "downsell_accept" | "downsell_reject" | "order_bump_accept" | "order_bump_reject";
  customer_email: string;
  product_id?: string;
  product_name?: string;
  amount?: number;
  checkout_slug?: string;
  timestamp: string;
  user_agent?: string;
}

interface ProductStats {
  name: string;
  views: number;
  purchases: number;
  revenue: number;
  conversion_rate: number;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
}

const SalesAnalytics = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SaleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    loadEvents();
  }, [dateRange]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Carregar dados de vendas do Supabase
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Transformar dados de pagamentos em eventos
      const transformedEvents: SaleEvent[] = (payments || []).map((payment: any) => ({
        id: payment.id,
        type: "purchase",
        customer_email: payment.customer_email || "Desconhecido",
        product_id: payment.product_id,
        product_name: payment.product_name || "Produto",
        amount: payment.amount,
        checkout_slug: payment.checkout_slug,
        timestamp: payment.created_at,
      }));

      // Filtrar por data
      let filteredEvents = transformedEvents;
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        filteredEvents = transformedEvents.filter(
          (e) => new Date(e.timestamp) >= startDate
        );
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar dados de vendas");
    } finally {
      setLoading(false);
    }
  };

  const getProductStats = (): ProductStats[] => {
    const stats: Record<string, ProductStats> = {};

    events.forEach((event) => {
      const productName = event.product_name || "Desconhecido";

      if (!stats[productName]) {
        stats[productName] = {
          name: productName,
          views: 0,
          purchases: 0,
          revenue: 0,
          conversion_rate: 0,
        };
      }

      if (event.type === "view") stats[productName].views++;
      if (event.type === "purchase") {
        stats[productName].purchases++;
        stats[productName].revenue += event.amount || 0;
      }
    });

    // Calcular taxa de conversão
    Object.values(stats).forEach((stat) => {
      stat.conversion_rate = stat.views > 0 ? (stat.purchases / stat.views) * 100 : 0;
    });

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  };

  const getConversionFunnel = (): ConversionFunnel[] => {
    const views = events.filter((e) => e.type === "view").length;
    const addToCart = events.filter((e) => e.type === "add_to_cart").length;
    const purchases = events.filter((e) => e.type === "purchase").length;
    const upsellOffers = events.filter((e) => e.type === "upsell_accept" || e.type === "upsell_reject").length;

    const total = views || 1;

    return [
      { stage: "Visualizações", count: views, percentage: (views / total) * 100 },
      { stage: "Adicionado ao Carrinho", count: addToCart, percentage: (addToCart / total) * 100 },
      { stage: "Compras", count: purchases, percentage: (purchases / total) * 100 },
      { stage: "Ofertas Adicionais", count: upsellOffers, percentage: (upsellOffers / total) * 100 },
    ];
  };

  const getOfferStats = () => {
    const stats = {
      upsell_accept: 0,
      upsell_reject: 0,
      downsell_accept: 0,
      downsell_reject: 0,
      order_bump_accept: 0,
      order_bump_reject: 0,
    };

    events.forEach((event) => {
      if (event.type in stats) {
        stats[event.type as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const getTotalRevenue = () => {
    return events
      .filter((e) => e.type === "purchase")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const getTotalCustomers = () => {
    const emails = new Set(events.map((e) => e.customer_email));
    return emails.size;
  };

  const getCustomerBehavior = () => {
    const behavior: Record<string, any> = {};

    events.forEach((event) => {
      if (!behavior[event.customer_email]) {
        behavior[event.customer_email] = {
          email: event.customer_email,
          events: [],
          total_spent: 0,
          last_activity: event.timestamp,
        };
      }

      behavior[event.customer_email].events.push({
        type: event.type,
        product: event.product_name,
        timestamp: event.timestamp,
        amount: event.amount,
      });

      if (event.type === "purchase") {
        behavior[event.customer_email].total_spent += event.amount || 0;
      }

      if (new Date(event.timestamp) > new Date(behavior[event.customer_email].last_activity)) {
        behavior[event.customer_email].last_activity = event.timestamp;
      }
    });

    return Object.values(behavior).sort((a, b) => b.total_spent - a.total_spent);
  };

  const productStats = getProductStats();
  const conversionFunnel = getConversionFunnel();
  const offerStats = getOfferStats();
  const totalRevenue = getTotalRevenue();
  const totalCustomers = getTotalCustomers();
  const customerBehavior = getCustomerBehavior();

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      view: "Visualizou",
      add_to_cart: "Adicionou ao Carrinho",
      purchase: "Comprou",
      upsell_accept: "Aceitou Upsell",
      upsell_reject: "Recusou Upsell",
      downsell_accept: "Aceitou Downsell",
      downsell_reject: "Recusou Downsell",
      order_bump_accept: "Aceitou Order Bump",
      order_bump_reject: "Recusou Order Bump",
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      view: "bg-blue-100 text-blue-800",
      add_to_cart: "bg-yellow-100 text-yellow-800",
      purchase: "bg-green-100 text-green-800",
      upsell_accept: "bg-green-100 text-green-800",
      upsell_reject: "bg-red-100 text-red-800",
      downsell_accept: "bg-green-100 text-green-800",
      downsell_reject: "bg-red-100 text-red-800",
      order_bump_accept: "bg-green-100 text-green-800",
      order_bump_reject: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/sales")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Vendas
          </button>
          <h1 className="text-4xl font-bold">Analytics de Vendas</h1>
          <p className="text-muted-foreground mt-2">
            Análise completa do comportamento dos clientes e desempenho de vendas
          </p>
        </div>

        {/* Filtro de Data */}
        <div className="mb-6 flex gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              onClick={() => setDateRange(range)}
            >
              {range === "7d" ? "Últimos 7 dias" : range === "30d" ? "Últimos 30 dias" : range === "90d" ? "Últimos 90 dias" : "Todos"}
            </Button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {events.filter((e) => e.type === "purchase").length} vendas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {events.length} eventos rastreados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {events.filter((e) => e.type === "view").length > 0
                  ? ((events.filter((e) => e.type === "purchase").length / events.filter((e) => e.type === "view").length) * 100).toFixed(1)
                  : "0"}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Visualizações → Compras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {events.filter((e) => e.type === "purchase").length > 0 ? (totalRevenue / events.filter((e) => e.type === "purchase").length).toFixed(2) : "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por compra
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="funnel">Funil</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          {/* Produtos */}
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Produto</CardTitle>
                <CardDescription>
                  Visualizações, compras e receita por produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum dado de produto disponível
                    </p>
                  ) : (
                    productStats.map((product) => (
                      <div key={product.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{product.name}</h3>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {product.revenue.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Visualizações</p>
                            <p className="text-lg font-semibold">{product.views}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Compras</p>
                            <p className="text-lg font-semibold">{product.purchases}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa Conversão</p>
                            <p className="text-lg font-semibold">{product.conversion_rate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ticket Médio</p>
                            <p className="text-lg font-semibold">
                              R$ {product.purchases > 0 ? (product.revenue / product.purchases).toFixed(2) : "0"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full"
                            style={{
                              width: `${product.conversion_rate}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funil de Conversão */}
          <TabsContent value="funnel" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>
                  Jornada do cliente desde visualização até compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{stage.stage}</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.count} ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-8 overflow-hidden flex items-center">
                        <div
                          className="bg-blue-500 h-full flex items-center justify-center text-white text-sm font-semibold transition-all"
                          style={{
                            width: `${stage.percentage}%`,
                          }}
                        >
                          {stage.percentage > 10 && `${stage.percentage.toFixed(0)}%`}
                        </div>
                      </div>
                      {index < conversionFunnel.length - 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Queda: {(conversionFunnel[index].count - conversionFunnel[index + 1].count)} clientes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ofertas Adicionais */}
          <TabsContent value="offers" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upsells</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Aceitos</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{offerStats.upsell_accept}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>Recusados</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{offerStats.upsell_reject}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                    <p className="text-2xl font-bold">
                      {offerStats.upsell_accept + offerStats.upsell_reject > 0
                        ? ((offerStats.upsell_accept / (offerStats.upsell_accept + offerStats.upsell_reject)) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Downsells</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Aceitos</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{offerStats.downsell_accept}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>Recusados</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{offerStats.downsell_reject}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                    <p className="text-2xl font-bold">
                      {offerStats.downsell_accept + offerStats.downsell_reject > 0
                        ? ((offerStats.downsell_accept / (offerStats.downsell_accept + offerStats.downsell_reject)) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Bumps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Aceitos</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{offerStats.order_bump_accept}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>Recusados</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{offerStats.order_bump_reject}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                    <p className="text-2xl font-bold">
                      {offerStats.order_bump_accept + offerStats.order_bump_reject > 0
                        ? ((offerStats.order_bump_accept / (offerStats.order_bump_accept + offerStats.order_bump_reject)) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comportamento dos Clientes */}
          <TabsContent value="customers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comportamento dos Clientes</CardTitle>
                <CardDescription>
                  Análise detalhada do comportamento de cada cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerBehavior.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum dado de cliente disponível
                    </p>
                  ) : (
                    customerBehavior.map((customer) => (
                      <div key={customer.email} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{customer.email}</h3>
                            <p className="text-sm text-muted-foreground">
                              Última atividade: {new Date(customer.last_activity).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {customer.total_spent.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {customer.events.map((event: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                                {getEventTypeLabel(event.type)}
                              </span>
                              <span className="text-muted-foreground">{event.product}</span>
                              {event.amount && <span className="text-green-600 font-semibold">R$ {event.amount.toFixed(2)}</span>}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(event.timestamp).toLocaleDateString("pt-BR")} {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auditoria Completa */}
          <TabsContent value="audit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Auditoria Completa</CardTitle>
                <CardDescription>
                  Log detalhado de todos os eventos de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum evento registrado
                    </p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getEventTypeColor(event.type)}`}>
                          {getEventTypeLabel(event.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.customer_email}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.product_name || "Sem produto"} {event.amount && `• R$ ${event.amount.toFixed(2)}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleDateString("pt-BR")} {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesAnalytics;
