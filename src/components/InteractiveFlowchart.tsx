import React, { useState } from 'react';
import { 
  FLOW_NODES, 
  TEAM_MEMBERS, 
  BRANCH_LOCATIONS 
} from '../data/constelarData';
import { FlowNode, ChannelCategory } from '../types/flow';
import { 
  Search, 
  Compass, 
  Briefcase, 
  Sparkles, 
  Instagram, 
  Share2, 
  Video, 
  ShoppingBag, 
  Users, 
  MapPin, 
  Globe, 
  PhoneCall, 
  MessageSquare, 
  Database, 
  Layers, 
  Store, 
  Award,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  ExternalLink,
  ChevronRight,
  PenTool
} from 'lucide-react';

interface InteractiveFlowchartProps {
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export const InteractiveFlowchart: React.FC<InteractiveFlowchartProps> = ({
  onSelectNode,
  selectedNodeId: externalSelectedNodeId
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>('node-web');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'flow' | 'grid'>('flow');

  const activeId = externalSelectedNodeId || internalSelectedId;
  const activeNode = FLOW_NODES.find(n => n.id === activeId) || FLOW_NODES[0];

  const handleNodeClick = (id: string) => {
    setInternalSelectedId(id);
    if (onSelectNode) onSelectNode(id);
  };

  const getIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case 'Search': return <Search className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Instagram': return <Instagram className={className} />;
      case 'Share2': return <Share2 className={className} />;
      case 'Video': return <Video className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Users': return <Users className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'PhoneCall': return <PhoneCall className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'Database': return <Database className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Award': return <Award className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const getCategoryBadge = (category: ChannelCategory) => {
    switch (category) {
      case 'paid':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">Tráfico Pago</span>;
      case 'organic':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Orgánico & Redes</span>;
      case 'web':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">Núcleo Web & Concierge</span>;
      case 'crm':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">CRM & Sistemas</span>;
      case 'branch':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">Sucursales Físicas</span>;
      case 'post-sale':
        return <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40">Post-Venta & Luz</span>;
      default:
        return null;
    }
  };

  const filteredNodes = FLOW_NODES.filter(node => {
    if (filterCategory !== 'all' && node.category !== filterCategory) return false;
    if (filterResponsible !== 'all' && node.responsible && !node.responsible.toLowerCase().includes(filterResponsible.toLowerCase())) return false;
    return true;
  });

  // Grouped for flow view
  const paidNodes = FLOW_NODES.filter(n => n.category === 'paid');
  const organicNodes = FLOW_NODES.filter(n => n.category === 'organic');
  const webNodes = FLOW_NODES.filter(n => n.category === 'web');
  const crmNodes = FLOW_NODES.filter(n => n.category === 'crm');
  const branchNodes = FLOW_NODES.filter(n => n.category === 'branch' || n.category === 'post-sale');

  return (
    <div className="space-y-6">
      {/* Top Controls & Strategic Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl text-amber-100 font-semibold tracking-wide">
              Flujograma Integral de Operaciones DIVO
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-medium">
              Ecosistema Coty
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Traducción digital del mapa manuscrito en papel: adquisición coordinada por Tere, Valen y Bianca → bifurcación web (Trajes & Vestidos) → gestión en Kommo, Owl y SkySoft → conversión en Ateliers y post-venta estelar.
          </p>
        </div>

        {/* View toggles & filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-500 px-2 font-medium">Filtrar:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer pr-2 text-xs"
            >
              <option value="all" className="bg-neutral-900 text-neutral-100">Todas las fases</option>
              <option value="paid" className="bg-neutral-900 text-neutral-100">Tráfico Pago</option>
              <option value="organic" className="bg-neutral-900 text-neutral-100">Orgánico & Social</option>
              <option value="web" className="bg-neutral-900 text-neutral-100">Web & EMMA</option>
              <option value="crm" className="bg-neutral-900 text-neutral-100">CRM & ERP</option>
              <option value="branch" className="bg-neutral-900 text-neutral-100">Sucursales</option>
              <option value="post-sale" className="bg-neutral-900 text-neutral-100">Post-Venta</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-500 px-2 font-medium">Responsable:</span>
            <select
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer pr-2 text-xs"
            >
              <option value="all" className="bg-neutral-900 text-neutral-100">Todo el equipo</option>
              <option value="Coty" className="bg-neutral-900 text-neutral-100">Coty</option>
              <option value="Yasmín" className="bg-neutral-900 text-neutral-100">Yasmín</option>
              <option value="Bianca" className="bg-neutral-900 text-neutral-100">Bianca</option>
              <option value="Tere" className="bg-neutral-900 text-neutral-100">Tere</option>
              <option value="Valen" className="bg-neutral-900 text-neutral-100">Valen</option>
              <option value="Daniela" className="bg-neutral-900 text-neutral-100">Daniela</option>
              <option value="Víctor" className="bg-neutral-900 text-neutral-100">Víctor (Dev & Owl)</option>
            </select>
          </div>

          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'flow' ? 'bg-amber-500/20 text-amber-200' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vista Flujo
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-amber-500/20 text-amber-200' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vista Cuadrícula
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Flow / Grid + Detail Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: The Interactive Nodes (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {viewMode === 'flow' ? (
            <div className="space-y-8 relative">

              {/* STAGE 1: TRÁFICO Y ADQUISICIÓN (PAGO & ORGÁNICO) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <h3 className="font-serif text-lg font-semibold text-neutral-200">
                      1. Fuentes de Adquisición (Campañas Pagas & Tráfico Orgánico)
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">Paso 1: Atracción</span>
                </div>

                {/* Sub-block Paid */}
                <div className="mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                    <span>Campañas Pagas (Responsables Asignados en el Papel)</span>
                    <span className="h-px bg-neutral-800 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paidNodes.map(node => (
                      <NodeCard
                        key={node.id}
                        node={node}
                        isSelected={node.id === activeId}
                        onClick={() => handleNodeClick(node.id)}
                        getIcon={getIcon}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-block Organic */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                    <span>Canales Orgánicos & Comunidades (Presencia Continua)</span>
                    <span className="h-px bg-neutral-800 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {organicNodes.map(node => (
                      <NodeCard
                        key={node.id}
                        node={node}
                        isSelected={node.id === activeId}
                        onClick={() => handleNodeClick(node.id)}
                        getIcon={getIcon}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* FLOW ARROW CONNECTOR */}
              <div className="flex items-center justify-center -my-3 relative z-10">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-lg shadow-black">
                  <span>Tráfico Calificado & Consultas Inmediatas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* STAGE 2: NÚCLEO WEB & CANAL EMMA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/20 to-neutral-900/60 border border-amber-500/30 relative shadow-xl shadow-amber-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
                    <h3 className="font-serif text-lg font-semibold text-amber-100">
                      2. Núcleo Web & Contacto Central (El Templo Digital)
                    </h3>
                  </div>
                  <span className="text-xs text-amber-300 font-mono font-medium">Bifurcación: Trajes & Vestidos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {webNodes.map(node => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isSelected={node.id === activeId}
                      onClick={() => handleNodeClick(node.id)}
                      getIcon={getIcon}
                      highlight
                    />
                  ))}
                </div>

                {/* Visual Branching Hint */}
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/70 border border-amber-500/20 text-xs text-neutral-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-amber-300 font-semibold">WEB DIVO:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-200 border border-amber-500/30">
                      👔 Línea Trajes (Sartorial / Egresados / Novios)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-200 border border-rose-500/30">
                      👗 Línea Vestidos (Novias / Gala / Madrinas)
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 hidden sm:block" />
                </div>
              </div>

              {/* FLOW ARROW CONNECTOR */}
              <div className="flex items-center justify-center -my-3 relative z-10">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-lg shadow-black">
                  <span>Enrutamiento Automático & Gestión de Leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* STAGE 3: CRM & SISTEMAS (KOMMO, OWL, SKYSOFT) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-purple-900/40 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <h3 className="font-serif text-lg font-semibold text-neutral-200">
                      3. Motores de Seguimiento, Medidas & ERP (Kommo · Owl · SkySoft)
                    </h3>
                  </div>
                  <span className="text-xs text-purple-300 font-mono">Paso 3: Conversación y Control</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {crmNodes.map(node => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isSelected={node.id === activeId}
                      onClick={() => handleNodeClick(node.id)}
                      getIcon={getIcon}
                    />
                  ))}
                </div>
              </div>

