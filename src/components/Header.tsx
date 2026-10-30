import React, { useState } from 'react';
import { 
  Workflow, 
  FileText, 
  Layout, 
  PenTool, 
  Users, 
  Printer, 
  Play,
  Eye,
  BarChart3,
  Menu,
  X,
  ArrowLeftRight
} from 'lucide-react';

export type StrategyTab = 'flujograma' | 'seguimiento' | 'papel' | 'arquitectura-web' | 'ux-writing' | 'equipo' | 'imprimible';

interface HeaderProps {
  activeTab: StrategyTab;
  setActiveTab: (tab: StrategyTab) => void;
  onOpenSimulator: () => void;
  onPrint: () => void;
  onSwitchApp?: () => void;
}

const NAV_ITEMS: { id: StrategyTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'flujograma', label: 'Flujograma Interactivo', shortLabel: 'Flujograma', icon: Workflow },
  { id: 'seguimiento', label: 'Seguimiento & Reportes', shortLabel: 'Reportes (37)', icon: BarChart3 },
  { id: 'papel', label: 'Visor del Papel', shortLabel: 'Papel', icon: Eye },
  { id: 'arquitectura-web', label: 'Arquitectura Web', shortLabel: 'Web', icon: Layout },
  { id: 'ux-writing', label: 'UX Writing & Luz', shortLabel: 'UX Writing', icon: PenTool },
  { id: 'equipo', label: 'Equipo & Roles', shortLabel: 'Equipo', icon: Users },
  { id: 'imprimible', label: 'Papel de Trabajo', shortLabel: 'Imprimible', icon: FileText },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  onPrint,
  onSwitchApp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((i) => i.id === activeTab) || NAV_ITEMS[0];

  const handleSelectTab = (tab: StrategyTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Sticky Header: Compact single-row h-14 on mobile (<=15% viewport height), full desktop bar on xl */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-6 lg:px-8 py-2 lg:py-3 transition-all no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Context */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950 font-serif font-bold text-lg sm:text-xl ring-1 ring-amber-300/40 shrink-0">
              ✨
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-[0.22em] text-base sm:text-lg font-bold text-amber-200">
                  DIVO
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 tracking-wider shrink-0">
                  Para Coty
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans truncate">
                <span className="xl:hidden text-amber-200/90 font-medium">{activeItem.label}</span>
                <span className="hidden xl:inline">Plan Estratégico de Flujograma, Arquitectura Web y UX Writing</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (xl+) */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[40px] xl:min-h-0 xl:py-1.5 rounded-xl xl:rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Simular el viaje de un cliente por el flujograma"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="hidden sm:inline">Simular Recorrido</span>
              <span className="sm:hidden">Simular</span>
            </button>

            <button
              onClick={onPrint}
              className="hidden sm:flex items-center justify-center min-h-[40px] min-w-[40px] xl:min-h-0 xl:min-w-0 xl:p-1.5 rounded-xl xl:rounded-lg text-neutral-400 hover:text-amber-200 hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              title="Imprimir o guardar PDF del papel de trabajo"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Mobile / Tablet Menu Drawer Toggle (< xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="xl:hidden min-h-[42px] min-w-[42px] rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-200 flex items-center justify-center cursor-pointer"
              aria-label="Abrir menú de secciones"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Slide-down Mobile/Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-2.5 pt-2.5 border-t border-neutral-800/90 space-y-2 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                        : 'bg-neutral-900/70 text-neutral-300 border border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-neutral-800/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPrint();
                }}
                className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir / Guardar PDF</span>
              </button>

              {onSwitchApp && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSwitchApp();
                  }}
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Cambiar de App</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Non-sticky Horizontal Quick-Switch Bar on Mobile/Tablet (< xl) so 1-tap switching costs 0 sticky height */}
      <div className="xl:hidden bg-neutral-950 border-b border-neutral-900 px-3 sm:px-6 py-2 no-print">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800/80 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
