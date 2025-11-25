import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID!;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET!;
const EFI_PIX_KEY = process.env.EFI_PIX_KEY!;
const EFI_CERT_PEM_BASE64 = process.env.EFI_CERT_PEM_BASE64!;
const EFI_KEY_PEM_BASE64 = process.env.EFI_KEY_PEM_BASE64!;
const EFI_ENV = process.env.EFI_ENV ?? 'production';

const EFI_BASE =
  EFI_ENV === 'sandbox'
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Cache simples em memória do token da Efí
let cachedEfipayToken: { token: string; expiresAt: number } | null = null;

async function getEfipayToken() {
  if (cachedEfipayToken && Date.now() < cachedEfipayToken.expiresAt - 10_000) {
    return cachedEfipayToken.token;
  }

  try {
    const res = await axios.post(
      `${EFI_BASE}/oauth/token`,
      { grant_type: 'client_credentials' },
      {
        auth: { username: EFI_CLIENT_ID, password: EFI_CLIENT_SECRET },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const token = res.data.access_token;
    const expiresIn = res.data.expires_in ?? 3600;
    cachedEfipayToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
    return token;
  } catch (error) {
    console.error('Erro ao obter token Efí:', error);
    throw new Error('Falha na autenticação Efí');
  }
}

function buildHttpsAgent() {
  try {
    const cert = Buffer.from(EFI_CERT_PEM_BASE64, 'base64');
    const key = Buffer.from(EFI_KEY_PEM_BASE64, 'base64');
    return new https.Agent({
      cert,
      key,
      rejectUnauthorized: true,
    });
  } catch (error) {
    console.error('Erro ao construir HTTPS Agent:', error);
    throw new Error('Certificado inválido');
  }
}

function sanitizeTxid(raw?: string) {
  const prefix = 'TX_';
  const base = (raw || Date.now().toString())
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 30);
  return (prefix + base).slice(0, 35);
}

function validateAmount(amount: any): string {
  const amountStr =
    typeof amount === 'number' ? amount.toFixed(2) : String(amount).replace(',', '.');

  if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
    throw new Error('amount must be a number with up to 2 decimals');
  }

  return amountStr;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1) Validar token do Supabase
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = auth.split(' ')[1];

    // Validar token usando Supabase
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error('Erro ao validar token:', userErr);
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    const user = userData.user;
    console.log(`Usuário autenticado: ${user.id}`);

    // 2) Validar body
    const { amount, customerName, customerEmail, txid: txidRaw } = req.body || {};

    if (!amount || !customerName) {
      return res.status(400).json({ error: 'amount and customerName are required' });
    }

    const amountStr = validateAmount(amount);
    const txid = sanitizeTxid(txidRaw);

    console.log(`Criando cobrança: txid=${txid}, amount=${amountStr}, customer=${customerName}`);

    // 3) Obter token Efí
    const efToken = await getEfipayToken();
    const httpsAgent = buildHttpsAgent();

    // 4) Criar cobrança (PUT /v2/cob/{txid})
    const cobBody = {
      calendario: { expiracao: 3600 },
      devedor: {
        nome: customerName,
        cpf: '00000000000', // Pode ser passado dinamicamente se tiver
      },
      valor: { original: amountStr },
      chave: EFI_PIX_KEY,
      solicitacaoPagador: 'Pagamento do pedido',
    };

    const putRes = await axios.put(`${EFI_BASE}/v2/cob/${txid}`, cobBody, {
      headers: {
        Authorization: `Bearer ${efToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });

    const locId = putRes.data.loc?.id;
    if (!locId) {
      console.error('Efí não retornou loc id:', putRes.data);
      return res.status(500).json({
        error: 'Efí did not return loc id',
        details: putRes.data,
      });
    }

    console.log(`Cobrança criada: loc=${locId}`);

    // 5) Buscar QR Code (GET /v2/loc/{locId}/qrcode)
    const qrRes = await axios.get(`${EFI_BASE}/v2/loc/${locId}/qrcode`, {
      headers: { Authorization: `Bearer ${efToken}` },
      httpsAgent,
    });

    console.log('QR Code gerado com sucesso');

    // 6) Retornar resposta
    return res.status(200).json({
      success: true,
      txid,
      copiaECola: qrRes.data.qrcode,
      imagemQrcodeBase64: qrRes.data.imagemQrcode,
      loc: putRes.data.loc,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error('PIX API ERROR:', err?.response?.data || err.message || err);

    const statusCode = err?.response?.status || 500;
    const errorMessage = err?.response?.data?.message || err.message || 'Unknown error';

    return res.status(statusCode).json({
      error: 'pix_error',
      message: errorMessage,
      details: err?.response?.data,
    });
  }
}
