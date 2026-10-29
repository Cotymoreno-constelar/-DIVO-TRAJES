import { VictorTask, TaskPriority, TaskRequester } from '../types/flow';

export interface NewSystemFieldItem {
  number: number;
  taskId: string;
  field: string;
  detail: string;
  usedInReports: number[];
  system: 'Owl' | 'Sly Soft' | 'Owl + Sly Soft' | 'Pauta (Owl)';
  isBaseline3103: boolean;
  defaultDeadline: string;
  requestedBy: TaskRequester;
}

export type ReportBlockCategory =
  | 'Citas (Owl)'
  | 'Emma y asesores (Owl)'
  | 'Facturación (Sly Soft)'
  | 'Cruces con pauta (línea base al 31/03)'
  | 'Tablero y automatización';

export interface SystemReportItem {
  number: number;
  taskId: string;
  block: ReportBlockCategory;
  name: string;
  whatItShowsAndCalculation: string;
  filters: string;
  frequency: string;
  system: 'Owl' | 'Sly Soft' | 'Owl + Sly Soft' | 'Cruce + pauta' | 'Owl + Kommo' | 'Todos';
  priorityLabel: 'Alta' | 'Media' | 'Baja';
  priority: TaskPriority;
  developmentStage: 2 | 3 | 4;
  defaultDeadline: string;
  requestedBy: TaskRequester;
  kpiHighlight?: string;
}

export interface Report27SubSection {
  id: string;
  title: string;
  bullets: string[];
}

export interface DevelopmentStageSpec {
  stageNumber: 1 | 2 | 3 | 4;
  label: string;
  subtitle: string;
  description: string;
  targetMilestone: string;
  taskIds: string[];
}

export interface DirectionPendingItem {
  id: string;
  number: number;
  title: string;
  detail: string;
  relatedTaskIds: string[];
  defaultProposal: string;
}

// ============================================================================
// 1. LOS 10 CAMPOS NUEVOS (HACERLOS PRIMERO)
// ============================================================================
export const NEW_SYSTEM_FIELDS: NewSystemFieldItem[] = [
  {
    number: 1,
    taskId: 'campo-divo-1',
    field: 'Origen de la cita',
    detail:
      'Obligatorio, lista cerrada: Meta, Google, Instagram orgánico, Emma/WhatsApp, web, referido, convenio/canje, pasó por el local, radio/vía pública, otro.',
    usedInReports: [1, 10, 18, 19, 20, 21],
    system: 'Owl',
    isBaseline3103: true,
    defaultDeadline: '2026-11-10',
    requestedBy: 'Coty',
  },
  {
    number: 2,
    taskId: 'campo-divo-2',
    field: 'Tipo de evento',
    detail: 'Lista cerrada: casamiento, quinceaños, egresados, otros.',
    usedInReports: [7, 14, 15, 23],
    system: 'Owl',
    isBaseline3103: false,
    defaultDeadline: '2026-11-12',
    requestedBy: 'Coty',
  },
  {
    number: 3,
    taskId: 'campo-divo-3',
    field: 'Fecha del evento',
    detail: 'Distinta de la fecha de la cita.',
    usedInReports: [9, 15],
    system: 'Owl',
    isBaseline3103: false,
    defaultDeadline: '2026-11-12',
    requestedBy: 'Yasmín',
  },
  {
    number: 4,
    taskId: 'campo-divo-4',
    field: 'Estado "Reprogramada"',
    detail:
      'Estado propio, separado de "Cancelada". Hoy la reprogramación queda escrita en Comentarios.',
    usedInReports: [2, 5],
    system: 'Owl',
    isBaseline3103: true,
    defaultDeadline: '2026-11-10',
    requestedBy: 'Yasmín',
  },
  {
    number: 5,
    taskId: 'campo-divo-5',
    field: 'Motivo de "No alquiló"',
    detail: 'Obligatorio al marcar ese estado, con lista cerrada de motivos.',
    usedInReports: [4, 6],
    system: 'Owl',
    isBaseline3103: true,
    defaultDeadline: '2026-11-10',
    requestedBy: 'Coty',
  },
  {
    number: 6,
    taskId: 'campo-divo-6',
    field: 'Convenio o código de descuento',
    detail: 'En la nota de pedido: UTN, Chialvo, gremios, vouchers y otros.',
    usedInReports: [16],
    system: 'Sly Soft',
    isBaseline3103: false,
    defaultDeadline: '2026-11-14',
    requestedBy: 'Administración',
  },
  {
    number: 7,
    taskId: 'campo-divo-7',
    field: 'Referido por',
    detail: 'Cliente, Club de Beneficios, Fem Club u otro.',
    usedInReports: [17],
    system: 'Owl + Sly Soft',
    isBaseline3103: false,
    defaultDeadline: '2026-11-14',
    requestedBy: 'Coty',
  },
  {
    number: 8,
    taskId: 'campo-divo-8',
    field: 'ID de cita en la nota de pedido',
    detail: 'Permite cruzar Owl con Sly Soft.',
    usedInReports: [18, 19, 20, 21],
    system: 'Owl + Sly Soft',
    isBaseline3103: true,
    defaultDeadline: '2026-11-11',
    requestedBy: 'Coty',
  },
  {
    number: 9,
    taskId: 'campo-divo-9',
    field: 'Asesora que gestionó',
    detail:
      'Quién agendó o gestionó el lead; se suma al campo Asesor (quien atendió en el local).',
    usedInReports: [10, 27],
    system: 'Owl',
    isBaseline3103: false,
    defaultDeadline: '2026-11-13',
    requestedBy: 'Yasmín',
  },
  {
    number: 10,
    taskId: 'campo-divo-10',
    field: 'Tabla de inversión en pauta',
    detail: 'Canal, mes, campaña e importe. Carga manual o importación.',
    usedInReports: [19, 20, 21, 22],
    system: 'Pauta (Owl)',
    isBaseline3103: true,
    defaultDeadline: '2026-11-11',
    requestedBy: 'Coty',
  },
];

