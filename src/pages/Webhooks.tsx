import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { webhookService, WebhookEvent, WebhookLog } from '@/services/webhookService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

const WEBHOOK_EVENTS = [
  { value: 'payment.created', label: 'Pagamento Criado' },
  { value: 'payment.confirmed', label: 'Pagamento Confirmado' },
  { value: 'payment.failed', label: 'Pagamento Falhou' },
  { value: 'delivery.completed', label: 'Entrega Concluída' },
];

const Webhooks = () => {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    eventType: '',
    url: '',
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const webhooksList = await webhookService.listWebhooks(user.id);
      setWebhooks(webhooksList);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventType || !formData.url) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newWebhook = await webhookService.registerWebhook(
        user.id,
        formData.eventType,
        formData.url
      );

      if (newWebhook) {
        setWebhooks([...webhooks, newWebhook]);
        setFormData({ eventType: '', url: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    const success = await webhookService.deleteWebhook(webhookId);
    if (success) {
      setWebhooks(webhooks.filter((w) => w.id !== webhookId));
    }
  };

  const handleToggleWebhook = async (webhook: WebhookEvent) => {
    const updated = await webhookService.updateWebhook(webhook.id, {
      active: !webhook.active,
    });

    if (updated) {
      setWebhooks(
        webhooks.map((w) => (w.id === webhook.id ? updated : w))
      );
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    await webhookService.testWebhook(webhookId);
  };

  const handleViewLogs = async (webhook: WebhookEvent) => {
    setSelectedWebhook(webhook);
    const webhookLogs = await webhookService.listWebhookLogs(webhook.id);
    setLogs(webhookLogs);
    setShowLogs(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const getEventLabel = (eventType: string) => {
    return WEBHOOK_EVENTS.find((e) => e.value === eventType)?.label || eventType;
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">{statusCode}</span>
        </div>
      );
    } else if (statusCode >= 400) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">{statusCode}</span>
        </div>
      );
    }
    return <span>{statusCode}</span>;
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">Webhooks</h1>
              <p className="text-muted-foreground mt-2">
                Receba notificações em tempo real sobre eventos de pagamento
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Webhook
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registrar Novo Webhook</CardTitle>
              <CardDescription>
                Configure um webhook para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWebhook} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event">Evento</Label>
                    <Select value={formData.eventType} onValueChange={(value) =>
                      setFormData({ ...formData, eventType: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEBHOOK_EVENTS.map((event) => (
                          <SelectItem key={event.value} value={event.value}>
                            {event.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL do Webhook</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://seu-dominio.com/webhook"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Registrar Webhook</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Webhooks List */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Registrados</CardTitle>
            <CardDescription>
              {webhooks.length} webhook(s) configurado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum webhook registrado. Clique em "Novo Webhook" para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {getEventLabel(webhook.event_type)}
                          </h3>
                          <Badge variant={webhook.active ? 'default' : 'secondary'}>
                            {webhook.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
                          {webhook.url}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Secret:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {showSecret[webhook.id]
                            ? webhook.secret
                            : '•'.repeat(20)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowSecret({
                              ...showSecret,
                              [webhook.id]: !showSecret[webhook.id],
                            })
                          }
                        >
                          {showSecret[webhook.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(webhook.secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWebhook(webhook)}
                      >
                        {webhook.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestWebhook(webhook.id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLogs(webhook)}
                      >
                        Ver Logs
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Deletar Webhook?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O webhook será removido permanentemente.
                          </AlertDialogDescription>
                          <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs Modal */}
        {showLogs && selectedWebhook && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs de Webhook</CardTitle>
                  <CardDescription>
                    {getEventLabel(selectedWebhook.event_type)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowLogs(false)}
                >
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum log registrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{log.event_type}</TableCell>
                        <TableCell>{getStatusBadge(log.status_code)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.response}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Webhooks;
