/**
 * Serviço de logging de erros
 * Registra erros em arquivo de log e no console
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByPage: Record<string, number>;
  lastError?: ErrorLog;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 1000;
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log de erro
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, any>
  ): void {
    const log = this.createLog('error', message, error, context);
    this.addLog(log);
    this.logToConsole('error', log);
    this.sendToServer(log);
  }

  /**
   * Log de aviso
   */
  warning(
    message: string,
    context?: Record<string, any>
  ): void {
    const log = this.createLog('warning', message, undefined, context);
    this.addLog(log);
    this.logToConsole('warn', log);
  }

  /**
   * Log de informação
   */
  info(
    message: string,
    context?: Record<string, any>
  ): void {
    const log = this.createLog('info', message, undefined, context);
    this.addLog(log);
    this.logToConsole('info', log);
  }

  /**
   * Log de debug
   */
  debug(
    message: string,
    context?: Record<string, any>
  ): void {
    if (this.isDevelopment) {
      const log = this.createLog('debug', message, undefined, context);
      this.addLog(log);
      this.logToConsole('debug', log);
    }
  }

  /**
   * Log de erro não capturado
   */
  logUncaughtError(error: Error, errorInfo?: { componentStack: string }): void {
    this.error('Uncaught Error', error, {
      componentStack: errorInfo?.componentStack,
      type: 'uncaught',
    });
  }

  /**
   * Log de erro de promise não capturada
   */
  logUnhandledRejection(reason: any): void {
    this.error('Unhandled Promise Rejection', reason, {
      type: 'unhandled-rejection',
    });
  }

  /**
   * Obter todos os logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Obter logs filtrados
   */
  getLogsByLevel(level: string): ErrorLog[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Obter logs dos últimos N minutos
   */
  getRecentLogs(minutes: number = 60): ErrorLog[] {
    const cutoffTime = Date.now() - minutes * 60 * 1000;
    return this.logs.filter(
      (log) => new Date(log.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Obter métricas de erros
   */
  getMetrics(): ErrorMetrics {
    const metrics: ErrorMetrics = {
      totalErrors: this.logs.filter((l) => l.level === 'error').length,
      errorsByType: {},
      errorsByPage: {},
    };

    for (const log of this.logs) {
      if (log.level === 'error') {
        const type = log.context?.type || 'unknown';
        metrics.errorsByType[type] = (metrics.errorsByType[type] || 0) + 1;

        const page = log.url || 'unknown';
        metrics.errorsByPage[page] = (metrics.errorsByPage[page] || 0) + 1;
      }
    }

    const errorLogs = this.logs.filter((l) => l.level === 'error');
    if (errorLogs.length > 0) {
      metrics.lastError = errorLogs[errorLogs.length - 1];
    }

    return metrics;
  }

  /**
   * Limpar logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Exportar logs como JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Exportar logs como CSV
   */
  exportLogsAsCSV(): string {
    if (this.logs.length === 0) {
      return 'No logs to export';
    }

    const headers = ['Timestamp', 'Level', 'Message', 'Context', 'Stack'];
    const rows = this.logs.map((log) => [
      log.timestamp,
      log.level,
      log.message,
      JSON.stringify(log.context || {}),
      log.stack || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csv;
  }

  /**
   * Download logs como arquivo
   */
  downloadLogs(format: 'json' | 'csv' = 'json'): void {
    const content = format === 'json' ? this.exportLogs() : this.exportLogsAsCSV();
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Criar log
   */
  private createLog(
    level: 'error' | 'warning' | 'info' | 'debug',
    message: string,
    error?: Error | unknown,
    context?: Record<string, any>
  ): ErrorLog {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message: `${message}${errorMessage ? ': ' + errorMessage : ''}`,
      stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Adicionar log
   */
  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Manter apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Salvar em localStorage
    this.saveToLocalStorage();
  }

  /**
   * Log no console
   */
  private logToConsole(
    level: 'error' | 'warn' | 'info' | 'debug',
    log: ErrorLog
  ): void {
    const style = this.getConsoleStyle(log.level);
    console[level](
      `%c[${log.level.toUpperCase()}] ${log.message}`,
      style,
      log.context || {}
    );

    if (log.stack) {
      console.log(log.stack);
    }
  }

  /**
   * Estilo do console
   */
  private getConsoleStyle(level: string): string {
    const styles: Record<string, string> = {
      error: 'color: #ff4444; font-weight: bold;',
      warning: 'color: #ffaa00; font-weight: bold;',
      info: 'color: #0066cc; font-weight: bold;',
      debug: 'color: #666666; font-weight: normal;',
    };
    return styles[level] || '';
  }

  /**
   * Enviar para servidor (implementar conforme necessário)
   */
  private sendToServer(log: ErrorLog): void {
    // Implementar envio para servidor de logging
    // Exemplo: Sentry, LogRocket, etc.
    if (this.isDevelopment) {
      return; // Não enviar em desenvolvimento
    }

    // Aqui você pode enviar para seu servidor
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(log) });
  }

  /**
   * Salvar em localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const recentLogs = this.getRecentLogs(24 * 60); // Últimas 24 horas
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (error) {
      // Ignorar erros de localStorage
    }
  }

  /**
   * Carregar de localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('errorLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      // Ignorar erros de localStorage
    }
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const errorLogger = new ErrorLogger();

// Carregar logs do localStorage ao iniciar
errorLogger.loadFromLocalStorage();

// Registrar erros não capturados
window.addEventListener('error', (event) => {
  errorLogger.logUncaughtError(event.error, {
    componentStack: event.filename,
  });
});

// Registrar rejeições de promise não capturadas
window.addEventListener('unhandledrejection', (event) => {
  errorLogger.logUnhandledRejection(event.reason);
});