// ============================================================================
// 2. LOS 27 REPORTES DEL SISTEMA (OWL + SLY SOFT + PAUTA + AUTOMATIZACIÓN)
// ============================================================================
export const SYSTEM_REPORTS_CATALOG: SystemReportItem[] = [
  // --- BLOQUE 1: CITAS (OWL) ---
  {
    number: 1,
    taskId: 'rep-divo-1',
    block: 'Citas (Owl)',
    name: 'Citas por origen',
    whatItShowsAndCalculation:
      'Cantidad de citas por canal, con asistencia, ausentismo y alquiler de cada una.',
    filters: 'Fecha, sucursal, tipo de evento',
    frequency: 'Mensual',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-18',
    requestedBy: 'Coty',
  },
  {
    number: 2,
    taskId: 'rep-divo-2',
    block: 'Citas (Owl)',
    name: 'Embudo por estado',
    whatItShowsAndCalculation:
      'Todos los estados: reservado, alquiló, no alquiló, ausente, cancelada, reprogramada, pendiente, otras gestiones. Tasa de éxito de citas = alquiló ÷ asistidas. Ausentismo = ausentes ÷ total de citas (meta: 20% o menos).',
    filters: 'Fecha, sucursal, asesor, origen',
    frequency: 'Semanal y mensual',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-18',
    requestedBy: 'Coty',
    kpiHighlight: 'Meta ausentismo ≤ 20%',
  },
  {
    number: 3,
    taskId: 'rep-divo-3',
    block: 'Citas (Owl)',
    name: 'Citas sin cerrar',
    whatItShowsAndCalculation:
      'Listado de citas vencidas que siguen en estado pendiente o reservado, con antigüedad y responsable. Hoy el 14,5% queda sin resolver y distorsiona el ausentismo.',
    filters: 'Sucursal, asesor',
    frequency: 'Diaria',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-19',
    requestedBy: 'Yasmín',
    kpiHighlight: 'Eliminar 14,5% sin resolver',
  },
  {
    number: 4,
    taskId: 'rep-divo-4',
    block: 'Citas (Owl)',
    name: 'Motivos de "No alquiló"',
    whatItShowsAndCalculation:
      'Ranking de motivos y % de citas "No alquiló" con motivo cargado (meta: 95% o más).',
    filters: 'Fecha, sucursal, asesor',
    frequency: 'Semanal y mensual',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-19',
    requestedBy: 'Coty',
    kpiHighlight: 'Meta carga motivo ≥ 95%',
  },
  {
    number: 5,
    taskId: 'rep-divo-5',
    block: 'Citas (Owl)',
    name: 'Reprogramaciones vs cancelaciones',
    whatItShowsAndCalculation:
      'Cantidad de reprogramadas y de canceladas reales, por separado.',
    filters: 'Fecha, sucursal, origen',
    frequency: 'Mensual',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-20',
    requestedBy: 'Yasmín',
  },
  {
    number: 6,
    taskId: 'rep-divo-6',
    block: 'Citas (Owl)',
    name: 'Leads que alquilan y no alquilan',
    whatItShowsAndCalculation:
      'Leads que alquilan, leads que no y por qué, con el origen de cada uno.',
    filters: 'Fecha, sucursal, origen',
    frequency: 'Mensual',
    system: 'Owl',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-20',
    requestedBy: 'Coty',
  },
  {
    number: 7,
    taskId: 'rep-divo-7',
    block: 'Citas (Owl)',
    name: 'Mix por tipo de evento',
    whatItShowsAndCalculation:
      '% de casamientos y quinceaños sobre el total de citas (meta: 60% en septiembre).',
    filters: 'Fecha, sucursal',
    frequency: 'Mensual',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-27',
    requestedBy: 'Coty',
    kpiHighlight: 'Meta 60% en septiembre',
  },
  {
    number: 8,
    taskId: 'rep-divo-8',
    block: 'Citas (Owl)',
    name: 'Seguimiento de reservas',
    whatItShowsAndCalculation:
      'Reservas abiertas, antigüedad y responsable de seguimiento (apoya el manual de Responsables de Sucursal).',
    filters: 'Sucursal, responsable',
    frequency: 'Semanal',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-27',
    requestedBy: 'Sucursales',
  },
  {
    number: 9,
    taskId: 'rep-divo-9',
    block: 'Citas (Owl)',
    name: 'Capacidad y saturación',
    whatItShowsAndCalculation:
      'Citas por franja horaria y sucursal frente a la capacidad de atención, para anticipar picos (por ejemplo el 14/02 y la temporada alta).',
    filters: 'Sucursal, fecha del evento',
    frequency: 'Mensual y previo a picos',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-28',
    requestedBy: 'Sucursales',
  },

  // --- BLOQUE 2: EMMA Y ASESORES (OWL) ---
  {
    number: 10,
    taskId: 'rep-divo-10',
    block: 'Emma y asesores (Owl)',
    name: 'Emma',
    whatItShowsAndCalculation:
      'Citas agendadas por Emma, % que asiste, % que alquila y comparación contra citas agendadas por asesoras.',
    filters: 'Fecha, sucursal',
    frequency: 'Semanal',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-28',
    requestedBy: 'Yasmín',
  },
  {
    number: 11,
    taskId: 'rep-divo-11',
    block: 'Emma y asesores (Owl)',
    name: 'Ranking semanal por asesora',
    whatItShowsAndCalculation:
      'Cantidad de alquileres y ticket promedio de la semana por asesora (alimenta los desafíos semanales).',
    filters: 'Semana, sucursal',
    frequency: 'Semanal',
    system: 'Owl + Sly Soft',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-29',
    requestedBy: 'Yasmín',
  },
  {
    number: 12,
    taskId: 'rep-divo-12',
    block: 'Emma y asesores (Owl)',
    name: 'Muestra de calidad de atención',
    whatItShowsAndCalculation:
      'Conversaciones de Emma y visitas a sucursal sorteadas cada mes para evaluar, con campo de puntaje y comentario.',
    filters: 'Mes, sucursal',
    frequency: 'Mensual',
    system: 'Owl',
    priorityLabel: 'Baja',
    priority: 'baja',
    developmentStage: 4,
    defaultDeadline: '2026-12-10',
    requestedBy: 'Yasmín',
  },

  // --- BLOQUE 3: FACTURACIÓN (SLY SOFT) ---
  {
    number: 13,
    taskId: 'rep-divo-13',
    block: 'Facturación (Sly Soft)',
    name: 'Notas de pedido y facturación',
    whatItShowsAndCalculation:
      'Notas y facturación del mes frente al mismo mes del año anterior y frente a la meta de 1.000 notas mensuales.',
    filters: 'Fecha, sucursal',
    frequency: 'Mensual',
    system: 'Sly Soft',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-21',
    requestedBy: 'Coty',
    kpiHighlight: 'Meta 1.000 notas/mes',
  },
  {
    number: 14,
    taskId: 'rep-divo-14',
    block: 'Facturación (Sly Soft)',
    name: 'Ticket promedio',
    whatItShowsAndCalculation:
      'Facturación ÷ notas de pedido, con trayectoria hacia $200.000.',
    filters: 'Fecha, sucursal, tipo de evento',
    frequency: 'Mensual',
    system: 'Sly Soft',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-21',
    requestedBy: 'Coty',
    kpiHighlight: 'Trayectoria a $200.000',
  },
  {
    number: 15,
    taskId: 'rep-divo-15',
    block: 'Facturación (Sly Soft)',
    name: 'Facturación por segmento',
    whatItShowsAndCalculation:
      'Novios, quinceañeras, egresados y otros. Permite ver si novios y quinceañeras cubren el piso de cada mes.',
    filters: 'Fecha, sucursal',
    frequency: 'Mensual',
    system: 'Sly Soft',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-22',
    requestedBy: 'Coty',
  },
  {
    number: 16,
    taskId: 'rep-divo-16',
    block: 'Facturación (Sly Soft)',
    name: 'Convenios y descuentos',
    whatItShowsAndCalculation:
      'Notas, descuento en pesos y ticket promedio por convenio (UTN, Chialvo, gremios, vouchers).',
    filters: 'Fecha, convenio, sucursal',
    frequency: 'Mensual',
    system: 'Sly Soft',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-30',
    requestedBy: 'Administración',
  },
  {
    number: 17,
    taskId: 'rep-divo-17',
    block: 'Facturación (Sly Soft)',
    name: 'Recurrentes y referidos',
    whatItShowsAndCalculation:
      'Clientes que vuelven, clientes que llegaron por recomendación y cantidad de prendas por clienta (para medir Fem Club).',
    filters: 'Fecha, referido por',
    frequency: 'Mensual',
    system: 'Owl + Sly Soft',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-11-30',
    requestedBy: 'Coty',
    kpiHighlight: 'Medición Fem Club',
  },

  // --- BLOQUE 4: CRUCES CON PAUTA (LÍNEA BASE AL 31/03) ---
  {
    number: 18,
    taskId: 'rep-divo-18',
    block: 'Cruces con pauta (línea base al 31/03)',
    name: 'Facturación atribuible a marketing',
    whatItShowsAndCalculation:
      'Cruce cita con origen → nota de pedido en Sly Soft.',
    filters: 'Fecha, origen, sucursal',
    frequency: 'Mensual',
    system: 'Owl + Sly Soft',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-23',
    requestedBy: 'Coty',
    kpiHighlight: 'Línea base 31/03',
  },
  {
    number: 19,
    taskId: 'rep-divo-19',
    block: 'Cruces con pauta (línea base al 31/03)',
    name: 'CAC',
    whatItShowsAndCalculation:
      'Pauta total ÷ notas de pedido atribuibles a esa pauta.',
    filters: 'Fecha, canal, campaña',
    frequency: 'Mensual',
    system: 'Cruce + pauta',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-24',
    requestedBy: 'Coty',
    kpiHighlight: 'Línea base 31/03',
  },
  {
    number: 20,
    taskId: 'rep-divo-20',
    block: 'Cruces con pauta (línea base al 31/03)',
    name: 'Costo por cita asistida',
    whatItShowsAndCalculation:
      'Pauta ÷ citas a las que el cliente efectivamente asistió.',
    filters: 'Fecha, canal, campaña',
    frequency: 'Mensual',
    system: 'Cruce + pauta',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-24',
    requestedBy: 'Coty',
    kpiHighlight: 'Línea base 31/03',
  },
  {
    number: 21,
    taskId: 'rep-divo-21',
    block: 'Cruces con pauta (línea base al 31/03)',
    name: 'ROAS',
    whatItShowsAndCalculation:
      'Facturación atribuible ÷ inversión en pauta.',
    filters: 'Fecha, canal, campaña',
    frequency: 'Mensual',
    system: 'Cruce + pauta',
    priorityLabel: 'Alta',
    priority: 'alta',
    developmentStage: 2,
    defaultDeadline: '2026-11-25',
    requestedBy: 'Coty',
    kpiHighlight: 'Línea base 31/03',
  },
  {
    number: 22,
    taskId: 'rep-divo-22',
    block: 'Cruces con pauta (línea base al 31/03)',
    name: 'Pauta como % de la facturación',
    whatItShowsAndCalculation:
      'Inversión en pauta ÷ facturación, con alerta si baja del porcentaje definido.',
    filters: 'Fecha',
    frequency: 'Mensual',
    system: 'Cruce + pauta',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-12-02',
    requestedBy: 'Coty',
  },

  // --- BLOQUE 5: TABLERO Y AUTOMATIZACIÓN ---
  {
    number: 23,
    taskId: 'rep-divo-23',
    block: 'Tablero y automatización',
    name: 'Tablero mensual por sucursal',
    whatItShowsAndCalculation:
      'Notas, ticket promedio, éxito de citas y ausentismo de cada sucursal en una sola vista, para comparar (por ejemplo Recta Martinolli vs San Vicente).',
    filters: 'Mes, sucursal',
    frequency: 'Mensual',
    system: 'Owl + Sly Soft',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-12-03',
    requestedBy: 'Coty',
  },
  {
    number: 24,
    taskId: 'rep-divo-24',
    block: 'Tablero y automatización',
    name: 'Alertas automáticas',
    whatItShowsAndCalculation:
      'Aviso por mail o WhatsApp: citas sin cerrar al final del día, ausentismo sobre el umbral, motivo de "No alquiló" faltante.',
    filters: 'Sucursal',
    frequency: 'Automática',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-12-04',
    requestedBy: 'Yasmín',
  },
  {
    number: 25,
    taskId: 'rep-divo-25',
    block: 'Tablero y automatización',
    name: 'Envío programado',
    whatItShowsAndCalculation:
      'Semanal a Responsables de Sucursal y mensual a dirección, con los reportes que corresponda a cada uno.',
    filters: 'Destinatario',
    frequency: 'Según destinatario',
    system: 'Todos',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-12-05',
    requestedBy: 'Coty',
  },
  {
    number: 26,
    taskId: 'rep-divo-26',
    block: 'Tablero y automatización',
    name: 'Comparativo Owl vs Kommo',
    whatItShowsAndCalculation:
      'Comparación de la información de Recta Martinolli mientras dure el piloto de Kommo.',
    filters: 'Fecha',
    frequency: 'Mensual',
    system: 'Owl + Kommo',
    priorityLabel: 'Baja',
    priority: 'baja',
    developmentStage: 4,
    defaultDeadline: '2026-12-12',
    requestedBy: 'Coty',
  },
  {
    number: 27,
    taskId: 'rep-divo-27',
    block: 'Tablero y automatización',
    name: 'Gestión por persona del equipo',
    whatItShowsAndCalculation:
      'Seguimiento individual con filtro por persona (primer uso: asesora en línea / Yasmín). Semanal con comparativo vs semana anterior y acumulado mensual.',
    filters: 'Persona, fecha, origen, sucursal',
    frequency: 'Semanal y mensual',
    system: 'Owl',
    priorityLabel: 'Media',
    priority: 'media',
    developmentStage: 3,
    defaultDeadline: '2026-12-06',
    requestedBy: 'Coty',
    kpiHighlight: '1° resp < 2h · 4 reseñas/sem',
  },
];

