import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'Ocurrió un error inesperado.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (parsed.error.includes('Quota exceeded')) {
          readable =
            'Se alcanzó el límite diario gratuito de lecturas/escrituras de la base de datos. La cuota se restablece mañana.';
        } else if (parsed.error.includes('Missing or insufficient permissions')) {
          readable =
            'No tenés permisos suficientes para realizar esta operación en la base de datos compartida.';
        } else {
          readable = parsed.error;
        }
      }
    } catch {
      // Plain text error
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-6 rounded-3xl bg-neutral-900 border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-300">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-xl font-bold">Aviso del Sistema</h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
