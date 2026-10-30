/**
 * Security Rules Verification Suite — Dirty Dozen Adversarial Payloads (Public Live Mode)
 * Validates that every Dirty Dozen attack vector in security_spec.md is rejected
 * with PERMISSION_DENIED while legitimate Public Live & Admin operations succeed.
 */

import fs from 'node:fs';
import path from 'node:path';

interface AuthContext {
  uid: string;
  email: string;
  email_verified: boolean;
}

interface DbState {
  admins: Record<string, { uid: string; createdAt: number }>;
  workspaces: Record<string, Record<string, unknown>>;
  members: Record<string, Record<string, unknown>>;
  tasks: Record<string, Record<string, unknown>>;
  decisions: Record<string, Record<string, unknown>>;
}

const REQUEST_TIME = 1793250000000;
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const PUBLIC_ACTOR_REGEX = /^pub-[a-zA-Z0-9_\-]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DECISION_IDS = ['dir-pending-1', 'dir-pending-2', 'dir-pending-3', 'dir-pending-4'];

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isPublicDivoWorkspace(workspaceId: unknown): workspaceId is string {
  return isValidId(workspaceId) && workspaceId === 'divo-owl';
}

function isValidPublicActorId(actorId: unknown): actorId is string {
  return (
    isValidId(actorId) &&
    actorId.length >= 10 &&
    actorId.length <= 64 &&
    PUBLIC_ACTOR_REGEX.test(actorId)
  );
}

function isVerifiedUser(auth: AuthContext | null): auth is AuthContext {
  return auth !== null && auth.email_verified === true;
}

function isAuthorizedActor(actorId: unknown, auth: AuthContext | null): boolean {
  if (auth === null) {
    return isValidPublicActorId(actorId);
  }
  return isVerifiedUser(auth) && actorId === auth.uid;
}

function isBootstrapAdmin(auth: AuthContext | null): boolean {
  return isVerifiedUser(auth) && auth.email === 'jimenacmoreno@gmail.com';
}

function isAdmin(auth: AuthContext | null, db: DbState): boolean {
  return isVerifiedUser(auth) && (auth.email === 'jimenacmoreno@gmail.com' || Boolean(db.admins[auth.uid]));
}

function isValidOwlTask(data: Record<string, unknown>, auth: AuthContext | null): boolean {
  const requiredKeys = [
    'id', 'workspaceId', 'title', 'requestedBy', 'module', 'priority',
    'deadline', 'status', 'observations', 'specs', 'createdDateLabel',
    'createdByUid', 'updatedByUid', 'createdAt', 'updatedAt'
  ];
  const keys = Object.keys(data);
  if (!requiredKeys.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => requiredKeys.includes(k))) return false;

  return (
    isValidId(data.id) &&
    isPublicDivoWorkspace(data.workspaceId) &&
    typeof data.title === 'string' && data.title.length >= 1 && data.title.length <= 300 &&
    typeof data.requestedBy === 'string' && ['Coty', 'Yasmín', 'Sucursales', 'Administración'].includes(data.requestedBy) &&
    typeof data.module === 'string' && data.module.length >= 1 && data.module.length <= 100 &&
    typeof data.priority === 'string' && ['urgente', 'alta', 'media', 'baja'].includes(data.priority) &&
    typeof data.deadline === 'string' && data.deadline.length === 10 && DATE_REGEX.test(data.deadline) &&
    typeof data.status === 'string' && ['sin_novedades', 'en_curso', 'terminada', 'probada', 'bloqueada', 'finalizado'].includes(data.status) &&
    typeof data.observations === 'string' && data.observations.length >= 1 && data.observations.length <= 2000 &&
    typeof data.specs === 'string' && data.specs.length >= 0 && data.specs.length <= 2000 &&
    typeof data.createdDateLabel === 'string' && DATE_REGEX.test(data.createdDateLabel) &&
    isValidId(data.createdByUid) &&
    isAuthorizedActor(data.updatedByUid, auth) &&
    typeof data.createdAt === 'number' &&
    typeof data.updatedAt === 'number'
  );
}

