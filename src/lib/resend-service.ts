import { Resend } from "resend";
import { getConfig } from "@/config/production";

// Inicializar Resend com a API Key
const config = getConfig();
const resend = new Resend(config.resend.apiKey);

interface Deliverable {
  id: string;
  type: "product" | "order_bump" | "upsell" | "downsell";
  itemId: string;
  itemName: string;
  links: string[];
  created_at: string;
}

/**
 * Carrega entregáveis do localStorage
 */
const getDeliverables = (): Deliverable[] => {
  try {
    const saved = localStorage.getItem("deliverables");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Encontra entregáveis para um produto específico
 */
const findDeliverables = (
  productId: string,
  type: "product" | "order_bump" | "upsell" | "downsell"
): Deliverable[] => {
  const deliverables = getDeliverables();
  return deliverables.filter((d) => d.type === type && d.itemId === productId);
};

/**
 * Gera HTML do email com entregáveis
 */
const generateEmailHTML = (
  customerName: string,
  productName: string,
  deliverables: Deliverable[],
  orderTotal: number
): string => {
  const whatsappLink = "https://wa.link/2g3eh1";

  const deliverablesList = deliverables
    .map(
      (d) => `
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">📦 ${d.itemName}</h3>
      <div style="margin: 10px 0;">
        ${d.links
          .map(
            (link, idx) => `
          <div style="margin: 8px 0;">
            <a href="${link}" style="color: #0066cc; text-decoration: none; font-weight: 500;">
              ➜ Link ${idx + 1}: ${link.substring(0, 50)}${link.length > 50 ? "..." : ""}
            </a>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 40px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #0066cc;
          font-size: 28px;
        }
        .emoji {
          font-size: 32px;
          margin-right: 10px;
        }
        .content {
          margin: 30px 0;
        }
        .section {
          margin: 25px 0;
        }
        .section h2 {
          color: #333;
          font-size: 18px;
          margin-bottom: 15px;
          border-left: 4px solid #0066cc;
          padding-left: 10px;
        }
        .deliverables {
          margin: 20px 0;
        }
        .link-item {
          margin: 12px 0;
          padding: 12px;
          background-color: #f0f7ff;
          border-left: 4px solid #0066cc;
          border-radius: 4px;
        }
        .link-item a {
          color: #0066cc;
          text-decoration: none;
          font-weight: 500;
          word-break: break-all;
        }
        .link-item a:hover {
          text-decoration: underline;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .support-button {
          display: inline-block;
          background-color: #25d366;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 10px 0;
        }
        .support-button:hover {
          background-color: #20ba5a;
        }
        .info-box {
          background-color: #e8f4f8;
          border-left: 4px solid #0066cc;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .info-box p {
          margin: 0;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="emoji">🎉</span>Compra Confirmada!</h1>
        </div>

        <div class="content">
          <p>Olá <strong>${customerName}</strong>,</p>
          
          <p>Obrigado pela sua compra! Sua transação foi confirmada com sucesso.</p>

          <div class="section">
            <h2>📦 Seus Entregáveis</h2>
            <p>Aqui estão os links para acessar seu(s) produto(s):</p>
            
            <div class="deliverables">
              ${
                deliverables.length > 0
                  ? deliverablesList
                  : `
                <div class="info-box">
                  <p><strong>Seu entregável está sendo preparado!</strong></p>
                  <p>Em breve você receberá um email com os links de acesso. Se tiver dúvidas, entre em contato conosco pelo WhatsApp.</p>
                </div>
              `
              }
            </div>
          </div>

          <div class="section">
            <h2>💰 Resumo da Compra</h2>
            <p><strong>Produto:</strong> ${productName}</p>
            <p><strong>Valor Total:</strong> R$ ${orderTotal.toFixed(2)}</p>
          </div>

          <div class="section">
            <h2>❓ Dúvidas?</h2>
            <p>Se tiver qualquer dúvida ou problema ao acessar seus entregáveis, entre em contato conosco:</p>
            <div style="text-align: center;">
              <a href="${whatsappLink}" class="support-button">💬 Falar no WhatsApp</a>
            </div>
          </div>

          <div class="info-box">
            <p><strong>⏱️ Acesso Permanente:</strong> Você terá acesso permanente aos seus entregáveis. Guarde os links com segurança!</p>
            <p><strong>🔒 Segurança:</strong> Não compartilhe seus links com outras pessoas.</p>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Todos os direitos reservados.</p>
          <p>Este é um email automático, por favor não responda.</p>
          <p>
            <a href="${whatsappLink}" style="color: #0066cc; text-decoration: none;">Suporte via WhatsApp</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envia email com entregáveis via Resend
 */
export const sendDeliverableEmailViaResend = async (
  customerEmail: string,
  customerName: string,
  productId: string,
  productName: string,
  orderTotal: number,
  includeOrderBump: boolean = false,
  orderBumpId?: string
): Promise<boolean> => {
  try {
    // Encontrar entregáveis do produto
    const productDeliverables = findDeliverables(productId, "product");

    // Encontrar entregáveis do order bump se incluído
    let orderBumpDeliverables: Deliverable[] = [];
    if (includeOrderBump && orderBumpId) {
      orderBumpDeliverables = findDeliverables(orderBumpId, "order_bump");
    }

    // Combinar todos os entregáveis
    const allDeliverables = [...productDeliverables, ...orderBumpDeliverables];

    // Gerar HTML do email
    const htmlContent = generateEmailHTML(customerName, productName, allDeliverables, orderTotal);

    // Enviar email via Resend
    const response = await resend.emails.send({
      from: "noreply@pixflow.com.br",
      to: customerEmail,
      subject: `🎉 Sua compra foi confirmada! - Acesso aos entregáveis`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("Erro ao enviar email via Resend:", response.error);
      return false;
    }

    // Registrar envio localmente
    const emailLogs = JSON.parse(localStorage.getItem("email_logs") || "[]");
    emailLogs.push({
      id: response.data?.id || `email-${Date.now()}`,
      to: customerEmail,
      type: "deliverable",
      status: "sent",
      resend_id: response.data?.id,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("email_logs", JSON.stringify(emailLogs.slice(-100)));

    console.log(`✅ Email enviado com sucesso para ${customerEmail}`);
    console.log(`   ID Resend: ${response.data?.id}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
};

/**
 * Envia email de boas-vindas via Resend
 */
export const sendWelcomeEmailViaResend = async (
  customerEmail: string,
  customerName: string
): Promise<boolean> => {
  try {
    const whatsappLink = "https://wa.link/2g3eh1";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #333; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 40px 20px;
            background-color: white;
            border-radius: 12px;
          }
          .header { 
            background-color: #0066cc; 
            color: white; 
            padding: 30px; 
            border-radius: 8px; 
            text-align: center; 
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content { 
            padding: 20px; 
          }
          .content p {
            line-height: 1.6;
            margin: 15px 0;
          }
          a { 
            color: #0066cc; 
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .button {
            display: inline-block;
            background-color: #25d366;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #20ba5a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo, ${customerName}! 👋</h1>
          </div>
          <div class="content">
            <p>Obrigado por se registrar! Estamos felizes em tê-lo conosco.</p>
            <p>Se tiver qualquer dúvida, entre em contato conosco pelo WhatsApp:</p>
            <p>
              <a href="${whatsappLink}" class="button">💬 Falar no WhatsApp</a>
            </p>
            <p>Abraços,<br>Equipe Pixflow</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: "noreply@pixflow.com.br",
      to: customerEmail,
      subject: `Bem-vindo, ${customerName}! 👋`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("Erro ao enviar email de boas-vindas:", response.error);
      return false;
    }

    console.log(`✅ Email de boas-vindas enviado para ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);
    return false;
  }
};

/**
 * Obtém logs de emails enviados
 */
export const getEmailLogs = () => {
  try {
    return JSON.parse(localStorage.getItem("email_logs") || "[]");
  } catch {
    return [];
  }
};

/**
 * Testa envio de email
 */
export const sendTestEmail = async (testEmail: string): Promise<boolean> => {
  try {
    const response = await resend.emails.send({
      from: "noreply@pixflow.com.br",
      to: testEmail,
      subject: "🧪 Email de Teste - Resend",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Email de Teste</h1>
            <p class="success">Parabéns! O Resend está funcionando corretamente.</p>
            <p>Este é um email de teste para verificar se a integração está funcionando.</p>
            <p>ID do Email: ${Date.now()}</p>
          </div>
        </body>
        </html>
      `,
    });

    if (response.error) {
      console.error("Erro ao enviar email de teste:", response.error);
      return false;
    }

    console.log(`✅ Email de teste enviado para ${testEmail}`);
    console.log(`   ID Resend: ${response.data?.id}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de teste:", error);
    return false;
  }
};
