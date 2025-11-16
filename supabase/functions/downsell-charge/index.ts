import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { payment_id, downsell_id } = await req.json();

    // Buscar dados do pagamento original
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, checkouts(user_id)")
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      throw new Error("Pagamento não encontrado");
    }

    // Buscar dados do downsell
    const { data: downsell, error: downsellError } = await supabase
      .from("downsells")
      .select("*")
      .eq("id", downsell_id)
      .single();

    if (downsellError || !downsell) {
      throw new Error("Downsell não encontrado");
    }

    // Gerar cobrança Pix via Efí
    const efiUrl = Deno.env.get("EFI_SANDBOX") === "true"
      ? "https://cobrancas-h.api.efipay.com.br"
      : "https://cobrancas.api.efipay.com.br";

    const pixBody = {
      calendario: {
        expiracao: 3600, // 1 hora
      },
      valor: {
        original: downsell.price.toFixed(2),
      },
      chave: "suachavepix@email.com", // Substituir pela chave Pix do usuário
      solicitacaoPagador: `Downsell: ${downsell.name}`,
    };

    const pixResponse = await fetch(`${efiUrl}/v2/cob`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("EFI_ACCESS_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pixBody),
    });

    const pixData = await pixResponse.json();

    if (!pixData.txid) {
      throw new Error("Erro ao gerar cobrança Pix");
    }

    // Criar novo pagamento para o downsell (reutilizando a estrutura de payments)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { data: downsellPayment, error: insertError } = await supabase
      .from("payments")
      .insert({
        checkout_id: payment.checkout_id,
        customer_name: payment.customer_name,
        customer_email: payment.customer_email,
        customer_data: payment.customer_data,
        amount: downsell.price,
        bump_amount: 0,
        total_amount: downsell.price,
        status: "pending",
        txid: pixData.txid,
        pix_copy_paste: pixData.pixCopiaECola,
        pix_qr_code: pixData.imagemQrcode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError || !downsellPayment) {
      throw new Error("Erro ao salvar pagamento do downsell");
    }

    // Registrar na tabela de logs de delivery com indicação de downsell
    await supabase.from("delivery_logs").insert({
      payment_id: downsellPayment.id,
      customer_email: payment.customer_email,
      product_name: `Downsell: ${downsell.name}`,
      delivery_type: downsell.delivery_type,
      delivery_content: downsell.delivery_content || "",
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment: downsellPayment,
        pix: {
          qr_code: pixData.imagemQrcode,
          copy_paste: pixData.pixCopiaECola,
          txid: pixData.txid,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
