import { FlowNode, TeamMember, BranchLocation, WebSection, CustomerJourney, VictorTask, DevSuggestion } from '../types/flow';
import { VICTOR_REPORTES_PACK_TASKS } from './reportsPlanData';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'coty',
    name: 'Coty',
    role: 'Dirección General & Visión de Marca',
    focusArea: 'Expansión, Curaduría de Estilo & Estrategia Integral',
    associatedNodes: ['node-web', 'node-team', 'node-branches'],
    avatarColor: 'from-amber-400 to-amber-600',
    quote: '"Cada prenda refleja distinción y presencia. La web debe transmitir la misma calidez y elegancia que una cita en nuestros ateliers DIVO."',
    responsibilities: [
      'Garantizar que la propuesta de valor y estética mantenga el estándar de alta costura y distinción DIVO.',
      'Supervisión estratégica de campañas y coherencia en sucursales físicas.',
      'Aprobación final de colecciones de Trajes y Vestidos y tono de comunicación.'
    ]
  },
  {
    id: 'yasmin',
    name: 'Yasmín',
    role: 'Coordinación Operativa & Experiencia de Cliente',
    focusArea: 'Atención al Cliente, Tráfico en Sucursales & Post-Venta',
    associatedNodes: ['node-kommo', 'node-branches', 'node-postsale', 'node-skysoft'],
    avatarColor: 'from-rose-400 to-rose-600',
    quote: '"Un cliente que prueba su prenda en DIVO vive una transformación. Mi misión es que el puente del chat a la sucursal sea impecable."',
    responsibilities: [
      'Supervisión del equipo de asesoras en Kommo CRM y derivación ágil a sucursales.',
      'Asegurar el protocolo de hospitalidad en los probadores privados.',
      'Monitoreo del circuito de post-venta y recolección de reseñas estelares.'
    ]
  },
  {
    id: 'bianca',
    name: 'Bianca',
    role: 'Curaduría Visual & Estratega de Pinterest / Social Inspiration',
    focusArea: 'Pinterest, Moodboards Nupciales & Estética',
    associatedNodes: ['node-pinterest', 'node-web'],
    avatarColor: 'from-teal-400 to-emerald-600',
    quote: '"Pinterest es el altar donde novias y egresadas sueñan antes de comprar. Las conectamos desde su deseo con el vestido exacto."',
    responsibilities: [
      'Creación y optimización de pines estéticos con enlaces directos a las fichas web de vestidos y trajes.',
      'Mantenimiento de tableros de tendencias (Novias Divo, Gala Noche, Sastrería Contemporánea).',
      'Coordinación con el equipo creativo para capturas en ateliers y talleres.'
    ]
  },
  {
    id: 'tere',
    name: 'Tere',
    role: 'Especialista en Google Ads & Embudo Search',
    focusArea: 'Campañas de Alta Intención, Google Search & EMMA',
    associatedNodes: ['node-google-ads', 'node-emma', 'node-web'],
    avatarColor: 'from-blue-400 to-indigo-600',
    quote: '"Quien busca en Google ya tiene un evento en mente. Nuestra respuesta debe ser inmediata, clara y llevar a agendar."',
    responsibilities: [
      'Campañas de búsqueda segmentadas (ej: Vestidos de Novia en Córdoba, Alquiler/Venta de Trajes Recta Martinolli).',
      'Configuración de extensiones de llamada con la línea directa EMMA (931-EMMA-292745).',
      'Optimización de conversiones directas hacia la web y medición de costo por cita agendada.'
    ]
  },
  {
    id: 'valen',
    name: 'Valen',
    role: 'Directora de Meta Ads & Performance Visual',
    focusArea: 'Campañas de Instagram/Facebook Ads & Tráfico Calificado',
    associatedNodes: ['node-meta-ads', 'node-kommo', 'node-web'],
    avatarColor: 'from-purple-400 to-pink-600',
    quote: '"Las prendas cobran vida en video. Mostramos la caída de las telas y el calce impecable para provocar el deseo instantáneo de probarse."',
    responsibilities: [
      'Estructura de campañas en Meta Ads: Prospección visual (Reels) y Retargeting con testimonios.',
      'Enrutamiento de anuncios directo a WhatsApp Kommo y al catálogo web interactivo.',
      'Testeo A/B constante de ganchos creativos de "Trajes" vs "Vestidos".'
    ]
  },
  {
    id: 'daniela',
    name: 'Daniela',
    role: 'Gestora de Comunidades, Grupos & Alianzas',
    focusArea: 'Grupos de Facebook/WhatsApp, Wedding Planners & Marketplace',
    associatedNodes: ['node-daniela-grupos', 'node-marketplace', 'node-kommo'],
    avatarColor: 'from-amber-500 to-orange-600',
    quote: '"Estar donde la gente conversa nos da cercanía genuina. El boca a boca en grupos de egresados y novias es oro puro."',
    responsibilities: [
      'Nutrición y respuesta activa en grupos de novias, egresadas y eventos en Córdoba.',
      'Alianzas con organizadores de bodas y fotógrafos para derivación cruzada.',
      'Atención y publicación curada en Marketplace para captar tráfico local.'
    ]
  },
  {
    id: 'victor',
    name: 'Víctor',
    role: 'Líder de Desarrollo · Arquitectura Owl & Cruces Sly Soft',
    focusArea: 'Sistema Owl CRM, Cruce con Sly Soft (Facturación), 10 Campos Base & 27 Reportes',
    associatedNodes: ['node-owl', 'node-kommo', 'node-skysoft', 'node-web'],
    avatarColor: 'from-cyan-400 to-blue-600',
    quote: '"Un sistema robusto es el que no se nota: hace que Yasmín atienda sin fricción y Coty tome decisiones con números exactos y fórmulas fijas en tiempo real."',
    responsibilities: [
      'Implementación prioritaria de los 10 Campos Nuevos en Owl y Sly Soft (Etapa 1: línea base al 31/03).',
      'Desarrollo escalonado de los 27 Reportes del plan de marketing (Citas, Emma, Facturación Sly Soft, CAC/ROAS y Tablero).',
      'Garantizar exportación Excel/CSV, permisos por sucursal vs Dirección e historial auditado sin borrado de estados.',
      'Mantenimiento continuo de Owl CRM, panel operativo de Yasmín y cruce de ID de cita con Sly Soft.'
    ]
  }
];

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: 'recta',
    code: 'RECTA',
    name: 'Atelier Recta Martinolli',
    zone: 'Zona Norte (Córdoba Capital)',
    addressSummary: 'Av. Recta Martinolli — Espacio de Alta Experiencia y Citas VIP',
    specialty: 'Integral (Trajes & Vestidos)',
    crmLink: 'Kommo / Owl ID: SUC-RECTA',
    gmbStatus: 'Optimizado · 4.9 estrellas · Fotos 360° de probadores'
  },
  {
    id: 'r20',
    code: 'R20',
    name: 'Sucursal Ruta 20',
    zone: 'Zona Sur / Suroeste (Córdoba Capital)',
    addressSummary: 'Av. Fuerza Aérea (Ruta 20) — Acceso Rápido y Salón Integral',
    specialty: 'Integral (Trajes & Vestidos)',
    crmLink: 'Kommo / Owl ID: SUC-R20',
    gmbStatus: 'Optimizado · Botón directo a WhatsApp de guardia'
  },
  {
    id: 'sv',
    code: 'S.V.',
    name: 'Sucursal San Vicente',
    zone: 'Tradición y Proximidad (San Vicente)',
    addressSummary: 'Barrio San Vicente — Atención Personalizada & Sastrería',
    specialty: 'Trajes',
    crmLink: 'Kommo / Owl ID: SUC-SV',
    gmbStatus: 'Optimizado · Alta afluencia de clientes de proximidad'
  },
  {
    id: 'fem-pdt',
    code: 'P de T.',
    name: 'Boutique Paseo del Tejar (Línea FEM)',
    zone: 'Centro Comercial Paseo del Tejar',
    addressSummary: 'Paseo del Tejar — Espacio dedicado a Novias, Fiesta y Madrinas',
    specialty: 'Vestidos',
    crmLink: 'Kommo / Owl ID: SUC-PDT',
    gmbStatus: 'Optimizado · Catálogo de vestidos sincronizado'
  },
  {
    id: 'fem-vm',
    code: 'V.M.',
    name: 'Sucursal Villa María (Línea FEM & Expansión)',
    zone: 'Interior de Córdoba (Villa María)',
    addressSummary: 'Centro Comercial Villa María — Punto de Expansión Regional',
    specialty: 'Integral (Trajes & Vestidos)',
    crmLink: 'Kommo / Owl ID: SUC-VM',
    gmbStatus: 'En crecimiento · Conexión regional para eventos'
  }
];

