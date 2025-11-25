import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorLogger, ErrorLog, ErrorMetrics } from '@/services/errorLogger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Trash2, AlertCircle, AlertTriangle, Info, Bug } from 'lucide-react';

const ErrorLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterMinutes, setFilterMinutes] = useState<number>(60);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    let filteredLogs = errorLogger.getLogs();

    if (filterMinutes > 0) {
      filteredLogs = errorLogger.getRecentLogs(filterMinutes);
    }

    if (filterLevel !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.level === filterLevel);
    }

    setLogs(filteredLogs.reverse());
    setMetrics(errorLogger.getMetrics());
  };

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      errorLogger.clearLogs();
      loadLogs();
    }
  };

  const handleDownload = (format: 'json' | 'csv') => {
    errorLogger.downloadLogs(format);
  };

  const getLevelIcon = (level: string) => {
    const icons: Record<string, any> = {
      error: <AlertCircle className="h-4 w-4 text-red-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      info: <Info className="h-4 w-4 text-blue-600" />,
      debug: <Bug className="h-4 w-4 text-gray-600" />,
    };
    return icons[level] || icons.info;
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      error: 'destructive',
      warning: 'secondary',
      info: 'default',
      debug: 'outline',
    };
    return variants[level] || 'default';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Logs de Erro</h1>
            <p className="text-muted-foreground mt-2">
              Monitore e analise erros da aplicação
            </p>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalErrors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Erro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(metrics.errorsByType).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Páginas Afetadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(metrics.errorsByPage).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="analytics">Análise</TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Logs de Erro</CardTitle>
                    <CardDescription>
                      {logs.length} log(s) encontrado(s)
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
                      onClick={handleClearLogs}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Nível</label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="info">Informação</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium">Período</label>
                    <Select
                      value={filterMinutes.toString()}
                      onValueChange={(value) => setFilterMinutes(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Últimos 15 minutos</SelectItem>
                        <SelectItem value="60">Última hora</SelectItem>
                        <SelectItem value="240">Últimas 4 horas</SelectItem>
                        <SelectItem value="1440">Últimas 24 horas</SelectItem>
                        <SelectItem value="0">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={loadLogs} variant="outline">
                      Atualizar
                    </Button>
                  </div>
                </div>

                {/* Logs Table */}
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hora</TableHead>
                          <TableHead>Nível</TableHead>
                          <TableHead>Mensagem</TableHead>
                          <TableHead>Página</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getLevelIcon(log.level)}
                                <Badge variant={getLevelBadge(log.level)}>
                                  {log.level}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-sm">
                              {log.message}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                              {log.url?.split('/').pop() || '-'}
                            </TableCell>
                            <TableCell>
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:underline">
                                  Detalhes
                                </summary>
                                <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                                  {log.stack && (
                                    <div>
                                      <strong>Stack:</strong>
                                      <pre className="whitespace-pre-wrap break-words text-xs mt-1">
                                        {log.stack}
                                      </pre>
                                    </div>
                                  )}
                                  {log.context && (
                                    <div>
                                      <strong>Contexto:</strong>
                                      <pre className="whitespace-pre-wrap break-words text-xs mt-1">
                                        {JSON.stringify(log.context, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </details>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Erros por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle>Erros por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics && Object.keys(metrics.errorsByType).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum erro registrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {metrics &&
                        Object.entries(metrics.errorsByType).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm">{type}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Erros por Página */}
              <Card>
                <CardHeader>
                  <CardTitle>Erros por Página</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics && Object.keys(metrics.errorsByPage).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum erro registrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {metrics &&
                        Object.entries(metrics.errorsByPage)
                          .sort(([, a], [, b]) => b - a)
                          .map(([page, count]) => (
                            <div key={page} className="flex justify-between items-center">
                              <span className="text-sm truncate">
                                {page.split('/').pop() || page}
                              </span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                    </div>
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

export default ErrorLogs;
