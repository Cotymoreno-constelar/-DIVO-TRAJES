import React, { useState } from 'react';
import {
  NEW_SYSTEM_FIELDS,
  SYSTEM_REPORTS_CATALOG,
  REPORT_27_SECTIONS,
  GENERAL_REPORT_CONDITIONS,
  OFFICIAL_FORMULAS,
  DEVELOPMENT_ORDER_STAGES,
  DIRECTION_PENDING_ITEMS,
  ReportBlockCategory,
} from '../data/reportsPlanData';
import { TaskStatus, VictorTask } from '../types/flow';
import { useCloudSync } from '../context/CloudSyncContext';
import { CloudSyncBanner } from './CloudSyncBanner';
import { MAX_OBSERVATIONS_LENGTH } from '../firebase';
import {
  Calendar,
  CheckCircle2,
  Check,
  X,
  Edit3,
  Search,
  BarChart3,
  Database,
  FileSpreadsheet,
  Sliders,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface StrategicPlanTrackerProps {
  variant?: 'estrategia' | 'victor';
  hideCloudBanner?: boolean;
}

const DIRECTION_DECISIONS_STORAGE_KEY = 'divo_direction_decisions_v1';

function loadSavedDecisions(): Record<string, { text: string; resolved: boolean }> {
  try {
    const raw = localStorage.getItem(DIRECTION_DECISIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  const initial: Record<string, { text: string; resolved: boolean }> = {};
  for (const item of DIRECTION_PENDING_ITEMS) {
    initial[item.id] = { text: item.defaultProposal, resolved: false };
  }
  return initial;
}

export const StrategicPlanTracker: React.FC<StrategicPlanTrackerProps> = ({
  variant = 'estrategia',
  hideCloudBanner = false,
}) => {
  const {
    tasks,
    updateTaskProgress,
    canModifyFinalizedTask,
    memberRole,
  } = useCloudSync();

  const isVictorTheme = variant === 'victor';

  const [activeSubTab, setActiveSubTab] = useState<'campos' | 'reportes' | 'rep27_condiciones' | 'direccion'>('reportes');
  const [selectedStageFilter, setSelectedStageFilter] = useState<number | 'all'>('all');
  const [selectedBlock, setSelectedBlock] = useState<ReportBlockCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'Alta' | 'Media' | 'Baja'>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inline observation editing
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [tempObs, setTempObs] = useState<string>('');

  // Direction decisions state
  const [decisions, setDecisions] = useState<Record<string, { text: string; resolved: boolean }>>(loadSavedDecisions);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // Map tasks by ID for O(1) lookup
  const tasksById = new Map<string, VictorTask>();
  for (const t of tasks) {
    tasksById.set(t.id, t);
  }

  const isTaskCompleted = (t?: VictorTask) =>
    t?.status === 'finalizado' || t?.status === 'probada' || t?.status === 'terminada';

  // Overall metrics for the 37-item plan (10 Campos + 27 Reportes)
  const allPlanTaskIds = [
    ...NEW_SYSTEM_FIELDS.map((f) => f.taskId),
    ...SYSTEM_REPORTS_CATALOG.map((r) => r.taskId),
  ];
  const completedPlanCount = allPlanTaskIds.filter((id) => isTaskCompleted(tasksById.get(id))).length;
  const inProgressPlanCount = allPlanTaskIds.filter((id) => tasksById.get(id)?.status === 'en_curso').length;
  const overallPercent = Math.round((completedPlanCount / allPlanTaskIds.length) * 100);

  const handleStatusChange = (taskId: string, nextStatus: TaskStatus) => {
    const current = tasksById.get(taskId);
    if (!current) return;
    if (current.status === 'finalizado' && !canModifyFinalizedTask) {
      notify('Las tareas Finalizadas solo pueden reabrirse por Dirección (Coty).');
      return;
    }
    void updateTaskProgress(taskId, { status: nextStatus });
    notify(memberRole ? 'Estado sincronizado en la nube' : 'Estado actualizado localmente');
  };

  const handleDeadlineChange = (taskId: string, nextDate: string) => {
    if (!nextDate) return;
    const current = tasksById.get(taskId);
    if (!current) return;
    if (current.status === 'finalizado' && !canModifyFinalizedTask) {
      notify('Las tareas Finalizadas están validadas y bloqueadas.');
      return;
    }
    void updateTaskProgress(taskId, { deadline: nextDate });
    notify(memberRole ? `Fecha límite guardada en la nube (${nextDate})` : `Fecha límite actualizada (${nextDate})`);
  };

  const handleSaveObs = (taskId: string) => {
    const clean = tempObs.trim() || 'Sin observaciones registradas todavía.';
    void updateTaskProgress(taskId, { observations: clean });
    setEditingObsId(null);
    notify(memberRole ? 'Observación sincronizada en la nube' : 'Observación actualizada');
  };

  const handleSaveDecisionLocal = (id: string, text: string, resolved: boolean) => {
    const next = { ...decisions, [id]: { text, resolved } };
    setDecisions(next);
    try {
      localStorage.setItem(DIRECTION_DECISIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handlePushDecisionToVictorTasks = async (itemId: string, title: string, relatedTaskIds: string[]) => {
    const entry = decisions[itemId];
    if (!entry || !entry.text.trim()) return;

    handleSaveDecisionLocal(itemId, entry.text, true);

    let updatedCount = 0;
    for (const tId of relatedTaskIds) {
      const existing = tasksById.get(tId);
      if (!existing) continue;
      if (existing.status === 'finalizado' && !canModifyFinalizedTask) continue;

      const prefix = `[Definición Dirección · ${title}]: ${entry.text.trim()}`;
      const baseWithoutOldDef = existing.observations.replace(/\[Definición Dirección · [^\]]+\]:[^|]*(\|\s*)?/g, '').trim();
      const combined = `${prefix} | ${baseWithoutOldDef}`.slice(0, MAX_OBSERVATIONS_LENGTH);
      await updateTaskProgress(tId, { observations: combined });
      updatedCount++;
    }

    notify(
      updatedCount > 0
        ? `Definición aplicada en ${updatedCount} tarea(s) del tablero de Víctor`
        : 'Definición guardada en el seguimiento estratégico'
    );
  };

  // Filtered Fields
  const filteredFields = NEW_SYSTEM_FIELDS.filter((f) => {
    if (selectedStageFilter !== 'all' && selectedStageFilter !== 1) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const task = tasksById.get(f.taskId);
      return (
        f.field.toLowerCase().includes(q) ||
        f.detail.toLowerCase().includes(q) ||
        f.system.toLowerCase().includes(q) ||
        (task?.observations.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // Filtered Reports
  const filteredReports = SYSTEM_REPORTS_CATALOG.filter((r) => {
    if (selectedStageFilter !== 'all' && r.developmentStage !== selectedStageFilter) return false;
    if (selectedBlock !== 'all' && r.block !== selectedBlock) return false;
    if (selectedPriority !== 'all' && r.priorityLabel !== selectedPriority) return false;
    if (selectedSystem !== 'all' && r.system !== selectedSystem) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const task = tasksById.get(r.taskId);
      return (
        String(r.number) === q ||
        r.name.toLowerCase().includes(q) ||
        r.whatItShowsAndCalculation.toLowerCase().includes(q) ||
        r.filters.toLowerCase().includes(q) ||
        r.system.toLowerCase().includes(q) ||
        (task?.observations.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const accentText = isVictorTheme ? 'text-cyan-300' : 'text-amber-300';
  const accentBorder = isVictorTheme ? 'border-cyan-500/30' : 'border-amber-500/30';
  const activeTabClass = isVictorTheme
    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
    : 'bg-amber-500/20 text-amber-200 border border-amber-400/40';

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {toast && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-neutral-900/95 text-neutral-100 border border-emerald-500/50 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {!hideCloudBanner && <CloudSyncBanner compact onNotify={notify} />}

      {/* Executive Header & Overall Plan Progress */}
      <section className={`p-4 sm:p-6 lg:p-7 rounded-2xl bg-neutral-900/70 border ${accentBorder} space-y-5 sm:space-y-6`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-[11px] sm:text-xs text-neutral-400 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={`font-semibold ${accentText}`}>Divo Trajes y Divo Fem</span>
              <span aria-hidden="true">·</span>
              <span>Owl (CRM) y Sly Soft (Facturación)</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Sincronizado en vivo con el Tablero de Víctor</span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-neutral-100 tracking-tight">
              Seguimiento del Plan Estratégico y Reportes de Sistema
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Hoja de ruta operativa derivada del plan de marketing: <strong className="text-neutral-100">10 campos nuevos obligatorios</strong> (hacerlos primero) y <strong className="text-neutral-100">27 reportes de gestión</strong> con sus fórmulas fijas, filtros, frecuencias y fechas límite conectadas directamente con Víctor.
            </p>
          </div>

          {/* Live Summary Numbers (Tabular Numerals) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 shrink-0">
            <div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Avance Total</div>
              <div className={`text-lg sm:text-2xl font-mono font-bold tabular-nums ${accentText}`}>
                {overallPercent}%
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-500 tabular-nums">
                {completedPlanCount}/{allPlanTaskIds.length} listos
              </div>
            </div>
            <div className="border-l border-neutral-800 pl-2.5 sm:pl-4">
              <div className="text-[10px] sm:text-[11px] text-neutral-400">En Curso</div>
              <div className="text-lg sm:text-2xl font-mono font-bold tabular-nums text-blue-300">
                {inProgressPlanCount}
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-500">En desarrollo</div>
            </div>
            <div className="border-l border-neutral-800 pl-2.5 sm:pl-4">
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Línea Base</div>
              <div className="text-lg sm:text-2xl font-mono font-bold tabular-nums text-emerald-300">
                31/03
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-500">CAC · ROAS</div>
            </div>
          </div>
        </div>

        {/* Key Strategic Targets Strip (Unboxed clean typography + tabular numbers) */}
        <div className="pt-4 sm:pt-5 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 text-xs">
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Meta Notas Sly Soft</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">1.000 / mes</div>
            <div className="text-[11px] text-neutral-500">Reporte 13 · vs año ant.</div>
          </div>
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Meta Ticket Promedio</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">$200.000</div>
            <div className="text-[11px] text-neutral-500">Reporte 14 · Trayectoria</div>
          </div>
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Meta Ausentismo</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">≤ 20%</div>
            <div className="text-[11px] text-neutral-500">Rep. 2 y 3 · Cerrar 14,5%</div>
          </div>
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Motivo "No alquiló"</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">≥ 95% cargado</div>
            <div className="text-[11px] text-neutral-500">Campo 5 + Reporte 4</div>
          </div>
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Novios + Quinceaños</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">60% en sep.</div>
            <div className="text-[11px] text-neutral-500">Reporte 7 y 15 · Piso mes</div>
          </div>
          <div>
            <div className="text-neutral-400 text-[11px] sm:text-xs">Gestión Online (Yasmín)</div>
            <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums mt-0.5">&lt; 2h · 4 reseñas</div>
            <div className="text-[11px] text-neutral-500">Reporte 27 · Semanal</div>
          </div>
        </div>
      </section>

      {/* Section 5: Orden Sugerido de Desarrollo (4 Interactive Stage Cards) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-100">
              Orden Sugerido de Desarrollo (4 Etapas)
            </h3>
            <p className="text-xs text-neutral-400">
              Tocá una etapa para filtrar sus campos o reportes asociados.
            </p>
          </div>
          {selectedStageFilter !== 'all' && (
            <button
              onClick={() => setSelectedStageFilter('all')}
              className="min-h-[38px] px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 hover:text-white cursor-pointer self-start sm:self-auto"
            >
              Mostrar las 4 etapas completas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DEVELOPMENT_ORDER_STAGES.map((st) => {
            const totalInStage = st.taskIds.length;
            const doneInStage = st.taskIds.filter((id) => isTaskCompleted(tasksById.get(id))).length;
            const activeInStage = st.taskIds.filter((id) => tasksById.get(id)?.status === 'en_curso').length;
            const pct = totalInStage > 0 ? Math.round((doneInStage / totalInStage) * 100) : 0;
            const isSelected = selectedStageFilter === st.stageNumber;

            return (
              <button
                key={st.stageNumber}
                type="button"
                onClick={() => {
                  const next = isSelected ? 'all' : st.stageNumber;
                  setSelectedStageFilter(next);
                  if (st.stageNumber === 1) {
                    setActiveSubTab('campos');
                  } else {
                    setActiveSubTab('reportes');
                  }
                }}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? `bg-neutral-900 ${accentBorder} ring-1 ring-neutral-700`
                    : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono tabular-nums">
                    <span>0{st.stageNumber}. {st.targetMilestone}</span>
                    <span className={accentText}>{pct}%</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-neutral-100">
                    {st.label}
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80 w-full">
                  <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden">
                    <div
                      className={`h-full transition-all ${isVictorTheme ? 'bg-cyan-400' : 'bg-amber-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono tabular-nums">
                    <span>{doneInStage}/{totalInStage} completados</span>
                    {activeInStage > 0 && <span className="text-blue-300">{activeInStage} en curso</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Segmented Navigation + Search */}
      <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-stretch lg:items-center gap-1.5">
          <button
            onClick={() => {
              setActiveSubTab('campos');
              if (selectedStageFilter !== 'all' && selectedStageFilter !== 1) {
                setSelectedStageFilter('all');
              }
            }}
            className={`min-h-[42px] lg:min-h-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'campos'
                ? activeTabClass
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/50 lg:bg-transparent hover:bg-neutral-800/60 border border-neutral-800/80 lg:border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>1. Campos Nuevos (10)</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('reportes');
              if (selectedStageFilter === 1) {
                setSelectedStageFilter('all');
              }
            }}
            className={`min-h-[42px] lg:min-h-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'reportes'
                ? activeTabClass
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/50 lg:bg-transparent hover:bg-neutral-800/60 border border-neutral-800/80 lg:border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>2. Catálogo de Reportes (27)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rep27_condiciones')}
            className={`min-h-[42px] lg:min-h-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'rep27_condiciones'
                ? activeTabClass
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/50 lg:bg-transparent hover:bg-neutral-800/60 border border-neutral-800/80 lg:border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>3. Detalle Rep. 27 & Condiciones</span>
          </button>

          <button
            onClick={() => setActiveSubTab('direccion')}
            className={`min-h-[42px] lg:min-h-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'direccion'
                ? activeTabClass
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/50 lg:bg-transparent hover:bg-neutral-800/60 border border-neutral-800/80 lg:border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>4. Pendientes con Dirección (4)</span>
          </button>
        </div>

        {(activeSubTab === 'campos' || activeSubTab === 'reportes') && (
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar campo, reporte, fórmula o filtro..."
              className="min-h-[40px] lg:min-h-0 pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 w-full"
            />
          </div>
        )}
      </div>

      {/* ====================================================================
          SUB-TAB 1: LOS 10 CAMPOS NUEVOS (HACERLOS PRIMERO)
         ==================================================================== */}
      {activeSubTab === 'campos' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h3 className="font-serif text-xl font-bold text-neutral-100">
                1. Campos nuevos (hacerlos primero)
              </h3>
              <p className="text-xs text-neutral-400">
                Sin estos campos, varios reportes no se pueden construir. Los campos 1, 4, 5, 8 y 10 son críticos para la línea base al 31/03.
              </p>
            </div>
            <div className="text-xs text-neutral-400 font-mono tabular-nums">
              Mostrando {filteredFields.length} de 10 campos
            </div>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="md:hidden space-y-3">
            {filteredFields.map((item) => {
              const task = tasksById.get(item.taskId);
              const isLocked = task?.status === 'finalizado' && !canModifyFinalizedTask;
              return (
                <div
                  key={item.taskId}
                  className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 tabular-nums">
                          Campo #{item.number}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">{item.system}</span>
                        {item.isBaseline3103 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                            Crítico 31/03
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-neutral-100 mt-1.5">
                        {item.field}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 tabular-nums shrink-0">
                      Rep. {item.usedInReports.join(', ')}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    {item.detail}
                  </p>

                  {task && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                          Fecha Límite
                        </label>
                        <div className="min-h-[42px] flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                          <Calendar className={`w-4 h-4 mr-2 shrink-0 ${accentText}`} />
                          <input
                            type="date"
                            value={task.deadline}
                            disabled={isLocked}
                            onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                            className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-full tabular-nums disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                          Estado Víctor
                        </label>
                        <select
                          value={task.status}
                          disabled={isLocked}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className={`min-h-[42px] w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer disabled:opacity-60 ${
                            task.status === 'finalizado'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                              : task.status === 'en_curso'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 font-semibold'
                              : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                          }`}
                        >
                          <option value="sin_novedades">Sin Novedades</option>
                          <option value="en_curso">En Curso</option>
                          <option value="terminada">Terminada</option>
                          <option value="probada">Probada</option>
                          <option value="bloqueada">Bloqueada</option>
                          <option value="finalizado">Finalizado (LISTO)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {task && (
                    <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Observaciones</span>
                        {!isLocked && editingObsId !== task.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingObsId(task.id);
                              setTempObs(task.observations);
                            }}
                            className={`inline-flex items-center gap-1 font-medium cursor-pointer ${accentText}`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                      {editingObsId === task.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            maxLength={MAX_OBSERVATIONS_LENGTH}
                            value={tempObs}
                            onChange={(e) => setTempObs(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-600 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingObsId(null)}
                              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveObs(task.id)}
                              className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Guardar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (isLocked) return;
                            setEditingObsId(task.id);
                            setTempObs(task.observations);
                          }}
                          className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 cursor-pointer"
                        >
                          {task.observations}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400 text-[11px] font-semibold">
                    <th className="py-3.5 px-4 w-12">N°</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Campo y Sistema</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Detalle / Lista cerrada</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Reportes que lo usan</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Fecha Límite</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Estado Víctor</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Observaciones (Click p/ editar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredFields.map((item) => {
                    const task = tasksById.get(item.taskId);
                    const isLocked = task?.status === 'finalizado' && !canModifyFinalizedTask;
                    return (
                      <tr key={item.taskId} className="hover:bg-neutral-800/25 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-300 tabular-nums">
                          {item.number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-serif font-bold text-sm text-neutral-100">
                            {item.field}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{item.system}</span>
                            {item.isBaseline3103 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-red-300 font-medium">Crítico Línea Base 31/03</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-300 leading-relaxed">
                          {item.detail}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-neutral-300 tabular-nums whitespace-nowrap">
                          Rep. {item.usedInReports.join(', ')}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {task && (
                            <div className="inline-flex items-center bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-lg px-2 py-1">
                              <Calendar className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${accentText}`} />
                              <input
                                type="date"
                                value={task.deadline}
                                disabled={isLocked}
                                onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                                className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-28 tabular-nums disabled:opacity-60"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {task && (
                            <select
                              value={task.status}
                              disabled={isLocked}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer disabled:opacity-60 ${
                                task.status === 'finalizado'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                                  : task.status === 'en_curso'
                                  ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 font-semibold'
                                  : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                              }`}
                            >
                              <option value="sin_novedades">Sin Novedades</option>
                              <option value="en_curso">En Curso</option>
                              <option value="terminada">Terminada</option>
                              <option value="probada">Probada</option>
                              <option value="bloqueada">Bloqueada</option>
                              <option value="finalizado">Finalizado (LISTO)</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-300">
                          {task && editingObsId === task.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                maxLength={MAX_OBSERVATIONS_LENGTH}
                                value={tempObs}
                                onChange={(e) => setTempObs(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveObs(task.id)}
                                className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                                title="Guardar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingObsId(null)}
                                className="p-1 rounded bg-neutral-800 text-neutral-400 cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            task && (
                              <div
                                onClick={() => {
                                  if (isLocked) return;
                                  setEditingObsId(task.id);
                                  setTempObs(task.observations);
                                }}
                                className="cursor-pointer hover:bg-neutral-950/70 p-1.5 rounded-lg flex items-start justify-between gap-2"
                              >
                                <span className="leading-relaxed line-clamp-2">{task.observations}</span>
                                <Edit3 className="w-3.5 h-3.5 text-neutral-500 opacity-60 group-hover:opacity-100 shrink-0 mt-0.5" />
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SUB-TAB 2: CATÁLOGO DE LOS 27 REPORTES DEL SISTEMA
         ==================================================================== */}
      {activeSubTab === 'reportes' && (
        <section className="space-y-4">
          {/* Report Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 md:flex-wrap text-xs">
              {(
                [
                  ['all', 'Todos (27)'],
                  ['Citas (Owl)', 'Citas Owl (1–9)'],
                  ['Emma y asesores (Owl)', 'Emma y asesores (10–12)'],
                  ['Facturación (Sly Soft)', 'Facturación Sly Soft (13–17)'],
                  ['Cruces con pauta (línea base al 31/03)', 'Cruces Pauta 31/03 (18–22)'],
                  ['Tablero y automatización', 'Tablero y Autom. (23–27)'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSelectedBlock(val)}
                  className={`min-h-[38px] md:min-h-0 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedBlock === val
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'
                      : 'text-neutral-400 bg-neutral-900/50 md:bg-transparent hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800/80 md:border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 text-xs w-full md:w-auto">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as 'all' | 'Alta' | 'Media' | 'Baja')}
                className="min-h-[40px] md:min-h-0 w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las prioridades</option>
                <option value="Alta">Prioridad Alta (Etapa 2)</option>
                <option value="Media">Prioridad Media (Etapa 3)</option>
                <option value="Baja">Prioridad Baja (Etapa 4)</option>
              </select>

              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="min-h-[40px] md:min-h-0 w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los sistemas</option>
                <option value="Owl">Owl</option>
                <option value="Sly Soft">Sly Soft</option>
                <option value="Owl + Sly Soft">Owl + Sly Soft</option>
                <option value="Cruce + pauta">Cruce + pauta</option>
                <option value="Owl + Kommo">Owl + Kommo</option>
                <option value="Todos">Todos</option>
              </select>
            </div>
          </div>

          {/* Mobile Stacked Report Cards (< md) */}
          <div className="md:hidden space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-500">
                No hay reportes que coincidan con el filtro seleccionado.
              </div>
            ) : (
              filteredReports.map((rep) => {
                const task = tasksById.get(rep.taskId);
                const isLocked = task?.status === 'finalizado' && !canModifyFinalizedTask;
                return (
                  <div
                    key={rep.taskId}
                    className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 tabular-nums">
                            Rep. #{rep.number}
                          </span>
                          <span className="font-mono text-[11px] text-neutral-300">{rep.system}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              rep.priorityLabel === 'Alta'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : rep.priorityLabel === 'Media'
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                            }`}
                          >
                            Prioridad {rep.priorityLabel} · Etapa {rep.developmentStage}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-neutral-100 mt-1.5">
                          {rep.name}
                        </h4>
                        <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{rep.block}</span>
                          {rep.kpiHighlight && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className={accentText}>{rep.kpiHighlight}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2 text-xs">
                      <p className="text-neutral-200 leading-relaxed">
                        {rep.whatItShowsAndCalculation}
                      </p>
                      <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                        <div><strong className="text-neutral-300">Filtros:</strong> {rep.filters}</div>
                        <div><strong className="text-neutral-300">Frecuencia:</strong> {rep.frequency}</div>
                      </div>
                    </div>

                    {task && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                            Fecha Límite
                          </label>
                          <div className="min-h-[42px] flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                            <Calendar className={`w-4 h-4 mr-2 shrink-0 ${accentText}`} />
                            <input
                              type="date"
                              value={task.deadline}
                              disabled={isLocked}
                              onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                              className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-full tabular-nums disabled:opacity-60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                            Estado Víctor
                          </label>
                          <select
                            value={task.status}
                            disabled={isLocked}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className={`min-h-[42px] w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer disabled:opacity-60 ${
                              task.status === 'finalizado'
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                                : task.status === 'en_curso'
                                ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 font-semibold'
                                : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                            }`}
                          >
                            <option value="sin_novedades">Sin Novedades</option>
                            <option value="en_curso">En Curso</option>
                            <option value="terminada">Terminada</option>
                            <option value="probada">Probada</option>
                            <option value="bloqueada">Bloqueada</option>
                            <option value="finalizado">Finalizado (LISTO)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {task && (
                      <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Observaciones</span>
                          {!isLocked && editingObsId !== task.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingObsId(task.id);
                                setTempObs(task.observations);
                              }}
                              className={`inline-flex items-center gap-1 font-medium cursor-pointer ${accentText}`}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          )}
                        </div>
                        {editingObsId === task.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              maxLength={MAX_OBSERVATIONS_LENGTH}
                              value={tempObs}
                              onChange={(e) => setTempObs(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-600 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingObsId(null)}
                                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveObs(task.id)}
                                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Guardar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (isLocked) return;
                              setEditingObsId(task.id);
                              setTempObs(task.observations);
                            }}
                            className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 cursor-pointer"
                          >
                            {task.observations}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400 text-[11px] font-semibold">
                    <th className="py-3.5 px-3 w-12">N°</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Reporte / Bloque</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Qué muestra / Cómo se calcula</th>
                    <th className="py-3.5 px-3 min-w-[160px]">Filtros y Frecuencia</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Sistema · Prioridad</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Fecha Límite</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Estado Víctor</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-neutral-500">
                        No hay reportes que coincidan con el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => {
                      const task = tasksById.get(rep.taskId);
                      const isLocked = task?.status === 'finalizado' && !canModifyFinalizedTask;
                      return (
                        <tr key={rep.taskId} className="hover:bg-neutral-800/25 transition-colors group">
                          <td className="py-3.5 px-3 font-mono font-bold text-neutral-300 tabular-nums">
                            {rep.number}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-serif font-bold text-sm text-neutral-100">
                              {rep.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{rep.block}</span>
                              {rep.kpiHighlight && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className={accentText}>{rep.kpiHighlight}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300 leading-relaxed">
                            {rep.whatItShowsAndCalculation}
                          </td>
                          <td className="py-3.5 px-3 text-neutral-300">
                            <div><span className="text-neutral-500">Filtros:</span> {rep.filters}</div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              <span className="text-neutral-500">Frec.:</span> {rep.frequency}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-mono text-neutral-200">{rep.system}</div>
                            <div className="text-[11px] mt-0.5">
                              <span
                                className={
                                  rep.priorityLabel === 'Alta'
                                    ? 'text-amber-300 font-semibold'
                                    : rep.priorityLabel === 'Media'
                                    ? 'text-cyan-300'
                                    : 'text-neutral-400'
                                }
                              >
                                Prioridad {rep.priorityLabel}
                              </span>
                              <span className="text-neutral-500"> · Etapa {rep.developmentStage}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {task && (
                              <div className="inline-flex items-center bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-lg px-2 py-1">
                                <Calendar className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${accentText}`} />
                                <input
                                  type="date"
                                  value={task.deadline}
                                  disabled={isLocked}
                                  onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                                  className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-28 tabular-nums disabled:opacity-60"
                                />
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {task && (
                              <select
                                value={task.status}
                                disabled={isLocked}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer disabled:opacity-60 ${
                                  task.status === 'finalizado'
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                                    : task.status === 'en_curso'
                                    ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 font-semibold'
                                    : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                                }`}
                              >
                                <option value="sin_novedades">Sin Novedades</option>
                                <option value="en_curso">En Curso</option>
                                <option value="terminada">Terminada</option>
                                <option value="probada">Probada</option>
                                <option value="bloqueada">Bloqueada</option>
                                <option value="finalizado">Finalizado (LISTO)</option>
                              </select>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">
                            {task && editingObsId === task.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  maxLength={MAX_OBSERVATIONS_LENGTH}
                                  value={tempObs}
                                  onChange={(e) => setTempObs(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveObs(task.id)}
                                  className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingObsId(null)}
                                  className="p-1 rounded bg-neutral-800 text-neutral-400 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              task && (
                                <div
                                  onClick={() => {
                                    if (isLocked) return;
                                    setEditingObsId(task.id);
                                    setTempObs(task.observations);
                                  }}
                                  className="cursor-pointer hover:bg-neutral-950/70 p-1.5 rounded-lg flex items-start justify-between gap-2"
                                >
                                  <span className="leading-relaxed line-clamp-2">{task.observations}</span>
                                  <Edit3 className="w-3.5 h-3.5 text-neutral-500 opacity-60 group-hover:opacity-100 shrink-0 mt-0.5" />
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SUB-TAB 3: DETALLE REPORTE 27 (YASMÍN) & CONDICIONES GENERALES
         ==================================================================== */}
      {activeSubTab === 'rep27_condiciones' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Sección 3: Reporte 27 */}
          <section className="p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-5">
            <div className="space-y-1">
              <div className="text-xs text-neutral-400">
                Sección 3 · Primer uso: asesora en línea (Yasmín) · Frecuencia semanal (vs semana anterior) y acumulado mensual
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-100">
                Detalle del Reporte 27: Gestión por persona del equipo
              </h3>
              <p className="text-xs text-neutral-300">
                Un único reporte parametrizado con filtro por persona, en lugar de construir reportes separados para cada integrante.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REPORT_27_SECTIONS.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-2.5"
                >
                  <div className="font-serif font-bold text-sm text-neutral-100">
                    0{idx + 1}. {sec.title}
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300 leading-relaxed">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className={accentText}>•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Sección 4: Condiciones Generales + Fórmulas Fijas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <section className="p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className={`w-4 h-4 shrink-0 ${accentText}`} />
                <h3 className="font-serif text-lg font-bold text-neutral-100">
                  4. Condiciones generales obligatorias
                </h3>
              </div>
              <div className="divide-y divide-neutral-800/80">
                {GENERAL_REPORT_CONDITIONS.map((cond, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="font-semibold text-xs text-neutral-100">{cond.title}</div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{cond.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-100">
                  Fórmulas definidas por escrito y fijas
                </h3>
                <p className="text-xs text-neutral-400">
                  Estándar único de cálculo en Owl y Sly Soft para evitar discrepancias entre áreas.
                </p>
              </div>
              <div className="divide-y divide-neutral-800/80">
                {OFFICIAL_FORMULAS.map((f, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <span className="font-semibold text-neutral-100">{f.metric}</span>
                      <div className="font-mono text-[11px] text-neutral-300 mt-0.5">{f.formula}</div>
                    </div>
                    <span className="text-[11px] text-neutral-500 shrink-0">{f.target}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-TAB 4: PENDIENTES DE DEFINIR CON DIRECCIÓN (SECCIÓN 6)
         ==================================================================== */}
      {activeSubTab === 'direccion' && (
        <section className="space-y-4">
          <div className="space-y-1 px-1">
            <h3 className="font-serif text-xl font-bold text-neutral-100">
              6. Pendientes de definir con Dirección (Coty)
            </h3>
            <p className="text-xs text-neutral-400">
              Definí acá los 4 puntos abiertos del documento. Al tocar "Aplicar en tareas de Víctor", la resolución queda escrita directamente en las observaciones técnicas del campo o reporte correspondiente en la nube.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DIRECTION_PENDING_ITEMS.map((item) => {
              const currentDecision = decisions[item.id] || {
                text: item.defaultProposal,
                resolved: false,
              };
              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                      <span className="font-mono">Pendiente 0{item.number}</span>
                      <span>
                        {currentDecision.resolved ? (
                          <span className="text-emerald-400 font-semibold">Definido por Dirección</span>
                        ) : (
                          <span className="text-amber-300">Pendiente de confirmar</span>
                        )}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-neutral-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
                    <label className="text-[11px] text-neutral-400 block">
                      Resolución / Criterio de Dirección:
                    </label>
                    <textarea
                      rows={2}
                      value={currentDecision.text}
                      onChange={(e) =>
                        handleSaveDecisionLocal(item.id, e.target.value, currentDecision.resolved)
                      }
                      className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-[11px] font-mono text-neutral-500 break-words">
                        Impacta en: {item.relatedTaskIds.join(', ')}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void handlePushDecisionToVictorTasks(
                            item.id,
                            item.title,
                            item.relatedTaskIds
                          )
                        }
                        className={`w-full sm:w-auto min-h-[42px] sm:min-h-0 px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                          isVictorTheme
                            ? 'bg-cyan-400 text-neutral-950 hover:brightness-110'
                            : 'bg-amber-400 text-neutral-950 hover:brightness-110'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5 shrink-0" />
                        <span>Aplicar en tareas de Víctor</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