              {/* FLOW ARROW CONNECTOR */}
              <div className="flex items-center justify-center -my-3 relative z-10">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-rose-500/40 text-rose-300 text-xs font-semibold shadow-lg shadow-black">
                  <span>Asignación de Cita con Asesora en Atelier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* STAGE 4 & 5: SUCURSALES FÍSICAS & POST-VENTA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-neutral-900/40 to-neutral-950 border border-neutral-800 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <h3 className="font-serif text-lg font-semibold text-neutral-200">
                      4. Red de Ateliers Presenciales & Post-Venta ("Gestión Propia")
                    </h3>
                  </div>
                  <span className="text-xs text-rose-300 font-mono">Paso 4: Experiencia y Retención</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {branchNodes.map(node => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isSelected={node.id === activeId}
                      onClick={() => handleNodeClick(node.id)}
                      getIcon={getIcon}
                    />
                  ))}
                </div>

                {/* Sub-branches list */}
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs">
                  <div className="font-medium text-neutral-300 mb-2 flex items-center justify-between">
                    <span>Ateliers Identificados en el Boceto de Coty:</span>
                    <span className="text-[11px] text-amber-400">Total: 5 Puntos de Atención</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BRANCH_LOCATIONS.map(b => (
                      <div key={b.id} className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
                        <span className="font-serif font-bold text-amber-200 text-sm">{b.code}</span>
                        <span className="text-[11px] text-neutral-400 truncate">{b.name}</span>
                        <span className="text-[9px] text-neutral-500 mt-1">{b.specialty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredNodes.map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={node.id === activeId}
                  onClick={() => handleNodeClick(node.id)}
                  getIcon={getIcon}
                />
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Node Inspector Drawer (Sticky, detailed & actionable) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="rounded-2xl bg-neutral-900/90 border border-amber-500/30 p-5 shadow-2xl backdrop-blur-md space-y-5">
            
            {/* Header of Inspector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                {getCategoryBadge(activeNode.category)}
                <span className="text-[11px] font-mono text-neutral-400">
                  ID: {activeNode.id}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 mt-0.5">
                  {getIcon(activeNode.iconName, "w-5 h-5")}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-100 leading-tight">
                    {activeNode.title}
                  </h3>
                  <p className="text-xs text-amber-400/80 font-medium mt-0.5">
                    {activeNode.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Note reference to paper */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-amber-300">Origen en el papel de Coty:</span>
                <span>{activeNode.paperNoteReference}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-300 leading-relaxed">
              {activeNode.description}
            </p>

            {/* UX Writing Snippet */}
            {activeNode.uxCopySnippet && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-amber-400" />
                    {activeNode.uxCopySnippet.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 italic">
                    Tono: {activeNode.uxCopySnippet.tone}
                  </span>
                </div>
                <div className="text-xs text-neutral-200 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/80 font-sans italic">
                  "{activeNode.uxCopySnippet.text}"
                </div>
              </div>
            )}

            {/* Responsible Person info */}
            {activeNode.responsible && (
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Responsable Asignado:</span>
                  <span className="font-semibold text-neutral-100">{activeNode.responsible}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  Equipo DIVO
                </span>
              </div>
            )}

            {/* Inputs & Outputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-blue-400 block mb-1">Entradas (Inputs)</span>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  {activeNode.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                      <span className="truncate">{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-1">Salidas (Outputs)</span>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  {activeNode.outputs.map((out, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* KPIs */}
            <div>
              <span className="text-[11px] uppercase font-semibold text-amber-300 block mb-1.5">
                KPIs Clave a Monitorear
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.kpis.map((kpi, idx) => (
                  <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{kpi}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended actions */}
            <div>
              <span className="text-[11px] uppercase font-semibold text-neutral-300 block mb-1.5">
                Plan de Acción Inmediato
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {activeNode.recommendedActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-950/40 border border-neutral-800/60">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

interface NodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onClick: () => void;
  getIcon: (name: string, className?: string) => React.ReactNode;
  highlight?: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onClick,
  getIcon,
  highlight = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl transition-all cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-amber-950/40 border-2 border-amber-400 shadow-lg shadow-amber-500/10'
          : highlight
          ? 'bg-neutral-900/90 border border-amber-500/40 hover:border-amber-400 hover:bg-neutral-900'
          : 'bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            isSelected 
              ? 'bg-amber-400 text-neutral-950' 
              : 'bg-neutral-800 text-neutral-200 group-hover:text-amber-300 group-hover:bg-neutral-700'
          } transition-colors`}>
            {getIcon(node.iconName, "w-4 h-4")}
          </div>
          <div>
            <h4 className="font-serif font-bold text-neutral-100 text-sm leading-tight group-hover:text-amber-200 transition-colors">
              {node.title}
            </h4>
            <span className="text-[11px] text-neutral-400">
              {node.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Snippet text */}
      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2">
        {node.description}
      </p>

      {/* Footer tags */}
      <div className="mt-3 flex items-center justify-between text-[10px] border-t border-neutral-800/60 pt-2 text-neutral-400">
        <span className="truncate max-w-[140px] font-mono text-neutral-400">
          {node.tools[0]}
        </span>
        <span className="text-amber-400 flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
          Ver detalles →
        </span>
      </div>
    </div>
  );
};
