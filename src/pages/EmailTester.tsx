import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { sendTestEmail, sendDeliverableEmailViaResend, getEmailLogs } from "@/lib/resend-service";

const EmailTester = () => {
  const navigate = useNavigate();
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("João Silva");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productName, setProductName] = useState("Curso Premium");
  const [orderTotal, setOrderTotal] = useState("99.90");

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Preencha o email de teste");
      return;
    }

    setLoading(true);
    try {
      const success = await sendTestEmail(testEmail);
      if (success) {
        toast.success("✅ Email de teste enviado com sucesso!");
      } else {
        toast.error("❌ Erro ao enviar email de teste");
      }
    } catch (error) {
      toast.error("Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDeliverable = async () => {
    if (!customerEmail) {
      toast.error("Preencha o email do cliente");
      return;
    }

    setLoading(true);
    try {
      const success = await sendDeliverableEmailViaResend(
        customerEmail,
        customerName,
        "product-123",
        productName,
        parseFloat(orderTotal),
        false
      );
      if (success) {
        toast.success("✅ Email com entregáveis enviado com sucesso!");
      } else {
        toast.error("❌ Erro ao enviar email");
      }
    } catch (error) {
      toast.error("Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const emailLogs = getEmailLogs();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">Testador de Emails</h1>
          <p className="text-muted-foreground mt-2">
            Teste o envio de emails com Resend
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email de Teste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🧪</span> Email de Teste
              </CardTitle>
              <CardDescription>
                Envie um email de teste para verificar se tudo está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="test-email">Email de Teste</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                />
              </div>
              <Button
                onClick={handleSendTest}
                disabled={loading}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar Email de Teste"}
              </Button>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="text-blue-900">
                  <strong>💡 Dica:</strong> Use seu email pessoal para testar se o email chega na caixa de entrada.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email com Entregáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📦</span> Email com Entregáveis
              </CardTitle>
              <CardDescription>
                Simule um email de compra com entregáveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Nome do Cliente</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-email">Email do Cliente</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-name">Nome do Produto</Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Curso Premium"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-total">Valor Total (R$)</Label>
                <Input
                  id="order-total"
                  type="number"
                  step="0.01"
                  value={orderTotal}
                  onChange={(e) => setOrderTotal(e.target.value)}
                  placeholder="99.90"
                />
              </div>
              <Button
                onClick={handleSendDeliverable}
                disabled={loading}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar Email com Entregáveis"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Logs de Emails */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Histórico de Emails Enviados</CardTitle>
            <CardDescription>
              Últimos emails enviados via Resend
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum email enviado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {emailLogs
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div>
                        {log.status === "sent" ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{log.to}</p>
                        <p className="text-xs text-muted-foreground">
                          Tipo: {log.type} | Status: {log.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString("pt-BR")}{" "}
                          {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                        </p>
                        {log.resend_id && (
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            ID: {log.resend_id}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status da Integração */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Integração Resend Ativa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-900 space-y-2">
            <p>✅ Resend está configurado e funcionando</p>
            <p>✅ Emails são enviados automaticamente após compra</p>
            <p>✅ Nome do cliente é personalizado no email</p>
            <p>✅ Link de suporte WhatsApp incluído</p>
            <p>✅ Entregáveis são listados automaticamente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTester;