export const FLOW_NODES: FlowNode[] = [
  // --- FUENTES DE TRÁFICO PAGO ---
  {
    id: 'node-google-ads',
    title: 'Google Ads (Search & Maps)',
    subtitle: 'Tere · Intención Alta de Compra',
    category: 'paid',
    responsible: 'Tere',
    iconName: 'Search',
    description: 'Campañas de búsqueda para usuarios con eventos fechados que buscan activamente "vestidos de fiesta", "alquiler de trajes", "novias".',
    paperNoteReference: 'Anotación en papel: "Ads Google - TERE - campañas (origen) -> web / EMMA"',
    inputs: ['Keywords de intención (Córdoba y región)', 'Extensiones de ubicación a Sucursales'],
    outputs: ['node-web', 'node-emma'],
    tools: ['Google Ads', 'Google Tag Manager', 'Línea telefónica EMMA'],
    kpis: ['CTR > 6.5%', 'Costo por Cita Agendada < $4.500 ARS', 'Tasa de conversión web > 8%'],
    uxCopySnippet: {
      label: 'Titular de Anuncio Google',
      text: 'Tu momento de brillar. Trajes y Vestidos de Alta Costura en Córdoba. Agendá tu prueba exclusiva en DIVO.',
      tone: 'Directo, elegante, resolutivo'
    },
    recommendedActions: [
      'Segmentar por palabras clave de proximidad hacia las 5 sucursales (Recta, R20, S.V, etc.).',
      'Configurar botón directo a EMMA para llamadas inmediatas desde celulares.',
      'Enviar el tráfico de novias directamente a la landing /vestidos con pre-filtro de fecha.'
    ],
    status: 'active'
  },
  {
    id: 'node-meta-ads',
    title: 'Meta Ads (Instagram & FB)',
    subtitle: 'Valen · Deseo Visual & Reels',
    category: 'paid',
    responsible: 'Valen',
    iconName: 'Compass',
    description: 'Campañas de generación de demanda visual. Muestra los cortes, caídas de tela y prestancia de las colecciones para despertar la aspiración.',
    paperNoteReference: 'Anotación en papel: "Meta Ads - Valen - campañas"',
    inputs: ['Reels de probadores', 'Catálogos fotográficos de alta calidad', 'Testimonios reales'],
    outputs: ['node-web', 'node-kommo'],
    tools: ['Meta Business Suite', 'Pixel de Meta', 'WhatsApp Business API'],
    kpis: ['ROAS > 4.2x', 'Costo por inicio de conversación en WhatsApp < $1.200 ARS', 'Engagement de Reels > 12%'],
    uxCopySnippet: {
      label: 'Copy de Anuncio Meta',
      text: 'No es solo una prenda, es la seguridad de entrar y ser inolvidable. Descubrí la colección de gala y novias DIVO.',
      tone: 'Inspirador, distinguido y con llamado a la acción concreto'
    },
    recommendedActions: [
      'Diferenciar creativos para el público de Trajes (Novios, Padrinos, Egresados) vs Vestidos (Novias, Madrinas, Fiesta).',
      'Integrar botón de "Chatear en WhatsApp" directo a Kommo con saludo predeterminado según el anuncio visto.'
    ],
    status: 'active'
  },
  {
    id: 'node-linkedin',
    title: 'LinkedIn Ads & B2B',
    subtitle: 'Eventos Corporativos & Graduaciones',
    category: 'paid',
    responsible: 'Coty / Equipo',
    iconName: 'Briefcase',
    description: 'Canal enfocado en eventos corporativos de fin de año, galas empresariales, colegios de graduados universitarios y sastrería ejecutiva.',
    paperNoteReference: 'Anotación en papel: "LinkedIn - campañas"',
    inputs: ['Propuestas para eventos corporativos', 'Catálogo de Sastrería Ejecutiva'],
    outputs: ['node-web', 'node-kommo'],
    tools: ['LinkedIn Campaign Manager', 'Lead Gen Forms'],
    kpis: ['Contactos calificados de empresas', 'Convenios grupales para graduaciones'],
    uxCopySnippet: {
      label: 'Enfoque de Copy B2B',
      text: 'Presencia impecable para galas y premiaciones corporativas. Asesoría de sastrería individual y grupal con DIVO.',
      tone: 'Profesional, distinguido, de autoridad'
    },
    recommendedActions: [
      'Crear una sección web específica para "Eventos y Graduaciones Grupales" con beneficios por volumen.',
      'Ofrecer asesoría itinerante o citas privadas fuera de horario comercial.'
    ],
    status: 'in_setup'
  },
  {
    id: 'node-pinterest',
    title: 'Pinterest Inspiracional',
    subtitle: 'Bianca · Moodboards & Novias',
    category: 'paid',
    responsible: 'Bianca',
    iconName: 'Sparkles',
    description: 'El motor número uno de inspiración estética para novias, madrinas y vestidos de gala. Pines con enlaces directos a reservas de probador.',
    paperNoteReference: 'Anotación en papel: "Pinterest - BIANCA - campañas"',
    inputs: ['Fotos en alta resolución de detalles', 'Paletas de color y estilos de bodas', 'Pines de trajes de etiqueta'],
    outputs: ['node-web'],
    tools: ['Pinterest Business', 'Canva Pro / Lightroom', 'Rich Pins vinculados a DIVO'],
    kpis: ['Guardados de pines mensuales > 15.000', 'Clics salientes a la web > 1.200/mes'],
    uxCopySnippet: {
      label: 'Descripción de Pin',
      text: 'La delicadeza del satén y la estructura de un diseño pensado para deslumbrar. Agendá tu prueba en DIVO.',
      tone: 'Sensorial, etéreo, cálido'
    },
    recommendedActions: [
      'Crear tableros organizados: "Novias DIVO", "Madrinas Elegantes", "Sastrería Contemporánea DIVO", "Tendencias Gala".',
      'Colocar Rich Pins de producto con disponibilidad y enlace directo al botón de reserva de turno.'
    ],
    status: 'active'
  },

  // --- TRÁFICO ORGÁNICO & SOCIAL ---
  {
    id: 'node-instagram-org',
    title: 'Instagram Orgánico',
    subtitle: 'Trajes & Vestidos · Presencia Diaria',
    category: 'organic',
    responsible: 'Bianca / Valen',
    iconName: 'Instagram',
    description: 'El escaparate visual vivo de DIVO. Historias con pruebas reales, detalles de confección en taller, tips de styling y encuestas interactivas.',
    paperNoteReference: 'Anotación en papel: "INSTG. -> Trajes / Vestidos -> orgánico"',
    inputs: ['Contenido de probador en vivo', 'Fotos de clientes en sus eventos ("Momentos Divo")', 'Backstage'],
    outputs: ['node-web', 'node-kommo'],
    tools: ['Instagram Stories, Reels, DMs', 'ManyChat / Kommo Bot'],
    kpis: ['Engagement rate > 4.8%', 'DMs iniciados semanales > 80'],
    uxCopySnippet: {
      label: 'Bio de Instagram',
      text: 'DIVO · Alta sastrería y vestidos de celebración ✨ Donde tu elegancia toma forma. 5 Ateliers en Córdoba. Agendá tu cita privada 👇',
      tone: 'Magnético, exclusivo, cercano'
    },
    recommendedActions: [
      'Historias destacadas divididas claramente en: 👗 VESTIDOS, 🤵 TRAJES, 📍 SUCURSALES, ⭐ TESTIMONIOS, 📅 AGENDAR CITA.',
      'Automatizar respuesta en DM con menú rápido que derive a WhatsApp Kommo.'
    ],
    status: 'active'
  },
  {
    id: 'node-facebook-org',
    title: 'Facebook Orgánico',
    subtitle: 'Comunidad de Familias y Bodas',
    category: 'organic',
    responsible: 'Daniela / Valen',
    iconName: 'Share2',
    description: 'Canal clave para madres de novios/as, familias que acompañan la elección del vestido o traje, álbumes completos de celebraciones y valoraciones.',
    paperNoteReference: 'Anotación en papel: "FACE. -> Trajes / Vestidos -> orgánico"',
    inputs: ['Álbumes de bodas y egresos reales', 'Reseñas de clientes satisfechos'],
    outputs: ['node-web', 'node-kommo'],
    tools: ['Facebook Page', 'Meta Business Inbox'],
    kpis: ['Comentarios y consultas por mensaje', 'Opiniones positivas en la página'],
    uxCopySnippet: {
      label: 'Post de Facebook',
      text: 'Acompañar a una familia en uno de sus días más felices es nuestro mayor honor en DIVO. Conocé nuestros diseños pensados para cada figura y momento.',
      tone: 'Emotivo, familiar, confiable'
    },
    recommendedActions: [
      'Vincular el botón principal de la Fanpage directamente al número de WhatsApp de Coty/Kommo.',
      'Publicar semanalmente testimonios fotográficos etiquetando a los clientes con su consentimiento.'
    ],
    status: 'active'
  },
  {
    id: 'node-tiktok',
    title: 'TikTok Orgánico',
    subtitle: 'Tendencias & Transformaciones',
    category: 'organic',
    responsible: 'Equipo Creativo',
    iconName: 'Video',
    description: 'Videos cortos con alta viralidad: "El error común al elegir traje para graduación", "Cómo armamos un vestido de novia desde cero", "POV: Venís a tu primera prueba en DIVO".',
    paperNoteReference: 'Anotación en papel: "Tik Tok. -> Trajes / Vestidos -> org."',
    inputs: ['Videos dinámicos con audio en tendencia', 'Humor elegante y tips de vestuario'],
    outputs: ['node-web'],
    tools: ['TikTok for Business / Creator Studio', 'CapCut'],
    kpis: ['Reproducciones de video', 'Visitas al enlace de bio'],
    uxCopySnippet: {
      label: 'Gancho TikTok',
      text: '¿Pensabas que un traje clásico era aburrido? Mirá este corte sartorial DIVO con solapa en contraste que hicimos para este fin de semana.',
      tone: 'Fresco, dinámico, pedagógico'
    },
    recommendedActions: [
      'Usar link en bio centralizado hacia la web de DIVO con selector de Trajes vs Vestidos.',
      'Mostrar las instalaciones de las sucursales (ej: cómo llegar al Atelier DIVO de Recta Martinolli).'
    ],
    status: 'active'
  },
  {
    id: 'node-marketplace',
    title: 'Facebook Marketplace',
    subtitle: 'Catálogo de Proximidad',
    category: 'organic',
    responsible: 'Daniela',
    iconName: 'ShoppingBag',
    description: 'Publicaciones geolocalizadas de prendas seleccionadas para captar compradores que buscan soluciones urgentes o de cercanía.',
    paperNoteReference: 'Anotación en papel: "Mkt. place. -> Trajes / Vestidos -> org."',
    inputs: ['Fotos limpias de stock disponible en sucursales'],
    outputs: ['node-kommo'],
    tools: ['Marketplace de Facebook', 'Respuestas rápidas móviles'],
    kpis: ['Mensajes entrantes por prenda', 'Conversión a cita presencial'],
    uxCopySnippet: {
      label: 'Descripción Marketplace',
      text: 'Traje de gala corte Slim / Vestido de fiesta DIVO. Disponible para prueba exclusiva en sucursal con ajustes incluidos. Consultanos el talle.',
      tone: 'Concreto, comercial, seguro'
    },
    recommendedActions: [
      'Aclarar siempre que la prenda se prueba y ajusta en atelier oficial DIVO para transmitir tranquilidad y seriedad.',
      'Llevar la charla de inmediato a WhatsApp para enviar ubicación y confirmar horario.'
    ],
    status: 'active'
  },
  {
    id: 'node-daniela-grupos',
    title: 'Daniela · Grupos & Comunidad',
    subtitle: 'Social Selling & Alianzas',
    category: 'organic',
    responsible: 'Daniela',
    iconName: 'Users',
    description: 'Presencia cálida y no invasiva en grupos de novias, egresados 2026/2027, organizadores de fiestas y colegios profesionales.',
    paperNoteReference: 'Anotación en papel: "Daniela Grupos -> Trajes / Vestidos"',
    inputs: ['Recomendaciones en hilos de debate', 'Alianzas con wedding planners y fotógrafos'],
    outputs: ['node-kommo'],
    tools: ['WhatsApp Communities', 'Grupos de Facebook especializados'],
    kpis: ['Recomendaciones boca a boca generadas', 'Leads referidos por wedding planners'],
    uxCopySnippet: {
      label: 'Mensaje de Acercamiento',
      text: '¡Hola chicas! Para las que están buscando vestidos de fiesta o trajes para acompañantes, en DIVO abrimos agenda de pruebas personalizadas con asesora.',
      tone: 'Empático, servicial, sin venta agresiva'
    },
    recommendedActions: [
      'Crear un programa especial de beneficios para organizadores de eventos que recomienden DIVO.',
      'Monitorear consultas sobre modistas y arreglos para ofrecer soluciones integrales en nuestros talleres.'
    ],
    status: 'active'
  },
  {
    id: 'node-gmb',
    title: 'Google Perfil de Empresa (GMB)',
    subtitle: 'Maps & Fichas Locales por Sucursal',
    category: 'organic',
    responsible: 'Tere / Coty',
    iconName: 'MapPin',
    description: 'El imán geográfico de clientes cercanos. Fichas de Google Maps optimizadas para Recta Martinolli, R20, San Vicente y Paseo del Tejar/Villa María.',
    paperNoteReference: 'Anotación en papel: "Google My Business -> Trajes / Vestidos -> direcciones / sucursales: R20, S.V., RECTA, FEM (P de T., V.M.)"',
    inputs: ['Búsquedas locales en Google Maps ("sastrería cerca de mí", "vestidos de fiesta")', 'Reseñas con 5 estrellas'],
    outputs: ['node-branches', 'node-emma'],
    tools: ['Google Business Profile Manager', 'Google Maps Local Pack'],
    kpis: ['Llamadas telefónicas iniciadas', 'Solicitudes de ruta "Cómo llegar"', 'Calificación promedio > 4.8 estrellas'],
    uxCopySnippet: {
      label: 'Nombre y Atributos de Ficha',
      text: 'DIVO · Vestidos de Fiesta, Novias y Trajes de Gala | Atelier de Alta Costura',
      tone: 'Claro para el algoritmo, prestigioso para el usuario'
    },
    recommendedActions: [
      'Publicar ofertas y fotos de la vitrina semanal en cada ficha de sucursal.',
      'Responder al 100% de las reseñas de clientes en menos de 24 horas con calidez.'
    ],
    status: 'optimized'
  },

  // --- NÚCLEO WEB & CONTACTO CENTRAL ---
  {
    id: 'node-web',
    title: 'Sitio Web DIVO',
    subtitle: 'Arquitectura Dual: Trajes & Vestidos',
    category: 'web',
    responsible: 'Coty & Estratega',
    iconName: 'Globe',
    description: 'El epicentro digital de la marca. No es solo un catálogo: es un templo digital donde el usuario vive la experiencia de distinción, explora estilos y agenda su turno.',
    paperNoteReference: 'Anotación central del papel: "WEB -> Trajes / Vestidos"',
    inputs: ['node-google-ads', 'node-meta-ads', 'node-linkedin', 'node-pinterest', 'node-instagram-org', 'node-tiktok'],
    outputs: ['node-kommo', 'node-owl', 'node-branches'],
    tools: ['Plataforma Web Moderna (React/Vite)', 'Formulario de Citas VIP', 'Pixel & Analytics'],
    kpis: ['Tiempo de permanencia > 2:30 min', 'Tasa de clic a "Agendar Prueba" > 14%', 'Tasa de rebote < 35%'],
    uxCopySnippet: {
      label: 'Manifiesto Web Principal',
      text: 'Una colección de diseños pensados para tu noche más importante. Descubrí tu corte ideal y reservá tu probador exclusivo en DIVO.',
      tone: 'Elevado, inspirador, nítido'
    },
    recommendedActions: [
      'Implementar bifurcación limpia en Home: "¿Buscás Traje o Vestido?" para no confundir al visitante.',
      'Filtro inteligente por ocasión: Novia, Egresada, Madrina, Gala Black Tie, Informal Elegante.',
      'Integrar selector de sucursal preferida para que el lead llegue pre-asignado a su zona.'
    ],
    status: 'active'
  },
  {
    id: 'node-emma',
    title: 'Línea Directa EMMA',
    subtitle: '931 - EMMA - 292 745 · Concierge Telefónico',
    category: 'web',
    responsible: 'Yasmín / Asesoras',
    iconName: 'PhoneCall',
    description: 'Número telefónico y canal centralizado de atención por voz / WhatsApp directo anotado en el papel de Coty. Atención cálida y derivación veloz.',
    paperNoteReference: 'Anotación superior izquierda: "931. - EMMA - 292 745 = "',
    inputs: ['node-google-ads', 'node-gmb', 'Llamadas directas'],
    outputs: ['node-kommo', 'node-branches'],
    tools: ['Telefonía IP / WhatsApp Business', 'Guión de bienvenida EMMA'],
    kpis: ['Tasa de llamadas atendidas > 95%', 'Tiempo de respuesta inicial < 2 minutos'],
    uxCopySnippet: {
      label: 'Guión de bienvenida telefónica/voz',
      text: '¡Hola! Te comunicaste con DIVO. Te habla el equipo de asesoría de Coty. Contanos para qué fecha es tu evento y te reservamos el probador en tu sucursal más cercana.',
      tone: 'Cálido, resolutivo, protocolar'
    },
    recommendedActions: [
      'Vincular el número a WhatsApp Business con catálogo sincronizado.',
      'Grabar un saludo de bienvenida con voz serena y distinguida si entran llamadas fuera de horario.'
    ],
    status: 'active'
  },

  // --- CRM & SISTEMAS DE GESTIÓN ---
  {
    id: 'node-kommo',
    title: 'CRM Kommo',
    subtitle: 'Gestión Inmediata de Chats & WhatsApp',
    category: 'crm',
    responsible: 'Yasmín & Equipo de Asesoras',
    iconName: 'MessageSquare',
    description: 'La autopista conversacional. Centraliza WhatsApp, DMs de Instagram, Messenger y formularios web. Distribuye las conversaciones a la asesora de la sucursal indicada.',
    paperNoteReference: 'Anotación en papel: "CRM kommo"',
    inputs: ['node-web', 'node-meta-ads', 'node-daniela-grupos', 'node-marketplace', 'node-emma', 'node-instagram-org'],
    outputs: ['node-owl', 'node-branches'],
    tools: ['Kommo CRM', 'WhatsApp Cloud API', 'Chatbot de calificación'],
    kpis: ['Tiempo de primera respuesta < 3 minutos', 'Tasa de conversión de chat a cita agendada > 38%'],
    uxCopySnippet: {
      label: 'Primer mensaje automatizado en WhatsApp',
      text: '¡Hola! Qué alegría recibir tu mensaje en DIVO ✨ Soy Yasmín. ¿Para qué fecha es tu celebración y en qué sucursal te queda más cómodo visitarnos?',
      tone: 'Amable, eficiente, humano'
    },
    recommendedActions: [
      'Configurar embudo visual en Kommo: 1. Contacto Nuevo -> 2. Evento Calificado -> 3. Cita Agendada -> 4. Asistió a Prueba -> 5. Seña/Venta.',
      'Disparar recordatorio automático de cita 24h antes por WhatsApp.'
    ],
    status: 'active'
  },
  {
    id: 'node-owl',
    title: 'CRM Owl',
    subtitle: 'Historial de Clientes, Medidas & Pipeline',
    category: 'crm',
    responsible: 'Víctor (Dev), Yasmín & Coty',
    iconName: 'Database',
    description: 'El cerebro de fidelización y seguimiento a mediano plazo. Registra la ficha del cliente, tipo de evento, fecha señalada, medidas corporales y notas de estilo.',
    paperNoteReference: 'Anotación central en papel: "CRM owl"',
    inputs: ['node-kommo', 'node-branches'],
    outputs: ['node-skysoft', 'node-postsale'],
    tools: ['Owl CRM', 'Fichas de sastrería digital'],
    kpis: ['Completitud de ficha de cliente > 90%', 'Retención y recompra en clientes frecuentes'],
    uxCopySnippet: {
      label: 'Campos clave de la ficha',
      text: 'Nombre, Fecha de Boda/Evento, Rol (Novio, Novia, Madrina, Invitado), Talle base, Modista asignada, Fecha de prueba 1 y entrega.',
      tone: 'Estructurado y profesional'
    },
    recommendedActions: [
      'Sincronizar automáticamente los datos de clientes ganados desde Kommo a Owl.',
      'Alertar 15 días antes del evento para coordinar la prueba de ajuste final.'
    ],
    status: 'active'
  },
  {
    id: 'node-skysoft',
    title: 'Sky Soft (ERP Central)',
    subtitle: 'Inventario, Confección & Facturación',
    category: 'crm',
    responsible: 'Administración & Coty',
    iconName: 'Layers',
    description: 'Sistema administrativo y de gestión de stock. Controla las telas en taller, prendas confeccionadas, transferencias entre sucursales y cobros.',
    paperNoteReference: 'Anotación izquierda en papel: "Sky Soft."',
    inputs: ['node-owl', 'node-branches'],
    outputs: ['node-branches', 'node-postsale'],
    tools: ['SkySoft ERP', 'Módulo de Inventario y Sucursales'],
    kpis: ['Exactitud de stock > 99%', 'Tiempos de reposición de talle entre sucursales < 24hs'],
    uxCopySnippet: {
      label: 'Control de prenda en sistema',
      text: 'Código de modelo, Tela/Color, Talle, Estado (Disponible, En Prueba, En Taller para Ajuste, Entregado).',
      tone: 'Operativo y riguroso'
    },
    recommendedActions: [
      'Garantizar que si una prenda se reserva en Recta Martinolli, figure inmediatamente bloqueada para otras sucursales.',
      'Registrar los costos de confección y márgenes por línea (Trajes vs Vestidos).'
    ],
    status: 'active'
  },

  // --- RED DE SUCURSALES & EXPERIENCIA ---
  {
    id: 'node-branches',
    title: 'Red de Sucursales y Ateliers',
    subtitle: 'Recta, R20, S.V, P de T., V.M.',
    category: 'branch',
    responsible: 'Yasmín & Asesoras de Salón',
    iconName: 'Store',
    description: 'El momento cumbre: donde el cliente cruza la puerta, respira la atmósfera distinguida de DIVO, se prueba el modelo y siente la transformación personal.',
    paperNoteReference: 'Anotación en papel: "direcciones / sucursales -> R20, S.V., RECTA, FEM (P de T, V.M)"',
    inputs: ['node-kommo', 'node-gmb', 'node-skysoft'],
    outputs: ['node-postsale', 'node-owl'],
    tools: ['Probadores con iluminación cálida', 'Espejos de cuerpo entero', 'Kit de modistería'],
    kpis: ['Tasa de cierre en salón > 62%', 'Satisfacción en experiencia presencial (NPS > 85)'],
    uxCopySnippet: {
      label: 'Protocolo de Bienvenida en Sucursal',
      text: '"Bienvenida a DIVO. Ya tenemos tu probador preparado con los modelos que elegiste en la web. Ponete cómoda."',
      tone: 'Hospitalario, distinguido, sereno'
    },
    recommendedActions: [
      'Mantener iluminación calibrada en probadores (luz neutra-cálida favorecedora, nunca fluorescente fría).',
      'Tener siempre un perchero exclusivo etiquetado con el nombre de la cita del día.'
    ],
    status: 'active'
  },

  // --- POST-VENTA & FIDELIZACIÓN ---
  {
    id: 'node-postsale',
    title: 'Post-Venta & "Gestión Propia"',
    subtitle: 'Acompañamiento, Fotos & Fidelidad',
    category: 'post-sale',
    responsible: 'Yasmín & Coty',
    iconName: 'Award',
    description: 'El vínculo con el cliente no termina con la entrega. Continuidad emocional: entrega con planchado perfecto, mensaje pre-evento, felicitación post-fiesta y recolección de fotos.',
    paperNoteReference: 'Anotación inferior izquierda en papel: "sucursales -> post-venta / g propio"',
    inputs: ['node-branches', 'node-skysoft'],
    outputs: ['node-instagram-org', 'node-facebook-org'],
    tools: ['Encuesta de satisfacción WhatsApp', 'Funda protectora con aroma de autor DIVO'],
    kpis: ['Porcentaje de clientes que envían foto del evento > 45%', 'Reseñas de 5 estrellas en Google recibidas post-evento'],
    uxCopySnippet: {
      label: 'Mensaje post-evento (48h después)',
      text: '¡Esperamos que hayas vivido una noche mágica! Desde todo el equipo de DIVO queremos agradecerte por permitirnos vestir tu momento. Nos encantaría ver cómo brillaste con tu diseño ✨',
      tone: 'Cálido, agradecido, perdurable'
    },
    recommendedActions: [
      'Alimentar las redes orgánicas con las fotos reales de los clientes (con autorización).',
      'Enviar tarjeta de beneficio exclusivo de aniversario o próximo evento para familiares.'
    ],
    status: 'optimized'
  }
];