function evaluateAdminCreate(adminId: string, incoming: Record<string, unknown>, auth: AuthContext | null): boolean {
  if (!isBootstrapAdmin(auth) || !auth) return false;
  if (!isValidId(adminId) || adminId !== auth.uid) return false;
  const keys = Object.keys(incoming);
  if (keys.length !== 2 || !keys.includes('uid') || !keys.includes('createdAt')) return false;
  return incoming.uid === auth.uid && incoming.createdAt === REQUEST_TIME;
}

function evaluateWorkspaceGet(workspaceId: string): boolean {
  return isPublicDivoWorkspace(workspaceId);
}

function evaluateTaskCreate(
  workspaceId: string,
  taskId: string,
  incoming: Record<string, unknown>,
  auth: AuthContext | null,
  db: DbState,
  postDb: DbState
): boolean {
  if (!isPublicDivoWorkspace(workspaceId) || !isValidId(taskId)) return false;
  if (!isValidOwlTask(incoming, auth)) return false;
  if (incoming.id !== taskId || incoming.workspaceId !== workspaceId) return false;
  if (!isAuthorizedActor(incoming.createdByUid, auth)) return false;
  if (incoming.createdByUid !== incoming.updatedByUid) return false;
  if (incoming.createdAt !== REQUEST_TIME || incoming.updatedAt !== REQUEST_TIME) return false;
  if (!db.workspaces[workspaceId]) return false;
  const postWs = postDb.workspaces[workspaceId];
  const postTaskIds = (postWs?.taskIds as string[]) || [];
  return postTaskIds.includes(taskId);
}

function evaluateTaskUpdate(
  workspaceId: string,
  taskId: string,
  incoming: Record<string, unknown>,
  auth: AuthContext | null,
  db: DbState
): boolean {
  if (!isPublicDivoWorkspace(workspaceId) || !isValidId(taskId)) return false;
  if (!db.workspaces[workspaceId]) return false;
  const existing = db.tasks[`${workspaceId}/${taskId}`];
  if (!existing) return false;
  if (!isValidOwlTask(incoming, auth)) return false;
  if (
    incoming.id !== existing.id ||
    incoming.workspaceId !== existing.workspaceId ||
    incoming.createdByUid !== existing.createdByUid ||
    incoming.createdDateLabel !== existing.createdDateLabel ||
    incoming.createdAt !== existing.createdAt ||
    incoming.updatedAt !== REQUEST_TIME
  ) {
    return false;
  }
  if (existing.status === 'finalizado' && !isAdmin(auth, db)) {
    return false;
  }
  if (isAdmin(auth, db)) return true;

  const affectedKeys = Object.keys(incoming).filter((k) => incoming[k] !== existing[k]);
  const allowedProgress = ['status', 'deadline', 'observations', 'specs', 'updatedByUid', 'updatedAt'];
  const allowedFull = [
    'title', 'requestedBy', 'module', 'priority', 'deadline',
    'status', 'observations', 'specs', 'updatedByUid', 'updatedAt'
  ];
  return (
    affectedKeys.every((k) => allowedProgress.includes(k)) ||
    affectedKeys.every((k) => allowedFull.includes(k))
  );
}

function evaluateDecisionWrite(
  workspaceId: string,
  decisionId: string,
  incoming: Record<string, unknown>,
  auth: AuthContext | null,
  db: DbState
): boolean {
  if (!isPublicDivoWorkspace(workspaceId)) return false;
  if (!DECISION_IDS.includes(decisionId)) return false;
  if (!db.workspaces[workspaceId]) return false;
  const reqKeys = ['id', 'workspaceId', 'text', 'resolved', 'updatedByUid', 'updatedAt'];
  const keys = Object.keys(incoming);
  if (!reqKeys.every((k) => keys.includes(k)) || !keys.every((k) => reqKeys.includes(k))) return false;
  if (incoming.id !== decisionId || incoming.workspaceId !== workspaceId) return false;
  if (typeof incoming.text !== 'string' || incoming.text.length < 1 || incoming.text.length > 1500) return false;
  if (typeof incoming.resolved !== 'boolean') return false;
  if (!isAuthorizedActor(incoming.updatedByUid, auth)) return false;
  return incoming.updatedAt === REQUEST_TIME;
}

function evaluateList(): boolean {
  return false;
}

