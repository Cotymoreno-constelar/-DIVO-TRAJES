import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  Layers, 
  ArrowRight, 
  Send, 
  Heart, 
  Sliders, 
  Flame,
  Award,
  Zap,
  RefreshCw
} from 'lucide-react';

interface CopySample {
  id: string;
  category: 'web-hero' | 'whatsapp-kommo' | 'ads' | 'post-sale' | 'daniela-grupos';
  title: string;
  context: string;
  copyText: string;
  tone: string;
  whyItWorks: string;
}

const COPY_LIBRARY: CopySample[] = [
  // Web Hero Copys
  {
    id: 'hero-1',
    category: 'web-hero',
    title: 'Hero Principal · Manifiesto de Luz',
    context: 'Cabecera de la Home al ingresar al sitio',
    copyText: 'La elegancia no se impone: se expande. Vestidos y trajes creados para celebrar la noche donde tu luz es protagonista.',
    tone: 'Inspirador, elevado y seguro',
    whyItWorks: 'Posiciona la prenda no como un gasto, sino como un vehículo de seguridad y brillo personal.'
  },
  {
    id: 'hero-2',
    category: 'web-hero',
    title: 'Hero Sección Trajes · Precisión Sartorial',
    context: 'Cabecera de /trajes para novios, egresados y gala',
    copyText: 'Presencia impecable, caída perfecta. Sastrería contemporánea diseñada para que camines con porte y distinción.',
    tone: 'Sólido, masculino, distinguido',
    whyItWorks: 'Enfoca en el calce y la confianza corporal, dos factores decisivos para hombres al elegir traje.'
  },
  {
    id: 'hero-3',
    category: 'web-hero',
    title: 'Hero Sección Vestidos · Novias & Gala',
    context: 'Cabecera de /vestidos',
    copyText: 'Tejidos nobles que acompañan tu movimiento. Encontrá el vestido que hace que el tiempo se detenga al mirarte al espejo.',
    tone: 'Poético, sensorial, transformador',
    whyItWorks: 'Activa la emoción del probador: ese instante donde la clienta se mira y siente que es "el indicado".'
  },

  // WhatsApp Kommo Scripts
  {
    id: 'wa-1',
    category: 'whatsapp-kommo',
    title: 'Primer Contacto Inmediato (Kommo Bot)',
    context: 'Disparo automático < 1 minuto cuando el usuario deja sus datos en la web o anuncio',
    copyText: '¡Hola! ✨ Qué hermoso saludarte desde DIVO. Soy Yasmín. Ya recibí tu consulta para conocer nuestros diseños. Contame: ¿para qué fecha es tu celebración y qué sucursal te queda más cerca (Recta Martinolli, R20, San Vicente, Paseo del Tejar o Villa María)? Te guardo un probador exclusivo.',
    tone: 'Cálido, profesional y resolutivo',
    whyItWorks: 'Saluda con calidez, se presenta con nombre humano y hace dos preguntas directas para calificar al lead sin agobiar.'
  },
  {
    id: 'wa-2',
    category: 'whatsapp-kommo',
    title: 'Recordatorio de Cita de Prueba (24h antes)',
    context: 'Enviado por Kommo un día antes de la visita a la sucursal',
    copyText: '¡Hola [Nombre]! ✨ Te recordamos que mañana a las [Hora] te esperamos en nuestro atelier de [Sucursal] para tu prueba de diseño. Ya tenemos seleccionadas las prendas que vimos juntas. Podés venir acompañada de hasta dos personas de tu confianza. ¡Nos vemos pronto para empezar a crear tu look!',
    tone: 'Anticipatorio, cordial y tranquilizador',
    whyItWorks: 'Reduce el no-show a menos del 5% y le recuerda que puede venir acompañada, creando un clima de disfrute.'
  },

  // Campañas Ads
  {
    id: 'ads-1',
    category: 'ads',
    title: 'Meta Ads · Video Novias & Gala (Valen)',
    context: 'Texto principal de anuncio en Instagram/Facebook para público femenino',
    copyText: 'Hay momentos que merecen ser recordados para siempre. En DIVO diseñamos vestidos donde cada puntada está pensada para tu distinción. 5 Ateliers en Córdoba. Agendá hoy tu prueba privada.',
    tone: 'Emotivo y con llamada clara a la acción',
    whyItWorks: 'Evoca el valor del recuerdo y ofrece una solución tangible con 5 sucursales disponibles.'
  },
  {
    id: 'ads-2',
    category: 'ads',
    title: 'Google Ads · Búsqueda Trajes Egresados & Novios (Tere)',
    context: 'Titulares y descripción de Google Search',
    copyText: 'Trajes de Novio y Gala en Córdoba | Sastrería a Medida | Ateliers en Recta Martinolli y R20. Ajustes incluidos. Reservá tu turno en 1 minuto.',
    tone: 'Directo, con palabras clave de alta intención y geolocalización',
    whyItWorks: 'Cumple la promesa del algoritmo de Google Ads: responde exactamente a lo que el usuario está tipeando.'
  },

  // Daniela Grupos
  {
    id: 'grupos-1',
    category: 'daniela-grupos',
    title: 'Aporte en Grupos de Novias / Egresadas (Daniela)',
    context: 'Publicación o respuesta empática en grupos de WhatsApp o Facebook',
    copyText: '¡Hola chicas! Sé lo estresante que puede ser buscar vestido y sentir que ninguno te calza bien o que las telas no son lo que prometen. En DIVO tenemos modistería en atelier propio para que cada prenda se ajuste a tu cuerpo real. Si alguna necesita probarse sin compromiso, me escribe y les coordino una cita VIP con café y asesoría.',
    tone: 'Empático, cómplice, sin venta forzada',
    whyItWorks: 'Empatiza con el dolor común (talles ficticios o telas duras) y propone una solución de servicio y afecto.'
  },

  // Post-Venta
  {
    id: 'post-1',
    category: 'post-sale',
    title: 'Mensaje de Luz Post-Evento (A las 48h)',
    context: 'Enviado 2 días después de la fiesta señalada en Owl CRM',
    copyText: '¡Hola [Nombre]! ✨ ¡Esperamos que hayas vivido una fiesta inolvidable! Desde todo el equipo de Coty y DIVO queremos agradecerte de corazón por habernos elegido para un momento tan especial. Si tenés alguna foto donde se vea cómo luciste tu prenda, ¡nos encantaría verla y guardarla en nuestro archivo de momentos inolvidables!',
    tone: 'Amoroso, agradecido y memorable',
    whyItWorks: 'Fideliza de por vida a la familia y genera contenido fotográfico orgánico de altísima credibilidad para redes.'
  }
];

