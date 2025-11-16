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

    const { payment_id, upsell_id } = await req.json();

    // Buscar dados do pagamento original
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, checkouts(user_id)")
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      throw new Error("Pagamento não encontrado");
    }

    // Buscar dados do upsell
    const { data: upsell, error: upsellError } = await supabase
      .from("upsells")
      .select("*")
      .eq("id", upsell_id)
      .single();

    if (upsellError || !upsell) {
      throw new Error("Upsell não encontrado");
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
        original: upsell.price.toFixed(2),
      },
      chave: "suachavepix@email.com", // Substituir pela chave Pix do usuário
      solicitacaoPagador: `Upsell: ${upsell.name}`,
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

    // Salvar pagamento do upsell
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { data: upsellPayment, error: insertError } = await supabase
      .from("upsell_payments")
      .insert({
        payment_id: payment_id,
        upsell_id: upsell_id,
        amount: upsell.price,
        status: "pending",
        txid: pixData.txid,
        pix_copy_paste: pixData.pixCopiaECola,
        pix_qr_code: pixData.imagemQrcode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError || !upsellPayment) {
      throw new Error("Erro ao salvar pagamento do upsell");
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: upsellPayment,
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
