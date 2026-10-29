import React from 'react';
import { 
  Workflow, 
  FileText, 
  Layout, 
  PenTool, 
  Users, 
  Printer, 
  Play,
  Eye,
  BarChart3
} from 'lucide-react';

export type StrategyTab = 'flujograma' | 'seguimiento' | 'papel' | 'arquitectura-web' | 'ux-writing' | 'equipo' | 'imprimible';

interface HeaderProps {
  activeTab: StrategyTab;
  setActiveTab: (tab: StrategyTab) => void;
  onOpenSimulator: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  onPrint
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-8 py-3.5 transition-all no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950 font-serif font-bold text-xl ring-1 ring-amber-300/40">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-[0.25em] text-lg font-bold text-amber-200">
                DIVO
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 tracking-wider">
                Para Coty
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Plan Estratégico de Flujograma, Arquitectura Web y UX Writing
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Exclusivas Estrategia DIVO - Sin Tablero de Víctor) */}
        <nav className="flex items-center overflow-x-auto pb-1 md:pb-0 gap-1 sm:gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('flujograma')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'flujograma'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>Flujograma Interactivo</span>
          </button>

          <button
            onClick={() => setActiveTab('seguimiento')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seguimiento'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Seguimiento & Reportes</span>
          </button>

          <button
            onClick={() => setActiveTab('papel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'papel'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Visor del Papel</span>
          </button>

          <button
            onClick={() => setActiveTab('arquitectura-web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'arquitectura-web'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-amber-400" />
            <span>Arquitectura Web</span>
          </button>

          <button
            onClick={() => setActiveTab('ux-writing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ux-writing'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>UX Writing & Luz</span>
          </button>

          <button
            onClick={() => setActiveTab('equipo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'equipo'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Equipo & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('imprimible')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'imprimible'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Papel de Trabajo</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            title="Simular el viaje de un cliente por el flujograma"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simular Recorrido</span>
          </button>

          <button
            onClick={onPrint}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-200 hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
            title="Imprimir o guardar PDF del papel de trabajo"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
