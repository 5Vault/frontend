import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { logger } from "../utils/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => window.location.reload();
  handleGoHome = () => { window.location.href = "/"; };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>

            <h1 className="mb-2 text-xl font-bold text-white">
              Algo deu errado
            </h1>
            <p className="mb-6 text-sm text-zinc-400">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-black/40 p-3 text-left text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar página
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
