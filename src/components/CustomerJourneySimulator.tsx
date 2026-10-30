import React, { useState } from 'react';
import { CUSTOMER_JOURNEYS } from '../data/constelarData';
import { CustomerJourney } from '../types/flow';
import { 
  X, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Heart, 
  CheckCircle, 
  RotateCcw,
  Compass
} from 'lucide-react';

interface SimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToNode?: (nodeId: string) => void;
}

export const CustomerJourneySimulator: React.FC<SimulatorProps> = ({
  isOpen,
  onClose,
  onJumpToNode
}) => {
  if (!isOpen) return null;

  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const journey = CUSTOMER_JOURNEYS[selectedJourneyIndex];
  const step = journey.steps[currentStepIndex];
  const isLastStep = currentStepIndex === journey.steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
  };

  const handleSwitchJourney = (idx: number) => {
    setSelectedJourneyIndex(idx);
    setCurrentStepIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 leading-tight">
                Simulador del Flujo de Clientes DIVO
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Comprobá cómo viaja un cliente a través de los nodos de tu papel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar simulador"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Journey Switcher Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-neutral-500 text-[11px] uppercase tracking-wider font-semibold mr-1 shrink-0">
            Escenario:
          </span>
          {CUSTOMER_JOURNEYS.map((j, idx) => (
            <button
              key={j.id}
              onClick={() => handleSwitchJourney(idx)}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedJourneyIndex === idx
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
              }`}
            >
              {j.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Persona Overview */}
        <div className="px-4 sm:px-6 py-2.5 bg-amber-950/20 border-b border-amber-500/20 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-amber-300 shrink-0">Persona:</span>
            <span className="truncate">{journey.persona}</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400/80 shrink-0">
            Paso {currentStepIndex + 1} de {journey.steps.length}
          </span>
        </div>

        {/* Step Progress Dots */}
        <div className="px-4 sm:px-6 py-3 flex items-center gap-2 border-b border-neutral-800/80 bg-neutral-900/40 overflow-x-auto scrollbar-none">
          {journey.steps.map((st, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                    : isCompleted
                    ? 'bg-neutral-800 text-amber-300'
                    : 'bg-neutral-950 text-neutral-500'
                }`}
              >
                <span>{i + 1}.</span>
                <span>{st.stage}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Fase: {step.stage}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono w-fit">
                Punto de Contacto: {step.touchpoint}
              </span>
            </div>

            <h4 className="font-serif text-xl sm:text-2xl font-bold text-neutral-100 leading-snug">
              {step.action}
            </h4>
          </div>

          {/* Emotional & Customer Feeling Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-[11px] uppercase font-semibold text-neutral-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Estado Emocional del Cliente en este Paso:
            </span>
            <p className="text-sm text-neutral-200 italic font-serif">
              "{step.feeling}"
            </p>
          </div>

          {/* Operational Translation */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-neutral-300 space-y-2.5">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ¿Qué ocurre en el fondo de tu sistema?
            </span>
            <p className="leading-relaxed">
              El nodo <span className="font-mono text-amber-200 font-bold bg-neutral-950 px-1.5 py-0.5 rounded">{step.nodeId}</span> se activa. Si es digital (Kommo/Web), se dispara el evento en Analytics y entra al CRM con etiqueta de fecha de evento. Si es en sucursal, se registra en Sky Soft y Owl.
            </p>
            {onJumpToNode && (
              <button
                onClick={() => {
                  onJumpToNode(step.nodeId);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 font-medium transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspeccionar nodo en el Flujograma →</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2 min-h-[44px] rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleRestart}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Reiniciar simulador"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div>
            {!isLastStep ? (
              <button
                onClick={handleNext}
                className="px-4 sm:px-5 py-2 min-h-[44px] rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex text-xs text-emerald-400 font-semibold items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Ciclo Completo!</span>
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 min-h-[44px] rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Finalizar recorrido
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
