import React, { useState, useEffect } from 'react';
import { VictorOwlBoard } from './VictorOwlBoard';
import { useCloudSync } from '../context/CloudSyncContext';
import { 
  Terminal, 
  LayoutList, 
  Lightbulb, 
  FileText, 
  Link2, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowLeftRight
} from 'lucide-react';

interface VictorStandaloneAppProps {
  /** True when opened directly via ?app=victor or #victor (total isolation, zero link back to other apps) */
  isDirectIsolatedUrl: boolean;
  /** Callback to return to the App Hub (only available when NOT in direct isolated URL) */
  onBackToHub?: () => void;
}

export const VictorStandaloneApp: React.FC<VictorStandaloneAppProps> = ({
  isDirectIsolatedUrl,
  onBackToHub
}) => {
  const [activeSection, setActiveSection] = useState<'board' | 'backlog' | 'print'>('board');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [simulateVictorView, setSimulateVictorView] = useState<boolean>(false);
  const { activeTeamCode } = useCloudSync();

  const hideAdminControls = isDirectIsolatedUrl || simulateVictorView;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'OWL SYSTEM · Tablero de Desarrollo — Víctor | DIVO';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const handleCopyVictorLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'victor');
    url.searchParams.set('key', activeTeamCode || 'DIVO-OWL');
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = url.toString();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Admin / Coty Bar (ONLY visible when Coty enters from Hub, completely absent on ?app=victor) */}
      {!hideAdminControls && (
        <div className="bg-cyan-950/50 border-b border-cyan-500/20 px-4 py-2 text-xs text-cyan-200 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-cyan-300">App Independiente de Víctor:</span>
              <span className="text-neutral-300 hidden sm:inline">
                Esta aplicación está separada del flujograma. Al compartir su link directo, Víctor solo accede a este entorno.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyVictorLink}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">¡Link exclusivo copiado!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Copiar Link Exclusivo de Víctor</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSimulateVictorView(true)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                title="Ver exactamente cómo la recibe Víctor sin barra de cambio de app"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ver modo aislado</span>
              </button>

              {onBackToHub && (
                <button
                  onClick={onBackToHub}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Cambiar de App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating button to exit simulated isolated preview (only if Coty turned on simulateVictorView) */}
      {!isDirectIsolatedUrl && simulateVictorView && (
        <button
          onClick={() => setSimulateVictorView(false)}
          className="fixed bottom-5 left-5 z-50 px-3.5 py-2 rounded-xl bg-neutral-900/95 hover:bg-neutral-800 text-cyan-200 border border-cyan-500/40 shadow-xl text-xs font-semibold flex items-center gap-2 cursor-pointer no-print"
        >
          <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
          <span>Salir de vista previa de Víctor</span>
        </button>
      )}

      {/* Dedicated Standalone Header for OWL SYSTEM App */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* OWL System Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-neutral-950 font-bold ring-1 ring-cyan-300/40">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono tracking-[0.2em] text-base sm:text-lg font-bold text-cyan-200">
                  OWL SYSTEM
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-wider">
                  Tablero de Víctor
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                Plataforma Exclusiva de Requerimientos, Sprints & Evolución · DIVO
              </p>
            </div>
          </div>

          {/* Internal App Navigation */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveSection('board')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'board'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solicitudes Activas</span>
            </button>

            <button
              onClick={() => setActiveSection('backlog')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'backlog'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backlog de Ideas (10)</span>
            </button>

            <button
              onClick={() => setActiveSection('print')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'print'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Minuta Imprimible</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 sm:py-8">
        <VictorOwlBoard
          activeSection={activeSection}
          onNavigateSection={setActiveSection}
        />
      </main>

      {/* Dedicated Standalone Footer */}
      <footer className="no-print mt-auto border-t border-neutral-900 bg-neutral-950/80 px-4 py-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono tracking-widest text-cyan-300 font-bold">
              OWL SYSTEM
            </span>
            <span className="text-neutral-600">·</span>
            <span>Tablero Independiente de Desarrollo para Víctor</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500 text-[11px] font-mono">
            <span>Solicitantes: Coty & Yasmín</span>
            <span>Módulos: Agenda · Mensajería · Catálogo · Reportes</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
