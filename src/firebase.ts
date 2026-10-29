import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { VictorTask, TaskPriority, TaskRequester, TaskStatus } from './types/flow';

// Initialize Firebase App, Firestore (with explicit database ID), and Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

// Blueprint-synchronized constants (verbatim from firebase-blueprint.json)
export const WORKSPACE_ID = 'divo-owl';
export const DEFAULT_TEAM_CODE = 'DIVO-OWL';
export const BOOTSTRAP_ADMIN_EMAIL = 'jimenacmoreno@gmail.com';

export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_ID_LENGTH = 128;
export const MAX_WORKSPACE_NAME_LENGTH = 120;
export const MAX_TEAM_CODE_LENGTH = 32;
export const MAX_DISPLAY_NAME_LENGTH = 60;
export const MAX_TASK_IDS_COUNT = 250;
export const MAX_TITLE_LENGTH = 300;
export const MAX_MODULE_LENGTH = 100;
export const MAX_OBSERVATIONS_LENGTH = 2000;
export const MAX_SPECS_LENGTH = 2000;

const ALLOWED_REQUESTERS: TaskRequester[] = ['Coty', 'Yasmín', 'Sucursales', 'Administración'];
const ALLOWED_PRIORITIES: TaskPriority[] = ['urgente', 'alta', 'media', 'baja'];
const ALLOWED_STATUSES: TaskStatus[] = [
  'sin_novedades',
  'en_curso',
  'terminada',
  'probada',
  'bloqueada',
  'finalizado'
];

// Validate connection to Firestore on application boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Mandatory structured Firestore error handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Defensive Payload Sanitizers synchronized with firebase-blueprint.json
export function sanitizeId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, MAX_ID_LENGTH);
  return cleaned.length >= 1 ? cleaned : `task-${Date.now()}`;
}

export function sanitizeDate(rawDate: string | undefined, fallback = '2026-11-15'): string {
  if (rawDate && DATE_REGEX.test(rawDate.trim())) {
    return rawDate.trim();
  }
  return fallback;
}

export function sanitizeDisplayName(rawName: string | null | undefined): string {
  const base = (rawName || 'Equipo DIVO').trim();
  // Strip email domain if displayName happens to look like an email to avoid PII storage
  const withoutDomain = base.includes('@') ? base.split('@')[0] : base;
  const trimmed = withoutDomain.slice(0, MAX_DISPLAY_NAME_LENGTH).trim();
  return trimmed.length >= 1 ? trimmed : 'Equipo DIVO';
}

export function sanitizeTaskFields(task: VictorTask): VictorTask {
  const id = sanitizeId(task.id);
  const title = (task.title || 'Solicitud Owl').trim().slice(0, MAX_TITLE_LENGTH) || 'Solicitud Owl';
  const requestedBy: TaskRequester = ALLOWED_REQUESTERS.includes(task.requestedBy)
    ? task.requestedBy
    : 'Coty';
  const moduleName = (task.module || 'Owl CRM').trim().slice(0, MAX_MODULE_LENGTH) || 'Owl CRM';
  const priority: TaskPriority = ALLOWED_PRIORITIES.includes(task.priority)
    ? task.priority
    : 'alta';
  const deadline = sanitizeDate(task.deadline, '2026-11-15');
  const status: TaskStatus = ALLOWED_STATUSES.includes(task.status)
    ? task.status
    : 'sin_novedades';
  const observations =
    (task.observations || 'Sin observaciones registradas todavía.')
      .trim()
      .slice(0, MAX_OBSERVATIONS_LENGTH) || 'Sin observaciones registradas todavía.';
  const specs = (task.specs || '').trim().slice(0, MAX_SPECS_LENGTH);
  const createdAt = sanitizeDate(task.createdAt, new Date().toISOString().split('T')[0]);

  return {
    id,
    title,
    requestedBy,
    module: moduleName,
    priority,
    deadline,
    status,
    observations,
    specs,
    createdAt,
    ...(task.createdByUid ? { createdByUid: sanitizeId(task.createdByUid) } : {}),
  };
}
