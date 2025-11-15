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
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      checkoutId, 
      customerName, 
      customerEmail, 
      customerData,
      includeBump 
    } = await req.json();

    // Buscar checkout com produto e bump
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .select(`
        *,
        product:products!inner(*),
        order_bumps(*)
      `)
      .eq('id', checkoutId)
      .eq('active', true)
      .single();

    if (checkoutError || !checkout) {
      throw new Error('Checkout não encontrado');
    }

    let totalAmount = parseFloat(checkout.product.price);
    let bumpAmount = 0;

    if (includeBump && checkout.order_bumps && checkout.order_bumps.length > 0) {
      const bump = checkout.order_bumps[0];
      bumpAmount = parseFloat(bump.price);
      totalAmount += bumpAmount;
    }

    // Criar pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        checkout_id: checkoutId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_data: customerData || {},
        amount: checkout.product.price,
        bump_amount: bumpAmount,
        total_amount: totalAmount,
        status: 'pending',
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Erro ao criar pagamento:', paymentError);
      throw new Error('Erro ao processar pedido');
    }

    // Criar cobrança Pix
    const chargeResponse = await fetch(`${supabaseUrl}/functions/v1/pix-charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        amount: totalAmount,
        customerName,
        customerEmail,
        expiresIn: 3600
      })
    });

    if (!chargeResponse.ok) {
      throw new Error('Falha ao gerar Pix');
    }

    const pixData = await chargeResponse.json();

    // Atualizar pagamento com dados do Pix
    await supabase
      .from('payments')
      .update({
        txid: pixData.txid,
        pix_copy_paste: pixData.pixCopyPaste,
        pix_qr_code: pixData.pixQrCode
      })
      .eq('id', payment.id);

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        txid: pixData.txid,
        pixCopyPaste: pixData.pixCopyPaste,
        pixQrCode: pixData.pixQrCode,
        totalAmount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro no checkout-submit:', error);
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