export const WEB_SECTIONS: WebSection[] = [
  {
    id: 'home',
    title: 'Home · El Portal DIVO',
    path: '/',
    objective: 'Dar la bienvenida con impacto estético, transmitir la filosofía de elegancia y ofrecer una bifurcación intuitiva hacia Trajes o Vestidos.',
    hierarchyLevel: 1,
    targetAudience: 'Todo visitante: novias, novios, familias de egresados, invitados de gala.',
    keyElements: [
      'Hero cinematográfico con video de distinción y caída de telas',
      'Bifurcador claro: "Colección Trajes" vs "Colección Vestidos"',
      'Buscador / Selector rápido de Sucursal (Recta, R20, S.V., Paseo del Tejar, Villa María)',
      'Social Proof: Testimonios reales y mención de talleres propios',
      'CTA flotante inteligente para agendar cita privada'
    ],
    uxWriting: {
      heroHeading: 'La elegancia no se impone: se expande.',
      subheading: 'En DIVO creamos prendas para las celebraciones que marcan un antes y un después. Elegí tu universo y descubrí tu presencia.',
      primaryCta: 'Explorar Vestidos',
      secondaryCta: 'Explorar Trajes',
      microcopyNote: 'Citas privadas en nuestros 5 Ateliers en Córdoba. Asesoría personalizada sin costo.'
    }
  },
  {
    id: 'vestidos',
    title: 'Colección Vestidos · Novias & Gala',
    path: '/vestidos',
    objective: 'Presentar la línea femenina con filtros por ocasión (Novia, Madrina, Egresada, Fiesta) y guiar a la reserva de probador.',
    hierarchyLevel: 2,
    targetAudience: 'Mujeres buscando vestidos de novia, madrinas, invitadas de honor y egresadas.',
    keyElements: [
      'Filtro por Silueta (Sirena, Línea A, Imperio, Minimalista, Fluido)',
      'Filtro por Tipo de Evento (Boda de día, Gala noche, Civil, Quince)',
      'Zoom en detalles de telas (mikado, satén de seda, tul bordado, gasas)',
      'Botón "Quiero probármelo" en cada ficha de vestido con selector de talle y sucursal',
      'Guía de medidas con asesoría por chat en vivo'
    ],
    uxWriting: {
      heroHeading: 'Vestidos nacidos para acompañar tu momento.',
      subheading: 'Tejidos nobles, caídas que abrazan tu movimiento y acabados artesanales. Sentí la magia de verte lista para tu día.',
      primaryCta: 'Agendar Prueba de Vestido',
      secondaryCta: 'Ver Lookbook de Novias',
      microcopyNote: 'Todos nuestros vestidos incluyen el servicio de entalle y ajuste a tu medida exacta.'
    }
  },
  {
    id: 'trajes',
    title: 'Colección Trajes · Sastrería & Black Tie',
    path: '/trajes',
    objective: 'Mostrar la sastrería moderna, cortes impecables, esmoquins y trajes para novios, padrinos y egresados.',
    hierarchyLevel: 2,
    targetAudience: 'Hombres de todas las edades que buscan distinción, comodidad y porte perfecto.',
    keyElements: [
      'Líneas: Novios & Ceremonia, Gala & Smoking, Sastrería Juvenil/Egresados',
      'Selector de Calce: Slim Fit, Modern Fit, Classic Fit, Hecho a Medida',
      'Catálogo de complementos: corbatines, chalecos, camisas de puño doble, gemelos',
      'Servicio de alquiler con opción a compra o confección nueva',
      'Agendamiento directo para prueba de sastrería'
    ],
    uxWriting: {
      heroHeading: 'El arte de vestir con carácter y presencia.',
      subheading: 'Cortes que estilizan, solapas perfectas y lanas frías de primera calidad. Porque la verdadera distinción está en la precisión de cada puntada.',
      primaryCta: 'Reservar Prueba de Traje',
      secondaryCta: 'Consultar Sastrería a Medida',
      microcopyNote: 'Ajuste de mangas, hombros y basta realizado por nuestros maestros sastres.'
    }
  },
  {
    id: 'sucursales',
    title: 'Nuestros Ateliers & Sucursales',
    path: '/sucursales',
    objective: 'Dar certeza geográfica, horarios, fotos del espacio y mapas interactivos para cada una de las sedes físicas.',
    hierarchyLevel: 2,
    targetAudience: 'Clientes listos para visitar presencialmente o elegir el atelier más cercano a su hogar.',
    keyElements: [
      'Ficha individual por sede: Recta Martinolli, Ruta 20, San Vicente, Paseo del Tejar, Villa María',
      'Integración con Google Maps ("Cómo llegar en 1 clic")',
      'Horarios de atención comercial y turnos especiales fuera de hora',
      'Botón de llamada directa a EMMA / WhatsApp de cada sede',
      'Fotos reales del interiorismo, probadores y áreas de espera'
    ],
    uxWriting: {
      heroHeading: 'Cinco espacios creados para recibirte como merecés.',
      subheading: 'Ateliers íntimos, distinguidos y con probadores amplios para que disfrutes cada minuto de tu elección.',
      primaryCta: 'Elegir mi Atelier',
      secondaryCta: 'Llamar a Asesoría EMMA',
      microcopyNote: 'Atendemos con cita previa para garantizarte exclusividad de probador y asesora.'
    }
  },
  {
    id: 'agenda-vip',
    title: 'Agenda Tu Cita VIP (Formulario de Citas)',
    path: '/agendar',
    objective: 'Convertir el interés en una cita confirmada en Kommo/Owl con fricción cero y alta emoción.',
    hierarchyLevel: 2,
    targetAudience: 'Usuarios con intención decidida de probarse modelos.',
    keyElements: [
      'Paso 1: ¿Qué prenda estás buscando? (Traje / Vestido / Ambos)',
      'Paso 2: ¿En qué sucursal preferís tu cita?',
      'Paso 3: Fecha de tu celebración y fecha deseada de prueba',
      'Paso 4: Nombre, WhatsApp y notas de estilo',
      'Confirmación instantánea con envío de ubicación por WhatsApp'
    ],
    uxWriting: {
      heroHeading: 'Tu momento comienza en el probador.',
      subheading: 'Completá este breve formulario en menos de 1 minuto y una asesora se comunicará de inmediato para reservar tu espacio.',
      primaryCta: 'Confirmar Mi Turno Exclusivo',
      microcopyNote: 'Sin costo de reserva. Podés venir acompañada de hasta 2 personas de tu confianza.'
    }
  }
];

