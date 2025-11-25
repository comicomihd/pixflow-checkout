/**
 * Validadores para dados de entrada
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone (Brasil)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+55)?(\d{2})(\d{4,5})(\d{4})$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF[9]) !== firstDigit) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCPF[10]) === secondDigit;
};

/**
 * Valida URL
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida dados de cliente
 */
export const validateCustomerData = (data: {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push({
      field: "name",
      message: "Nome deve ter pelo menos 3 caracteres",
    });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Email inválido",
    });
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({
      field: "phone",
      message: "Telefone inválido",
    });
  }

  if (data.cpf && !validateCPF(data.cpf)) {
    errors.push({
      field: "cpf",
      message: "CPF inválido",
    });
  }

  return errors;
};

/**
 * Valida dados de campanha
 */
export const validateCampaignData = (data: {
  name?: string;
  subject?: string;
  content?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push({
      field: "name",
      message: "Nome da campanha deve ter pelo menos 3 caracteres",
    });
  }

  if (!data.subject || data.subject.trim().length < 5) {
    errors.push({
      field: "subject",
      message: "Assunto deve ter pelo menos 5 caracteres",
    });
  }

  if (!data.content || data.content.trim().length < 10) {
    errors.push({
      field: "content",
      message: "Conteúdo deve ter pelo menos 10 caracteres",
    });
  }

  return errors;
};

/**
 * Valida dados de webhook
 */
export const validateWebhookData = (data: {
  url?: string;
  event?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.url || !validateURL(data.url)) {
    errors.push({
      field: "url",
      message: "URL do webhook inválida",
    });
  }

  if (!data.event || data.event.trim().length === 0) {
    errors.push({
      field: "event",
      message: "Evento é obrigatório",
    });
  }

  return errors;
};

/**
 * Sanitiza string para prevenir XSS
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Valida força de senha
 */
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("Mínimo 8 caracteres");

  if (password.length >= 12) score++;
  else feedback.push("Mínimo 12 caracteres para força máxima");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Adicione letras minúsculas");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Adicione letras maiúsculas");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Adicione números");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Adicione caracteres especiais");

  return { score, feedback };
};

/**
 * Valida taxa de limite (rate limiting)
 */
export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number
): boolean => {
  const now = Date.now();
  const storageKey = `rate_limit_${key}`;
  
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const { count = 0, resetTime = now } = data;

    if (now > resetTime) {
      // Janela expirou, reset
      localStorage.setItem(
        storageKey,
        JSON.stringify({ count: 1, resetTime: now + windowMs })
      );
      return true;
    }

    if (count >= limit) {
      return false;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({ count: count + 1, resetTime })
    );
    return true;
  } catch {
    return true;
  }
};
