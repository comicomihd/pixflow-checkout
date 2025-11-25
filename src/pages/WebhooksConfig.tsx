import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ArrowLeft, Copy, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { getWebhookLogs } from "@/lib/webhooks";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  headers?: Record<string, string>;
  created_at: string;
}

const WebhooksConfig = () => {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
    active: true,
    headers: {} as Record<string, string>,
  });

  const availableEvents = [
    { id: "payment.created", label: "Pagamento Criado", description: "Quando um novo pagamento é iniciado" },
    { id: "payment.completed", label: "Pagamento Completado", description: "Quando o pagamento é confirmado" },
    { id: "payment.failed", label: "Pagamento Falhou", description: "Quando o pagamento falha" },
    { id: "order.created", label: "Pedido Criado", description: "Quando um novo pedido é criado" },
    { id: "order.shipped", label: "Pedido Enviado", description: "Quando o pedido é enviado" },
    { id: "customer.created", label: "Cliente Criado", description: "Quando um novo cliente se registra" },
    { id: "upsell.accepted", label: "Upsell Aceito", description: "Quando cliente aceita upsell" },
    { id: "upsell.rejected", label: "Upsell Recusado", description: "Quando cliente recusa upsell" },
    { id: "downsell.accepted", label: "Downsell Aceito", description: "Quando cliente aceita downsell" },
    { id: "downsell.rejected", label: "Downsell Recusado", description: "Quando cliente recusa downsell" },
    { id: "order_bump.accepted", label: "Order Bump Aceito", description: "Quando cliente aceita order bump" },
    { id: "order_bump.rejected", label: "Order Bump Recusado", description: "Quando cliente recusa order bump" },
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("webhooks");
      if (saved) {
        setWebhooks(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erro ao carregar webhooks:", error);
      toast.error("Erro ao carregar webhooks");
    } finally {
      setLoading(false);
    }
  };

  const saveWebhooks = (data: Webhook[]) => {
    localStorage.setItem("webhooks", JSON.stringify(data));
    setWebhooks(data);
  };

  const handleOpenDialog = (webhook?: Webhook) => {
    if (webhook) {
      setEditingId(webhook.id);
      setFormData({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        headers: webhook.headers || {},
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        url: "",
        events: [],
        active: true,
        headers: {},
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      const updated = webhooks.map((w) =>
        w.id === editingId
          ? {
              ...w,
              name: formData.name,
              url: formData.url,
              events: formData.events,
              active: formData.active,
              headers: formData.headers,
            }
          : w
      );
      saveWebhooks(updated);
      toast.success("Webhook atualizado com sucesso!");
    } else {
      const newWebhook: Webhook = {
        id: `webhook-${Date.now()}`,
        name: formData.name,
        url: formData.url,
        events: formData.events,
        active: formData.active,
        headers: formData.headers,
        created_at: new Date().toISOString(),
      };
      saveWebhooks([...webhooks, newWebhook]);
      toast.success("Webhook criado com sucesso!");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este webhook?")) return;
    saveWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success("Webhook deletado com sucesso!");
  };

  const toggleActive = (id: string) => {
    const updated = webhooks.map((w) =>
      w.id === id ? { ...w, active: !w.active } : w
    );
    saveWebhooks(updated);
  };

  const copyWebhookUrl = (webhook: Webhook) => {
    const webhookUrl = `${window.location.origin}/api/webhooks/${webhook.id}`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL do webhook copiada!");
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-2">
            Configure webhooks para integrar com WhatsApp, Zapier, Make e outros aplicativos
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="webhooks">Meus Webhooks</TabsTrigger>
            <TabsTrigger value="logs">📋 Logs</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>

          {/* Meus Webhooks */}
          <TabsContent value="webhooks" className="mt-6 space-y-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Webhook" : "Novo Webhook"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure um webhook para receber eventos em tempo real
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Webhook *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: WhatsApp Bot, Zapier Integration"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="url">URL do Webhook *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://seu-servidor.com/webhook"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL onde você receberá os eventos POST
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Eventos *</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availableEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={event.id}
                            checked={formData.events.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  events: [...formData.events, event.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  events: formData.events.filter((ev) => ev !== event.id),
                                });
                              }
                            }}
                            className="mt-1"
                          />
                          <label htmlFor={event.id} className="flex-1 cursor-pointer">
                            <p className="font-semibold text-sm">{event.label}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Headers Customizados (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(formData.headers, null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({
                            ...formData,
                            headers: JSON.parse(e.target.value),
                          });
                        } catch {
                          // Ignorar erros de parse enquanto o usuário digita
                        }
                      }}
                      placeholder='{"Authorization": "Bearer token123"}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Headers adicionais para enviar com cada requisição
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-semibold">Ativo</Label>
                      <p className="text-sm text-muted-foreground">Receber eventos neste webhook</p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, active: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSave}>
                    {editingId ? "Salvar Alterações" : "Criar Webhook"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {webhooks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum webhook configurado. Clique em "Novo Webhook" para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg">{webhook.name}</CardTitle>
                            <CardDescription className="font-mono text-xs mt-1">
                              {webhook.url}
                            </CardDescription>
                          </div>
                          {webhook.active ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyWebhookUrl(webhook)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(webhook)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Eventos:</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">Status:</p>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={() => toggleActive(webhook.id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {webhook.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Webhooks</CardTitle>
                <CardDescription>
                  Histórico de tentativas de envio de webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getWebhookLogs().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum log de webhook registrado ainda
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Webhook</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tentativa</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Data/Hora</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getWebhookLogs()
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 50)
                            .map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-mono text-xs">
                                  {webhooks.find((w) => w.id === log.webhook_id)?.name || log.webhook_id}
                                </TableCell>
                                <TableCell className="text-sm">{log.event}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      log.status === "success"
                                        ? "bg-green-100 text-green-800"
                                        : log.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {log.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm">{log.attempt}</TableCell>
                                <TableCell className="text-sm">{log.status_code || "-"}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleDateString("pt-BR")}{" "}
                                  {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💬</span> WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Envie mensagens automáticas no WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Integre com a API do WhatsApp Business para enviar mensagens automáticas quando clientes completam compras.
                  </p>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto">
                    <pre>{`POST https://seu-servidor.com/webhook
{
  "event": "payment.completed",
  "customer": {
    "name": "João Silva",
    "phone": "5511999999999",
    "email": "joao@email.com"
  },
  "order": {
    "id": "123",
    "total": 99.90
  }
}`}</pre>
                  </div>
                  <Button className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>

              {/* Zapier Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>⚡</span> Zapier
                  </CardTitle>
                  <CardDescription>
                    Automatize fluxos com Zapier
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Conecte com Zapier para automatizar ações em centenas de aplicativos (Google Sheets, Slack, etc).
                  </p>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto">
                    <pre>{`URL do Webhook Zapier:
https://hooks.zapier.com/hooks/catch/...

Eventos suportados:
- payment.completed
- order.created
- customer.created`}</pre>
                  </div>
                  <Button className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>

              {/* Make Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🔗</span> Make (Integromat)
                  </CardTitle>
                  <CardDescription>
                    Crie automações complexas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Use Make para criar fluxos de automação avançados com múltiplas etapas e condições.
                  </p>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto">
                    <pre>{`URL do Webhook Make:
https://hook.integromat.com/...

Mapeie os dados do webhook
para suas ações no Make`}</pre>
                  </div>
                  <Button className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>

              {/* Google Sheets Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📊</span> Google Sheets
                  </CardTitle>
                  <CardDescription>
                    Registre dados em planilhas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Envie dados de vendas automaticamente para Google Sheets usando Apps Script.
                  </p>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto">
                    <pre>{`function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  // Adicione dados à planilha
  return ContentService
    .createTextOutput("OK");
}`}</pre>
                  </div>
                  <Button className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentação */}
          <TabsContent value="docs" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentação de Webhooks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Como Funciona</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quando um evento ocorre no seu checkout (pagamento, pedido, etc), nós enviamos um POST request para sua URL de webhook com os dados do evento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Estrutura do Payload</h3>
                  <div className="bg-gray-100 rounded p-4 text-xs font-mono overflow-auto">
                    <pre>{`{
  "id": "webhook-event-123",
  "event": "payment.completed",
  "timestamp": "2024-11-23T01:30:00Z",
  "data": {
    "payment_id": "pay-123",
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "5511999999999",
      "cpf": "12345678900"
    },
    "order": {
      "id": "order-123",
      "product_name": "Curso Premium",
      "amount": 99.90,
      "currency": "BRL"
    },
    "checkout": {
      "id": "checkout-123",
      "slug": "meu-checkout"
    }
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Resposta Esperada</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Seu servidor deve responder com status 200 OK:
                  </p>
                  <div className="bg-gray-100 rounded p-4 text-xs font-mono overflow-auto">
                    <pre>{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Webhook recebido com sucesso"
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Eventos Disponíveis</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-mono text-sm">{event.id}</TableCell>
                          <TableCell className="text-sm">{event.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Segurança</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Valide o header X-Webhook-Signature para verificar autenticidade</li>
                    <li>Use HTTPS para sua URL de webhook</li>
                    <li>Implemente retry logic para falhas temporárias</li>
                    <li>Registre todos os webhooks recebidos para debug</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WebhooksConfig;