export const UXWritingLaboratory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Generator State
  const [genPrenda, setGenPrenda] = useState<'vestido' | 'traje'>('vestido');
  const [genOcasion, setGenOcasion] = useState<'novia' | 'egreso' | 'gala'>('novia');
  const [genCanal, setGenCanal] = useState<'web' | 'whatsapp' | 'instagram'>('web');

  const filteredCopys = COPY_LIBRARY.filter(c => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate dynamic custom text based on selectors
  const getDynamicCustomCopy = () => {
    if (genPrenda === 'vestido') {
      if (genOcasion === 'novia') {
        if (genCanal === 'web') return 'Tu camino al altar comienza con un diseño que refleje tu esencia más luminosa. En DIVO confeccionamos cada detalle con amor y precisión. Agendá tu prueba privada.';
        if (genCanal === 'whatsapp') return '¡Hola hermosa! ✨ Qué emoción acompañarte en este paso. Contanos: ¿en qué fecha te casás y en cuál de nuestras 5 sedes te gustaría vivir tu primera prueba de novia?';
        return 'El vestido de tus sueños existe y está esperándote en nuestro atelier. Viví la experiencia de alta costura DIVO. Link en bio para reservar turno.';
      } else if (genOcasion === 'egreso') {
        if (genCanal === 'web') return 'Celebrá el final de una etapa brillando como merecés. Vestidos de egresadas diseñados para moverte, bailar y ser el centro de todas las miradas.';
        if (genCanal === 'whatsapp') return '¡Hola! 🎓 Felicitaciones por este gran logro. Ya estamos reservando probadores para egresadas 2026 en Recta Martinolli y R20. ¿Qué estilo de vestido tenés en mente?';
        return 'No te conformes con lo común en tu noche de egresada. Descubrí cortes audaces, espaldas soñadas y caídas de tela espectaculares.';
      } else {
        if (genCanal === 'web') return 'Presencia, caída y distinción para las veladas más inolvidables. Diseños de gala que transforman tu noche en un momento estelar.';
        if (genCanal === 'whatsapp') return '¡Hola! ✨ Para esa gala tan especial tenemos modelos únicos listos para entallar a tu figura. ¿Cuándo te gustaría venir a probarte?';
        return 'Vestir de gala es un ritual de confianza. Descubrí nuestra colección exclusiva con asesoría personalizada.';
      }
    } else {
      // Traje
      if (genOcasion === 'novia') {
        if (genCanal === 'web') return 'El novio también es protagonista. Sastrería contemporánea con solapas en punta, cortes Slim Fit y telas importadas que marcan tu porte en el altar.';
        if (genCanal === 'whatsapp') return '¡Hola! 🤵 Felicitaciones por el casamiento. En DIVO te ayudamos a armar el look completo (traje, chaleco, corbatín y camisa) con prueba de sastrería incluida. ¿Qué fecha es la boda?';
        return 'Un traje a la altura del día más importante de tu vida. Mirá cómo calza nuestra sastrería para novios y padrinos.';
      } else if (genOcasion === 'egreso') {
        if (genCanal === 'web') return 'Terminás la carrera con toda la facha. Trajes modernos, juveniles y entallados a tu cuerpo con servicio de basta y mangas incluido.';
        if (genCanal === 'whatsapp') return '¡Buenas! 🎓 Si estás buscando traje para tu fiesta de egreso, tenemos opciones en alquiler y venta con ajuste en el día. ¿En qué sucursal te queda más cómodo pasar?';
        return 'Llegá a tu colación y baile impecable. Sastrería moderna sin complicaciones. Escribinos para reservar tu talle.';
      } else {
        if (genCanal === 'web') return 'Elegancia Black Tie para momentos clave. Esmoquins y trajes oscuros con corte sartorial que imponen presencia y sobriedad.';
        if (genCanal === 'whatsapp') return '¡Hola! Para tu evento formal tenemos disponibles trajes y esmoquins en todas las tallas con prueba y planchado impecable. ¿Para qué fecha lo necesitás?';
        return 'El traje perfecto no se compra a las apuradas: se prueba con un sastre. Conocé nuestra colección en Recta Martinolli y R20.';
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-amber-100">
              Laboratorio de UX Writing & Voz de Marca DIVO
            </h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Como tu estratega de contenido, preparé este compendio de mensajes con el tono exacto que pediste: <span className="text-amber-300 font-semibold">profesional, creativo, inspirador y directo</span>, alineado con la expansión y la luz. Usalos en la web, en Kommo, en los anuncios de Tere y Valen, y en las sucursales.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
          <span className="font-semibold text-amber-300 block">Los 3 Pilares del Tono:</span>
          <p>1. <strong className="text-neutral-200">Luz:</strong> Eleva la autoestima de quien lee.</p>
          <p>2. <strong className="text-neutral-200">Expansión:</strong> Hace sentir grande y festivo el momento.</p>
          <p>3. <strong className="text-neutral-200">Claridad:</strong> Siempre guía al siguiente paso (agendar).</p>
        </div>
      </div>

      {/* Dynamic Copy Generator Widget for Coty */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-950 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Generador Rápido de Copys para Coty & Equipo
            </h3>
          </div>
          <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono">
            Voz de Luz en 1 Clic
          </span>
        </div>

        {/* Generator Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
              1. Tipo de Prenda
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => setGenPrenda('vestido')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  genPrenda === 'vestido' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                👗 Vestidos
              </button>
              <button
                onClick={() => setGenPrenda('traje')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  genPrenda === 'traje' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
                }`}
              >
                👔 Trajes
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
              2. Ocasión
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => setGenOcasion('novia')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genOcasion === 'novia' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Boda / Novios
              </button>
              <button
                onClick={() => setGenOcasion('egreso')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genOcasion === 'egreso' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Egresados
              </button>
              <button
                onClick={() => setGenOcasion('gala')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genOcasion === 'gala' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Gala / Fiesta
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
              3. Canal de Salida
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => setGenCanal('web')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genCanal === 'web' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sitio Web
              </button>
              <button
                onClick={() => setGenCanal('whatsapp')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genCanal === 'whatsapp' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setGenCanal('instagram')}
                className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                  genCanal === 'instagram' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Redes
              </button>
            </div>
          </div>
        </div>

        {/* Result of Generator */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Propuesta Generada para {genPrenda.toUpperCase()} · {genOcasion.toUpperCase()} ({genCanal.toUpperCase()}):
            </span>
            <p className="font-serif text-base text-neutral-100 italic leading-relaxed">
              "{getDynamicCustomCopy()}"
            </p>
          </div>

          <button
            onClick={() => handleCopy('dynamic', getDynamicCustomCopy())}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedId === 'dynamic' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs for Library */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'all' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Todos los Mensajes ({COPY_LIBRARY.length})
        </button>
        <button
          onClick={() => setSelectedCategory('web-hero')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'web-hero' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Titulares Web
        </button>
        <button
          onClick={() => setSelectedCategory('whatsapp-kommo')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'whatsapp-kommo' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          WhatsApp Kommo (Asesoras)
        </button>
        <button
          onClick={() => setSelectedCategory('ads')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'ads' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Campañas Ads (Tere & Valen)
        </button>
        <button
          onClick={() => setSelectedCategory('daniela-grupos')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'daniela-grupos' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Comunidad & Grupos (Daniela)
        </button>
        <button
          onClick={() => setSelectedCategory('post-sale')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedCategory === 'post-sale' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Post-Venta (48h después)
        </button>
      </div>

      {/* Library Grid of Real Copy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCopys.map((sample) => (
          <div
            key={sample.id}
            className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-serif font-bold text-amber-200 text-sm">
                  {sample.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800">
                  {sample.tone}
                </span>
              </div>

              <span className="text-[11px] text-neutral-400 block mb-2 font-mono">
                Contexto: {sample.context}
              </span>

              {/* Copy Box */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-neutral-200 text-xs sm:text-sm font-sans leading-relaxed italic">
                "{sample.copyText}"
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400 max-w-xs">
                💡 <strong className="text-neutral-300">Por qué funciona:</strong> {sample.whyItWorks}
              </span>

              <button
                onClick={() => handleCopy(sample.id, sample.copyText)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:text-amber-200 hover:bg-neutral-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer shrink-0"
              >
                {copiedId === sample.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
