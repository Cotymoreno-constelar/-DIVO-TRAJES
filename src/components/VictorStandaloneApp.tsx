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
  ArrowLeftRight,
  BarChart3,
  Menu,
  X
} from 'lucide-react';

type VictorSection = 'board' | 'reports_spec' | 'backlog' | 'print';

interface VictorStandaloneAppProps {
  /** True when opened directly via ?app=victor or #victor (total isolation, zero link back to other apps) */
  isDirectIsolatedUrl: boolean;
  /** Callback to return to the App Hub (only available when NOT in direct isolated URL) */
  onBackToHub?: () => void;
}

const VICTOR_SECTIONS: { id: VictorSection; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'board', label: 'Solicitudes Activas', shortLabel: 'Solicitudes', icon: LayoutList },
  { id: 'reports_spec', label: 'Plan Reportes & Campos (37)', shortLabel: 'Reportes (37)', icon: BarChart3 },
  { id: 'backlog', label: 'Backlog de Ideas (10)', shortLabel: 'Backlog (10)', icon: Lightbulb },
  { id: 'print', label: 'Minuta Imprimible', shortLabel: 'Imprimible', icon: FileText },
];

export const VictorStandaloneApp: React.FC<VictorStandaloneAppProps> = ({
  isDirectIsolatedUrl,
  onBackToHub
}) => {
  const [activeSection, setActiveSection] = useState<VictorSection>('board');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [simulateVictorView, setSimulateVictorView] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { activeTeamCode } = useCloudSync();

  const hideAdminControls = isDirectIsolatedUrl || simulateVictorView;
  const activeItem = VICTOR_SECTIONS.find((s) => s.id === activeSection) || VICTOR_SECTIONS[0];

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
        <div className="bg-cyan-950/50 border-b border-cyan-500/20 px-3 sm:px-4 py-2 text-xs text-cyan-200 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-semibold text-cyan-300 truncate">App Independiente de Víctor</span>
              <span className="text-neutral-300 hidden lg:inline">
                · Separada del flujograma. Al compartir su link directo, Víctor solo accede a este entorno.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyVictorLink}
                className="flex-1 sm:flex-initial min-h-[36px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">¡Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Copiar Link de Víctor</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSimulateVictorView(true)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] whitespace-nowrap"
                title="Ver exactamente cómo la recibe Víctor sin barra de cambio de app"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Ver modo aislado</span>
                <span className="sm:hidden">Aislado</span>
              </button>

              {onBackToHub && (
                <button
                  onClick={onBackToHub}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] whitespace-nowrap"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Cambiar de App</span>
                  <span className="sm:hidden">Apps</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating button to exit simulated isolated preview */}
      {!isDirectIsolatedUrl && simulateVictorView && (
        <button
          onClick={() => setSimulateVictorView(false)}
          className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 min-h-[44px] px-4 py-2 rounded-xl bg-neutral-900/95 hover:bg-neutral-800 text-cyan-200 border border-cyan-500/40 shadow-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer no-print"
        >
          <EyeOff className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Salir de vista previa de Víctor</span>
        </button>
      )}

      {/* Dedicated Standalone Header for OWL SYSTEM App (Compact single row on mobile <=15% height) */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 lg:px-8 py-2 lg:py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* OWL System Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-neutral-950 font-bold ring-1 ring-cyan-300/40 shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono tracking-[0.16em] sm:tracking-[0.2em] text-sm sm:text-lg font-bold text-cyan-200 truncate">
                  OWL SYSTEM
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-wider shrink-0">
                  Víctor
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans truncate">
                <span className="lg:hidden text-cyan-200/90 font-medium">{activeItem.label}</span>
                <span className="hidden lg:inline">Plataforma Exclusiva de Requerimientos, Sprints & Evolución · DIVO</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation (lg+) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {VICTOR_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Drawer Toggle (< lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden min-h-[42px] min-w-[42px] rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-cyan-200 flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Abrir secciones del tablero"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

        {/* Slide-down Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2.5 pt-2.5 border-t border-neutral-800/90 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pb-1">
            {VICTOR_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                      : 'bg-neutral-900/70 text-neutral-300 border border-neutral-800 hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Non-sticky Quick Section Strip on Mobile/Tablet (< lg) */}
      <div className="lg:hidden bg-neutral-950 border-b border-neutral-900 px-3 sm:px-6 py-2 no-print">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {VICTOR_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800/80 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{sec.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <VictorOwlBoard
          activeSection={activeSection}
          onNavigateSection={setActiveSection}
        />
      </main>

      {/* Dedicated Standalone Footer */}
      <footer className="no-print mt-auto border-t border-neutral-900 bg-neutral-950/80 px-4 py-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <span className="font-mono tracking-widest text-cyan-300 font-bold">
              OWL SYSTEM
            </span>
            <span className="text-neutral-600 hidden sm:inline">·</span>
            <span>Tablero Independiente de Desarrollo para Víctor</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-neutral-500 text-[11px] font-mono">
            <span>Solicitantes: Coty & Yasmín</span>
            <span className="hidden sm:inline text-neutral-700">·</span>
            <span>Sistemas: Owl (CRM) · Sly Soft (Facturación) · Kommo</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
