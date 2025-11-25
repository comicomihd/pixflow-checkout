import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService, ConversionMetrics, SessionMetrics } from '@/services/analyticsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Trash2, TrendingUp, DollarSign, ShoppingCart, Eye } from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    const conversions = analyticsService.getConversionMetrics();
    const session = analyticsService.getSessionMetrics();
    setConversionMetrics(conversions);
    setSessionMetrics(session);
    setLoading(false);
  };

  const handleClearEvents = () => {
    if (confirm('Tem certeza que deseja limpar todos os eventos?')) {
      analyticsService.clearEvents();
      loadMetrics();
    }
  };

  const handleDownload = (format: 'json' | 'csv') => {
    analyticsService.downloadEvents(format);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe conversões e métricas de desempenho
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        {conversionMetrics && sessionMetrics && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(conversionMetrics.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversionMetrics.totalConversions} conversões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Conversões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionMetrics.totalConversions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa: {conversionMetrics.conversionRate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(conversionMetrics.averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por conversão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessionMetrics.pageViews}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Páginas vistas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="conversions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversions">Conversões</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="session">Sessão</TabsTrigger>
          </TabsList>

          {/* Conversions Tab */}
          <TabsContent value="conversions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conversões por Tipo</CardTitle>
                    <CardDescription>
                      Distribuição de conversões
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload('json')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClearEvents}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {conversionMetrics && Object.keys(conversionMetrics.conversionsByType).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma conversão registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {conversionMetrics &&
                      Object.entries(conversionMetrics.conversionsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium capitalize">{type}</p>
                            <p className="text-sm text-muted-foreground">
                              Receita: {formatCurrency(conversionMetrics.revenueByType[type] || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">{count}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {((count / conversionMetrics.totalConversions) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
                <CardDescription>
                  Produtos mais vendidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionMetrics && conversionMetrics.topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum produto vendido
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Vendas</TableHead>
                          <TableHead>Receita</TableHead>
                          <TableHead>Ticket Médio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversionMetrics &&
                          conversionMetrics.topProducts.map((product) => (
                            <TableRow key={product.name}>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>{product.count}</TableCell>
                              <TableCell>
                                {formatCurrency(product.revenue)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(product.revenue / product.count)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Tab */}
          <TabsContent value="session">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionMetrics && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">ID da Sessão</p>
                        <p className="font-mono text-sm break-all">
                          {sessionMetrics.sessionId}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Duração</p>
                        <p className="font-medium">
                          {formatDuration(sessionMetrics.duration)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Dispositivo</p>
                        <p className="font-medium capitalize">
                          {sessionMetrics.device}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Fonte</p>
                        <p className="font-medium capitalize">
                          {sessionMetrics.source}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionMetrics && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-muted rounded">
                        <span className="text-sm">Eventos Rastreados</span>
                        <Badge variant="default">{sessionMetrics.events}</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded">
                        <span className="text-sm">Páginas Vistas</span>
                        <Badge variant="default">{sessionMetrics.pageViews}</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded">
                        <span className="text-sm">Conversões</span>
                        <Badge variant="default">{sessionMetrics.conversions}</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded">
                        <span className="text-sm">Receita</span>
                        <Badge variant="default">
                          {formatCurrency(sessionMetrics.revenue)}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
