import React, { useState } from 'react';
import { DEV_SUGGESTIONS } from '../data/constelarData';
import {
  VictorTask,
  TaskStatus,
  TaskRequester,
  TaskPriority,
  DevSuggestion,
} from '../types/flow';
import { useCloudSync } from '../context/CloudSyncContext';
import { CloudSyncBanner } from './CloudSyncBanner';
import { StrategicPlanTracker } from './StrategicPlanTracker';
import {
  MAX_TITLE_LENGTH,
  MAX_MODULE_LENGTH,
  MAX_OBSERVATIONS_LENGTH,
  MAX_SPECS_LENGTH,
} from '../firebase';
import {
  Code2,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Check,
  Lightbulb,
  X,
  Search,
  Printer,
} from 'lucide-react';

interface VictorOwlBoardProps {
  activeSection?: 'board' | 'reports_spec' | 'backlog' | 'print';
  onNavigateSection?: (section: 'board' | 'reports_spec' | 'backlog' | 'print') => void;
}

export const VictorOwlBoard: React.FC<VictorOwlBoardProps> = ({
  activeSection = 'board',
  onNavigateSection,
}) => {
  const {
    tasks,
    createTask,
    updateTaskProgress,
    updateFullTask,
    deleteTask,
    canDeleteTasks,
    canDeleteFinalizedTask,
  } = useCloudSync();

  // Filters & View State
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'campos' | 'reportes' | 'operatividad'
  >('all');
  const [filterRequester, setFilterRequester] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modal State for New Task
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newRequestedBy, setNewRequestedBy] = useState<TaskRequester>('Coty');
  const [newModule, setNewModule] = useState<string>('Owl Reportes');
  const [newPriority, setNewPriority] = useState<TaskPriority>('alta');
  const [newDeadline, setNewDeadline] = useState<string>('2026-11-15');
  const [newStatus, setNewStatus] = useState<TaskStatus>('sin_novedades');
  const [newObservations, setNewObservations] = useState<string>('');
  const [newSpecs, setNewSpecs] = useState<string>('');

  // Full Inline Row Editing on Main Screen (modifies Title, Module, Specs, Requester, Priority, Date, Status, Observations in place)
  const [inlineEditTask, setInlineEditTask] = useState<VictorTask | null>(null);

  // Quick Inline Observation Editing
  const [editingObsTaskId, setEditingObsTaskId] = useState<string | null>(null);
  const [tempObsText, setTempObsText] = useState<string>('');

  // Optional Modal Edit (used from Kanban or if needed)
  const [editingTask, setEditingTask] = useState<VictorTask | null>(null);

  // Inline Delete Confirmation (avoids window.confirm in iframe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quick Toast notification when a field changes
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Status counters
  const countFinalizadas = tasks.filter((t) => t.status === 'finalizado').length;
  const countEnCurso = tasks.filter((t) => t.status === 'en_curso').length;
  const countSinNovedades = tasks.filter((t) => t.status === 'sin_novedades').length;
  const countTerminadas = tasks.filter(
    (t) => t.status === 'terminada' || t.status === 'probada'
  ).length;

  const countCampos = tasks.filter((t) => t.id.startsWith('campo-divo-')).length;
  const countReportes = tasks.filter((t) => t.id.startsWith('rep-divo-')).length;
  const countOperatividad = tasks.filter(
    (t) => !t.id.startsWith('campo-divo-') && !t.id.startsWith('rep-divo-')
  ).length;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === 'campos' && !t.id.startsWith('campo-divo-')) return false;
    if (filterCategory === 'reportes' && !t.id.startsWith('rep-divo-')) return false;
    if (
      filterCategory === 'operatividad' &&
      (t.id.startsWith('campo-divo-') || t.id.startsWith('rep-divo-'))
    ) {
      return false;
    }

    if (filterRequester === 'listo') {
      if (t.status !== 'finalizado') return false;
    } else if (filterRequester !== 'all' && t.requestedBy !== filterRequester) {
      return false;
    }

    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.observations.toLowerCase().includes(q) ||
        t.module.toLowerCase().includes(q) ||
        (t.specs?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // Direct 1-click inline field handlers
  const handleStatusChange = (taskId: string, newStat: TaskStatus) => {
    void updateTaskProgress(taskId, { status: newStat });
    showToast('Estado guardado en vivo');
  };

  const handleDeadlineChange = (taskId: string, newDate: string) => {
    if (!newDate) return;
    void updateTaskProgress(taskId, { deadline: newDate });
    showToast(`Fecha límite guardada en vivo: ${newDate}`);
  };

  const handleRequesterChange = (taskId: string, newReq: TaskRequester) => {
    void updateTaskProgress(taskId, { requestedBy: newReq });
    showToast(`Solicitante actualizado: ${newReq}`);
  };

  const handlePriorityChange = (taskId: string, newPrio: TaskPriority) => {
    void updateTaskProgress(taskId, { priority: newPrio });
    showToast(`Prioridad actualizada: ${newPrio.toUpperCase()}`);
  };

  const handleSaveObservation = (taskId: string) => {
    const trimmed = tempObsText.trim() || 'Sin observaciones registradas todavía.';
    void updateTaskProgress(taskId, { observations: trimmed });
    setEditingObsTaskId(null);
    showToast('Observación guardada en vivo');
  };

  // Start full inline row edit on the main screen
  const startInlineRowEdit = (task: VictorTask) => {
    setEditingObsTaskId(null);
    setConfirmDeleteId(null);
    setInlineEditTask({
      ...task,
      specs: task.specs || '',
    });
  };

  const saveInlineRowEdit = () => {
    if (!inlineEditTask || !inlineEditTask.title.trim()) return;
    void updateFullTask({
      ...inlineEditTask,
      title: inlineEditTask.title.trim().slice(0, MAX_TITLE_LENGTH),
      module: (inlineEditTask.module.trim() || 'Owl CRM').slice(0, MAX_MODULE_LENGTH),
      observations: (
        inlineEditTask.observations.trim() || 'Sin observaciones registradas todavía.'
      ).slice(0, MAX_OBSERVATIONS_LENGTH),
      specs: (inlineEditTask.specs || '').trim().slice(0, MAX_SPECS_LENGTH),
    });
    setInlineEditTask(null);
    showToast('Solicitud modificada y guardada en vivo');
  };

  // Handle confirmed delete task
  const executeDeleteTask = (taskId: string) => {
    void deleteTask(taskId);
    setConfirmDeleteId(null);
    showToast('Solicitud eliminada en vivo del tablero');
  };

  // Add new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: VictorTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim().slice(0, MAX_TITLE_LENGTH),
      requestedBy: newRequestedBy,
      module: (newModule.trim() || 'Owl CRM').slice(0, MAX_MODULE_LENGTH),
      priority: newPriority,
      deadline: newDeadline || '2026-11-20',
      status: newStatus,
      observations: (
        newObservations.trim() || 'Sin observaciones registradas todavía.'
      ).slice(0, MAX_OBSERVATIONS_LENGTH),
      specs: newSpecs.trim().slice(0, MAX_SPECS_LENGTH),
      createdAt: new Date().toISOString().split('T')[0],
    };

    void createTask(newTask);
    setIsModalOpen(false);
    resetForm();
    if (onNavigateSection) onNavigateSection('board');
    showToast(`Solicitud creada y publicada en vivo (${newTask.deadline})`);
  };

  // Update existing task from modal
  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    void updateFullTask(editingTask);
    showToast(`Solicitud "${editingTask.title}" guardada en vivo`);
    setEditingTask(null);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewRequestedBy('Coty');
    setNewModule('Owl Reportes');
    setNewPriority('alta');
    setNewDeadline('2026-11-15');
    setNewStatus('sin_novedades');
    setNewObservations('');
    setNewSpecs('');
  };

  // Convert Suggestion into a Task for Victor in 1 click
  const handleConvertSuggestion = (sug: DevSuggestion) => {
    const requester: TaskRequester = sug.beneficiary.includes('Coty')
      ? 'Coty'
      : sug.beneficiary.includes('Yasmín')
      ? 'Yasmín'
      : 'Coty';

    const newTask: VictorTask = {
      id: `sug-task-${Date.now()}`,
      title: sug.title.slice(0, MAX_TITLE_LENGTH),
      requestedBy: requester,
      module: sug.defaultModule.slice(0, MAX_MODULE_LENGTH),
      priority: 'alta',
      deadline: sug.suggestedDeadline,
      status: 'sin_novedades',
      observations: `Propuesta estratégica: ${sug.description} · Impacto previsto: ${sug.impact}`.slice(
        0,
        MAX_OBSERVATIONS_LENGTH
      ),
      specs: sug.description.slice(0, MAX_SPECS_LENGTH),
      createdAt: new Date().toISOString().split('T')[0],
    };

    void createTask(newTask);
    showToast(`Propuesta enviada al Tablero Activo de Víctor (${sug.suggestedDeadline})`);
    if (onNavigateSection) {
      setTimeout(() => onNavigateSection('board'), 600);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'finalizado':
        return 'Finalizado (LISTO)';
      case 'en_curso':
        return 'En Curso';
      case 'sin_novedades':
        return 'Sin Novedades';
      case 'terminada':
        return 'Terminada';
      case 'probada':
        return 'Probada';
      case 'bloqueada':
        return 'Bloqueada';
    }
  };

  const getRequesterSelectStyle = (requester: TaskRequester) => {
    switch (requester) {
      case 'Coty':
        return 'bg-amber-950/35 text-amber-200 border-amber-500/35 hover:border-amber-400/60';
      case 'Yasmín':
        return 'bg-rose-950/35 text-rose-200 border-rose-500/35 hover:border-rose-400/60';
      case 'Sucursales':
        return 'bg-purple-950/35 text-purple-200 border-purple-500/35 hover:border-purple-400/60';
      case 'Administración':
        return 'bg-indigo-950/35 text-indigo-200 border-indigo-500/35 hover:border-indigo-400/60';
    }
  };

  const getPrioritySelectStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-950/40 text-red-200 border-red-500/40 font-semibold hover:border-red-400/70';
      case 'alta':
        return 'bg-amber-950/40 text-amber-200 border-amber-500/40 font-semibold hover:border-amber-400/70';
      case 'media':
        return 'bg-cyan-950/35 text-cyan-200 border-cyan-500/35 hover:border-cyan-400/60';
      case 'baja':
        return 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500';
    }
  };

  const getStatusSelectStyle = (status: TaskStatus) => {
    switch (status) {
      case 'finalizado':
        return 'bg-emerald-950/45 text-emerald-200 border-emerald-500/45 font-semibold hover:border-emerald-400/70';
      case 'en_curso':
        return 'bg-blue-950/45 text-blue-200 border-blue-500/45 font-semibold hover:border-blue-400/70';
      case 'terminada':
        return 'bg-amber-950/40 text-amber-200 border-amber-500/40 font-medium hover:border-amber-400/70';
      case 'probada':
        return 'bg-teal-950/40 text-teal-200 border-teal-500/40 font-medium hover:border-teal-400/70';
      case 'bloqueada':
        return 'bg-red-950/40 text-red-200 border-red-500/40 font-medium hover:border-red-400/70';
      default:
        return 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-cyan-500/50';
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 relative">
      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-cyan-950/95 text-cyan-200 border border-cyan-400 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Compact Real-time Cloud Sync & Backup Strip */}
      <CloudSyncBanner compact onNotify={showToast} />

      {/* =========================================================
          VISTA 1: TABLERO DE SOLICITUDES ACTIVAS (PANTALLA PRINCIPAL COMPLETA)
         ========================================================= */}
      {activeSection === 'board' && (
        <>
          {/* Compact Top Command Bar: Title + Live KPIs + Nueva Solicitud */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/80 border border-cyan-500/25 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-neutral-950 font-serif font-bold text-lg shadow-md shadow-cyan-500/20 shrink-0">
                V
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-100">
                    Gestión de Requerimientos · Sistema Owl
                  </h2>
                  <span className="text-[11px] text-cyan-300 font-mono">
                    Víctor · Edición directa en pantalla
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Todo visible y modificable desde esta pantalla: solicitante, prioridad, fecha límite, estado, especificaciones y observaciones.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2 sm:gap-2.5 shrink-0">
              {/* Inline Live Counters */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-xs w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setFilterStatus(filterStatus === 'finalizado' ? 'all' : 'finalizado')
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    filterStatus === 'finalizado'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                      : 'bg-emerald-950/20 border-emerald-500/35 text-emerald-300 hover:bg-emerald-950/40'
                  }`}
                >
                  <span className="text-[10px] block text-emerald-400 font-medium truncate">
                    Finalizadas
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono tabular-nums">
                    {countFinalizadas}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterStatus(filterStatus === 'en_curso' ? 'all' : 'en_curso')
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    filterStatus === 'en_curso'
                      ? 'bg-blue-950/60 border-blue-400 text-blue-200'
                      : 'bg-blue-950/20 border-blue-500/30 text-blue-300 hover:bg-blue-950/40'
                  }`}
                >
                  <span className="text-[10px] block text-blue-400 font-medium truncate">
                    En Curso
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono tabular-nums">
                    {countEnCurso}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterStatus(
                      filterStatus === 'sin_novedades' ? 'all' : 'sin_novedades'
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    filterStatus === 'sin_novedades'
                      ? 'bg-neutral-800 border-neutral-500 text-neutral-100'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <span className="text-[10px] block text-neutral-400 font-medium truncate">
                    Sin Nov.
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono tabular-nums">
                    {countSinNovedades}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterStatus(filterStatus === 'terminada' ? 'all' : 'terminada')
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    filterStatus === 'terminada'
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:bg-amber-950/40'
                  }`}
                >
                  <span className="text-[10px] block text-amber-400 font-medium truncate">
                    Pruebas
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono tabular-nums">
                    {countTerminadas}
                  </span>
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>Nueva Solicitud</span>
              </button>
            </div>
          </div>

          {/* Unified Compact Filters & Search Toolbar */}
          <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 text-xs">
            {/* Row 1: Category Blocks + Technical Doc Link */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 lg:pb-0 lg:flex-wrap">
                <span className="text-neutral-500 font-semibold px-1 hidden sm:inline shrink-0">
                  Bloque:
                </span>
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterCategory === 'all'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Todo ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterCategory('operatividad')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterCategory === 'operatividad'
                      ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Operatividad Inicial ({countOperatividad})
                </button>
                <button
                  onClick={() => setFilterCategory('campos')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterCategory === 'campos'
                      ? 'bg-red-500/20 text-red-200 border border-red-400/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  1. Campos Nuevos ({countCampos})
                </button>
                <button
                  onClick={() => setFilterCategory('reportes')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterCategory === 'reportes'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  2. Reportes ({countReportes})
                </button>
              </div>

              {onNavigateSection && (
                <button
                  onClick={() => onNavigateSection('reports_spec')}
                  className="w-full lg:w-auto min-h-[34px] px-3 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/30 font-medium cursor-pointer text-center whitespace-nowrap"
                >
                  Ver Fórmulas & Etapas de los 37 ítems →
                </button>
              )}
            </div>

            {/* Row 2: Requester Filter + Search + Status Select + Lista/Kanban */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 lg:pb-0 lg:flex-wrap">
                <span className="text-neutral-500 font-semibold px-1 hidden sm:inline shrink-0">
                  Solicita:
                </span>
                <button
                  onClick={() => setFilterRequester('all')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterRequester === 'all'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Todas ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterRequester('listo')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterRequester === 'listo'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Solo LISTO ({countFinalizadas})
                </button>
                <button
                  onClick={() => setFilterRequester('Coty')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterRequester === 'Coty'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Coty ({tasks.filter((t) => t.requestedBy === 'Coty').length})
                </button>
                <button
                  onClick={() => setFilterRequester('Yasmín')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterRequester === 'Yasmín'
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  Yasmín ({tasks.filter((t) => t.requestedBy === 'Yasmín').length})
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar solicitud, spec o nota..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="min-h-[36px] pl-8 pr-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500/50 w-full sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="min-h-[36px] flex-1 sm:flex-initial bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-neutral-300 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="finalizado">Finalizado (LISTO)</option>
                    <option value="en_curso">En Curso</option>
                    <option value="sin_novedades">Sin Novedades</option>
                    <option value="terminada">Terminada</option>
                    <option value="probada">Probada</option>
                    <option value="bloqueada">Bloqueada</option>
                  </select>

                  <div className="flex rounded-xl bg-neutral-950 p-0.5 border border-neutral-800 shrink-0">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        viewMode === 'table'
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Tabla
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        viewMode === 'kanban'
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Kanban
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              MAIN BOARD: 100%-VIEWPORT-FITTING TABLE OR KANBAN
             =============================================================== */}
          {viewMode === 'table' ? (
            <>
              {/* Mobile & Tablet Stacked Cards (< lg) — 100% visible & inline modifiable */}
              <div className="lg:hidden space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-500 text-xs">
                    No se encontraron solicitudes con los filtros actuales.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isRowEditing = inlineEditTask?.id === task.id;
                    const canDeleteThis =
                      canDeleteTasks &&
                      (task.status !== 'finalizado' || canDeleteFinalizedTask);

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isRowEditing
                            ? 'bg-neutral-900 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                            : 'bg-neutral-900/80 border-neutral-800'
                        }`}
                      >
                        {isRowEditing && inlineEditTask ? (
                          <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                              <span className="font-semibold text-cyan-300">
                                Modificando solicitud en pantalla
                              </span>
                              <button
                                type="button"
                                onClick={() => setInlineEditTask(null)}
                                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1">
                                Título de la Solicitud
                              </label>
                              <textarea
                                rows={2}
                                maxLength={MAX_TITLE_LENGTH}
                                value={inlineEditTask.title}
                                onChange={(e) =>
                                  setInlineEditTask({
                                    ...inlineEditTask,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[11px] text-neutral-400 block mb-1">
                                  Módulo
                                </label>
                                <input
                                  type="text"
                                  maxLength={MAX_MODULE_LENGTH}
                                  value={inlineEditTask.module}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      module: e.target.value,
                                    })
                                  }
                                  className="min-h-[40px] w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-400 block mb-1">
                                  Especificaciones (Specs)
                                </label>
                                <input
                                  type="text"
                                  maxLength={MAX_SPECS_LENGTH}
                                  value={inlineEditTask.specs || ''}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      specs: e.target.value,
                                    })
                                  }
                                  placeholder="Detalle técnico opcional..."
                                  className="min-h-[40px] w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[11px] text-neutral-400 block mb-1">
                                  Solicitante
                                </label>
                                <select
                                  value={inlineEditTask.requestedBy}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      requestedBy: e.target.value as TaskRequester,
                                    })
                                  }
                                  className="min-h-[40px] w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100"
                                >
                                  <option value="Coty">Coty</option>
                                  <option value="Yasmín">Yasmín</option>
                                  <option value="Sucursales">Sucursales</option>
                                  <option value="Administración">Administración</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-400 block mb-1">
                                  Prioridad
                                </label>
                                <select
                                  value={inlineEditTask.priority}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      priority: e.target.value as TaskPriority,
                                    })
                                  }
                                  className="min-h-[40px] w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100"
                                >
                                  <option value="urgente">Urgente</option>
                                  <option value="alta">Alta</option>
                                  <option value="media">Media</option>
                                  <option value="baja">Baja</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[11px] text-cyan-300 block mb-1">
                                  Fecha Límite
                                </label>
                                <input
                                  type="date"
                                  value={inlineEditTask.deadline}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      deadline: e.target.value,
                                    })
                                  }
                                  className="min-h-[40px] w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100 font-mono tabular-nums"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-400 block mb-1">
                                  Estado
                                </label>
                                <select
                                  value={inlineEditTask.status}
                                  onChange={(e) =>
                                    setInlineEditTask({
                                      ...inlineEditTask,
                                      status: e.target.value as TaskStatus,
                                    })
                                  }
                                  className="min-h-[40px] w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100"
                                >
                                  <option value="finalizado">Finalizado (LISTO)</option>
                                  <option value="en_curso">En Curso</option>
                                  <option value="sin_novedades">Sin Novedades</option>
                                  <option value="terminada">Terminada</option>
                                  <option value="probada">Probada</option>
                                  <option value="bloqueada">Bloqueada</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1">
                                Observaciones & Avance
                              </label>
                              <textarea
                                rows={3}
                                maxLength={MAX_OBSERVATIONS_LENGTH}
                                value={inlineEditTask.observations}
                                onChange={(e) =>
                                  setInlineEditTask({
                                    ...inlineEditTask,
                                    observations: e.target.value,
                                  })
                                }
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setInlineEditTask(null)}
                                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={saveInlineRowEdit}
                                className="min-h-[40px] px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Guardar todo</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <div className="text-[11px] font-mono text-cyan-300">
                                  {task.module}
                                </div>
                                <h4 className="font-serif font-bold text-base text-neutral-100 leading-snug flex items-start gap-1.5">
                                  {task.status === 'finalizado' && (
                                    <span className="text-emerald-400 text-xs mt-1 shrink-0">
                                      ✓
                                    </span>
                                  )}
                                  <span>{task.title}</span>
                                </h4>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {confirmDeleteId === task.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => executeDeleteTask(task.id)}
                                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold cursor-pointer"
                                    >
                                      Borrar
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startInlineRowEdit(task)}
                                      className="min-h-[36px] px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-200 hover:bg-cyan-500/25 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Modificar</span>
                                    </button>
                                    {canDeleteThis && (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(task.id)}
                                        className="min-h-[36px] min-w-[36px] rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center cursor-pointer"
                                        title="Eliminar tarea"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {task.specs && (
                              <div className="text-[11px] text-neutral-300 bg-neutral-950/60 px-3 py-2 rounded-xl border border-neutral-800/80 leading-relaxed">
                                <span className="text-neutral-400 font-semibold">Specs: </span>
                                {task.specs}
                              </div>
                            )}

                            {/* All 4 Selectors Editable Directly on Mobile Card */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400 block mb-1">
                                  Solicitante
                                </label>
                                <select
                                  value={task.requestedBy}
                                  onChange={(e) =>
                                    handleRequesterChange(
                                      task.id,
                                      e.target.value as TaskRequester
                                    )
                                  }
                                  className={`min-h-[40px] w-full border rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer ${getRequesterSelectStyle(
                                    task.requestedBy
                                  )}`}
                                >
                                  <option value="Coty" className="bg-neutral-900 text-neutral-100">
                                    Coty
                                  </option>
                                  <option value="Yasmín" className="bg-neutral-900 text-neutral-100">
                                    Yasmín
                                  </option>
                                  <option
                                    value="Sucursales"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Sucursales
                                  </option>
                                  <option
                                    value="Administración"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Administración
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-neutral-400 block mb-1">
                                  Prioridad
                                </label>
                                <select
                                  value={task.priority}
                                  onChange={(e) =>
                                    handlePriorityChange(
                                      task.id,
                                      e.target.value as TaskPriority
                                    )
                                  }
                                  className={`min-h-[40px] w-full border rounded-xl px-2.5 py-1 text-xs uppercase focus:outline-none cursor-pointer ${getPrioritySelectStyle(
                                    task.priority
                                  )}`}
                                >
                                  <option value="urgente" className="bg-neutral-900 text-neutral-100">
                                    Urgente
                                  </option>
                                  <option value="alta" className="bg-neutral-900 text-neutral-100">
                                    Alta
                                  </option>
                                  <option value="media" className="bg-neutral-900 text-neutral-100">
                                    Media
                                  </option>
                                  <option value="baja" className="bg-neutral-900 text-neutral-100">
                                    Baja
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-cyan-300/90 block mb-1">
                                  Fecha Límite
                                </label>
                                <div className="min-h-[40px] flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1">
                                  <Calendar className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                                  <input
                                    type="date"
                                    value={task.deadline}
                                    onChange={(e) =>
                                      handleDeadlineChange(task.id, e.target.value)
                                    }
                                    className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-full tabular-nums"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] text-neutral-400 block mb-1">
                                  Estado
                                </label>
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    handleStatusChange(task.id, e.target.value as TaskStatus)
                                  }
                                  className={`min-h-[40px] w-full border rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer ${getStatusSelectStyle(
                                    task.status
                                  )}`}
                                >
                                  <option
                                    value="finalizado"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Finalizado (LISTO)
                                  </option>
                                  <option
                                    value="en_curso"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    En Curso
                                  </option>
                                  <option
                                    value="sin_novedades"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Sin Novedades
                                  </option>
                                  <option
                                    value="terminada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Terminada
                                  </option>
                                  <option
                                    value="probada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Probada
                                  </option>
                                  <option
                                    value="bloqueada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Bloqueada
                                  </option>
                                </select>
                              </div>
                            </div>

                            {/* Observations Inline */}
                            <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                <span>Observaciones & Avance</span>
                                {editingObsTaskId !== task.id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingObsTaskId(task.id);
                                      setTempObsText(task.observations);
                                    }}
                                    className="inline-flex items-center gap-1 text-cyan-300 font-medium cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Editar nota</span>
                                  </button>
                                )}
                              </div>

                              {editingObsTaskId === task.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    rows={3}
                                    maxLength={MAX_OBSERVATIONS_LENGTH}
                                    value={tempObsText}
                                    onChange={(e) => setTempObsText(e.target.value)}
                                    className="w-full bg-neutral-950 border border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingObsTaskId(null)}
                                      className="min-h-[36px] px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-xs cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveObservation(task.id)}
                                      className="min-h-[36px] px-3.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Guardar</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingObsTaskId(task.id);
                                    setTempObsText(task.observations);
                                  }}
                                  className="text-xs text-neutral-200 leading-relaxed bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 cursor-pointer break-words"
                                >
                                  {task.observations}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Full-Viewport Table (lg+) — w-full table-fixed, ZERO horizontal overflow, 100% visible & inline modifiable */}
              <div className="hidden lg:block rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl">
                <table className="w-full table-fixed text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/85 text-neutral-400 text-[11px] font-semibold">
                      <th className="py-3 px-4 w-[35%]">
                        Solicitud a Víctor · Módulo & Especificaciones
                      </th>
                      <th className="py-3 px-2.5 w-[13%]">
                        Solicita & Prioridad
                      </th>
                      <th className="py-3 px-2.5 w-[16%]">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Fecha Límite & Estado</span>
                        </span>
                      </th>
                      <th className="py-3 px-3.5 w-[26%]">
                        Observaciones & Avance (Click para modificar)
                      </th>
                      <th className="py-3 px-3 w-[10%] text-right">
                        Modificar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/70">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-neutral-500 text-sm">
                          No se encontraron solicitudes con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const isRowEditing = inlineEditTask?.id === task.id;
                        const canDeleteThis =
                          canDeleteTasks &&
                          (task.status !== 'finalizado' || canDeleteFinalizedTask);

                        return (
                          <tr
                            key={task.id}
                            className={`transition-colors align-top group ${
                              isRowEditing
                                ? 'bg-cyan-950/20'
                                : 'hover:bg-neutral-800/30'
                            }`}
                          >
                            {/* COL 1 (35%): Full Title, Module & Complete Specs (Editable Inline) */}
                            <td className="py-3.5 px-4 break-words">
                              {isRowEditing && inlineEditTask ? (
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[10px] text-cyan-300 font-semibold block mb-0.5">
                                      Título de la Solicitud
                                    </label>
                                    <textarea
                                      rows={2}
                                      maxLength={MAX_TITLE_LENGTH}
                                      value={inlineEditTask.title}
                                      onChange={(e) =>
                                        setInlineEditTask({
                                          ...inlineEditTask,
                                          title: e.target.value,
                                        })
                                      }
                                      className="w-full bg-neutral-950 border border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-medium focus:outline-none"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-0.5">
                                        Módulo
                                      </label>
                                      <input
                                        type="text"
                                        maxLength={MAX_MODULE_LENGTH}
                                        value={inlineEditTask.module}
                                        onChange={(e) =>
                                          setInlineEditTask({
                                            ...inlineEditTask,
                                            module: e.target.value,
                                          })
                                        }
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-500/60"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-0.5">
                                        Especificaciones (Specs)
                                      </label>
                                      <input
                                        type="text"
                                        maxLength={MAX_SPECS_LENGTH}
                                        value={inlineEditTask.specs || ''}
                                        onChange={(e) =>
                                          setInlineEditTask({
                                            ...inlineEditTask,
                                            specs: e.target.value,
                                          })
                                        }
                                        placeholder="Detalle técnico..."
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500/60"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div
                                    onClick={() => startInlineRowEdit(task)}
                                    className="font-serif font-bold text-sm text-neutral-100 hover:text-cyan-200 transition-colors flex items-start gap-1.5 cursor-pointer leading-snug"
                                    title="Clic para modificar título, módulo o especificaciones"
                                  >
                                    {task.status === 'finalizado' && (
                                      <span
                                        className="text-emerald-400 text-xs mt-0.5 shrink-0"
                                        title="Completado / Listo"
                                      >
                                        ✓
                                      </span>
                                    )}
                                    <span className="whitespace-normal break-words">
                                      {task.title}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-neutral-400 leading-relaxed whitespace-normal break-words">
                                    <span className="font-mono text-cyan-300 font-medium">
                                      {task.module}
                                    </span>
                                    {task.specs && (
                                      <>
                                        <span className="mx-1.5 text-neutral-600" aria-hidden="true">
                                          ·
                                        </span>
                                        <span
                                          onClick={() => startInlineRowEdit(task)}
                                          className="text-neutral-300 hover:text-neutral-100 cursor-pointer"
                                          title="Clic para modificar especificaciones"
                                        >
                                          <strong className="text-neutral-400 font-medium">
                                            Specs:
                                          </strong>{' '}
                                          {task.specs}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* COL 2 (13%): Requester & Priority (Directly Modifiable Selects) */}
                            <td className="py-3.5 px-2.5">
                              <div className="space-y-1.5">
                                <select
                                  aria-label="Solicitante"
                                  value={
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.requestedBy
                                      : task.requestedBy
                                  }
                                  onChange={(e) => {
                                    const nextVal = e.target.value as TaskRequester;
                                    if (isRowEditing && inlineEditTask) {
                                      setInlineEditTask({
                                        ...inlineEditTask,
                                        requestedBy: nextVal,
                                      });
                                    } else {
                                      handleRequesterChange(task.id, nextVal);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none cursor-pointer transition-colors ${getRequesterSelectStyle(
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.requestedBy
                                      : task.requestedBy
                                  )}`}
                                >
                                  <option value="Coty" className="bg-neutral-900 text-neutral-100">
                                    Coty
                                  </option>
                                  <option value="Yasmín" className="bg-neutral-900 text-neutral-100">
                                    Yasmín
                                  </option>
                                  <option
                                    value="Sucursales"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Sucursales
                                  </option>
                                  <option
                                    value="Administración"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Administración
                                  </option>
                                </select>

                                <select
                                  aria-label="Prioridad"
                                  value={
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.priority
                                      : task.priority
                                  }
                                  onChange={(e) => {
                                    const nextPrio = e.target.value as TaskPriority;
                                    if (isRowEditing && inlineEditTask) {
                                      setInlineEditTask({
                                        ...inlineEditTask,
                                        priority: nextPrio,
                                      });
                                    } else {
                                      handlePriorityChange(task.id, nextPrio);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-2 py-1 text-[11px] uppercase tracking-wide focus:outline-none cursor-pointer transition-colors ${getPrioritySelectStyle(
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.priority
                                      : task.priority
                                  )}`}
                                >
                                  <option value="urgente" className="bg-neutral-900 text-neutral-100">
                                    Urgente
                                  </option>
                                  <option value="alta" className="bg-neutral-900 text-neutral-100">
                                    Alta
                                  </option>
                                  <option value="media" className="bg-neutral-900 text-neutral-100">
                                    Media
                                  </option>
                                  <option value="baja" className="bg-neutral-900 text-neutral-100">
                                    Baja
                                  </option>
                                </select>
                              </div>
                            </td>

                            {/* COL 3 (16%): Modifiable Deadline + Modifiable Status (Active on ALL rows) */}
                            <td className="py-3.5 px-2.5">
                              <div className="space-y-1.5">
                                <div
                                  className="flex items-center bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-cyan-500/60 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                                  title="Clic para modificar fecha límite"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                                  <input
                                    type="date"
                                    value={
                                      isRowEditing && inlineEditTask
                                        ? inlineEditTask.deadline
                                        : task.deadline
                                    }
                                    onChange={(e) => {
                                      const nextDate = e.target.value;
                                      if (isRowEditing && inlineEditTask) {
                                        setInlineEditTask({
                                          ...inlineEditTask,
                                          deadline: nextDate,
                                        });
                                      } else {
                                        handleDeadlineChange(task.id, nextDate);
                                      }
                                    }}
                                    className="bg-transparent text-neutral-100 font-mono text-xs focus:outline-none cursor-pointer w-full min-w-0 tabular-nums"
                                  />
                                </div>

                                <select
                                  aria-label="Estado de la solicitud"
                                  value={
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.status
                                      : task.status
                                  }
                                  onChange={(e) => {
                                    const nextStat = e.target.value as TaskStatus;
                                    if (isRowEditing && inlineEditTask) {
                                      setInlineEditTask({
                                        ...inlineEditTask,
                                        status: nextStat,
                                      });
                                    } else {
                                      handleStatusChange(task.id, nextStat);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors ${getStatusSelectStyle(
                                    isRowEditing && inlineEditTask
                                      ? inlineEditTask.status
                                      : task.status
                                  )}`}
                                >
                                  <option
                                    value="finalizado"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Finalizado (LISTO)
                                  </option>
                                  <option
                                    value="en_curso"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    En Curso
                                  </option>
                                  <option
                                    value="sin_novedades"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Sin Novedades
                                  </option>
                                  <option
                                    value="terminada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Terminada
                                  </option>
                                  <option
                                    value="probada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Probada
                                  </option>
                                  <option
                                    value="bloqueada"
                                    className="bg-neutral-900 text-neutral-100"
                                  >
                                    Bloqueada
                                  </option>
                                </select>
                              </div>
                            </td>

                            {/* COL 4 (26%): Full Observations & Avance (Complete text, zero clipping, editable inline) */}
                            <td className="py-3.5 px-3.5 text-xs text-neutral-200 break-words">
                              {isRowEditing && inlineEditTask ? (
                                <div>
                                  <label className="text-[10px] text-cyan-300 font-semibold block mb-0.5">
                                    Observaciones & Avance
                                  </label>
                                  <textarea
                                    rows={3}
                                    maxLength={MAX_OBSERVATIONS_LENGTH}
                                    value={inlineEditTask.observations}
                                    onChange={(e) =>
                                      setInlineEditTask({
                                        ...inlineEditTask,
                                        observations: e.target.value,
                                      })
                                    }
                                    className="w-full bg-neutral-950 border border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 leading-relaxed focus:outline-none"
                                  />
                                </div>
                              ) : editingObsTaskId === task.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    rows={3}
                                    maxLength={MAX_OBSERVATIONS_LENGTH}
                                    value={tempObsText}
                                    onChange={(e) => setTempObsText(e.target.value)}
                                    className="w-full bg-neutral-950 border border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 leading-relaxed focus:outline-none"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setEditingObsTaskId(null)}
                                      className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 hover:text-white text-[11px] cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveObservation(task.id)}
                                      className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Guardar</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingObsTaskId(task.id);
                                    setTempObsText(task.observations);
                                  }}
                                  className="cursor-pointer hover:bg-neutral-950/75 p-2 rounded-lg border border-transparent hover:border-neutral-700 transition-colors flex items-start justify-between gap-2"
                                  title="Clic para modificar observaciones directamente"
                                >
                                  <span className="leading-relaxed whitespace-normal break-words">
                                    {task.observations}
                                  </span>
                                  <Edit3 className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-300 shrink-0 mt-0.5" />
                                </div>
                              )}
                            </td>

                            {/* COL 5 (10%): Always-Visible Modificar / Guardar / Borrar Controls */}
                            <td className="py-3.5 px-3 text-right">
                              {isRowEditing ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={saveInlineRowEdit}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/50 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 shrink-0" />
                                    <span>Guardar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineEditTask(null)}
                                    className="w-full px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] cursor-pointer text-center"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : confirmDeleteId === task.id ? (
                                <div className="flex flex-col items-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => executeDeleteTask(task.id)}
                                    className="w-full px-2 py-1 rounded-lg bg-red-500/25 text-red-200 border border-red-500/50 text-[11px] font-bold hover:bg-red-500/35 cursor-pointer text-center"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="w-full px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[11px] hover:bg-neutral-700 cursor-pointer text-center"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startInlineRowEdit(task)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/35 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                    title="Modificar título, módulo, especificaciones y todos los datos en esta misma fila"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Modificar</span>
                                  </button>

                                  {canDeleteThis && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(task.id)}
                                      className="px-2 py-1 rounded-lg text-neutral-500 hover:text-red-300 hover:bg-red-500/10 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Eliminar solicitud"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Borrar</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Kanban View: 1 col mobile, 2 cols tablet, 4 cols xl desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Column 1: Finalizado / LISTO */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-serif font-bold text-emerald-300">
                    Finalizado (LISTO)
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold tabular-nums">
                    {filteredTasks.filter((t) => t.status === 'finalizado').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filteredTasks
                    .filter((t) => t.status === 'finalizado')
                    .map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDeadlineChange={handleDeadlineChange}
                        onEdit={() => setEditingTask(t)}
                      />
                    ))}
                </div>
              </div>

              {/* Column 2: En Curso */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-serif font-bold text-blue-300">
                    En Curso (Víctor)
                  </span>
                  <span className="text-xs font-mono text-blue-300 font-bold tabular-nums">
                    {filteredTasks.filter((t) => t.status === 'en_curso').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filteredTasks
                    .filter((t) => t.status === 'en_curso')
                    .map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDeadlineChange={handleDeadlineChange}
                        onEdit={() => setEditingTask(t)}
                      />
                    ))}
                </div>
              </div>

              {/* Column 3: Sin Novedades */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-serif font-bold text-neutral-300">
                    Sin Novedades
                  </span>
                  <span className="text-xs font-mono text-neutral-400 font-bold tabular-nums">
                    {filteredTasks.filter((t) => t.status === 'sin_novedades').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filteredTasks
                    .filter((t) => t.status === 'sin_novedades')
                    .map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDeadlineChange={handleDeadlineChange}
                        onEdit={() => setEditingTask(t)}
                      />
                    ))}
                </div>
              </div>

              {/* Column 4: Terminada / Pendiente Prueba */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-serif font-bold text-amber-300">
                    Terminada / Prueba
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold tabular-nums">
                    {
                      filteredTasks.filter(
                        (t) =>
                          t.status === 'terminada' ||
                          t.status === 'probada' ||
                          t.status === 'bloqueada'
                      ).length
                    }
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filteredTasks
                    .filter(
                      (t) =>
                        t.status === 'terminada' ||
                        t.status === 'probada' ||
                        t.status === 'bloqueada'
                    )
                    .map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDeadlineChange={handleDeadlineChange}
                        onEdit={() => setEditingTask(t)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          VISTA 1.5: ESPECIFICACIÓN DE LOS 10 CAMPOS NUEVOS Y 27 REPORTES
         ========================================================= */}
      {activeSection === 'reports_spec' && (
        <StrategicPlanTracker variant="victor" hideCloudBanner />
      )}

      {/* =========================================================
          VISTA 2: BACKLOG DE 10 IDEAS ESTRATÉGICAS PARA OWL
         ========================================================= */}
      {activeSection === 'backlog' && (
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-cyan-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-100">
                  Backlog de Evolución · 10 Ideas para el Sistema Owl
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">
                Propuestas de alto impacto para futuros sprints de desarrollo. Al tocar "Pasar al Tablero", se crean automáticamente como solicitud activa para Víctor.
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs text-cyan-300 font-mono shrink-0">
              10 propuestas disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SUGGESTIONS.map((sug, index) => (
              <div
                key={sug.id}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-cyan-300 font-mono">
                      0{index + 1}. {sug.defaultModule}
                    </span>
                    <span className="text-amber-400 font-medium text-right">
                      {sug.beneficiary}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-neutral-100 group-hover:text-cyan-200 transition-colors">
                    {sug.title}
                  </h4>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {sug.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400">
                    <strong className="text-cyan-300 block mb-0.5">
                      Impacto Operativo:
                    </strong>
                    <span>{sug.impact}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                    Límite: {sug.suggestedDeadline}
                  </span>

                  <button
                    onClick={() => handleConvertSuggestion(sug)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pasar al Tablero</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA 3: REPORTE TÉCNICO IMPRIMIBLE DE VÍCTOR
         ========================================================= */}
      {activeSection === 'print' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <h3 className="font-serif text-lg font-bold text-cyan-200">
                Minuta Técnica Imprimible · Sistema Owl (Víctor)
              </h3>
              <p className="text-xs text-neutral-400">
                Documento limpio de requerimientos técnicos y estados actuales listo para imprimir o exportar en PDF.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>

          <div className="p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-2xl space-y-6 max-w-6xl mx-auto print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
            <div className="border-b border-cyan-500/30 print:border-black/30 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-cyan-400 print:text-neutral-700 font-mono text-xs font-bold tracking-widest mb-1">
                  OWL SYSTEM · ÁREA DE DESARROLLO
                </div>
                <h1 className="font-serif text-xl sm:text-3xl font-bold text-neutral-100 print:text-black">
                  Estado de Solicitudes Técnicas — Víctor
                </h1>
              </div>
              <div className="text-xs font-mono tabular-nums text-neutral-400 print:text-neutral-700">
                <div>Total Solicitudes: {tasks.length}</div>
                <div>
                  Finalizadas (LISTO): {countFinalizadas} · Pendientes/En Curso:{' '}
                  {tasks.length - countFinalizadas}
                </div>
              </div>
            </div>

            <div>
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 print:border-neutral-400 text-neutral-400 print:text-black text-[11px]">
                    <th className="py-2 pr-3 w-[48%]">Solicitud & Observaciones</th>
                    <th className="py-2 px-2 w-[16%]">Módulo</th>
                    <th className="py-2 px-2 w-[12%]">Solicita</th>
                    <th className="py-2 px-2 w-[12%]">Fecha Límite</th>
                    <th className="py-2 pl-2 w-[12%]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 print:divide-neutral-300">
                  {tasks.map((t) => (
                    <tr key={t.id} className="align-top">
                      <td className="py-2.5 pr-3 break-words">
                        <div className="font-semibold text-neutral-100 print:text-black">
                          {t.title}
                        </div>
                        {t.specs && (
                          <div className="text-[11px] text-neutral-300 print:text-neutral-700 mt-0.5">
                            Specs: {t.specs}
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-400 print:text-neutral-600 mt-0.5">
                          {t.observations}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-cyan-300 print:text-neutral-800 break-words">
                        {t.module}
                      </td>
                      <td className="py-2.5 px-2">{t.requestedBy}</td>
                      <td className="py-2.5 px-2 font-mono tabular-nums">{t.deadline}</td>
                      <td className="py-2.5 pl-2 font-semibold">
                        {getStatusLabel(t.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add New Task for Victor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-neutral-900 border border-cyan-500/40 shadow-2xl p-4 sm:p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-neutral-100">
                    Nueva Solicitud para Víctor
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Asigná un requerimiento técnico para el sistema Owl
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="min-h-[40px] min-w-[40px] rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Título de la Solicitud / Avance Necesario *
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_TITLE_LENGTH}
                  placeholder="Ej: Reporte de Rentabilidad por Sucursal o Ficha de Medidas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    ¿Quién lo solicita?
                  </label>
                  <select
                    value={newRequestedBy}
                    onChange={(e) => setNewRequestedBy(e.target.value as TaskRequester)}
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Coty">Coty (Reportes & Dirección)</option>
                    <option value="Yasmín">Yasmín (Operatividad & Clientes)</option>
                    <option value="Sucursales">Sucursales (Ateliers & Salón)</option>
                    <option value="Administración">Administración & Taller</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Módulo de Sistema
                  </label>
                  <input
                    type="text"
                    maxLength={MAX_MODULE_LENGTH}
                    placeholder="Ej: Owl Reportes, Kommo Sync, Probadores"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-cyan-300 block mb-1">
                    Fecha Límite * (Modificable)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="min-h-[42px] w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="finalizado">Finalizado (LISTO)</option>
                    <option value="en_curso">En Curso</option>
                    <option value="sin_novedades">Sin Novedades</option>
                    <option value="terminada">Terminada</option>
                    <option value="probada">Probada</option>
                    <option value="bloqueada">Bloqueada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Especificaciones Técnicas (Opcional para Víctor)
                </label>
                <input
                  type="text"
                  maxLength={MAX_SPECS_LENGTH}
                  placeholder="Ej: Endpoint REST, Webhook en Kommo, filtro por ID de sucursal"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Observaciones & Notas de Avance
                </label>
                <textarea
                  rows={2}
                  maxLength={MAX_OBSERVATIONS_LENGTH}
                  placeholder="Detalles sobre qué espera Coty o Yasmín de este desarrollo..."
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] sm:min-h-0 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] sm:min-h-0 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  Guardar y Asignar a Víctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Edit Entire Existing Task (used from Kanban cards) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-neutral-900 border border-cyan-500/40 shadow-2xl p-4 sm:p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-neutral-100">
                    Modificar Solicitud Completa
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Actualizá cualquier dato, fecha límite, estado o especificación
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingTask(null)}
                className="min-h-[40px] min-w-[40px] rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Título de la Solicitud *
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_TITLE_LENGTH}
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Solicitante
                  </label>
                  <select
                    value={editingTask.requestedBy}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        requestedBy: e.target.value as TaskRequester,
                      })
                    }
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Coty">Coty (Reportes & Dirección)</option>
                    <option value="Yasmín">Yasmín (Operatividad & Clientes)</option>
                    <option value="Sucursales">Sucursales (Ateliers & Salón)</option>
                    <option value="Administración">Administración & Taller</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Módulo de Sistema
                  </label>
                  <input
                    type="text"
                    maxLength={MAX_MODULE_LENGTH}
                    value={editingTask.module}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, module: e.target.value })
                    }
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-cyan-300 block mb-1">
                    Fecha Límite (Modificable)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTask.deadline}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, deadline: e.target.value })
                    }
                    className="min-h-[42px] w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="finalizado">Finalizado (LISTO)</option>
                    <option value="en_curso">En Curso</option>
                    <option value="sin_novedades">Sin Novedades</option>
                    <option value="terminada">Terminada</option>
                    <option value="probada">Probada</option>
                    <option value="bloqueada">Bloqueada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Especificaciones Técnicas (Specs)
                </label>
                <input
                  type="text"
                  maxLength={MAX_SPECS_LENGTH}
                  value={editingTask.specs || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, specs: e.target.value })
                  }
                  placeholder="Detalle técnico o alcance..."
                  className="min-h-[42px] w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Observaciones & Notas de Avance
                </label>
                <textarea
                  rows={3}
                  maxLength={MAX_OBSERVATIONS_LENGTH}
                  value={editingTask.observations}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, observations: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="min-h-[44px] sm:min-h-0 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] sm:min-h-0 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface KanbanCardProps {
  task: VictorTask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeadlineChange: (taskId: string, newDate: string) => void;
  onEdit: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onStatusChange,
  onDeadlineChange,
  onEdit,
}) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all space-y-2.5 shadow-sm group ${
        task.status === 'finalizado'
          ? 'bg-neutral-950/95 border-emerald-900/40 hover:border-emerald-500/50'
          : 'bg-neutral-950/90 border-neutral-800/80 hover:border-neutral-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-semibold ${
            task.requestedBy === 'Coty'
              ? 'text-amber-300'
              : task.requestedBy === 'Yasmín'
              ? 'text-rose-300'
              : 'text-purple-300'
          }`}
        >
          {task.requestedBy} · {task.priority.toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-cyan-400">{task.module}</span>
          <button
            onClick={onEdit}
            className="text-neutral-400 hover:text-cyan-300 p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Modificar solicitud"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h5 className="font-serif font-bold text-xs text-neutral-100 leading-snug flex items-start gap-1">
        {task.status === 'finalizado' && (
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
        )}
        <span className="break-words">{task.title}</span>
      </h5>

      {task.specs && (
        <p className="text-[11px] text-neutral-400 leading-relaxed break-words">
          <strong className="text-neutral-300">Specs:</strong> {task.specs}
        </p>
      )}

      <p className="text-[11px] text-neutral-300 bg-neutral-900/70 p-2 rounded-lg border border-neutral-800/60 leading-relaxed break-words">
        {task.observations}
      </p>

      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900 gap-2">
        <div className="flex items-center gap-1 font-mono bg-neutral-900/90 px-1.5 py-0.5 rounded border border-neutral-800 hover:border-cyan-500/40">
          <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
          <input
            type="date"
            value={task.deadline}
            onChange={(e) => onDeadlineChange(task.id, e.target.value)}
            className="bg-transparent text-[10px] text-neutral-300 focus:outline-none cursor-pointer w-24 tabular-nums"
            title="Modificar fecha límite"
          />
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`border rounded px-1.5 py-0.5 text-[10px] focus:outline-none cursor-pointer ${
            task.status === 'finalizado'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
          }`}
        >
          <option value="finalizado">Finalizado</option>
          <option value="en_curso">En Curso</option>
          <option value="sin_novedades">Sin Nov.</option>
          <option value="terminada">Terminada</option>
          <option value="probada">Probada</option>
          <option value="bloqueada">Bloqueada</option>
        </select>
      </div>
    </div>
  );
};
