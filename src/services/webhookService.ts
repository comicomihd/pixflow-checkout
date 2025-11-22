import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WebhookPayload {
  event: 'payment.created' | 'payment.confirmed' | 'payment.failed' | 'delivery.completed';
  timestamp: string;
  data: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  user_id: string;
  event_type: string;
  url: string;
  active: boolean;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  status_code: number;
  response: string;
  created_at: string;
}

class WebhookService {
  /**
   * Registrar novo webhook
   */
  async registerWebhook(
    userId: string,
    eventType: string,
    url: string
  ): Promise<WebhookEvent | null> {
    try {
      // Validar URL
      if (!this.isValidUrl(url)) {
        toast.error('URL inválida');
        return null;
      }

      // Gerar secret
      const secret = this.generateSecret();

      const { data, error } = await supabase
        .from('webhooks')
        .insert([
          {
            user_id: userId,
            event_type: eventType,
            url,
            secret,
            active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar webhook:', error);
        toast.error('Erro ao registrar webhook');
        return null;
      }

      toast.success('Webhook registrado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar webhook');
      return null;
    }
  }

  /**
   * Listar webhooks do usuário
   */
  async listWebhooks(userId: string): Promise<WebhookEvent[]> {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar webhooks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }

  /**
   * Atualizar webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<WebhookEvent>
  ): Promise<WebhookEvent | null> {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', webhookId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar webhook:', error);
        toast.error('Erro ao atualizar webhook');
        return null;
      }

      toast.success('Webhook atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar webhook');
      return null;
    }
  }

  /**
   * Deletar webhook
   */
  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) {
        console.error('Erro ao deletar webhook:', error);
        toast.error('Erro ao deletar webhook');
        return false;
      }

      toast.success('Webhook deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao deletar webhook');
      return false;
    }
  }

  /**
   * Testar webhook
   */
  async testWebhook(webhookId: string): Promise<boolean> {
    try {
      const webhook = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (webhook.error || !webhook.data) {
        toast.error('Webhook não encontrado');
        return false;
      }

      const testPayload: WebhookPayload = {
        event: 'payment.created',
        timestamp: new Date().toISOString(),
        data: {
          id: 'test-123',
          amount: 100.0,
          status: 'pending',
        },
      };

      const success = await this.sendWebhook(
        webhook.data.url,
        webhook.data.secret,
        testPayload
      );

      if (success) {
        toast.success('Webhook testado com sucesso!');
      } else {
        toast.error('Erro ao testar webhook');
      }

      return success;
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao testar webhook');
      return false;
    }
  }

  /**
   * Enviar webhook
   */
  async sendWebhook(
    url: string,
    secret: string,
    payload: WebhookPayload
  ): Promise<boolean> {
    try {
      // Gerar signature
      const signature = this.generateSignature(payload, secret);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp,
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      return false;
    }
  }

  /**
   * Registrar log de webhook
   */
  async logWebhookAttempt(
    webhookId: string,
    eventType: string,
    statusCode: number,
    response: string
  ): Promise<void> {
    try {
      await supabase.from('webhook_logs').insert([
        {
          webhook_id: webhookId,
          event_type: eventType,
          status_code: statusCode,
          response,
        },
      ]);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }

  /**
   * Listar logs de webhook
   */
  async listWebhookLogs(webhookId: string, limit: number = 50): Promise<WebhookLog[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao listar logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }

  /**
   * Disparar evento de webhook
   */
  async triggerWebhookEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      // Buscar webhooks ativos para este evento
      const webhooks = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', eventType)
        .eq('active', true);

      if (webhooks.error || !webhooks.data) {
        return;
      }

      // Enviar para cada webhook
      for (const webhook of webhooks.data) {
        const payload: WebhookPayload = {
          event: eventType as any,
          timestamp: new Date().toISOString(),
          data: eventData,
        };

        const success = await this.sendWebhook(
          webhook.url,
          webhook.secret,
          payload
        );

        // Registrar tentativa
        await this.logWebhookAttempt(
          webhook.id,
          eventType,
          success ? 200 : 500,
          success ? 'OK' : 'Failed'
        );
      }
    } catch (error) {
      console.error('Erro ao disparar evento:', error);
    }
  }

  /**
   * Validar assinatura de webhook
   */
  validateSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(JSON.parse(payload), secret);
    return signature === expectedSignature;
  }

  /**
   * Gerar assinatura HMAC
   */
  private generateSignature(payload: any, secret: string): string {
    const message = JSON.stringify(payload);
    // Nota: Em produção, use crypto.subtle.sign com HMAC-SHA256
    // Este é um exemplo simplificado
    return btoa(`${message}:${secret}`);
  }

  /**
   * Gerar secret aleatório
   */
  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validar URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}

export const webhookService = new WebhookService();