export const CUSTOMER_JOURNEYS: CustomerJourney[] = [
  {
    id: 'journey-novia',
    title: 'Recorrido 1: La Novia DIVO (Inspiración a Celebración)',
    persona: 'Camila (28 años) · Se casa en 6 meses en Córdoba · Busca vestido soñado y emotivo',
    steps: [
      {
        stage: 'Descubrimiento',
        nodeId: 'node-pinterest',
        action: 'Guarda un pin de DIVO en su tablero "Mi Boda 2026" atraída por el corte de un vestido escote barco.',
        feeling: 'Inspirada y con altas expectativas',
        touchpoint: 'Pinterest Moodboard curado por Bianca'
      },
      {
        stage: 'Exploración Web',
        nodeId: 'node-web',
        action: 'Hace clic en el pin y aterriza en la Colección Vestidos de la web. Filtra por "Novias" y mira el video de movimiento.',
        feeling: 'Cautivada por la estética limpia y la calidez del mensaje',
        touchpoint: 'Página Web DIVO /vestidos'
      },
      {
        stage: 'Conversión Ágil',
        nodeId: 'node-kommo',
        action: 'Presiona "Agendar Prueba en Recta Martinolli". Se abre WhatsApp y Yasmín le confirma fecha en 4 minutos.',
        feeling: 'Aliviada por la rapidez y el buen trato',
        touchpoint: 'Kommo WhatsApp Concierge'
      },
      {
        stage: 'Experiencia Atelier',
        nodeId: 'node-branches',
        action: 'Llega con su mamá al Atelier DIVO Recta Martinolli. La reciben con una copa, probador privado y 4 opciones preparadas.',
        feeling: 'Emocionada, segura y protagonista',
        touchpoint: 'Atelier DIVO Recta Martinolli (Sucursales)'
      },
      {
        stage: 'Cierre y Ajuste',
        nodeId: 'node-skysoft',
        action: 'Elige su vestido. En SkySoft se registra el bloqueo de prenda y la modista toma las medidas exactas en Owl CRM.',
        feeling: 'Tranquila sabiendo que todo está documentado',
        touchpoint: 'Ficha en Owl CRM + SkySoft'
      },
      {
        stage: 'Post-Venta DIVO',
        nodeId: 'node-postsale',
        action: 'A las 48h de su boda recibe un mensaje personalizado felicitándola. Ella responde compartiendo fotos hermosas del casamiento.',
        feeling: 'Agradecimiento total y fidelidad de por vida',
        touchpoint: 'Protocolo Post-Venta "Gestión Propia"'
      }
    ]
  },
  {
    id: 'journey-novio-egresado',
    title: 'Recorrido 2: El Egresado o Novio (Resolutivo & Estilo)',
    persona: 'Martín (23 años) · Egresa de la universidad · Busca traje moderno que le quede impecable',
    steps: [
      {
        stage: 'Atracción por Search',
        nodeId: 'node-google-ads',
        action: 'Busca en Google "alquiler de trajes egresados cordoba recta martinolli o ruta 20". Ve anuncio de Tere con botón a EMMA.',
        feeling: 'Urgencia por resolver con calidad',
        touchpoint: 'Google Ads de Tere'
      },
      {
        stage: 'Llamada o Web',
        nodeId: 'node-emma',
        action: 'Llama al número 931-EMMA-292745 o entra a la web sección Trajes DIVO. Aprecia la guía de calces Slim Fit.',
        feeling: 'Confianza por la seriedad del servicio',
        touchpoint: 'Línea directa EMMA & Web Trajes DIVO'
      },
      {
        stage: 'Asignación a Sucursal',
        nodeId: 'node-branches',
        action: 'Elige la Sucursal Ruta 20 (R20). Va un martes por la tarde y en 20 minutos encuentra su corte ideal con chaleco al tono.',
        feeling: 'Sorprendido por la agilidad y el calce',
        touchpoint: 'Sucursal DIVO R20'
      },
      {
        stage: 'Gestión en Sistema',
        nodeId: 'node-skysoft',
        action: 'SkySoft programa el planchado y entalle de basta para 48h antes del evento.',
        feeling: 'Certeza de entrega puntual',
        touchpoint: 'Sky Soft ERP'
      }
    ]
  },
  {
    id: 'journey-comunidad-grupos',
    title: 'Recorrido 3: Comunidad & Referidos (Boca a Boca)',
    persona: 'Lucía (Madrina de Boda) · Recomendada en un grupo de novias',
    steps: [
      {
        stage: 'Recomendación',
        nodeId: 'node-daniela-grupos',
        action: 'Daniela responde una duda en un grupo de eventos sobre dónde conseguir vestidos elegantes para madrinas sin sentirse disfrazada.',
        feeling: 'Aliviada por encontrar un consejo genuino',
        touchpoint: 'Grupos & Alianzas Daniela'
      },
      {
        stage: 'Contacto & Atención',
        nodeId: 'node-kommo',
        action: 'Escribe al WhatsApp. Le envían fotos personalizadas según su estilo y coordinan visita en Paseo del Tejar.',
        feeling: 'Escuchada y cuidada',
        touchpoint: 'Kommo WhatsApp DIVO'
      },
      {
        stage: 'Prueba y Fidelización',
        nodeId: 'node-branches',
        action: 'Prueba vestido en Paseo del Tejar. Le hacen los ajustes y queda fascinada.',
        feeling: 'Elegante y radiante',
        touchpoint: 'Boutique Paseo del Tejar FEM DIVO'
      }
    ]
  }
];