// ============================================================================
// 3. DETALLE DEL REPORTE 27: GESTIÓN POR PERSONA DEL EQUIPO (PRIMER USO: YASMÍN)
// ============================================================================
export const REPORT_27_SECTIONS: Report27SubSection[] = [
  {
    id: 'atencion-en-linea',
    title: 'Atención en línea',
    bullets: [
      'Consultas recibidas y consultas atendidas por la persona.',
      'Tiempo de primera respuesta: promedio y % en menos de 2 horas.',
      'Consultas abandonadas o sin respuesta, con antigüedad.',
    ],
  },
  {
    id: 'conversion',
    title: 'Conversión',
    bullets: [
      'Citas agendadas y % que asiste, se ausenta, cancela o reprograma.',
      'Alquileres cerrados de las citas que agendó, y su ticket promedio.',
      'Tasa consulta → cita y tasa cita asistida → alquiler.',
      'Desglose por origen y por tipo de evento.',
    ],
  },
  {
    id: 'seguimiento-leads',
    title: 'Seguimiento de leads',
    bullets: [
      'Leads asignados y estado de cada uno.',
      'Alerta de leads sin contacto en más de X días (a definir con Dirección).',
      'Leads de eventos (por ejemplo Pío X): contactados, respondieron, agendaron cita y alquilaron.',
    ],
  },
  {
    id: 'post-venta',
    title: 'Post-venta',
    bullets: [
      'Clientes contactados para pedir reseña y reseñas de Google obtenidas (meta: 4 por semana).',
      'Clientes reactivados: contactados, respondieron y volvieron a alquilar.',
      'Referidos generados.',
    ],
  },
  {
    id: 'alertas',
    title: 'Alertas',
    bullets: [
      'Aviso automático si el tiempo de respuesta o la cantidad de leads sin contacto superan el umbral definido.',
    ],
  },
];

