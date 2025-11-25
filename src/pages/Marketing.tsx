import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Send, Download, BarChart3, Clock, MessageSquare } from "lucide-react";
import { sendDeliverableEmailViaResend } from "@/lib/resend-service";
import { configureWhatsApp, getWhatsAppConfig, testWhatsAppConnection } from "@/lib/whatsapp-service";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetSegment: "todos" | "vip" | "ativo" | "novo";
  status: "draft" | "sent";
  totalRecipients: number;
  sentCount: number;
  createdAt: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  message: string;
  delayHours: number;
  active: boolean;
  createdAt: string;
}

const Marketing = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [whatsappToken, setWhatsappToken] = useState("");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("");

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    targetSegment: "todos" as const,
  });

  const [automationForm, setAutomationForm] = useState({
    name: "",
    trigger: "purchase",
    action: "email",
    message: "",
    delayHours: 1,
  });

  useEffect(() => {
    loadCampaigns();
    loadAutomations();
  }, []);

  const loadCampaigns = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("email_campaigns") || "[]");
      setCampaigns(saved);
    } catch {
      setCampaigns([]);
    }
  };

  const loadAutomations = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("automations") || "[]");
      setAutomations(saved);
    } catch {
      setAutomations([]);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const newCampaign: Campaign = {
        id: `campaign-${Date.now()}`,
        name: campaignForm.name,
        subject: campaignForm.subject,
        content: campaignForm.content,
        targetSegment: campaignForm.targetSegment,
        status: "draft",
        totalRecipients: 0,
        sentCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updated = [...campaigns, newCampaign];
      setCampaigns(updated);
      localStorage.setItem("email_campaigns", JSON.stringify(updated));

      setCampaignForm({ name: "", subject: "", content: "", targetSegment: "todos" });
      setCampaignDialogOpen(false);
      toast.success("Campanha criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar campanha");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    setLoading(true);
    try {
      const savedCustomers = JSON.parse(localStorage.getItem("crm_customers") || "{}");
      const customers = Object.entries(savedCustomers).map(([email, data]: any) => ({
        email,
        ...data,
      }));

      let targetCustomers = customers;
      if (campaign.targetSegment !== "todos") {
        targetCustomers = customers.filter((c: any) => c.status === campaign.targetSegment);
      }

      let sentCount = 0;
      for (const customer of targetCustomers) {
        try {
          await sendDeliverableEmailViaResend(
            customer.email,
            customer.name || "Cliente",
            "campaign",
            campaign.subject,
            0,
            false
          );
          sentCount++;
        } catch (error) {
          console.error(`Erro ao enviar para ${customer.email}:`, error);
        }
      }

      const updated = campaigns.map((c) =>
        c.id === campaign.id
          ? {
              ...c,
              status: "sent" as const,
              totalRecipients: targetCustomers.length,
              sentCount,
            }
          : c
      );
      setCampaigns(updated);
      localStorage.setItem("email_campaigns", JSON.stringify(updated));

      toast.success(`Campanha enviada para ${sentCount} clientes!`);
    } catch (error) {
      toast.error("Erro ao enviar campanha");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = () => {
    if (!automationForm.name || !automationForm.message) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newAutomation: Automation = {
      id: `automation-${Date.now()}`,
      name: automationForm.name,
      trigger: automationForm.trigger,
      action: automationForm.action,
      message: automationForm.message,
      delayHours: automationForm.delayHours,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...automations, newAutomation];
    setAutomations(updated);
    localStorage.setItem("automations", JSON.stringify(updated));

    setAutomationForm({
      name: "",
      trigger: "purchase",
      action: "email",
      message: "",
      delayHours: 1,
    });
    setAutomationDialogOpen(false);
    toast.success("Automação criada com sucesso!");
  };

  const toggleAutomation = (id: string) => {
    const updated = automations.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    setAutomations(updated);
    localStorage.setItem("automations", JSON.stringify(updated));
  };

  const exportToCSV = () => {
    try {
      const savedCustomers = JSON.parse(localStorage.getItem("crm_customers") || "{}");
      const customers = Object.entries(savedCustomers).map(([email, data]: any) => ({
        email,
        ...data,
      }));

      const csv = [
        ["Email", "Nome", "Tags", "Notas"],
        ...customers.map((c: any) => [
          c.email,
          c.name || "",
          c.tags?.join(";") || "",
          c.notes?.replace(/\n/g, " ") || "",
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Arquivo CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    }
  };

  const handleConfigureWhatsApp = async () => {
    if (!whatsappToken || !whatsappPhoneId) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      configureWhatsApp({
        token: whatsappToken,
        phoneNumberId: whatsappPhoneId,
        businessAccountId: "",
      });

      const connected = await testWhatsAppConnection();
      if (connected) {
        toast.success("✅ WhatsApp conectado com sucesso!");
      } else {
        toast.error("❌ Erro ao conectar WhatsApp. Verifique as credenciais.");
      }
    } catch (error) {
      toast.error("Erro ao configurar WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">Marketing & Automação</h1>
          <p className="text-muted-foreground mt-2">
            Campanhas, automações, WhatsApp e relatórios
          </p>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="campaigns">📧 Campanhas</TabsTrigger>
            <TabsTrigger value="automations">⚙️ Automações</TabsTrigger>
            <TabsTrigger value="whatsapp">💬 WhatsApp</TabsTrigger>
            <TabsTrigger value="reports">📊 Relatórios</TabsTrigger>
            <TabsTrigger value="export">📥 Exportar</TabsTrigger>
          </TabsList>

          {/* Campanhas */}
          <TabsContent value="campaigns" className="mt-6 space-y-4">
            <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Campanha de Email</DialogTitle>
                  <DialogDescription>
                    Envie emails em massa para seus clientes
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome da Campanha</Label>
                    <Input
                      value={campaignForm.name}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, name: e.target.value })
                      }
                      placeholder="Ex: Black Friday 2024"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Assunto do Email</Label>
                    <Input
                      value={campaignForm.subject}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, subject: e.target.value })
                      }
                      placeholder="Ex: 🎉 Desconto exclusivo!"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Conteúdo do Email</Label>
                    <Textarea
                      value={campaignForm.content}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, content: e.target.value })
                      }
                      placeholder="Escreva o conteúdo..."
                      rows={6}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Segmento de Clientes</Label>
                    <select
                      value={campaignForm.targetSegment}
                      onChange={(e) =>
                        setCampaignForm({
                          ...campaignForm,
                          targetSegment: e.target.value as any,
                        })
                      }
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="todos">Todos os Clientes</option>
                      <option value="vip">Clientes VIP</option>
                      <option value="ativo">Clientes Ativos</option>
                      <option value="novo">Clientes Novos</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateCampaign} disabled={loading}>
                    {loading ? "Criando..." : "Criar Campanha"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma campanha criada
                    </p>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>{campaign.subject}</CardDescription>
                        </div>
                        <Badge variant={campaign.status === "sent" ? "default" : "outline"}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Segmento</p>
                          <p className="font-semibold capitalize">{campaign.targetSegment}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Enviados</p>
                          <p className="font-semibold">
                            {campaign.sentCount} / {campaign.totalRecipients}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data</p>
                          <p className="font-semibold">
                            {new Date(campaign.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {campaign.status === "draft" && (
                        <Button
                          onClick={() => handleSendCampaign(campaign)}
                          disabled={loading}
                          className="w-full"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {loading ? "Enviando..." : "Enviar Campanha"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Automações */}
          <TabsContent value="automations" className="mt-6 space-y-4">
            <Dialog open={automationDialogOpen} onOpenChange={setAutomationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="mr-2 h-4 w-4" />
                  Nova Automação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Automação</DialogTitle>
                  <DialogDescription>
                    Configure automações de follow-up automático
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome da Automação</Label>
                    <Input
                      value={automationForm.name}
                      onChange={(e) =>
                        setAutomationForm({ ...automationForm, name: e.target.value })
                      }
                      placeholder="Ex: Follow-up pós-compra"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Gatilho</Label>
                    <select
                      value={automationForm.trigger}
                      onChange={(e) =>
                        setAutomationForm({
                          ...automationForm,
                          trigger: e.target.value,
                        })
                      }
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="purchase">Após Compra</option>
                      <option value="abandoned_cart">Carrinho Abandonado</option>
                      <option value="no_purchase_30days">Sem Compra há 30 dias</option>
                      <option value="vip_milestone">Cliente Vira VIP</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Ação</Label>
                    <select
                      value={automationForm.action}
                      onChange={(e) =>
                        setAutomationForm({
                          ...automationForm,
                          action: e.target.value,
                        })
                      }
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="both">Email + WhatsApp</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Atraso (horas)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={automationForm.delayHours}
                      onChange={(e) =>
                        setAutomationForm({
                          ...automationForm,
                          delayHours: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Mensagem</Label>
                    <Textarea
                      value={automationForm.message}
                      onChange={(e) =>
                        setAutomationForm({ ...automationForm, message: e.target.value })
                      }
                      placeholder="Escreva a mensagem automática..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateAutomation}>Criar Automação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              {automations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma automação criada
                    </p>
                  </CardContent>
                </Card>
              ) : (
                automations.map((automation) => (
                  <Card key={automation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{automation.name}</CardTitle>
                          <CardDescription>
                            {automation.trigger} → {automation.action}
                          </CardDescription>
                        </div>
                        <Badge variant={automation.active ? "default" : "outline"}>
                          {automation.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => toggleAutomation(automation.id)}
                      >
                        {automation.active ? "Desativar" : "Ativar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integração WhatsApp API</CardTitle>
                <CardDescription>
                  Configure sua integração com WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Token de Acesso</Label>
                    <Input
                      type="password"
                      value={whatsappToken}
                      onChange={(e) => setWhatsappToken(e.target.value)}
                      placeholder="Seu token do WhatsApp Business API"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>ID do Número de Telefone</Label>
                    <Input
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      placeholder="Ex: 123456789"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
                    <p className="text-blue-900">
                      <strong>💡 Como obter:</strong> Acesse{" "}
                      <a
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Facebook Developers
                      </a>
                    </p>
                  </div>

                  <Button
                    onClick={handleConfigureWhatsApp}
                    disabled={loading}
                    className="w-full"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {loading ? "Conectando..." : "Conectar WhatsApp"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Avançados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Relatórios detalhados de campanhas, automações e engajamento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exportar */}
          <TabsContent value="export" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Exporte seus clientes em formato CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportToCSV} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Clientes em CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketing;
