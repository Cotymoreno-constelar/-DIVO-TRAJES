import React from 'react';
import { 
  FLOW_NODES, 
  TEAM_MEMBERS, 
  BRANCH_LOCATIONS 
} from '../data/constelarData';
import {
  DEVELOPMENT_ORDER_STAGES,
  OFFICIAL_FORMULAS,
} from '../data/reportsPlanData';
import { 
  Printer, 
  Sparkles, 
  CheckSquare, 
  Download, 
  Check, 
  PhoneCall, 
  Globe, 
  Layers, 
  Store, 
  Users 
} from 'lucide-react';

export const PrintableWorkPlan: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Print Button (Hidden on Print) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-amber-100 font-semibold">
              Papel de Trabajo & Plan de Acción Imprimible
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Formato editorial listo para imprimir en hoja A4 o guardar en PDF para compartir en tu mesa de trabajo con Yasmín, Bianca, Tere, Valen y Daniela.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* The Printable Document Container */}
      <div className="p-4 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-2xl space-y-6 sm:space-y-8 max-w-5xl mx-auto print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
        
        {/* Document Header */}
        <div className="border-b border-amber-500/30 print:border-black/30 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 print:text-amber-800 font-serif tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[11px] sm:text-xs font-bold mb-1">
              ✨ DIVO · ALTA COSTURA & SASTRERÍA
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-neutral-100 print:text-black">
              Plan Maestro de Flujograma Operativo
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 print:text-neutral-700 mt-1 font-sans">
              Basado en el diseño estratégico manuscrito de Coty · Córdoba, Argentina
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-neutral-400 print:text-neutral-600 font-mono">
            <div>Versión: 1.0 Oficial</div>
            <div>Fecha: Octubre 2026</div>
            <div className="text-amber-400 print:text-neutral-900 font-bold">Línea Directa: 931-EMMA-292745</div>
          </div>
        </div>

        {/* 1. VISIÓN Y DIRECTRIZ ESTRATÉGICA */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black flex items-center gap-2">
            <span>1. Manifiesto & Propósito: "Expansión y Luz"</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 print:text-neutral-800 leading-relaxed">
            DIVO opera bajo la premisa de que vestir para una celebración es un acto de transformación personal. El sistema digital no debe ser frío ni transaccional: es un puente cálido, ágil y de excelencia que guía al cliente desde su primer contacto visual en redes hasta su probador privado en atelier.
          </p>
        </div>

        {/* 2. DIAGRAMA SINTÉTICO EN 5 FASES */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black">
            2. Estructura del Flujo de Trabajo (De Punta a Punta)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            
            <div className="p-3.5 rounded-xl bg-neutral-950 print:bg-neutral-100 print:border print:border-neutral-300 border border-neutral-800 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-blue-400 print:text-blue-800 font-bold uppercase">Fase 1</span>
              <h4 className="font-serif font-bold text-neutral-100 print:text-black text-sm my-1">Atracción Multicanal</h4>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-tight">
                • Google Ads (Tere)<br/>
                • Meta Ads (Valen)<br/>
                • Pinterest (Bianca)<br/>
                • Orgánico & GMB
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 print:bg-neutral-100 print:border print:border-neutral-300 border border-amber-500/30 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-amber-400 print:text-amber-800 font-bold uppercase">Fase 2</span>
              <h4 className="font-serif font-bold text-amber-100 print:text-black text-sm my-1">Web & EMMA</h4>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-tight">
                • Bifurcación Trajes vs Vestidos<br/>
                • Línea 931-EMMA-292745<br/>
                • Agenda VIP de Citas
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 print:bg-neutral-100 print:border print:border-neutral-300 border border-purple-500/30 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-purple-400 print:text-purple-800 font-bold uppercase">Fase 3</span>
              <h4 className="font-serif font-bold text-neutral-100 print:text-black text-sm my-1">Calificación CRM</h4>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-tight">
                • Kommo (Chat &lt; 3 min)<br/>
                • Owl (Ficha de medidas)<br/>
                • Sky Soft (Stock y taller)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 print:bg-neutral-100 print:border print:border-neutral-300 border border-rose-500/30 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-rose-400 print:text-rose-800 font-bold uppercase">Fase 4</span>
              <h4 className="font-serif font-bold text-neutral-100 print:text-black text-sm my-1">Red de Ateliers</h4>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-tight">
                • Recta Martinolli<br/>
                • Ruta 20 (R20)<br/>
                • San Vicente (S.V.)<br/>
                • P. del Tejar & Villa María
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 print:bg-neutral-100 print:border print:border-neutral-300 border border-emerald-500/30 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-emerald-400 print:text-emerald-800 font-bold uppercase">Fase 5</span>
              <h4 className="font-serif font-bold text-neutral-100 print:text-black text-sm my-1">Post-Venta</h4>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-tight">
                • Planchado impecable<br/>
                • Mensaje a las 48h<br/>
                • Fotos Momentos DIVO
              </p>
            </div>

          </div>
        </div>

        {/* 3. ROLES Y ASIGNACIONES */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black">
            3. Equipo y Responsabilidades de Trabajo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {TEAM_MEMBERS.map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-neutral-950 print:bg-white print:border print:border-neutral-300 border border-neutral-800">
                <div className="font-serif font-bold text-amber-300 print:text-black text-sm flex items-center justify-between">
                  <span>{m.name}</span>
                  <span className="text-[10px] text-neutral-400 print:text-neutral-600 font-sans font-normal">Equipo Coty</span>
                </div>
                <div className="text-[11px] text-neutral-300 print:text-neutral-700 font-medium my-0.5">{m.role}</div>
                <p className="text-[10px] text-neutral-400 print:text-neutral-600 line-clamp-2 mt-1">
                  {m.responsibilities[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RED DE SUCURSALES */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black">
            4. Despliegue de Ateliers y Puntos de Atención
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 print:grid-cols-5 gap-2 text-xs">
            {BRANCH_LOCATIONS.map(b => (
              <div key={b.id} className="p-2.5 rounded-xl bg-neutral-950 print:bg-white print:border print:border-neutral-300 border border-neutral-800">
                <span className="font-serif font-bold text-amber-300 print:text-black text-sm">{b.code}</span>
                <div className="font-medium text-neutral-200 print:text-black text-[11px] truncate">{b.name}</div>
                <div className="text-[10px] text-neutral-400 print:text-neutral-600 mt-0.5">{b.specialty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CHECKLIST DE ACTIVACIÓN INMEDIATA */}
        <div className="space-y-3 pt-2 border-t border-neutral-800 print:border-black/20">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400 print:text-black shrink-0" />
            <span>5. Checklist de Puesta en Marcha (Próximos 14 Días)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-300 print:text-black">
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" defaultChecked />
              <span>Publicar arquitectura web con bifurcación limpia Trajes / Vestidos.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" defaultChecked />
              <span>Vincular línea telefónica 931-EMMA-292745 en botones directos de llamada.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" />
              <span>Configurar embudo en Kommo para responder WhatsApps en menos de 3 minutos.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" />
              <span>Sincronizar reservas de prendas con el módulo de inventario de Sky Soft.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" />
              <span>Optimizar las 5 fichas de Google Maps con fotos 360° de los probadores.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 print:bg-white print:border print:border-neutral-200 border border-neutral-800 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 shrink-0 accent-amber-400" />
              <span>Activar protocolo de post-venta para pedir foto de la noche de gala a las 48h.</span>
            </label>
          </div>
        </div>

        {/* 6. HOJA DE RUTA DE DATOS Y REPORTES (OWL + SLY SOFT) */}
        <div className="space-y-3 pt-4 border-t border-neutral-800 print:border-black/20">
          <h3 className="font-serif text-lg font-bold text-amber-200 print:text-black">
            6. Seguimiento de Reportes y Campos Nuevos (Owl CRM &amp; Sly Soft)
          </h3>
          <p className="text-xs text-neutral-300 print:text-neutral-800 leading-relaxed">
            Metas rectoras del plan: <strong>1.000 notas mensuales</strong> en Sly Soft, trayectoria de ticket promedio hacia <strong>$200.000</strong>, ausentismo <strong>≤ 20%</strong> (cerrando el 14,5% pendiente), carga de motivo en "No alquiló" <strong>≥ 95%</strong>, mix casamientos + quinceaños del <strong>60% en septiembre</strong> y línea base de CAC / Costo cita asistida / ROAS al <strong>31/03</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {DEVELOPMENT_ORDER_STAGES.map((stage) => (
              <div
                key={stage.stageNumber}
                className="p-3 rounded-xl bg-neutral-950 print:bg-white print:border print:border-neutral-300 border border-neutral-800"
              >
                <div className="font-serif font-bold text-amber-300 print:text-black">
                  Etapa {stage.stageNumber}: {stage.label}
                </div>
                <div className="text-[11px] text-neutral-300 print:text-neutral-700 mt-0.5">
                  {stage.subtitle}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            {OFFICIAL_FORMULAS.map((f, i) => (
              <div key={i} className="text-neutral-300 print:text-neutral-800">
                <strong className="text-neutral-100 print:text-black">{f.metric}:</strong> {f.formula}
              </div>
            ))}
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-6 border-t border-neutral-800 print:border-black/20 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 print:text-neutral-600 gap-4">
          <div>
            Aprobado y refrendado por: <strong className="text-amber-300 print:text-black">Coty · Dirección DIVO</strong>
          </div>
          <div className="font-serif italic text-amber-200 print:text-black">
            "Donde tu luz toma forma."
          </div>
        </div>

      </div>
    </div>
  );
};