// ============================================================================
// 4. CONDICIONES GENERALES Y FÓRMULAS FIJAS POR ESCRITO
// ============================================================================
export const GENERAL_REPORT_CONDITIONS = [
  {
    title: 'Filtros comunes estandarizados',
    detail: 'Todos los reportes aplicables comparten los filtros: fecha, sucursal, asesor/a, origen, tipo de evento y estado.',
  },
  {
    title: 'Exportación directa',
    detail: 'Botón de exportación a Excel (.xlsx) o CSV disponible desde cada uno de los 27 reportes.',
  },
  {
    title: 'Permisos por rol y sede',
    detail: 'Cada Responsable de Sucursal ve únicamente los datos de su sucursal; Dirección (Coty) ve todas las sucursales consolidadas y comparadas.',
  },
  {
    title: 'Historial inmutable y auditado',
    detail: 'Los estados nunca se borran; solo se modifican dejando registro de cambio (usuario que modificó y fecha/hora exacta).',
  },
  {
    title: 'Fórmulas fijas y unificadas',
    detail: 'Definidas por escrito y bloqueadas en el código (ausentismo, éxito de citas, ticket promedio, CAC, ROAS) para que nadie calcule distinto.',
  },
];

export const OFFICIAL_FORMULAS = [
  {
    metric: 'Tasa de éxito de citas',
    formula: 'Citas que alquilaron ÷ Citas asistidas',
    target: 'Seguimiento semanal y mensual (Rep. 2 y 23)',
  },
  {
    metric: 'Tasa de ausentismo',
    formula: 'Citas ausentes ÷ Total de citas agendadas',
    target: 'Meta: 20% o menos (Rep. 2, 3 y 23)',
  },
  {
    metric: 'Ticket promedio',
    formula: 'Facturación total ÷ Cantidad de notas de pedido',
    target: 'Trayectoria hacia $200.000 (Rep. 14)',
  },
  {
    metric: 'CAC (Costo de Adquisición)',
    formula: 'Inversión en pauta total ÷ Notas de pedido atribuibles a esa pauta',
    target: 'Línea base al 31/03 (Rep. 19)',
  },
  {
    metric: 'Costo por cita asistida',
    formula: 'Inversión en pauta ÷ Citas a las que el cliente efectivamente asistió',
    target: 'Línea base al 31/03 (Rep. 20)',
  },
  {
    metric: 'ROAS',
    formula: 'Facturación atribuible a pauta ÷ Inversión en pauta',
    target: 'Línea base al 31/03 (Rep. 21)',
  },
  {
    metric: 'Pauta sobre facturación',
    formula: 'Inversión en pauta ÷ Facturación total',
    target: 'Con alerta si baja del % definido (Rep. 22)',
  },
];

