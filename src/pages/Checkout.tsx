import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const Checkout = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<any>(null);
  const [bump, setBump] = useState<any>(null);
  const [includeBump, setIncludeBump] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [pixData, setPixData] = useState<any>(null);

  useEffect(() => {
    loadCheckout();
  }, [slug]);

  const loadCheckout = async () => {
    try {
      const { data: checkoutData, error } = await supabase
        .from('checkouts')
        .select(`
          *,
          product:products!inner(*),
          order_bumps(*)
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;

      setCheckout(checkoutData);
      if (checkoutData.order_bumps && checkoutData.order_bumps.length > 0) {
        setBump(checkoutData.order_bumps[0]);
      }
    } catch (error: any) {
      toast.error("Checkout não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await supabase.functions.invoke('checkout-submit', {
        body: {
          checkoutId: checkout.id,
          customerName,
          customerEmail,
          includeBump
        }
      });

      if (response.error) throw response.error;

      setPixData(response.data);
      toast.success("Pedido criado! Pague o Pix para confirmar.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checkout não encontrado</p>
      </div>
    );
  }

  const totalAmount = parseFloat(checkout.product.price) + (includeBump && bump ? parseFloat(bump.price) : 0);

  if (pixData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Pague com Pix</CardTitle>
            <CardDescription>Escaneie o QR Code ou copie o código</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pixData.pixQrCode && (
              <div className="flex justify-center">
                <img 
                  src={pixData.pixQrCode} 
                  alt="QR Code Pix" 
                  className="w-64 h-64"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Pix Copia e Cola</Label>
              <div className="flex gap-2">
                <Input 
                  value={pixData.pixCopyPaste} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.pixCopyPaste);
                    toast.success("Código copiado!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">
                R$ {totalAmount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                O pagamento será confirmado automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: checkout.theme_color + '20' }}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {checkout.logo_url && (
            <img 
              src={checkout.logo_url} 
              alt="Logo" 
              className="h-12 mb-4 object-contain"
            />
          )}
          <CardTitle>{checkout.product.name}</CardTitle>
          <CardDescription>{checkout.product.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {bump && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="bump"
                    checked={includeBump}
                    onCheckedChange={(checked) => setIncludeBump(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="bump" className="font-bold cursor-pointer">
                      🎁 {bump.name} - R$ {parseFloat(bump.price).toFixed(2)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bump.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold" style={{ color: checkout.theme_color }}>
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitting}
                style={{ backgroundColor: checkout.theme_color }}
              >
                {submitting ? "Processando..." : "Finalizar Compra"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;