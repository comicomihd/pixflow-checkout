import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          SaaS de Checkout com Pix
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Crie checkouts profissionais com Order Bump, Upsell, Downsell e Presell.
          <br />
          Pagamentos via Pix Efí Pro com entrega automática.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")}>
            Começar Agora
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Fazer Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