export const VICTOR_INITIAL_TASKS: VictorTask[] = [
  // 1. Agendamiento de Citas (LISTO -> FINALIZADO)
  {
    id: 'req-victor-1',
    title: 'Que se puedan agendar citas',
    requestedBy: 'Yasmín',
    module: 'Owl Citas & Agenda',
    priority: 'urgente',
    deadline: '2026-10-18',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Sistema de turnos desplegado en Owl para salones y probadores de alta costura.',
    createdAt: '2026-10-10',
    specs: 'Permite seleccionar cliente, fecha, sucursal (Recta Martinolli, R20, etc.) y tipo de cita.'
  },
  // 2. Distinguir Canjes en Panel de Citas (LISTO -> FINALIZADO)
  {
    id: 'req-victor-2',
    title: 'Que se puedan distinguir los canjes en el panel de citas',
    requestedBy: 'Yasmín',
    module: 'Owl Citas & Agenda',
    priority: 'alta',
    deadline: '2026-10-19',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Etiqueta visual de "Canje / Convenio" visible en la tarjeta para protocolo especial.',
    createdAt: '2026-10-12',
    specs: 'Badge destacado en el panel de citas para canjes, influencers y prensa con condiciones de acuerdo.'
  },
  // 3. Abrir WhatsApp desde Ícono de Asesoramiento (LISTO -> FINALIZADO)
  {
    id: 'req-victor-3',
    title: 'Que se pueda abrir el wtsp desde el icono de el asesoramiento',
    requestedBy: 'Yasmín',
    module: 'Owl WhatsApp & Kommo',
    priority: 'alta',
    deadline: '2026-10-17',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Clic directo en el ícono de WhatsApp en la ficha de asesoramiento para iniciar chat.',
    createdAt: '2026-10-11',
    specs: 'Abre WhatsApp Web / App con el número del cliente listo para interactuar.'
  },
  // 4. Enviar Plantillas e Iniciar Conversaciones (LISTO -> FINALIZADO)
  {
    id: 'req-victor-4',
    title: 'Que se puedan enviar plantillas e iniciar conversaciones',
    requestedBy: 'Yasmín',
    module: 'Owl Mensajería',
    priority: 'alta',
    deadline: '2026-10-18',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Selector de plantillas oficiales aprobadas para dar respuestas veloces y uniformes.',
    createdAt: '2026-10-13',
    specs: 'Modal de templates pre-armados para bienvenida, seguimiento de prueba y consultas frecuentes.'
  },
  // 5. Enviar Catálogo (LISTO -> FINALIZADO)
  {
    id: 'req-victor-5',
    title: 'Que se pueda enviar el catálogo',
    requestedBy: 'Coty',
    module: 'Owl Catálogo Web',
    priority: 'alta',
    deadline: '2026-10-16',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Botón de envío directo del catálogo online interactivo de vestidos y trajes.',
    createdAt: '2026-10-09',
    specs: 'Envío del enlace oficial del catálogo DIVO por mensaje.'
  },
  // 6. SMS de Catálogo + Link de Página Web con más opciones
  {
    id: 'req-victor-6',
    title: 'Que junto al envío del SMS del catálogo se envíe la página web, y que el template indique que allí puede ver más opciones',
    requestedBy: 'Coty',
    module: 'Owl SMS & Web',
    priority: 'alta',
    deadline: '2026-10-28',
    status: 'en_curso',
    observations: 'Víctor: Actualizando el template de SMS para que además del catálogo incluya el link de la web oficial de DIVO aclarando que allí puede ver más opciones y modelos exclusivos.',
    createdAt: '2026-10-20',
    specs: 'Copy SMS: "Te enviamos nuestro catálogo. Encontrá más opciones y la colección completa en divo.com.ar"'
  },
  // 7. SMS de Recordatorio de Cita con Confirmación (LISTO -> FINALIZADO)
  {
    id: 'req-victor-7',
    title: 'Que se envíe el SMS de recordatorio de cita, con la confirmación',
    requestedBy: 'Yasmín',
    module: 'Owl Notificaciones',
    priority: 'alta',
    deadline: '2026-10-19',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. SMS programado 24 horas antes con los datos del turno y enlace de confirmación.',
    createdAt: '2026-10-14',
    specs: 'Disparador automático con fecha, hora, atelier y confirmación en 1 toque.'
  },
  // 8. Agendar Cita Todo en la Misma Ventana (All-in-One)
  {
    id: 'req-victor-8',
    title: 'Que al agendar cita se pueda hacer todo desde la misma ventana',
    requestedBy: 'Yasmín',
    module: 'Owl UX / Agenda',
    priority: 'alta',
    deadline: '2026-10-31',
    status: 'en_curso',
    observations: 'Víctor: Desarrollando un modal "All-in-One" para que no haya que cambiar de pantalla: cliente, boutique, fecha, hora y asesora en una sola ventana.',
    createdAt: '2026-10-20',
    specs: 'Modal único sin recarga de pantalla que valida disponibilidad en tiempo real.'
  },
  // 9. Panel de Tareas para Yasmín
  {
    id: 'req-victor-9',
    title: 'Panel de Tareas para Yasmín',
    requestedBy: 'Yasmín',
    module: 'Owl Tareas Yasmín',
    priority: 'urgente',
    deadline: '2026-11-04',
    status: 'en_curso',
    observations: 'Víctor: Construyendo la interfaz exclusiva de Yasmín con su checklist de prioridades diarias, clientes por contactar, citas del día y reclamos.',
    createdAt: '2026-10-20',
    specs: 'Dashboard operativo con métricas diarias de citas, clientes en seguimiento y derivaciones.'
  },
  // 10. Conversaciones con pedido de asesor humano o reclamos diferenciadas en el panel de Yasmín
  {
    id: 'req-victor-10',
    title: 'Que las conversaciones que soliciten un asesor humano o hablar con alguien más por reclamos, aparezcan diferenciadas en el panel de tareas de Yasmín',
    requestedBy: 'Yasmín',
    module: 'Owl Kommo Routing',
    priority: 'urgente',
    deadline: '2026-11-06',
    status: 'sin_novedades',
    observations: 'Identificar automáticamente en el panel de Yasmín los chats donde el cliente pide "humano", "alguien más" o menciona disconformidad, con alerta visual roja.',
    createdAt: '2026-10-20',
    specs: 'Filtro y badge de alerta roja "Atención Especial / Reclamo" para toma inmediata por parte de Yasmín.'
  },
  // 11. Envío manual de SMS de Cita agendada por teléfono o mostrador
  {
    id: 'req-victor-11',
    title: 'Que se pueda enviar el SMS de la cita, agendada manualmente por parte de asesoras o por mí vía telefónica',
    requestedBy: 'Coty',
    module: 'Owl SMS Citas',
    priority: 'alta',
    deadline: '2026-11-05',
    status: 'sin_novedades',
    observations: 'Botón "Enviar SMS de Cita" para turnos que Coty o las asesoras cargan telefónicamente o en recepción, enviando confirmación inmediata al móvil del cliente.',
    createdAt: '2026-10-20',
    specs: 'Acción rápida en la fila de la cita: trigger manual del webhook de SMS con el resumen de la cita.'
  },
  // 12. Ordenar alfabéticamente todos los listados (salones, roles, etc.)
  {
    id: 'req-victor-12',
    title: 'Ordenar alfabéticamente todos los listados, de salones, de rol, etc.',
    requestedBy: 'Coty',
    module: 'Owl UI / Filtros',
    priority: 'media',
    deadline: '2026-11-02',
    status: 'sin_novedades',
    observations: 'Aplicar ordenamiento A-Z estándar en todos los desplegables del sistema Owl: salones (Paseo del Tejar, Recta Martinolli, Ruta 20, San Vicente, Villa María), roles, modistas, etc.',
    createdAt: '2026-10-20',
    specs: 'Sort alfabético predeterminado en todos los selectores de la base de datos de Owl.'
  },
  // 13. Historial de Citas Previas y Futuras en el Mismo Asesoramiento
  {
    id: 'req-victor-13',
    title: 'Que se pueda visualizar fácilmente el historial de citas previas o futuras de un cliente, en el mismo asesoramiento',
    requestedBy: 'Yasmín',
    module: 'Owl Expediente Cliente',
    priority: 'alta',
    deadline: '2026-11-08',
    status: 'sin_novedades',
    observations: 'Dentro de la ficha de asesoramiento, ver en un vistazo la línea de tiempo: citas anteriores, prendas probadas, citas canceladas y próximas fechas reservadas.',
    createdAt: '2026-10-20',
    specs: 'Línea de tiempo lateral: histórico de fechas con status "Realizada", "Ausente" o "Próxima".'
  },
  // 14. Cambiar hora, fecha o sucursal de la cita en una sola opción
  {
    id: 'req-victor-14',
    title: 'Poder cambiar la cita de: hora, fecha o sucursal, en una sola opción',
    requestedBy: 'Yasmín',
    module: 'Owl Reagendamiento',
    priority: 'alta',
    deadline: '2026-11-07',
    status: 'sin_novedades',
    observations: 'Permitir reprogramar en una única acción: cambiar hora, fecha o transferir a otra sucursal simultáneamente, sin anular y rearmar la cita.',
    createdAt: '2026-10-20',
    specs: 'Ventana de reprogramación unificada con actualización automática en la agenda del salón receptor.'
  },
  // 15. Ícono de mensajes visible en todos los usuarios y PCs
  {
    id: 'req-victor-15',
    title: 'Que agregue el icono de mensajes en todos los usuarios, o PCs, no solo en la mía',
    requestedBy: 'Coty',
    module: 'Owl Permisos & UI',
    priority: 'alta',
    deadline: '2026-11-03',
    status: 'sin_novedades',
    observations: 'Víctor: Habilitar el acceso al ícono de mensajería para todos los puestos de trabajo y cuentas de asesoras de salón, no únicamente en la PC de Coty.',
    createdAt: '2026-10-20',
    specs: 'Ajuste de permisos de rol para que el módulo de chat/mensajes sea accesible desde cualquier equipo conectado.'
  },
  // 16. WhatsApp de retención automático a las 24hs por Emma para conversaciones sin cita
  {
    id: 'req-victor-16',
    title: 'Que en las conversaciones sin cita, que dejaron de contestar, a las 24 hs Emma les envíe un wtsp de retención en modo automático',
    requestedBy: 'Coty',
    module: 'Owl Bot EMMA & WhatsApp',
    priority: 'urgente',
    deadline: '2026-11-10',
    status: 'sin_novedades',
    observations: 'Para prospectos que consultaron y dejaron de responder sin agendar: a las 24 horas exactas Emma les envía un WhatsApp cálido de retención invitándolas a reservar su probador privado.',
    createdAt: '2026-10-20',
    specs: 'Cron automático en Kommo/Owl: condicional [Estado = Sin Cita] AND [Inactividad > 24h] -> Disparar mensaje de retención Emma.'
  },
  // Tarea Base Coty: Dashboard Gerencial
  {
    id: 'task-coty-base-1',
    title: 'Dashboard Gerencial de Ventas y Citas por Sucursal',
    requestedBy: 'Coty',
    module: 'Owl Reportes',
    priority: 'alta',
    deadline: '2026-11-12',
    status: 'en_curso',
    observations: 'Víctor: Vista agregada para Coty con métricas de Recta Martinolli, R20, S.V, P de T y Villa María (ticket promedio y tasa de cierre).',
    createdAt: '2026-10-15',
    specs: 'Filtro por rango de fechas, boutique y tipo de prenda (Trajes vs Vestidos).'
  },
  // Tarea Base Yasmín: Ficha Digital de Medidas
  {
    id: 'task-yas-base-1',
    title: 'Ficha Digital de Medidas y Modistería de Atelier',
    requestedBy: 'Yasmín',
    module: 'Owl Probadores',
    priority: 'alta',
    deadline: '2026-11-02',
    status: 'finalizado',
    observations: 'LISTO / FINALIZADO. Desplegado para registro de medidas corporales exactas en probador.',
    createdAt: '2026-10-14',
    specs: 'Campos específicos para Trajes (hombro, tiro, basta) y Vestidos (escote, pinzas, ruedo).'
  },
  // Pack Oficial: 10 Campos Nuevos + 27 Reportes del Plan de Marketing (Divo Trajes y Divo Fem)
  ...VICTOR_REPORTES_PACK_TASKS
];

