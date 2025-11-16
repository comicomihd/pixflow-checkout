import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type Downsell = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

const Downsell = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment");
  const [downsell, setDownsell] = useState<Downsell | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      toast.error("Pagamento não encontrado");
      navigate("/");
      return;
    }
    loadDownsell();
  }, [paymentId]);

  const loadDownsell = async () => {
    if (!paymentId) return;

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

    const { data: downsells, error: downsellError } = await supabase
      .from("downsells")
      .select("*")
      .eq("checkout_id", payment.checkout_id)
      .eq("active", true)
      .limit(1);

    if (downsellError || !downsells || downsells.length === 0) {
      toast.error("Nenhuma oferta disponível");
      navigate("/");
      return;
    }

    setDownsell(downsells[0]);
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!downsell || !paymentId) return;
    setProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/downsell-charge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
            downsell_id: downsell.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Oferta aceita com sucesso!");
        navigate("/obrigado");
      } else {
        toast.error("Erro ao processar oferta");
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

  if (!downsell) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-3xl">Espere! Última Chance</CardTitle>
          <CardDescription className="text-lg mt-2">
            Temos uma oferta especial mais acessível para você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{downsell.name}</h2>
            {downsell.description && (
              <p className="text-muted-foreground mb-4">{downsell.description}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <div className="text-2xl line-through text-muted-foreground">
                R$ {(downsell.price * 1.5).toFixed(2)}
              </div>
              <div className="text-4xl font-bold text-orange-600">
                R$ {downsell.price.toFixed(2)}
              </div>
            </div>
            <p className="text-sm text-orange-600 font-semibold mt-2">
              Economia de 33%!
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="font-semibold mb-3 text-orange-900">
              Esta é sua última oportunidade!
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Preço especial apenas para você</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Oferta válida somente nesta página</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Acesso imediato após confirmação</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            size="lg"
            onClick={handleAccept}
            disabled={processing}
          >
            {processing
              ? "Processando..."
              : `Sim, Quero Aproveitar! R$ ${downsell.price.toFixed(2)}`}
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

export default Downsell;
