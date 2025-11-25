import { getConfig } from '@/config/production';

interface PixChargeResponse {
  txid: string;
  pixCopyPaste: string;
  pixQrCode: string;
  expiresAt: string;
}

export async function generatePixCharge(
  amount: number,
  customerName: string,
  customerEmail: string,
  expiresIn: number = 3600
): Promise<PixChargeResponse> {
  try {
    const config = getConfig();
    
    // Modo teste - retornar PIX simulado
    if (config.testMode || !config.efi.certificate) {
      console.log('Modo teste ativado - gerando PIX simulado');
      
      const txid = generateTxid();
      const pixCopyPaste = generatePixCopyPaste(txid, amount);
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`;
      
      return {
        txid,
        pixCopyPaste,
        pixQrCode: qrCodeUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      };
    }

    // Modo produção - usar Efí real
    return await generateRealPixCharge(
      amount,
      customerName,
      customerEmail,
      expiresIn,
      config
    );
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    throw error;
  }
}

function generateTxid(): string {
  return Math.random().toString(36).substring(2, 37);
}

function generatePixCopyPaste(txid: string, amount: number): string {
  return `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${amount.toFixed(2)}5802BR5913TESTE6009SAO PAULO62410503***63041D3D`;
}

async function generateRealPixCharge(
  amount: number,
  customerName: string,
  customerEmail: string,
  expiresIn: number,
  config: any
): Promise<PixChargeResponse> {
  const baseUrl = config.efi.sandbox
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br';

  // Obter token
  const authString = btoa(`${config.efi.clientId}:${config.efi.clientSecret}`);
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
    throw new Error('Falha na autenticação Efí');
  }

  const { access_token } = await tokenResponse.json();
  const txid = generateTxid();

  // Criar cobrança
  const chargeData = {
    calendario: {
      expiracao: expiresIn
    },
    devedor: {
      nome: customerName,
      cpf: "12345678909"
    },
    valor: {
      original: amount.toFixed(2)
    },
    chave: "suachavepix@exemplo.com",
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

  return {
    txid: charge.txid,
    pixCopyPaste: qrCode.qrcode,
    pixQrCode: qrCode.imagemQrcode,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
  };
}
