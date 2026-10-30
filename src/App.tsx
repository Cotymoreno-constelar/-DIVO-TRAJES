/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, StrategyTab } from './components/Header';
import { InteractiveFlowchart } from './components/InteractiveFlowchart';
import { PaperInspector } from './components/PaperInspector';
import { WebArchitecture } from './components/WebArchitecture';
import { UXWritingLaboratory } from './components/UXWritingLaboratory';
import { TeamWorkplan } from './components/TeamWorkplan';
import { PrintableWorkPlan } from './components/PrintableWorkPlan';
import { CustomerJourneySimulator } from './components/CustomerJourneySimulator';
import { VictorStandaloneApp } from './components/VictorStandaloneApp';
import { StrategicPlanTracker } from './components/StrategicPlanTracker';
import { useCloudSync } from './context/CloudSyncContext';
import { 
  Sparkles, 
  Workflow, 
  Eye, 
  Terminal, 
  ArrowRight, 
  Link2, 
  Check, 
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';

type AppTarget = 'hub' | 'estrategia' | 'victor';

function detectInitialUrlApp(): { target: AppTarget; isDirectIsolatedUrl: boolean } {
  if (typeof window === 'undefined') {
    return { target: 'hub', isDirectIsolatedUrl: false };
  }
  const params = new URLSearchParams(window.location.search);
  const appParam = params.get('app')?.toLowerCase();
  const hash = window.location.hash.replace('#', '').replace('/', '').toLowerCase();
  const path = window.location.pathname.toLowerCase();

  if (appParam === 'victor' || hash === 'victor' || path.endsWith('/victor')) {
    return { target: 'victor', isDirectIsolatedUrl: true };
  }
  if (appParam === 'estrategia' || hash === 'estrategia' || path.endsWith('/estrategia')) {
    return { target: 'estrategia', isDirectIsolatedUrl: true };
  }
  return { target: 'hub', isDirectIsolatedUrl: false };
}

export default function App() {
  const initialRoute = detectInitialUrlApp();
  const [currentApp, setCurrentApp] = useState<AppTarget>(initialRoute.target);
  const [isDirectIsolatedUrl] = useState<boolean>(initialRoute.isDirectIsolatedUrl);

  // Strategy App state
  const [activeTab, setActiveTab] = useState<StrategyTab>('flujograma');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-web');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Copy link feedback on Hub
  const [copiedTarget, setCopiedTarget] = useState<'victor' | 'estrategia' | null>(null);
  const { activeTeamCode } = useCloudSync();

  const copyStandaloneUrl = async (appName: 'victor' | 'estrategia') => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', appName);
    url.searchParams.set('key', activeTeamCode || 'DIVO-OWL');
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      const input = document.createElement('input');
      input.value = url.toString();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedTarget(appName);
    setTimeout(() => setCopiedTarget(null), 3000);
  };

  // ============================================================================
  // APP SEPARADA 2: TABLERO EXCLUSIVO DE VÍCTOR (OWL SYSTEM)
  // ============================================================================
  if (currentApp === 'victor') {
    return (
      <VictorStandaloneApp
        isDirectIsolatedUrl={isDirectIsolatedUrl}
        onBackToHub={isDirectIsolatedUrl ? undefined : () => setCurrentApp('hub')}
      />
    );
  }

  // ============================================================================
  // APP SEPARADA 1: PLAN ESTRATÉGICO, FLUJOGRAMA & ARQUITECTURA WEB (COTY)
  // ============================================================================
  if (currentApp === 'estrategia') {
    const handlePrint = () => {
      setActiveTab('imprimible');
      setTimeout(() => {
        window.print();
      }, 200);
    };

    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        
        {/* Top Strategist Banner (Sin referencias ni pestañas del tablero de Víctor) */}
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-neutral-950 border-b border-amber-500/20 px-3 sm:px-4 py-2 text-xs text-amber-200 flex items-center justify-between no-print">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-serif font-semibold text-amber-300 truncate">
                Estrategia DIVO para Coty
              </span>
              <span className="text-neutral-300 hidden md:inline">
                · Flujograma operativo, arquitectura web y UX Writing (Aplicación independiente).
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <button
                onClick={() => setActiveTab('papel')}
                className="text-amber-300 hover:text-amber-100 underline decoration-amber-400/50 cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Ver tu papel original</span>
              </button>
              <span className="text-neutral-600">|</span>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="text-amber-300 hover:text-amber-100 underline decoration-amber-400/50 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simular viaje de cliente</span>
              </button>
              {!isDirectIsolatedUrl && (
                <>
                  <span className="text-neutral-600">|</span>
                  <button
                    onClick={() => setCurrentApp('hub')}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/30 cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Cambiar de App</span>
                  </button>
                </>
              )}
            </div>

            {!isDirectIsolatedUrl && (
              <button
                onClick={() => setCurrentApp('hub')}
                className="sm:hidden px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/30 cursor-pointer flex items-center gap-1 text-[11px] font-medium shrink-0"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Apps</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Strategy App Navigation Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onPrint={handlePrint}
          onSwitchApp={!isDirectIsolatedUrl ? () => setCurrentApp('hub') : undefined}
        />

        {/* Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {activeTab === 'flujograma' && (
            <InteractiveFlowchart
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          )}

          {activeTab === 'seguimiento' && (
            <StrategicPlanTracker variant="estrategia" />
          )}

          {activeTab === 'papel' && <PaperInspector />}

          {activeTab === 'arquitectura-web' && <WebArchitecture />}

          {activeTab === 'ux-writing' && <UXWritingLaboratory />}

          {activeTab === 'equipo' && <TeamWorkplan />}

          {activeTab === 'imprimible' && <PrintableWorkPlan />}
        </main>

        {/* Strategic Footer */}
        <footer className="no-print mt-auto border-t border-neutral-900 bg-neutral-950/80 px-4 py-6 text-xs text-neutral-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <span className="font-serif tracking-widest text-amber-300 font-bold">
                DIVO
              </span>
              <span className="text-neutral-600 hidden sm:inline">·</span>
              <span>Plan de Trabajo & Flujograma Operativo para Coty</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-neutral-400 text-[11px]">
              <span>Línea Concierge: 931-EMMA-292745</span>
              <span className="hidden sm:inline text-neutral-700">·</span>
              <span>Ateliers: Recta · R20 · S.V. · P. del Tejar · Villa María</span>
            </div>
          </div>
        </footer>

        {/* Journey Simulator Modal */}
        <CustomerJourneySimulator
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onJumpToNode={(nodeId) => {
            setSelectedNodeId(nodeId);
            setActiveTab('flujograma');
            setIsSimulatorOpen(false);
          }}
        />
      </div>
    );
  }

  // ============================================================================
  // SELECTOR INICIAL: 2 APLICACIONES SEPARADAS E INDEPENDIENTES
  // ============================================================================
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans px-4 py-6 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto my-auto space-y-6 sm:space-y-10 relative z-10">
        
        {/* Hub Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Entornos Separados · Ecosistema DIVO</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-neutral-100 tracking-tight">
            Dos Aplicaciones Independientes
          </h1>
          <p className="text-xs sm:text-base text-neutral-400 leading-relaxed">
            El <strong className="text-neutral-200 font-semibold">Tablero de Víctor (Sistema Owl)</strong> funciona como una aplicación independiente, separada del <strong className="text-neutral-200 font-semibold">Plan Estratégico y Flujograma de Coty</strong>. Cada una cuenta con su propio enlace aislado.
          </p>
        </div>

        {/* Two Independent App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: App Estrategia & Flujograma DIVO */}
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-amber-950/20 border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-2xl flex flex-col justify-between gap-5 sm:gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20 shrink-0">
                  <Workflow className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  App 1 · Dirección & Marca
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                  DIVO · Plan Estratégico & Seguimiento
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Aplicación para Coty y el equipo comercial: Flujograma interactivo, Seguimiento del Plan y los 27 Reportes (Owl + Sly Soft), Visor del Papel, Arquitectura Web, UX Writing, Organigrama y Papel Imprimible.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                <li>• Seguimiento en vivo de los 10 Campos Nuevos, 27 Reportes y 4 Etapas</li>
                <li>• Metas de negocio (1.000 notas/mes, Ticket $200k, Ausentismo ≤ 20%, Línea base 31/03)</li>
                <li>• Resoluciones de Dirección sincronizadas automáticamente en la nube</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setCurrentApp('estrategia')}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Abrir App Estratégica DIVO</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => copyStandaloneUrl('estrategia')}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedTarget === 'estrategia' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Link independiente copiado (?app=estrategia)</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Copiar Link Directo de App Estrategia</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: App Tablero de Víctor (OWL SYSTEM) */}
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-cyan-950/25 border border-cyan-500/40 hover:border-cyan-400/70 transition-all shadow-2xl flex flex-col justify-between gap-5 sm:gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-cyan-500/20 shrink-0">
                  <Terminal className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  App 2 · Sistemas & Dev
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-cyan-100">
                  OWL SYSTEM · Tablero de Víctor
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Aplicación 100% independiente dedicada al desarrollo de Owl y Sly Soft: incluye los 10 Campos Nuevos obligatorios, los 27 Reportes del plan de marketing, las solicitudes operativas y el Backlog de evolución.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                <li>• Link aislado para enviarle a Víctor con sincronización en la nube</li>
                <li>• Vistas propias: Solicitudes Activas, Plan de Reportes & Campos (37), Backlog y Minuta</li>
                <li>• Fechas límite, estados, fórmulas fijas y observaciones modificables en vivo</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setCurrentApp('victor')}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Abrir App Exclusiva de Víctor</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => copyStandaloneUrl('victor')}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-cyan-200 border border-cyan-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedTarget === 'victor' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">¡Link aislado para Víctor copiado! (?app=victor)</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Copiar Link Aislado para enviar a Víctor</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-500 pt-6 sm:pt-8 relative z-10">
        DIVO · Al abrir cualquiera de los enlaces directos (<span className="font-mono text-neutral-400">?app=victor</span> o <span className="font-mono text-neutral-400">?app=estrategia</span>), cada aplicación corre de manera aislada sin mostrar este selector.
      </div>
    </div>
  );
}