export const DEV_SUGGESTIONS: DevSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Control Fotográfico de Pruebas & Evolución de Modistería (Antes y Después)',
    category: 'operatividad',
    beneficiary: 'Yasmín (Operatividad)',
    description: 'Registro visual en la ficha de Owl de 3 fotos obligatorias por prueba (frente, perfil, espalda) etiquetadas con la fecha de la prueba y modista responsable.',
    impact: 'Protege a DIVO ante dudas o reclamos, permite a la clienta y modista ver el progreso exacto del entalle y garantiza que la prenda salga impecable del atelier.',
    suggestedDeadline: '2026-11-18',
    defaultModule: 'Owl Taller'
  },
  {
    id: 'sug-2',
    title: 'Semáforo Predictivo de Planchado y Entrega según Fecha del Evento',
    category: 'operatividad',
    beneficiary: 'Yasmín (Operatividad)',
    description: 'Algoritmo de urgencia en Owl que calcula automáticamente el día crítico de planchado y control de calidad según la fecha de la fiesta (alertas a 72h, 48h y 24h).',
    impact: 'Elimina las corridas de último momento de los viernes y garantiza que ninguna prenda llegue con arrugas o demoras a la fiesta del cliente.',
    suggestedDeadline: '2026-11-15',
    defaultModule: 'Owl Taller & Modistería'
  },
  {
    id: 'sug-3',
    title: 'Módulo de Gestión y Check-Out de Accesorios (Zapatos, Tocados, Gemelos, Velos)',
    category: 'operatividad',
    beneficiary: 'Ambas',
    description: 'Ficha complementaria en Owl para vincular accesorios prestados o vendidos a la prenda principal, con alerta de devolución y estado de conservación.',
    impact: 'Evita la pérdida o daño de complementos de alta costura y garantiza el reintegro de depósitos de garantía con total precisión.',
    suggestedDeadline: '2026-11-20',
    defaultModule: 'Owl Inventario'
  },
  {
    id: 'sug-4',
    title: 'Agendamiento Escalonado de Devoluciones Post-Fin de Semana (Anti-Colapso de Lunes)',
    category: 'operatividad',
    beneficiary: 'Yasmín (Operatividad)',
    description: 'Envío de turnos de 10 minutos para la devolución de trajes y vestidos los días lunes, distribuyendo el flujo de personas en cada boutique DIVO.',
    impact: 'Evita aglomeraciones en el salón los lunes por la mañana y permite a las asesoras revisar cada prenda devuelta con calma y profesionalismo.',
    suggestedDeadline: '2026-11-22',
    defaultModule: 'Owl Agenda'
  },
  {
    id: 'sug-5',
    title: 'Historial de Preferencias y Exclusividad ("No Repetir Prenda" en el Mismo Círculo Social)',
    category: 'operatividad',
    beneficiary: 'Yasmín (Operatividad)',
    description: 'Al buscar un vestido o traje de fiesta, Owl consulta si clientas del mismo colegio, empresa o grupo de invitados ya reservaron ese mismo diseño para esa fecha.',
    impact: 'Garantía de exclusividad absoluta para la clienta; previene el peor miedo de cualquier invitada o egresada: cruzarse con el mismo modelo.',
    suggestedDeadline: '2026-11-25',
    defaultModule: 'Owl Eventos'
  },
  {
    id: 'sug-6',
    title: 'Reporte Gerencial de "Prendas Estancadas" y Liquidación Inteligente',
    category: 'reportes',
    beneficiary: 'Coty (Reportes)',
    description: 'Reporte para Coty que detecta modelos de trajes y vestidos que llevan más de 90 o 180 días sin reservarse ni probarse.',
    impact: 'Permite a Coty armar promociones flash, reubicar la prenda en otra sucursal con diferente público o venderla para recuperar capital de trabajo.',
    suggestedDeadline: '2026-11-14',
    defaultModule: 'Owl Analytics'
  },
  {
    id: 'sug-7',
    title: 'Remito Digital con QR y Hoja de Ruta para Traslados entre Ateliers DIVO',
    category: 'operatividad',
    beneficiary: 'Ambas',
    description: 'Generación de un código QR en la funda de la prenda cuando se transfiere entre Recta Martinolli, R20, San Vicente, Paseo del Tejar o Villa María.',
    impact: 'Trazabilidad total de la ubicación física de cada vestido o traje durante el transporte, evitando pérdidas o confusiones entre sucursales.',
    suggestedDeadline: '2026-11-27',
    defaultModule: 'Sky Soft Sync'
  },
  {
    id: 'sug-8',
    title: 'Mapa de Calor de Ocupación de Probadores VIP & Incentivos para Días Hábiles',
    category: 'reportes',
    beneficiary: 'Coty (Reportes)',
    description: 'Gráfico interactivo que muestra la ocupación de probadores por día y franja horaria en cada boutique DIVO.',
    impact: 'Permite ofrecer incentivos o beneficios exclusivos para pruebas de lunes a miércoles, aliviando la sobredemanda de los viernes y sábados.',
    suggestedDeadline: '2026-11-19',
    defaultModule: 'Owl Reportes'
  },
  {
    id: 'sug-9',
    title: 'Opción de Upgrade de Alquiler a Compra Post-Fiesta con Deducción del 100%',
    category: 'reportes',
    beneficiary: 'Coty (Reportes)',
    description: 'Disparador a las 48h del evento ofreciendo al cliente comprar definitivamente el traje o vestido que usó, descontando la totalidad de lo pagado en el alquiler.',
    impact: 'Monetiza prendas de alta demanda con margen neto inmediato para clientes que se enamoraron de su look en las fotos de la fiesta.',
    suggestedDeadline: '2026-11-30',
    defaultModule: 'Owl Ventas'
  },
  {
    id: 'sug-10',
    title: 'Checklist Digital de Apertura y Cierre de Salón con Alerta de Excelencia a Dirección',
    category: 'operatividad',
    beneficiary: 'Ambas',
    description: 'Verificación diaria desde la tablet de sucursal: iluminación, limpieza de probadores, planchado de exhibición y arqueo de caja con firma digital de la encargada.',
    impact: 'Garantiza que cada boutique DIVO mantenga la excelencia de marca impecable todos los días sin necesidad de supervisión presencial constante.',
    suggestedDeadline: '2026-11-16',
    defaultModule: 'Owl Gestión'
  }
];
