export type ChannelCategory = 'paid' | 'organic' | 'web' | 'crm' | 'branch' | 'post-sale' | 'team';

export interface FlowNode {
  id: string;
  title: string;
  subtitle: string;
  category: ChannelCategory;
  responsible?: string;
  iconName: string;
  description: string;
  paperNoteReference: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  kpis: string[];
  uxCopySnippet?: {
    label: string;
    text: string;
    tone: string;
  };
  recommendedActions: string[];
  status: 'active' | 'in_setup' | 'optimized';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focusArea: string;
  associatedNodes: string[];
  avatarColor: string;
  responsibilities: string[];
  quote: string;
}

export interface BranchLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
  addressSummary: string;
  specialty: 'Trajes' | 'Vestidos' | 'Integral (Trajes & Vestidos)' | 'FEM';
  crmLink: string;
  gmbStatus: string;
}

export interface WebSection {
  id: string;
  title: string;
  path: string;
  objective: string;
  hierarchyLevel: 1 | 2 | 3;
  targetAudience: string;
  keyElements: string[];
  uxWriting: {
    heroHeading: string;
    subheading: string;
    primaryCta: string;
    secondaryCta?: string;
    microcopyNote: string;
  };
}

export interface CustomerJourney {
  id: string;
  title: string;
  persona: string;
  steps: {
    stage: string;
    nodeId: string;
    action: string;
    feeling: string;
    touchpoint: string;
  }[];
}

export type TaskStatus = 'sin_novedades' | 'en_curso' | 'terminada' | 'probada' | 'bloqueada' | 'finalizado';
export type TaskRequester = 'Coty' | 'Yasmín' | 'Sucursales' | 'Administración';
export type TaskPriority = 'urgente' | 'alta' | 'media';

export interface VictorTask {
  id: string;
  title: string;
  requestedBy: TaskRequester;
  module: string;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  observations: string;
  createdAt: string;
  specs?: string;
  createdByUid?: string;
}

export interface DevSuggestion {
  id: string;
  title: string;
  category: 'reportes' | 'operatividad' | 'automatizacion' | 'seguridad';
  beneficiary: 'Coty (Reportes)' | 'Yasmín (Operatividad)' | 'Ambas';
  description: string;
  impact: string;
  suggestedDeadline: string;
  defaultModule: string;
}
