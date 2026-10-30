import React, { useState } from 'react';
import { 
  WEB_SECTIONS, 
  BRANCH_LOCATIONS 
} from '../data/constelarData';
import { WebSection } from '../types/flow';
import { 
  Globe, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Scissors,
  Star,
  Clock,
  Compass
} from 'lucide-react';

export const WebArchitecture: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<WebSection>(WEB_SECTIONS[0]);
  const [previewCategory, setPreviewCategory] = useState<'both' | 'vestidos' | 'trajes'>('both');
  const [selectedBranchForDemo, setSelectedBranchForDemo] = useState<string>('RECTA');
  const [appointmentStep, setAppointmentStep] = useState<number>(1);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Presentation */}
      <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <h2 className="font-serif text-xl sm:text-3xl font-semibold text-amber-100">
              Arquitectura de Información Web DIVO
            </h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Coty, en tu boceto dibujaste en el centro: <span className="font-mono text-amber-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-bold">WEB → Trajes / Vestidos</span>.
            Esta es la propuesta maestra de arquitectura digital: una plataforma que une la magia estética de alta costura con una máquina de conversión orientada a agendar citas en tus 5 sucursales.
          </p>
        </div>

        {/* Live CTA highlight */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 flex flex-col gap-2 shrink-0">
          <span className="font-serif font-bold text-amber-300 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Principio Clave: "Luz & Expansión"
          </span>
          <p className="text-neutral-300 max-w-xs">
            Cada pantalla debe inspirar confianza inmediata, eliminar dudas de talle o precios, y guiar con suavidad hacia la reserva de probador.
          </p>
        </div>
      </div>

      {/* Two Columns: Section Navigator & Live Interactive Wireframe Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Architecture Sitemap & Copy Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400 flex items-center justify-between">
            <span>Mapa del Sitio Web (Páginas Clave)</span>
            <span className="text-amber-400 font-mono">5 Secciones Estratégicas</span>
          </div>

          <div className="space-y-2">
            {WEB_SECTIONS.map((sec, idx) => {
              const isSelected = selectedSection.id === sec.id;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSection(sec)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {sec.path}
                    </span>
                    <span className="text-[10px] text-amber-400 uppercase font-semibold">
                      Nivel {sec.hierarchyLevel}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-neutral-100 mb-1">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {sec.objective}
                  </p>

                  {/* Micro-tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {sec.keyElements.slice(0, 2).map((elem, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800 truncate max-w-[200px]">
                        ✓ {elem}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed UX Writing Sheet for Selected Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-neutral-800 pb-3">
              <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider">
                Ficha de UX Writing
              </span>
              <span className="font-serif text-sm font-bold text-neutral-200">
                {selectedSection.title}
              </span>
            </div>

            {/* Target Audience */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-0.5">
                Audiencia Objetivo:
              </span>
              <p className="text-xs text-neutral-300 font-medium">
                {selectedSection.targetAudience}
              </p>
            </div>

            {/* Heading & Subheading */}
            <div className="space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Titular Principal (Hero Heading):</span>
                <p className="font-serif text-base font-bold text-neutral-100 italic mt-0.5">
                  "{selectedSection.uxWriting.heroHeading}"
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-800/60">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Bajada / Subtítulo:</span>
                <p className="text-xs text-neutral-300 mt-0.5">
                  "{selectedSection.uxWriting.subheading}"
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-amber-300 font-semibold uppercase block mb-1">Botón Primario (CTA):</span>
                <span className="font-medium text-amber-200">"{selectedSection.uxWriting.primaryCta}"</span>
              </div>
              {selectedSection.uxWriting.secondaryCta && (
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1">Botón Secundario:</span>
                  <span className="font-medium text-neutral-300">"{selectedSection.uxWriting.secondaryCta}"</span>
                </div>
              )}
            </div>

            {/* Microcopy note */}
            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300 block mb-0.5">Microcopy de tranquilidad:</span>
              <span>"{selectedSection.uxWriting.microcopyNote}"</span>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Mockup / Wireframe Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
            <span className="uppercase tracking-wider font-semibold text-neutral-300">
              Prototipo Interactivo de la Experiencia Web
            </span>
            <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulación en Vivo</span>
            </div>
          </div>

          {/* Browser frame mockup */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden ring-1 ring-white/5">
            
            {/* Browser top chrome */}
            <div className="px-3 sm:px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-sm px-2.5 py-1 rounded-md bg-neutral-950 text-neutral-400 text-[11px] font-mono text-center truncate border border-neutral-800">
                divo.com.ar{selectedSection.path}
              </div>
              <div className="text-[11px] text-amber-300 font-serif font-bold shrink-0">
                DIVO
              </div>
            </div>

            {/* Mockup Navbar */}
            <div className="px-3.5 sm:px-6 py-3 bg-neutral-950/90 border-b border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-6">
                <span className="font-serif tracking-widest font-bold text-amber-200 text-sm">
                  DIVO
                </span>
                <nav className="hidden md:flex items-center gap-4 text-neutral-400 text-[11px]">
                  <span className="text-amber-300 font-medium">Vestidos de Novia & Gala</span>
                  <span>Trajes & Sastrería</span>
                  <span>Ateliers (5 Sedes)</span>
                  <span>Manifiesto de Luz</span>
                </nav>
              </div>
              <button className="px-3 py-1.5 min-h-[36px] rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/40 font-medium hover:bg-amber-500/20 text-[11px] shrink-0">
                Agendar Cita VIP
              </button>
            </div>

            {/* Mockup Dynamic Content */}
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gradient-to-b from-neutral-950 via-neutral-900/50 to-neutral-950">
              
              {/* Dual Hero Banner */}
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  Alta Costura · Sastrería · Celebración
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-100 leading-tight">
                  {selectedSection.uxWriting.heroHeading}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {selectedSection.uxWriting.subheading}
                </p>
                
                {/* CTA Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
                  <button className="px-5 py-2.5 min-h-[42px] rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>{selectedSection.uxWriting.primaryCta}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                  {selectedSection.uxWriting.secondaryCta && (
                    <button className="px-4 py-2.5 min-h-[42px] rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs hover:bg-neutral-800 transition-all cursor-pointer">
                      {selectedSection.uxWriting.secondaryCta}
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-neutral-400 italic mt-1">
                  {selectedSection.uxWriting.microcopyNote}
                </p>
              </div>

              {/* The Dual Portal (Trajes vs Vestidos) visual cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                
                {/* Card 1: Vestidos */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-rose-500/30 space-y-3 relative overflow-hidden group hover:border-rose-400 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif tracking-widest text-rose-300 uppercase font-bold">
                      👗 Universo Femenino
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200">
                      Novias & Gala
                    </span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-neutral-100">
                    Colección Vestidos de Luz
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Diseños confeccionados para abrazar tu silueta con soltura y destello. Novias, madrinas, egresadas y galas de alta noche.
                  </p>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Telas nobles: mikado, satén de seda y gasas vaporosas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Probadores privados con asesoría en estilismo</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button className="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold hover:bg-rose-500/25 transition-colors">
                      Explorar Modelos de Vestidos →
                    </button>
                  </div>
                </div>

                {/* Card 2: Trajes */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/30 space-y-3 relative overflow-hidden group hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif tracking-widest text-amber-300 uppercase font-bold">
                      👔 Universo Masculino & Sastrería
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                      Sartorial & Black Tie
                    </span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-neutral-100">
                    Colección Trajes & Esmoquins
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Cortes estilizados Slim & Modern Fit, smoking con solapas de raso y sastrería a medida para novios, padrinos y egresados.
                  </p>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Ajustes milimétricos en hombros y mangas por sastres</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Alquiler, venta y confección exclusiva</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button className="w-full py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold hover:bg-amber-500/25 transition-colors">
                      Explorar Catálogo de Trajes →
                    </button>
                  </div>
                </div>

              </div>

              {/* Interactive Booking Module Mockup (Crucial for CRM link) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-serif font-bold text-neutral-200 text-sm">
                      Módulo de Agendamiento VIP (Conexión Kommo + Owl)
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Paso {appointmentStep} de 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                      1. ¿Qué buscás?
                    </label>
                    <select className="w-full min-h-[42px] bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-200 text-xs">
                      <option>👗 Vestido de Fiesta / Gala</option>
                      <option>👰 Vestido de Novia</option>
                      <option>👔 Traje de Novio / Black Tie</option>
                      <option>🎓 Traje de Egresado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                      2. Elegí tu Atelier
                    </label>
                    <select 
                      value={selectedBranchForDemo}
                      onChange={(e) => setSelectedBranchForDemo(e.target.value)}
                      className="w-full min-h-[42px] bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-200 text-xs"
                    >
                      {BRANCH_LOCATIONS.map(b => (
                        <option key={b.code} value={b.code}>
                          {b.code} · {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                      3. Fecha de tu Evento
                    </label>
                    <input 
                      type="date" 
                      defaultValue="2026-11-20"
                      className="w-full min-h-[42px] bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Asignación automática a la asesora de {selectedBranchForDemo} en Kommo CRM</span>
                  </span>
                  <button className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] rounded-xl bg-amber-500 text-neutral-950 font-semibold text-xs hover:bg-amber-400 transition-colors cursor-pointer">
                    Agendar mi Cita Exclusiva →
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
