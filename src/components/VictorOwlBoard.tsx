import React, { useState, useEffect } from 'react';
import { 
  VICTOR_INITIAL_TASKS, 
  DEV_SUGGESTIONS 
} from '../data/constelarData';
import { VictorTask, TaskStatus, TaskRequester, TaskPriority, DevSuggestion } from '../types/flow';
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
  Printer
} from 'lucide-react';

const STORAGE_KEY = 'divo_victor_tasks_v3';

interface VictorOwlBoardProps {
  activeSection?: 'board' | 'backlog' | 'print';
  onNavigateSection?: (section: 'board' | 'backlog' | 'print') => void;
}

export const VictorOwlBoard: React.FC<VictorOwlBoardProps> = ({
  activeSection = 'board',
  onNavigateSection
}) => {
  // Load tasks from localStorage if present, or fallback to initial tasks
  const [tasks, setTasks] = useState<VictorTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
    }
    return VICTOR_INITIAL_TASKS;
  });

  // Save to localStorage when tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }, [tasks]);

  // Filters & State
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

  // Modal State for Editing Existing Task
  const [editingTask, setEditingTask] = useState<VictorTask | null>(null);

  // Inline Delete Confirmation (avoids window.confirm in iframe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quick Toast notification when a date or field changes
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Editing observation inline state
  const [editingObsTaskId, setEditingObsTaskId] = useState<string | null>(null);
  const [tempObsText, setTempObsText] = useState<string>('');

  // Status counters
  const countFinalizadas = tasks.filter(t => t.status === 'finalizado').length;
  const countEnCurso = tasks.filter(t => t.status === 'en_curso').length;
  const countSinNovedades = tasks.filter(t => t.status === 'sin_novedades').length;
  const countTerminadas = tasks.filter(t => t.status === 'terminada' || t.status === 'probada').length;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
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
        t.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle changing status directly in board
  const handleStatusChange = (taskId: string, newStat: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStat };
      }
      return t;
    }));
    showToast('Estado de solicitud actualizado');
  };

  // Handle changing deadline directly (Modifiable Date!)
  const handleDeadlineChange = (taskId: string, newDate: string) => {
    if (!newDate) return;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, deadline: newDate };
      }
      return t;
    }));
    showToast(`Fecha límite modificada: ${newDate}`);
  };

  // Handle save inline observation
  const handleSaveObservation = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, observations: tempObsText };
      }
      return t;
    }));
    setEditingObsTaskId(null);
    showToast('Observación guardada');
  };

  // Handle confirmed delete task
  const executeDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setConfirmDeleteId(null);
    showToast('Solicitud eliminada del tablero');
  };

  // Add new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: VictorTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      requestedBy: newRequestedBy,
      module: newModule.trim() || 'Owl CRM',
      priority: newPriority,
      deadline: newDeadline || '2026-11-20',
      status: newStatus,
      observations: newObservations.trim() || 'Sin observaciones registradas todavía.',
      specs: newSpecs.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);
    setIsModalOpen(false);
    resetForm();
    if (onNavigateSection) onNavigateSection('board');
    showToast(`Solicitud creada con fecha límite: ${newTask.deadline}`);
  };

  // Update existing task
  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    showToast(`Solicitud "${editingTask.title}" actualizada`);
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
      title: sug.title,
      requestedBy: requester,
      module: sug.defaultModule,
      priority: 'alta',
      deadline: sug.suggestedDeadline,
      status: 'sin_novedades',
      observations: `Propuesta estratégica: ${sug.description} · Impacto previsto: ${sug.impact}`,
      specs: sug.description,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);
    showToast(`Propuesta enviada al Tablero Activo de Víctor (${sug.suggestedDeadline})`);
    if (onNavigateSection) {
      setTimeout(() => onNavigateSection('board'), 600);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgente':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Urgente</span>;
      case 'alta':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Alta</span>;
      case 'media':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">Media</span>;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'finalizado': return 'Finalizado (LISTO)';
      case 'en_curso': return 'En Curso';
      case 'sin_novedades': return 'Sin Novedades';
      case 'terminada': return 'Terminada';
      case 'probada': return 'Probada';
      case 'bloqueada': return 'Bloqueada';
    }
  };

  return (
    <div className="space-y-8 relative">

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950/95 text-cyan-200 border border-cyan-400 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          VISTA 1: TABLERO DE SOLICITUDES ACTIVAS (TABLA / KANBAN)
         ========================================================= */}
      {activeSection === 'board' && (
        <>
          {/* Victor Hero & System Owl Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/35 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
              {/* Profile & Context */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-neutral-950 font-serif font-bold text-2xl shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-300/40">
                    V
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-900" title="Activo en el sistema Owl" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-100">
                      Gestión de Requerimientos · Sistema Owl
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                      Víctor · Lead Dev
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                    Control centralizado de avances del sistema **Owl** para **Coty** y **Yasmín**. Todas las fechas límite, estados y observaciones técnicas se editan en tiempo real.
                  </p>
                </div>
              </div>

              {/* Action Button: Add Task for Victor */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nueva Solicitud a Víctor</span>
                </button>
              </div>

            </div>

            {/* Real-time counters summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
              <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/40">
                <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
                  <span>✅</span> Finalizadas (LISTO)
                </span>
                <span className="text-xl font-bold font-mono text-emerald-200">{countFinalizadas}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <span className="text-[10px] uppercase font-semibold text-blue-400 block">En Curso</span>
                <span className="text-xl font-bold font-mono text-blue-200">{countEnCurso}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Sin Novedades</span>
                <span className="text-xl font-bold font-mono text-neutral-300">{countSinNovedades}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-[10px] uppercase font-semibold text-amber-400 block">Terminadas / Pruebas</span>
                <span className="text-xl font-bold font-mono text-amber-200">{countTerminadas}</span>
              </div>
            </div>

          </div>

          {/* Filter and View Controls Bar */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Requester Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-neutral-500 text-[11px] uppercase tracking-wider font-semibold mr-1">
                Filtrar:
              </span>
              <button
                onClick={() => setFilterRequester('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filterRequester === 'all'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                onClick={() => setFilterRequester('listo')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterRequester === 'listo'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>✅ Solo con LISTO</span>
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-emerald-300">
                  {countFinalizadas}
                </span>
              </button>
              <button
                onClick={() => setFilterRequester('Coty')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterRequester === 'Coty'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>👑 Solicitudes Coty</span>
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-amber-300">
                  {tasks.filter(t => t.requestedBy === 'Coty').length}
                </span>
              </button>
              <button
                onClick={() => setFilterRequester('Yasmín')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterRequester === 'Yasmín'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>👗 Solicitudes Yasmín</span>
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-rose-300">
                  {tasks.filter(t => t.requestedBy === 'Yasmín').length}
                </span>
              </button>
            </div>

            {/* Status filter & Search */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar solicitud o módulo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500/50 w-48 sm:w-56"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-neutral-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Estados</option>
                <option value="finalizado">✅ Finalizado (LISTO)</option>
                <option value="en_curso">🔵 En Curso</option>
                <option value="sin_novedades">⚪ Sin Novedades</option>
                <option value="terminada">🟡 Terminada</option>
                <option value="probada">🟢 Probada</option>
              </select>

              <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-200' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tabla
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'kanban' ? 'bg-cyan-500/20 text-cyan-200' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Kanban
                </button>
              </div>
            </div>

          </div>

          {/* Main Board: Table View or Kanban View */}
          {viewMode === 'table' ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3.5 px-4 min-w-[220px]">Solicitud a Víctor / Módulo</th>
                      <th className="py-3.5 px-3">Solicitante</th>
                      <th className="py-3.5 px-3">Prioridad</th>
                      <th className="py-3.5 px-3">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Calendar className="w-3.5 h-3.5" />
                          Fecha Límite (Editable)
                        </span>
                      </th>
                      <th className="py-3.5 px-3">Estado</th>
                      <th className="py-3.5 px-4 min-w-[260px]">Observaciones & Avance (Click para editar)</th>
                      <th className="py-3.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-neutral-500 text-sm">
                          No se encontraron solicitudes con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-neutral-800/30 transition-colors group">
                          
                          {/* Title & Module */}
                          <td className="py-3.5 px-4">
                            <div className="font-serif font-bold text-sm text-neutral-100 group-hover:text-cyan-200 transition-colors flex items-start gap-1.5">
                              {task.status === 'finalizado' && (
                                <span className="text-emerald-400 text-xs mt-0.5 shrink-0" title="Completado / Listo">✓</span>
                              )}
                              <span>{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-cyan-300 border border-neutral-800">
                                {task.module}
                              </span>
                              {task.specs && (
                                <span className="text-[10px] text-neutral-500 truncate max-w-xs" title={task.specs}>
                                  Specs: {task.specs}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Requester */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                              task.requestedBy === 'Coty'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : task.requestedBy === 'Yasmín'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            }`}>
                              {task.requestedBy === 'Coty' ? '👑 Coty' : task.requestedBy === 'Yasmín' ? '👗 Yasmín' : '🏬 ' + task.requestedBy}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {getPriorityBadge(task.priority)}
                          </td>

                          {/* MODIFIABLE DEADLINE */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-cyan-500/60 rounded-xl px-2.5 py-1 transition-all group/date cursor-pointer" title="Haz clic en la fecha para modificarla">
                                <Calendar className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                                <input
                                  type="date"
                                  value={task.deadline}
                                  onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                                  className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer w-28"
                                  title="Modificar fecha límite"
                                />
                              </div>
                            </div>
                          </td>

                          {/* Interactive Status Selector */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer ${
                                task.status === 'finalizado'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold'
                                  : task.status === 'en_curso'
                                  ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 font-semibold'
                                  : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                              }`}
                            >
                              <option value="finalizado">✅ Finalizado (LISTO)</option>
                              <option value="en_curso">🔵 En Curso</option>
                              <option value="sin_novedades">⚪ Sin Novedades</option>
                              <option value="terminada">🟡 Terminada</option>
                              <option value="probada">🟢 Probada</option>
                              <option value="bloqueada">🔴 Bloqueada</option>
                            </select>
                          </td>

                          {/* Observations Column (Editable) */}
                          <td className="py-3.5 px-4 text-xs text-neutral-300">
                            {editingObsTaskId === task.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={tempObsText}
                                  onChange={(e) => setTempObsText(e.target.value)}
                                  className="w-full bg-neutral-950 border border-cyan-500/60 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveObservation(task.id)}
                                  className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer"
                                  title="Guardar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingObsTaskId(null)}
                                  className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditingObsTaskId(task.id);
                                  setTempObsText(task.observations);
                                }}
                                className="cursor-pointer hover:bg-neutral-950/70 p-1.5 rounded-lg border border-transparent hover:border-neutral-800 transition-colors flex items-start justify-between gap-2"
                                title="Clic para editar observaciones"
                              >
                                <span className="leading-relaxed">{task.observations}</span>
                                <Edit3 className="w-3.5 h-3.5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                              </div>
                            )}
                          </td>

                          {/* Actions with inline delete confirmation */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {confirmDeleteId === task.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => executeDeleteTask(task.id)}
                                  className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold hover:bg-red-500/30 cursor-pointer"
                                >
                                  Eliminar
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-[10px] hover:bg-neutral-700 cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                                  title="Editar toda la tarea y fechas"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(task.id)}
                                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Eliminar tarea"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Column 1: Finalizado / LISTO */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-serif font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>✅ Finalizado (LISTO)</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-950 text-emerald-300 font-bold">
                    {tasks.filter(t => t.status === 'finalizado').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks.filter(t => t.status === 'finalizado').map(t => (
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
                  <span className="text-xs font-serif font-bold text-blue-300 flex items-center gap-1.5">
                    <span>🔵 En Curso (Víctor)</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-950 text-blue-300 font-bold">
                    {tasks.filter(t => t.status === 'en_curso').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks.filter(t => t.status === 'en_curso').map(t => (
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
                  <span className="text-xs font-serif font-bold text-neutral-300 flex items-center gap-1.5">
                    <span>⚪ Sin Novedades</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-400 font-bold">
                    {tasks.filter(t => t.status === 'sin_novedades').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks.filter(t => t.status === 'sin_novedades').map(t => (
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
                  <span className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🟡 Terminada / Prueba</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-950 text-amber-300 font-bold">
                    {tasks.filter(t => t.status === 'terminada' || t.status === 'probada').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks.filter(t => t.status === 'terminada' || t.status === 'probada').map(t => (
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
          VISTA 2: BACKLOG DE 10 IDEAS ESTRATÉGICAS PARA OWL
         ========================================================= */}
      {activeSection === 'backlog' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-cyan-500/30 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-100">
                  Backlog de Evolución · 10 Ideas para el Sistema Owl
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">
                Propuestas de alto impacto para futuros sprints de desarrollo. Al hacer clic en "Pasar al Tablero", se crean automáticamente como solicitud activa para Víctor.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium shrink-0">
              10 Propuestas Disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SUGGESTIONS.map((sug, index) => (
              <div 
                key={sug.id} 
                className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                      #{index + 1} · {sug.defaultModule}
                    </span>
                    <span className="text-amber-400 font-semibold">
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
                    <strong className="text-cyan-300 block mb-0.5">Impacto Operativo:</strong>
                    <span>{sug.impact}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Límite sugerido: {sug.suggestedDeadline}
                  </span>

                  <button
                    onClick={() => handleConvertSuggestion(sug)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-2xl space-y-6 max-w-5xl mx-auto print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
            <div className="border-b border-cyan-500/30 print:border-black/30 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-cyan-400 print:text-neutral-700 font-mono uppercase text-xs font-bold tracking-widest mb-1">
                  OWL SYSTEM · ÁREA DE DESARROLLO
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-100 print:text-black">
                  Estado de Solicitudes Técnicas — Víctor
                </h1>
              </div>
              <div className="text-xs font-mono text-neutral-400 print:text-neutral-700">
                <div>Total Solicitudes: {tasks.length}</div>
                <div>Finalizadas (LISTO): {countFinalizadas} · Pendientes/En Curso: {tasks.length - countFinalizadas}</div>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-700 print:border-neutral-400 text-neutral-400 print:text-black uppercase text-[10px]">
                  <th className="py-2 pr-3">Solicitud</th>
                  <th className="py-2 px-2">Módulo</th>
                  <th className="py-2 px-2">Solicita</th>
                  <th className="py-2 px-2">Fecha Límite</th>
                  <th className="py-2 pl-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 print:divide-neutral-300">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-neutral-100 print:text-black">{t.title}</div>
                      <div className="text-[11px] text-neutral-400 print:text-neutral-600 mt-0.5">{t.observations}</div>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-[11px] text-cyan-300 print:text-neutral-800 whitespace-nowrap">{t.module}</td>
                    <td className="py-2.5 px-2 whitespace-nowrap">{t.requestedBy}</td>
                    <td className="py-2.5 px-2 font-mono whitespace-nowrap">{t.deadline}</td>
                    <td className="py-2.5 pl-2 font-semibold whitespace-nowrap">{getStatusLabel(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to Add New Task for Victor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-cyan-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-neutral-100">
                    Nueva Solicitud para Víctor
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Asigná un requerimiento técnico para el sistema Owl
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                  Título de la Solicitud / Avance Necesario *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reporte de Rentabilidad por Sucursal o Ficha de Medidas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    ¿Quién lo solicita?
                  </label>
                  <select
                    value={newRequestedBy}
                    onChange={(e) => setNewRequestedBy(e.target.value as TaskRequester)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Coty">👑 Coty (Reportes & Dirección)</option>
                    <option value="Yasmín">👗 Yasmín (Operatividad & Clientes)</option>
                    <option value="Sucursales">🏬 Sucursales (Ateliers & Salón)</option>
                    <option value="Administración">💼 Administración & Taller</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Módulo de Sistema
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Owl Reportes, Kommo Sync, Probadores"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="urgente">🔴 Urgente</option>
                    <option value="alta">🟡 Alta</option>
                    <option value="media">⚪ Media</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-cyan-300 block mb-1">
                    Fecha Límite * (Modificable)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="finalizado">✅ Finalizado (LISTO)</option>
                    <option value="en_curso">🔵 En Curso</option>
                    <option value="sin_novedades">⚪ Sin Novedades</option>
                    <option value="terminada">🟡 Terminada</option>
                    <option value="probada">🟢 Probada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                  Observaciones & Notas de Avance
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre qué espera Coty o Yasmín de este desarrollo..."
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
                  Especificaciones Técnicas (Opcional para Víctor)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Endpoint REST, Webhook en Kommo, filtro por ID de sucursal"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  Guardar y Asignar a Víctor
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal to Edit Entire Existing Task & Dates */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-neutral-900 border border-cyan-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-neutral-100">
                    Modificar Solicitud & Fecha
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Actualizá fechas límites, estado o especificaciones
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
              
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                  Título de la Solicitud *
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Solicitante
                  </label>
                  <select
                    value={editingTask.requestedBy}
                    onChange={(e) => setEditingTask({ ...editingTask, requestedBy: e.target.value as TaskRequester })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Coty">👑 Coty (Reportes & Dirección)</option>
                    <option value="Yasmín">👗 Yasmín (Operatividad & Clientes)</option>
                    <option value="Sucursales">🏬 Sucursales (Ateliers & Salón)</option>
                    <option value="Administración">💼 Administración & Taller</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Módulo de Sistema
                  </label>
                  <input
                    type="text"
                    value={editingTask.module}
                    onChange={(e) => setEditingTask({ ...editingTask, module: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="urgente">🔴 Urgente</option>
                    <option value="alta">🟡 Alta</option>
                    <option value="media">⚪ Media</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-cyan-300 block mb-1">
                    Fecha Límite (Modificable)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTask.deadline}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="finalizado">✅ Finalizado (LISTO)</option>
                    <option value="en_curso">🔵 En Curso</option>
                    <option value="sin_novedades">⚪ Sin Novedades</option>
                    <option value="terminada">🟡 Terminada</option>
                    <option value="probada">🟢 Probada</option>
                    <option value="bloqueada">🔴 Bloqueada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300 block mb-1">
                  Observaciones & Notas de Avance
                </label>
                <textarea
                  rows={2}
                  value={editingTask.observations}
                  onChange={(e) => setEditingTask({ ...editingTask, observations: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
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
  onEdit
}) => {
  return (
    <div className={`p-3.5 rounded-xl border transition-all space-y-2.5 shadow-sm group ${
      task.status === 'finalizado'
        ? 'bg-neutral-950/95 border-emerald-900/40 hover:border-emerald-500/50'
        : 'bg-neutral-950/90 border-neutral-800/80 hover:border-neutral-700'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          task.requestedBy === 'Coty' 
            ? 'bg-amber-500/10 text-amber-300' 
            : task.requestedBy === 'Yasmín'
            ? 'bg-rose-500/10 text-rose-300'
            : 'bg-purple-500/10 text-purple-300'
        }`}>
          {task.requestedBy}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-cyan-400">
            {task.module}
          </span>
          <button
            onClick={onEdit}
            className="text-neutral-500 hover:text-cyan-300 p-0.5 transition-colors cursor-pointer"
            title="Editar tarea"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <h5 className="font-serif font-bold text-xs text-neutral-100 leading-snug flex items-start gap-1">
        {task.status === 'finalizado' && (
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
        )}
        <span>{task.title}</span>
      </h5>

      <p className="text-[11px] text-neutral-400 italic bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60 line-clamp-3">
        "{task.observations}"
      </p>

      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900 gap-2">
        {/* Modifiable date in Kanban card */}
        <div className="flex items-center gap-1 font-mono bg-neutral-900/90 px-1.5 py-0.5 rounded border border-neutral-800 hover:border-cyan-500/40">
          <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
          <input
            type="date"
            value={task.deadline}
            onChange={(e) => onDeadlineChange(task.id, e.target.value)}
            className="bg-transparent text-[10px] text-neutral-300 focus:outline-none cursor-pointer w-24"
            title="Modificar fecha límite en Kanban"
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
          <option value="finalizado">✅ Finalizado</option>
          <option value="en_curso">🔵 En Curso</option>
          <option value="sin_novedades">⚪ Sin Nov.</option>
          <option value="terminada">🟡 Terminada</option>
          <option value="probada">🟢 Probada</option>
        </select>
      </div>
    </div>
  );
};