// ============================================================================
// 5. ORDEN SUGERIDO DE DESARROLLO (SECCIÓN 5 DEL DOCUMENTO)
// ============================================================================
export const DEVELOPMENT_ORDER_STAGES: DevelopmentStageSpec[] = [
  {
    stageNumber: 1,
    label: 'Primero · Campos Base Críticos',
    subtitle: 'Campos 1, 4, 5, 8 y 10 (+ Campos complementarios 2, 3, 6, 7 y 9)',
    description:
      'Prioridad inmediata: campos 1, 4, 5, 8 y 10 indispensables para construir la línea base de CAC, costo por cita asistida y ROAS al 31/03, seguidos del resto de campos nuevos.',
    targetMilestone: 'Línea base al 31/03',
    taskIds: NEW_SYSTEM_FIELDS.map((f) => f.taskId),
  },
  {
    stageNumber: 2,
    label: 'Segundo · Reportes de Prioridad Alta',
    subtitle: 'Reportes 1 a 6 (Owl), 13 a 15 (Sly Soft) y 18 a 21 (Cruces Pauta)',
    description:
      'Embudo de citas, citas sin cerrar (14,5%), motivos de no alquiler, notas hacia meta de 1.000/mes, ticket hacia $200.000, CAC, costo por cita asistida y ROAS.',
    targetMilestone: '13 Reportes Alta Prioridad',
    taskIds: SYSTEM_REPORTS_CATALOG.filter((r) => r.developmentStage === 2).map((r) => r.taskId),
  },
  {
    stageNumber: 3,
    label: 'Tercero · Prioridad Media, Tablero y Alertas',
    subtitle: 'Reportes 7 a 11, 16, 17, 22 a 25 y 27 (Gestión por persona)',
    description:
      'Mix de eventos (meta 60% sep), reservas, saturación, Emma vs asesoras, convenios, Fem Club, tablero comparativo por sucursal, alertas automáticas, envíos y Reporte 27.',
    targetMilestone: '12 Reportes Media + Automatización',
    taskIds: SYSTEM_REPORTS_CATALOG.filter((r) => r.developmentStage === 3).map((r) => r.taskId),
  },
  {
    stageNumber: 4,
    label: 'Cuarto · Reportes de Prioridad Baja',
    subtitle: 'Reportes 12 (Calidad) y 26 (Comparativo Owl vs Kommo)',
    description:
      'Sorteo mensual de calidad de atención (Emma y salón) y comparativo de Recta Martinolli durante el piloto de Kommo.',
    targetMilestone: '2 Reportes Complementarios',
    taskIds: SYSTEM_REPORTS_CATALOG.filter((r) => r.developmentStage === 4).map((r) => r.taskId),
  },
];

