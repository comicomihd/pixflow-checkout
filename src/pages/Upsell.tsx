import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, X } from "lucide-react";

type Upsell = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

const Upsell = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment");
  const [upsell, setUpsell] = useState<Upsell | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      toast.error("Pagamento não encontrado");
      navigate("/");
      return;
    }
    loadUpsell();
  }, [paymentId]);

  const loadUpsell = async () => {
    if (!paymentId) return;

    // Buscar o pagamento e o checkout associado
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("checkout_id")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      toast.error("Erro ao carregar oferta");
      navigate("/");
      return;
    }

    // Buscar o primeiro upsell ativo do checkout
    const { data: upsells, error: upsellError } = await supabase
      .from("upsells")
      .select("*")
      .eq("checkout_id", payment.checkout_id)
      .eq("active", true)
      .limit(1);

    if (upsellError || !upsells || upsells.length === 0) {
      toast.error("Nenhuma oferta disponível");
      navigate("/");
      return;
    }

    setUpsell(upsells[0]);
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!upsell || !paymentId) return;
    setProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upsell-charge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
            upsell_id: upsell.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Upsell adicionado com sucesso!");
        navigate("/obrigado");
      } else {
        toast.error("Erro ao processar upsell");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar sua solicitação");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    navigate("/obrigado");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Carregando oferta...</p>
      </div>
    );
  }

  if (!upsell) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Oferta Especial!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Aproveite esta oportunidade única antes de continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{upsell.name}</h2>
            {upsell.description && (
              <p className="text-muted-foreground mb-4">{upsell.description}</p>
            )}
            <div className="text-4xl font-bold text-primary">
              R$ {upsell.price.toFixed(2)}
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Por que adicionar este produto?</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Complementa perfeitamente sua compra anterior</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Oferta exclusiva disponível apenas agora</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Entrega imediata após confirmação</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleAccept}
            disabled={processing}
          >
            {processing ? "Processando..." : `Sim, Quero! R$ ${upsell.price.toFixed(2)}`}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleReject}
            disabled={processing}
          >
            <X className="mr-2 h-4 w-4" />
            Não, Obrigado
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Upsell;
