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
    const { amount, customerName, customerEmail, expiresIn = 3600 } = await req.json();

    const clientId = Deno.env.get('EFI_CLIENT_ID');
    const clientSecret = Deno.env.get('EFI_CLIENT_SECRET');
    const certificate = Deno.env.get('EFI_CERTIFICATE');
    const isSandbox = Deno.env.get('EFI_SANDBOX') === 'true';
    const testMode = Deno.env.get('TEST_MODE') === 'true';

    // Se estiver em modo teste, retornar dados simulados
    if (testMode || !certificate) {
      console.log('Modo teste ativado - gerando PIX simulado');
      
      const txid = crypto.randomUUID().replace(/-/g, '').substring(0, 35);
      const pixCopyPaste = `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${amount.toFixed(2)}5802BR5913TESTE6009SAO PAULO62410503***63041D3D`;
      
      // Gerar QR Code simulado (usando um serviço público)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`;
      
      return new Response(
        JSON.stringify({
          txid: txid,
          pixCopyPaste: pixCopyPaste,
          pixQrCode: qrCodeUrl,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
          testMode: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (!clientId || !clientSecret || !certificate) {
      throw new Error('Credenciais Efí não configuradas. Use TEST_MODE=true para modo teste.');
    }

    const baseUrl = isSandbox 
      ? 'https://pix-h.api.efipay.com.br'
      : 'https://pix.api.efipay.com.br';

    // Obter token OAuth
    const authString = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Erro ao obter token:', error);
      throw new Error('Falha na autenticação Efí');
    }

    const { access_token } = await tokenResponse.json();

    // Gerar txid único
    const txid = crypto.randomUUID().replace(/-/g, '');

    // Criar cobrança Pix
    const chargeData = {
      calendario: {
        expiracao: expiresIn
      },
      devedor: {
        nome: customerName,
        cpf: "12345678909" // CPF genérico para teste
      },
      valor: {
        original: amount.toFixed(2)
      },
      chave: "suachavepix@exemplo.com", // Substitua pela sua chave Pix
      solicitacaoPagador: "Pagamento do pedido"
    };

    const chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeData)
    });

    if (!chargeResponse.ok) {
      const error = await chargeResponse.text();
      console.error('Erro ao criar cobrança:', error);
      throw new Error('Falha ao criar cobrança Pix');
    }

    const charge = await chargeResponse.json();

    // Gerar QR Code
    const qrCodeResponse = await fetch(`${baseUrl}/v2/loc/${charge.loc.id}/qrcode`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      }
    });

    if (!qrCodeResponse.ok) {
      throw new Error('Falha ao gerar QR Code');
    }

    const qrCode = await qrCodeResponse.json();

    return new Response(
      JSON.stringify({
        txid: charge.txid,
        pixCopyPaste: qrCode.qrcode,
        pixQrCode: qrCode.imagemQrcode,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função pix-charge:', error);
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