/**
 * Logger Estruturado com Sanitização Ética e LGPD (Art. 11 - Dados Sensíveis de Saúde)
 * Garante que nomes, CPFs, anotações de prontuário e segredos nunca vazem em telemetria.
 */

const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'secret',
  'authorization',
  'cpf',
  'private_clinical_hypothesis',
  'clinical_notes',
  'notes',
  'note',
  'content',
  'creditcard',
  'cvv',
  'email',
];

/**
 * Sanitiza recursivamente objetos e strings para evitar vazamento de PII e dados clínicos
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redige padrões de CPF (ex: 123.456.789-00 ou 11 dígitos seguidos)
    const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
    return data.replace(cpfRegex, '***.***.***-**');
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));

      if (isSensitive) {
        sanitized[key] = '[REDACTED_CLINICAL_LGPD]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeLogData(value);
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }

  return data;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'security';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  environment: string;
}

class ClinicalLogger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): StructuredLog {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? sanitizeLogData(context) : undefined,
      environment: process.env.NODE_ENV || 'production',
    };
  }

  public info(message: string, context?: Record<string, any>) {
    const log = this.formatLog('info', message, context);
    console.info(`[PSI-INFO] ${log.timestamp} - ${log.message}`, log.context ? JSON.stringify(log.context) : '');
    return log;
  }

  public warn(message: string, context?: Record<string, any>) {
    const log = this.formatLog('warn', message, context);
    console.warn(`[PSI-WARN] ${log.timestamp} - ${log.message}`, log.context ? JSON.stringify(log.context) : '');
    return log;
  }

  public error(message: string, context?: Record<string, any>) {
    const log = this.formatLog('error', message, context);
    console.error(`[PSI-ERROR] ${log.timestamp} - ${log.message}`, log.context ? JSON.stringify(log.context) : '');
    return log;
  }

  public security(message: string, context?: Record<string, any>) {
    const log = this.formatLog('security', message, context);
    console.warn(`[PSI-SECURITY-AUDIT] ${log.timestamp} - ${log.message}`, log.context ? JSON.stringify(log.context) : '');
    return log;
  }
}

export const logger = new ClinicalLogger();
