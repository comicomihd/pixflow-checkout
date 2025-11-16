import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-4xl">Obrigado pela sua compra!</CardTitle>
          <CardDescription className="text-lg mt-4">
            Seu pedido foi processado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-lg mb-4">
              Enviamos todas as informações e o acesso ao produto para o seu e-mail.
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e, se necessário, a pasta de spam.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
