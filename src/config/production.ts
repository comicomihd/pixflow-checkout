/**
 * Configurações de Produção
 * Valida e carrega todas as variáveis de ambiente necessárias
 */

interface ProductionConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  resend: {
    apiKey: string;
  };
  whatsapp: {
    token: string;
    phoneId: string;
    businessAccountId: string;
  };
  webhook: {
    secret: string;
  };
  efi: {
    clientId: string;
    clientSecret: string;
    certificate: string;
    sandbox: boolean;
  };
  environment: "development" | "production";
  apiUrl: string;
  testMode: boolean;
  pixels: {
    facebook?: string;
    googleAnalytics?: string;
    googleAds?: string;
    tiktok?: string;
  };
}

/**
 * Valida se uma variável de ambiente existe
 */
const getEnvVar = (key: string, required = false): string => {
  const value = import.meta.env[`VITE_${key}`];
  
  if (required && !value) {
    throw new Error(`Variável de ambiente VITE_${key} é obrigatória em produção`);
  }
  
  return value || "";
};

/**
 * Carrega configuração de produção
 */
export const loadProductionConfig = (): ProductionConfig => {
  const environment = (getEnvVar("ENVIRONMENT", false) || "development") as "development" | "production";
  
  // Em produção, todas as chaves são obrigatórias
  const isProduction = environment === "production";

  return {
    supabase: {
      url: getEnvVar("SUPABASE_URL", isProduction),
      anonKey: getEnvVar("SUPABASE_ANON_KEY", isProduction),
    },
    resend: {
      apiKey: getEnvVar("RESEND_API_KEY", false) || "re_bdEHRYQu_5MMgQnr1e7KEvK9LoudtZQNq",
    },
    whatsapp: {
      token: getEnvVar("WHATSAPP_TOKEN", false),
      phoneId: getEnvVar("WHATSAPP_PHONE_ID", false),
      businessAccountId: getEnvVar("WHATSAPP_BUSINESS_ACCOUNT_ID", false),
    },
    webhook: {
      secret: getEnvVar("WEBHOOK_SECRET", false) || "a7f9e2c1b4d8f3a6e9c2b5d8f1a4e7c0",
    },
    efi: {
      clientId: getEnvVar("EFI_CLIENT_ID", false),
      clientSecret: getEnvVar("EFI_CLIENT_SECRET", false),
      certificate: getEnvVar("EFI_CERTIFICATE", false),
      sandbox: getEnvVar("EFI_SANDBOX", false) === "true",
    },
    environment,
    apiUrl: getEnvVar("API_URL", isProduction),
    testMode: getEnvVar("TEST_MODE", false) === "true",
    pixels: {
      facebook: getEnvVar("FACEBOOK_PIXEL_ID", false),
      googleAnalytics: getEnvVar("GOOGLE_ANALYTICS_ID", false),
      googleAds: getEnvVar("GOOGLE_ADS_ID", false),
      tiktok: getEnvVar("TIKTOK_PIXEL_ID", false),
    },
  };
};

/**
 * Obtém configuração global
 */
let config: ProductionConfig | null = null;

export const getConfig = (): ProductionConfig => {
  if (!config) {
    config = loadProductionConfig();
  }
  return config;
};

/**
 * Valida se está em produção
 */
export const isProduction = (): boolean => {
  return getConfig().environment === "production";
};

/**
 * Valida se WhatsApp está configurado
 */
export const isWhatsAppConfigured = (): boolean => {
  const cfg = getConfig();
  return !!(cfg.whatsapp.token && cfg.whatsapp.phoneId);
};
