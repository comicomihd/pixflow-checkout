import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhook = await req.json();
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    // Processar notificação de pagamento
    if (webhook.pix && Array.isArray(webhook.pix)) {
      for (const pixEvent of webhook.pix) {
        const { txid } = pixEvent;

        // Buscar pagamento pelo txid
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('*, checkout:checkouts!inner(*, product:products!inner(*))')
          .eq('txid', txid)
          .maybeSingle();

        if (paymentError || !payment) {
          console.log('Pagamento não encontrado para txid:', txid);
          
          // Verificar se é um upsell_payment
          const { data: upsellPayment, error: upsellError } = await supabase
            .from('upsell_payments')
            .select('*, upsell:upsells!inner(*), payment:payments!inner(checkout:checkouts!inner(*))')
            .eq('txid', txid)
            .maybeSingle();

          if (upsellError || !upsellPayment) {
            console.log('Upsell payment não encontrado para txid:', txid);
            continue;
          }

          // Atualizar upsell payment
          await supabase
            .from('upsell_payments')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', upsellPayment.id);

          // Registrar entrega do upsell
          await supabase
            .from('delivery_logs')
            .insert({
              upsell_payment_id: upsellPayment.id,
              customer_email: upsellPayment.payment.customer_email,
              product_name: upsellPayment.upsell.name,
              delivery_type: upsellPayment.upsell.delivery_type,
              delivery_content: upsellPayment.upsell.delivery_content
            });

          console.log('Upsell entregue para:', upsellPayment.payment.customer_email);
          continue;
        }

        // Atualizar status do pagamento
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        if (updateError) {
          console.error('Erro ao atualizar pagamento:', updateError);
          continue;
        }

        // Registrar entrega automática
        const deliveries = [];

        // Produto principal
        deliveries.push({
          payment_id: payment.id,
          customer_email: payment.customer_email,
          product_name: payment.checkout.product.name,
          delivery_type: payment.checkout.product.delivery_type,
          delivery_content: payment.checkout.product.delivery_content
        });

        // Order bump (se houver)
        if (payment.bump_amount > 0) {
          const { data: bump } = await supabase
            .from('order_bumps')
            .select('*')
            .eq('checkout_id', payment.checkout_id)
            .eq('active', true)
            .maybeSingle();

          if (bump) {
            deliveries.push({
              payment_id: payment.id,
              customer_email: payment.customer_email,
              product_name: bump.name,
              delivery_type: bump.delivery_type,
              delivery_content: bump.delivery_content
            });
          }
        }

        const { error: deliveryError } = await supabase
          .from('delivery_logs')
          .insert(deliveries);

        if (deliveryError) {
          console.error('Erro ao registrar entregas:', deliveryError);
        } else {
          console.log('Produtos entregues para:', payment.customer_email);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});