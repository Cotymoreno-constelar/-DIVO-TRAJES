import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle, 
  Compass, 
  Layers, 
  PhoneCall, 
  Globe, 
  Users,
  Store
} from 'lucide-react';

interface Hotspot {
  id: string;
  title: string;
  paperText: string;
  xPercent: number; // position on image
  yPercent: number;
  category: 'systems' | 'paid' | 'organic' | 'web' | 'branches' | 'team';
  technicalMeaning: string;
  strategicAction: string;
  responsible: string;
}

const PAPER_HOTSPOTS: Hotspot[] = [
  {
    id: 'hs-emma',
    title: 'Línea Directa EMMA',
    paperText: '931. - EMMA - 292 745 =',
    xPercent: 18,
    yPercent: 28,
    category: 'systems',
    responsible: 'Yasmín & Asesoras',
    technicalMeaning: 'Canal de concierge telefónico y WhatsApp prioritario para llamadas de alta conversión y reservas de urgencia.',
    strategicAction: 'Conectar este número a un botón flotante en la web con saludo personalizado y derivación inteligente en Kommo.'
  },
  {
    id: 'hs-skysoft',
    title: 'Sky Soft (ERP Central)',
    paperText: 'Sky Soft. / Owl. / Kommo.',
    xPercent: 17,
    yPercent: 55,
    category: 'systems',
    responsible: 'Coty & Administración',
    technicalMeaning: 'Software de gestión de stock, inventario de prendas y telas en taller, sincronización entre sucursales y facturación.',
    strategicAction: 'Asegurar que cada prenda que una clienta reserva en web quede retenida en Sky Soft para evitar duplicidad de prueba.'
  },
  {
    id: 'hs-google-ads',
    title: 'Google Ads (Tere)',
    paperText: 'Ads. Google. [TERE] -> campañas (origen) -> web / EMMA',
    xPercent: 33,
    yPercent: 30,
    category: 'paid',
    responsible: 'Tere',
    technicalMeaning: 'Captura de demanda existente de personas en Córdoba buscando activamente trajes y vestidos con fecha fija de evento.',
    strategicAction: 'Bifurcar los anuncios: tráfico de búsqueda transaccional a la web y llamadas directas al número EMMA.'
  },
  {
    id: 'hs-meta-ads',
    title: 'Meta Ads (Valen)',
    paperText: 'Meta Ads. [VALEN] -> campañas',
    xPercent: 42,
    yPercent: 28,
    category: 'paid',
    responsible: 'Valen',
    technicalMeaning: 'Campañas visuales de Instagram y Facebook que generan aspiración y deseo a través de videos y transformaciones.',
    strategicAction: 'Generar Reels de luz que muestren el movimiento de las prendas con enlaces directos a reservas de probador en Kommo.'
  },
  {
    id: 'hs-pinterest',
    title: 'Pinterest (Bianca)',
    paperText: 'Pinterest. [BIANCA] -> campañas',
    xPercent: 59,
    yPercent: 28,
    category: 'paid',
    responsible: 'Bianca',
    technicalMeaning: 'El mayor canal de descubrimiento para novias y egresadas que construyen su moodboard de estética.',
    strategicAction: 'Publicar pines con Rich Pins hacia la web de DIVO, con tableros segmentados por paleta cromática y estilo.'
  },
  {
    id: 'hs-web',
    title: 'WEB Central: Trajes & Vestidos',
    paperText: 'WEB -> Trajes / Vestidos',
    xPercent: 44,
    yPercent: 62,
    category: 'web',
    responsible: 'Coty & Content Strategist',
    technicalMeaning: 'El núcleo de conversión y autoridad de marca. Debe organizar la experiencia con claridad total para Trajes vs Vestidos.',
    strategicAction: 'Diseñar la Home con navegación dual de alto impacto y un agendador de citas intuitivo con selección de sucursal.'
  },
  {
    id: 'hs-crm-hub',
    title: 'Dúo CRM: Owl & Kommo',
    paperText: 'CRM owl | CRM kommo',
    xPercent: 47,
    yPercent: 47,
    category: 'systems',
    responsible: 'Yasmín & Coty',
    technicalMeaning: 'Kommo atiende de forma omnicanal el chat entrante (< 3 min); Owl almacena el expediente de medidas y citas de prueba.',
    strategicAction: 'Sincronizar ambos CRMs para que el chat de WhatsApp cree automáticamente la ficha de prueba en Owl.'
  },
  {
    id: 'hs-organic-social',
    title: 'Canales Orgánicos (Face, Instg, TikTok, Marketplace)',
    paperText: 'Face / Instg / Tik Tok / Mkt. place -> [Trajes, Vestidos] -> orgánico',
    xPercent: 73,
    yPercent: 40,
    category: 'organic',
    responsible: 'Valen, Bianca & Daniela',
    technicalMeaning: 'Presencia digital continua para construir comunidad, mostrar el detrás de escena de los talleres y educar sobre calce.',
    strategicAction: 'Armar una grilla semanal que alterne: 50% vestidos de luz, 50% sastrería contemporánea, con testimonios reales.'
  },
  {
    id: 'hs-daniela',
    title: 'Daniela · Grupos & Comunidad',
    paperText: 'Daniela Grupos -> Trajes / Vestidos',
    xPercent: 73,
    yPercent: 58,
    category: 'organic',
    responsible: 'Daniela',
    technicalMeaning: 'Social selling e inserción orgánica en grupos de novias, egresados y alianzas con organizadores de bodas.',
    strategicAction: 'Compartir guías útiles de etiqueta y abrir cupos exclusivos de citas para miembros de los grupos.'
  },
  {
    id: 'hs-gmb-branches',
    title: 'Google My Business & Sucursales',
    paperText: 'Google My Business -> Trajes / Vestidos -> direcciones / sucursales: R20, S.V., RECTA, FEM (P de T, V.M.)',
    xPercent: 73,
    yPercent: 75,
    category: 'branches',
    responsible: 'Tere & Coty',
    technicalMeaning: 'Geolocalización en Google Maps para las 5 sedes: Recta Martinolli, Ruta 20, San Vicente, Paseo del Tejar y Villa María.',
    strategicAction: 'Asegurar ficha verificada de cada sede con fotos de probadores, botón de cómo llegar y reseñas estelares.'
  },
  {
    id: 'hs-team-coty',
    title: 'Liderazgo & Dirección: Coty',
    paperText: 'Coty -> YASMIN, BIANCA',
    xPercent: 37,
    yPercent: 93,
    category: 'team',
    responsible: 'Coty',
    technicalMeaning: 'Coty lidera la visión de luz, delegando la coordinación operativa en Yasmín y la curaduría estética en Bianca.',
    strategicAction: 'Reunión semanal de sincronización con indicadores clave: citas agendadas vs ventas cerradas en atelier.'
  },
  {
    id: 'hs-postsale',
    title: 'Sucursales -> Post-Venta & Gestión Propia',
    paperText: 'sucursales -> post-venta / g propio',
    xPercent: 18,
    yPercent: 90,
    category: 'branches',
    responsible: 'Yasmín & Coty',
    technicalMeaning: 'El modelo no termina al cobrar: incluye planchado final, entrega cuidada, mensaje post-evento y recolección de fotos de luz.',
    strategicAction: 'Instituir el protocolo "Momentos DIVO" para que los clientes compartan fotos vistiendo su prenda.'
  }
];

