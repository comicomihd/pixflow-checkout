import { supabase } from "@/integrations/supabase/client";

interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  headers?: Record<string, string>;
  created_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  status: "success" | "failed" | "pending";
  status_code?: number;
  response?: string;
  error?: string;
  attempt: number;
  created_at: string;
}

/**
 * Gera assinatura HMAC para validar autenticidade do webhook
 */
export const generateWebhookSignature = async (payload: string, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Valida se a URL é segura (HTTPS em produção)
 */
export const isValidWebhookUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Em produção, exigir HTTPS
    if (process.env.NODE_ENV === "production" && urlObj.protocol !== "https:") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Envia webhook com retry automático
 */
export const sendWebhook = async (
  webhook: Webhook,
  payload: WebhookPayload,
  attempt: number = 1,
  maxAttempts: number = 5
): Promise<boolean> => {
  const maxRetries = maxAttempts;
  const secret = process.env.VITE_WEBHOOK_SECRET || "webhook-secret";

  try {
    // Validar URL
    if (!isValidWebhookUrl(webhook.url)) {
      await logWebhookAttempt(webhook.id, payload.event, "failed", 0, "URL inválida", attempt);
      return false;
    }

    const payloadString = JSON.stringify(payload);
    const signature = await generateWebhookSignature(payloadString, secret);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signature,
      "X-Webhook-ID": webhook.id,
      "X-Webhook-Event": payload.event,
      "X-Webhook-Timestamp": payload.timestamp,
      ...webhook.headers,
    };

    // Implementar timeout manualmente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (response.ok) {
      await logWebhookAttempt(
        webhook.id,
        payload.event,
        "success",
        response.status,
        responseText,
        attempt
      );
      return true;
    } else {
      // Retry se status 5xx
      if (response.status >= 500 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Backoff exponencial
        setTimeout(() => {
          sendWebhook(webhook, payload, attempt + 1, maxRetries);
        }, delay);
      }

      await logWebhookAttempt(
        webhook.id,
        payload.event,
        "failed",
        response.status,
        responseText,
        attempt
      );
      return false;
    }
  } catch (error: any) {
    const errorMessage = error.message || "Erro desconhecido";

    // Retry em caso de erro de rede
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt - 1) * 1000;
      setTimeout(() => {
        sendWebhook(webhook, payload, attempt + 1, maxRetries);
      }, delay);
    }

    await logWebhookAttempt(webhook.id, payload.event, "failed", 0, errorMessage, attempt);
    return false;
  }
};

/**
 * Registra tentativa de webhook
 */
export const logWebhookAttempt = async (
  webhookId: string,
  event: string,
  status: "success" | "failed" | "pending",
  statusCode: number | undefined,
  response: string,
  attempt: number
): Promise<void> => {
  try {
    // Salvar em localStorage como fallback
    const logs = JSON.parse(localStorage.getItem("webhook_logs") || "[]");
    logs.push({
      id: `log-${Date.now()}`,
      webhook_id: webhookId,
      event,
      status,
      status_code: statusCode,
      response: response.substring(0, 500), // Limitar tamanho
      attempt,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("webhook_logs", JSON.stringify(logs.slice(-100))); // Manter últimos 100
  } catch (error) {
    console.error("Erro ao registrar webhook log:", error);
  }
};

/**
 * Dispara webhook para todos os webhooks ativos que escutam o evento
 */
export const triggerWebhooks = async (
  event: string,
  data: Record<string, any>
): Promise<void> => {
  try {
    // Carregar webhooks do localStorage
    const webhooksData = localStorage.getItem("webhooks");
    if (!webhooksData) return;

    const webhooks: Webhook[] = JSON.parse(webhooksData);
    const payload: WebhookPayload = {
      id: `event-${Date.now()}`,
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Disparar webhooks ativos que escutam este evento
    const activeWebhooks = webhooks.filter(
      (w) => w.active && w.events.includes(event)
    );

    for (const webhook of activeWebhooks) {
      // Disparar de forma assíncrona sem bloquear
      sendWebhook(webhook, payload).catch((error) => {
        console.error(`Erro ao disparar webhook ${webhook.id}:`, error);
      });
    }
  } catch (error) {
    console.error("Erro ao disparar webhooks:", error);
  }
};

/**
 * Obtém logs de webhooks
 */
export const getWebhookLogs = (webhookId?: string): WebhookLog[] => {
  try {
    const logs = JSON.parse(localStorage.getItem("webhook_logs") || "[]");
    if (webhookId) {
      return logs.filter((log: WebhookLog) => log.webhook_id === webhookId);
    }
    return logs;
  } catch {
    return [];
  }
};

/**
 * Limpa logs antigos
 */
export const cleanOldLogs = (daysToKeep: number = 30): void => {
  try {
    const logs = JSON.parse(localStorage.getItem("webhook_logs") || "[]");
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filtered = logs.filter((log: WebhookLog) => {
      return new Date(log.created_at) > cutoffDate;
    });

    localStorage.setItem("webhook_logs", JSON.stringify(filtered));
  } catch (error) {
    console.error("Erro ao limpar logs:", error);
  }
};
