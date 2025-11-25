import React, { Component, ReactNode } from 'react';
import { errorLogger } from '@/services/errorLogger';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary para capturar erros em componentes React
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Registrar erro
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log do erro
    errorLogger.logUncaughtError(error, errorInfo);

    // Callback customizado
    this.props.onError?.(error, errorInfo);

    // Log no console em desenvolvimento
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Algo deu errado</h1>
              <p className="text-muted-foreground">
                Desculpe, ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted rounded-lg p-4 space-y-2 max-h-48 overflow-auto">
                <h3 className="font-semibold text-sm">Detalhes do Erro:</h3>
                <p className="text-xs font-mono text-red-600">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Error Count */}
            {this.state.errorCount > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Múltiplos erros detectados ({this.state.errorCount}). 
                  Se o problema persistir, tente recarregar a página.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar para Início
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
            </div>

            {/* Support */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Se o problema persistir, entre em contato com o suporte.</p>
              <p className="mt-2">
                ID do Erro: <code className="bg-muted px-1 py-0.5 rounded">{this.state.error?.message?.slice(0, 8)}</code>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