// ============================================================================
// 6. PENDIENTES DE DEFINIR CON DIRECCIÓN (SECCIÓN 6 DEL DOCUMENTO)
// ============================================================================
export const DIRECTION_PENDING_ITEMS: DirectionPendingItem[] = [
  {
    id: 'dir-pending-1',
    number: 1,
    title: 'Metas del Reporte 27 (Gestión por persona)',
    detail:
      'Hoy solo hay meta de tiempo de respuesta (< 2 hs) y de reseñas de Google (4 por semana); el resto conviene fijarlo con una línea base de 4 semanas.',
    relatedTaskIds: ['rep-divo-27'],
    defaultProposal: 'Medir 4 semanas de línea base con Yasmín antes de fijar metas de conversión y reactivación.',
  },
  {
    id: 'dir-pending-2',
    number: 2,
    title: 'Permisos de acceso al Reporte 27',
    detail:
      'Definir quién tiene acceso al Reporte 27: si lo visualiza únicamente Marketing o también Dirección.',
    relatedTaskIds: ['rep-divo-27'],
    defaultProposal: 'Acceso habilitado para Dirección (Coty) y Coordinación de Marketing.',
  },
  {
    id: 'dir-pending-3',
    number: 3,
    title: 'Umbrales de las alertas automáticas',
    detail:
      'Definir cantidad máxima de días sin contacto en leads abiertos y el umbral exacto de % de ausentismo que dispara alerta.',
    relatedTaskIds: ['rep-divo-24', 'rep-divo-27'],
    defaultProposal: 'Alerta en leads > 3 días sin contacto y ausentismo > 20% semanal por sucursal.',
  },
  {
    id: 'dir-pending-4',
    number: 4,
    title: 'Listas cerradas definitivas de "No alquiló" y "Origen de cita"',
    detail:
      'Cerrar con Dirección el listado definitivo de opciones para Motivo de "No alquiló" y validar lista cerrada de Orígenes de cita.',
    relatedTaskIds: ['campo-divo-1', 'campo-divo-5', 'rep-divo-4'],
    defaultProposal:
      'Motivos sugeridos: Precio / Presupuesto, No encontró talle, No encontró modelo/color, Solo estaba averiguando, Alquiló en competencia, Postergó evento.',
  },
];

