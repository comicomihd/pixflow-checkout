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

    const body = await req.json();
    console.log('Checkout submit body:', body);

    const { 
      checkoutId, 
      customerName, 
      customerEmail, 
      customerCpf,
      customerWhatsapp,
      customerData,
      includeBump 
    } = body;

    // Buscar checkout
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .select('*')
      .eq('id', checkoutId)
      .eq('active', true)
      .single();

    if (checkoutError || !checkout) {
      console.error('Checkout error:', checkoutError);
      throw new Error('Checkout não encontrado');
    }

    // Buscar produto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', checkout.product_id)
      .single();

    if (productError || !product) {
      console.error('Product error:', productError);
      throw new Error('Produto não encontrado');
    }

    // Buscar order bumps
    const { data: bumps, error: bumpsError } = await supabase
      .from('order_bumps')
      .select('*')
      .eq('checkout_id', checkoutId);

    if (bumpsError) {
      console.error('Bumps error:', bumpsError);
    }

    let totalAmount = parseFloat(product.price);
    let bumpAmount = 0;

    if (includeBump && bumps && bumps.length > 0) {
      const bump = bumps[0];
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
        customer_data: customerData || {
          cpf: customerCpf,
          whatsapp: customerWhatsapp
        },
        amount: product.price,
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