import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ShoppingCart, Gift, Lock, Zap, CheckCircle, Star, Users, TrendingUp, Clock, Award, Headphones } from "lucide-react";
import CheckoutTimer from "@/components/CheckoutTimer";
import PixelTracker from "@/components/PixelTracker";
import { triggerWebhooks } from "@/lib/webhooks";
import { sendDeliverableEmailViaResend } from "@/lib/resend-service";
import { validateCustomerData, checkRateLimit } from "@/lib/validators";

const Checkout = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<any>(null);
  const [bump, setBump] = useState<any>(null);
  const [includeBump, setIncludeBump] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");

  const [pixData, setPixData] = useState<any>(null);

  useEffect(() => {
    loadCheckout();
  }, [slug]);

  const loadCheckout = async () => {
    try {
      // Buscar checkout
      const { data: checkoutData, error: checkoutError } = await supabase
        .from('checkouts')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        throw new Error('Checkout não encontrado');
      }

      // Buscar produto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', checkoutData.product_id)
        .single();

      if (productError) {
        console.error('Product error:', productError);
        throw new Error('Produto não encontrado');
      }

      // Buscar order bumps
      const { data: bumpsData, error: bumpsError } = await supabase
        .from('order_bumps')
        .select('*')
        .eq('checkout_id', checkoutData.id);

      if (bumpsError) {
        console.error('Bumps error:', bumpsError);
      }

      // Combinar dados
      const checkoutWithRelations = {
        ...checkoutData,
        product: productData,
        order_bumps: bumpsData || []
      };

      setCheckout(checkoutWithRelations);
      if (bumpsData && bumpsData.length > 0) {
        setBump(bumpsData[0]);
      }
    } catch (error: any) {
      toast.error("Checkout não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar rate limiting (máximo 5 tentativas por minuto)
    if (!checkRateLimit(`checkout_${customerEmail}`, 5, 60000)) {
      toast.error("Muitas tentativas. Aguarde um minuto.");
      return;
    }

    // Validar dados do cliente
    const validationErrors = validateCustomerData({
      name: customerName,
      email: customerEmail,
      phone: customerWhatsapp,
      cpf: customerCpf,
    });

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map((e) => e.message).join(", ");
      toast.error(errorMessage);
      return;
    }

    if (!customerName || !customerEmail || !customerWhatsapp) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      // Criar pagamento no Supabase
      const paymentData = {
        checkout_id: checkout.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_data: {
          cpf: customerCpf,
          whatsapp: customerWhatsapp
        } as any,
        amount: parseFloat(checkout.product.price),
        bump_amount: includeBump && bump ? parseFloat(bump.price) : 0,
        total_amount: totalAmount,
        status: 'pending' as const,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      };

      console.log('Criando pagamento:', paymentData);

      const { data: payment, error: paymentError } = await (supabase
        .from('pix_payments' as any)
        .insert(paymentData)
        .select()
        .single() as any);

      if (paymentError) {
        console.error('Erro ao criar pagamento:', paymentError);
        throw new Error(`Erro ao criar pagamento: ${paymentError.message}`);
      }

      if (!payment) {
        throw new Error('Pagamento não foi criado');
      }

      console.log('Pagamento criado:', payment);

      // Gerar PIX via API segura
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const pixResponse = await fetch('/api/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          customerName,
          customerEmail,
          txid: payment.id,
        }),
      });

      if (!pixResponse.ok) {
        const errorData = await pixResponse.json();
        throw new Error(`Erro ao gerar PIX: ${errorData.message || pixResponse.statusText}`);
      }

      const pixData = await pixResponse.json();

      // Atualizar pagamento com dados do PIX
      await (supabase
        .from('pix_payments' as any)
        .update({
          txid: pixData.txid,
          pix_copy_paste: pixData.copiaECola,
          pix_qr_code: pixData.imagemQrcodeBase64
        })
        .eq('id', payment.id) as any);

      setPixData({
        paymentId: payment.id,
        txid: pixData.txid,
        pixCopyPaste: pixData.copiaECola,
        pixQrCode: pixData.imagemQrcodeBase64,
        expiresAt: pixData.expiresAt,
      });
      toast.success("Pedido criado! Pague o Pix para confirmar.");

      // Disparar webhooks
      await triggerWebhooks("payment.created", {
        payment_id: payment.id,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerWhatsapp,
          cpf: customerCpf,
        },
        order: {
          id: checkout.id,
          product_name: checkout.product.name,
          amount: parseFloat(checkout.product.price),
          bump_amount: includeBump && bump ? parseFloat(bump.price) : 0,
          total: totalAmount,
          currency: "BRL",
        },
        checkout: {
          id: checkout.id,
          slug: checkout.slug,
        },
      });

      // Disparar webhook de conversão após confirmação
      setTimeout(async () => {
        await triggerWebhooks("payment.completed", {
          payment_id: payment.id,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerWhatsapp,
            cpf: customerCpf,
          },
          order: {
            id: checkout.id,
            product_name: checkout.product.name,
            amount: parseFloat(checkout.product.price),
            bump_amount: includeBump && bump ? parseFloat(bump.price) : 0,
            total: totalAmount,
            currency: "BRL",
          },
          checkout: {
            id: checkout.id,
            slug: checkout.slug,
          },
        });

        // Enviar email com entregáveis via Resend
        await sendDeliverableEmailViaResend(
          customerEmail,
          customerName,
          checkout.product_id,
          checkout.product.name,
          totalAmount,
          includeBump,
          bump?.id
        );
      }, 2000); // Disparar após 2 segundos (simular confirmação)
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
    // Rastrear conversão/compra
    return (
      <>
        <PixelTracker 
          config={checkout.custom_fields || {}}
          eventType="purchase"
          eventData={{
            value: totalAmount,
            currency: "BRL",
            content_name: checkout.product.name,
            content_type: "product",
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-background p-3 sm:p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-full bg-green-100">
              <Zap className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Pague com Pix</h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
              Escaneie o QR Code ou copie o código para pagar
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-6 sm:mb-8 border-2 border-green-200">
            <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
              {/* QR Code */}
              {pixData.pixQrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-green-100">
                    <img 
                      src={pixData.pixQrCode} 
                      alt="QR Code Pix" 
                      className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72"
                    />
                  </div>
                </div>
              )}

              {/* Valor */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Valor a Pagar</p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600">
                  R$ {totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-3 px-2 sm:px-0">
                <Label className="text-sm sm:text-base font-semibold">Ou copie o código Pix</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    value={pixData.pixCopyPaste} 
                    readOnly 
                    className="font-mono text-xs sm:text-sm bg-muted"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.pixCopyPaste);
                      toast.success("Código copiado!");
                    }}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto whitespace-nowrap"
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 space-y-3 mx-2 sm:mx-0">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm sm:text-base">Pagamento Seguro</p>
                    <p className="text-xs sm:text-sm text-green-800">Seus dados estão protegidos</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm sm:text-base">Confirmação Automática</p>
                    <p className="text-xs sm:text-sm text-green-800">Seu acesso será liberado em segundos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground px-2">
            <p>⏱️ Válido por 30 minutos | 🔒 Pagamento 100% seguro</p>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {checkout?.product && (
        <PixelTracker 
          config={checkout.custom_fields || {}}
          eventType="view_content"
          eventData={{
            content_name: checkout.product.name,
            content_type: "product",
            value: checkout.product.price,
            currency: "BRL",
          }}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header com Logo */}
        {checkout.logo_url && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <img 
              src={checkout.logo_url} 
              alt="Logo" 
              className="h-12 sm:h-14 md:h-16 mx-auto object-contain"
            />
          </div>
        )}

        {/* Timer */}
        <div className="mb-6 sm:mb-8">
          <CheckoutTimer 
            minutes={
              checkout.custom_fields?.timer_minutes || 
              checkout.countdown_minutes || 
              15
            } 
            message={checkout.custom_fields?.timer_message || "⏰ Realize o pagamento em:"} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Coluna Esquerda - Conteúdo e Formulário */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Headline Principal */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {checkout.product.name}
              </h1>
              {checkout.product.description && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {checkout.product.description}
                </p>
              )}
            </div>

            {/* Social Proof - Avaliações */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 sm:h-5 w-4 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold">4.9/5</span>
                <span className="text-muted-foreground text-xs sm:text-sm">(2.847 avaliações)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                <span><strong>12.500+</strong> clientes satisfeitos</span>
              </div>
            </div>

            {/* Benefícios Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex gap-3 p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                <CheckCircle className="h-5 sm:h-6 w-5 sm:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Acesso Imediato</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Comece agora mesmo após o pagamento</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                <Award className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Certificado Incluso</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Reconhecido no mercado</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                <Headphones className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Suporte Dedicado</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Equipe pronta para ajudar</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Resultados Comprovados</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">+300% de retorno em média</p>
                </div>
              </div>
            </div>

            {/* O que você vai receber */}
            <div className="bg-white rounded-lg border-2 border-blue-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">O que você vai receber:</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Acesso completo ao conteúdo premium</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Atualizações futuras incluídas gratuitamente</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Comunidade exclusiva de alunos</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Certificado de conclusão</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Suporte por email e WhatsApp</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Garantia de 30 dias ou seu dinheiro de volta</span>
                </li>
              </ul>
            </div>

            {/* Formulário */}
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">Preencha seus dados para começar</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold text-sm sm:text-base">Nome Completo</Label>
                      <Input
                        id="name"
                        placeholder="João Silva"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="font-semibold text-sm sm:text-base">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={customerCpf}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                            setCustomerCpf(value);
                          }
                        }}
                        required
                        disabled={submitting}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="font-semibold text-sm sm:text-base">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        value={customerWhatsapp}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            if (value.length > 2) {
                              value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                            }
                            setCustomerWhatsapp(value);
                          }
                        }}
                        required
                        disabled={submitting}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Order Bump com Urgência */}
                  {bump && (
                    <div className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 sm:p-5 space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                        OFERTA LIMITADA
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="bump"
                          checked={includeBump}
                          onCheckedChange={(checked) => setIncludeBump(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="bump" className="font-bold cursor-pointer text-sm sm:text-base flex items-center gap-2">
                            <Gift className="h-4 sm:h-5 w-4 sm:w-5 text-amber-600" />
                            {bump.name}
                          </Label>
                          {bump.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {bump.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs sm:text-sm line-through text-muted-foreground">
                              R$ {(parseFloat(bump.price) * 2).toFixed(2)}
                            </span>
                            <span className="text-base sm:text-lg font-bold text-amber-600">
                              + R$ {parseFloat(bump.price).toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                              -50%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botão CTA */}
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 md:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    size="lg"
                    disabled={submitting}
                  >
                    <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 mr-2" />
                    {submitting ? "Processando..." : "Garantir Acesso Agora"}
                  </Button>

                  {/* Garantia */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-green-900">
                      ✓ <strong>Garantia de 30 dias</strong> - Se não gostar, devolvemos 100% do seu dinheiro
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex gap-2 sm:gap-4 text-xs text-muted-foreground justify-center flex-wrap">
                    <div className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>SSL Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span>Acesso Imediato</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>100% Garantido</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Resumo Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-3 sm:space-y-4">
              {/* Card de Resumo */}
              <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Seu Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Produto Principal */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm items-start sm:items-center gap-2">
                      <span className="text-muted-foreground">{checkout.product.name}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm line-through text-muted-foreground">
                          R$ {(parseFloat(checkout.product.price) * 1.5).toFixed(2)}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-blue-600">
                          R$ {parseFloat(checkout.product.price).toFixed(2)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                          -33%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Bump */}
                  {bump && includeBump && (
                    <div className="space-y-2 border-t pt-3 sm:pt-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Gift className="h-4 w-4 text-amber-600" />
                          {bump.name}
                        </span>
                        <span className="font-semibold text-amber-600">+ R$ {parseFloat(bump.price).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-3 sm:pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm sm:text-base">Total:</span>
                      <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                        R$ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Economia */}
                  {bump && includeBump && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-xs sm:text-sm text-green-900 font-semibold">
                        💰 Você economiza R$ {(parseFloat(bump.price)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card de Urgência */}
              <Card className="border-0 bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="flex gap-3 items-start">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-white flex-shrink-0 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm sm:text-base drop-shadow-md">⏰ Oferta por Tempo Limitado</p>
                      <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed drop-shadow-sm">
                        Este preço especial expira em breve. Garanta agora e economize!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Segurança */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex gap-2">
                      <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-900">Pagamento 100% seguro</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-900">Garantia de 30 dias</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="text-green-900">Suporte 24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;