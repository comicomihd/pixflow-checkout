/**
 * Serviço de Integração WhatsApp Business API
 */

import { getConfig, isWhatsAppConfigured } from "@/config/production";

interface WhatsAppConfig {
  token: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface WhatsAppMessage {
  to: string;
  message: string;
  type: "text" | "template" | "media";
}

let whatsappConfig: WhatsAppConfig | null = null;

/**
 * Configura as credenciais do WhatsApp
 */
export const configureWhatsApp = (config: WhatsAppConfig) => {
  whatsappConfig = config;
  localStorage.setItem("whatsapp_config", JSON.stringify(config));
};

/**
 * Obtém configuração do WhatsApp
 */
export const getWhatsAppConfig = (): WhatsAppConfig | null => {
  if (whatsappConfig) return whatsappConfig;
  
  // Tenta carregar de variáveis de ambiente primeiro
  const envConfig = getConfig();
  if (envConfig.whatsapp.token && envConfig.whatsapp.phoneId) {
    whatsappConfig = {
      token: envConfig.whatsapp.token,
      phoneNumberId: envConfig.whatsapp.phoneId,
      businessAccountId: envConfig.whatsapp.businessAccountId,
    };
    return whatsappConfig;
  }
  
  // Fallback para localStorage
  try {
    const saved = localStorage.getItem("whatsapp_config");
    if (saved) {
      whatsappConfig = JSON.parse(saved);
      return whatsappConfig;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Envia mensagem de texto via WhatsApp
 */
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  const config = getWhatsAppConfig();
  
  if (!config) {
    console.error("WhatsApp não configurado");
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber.replace(/\D/g, ""),
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Erro ao enviar WhatsApp:", response.statusText);
      return false;
    }

    const data = await response.json();
    console.log("✅ Mensagem WhatsApp enviada:", data.messages[0].id);
    
    // Registrar log
    const logs = JSON.parse(localStorage.getItem("whatsapp_logs") || "[]");
    logs.push({
      id: data.messages[0].id,
      to: phoneNumber,
      message,
      status: "sent",
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("whatsapp_logs", JSON.stringify(logs.slice(-100)));
    
    return true;
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error);
    return false;
  }
};

/**
 * Envia mensagem com template
 */
export const sendWhatsAppTemplate = async (
  phoneNumber: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<boolean> => {
  const config = getWhatsAppConfig();
  
  if (!config) {
    console.error("WhatsApp não configurado");
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber.replace(/\D/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: {
              code: "pt_BR",
            },
            parameters: {
              body: {
                parameters: Object.values(parameters),
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Erro ao enviar template:", response.statusText);
      return false;
    }

    const data = await response.json();
    console.log("✅ Template WhatsApp enviado:", data.messages[0].id);
    return true;
  } catch (error) {
    console.error("Erro ao enviar template:", error);
    return false;
  }
};

/**
 * Envia mensagem para múltiplos contatos
 */
export const sendWhatsAppBulk = async (
  phoneNumbers: string[],
  message: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const phone of phoneNumbers) {
    const result = await sendWhatsAppMessage(phone, message);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Aguardar para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { success, failed };
};

/**
 * Personaliza mensagem com variáveis
 */
export const personalizeMessage = (
  template: string,
  variables: Record<string, string>
): string => {
  let message = template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return message;
};

/**
 * Obtém logs de mensagens WhatsApp
 */
export const getWhatsAppLogs = () => {
  try {
    return JSON.parse(localStorage.getItem("whatsapp_logs") || "[]");
  } catch {
    return [];
  }
};

/**
 * Testa conexão com WhatsApp API
 */
export const testWhatsAppConnection = async (): Promise<boolean> => {
  const config = getWhatsAppConfig();
  
  if (!config) {
    console.error("WhatsApp não configurado");
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.phoneNumberId}?fields=display_phone_number`,
      {
        headers: {
          "Authorization": `Bearer ${config.token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Erro na conexão:", response.statusText);
      return false;
    }

    const data = await response.json();
    console.log("✅ Conexão WhatsApp OK:", data.display_phone_number);
    return true;
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    return false;
  }
};