export const PaperInspector: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(PAPER_HOTSPOTS[5]); // Default to Web
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>('all');
  const decodingRef = useRef<HTMLDivElement>(null);

  const filteredHotspots = PAPER_HOTSPOTS.filter(h => {
    if (filterType === 'all') return true;
    return h.category === filterType;
  });

  const scrollToDecoding = () => {
    decodingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-amber-100 font-semibold">
              Del Papel al Ecosistema Digital de DIVO
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
            Acá podés explorar la fotografía del boceto original que dibujaste a mano. Tocá los pines interactivos para ver cómo cada nota, flecha y nombre se transforma en un módulo operativo para tu web y tu equipo.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 text-xs overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'all' ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos ({PAPER_HOTSPOTS.length})
          </button>
          <button
            onClick={() => setFilterType('systems')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'systems' ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sistemas & CRM
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'paid' ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Campañas
          </button>
          <button
            onClick={() => setFilterType('web')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'web' ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Web
          </button>
          <button
            onClick={() => setFilterType('branches')}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'branches' ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sucursales
          </button>
        </div>
      </div>

      {/* Main interactive area: Picture with hotspots + Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Photograph viewer with overlays (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl group select-none">
            
            {/* Zoom Controls Bar */}
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-700/80 shadow-lg text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-amber-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Acercar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-amber-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Alejar zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-amber-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Restablecer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-neutral-400 font-mono px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Hint overlay on sm+ (hidden on small mobile so bottom pins stay 100% unobstructed) */}
            <div className="hidden sm:block absolute bottom-3 left-3 z-30 pointer-events-none bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] text-amber-200">
              💡 Tocá los pines circulares para decodificar cada anotación del papel
            </div>

            {/* The Image Canvas */}
            <div className="relative overflow-auto max-h-[640px] flex items-center justify-center bg-neutral-950 p-1.5 sm:p-2">
              <div 
                className="relative transition-transform duration-300 ease-out origin-top-left"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src="/assets/aistudio/IMG-20261019-WA0242_bc7c8506.jpg"
                  alt="Boceto en papel del flujograma de Coty"
                  className="w-full max-w-4xl rounded-xl object-contain shadow-2xl filter contrast-105 brightness-95"
                />

                {/* Hotspot Pins Rendered on top of image */}
                {filteredHotspots.map(hs => {
                  const isSelected = selectedHotspot?.id === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={() => setSelectedHotspot(hs)}
                      aria-label={hs.title}
                      style={{
                        top: `${hs.yPercent}%`,
                        left: `${hs.xPercent}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className={`absolute z-20 group/pin cursor-pointer transition-all duration-200 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Ripple animation */}
                        <span className={`absolute w-7 h-7 rounded-full animate-ping opacity-75 ${
                          isSelected ? 'bg-amber-400' : 'bg-amber-500/50'
                        }`} />
                        {/* Pin Dot */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 ${
                          isSelected
                            ? 'bg-amber-400 border-neutral-950 text-neutral-950 font-bold scale-110'
                            : 'bg-neutral-950/90 border-amber-400 text-amber-300'
                        } text-[11px]`}>
                          ✨
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/pin:flex items-center px-2 py-1 rounded bg-neutral-950 border border-amber-500/40 text-[10px] text-amber-200 whitespace-nowrap shadow-xl pointer-events-none">
                          {hs.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Mobile active pin bar (unobtrusive caption + quick scroll to decoding) */}
          <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                Pin seleccionado:
              </span>
              <span className="font-serif font-bold text-amber-100 truncate block">
                {selectedHotspot.title}
              </span>
            </div>
            <button
              onClick={scrollToDecoding}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/40 text-[11px] font-semibold shrink-0 cursor-pointer"
            >
              Ver explicación ↓
            </button>
          </div>

          {/* Quick list of annotations below the viewer */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PAPER_HOTSPOTS.map(hs => (
              <button
                key={hs.id}
                onClick={() => {
                  setSelectedHotspot(hs);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setTimeout(scrollToDecoding, 50);
                  }
                }}
                className={`text-xs px-3 py-1.5 min-h-[36px] rounded-lg border transition-all cursor-pointer ${
                  selectedHotspot.id === hs.id
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400 font-medium'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {hs.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Decoding Panel (5 cols) */}
        <div
          ref={decodingRef}
          id="paper-decoding-panel"
          className="lg:col-span-5 xl:col-span-4 space-y-4 scroll-mt-20"
        >
          <div className="rounded-2xl bg-neutral-900/90 border border-amber-500/30 p-4 sm:p-5 shadow-2xl space-y-5">
            
            {/* Hotspot Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-neutral-400 mb-1.5">
                <span className="uppercase tracking-wider font-semibold text-amber-400 text-[10px]">
                  Decodificación Estratégica
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-400">
                  Responsable: {selectedHotspot.responsible}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                {selectedHotspot.title}
              </h3>
            </div>

            {/* Handwritten Text Card */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/20 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
                Texto Exacto en tu Boceto de Papel:
              </span>
              <p className="font-mono text-sm text-amber-300 font-bold bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                "{selectedHotspot.paperText}"
              </p>
            </div>

            {/* Technical & Architectural Meaning */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>¿Qué significa en la Arquitectura de Información?</span>
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                {selectedHotspot.technicalMeaning}
              </p>
            </div>

            {/* Strategic Action Required */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Plan de Acción Inmediato para Coty & Equipo:</span>
              </span>
              <p className="text-xs text-amber-100 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                {selectedHotspot.strategicAction}
              </p>
            </div>

            {/* Strategic alignment with DIVO */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Alineado con el principio de elegancia y presencia de DIVO.</span>
              </div>
            </div>

          </div>

          {/* Paper Insights Card */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 space-y-2">
            <span className="font-serif font-bold text-neutral-200 block text-sm">
              ✨ La visión de Coty en una sola hoja:
            </span>
            <p>
              Tu dibujo manuscrito ya contiene la lógica de un negocio de moda de alta gama: separa el tráfico (campañas pagas y orgánicas), centraliza la promesa en la Web (Trajes vs Vestidos), conecta los CRMs para no perder ningún contacto y aterriza en 5 sucursales presenciales con post-venta.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