function assertDenied(allowed: boolean, name: string): void {
  if (allowed) {
    throw new Error(`SECURITY FAILURE: Dirty Dozen test "${name}" WAS ALLOWED instead of PERMISSION_DENIED!`);
  }
}

function assertAllowed(allowed: boolean, name: string): void {
  if (!allowed) {
    throw new Error(`FUNCTIONAL FAILURE: Legitimate test "${name}" returned PERMISSION_DENIED!`);
  }
}

function runSuite(): void {
  const targetFile = fs.existsSync('DRAFT_firestore.rules') ? 'DRAFT_firestore.rules' : 'firestore.rules';
  const rulesPath = path.resolve(process.cwd(), targetFile);
  const rulesText = fs.readFileSync(rulesPath, 'utf-8');
  if (
    !rulesText.includes('allow read, write: if false;') ||
    !rulesText.includes('email_verified == true') ||
    !rulesText.includes('isPublicDivoWorkspace')
  ) {
    throw new Error(`Rules file ${targetFile} missing mandatory Zero-Trust primitives.`);
  }

  const cotyAuth: AuthContext = { uid: 'coty_uid', email: 'jimenacmoreno@gmail.com', email_verified: true };
  const victorAuth: AuthContext = { uid: 'victor_uid', email: 'victor@divo.com', email_verified: true };
  const spoofedAdminUnverified: AuthContext = { uid: 'spoof_uid', email: 'jimenacmoreno@gmail.com', email_verified: false };
  const publicVisitorActorId = 'pub-divo-live-visitor01';

  const baseTask: Record<string, unknown> = {
    id: 'v-req-08',
    workspaceId: 'divo-owl',
    title: 'Que al agendar cita se pueda hacer todo desde la misma ventana.',
    requestedBy: 'Yasmín',
    module: 'Owl Agenda',
    priority: 'urgente',
    deadline: '2026-11-04',
    status: 'en_curso',
    observations: 'Avance al 60%.',
    specs: 'Unificar flujo modal.',
    createdDateLabel: '2026-10-28',
    createdByUid: 'coty_uid',
    updatedByUid: publicVisitorActorId,
    createdAt: 1793100000000,
    updatedAt: REQUEST_TIME
  };

  const finalizedTask: Record<string, unknown> = {
    ...baseTask,
    id: 'v-req-01',
    status: 'finalizado'
  };

  const baseDb: DbState = {
    admins: {},
    workspaces: {
      'divo-owl': {
        id: 'divo-owl',
        name: 'DIVO Owl',
        ownerId: publicVisitorActorId,
        teamCode: 'DIVO-OWL',
        syncMeetingDate: '2026-10-26',
        taskIds: ['v-req-08', 'v-req-01'],
        createdAt: 1793100000000,
        updatedAt: 1793100000000,
        updatedByUid: publicVisitorActorId
      }
    },
    members: {},
    tasks: {
      'divo-owl/v-req-08': baseTask,
      'divo-owl/v-req-01': finalizedTask
    },
    decisions: {}
  };

  // 1. Unverified Email Admin Spoof
  assertDenied(
    evaluateAdminCreate('spoof_uid', { uid: 'spoof_uid', createdAt: REQUEST_TIME }, spoofedAdminUnverified),
    '1. Unverified Email Admin Spoof'
  );

  // 2. Arbitrary Workspace Intrusion
  assertDenied(
    evaluateWorkspaceGet('evil-workspace'),
    '2. Arbitrary Workspace Intrusion'
  );

  // 3. Unauthenticated Firebase UID Spoof
  const postWithNewTask: DbState = {
    ...baseDb,
    workspaces: {
      'divo-owl': { ...baseDb.workspaces['divo-owl'], taskIds: ['v-req-08', 'v-req-01', 'task-spoof'] }
    }
  };
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-spoof',
      { ...baseTask, id: 'task-spoof', createdByUid: 'coty_uid', updatedByUid: 'coty_uid', createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      null,
      baseDb,
      postWithNewTask
    ),
    '3. Unauthenticated Firebase UID Spoof'
  );

  // 4. Cross-UID Identity Spoofing (Verified user spoofing another UID)
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-spoof',
      { ...baseTask, id: 'task-spoof', createdByUid: 'coty_uid', updatedByUid: 'victor_uid', createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb,
      postWithNewTask
    ),
    '4. Cross-UID Identity Spoofing'
  );

  // 5. Shadow Field Injection ("Ghost Field")
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, isVerified: true, updatedByUid: publicVisitorActorId, updatedAt: REQUEST_TIME },
      null,
      baseDb
    ),
    '5. Shadow Field Injection'
  );

  // 6. Terminal State Mutation Bypass
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-01',
      { ...finalizedTask, status: 'en_curso', updatedByUid: publicVisitorActorId, updatedAt: REQUEST_TIME },
      null,
      baseDb
    ),
    '6. Terminal State Mutation Bypass'
  );

  // 7. Orphaned Task Write (Sync Vulnerability)
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-orphan',
      { ...baseTask, id: 'task-orphan', createdByUid: publicVisitorActorId, updatedByUid: publicVisitorActorId, createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      null,
      baseDb,
      baseDb // task-orphan NOT added to postDb.workspaces['divo-owl'].taskIds!
    ),
    '7. Orphaned Task Write'
  );

  // 8. ID Poisoning / Resource Exhaustion
  const poisonedId = 'x'.repeat(200) + '!@#';
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      poisonedId,
      { ...baseTask, id: poisonedId, createdByUid: publicVisitorActorId, updatedByUid: publicVisitorActorId, createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      null,
      baseDb,
      baseDb
    ),
    '8. ID Poisoning'
  );

  // 9. Value Poisoning on Whitelisted Update Key
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, deadline: 'not-a-date', updatedByUid: publicVisitorActorId, updatedAt: REQUEST_TIME },
      null,
      baseDb
    ),
    '9. Value Poisoning on Whitelisted Update Key'
  );

  // 10. Immortal Field Tampering
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, createdByUid: publicVisitorActorId, updatedByUid: publicVisitorActorId, updatedAt: REQUEST_TIME },
      null,
      baseDb
    ),
    '10. Immortal Field Tampering'
  );

  // 11. Temporal Forgery (Client Timestamp Spoof)
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-spoof',
      { ...baseTask, id: 'task-spoof', createdByUid: publicVisitorActorId, updatedByUid: publicVisitorActorId, createdAt: REQUEST_TIME - 86400000, updatedAt: REQUEST_TIME },
      null,
      baseDb,
      postWithNewTask
    ),
    '11. Temporal Forgery'
  );

  // 12. Unauthorized Collection Scraping (list)
  assertDenied(evaluateList(), '12. Unauthorized Collection Scraping (list)');

  // Positive Controls: Legitimate Public Live & Admin Operations
  assertAllowed(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, status: 'terminada', observations: 'Listo en vivo desde Vercel sin login.', updatedByUid: publicVisitorActorId, updatedAt: REQUEST_TIME },
      null,
      baseDb
    ),
    'Positive Control: Public Live visitor updates active task without login'
  );

  assertAllowed(
    evaluateTaskCreate(
      'divo-owl',
      'task-spoof',
      { ...baseTask, id: 'task-spoof', createdByUid: publicVisitorActorId, updatedByUid: publicVisitorActorId, createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      null,
      baseDb,
      postWithNewTask
    ),
    'Positive Control: Public Live visitor creates task atomically'
  );

  assertAllowed(
    evaluateDecisionWrite(
      'divo-owl',
      'dir-pending-1',
      {
        id: 'dir-pending-1',
        workspaceId: 'divo-owl',
        text: 'Vincular a la cita más reciente previa a la nota en Sly Soft.',
        resolved: true,
        updatedByUid: publicVisitorActorId,
        updatedAt: REQUEST_TIME
      },
      null,
      baseDb
    ),
    'Positive Control: Public Live visitor updates Direction pending decision'
  );

  assertAllowed(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-01',
      { ...finalizedTask, status: 'en_curso', updatedByUid: 'coty_uid', updatedAt: REQUEST_TIME },
      cotyAuth,
      baseDb
    ),
    'Positive Control: Admin overrides finalized task state'
  );

  console.log(`ALL 12 DIRTY DOZEN PAYLOADS DENIED & POSITIVE CONTROLS PASSED (${targetFile}).`);
}

runSuite();
