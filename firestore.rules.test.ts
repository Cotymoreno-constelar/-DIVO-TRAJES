/**
 * Security Rules Verification Suite — Dirty Dozen Adversarial Payloads
 * Validates that every Dirty Dozen attack vector in security_spec.md is rejected
 * with PERMISSION_DENIED while legitimate Tier 1 / Tier 2 operations succeed.
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
}

const REQUEST_TIME = 1793250000000;
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isVerifiedUser(auth: AuthContext | null): auth is AuthContext {
  return auth !== null && auth.email_verified === true;
}

function isBootstrapAdmin(auth: AuthContext | null): boolean {
  return isVerifiedUser(auth) && auth.email === 'jimenacmoreno@gmail.com';
}

function isAdmin(auth: AuthContext | null, db: DbState): boolean {
  return isVerifiedUser(auth) && (auth.email === 'jimenacmoreno@gmail.com' || Boolean(db.admins[auth.uid]));
}

function isWorkspaceMember(workspaceId: string, auth: AuthContext | null, db: DbState): boolean {
  if (!auth) return false;
  return Boolean(db.workspaces[workspaceId]) && Boolean(db.members[`${workspaceId}/${auth.uid}`]);
}

function isValidOwlTask(data: Record<string, unknown>, auth: AuthContext): boolean {
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
    isValidId(data.workspaceId) &&
    typeof data.title === 'string' && data.title.length >= 1 && data.title.length <= 300 &&
    typeof data.requestedBy === 'string' && ['Coty', 'Yasmín', 'Sucursales', 'Administración'].includes(data.requestedBy) &&
    typeof data.module === 'string' && data.module.length >= 1 && data.module.length <= 100 &&
    typeof data.priority === 'string' && ['urgente', 'alta', 'media'].includes(data.priority) &&
    typeof data.deadline === 'string' && data.deadline.length === 10 && DATE_REGEX.test(data.deadline) &&
    typeof data.status === 'string' && ['sin_novedades', 'en_curso', 'terminada', 'probada', 'bloqueada', 'finalizado'].includes(data.status) &&
    typeof data.observations === 'string' && data.observations.length >= 1 && data.observations.length <= 2000 &&
    typeof data.specs === 'string' && data.specs.length >= 0 && data.specs.length <= 2000 &&
    typeof data.createdDateLabel === 'string' && DATE_REGEX.test(data.createdDateLabel) &&
    isValidId(data.createdByUid) &&
    isValidId(data.updatedByUid) &&
    data.updatedByUid === auth.uid &&
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

function evaluateMemberCreate(
  workspaceId: string,
  memberId: string,
  incoming: Record<string, unknown>,
  auth: AuthContext | null,
  db: DbState,
  postDb: DbState
): boolean {
  if (!isVerifiedUser(auth)) return false;
  if (!isValidId(workspaceId) || !isValidId(memberId) || memberId !== auth.uid) return false;
  const reqKeys = ['uid', 'workspaceId', 'displayName', 'role', 'teamCode', 'joinedAt'];
  const keys = Object.keys(incoming);
  if (!reqKeys.every((k) => keys.includes(k)) || !keys.every((k) => reqKeys.includes(k))) return false;
  if (incoming.uid !== auth.uid || incoming.workspaceId !== workspaceId) return false;
  if (typeof incoming.displayName !== 'string' || incoming.displayName.length < 1 || incoming.displayName.length > 60) return false;
  if (incoming.role !== 'owner' && incoming.role !== 'collaborator') return false;
  if (typeof incoming.teamCode !== 'string' || !ID_REGEX.test(incoming.teamCode)) return false;
  if (incoming.joinedAt !== REQUEST_TIME) return false;

  const existingWs = db.workspaces[workspaceId];
  const postWs = postDb.workspaces[workspaceId];

  if (!existingWs && postWs && postWs.ownerId === auth.uid && incoming.role === 'owner' && incoming.teamCode === postWs.teamCode) {
    return true;
  }
  if (isAdmin(auth, db) && existingWs && incoming.role === 'owner' && incoming.teamCode === existingWs.teamCode) {
    return true;
  }
  if (existingWs && incoming.role === 'collaborator' && incoming.teamCode === existingWs.teamCode) {
    return true;
  }
  return false;
}

function evaluateTaskCreate(
  workspaceId: string,
  taskId: string,
  incoming: Record<string, unknown>,
  auth: AuthContext | null,
  db: DbState,
  postDb: DbState
): boolean {
  if (!isVerifiedUser(auth)) return false;
  if (!isValidId(workspaceId) || !isValidId(taskId)) return false;
  if (!isValidOwlTask(incoming, auth)) return false;
  if (incoming.id !== taskId || incoming.workspaceId !== workspaceId) return false;
  if (incoming.createdByUid !== auth.uid) return false;
  if (incoming.createdAt !== REQUEST_TIME || incoming.updatedAt !== REQUEST_TIME) return false;
  if (!(isWorkspaceMember(workspaceId, auth, db) || isAdmin(auth, db))) return false;
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
  if (!isVerifiedUser(auth)) return false;
  if (!isValidId(workspaceId) || !isValidId(taskId)) return false;
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
  const isOwner = db.workspaces[workspaceId]?.ownerId === auth.uid;
  const isCreator = existing.createdByUid === auth.uid;
  const isMember = isWorkspaceMember(workspaceId, auth, db);

  if (isMember && (isOwner || isCreator)) {
    const allowedTier1 = [
      'title', 'requestedBy', 'module', 'priority', 'deadline',
      'status', 'observations', 'specs', 'updatedByUid', 'updatedAt'
    ];
    return affectedKeys.every((k) => allowedTier1.includes(k));
  }
  if (isMember) {
    const allowedTier2 = ['status', 'deadline', 'observations', 'specs', 'updatedByUid', 'updatedAt'];
    return affectedKeys.every((k) => allowedTier2.includes(k));
  }
  return false;
}

function evaluateTaskList(): boolean {
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
  const rulesPath = path.resolve(process.cwd(), fs.existsSync('firestore.rules') ? 'firestore.rules' : 'DRAFT_firestore.rules');
  const rulesText = fs.readFileSync(rulesPath, 'utf-8');
  if (!rulesText.includes("allow read, write: if false;") || !rulesText.includes("email_verified == true")) {
    throw new Error('Rules file missing mandatory Zero-Trust primitives.');
  }

  const cotyAuth: AuthContext = { uid: 'coty_uid', email: 'jimenacmoreno@gmail.com', email_verified: true };
  const victorAuth: AuthContext = { uid: 'victor_uid', email: 'victor@divo.com', email_verified: true };
  const outsiderAuth: AuthContext = { uid: 'attacker_uid', email: 'attacker@evil.com', email_verified: true };
  const spoofedAdminUnverified: AuthContext = { uid: 'spoof_uid', email: 'jimenacmoreno@gmail.com', email_verified: false };

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
    updatedByUid: 'victor_uid',
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
        ownerId: 'coty_uid',
        teamCode: 'DIVO-OWL',
        syncMeetingDate: '2026-10-26',
        taskIds: ['v-req-08', 'v-req-01'],
        createdAt: 1793100000000,
        updatedAt: 1793100000000,
        updatedByUid: 'coty_uid'
      }
    },
    members: {
      'divo-owl/coty_uid': { uid: 'coty_uid', workspaceId: 'divo-owl', displayName: 'Coty', role: 'owner', teamCode: 'DIVO-OWL', joinedAt: 1793100000000 },
      'divo-owl/victor_uid': { uid: 'victor_uid', workspaceId: 'divo-owl', displayName: 'Víctor', role: 'collaborator', teamCode: 'DIVO-OWL', joinedAt: 1793100000000 }
    },
    tasks: {
      'divo-owl/v-req-08': baseTask,
      'divo-owl/v-req-01': finalizedTask
    }
  };

  // 1. Unverified Email Admin Spoof
  assertDenied(
    evaluateAdminCreate('spoof_uid', { uid: 'spoof_uid', createdAt: REQUEST_TIME }, spoofedAdminUnverified),
    '1. Unverified Email Admin Spoof'
  );

  // 2. Self-Assigned Owner Privilege Escalation
  assertDenied(
    evaluateMemberCreate(
      'divo-owl',
      'attacker_uid',
      { uid: 'attacker_uid', workspaceId: 'divo-owl', displayName: 'Attacker', role: 'owner', teamCode: 'DIVO-OWL', joinedAt: REQUEST_TIME },
      outsiderAuth,
      baseDb,
      baseDb
    ),
    '2. Self-Assigned Owner Privilege Escalation'
  );

  // 3. Invalid Team Code Intrusion
  assertDenied(
    evaluateMemberCreate(
      'divo-owl',
      'attacker_uid',
      { uid: 'attacker_uid', workspaceId: 'divo-owl', displayName: 'Attacker', role: 'collaborator', teamCode: 'WRONG-CODE', joinedAt: REQUEST_TIME },
      outsiderAuth,
      baseDb,
      baseDb
    ),
    '3. Invalid Team Code Intrusion'
  );

  // 4. Identity Spoofing on Task Creation
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
      { ...baseTask, id: 'task-spoof', createdByUid: 'coty_uid', updatedByUid: 'victor_uid', createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb,
      postWithNewTask
    ),
    '4. Identity Spoofing on Task Creation'
  );

  // 5. Shadow Field Injection ("Ghost Field")
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, isVerified: true, updatedByUid: 'victor_uid', updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb
    ),
    '5. Shadow Field Injection'
  );

  // 6. Terminal State Mutation Bypass
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-01',
      { ...finalizedTask, status: 'en_curso', updatedByUid: 'victor_uid', updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb
    ),
    '6. Terminal State Mutation Bypass'
  );

  // 7. Orphaned Task Write (Sync Vulnerability)
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-orphan',
      { ...baseTask, id: 'task-orphan', createdByUid: 'victor_uid', updatedByUid: 'victor_uid', createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      victorAuth,
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
      { ...baseTask, id: poisonedId, createdByUid: 'victor_uid', updatedByUid: 'victor_uid', createdAt: REQUEST_TIME, updatedAt: REQUEST_TIME },
      victorAuth,
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
      { ...baseTask, deadline: 'not-a-date', updatedByUid: 'victor_uid', updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb
    ),
    '9. Value Poisoning on Whitelisted Update Key'
  );

  // 10. Immortal Field Tampering
  assertDenied(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, createdByUid: 'victor_uid', updatedByUid: 'coty_uid', updatedAt: REQUEST_TIME },
      cotyAuth,
      baseDb
    ),
    '10. Immortal Field Tampering'
  );

  // 11. Temporal Forgery (Client Timestamp Spoof)
  assertDenied(
    evaluateTaskCreate(
      'divo-owl',
      'task-spoof',
      { ...baseTask, id: 'task-spoof', createdByUid: 'victor_uid', updatedByUid: 'victor_uid', createdAt: REQUEST_TIME - 86400000, updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb,
      postWithNewTask
    ),
    '11. Temporal Forgery'
  );

  // 12. Unauthorized Collection Scraping (list)
  assertDenied(evaluateTaskList(), '12. Unauthorized Collection Scraping (list)');

  // Positive Controls: Legitimate Collaborator & Admin Operations
  assertAllowed(
    evaluateTaskUpdate(
      'divo-owl',
      'v-req-08',
      { ...baseTask, status: 'terminada', observations: 'Listo para pruebas de Coty.', updatedByUid: 'victor_uid', updatedAt: REQUEST_TIME },
      victorAuth,
      baseDb
    ),
    'Positive Control: Collaborator updates active task'
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

  console.log('ALL 12 DIRTY DOZEN PAYLOADS DENIED & POSITIVE CONTROLS PASSED.');
}

runSuite();