// ============================================================================
// GENERACIÓN DE LAS 37 SOLICITUDES TÉCNICAS PARA EL TABLERO DE VÍCTOR
// ============================================================================
export const VICTOR_REPORTES_PACK_TASKS: VictorTask[] = [
  // 10 Campos Nuevos (Hacerlos primero)
  ...NEW_SYSTEM_FIELDS.map((f): VictorTask => ({
    id: f.taskId,
    title: `[Campo Nuevo ${f.number} · Hacer Primero] ${f.field}`,
    requestedBy: f.requestedBy,
    module: f.isBaseline3103
      ? `${f.system} · Etapa 1 (Base 31/03)`
      : `${f.system} · Etapa 1 (Campos Base)`,
    priority: f.isBaseline3103 ? 'urgente' : 'alta',
    deadline: f.defaultDeadline,
    status: 'sin_novedades',
    observations: `${
      f.isBaseline3103
        ? 'PRIORIDAD ETAPA 1 (Necesario para línea base CAC/ROAS al 31/03). '
        : 'ETAPA 1 (Hacer antes de los reportes dependientes). '
    }${f.detail} Historial auditado sin borrado de estados.`,
    specs: `Sistema: ${f.system} · Alimenta los Reportes N°: ${f.usedInReports.join(', ')}.`,
    createdAt: '2026-10-29',
  })),

  // 27 Reportes del Sistema
  ...SYSTEM_REPORTS_CATALOG.map((r): VictorTask => ({
    id: r.taskId,
    title: `[Reporte ${r.number} · ${r.system}] ${r.name}`,
    requestedBy: r.requestedBy,
    module: `${r.block.split(' (')[0]} · Etapa ${r.developmentStage}`,
    priority: r.priority,
    deadline: r.defaultDeadline,
    status: 'sin_novedades',
    observations: `${r.whatItShowsAndCalculation} · Frecuencia: ${r.frequency}. Exportación obligatoria a Excel/CSV y permisos por sucursal/Dirección.`,
    specs: `Sistema: ${r.system} | Filtros: ${r.filters} | Frecuencia: ${r.frequency} | Orden sugerido: Etapa ${r.developmentStage} (Prioridad ${r.priorityLabel}).`,
    createdAt: '2026-10-29',
  })),
];
