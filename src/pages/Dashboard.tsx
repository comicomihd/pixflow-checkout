import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Painel do Produtor</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo, {user?.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie seus produtos digitais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/products")}>
                Ver Produtos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkouts</CardTitle>
              <CardDescription>
                Crie e personalize suas páginas de venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/checkouts")}>
                Ver Checkouts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas</CardTitle>
              <CardDescription>
                Acompanhe seus pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/sales")}>
                Ver Vendas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upsells</CardTitle>
              <CardDescription>
                Configure ofertas pós-compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate("/upsell")}>Ver Upsells</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/upsell-config")}>Personalizar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Downsells</CardTitle>
              <CardDescription>
                Crie ofertas alternativas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate("/downsell")}>Ver Downsells</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/downsell-config")}>Personalizar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entregas</CardTitle>
              <CardDescription>
                Histórico de entregas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate("/delivery")}>Ver Entregas</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/delivery-config")}>Personalizar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entregáveis</CardTitle>
              <CardDescription>
                Configure links e arquivos para entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/deliverables")}>Gerenciar Entregáveis</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Integre com WhatsApp, Zapier e outros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/webhooks-config")}>Configurar Webhooks</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>
                Teste e monitore envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/email-tester")}>Testador de Emails</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CRM</CardTitle>
              <CardDescription>
                Gestão de clientes e relacionamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/crm")}>Acessar CRM</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing</CardTitle>
              <CardDescription>
                Campanhas, automações e WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/marketing")}>Acessar Marketing</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;