import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ExternalLink, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";

interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  createdAt: string;
  products: Array<{
    name: string;
    price: number;
    deliveryType: string;
    deliveryContent: string;
  }>;
}

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [checkoutConfig, setCheckoutConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const customerName = searchParams.get('name');
  const customerEmail = searchParams.get('email');
  const totalAmount = searchParams.get('total');
  const checkoutId = searchParams.get('checkoutId');

  useEffect(() => {
    const loadData = async () => {
      if (orderId && customerName && customerEmail && totalAmount) {
        setOrderData({
          id: orderId,
          customerName: decodeURIComponent(customerName),
          customerEmail: decodeURIComponent(customerEmail),
          totalAmount: parseFloat(totalAmount),
          createdAt: new Date().toLocaleString('pt-BR'),
          products: [
            {
              name: "Produto Adquirido",
              price: parseFloat(totalAmount),
              deliveryType: "link",
              deliveryContent: "https://seu-produto.com"
            }
          ]
        });
      }

      // Carregar configurações do checkout se disponível
      if (checkoutId) {
        try {
          const { data, error } = await supabase
            .from("checkouts")
            .select("custom_fields")
            .eq("id", checkoutId)
            .single();

          if (data && data.custom_fields) {
            setCheckoutConfig(data.custom_fields);
          }
        } catch (error) {
          console.error("Erro ao carregar configurações:", error);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [orderId, customerName, customerEmail, totalAmount, checkoutId]);

  const handleDownloadReceipt = () => {
    if (!orderData) return;
    
    const receiptContent = `
COMPROVANTE DE COMPRA
=====================

Pedido Nº: ${orderData.id}
Data: ${orderData.createdAt}
Cliente: ${orderData.customerName}
Email: ${orderData.customerEmail}

PRODUTOS ADQUIRIDOS:
${orderData.products.map(p => `- ${p.name}: R$ ${p.price.toFixed(2)}`).join('\n')}

TOTAL: R$ ${orderData.totalAmount.toFixed(2)}

Obrigado pela sua compra!
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `comprovante-${orderData.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Comprovante baixado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com sucesso */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Obrigado pela sua compra, {orderData?.customerName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu pagamento foi confirmado com sucesso
          </p>
        </div>

        {/* Resumo do Pedido */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumo do Seu Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Número do Pedido</p>
                <p className="font-semibold text-lg">{orderData?.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-semibold">{orderData?.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-sm break-all">{orderData?.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="font-semibold text-lg text-green-600">
                  R$ {orderData?.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Produtos */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Produtos Adquiridos</h3>
              <div className="space-y-2">
                {orderData?.products.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Entrega: {product.deliveryType === 'link' ? 'Link' : product.deliveryType === 'file' ? 'Arquivo' : 'Texto'}
                      </p>
                    </div>
                    <p className="font-semibold">R$ {product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acesso ao Produto */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Acesse Seu Produto Agora</CardTitle>
            <CardDescription>
              Clique no botão abaixo para acessar o conteúdo que você adquiriu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => window.open('https://seu-produto.com', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Produto
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Você também recebeu um email com o link de acesso
            </p>
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Comprovante Enviado</p>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um comprovante de compra para {orderData?.customerEmail}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Acesso Imediato</p>
                  <p className="text-sm text-muted-foreground">
                    Você já pode acessar o produto clicando no botão acima
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Suporte Disponível</p>
                  <p className="text-sm text-muted-foreground">
                    Qualquer dúvida, entre em contato conosco pelo WhatsApp ou email
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className={`grid gap-4 ${checkoutConfig?.thank_you_whatsapp_enabled ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Comprovante
          </Button>

          {checkoutConfig?.thank_you_whatsapp_enabled && checkoutConfig?.thank_you_whatsapp_number && (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                const whatsappLink = `https://wa.me/${checkoutConfig.thank_you_whatsapp_number}?text=${encodeURIComponent(checkoutConfig.thank_you_whatsapp_message || 'Olá! Recebi meu pedido e gostaria de mais informações')}`;
                window.open(whatsappLink, '_blank');
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {checkoutConfig.thank_you_whatsapp_button_text || 'Falar no WhatsApp'}
            </Button>
          )}

          <Button 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Voltar ao Início
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Obrigado por sua confiança! 🎉</p>
          <p className="mt-2">Qualquer dúvida, não hesite em nos contatar.</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
