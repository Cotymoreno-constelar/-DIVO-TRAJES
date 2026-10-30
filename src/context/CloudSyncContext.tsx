import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  WORKSPACE_ID,
  DEFAULT_TEAM_CODE,
  BOOTSTRAP_ADMIN_EMAIL,
  MAX_TASK_IDS_COUNT,
  DECISION_IDS,
  OperationType,
  handleFirestoreError,
  sanitizeTaskFields,
  sanitizeDate,
  sanitizeDecisionText,
  sanitizeId,
  getOrCreatePublicActorId,
} from '../firebase';
import { VICTOR_INITIAL_TASKS } from '../data/constelarData';
import { VICTOR_REPORTES_PACK_TASKS, DIRECTION_PENDING_ITEMS } from '../data/reportsPlanData';
import { VictorTask, TaskStatus } from '../types/flow';

export const TASKS_STORAGE_KEY = 'divo_victor_tasks_v3';
export const SEEDED_PACK_IDS_STORAGE_KEY = 'divo_seeded_pack_ids_v1';
export const MEETING_DATE_STORAGE_KEY = 'divo_sync_meeting_date_v1';
export const DIRECTION_DECISIONS_STORAGE_KEY = 'divo_direction_decisions_v1';

export type SyncState = 'connecting' | 'synced' | 'saving' | 'error';
export type MemberRole = 'owner' | 'collaborator' | 'public_live';

export interface DirectionDecisionState {
  text: string;
  resolved: boolean;
}

interface CloudSyncContextValue {
  tasks: VictorTask[];
  syncMeetingDate: string;
  decisions: Record<string, DirectionDecisionState>;
  user: User | null;
  authReady: boolean;
  isAdminUser: boolean;
  memberRole: MemberRole;
  syncState: SyncState;
  lastSavedAt: string | null;
  unauthorizedDomain: string | null;
  hasPendingLocalEdits: boolean;
  activeTeamCode: string;
  canDeleteTasks: boolean;
  canEditAllFieldsOfTask: (task: VictorTask) => boolean;
  canModifyFinalizedTask: boolean;
  signInToCloud: () => Promise<void>;
  signOutFromCloud: () => Promise<void>;
  pushLocalBrowserEditsToCloud: () => Promise<number>;
  importTasksFromJson: (importedTasks: VictorTask[]) => Promise<number>;
  createTask: (task: VictorTask) => Promise<void>;
  updateTaskProgress: (
    taskId: string,
    updates: Partial<Pick<VictorTask, 'status' | 'deadline' | 'observations' | 'specs'>>
  ) => Promise<void>;
  updateFullTask: (task: VictorTask) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateSyncMeetingDate: (newDate: string) => Promise<void>;
  saveDirectionDecision: (id: string, text: string, resolved: boolean) => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextValue | undefined>(undefined);

const INITIAL_NORMALIZED_MAP = new Map<string, VictorTask>(
  VICTOR_INITIAL_TASKS.map((t) => {
    const clean = sanitizeTaskFields(t);
    return [clean.id, clean];
  })
);

function tasksContentEqual(a: VictorTask, b: VictorTask): boolean {
  return (
    a.title === b.title &&
    a.requestedBy === b.requestedBy &&
    a.module === b.module &&
    a.priority === b.priority &&
    a.deadline === b.deadline &&
    a.status === b.status &&
    a.observations === b.observations &&
    (a.specs || '') === (b.specs || '')
  );
}

function getLocallyModifiedTasksFromSnapshot(snapshotTasks: VictorTask[]): VictorTask[] {
  return snapshotTasks.filter((localTask) => {
    const baseline = INITIAL_NORMALIZED_MAP.get(localTask.id);
    if (!baseline) {
      // Custom task created locally by the user
      return true;
    }
    return !tasksContentEqual(localTask, baseline);
  });
}

function loadLocalTasks(): { tasks: VictorTask[]; locallyModified: VictorTask[] } {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.map((t: VictorTask) => sanitizeTaskFields(t));
        const existingIds = new Set(sanitized.map((t) => t.id));

        let seededSet = new Set<string>();
        try {
          const rawSeeded = localStorage.getItem(SEEDED_PACK_IDS_STORAGE_KEY);
          if (rawSeeded) {
            const parsedSeeded = JSON.parse(rawSeeded);
            if (Array.isArray(parsedSeeded)) {
              seededSet = new Set(parsedSeeded.filter((x) => typeof x === 'string'));
            }
          }
        } catch {
          // ignore
        }

        const newPackToAppend: VictorTask[] = [];
        for (const packTask of VICTOR_REPORTES_PACK_TASKS) {
          if (!existingIds.has(packTask.id) && !seededSet.has(packTask.id)) {
            newPackToAppend.push(sanitizeTaskFields(packTask));
          }
          seededSet.add(packTask.id);
        }

        const merged = [...sanitized, ...newPackToAppend];
        try {
          localStorage.setItem(SEEDED_PACK_IDS_STORAGE_KEY, JSON.stringify([...seededSet]));
          if (newPackToAppend.length > 0) {
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(merged));
          }
        } catch {
          // ignore
        }

        return {
          tasks: merged,
          locallyModified: getLocallyModifiedTasksFromSnapshot(merged),
        };
      }
    }
  } catch (e) {
    console.error('Error reading local tasks cache:', e);
  }

  try {
    localStorage.setItem(
      SEEDED_PACK_IDS_STORAGE_KEY,
      JSON.stringify(VICTOR_REPORTES_PACK_TASKS.map((t) => t.id))
    );
  } catch {
    // ignore
  }
  return {
    tasks: VICTOR_INITIAL_TASKS.map((t) => sanitizeTaskFields(t)),
    locallyModified: [],
  };
}

function loadLocalMeetingDate(): string {
  try {
    const saved = localStorage.getItem(MEETING_DATE_STORAGE_KEY);
    if (saved) return sanitizeDate(saved, '2026-10-26');
  } catch {
    // ignore
  }
  return '2026-10-26';
}

function loadLocalDecisions(): Record<string, DirectionDecisionState> {
  const initial: Record<string, DirectionDecisionState> = {};
  for (const item of DIRECTION_PENDING_ITEMS) {
    initial[item.id] = { text: item.defaultProposal, resolved: false };
  }
  try {
    const raw = localStorage.getItem(DIRECTION_DECISIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const item of DIRECTION_PENDING_ITEMS) {
          const entry = parsed[item.id];
          if (entry && typeof entry.text === 'string') {
            initial[item.id] = {
              text: sanitizeDecisionText(entry.text, item.defaultProposal),
              resolved: Boolean(entry.resolved),
            };
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return initial;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const CloudSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocal = useRef(loadLocalTasks());
  const preConnectModifiedTasksRef = useRef<VictorTask[]>(initialLocal.current.locallyModified);
  const publicActorIdRef = useRef<string>(getOrCreatePublicActorId());

  const [tasks, setTasks] = useState<VictorTask[]>(initialLocal.current.tasks);
  const [syncMeetingDate, setSyncMeetingDate] = useState<string>(loadLocalMeetingDate);
  const [decisions, setDecisions] = useState<Record<string, DirectionDecisionState>>(loadLocalDecisions);
  const [hasPendingLocalEdits, setHasPendingLocalEdits] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [activeTeamCode, setActiveTeamCode] = useState<string>(DEFAULT_TEAM_CODE);
  const [isWorkspaceReady, setIsWorkspaceReady] = useState<boolean>(false);

  const taskIdsRef = useRef<string[]>(initialLocal.current.tasks.map((t) => t.id));
  const cloudTasksMapRef = useRef<Map<string, VictorTask>>(new Map());
  const taskUnsubsRef = useRef<Map<string, Unsubscribe>>(new Map());
  const decisionUnsubsRef = useRef<Map<string, Unsubscribe>>(new Map());
  const isInitializingWorkspaceRef = useRef<boolean>(false);
  const hasAutoSeededCloudPackRef = useRef<boolean>(false);

  const isAdminUser = Boolean(
    user && user.emailVerified && user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
  );

  const memberRole: MemberRole = isAdminUser
    ? 'owner'
    : user && user.emailVerified
    ? 'collaborator'
    : 'public_live';

  const activeActorId = user && user.emailVerified ? user.uid : publicActorIdRef.current;

  // Persist local cache whenever tasks, syncMeetingDate, or decisions update
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error writing tasks to localStorage:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(MEETING_DATE_STORAGE_KEY, syncMeetingDate);
    } catch {
      // ignore
    }
  }, [syncMeetingDate]);

  useEffect(() => {
    try {
      localStorage.setItem(DIRECTION_DECISIONS_STORAGE_KEY, JSON.stringify(decisions));
    } catch {
      // ignore
    }
  }, [decisions]);

  // Recompute whether pre-connect local edits still differ from live cloud state
  const recomputePendingLocalEdits = useCallback(() => {
    const candidates = preConnectModifiedTasksRef.current;
    if (candidates.length === 0) {
      setHasPendingLocalEdits(false);
      return;
    }
    const stillUnsynced = candidates.some((localTask) => {
      const cloudTask = cloudTasksMapRef.current.get(localTask.id);
      if (!cloudTask) return true;
      if (cloudTask.status === 'finalizado' && !isAdminUser) return false;
      return !tasksContentEqual(localTask, cloudTask);
    });
    setHasPendingLocalEdits(stillUnsynced);
  }, [isAdminUser]);

  // Seed tasks into workspace in chunks of 4 per batch
  const seedTasksIntoCloudWorkspace = useCallback(
    async (actorId: string, tasksToSeed: VictorTask[]) => {
      const boundedTasks = tasksToSeed
        .slice(0, MAX_TASK_IDS_COUNT)
        .map((t) => sanitizeTaskFields(t));
      const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
      const accumulatedIds: string[] = [];

      const chunkSize = 4;
      for (let i = 0; i < boundedTasks.length; i += chunkSize) {
        const chunk = boundedTasks.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        for (const t of chunk) {
          accumulatedIds.push(t.id);
          const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', t.id);
          batch.set(taskRef, {
            id: t.id,
            workspaceId: WORKSPACE_ID,
            title: t.title,
            requestedBy: t.requestedBy,
            module: t.module,
            priority: t.priority,
            deadline: t.deadline,
            status: t.status,
            observations: t.observations,
            specs: t.specs || '',
            createdDateLabel: sanitizeDate(t.createdAt),
            createdByUid: actorId,
            updatedByUid: actorId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        batch.update(wsRef, {
          taskIds: [...accumulatedIds],
          updatedAt: serverTimestamp(),
          updatedByUid: actorId,
        });

        try {
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `workspaces/${WORKSPACE_ID}/tasks`);
        }
      }
    },
    []
  );

  // Initialize singleton public live workspace when opening for the very first time
  const initializePublicWorkspaceAndSeed = useCallback(
    async (
      actorId: string,
      seedTasks: VictorTask[],
      initialMeetingDate: string,
      initialDecisions: Record<string, DirectionDecisionState>
    ) => {
      if (isInitializingWorkspaceRef.current) return;
      isInitializingWorkspaceRef.current = true;
      try {
        const wsRef = doc(db, 'workspaces', WORKSPACE_ID);

        try {
          await setDoc(wsRef, {
            id: WORKSPACE_ID,
            name: 'DIVO · Sistema Owl & Estrategia',
            ownerId: actorId,
            teamCode: DEFAULT_TEAM_CODE,
            syncMeetingDate: sanitizeDate(initialMeetingDate, '2026-10-26'),
            taskIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            updatedByUid: actorId,
          });
        } catch (err) {
          // Check if another client initialized the workspace simultaneously
          const checkSnap = await getDoc(wsRef);
          if (checkSnap.exists()) {
            return;
          }
          handleFirestoreError(err, OperationType.CREATE, `workspaces/${WORKSPACE_ID}`);
        }

        await seedTasksIntoCloudWorkspace(actorId, seedTasks);

        // Seed initial 4 Direction decisions
        const decBatch = writeBatch(db);
        for (const item of DIRECTION_PENDING_ITEMS) {
          const entry = initialDecisions[item.id] || {
            text: item.defaultProposal,
            resolved: false,
          };
          const decRef = doc(db, 'workspaces', WORKSPACE_ID, 'decisions', item.id);
          decBatch.set(decRef, {
            id: item.id,
            workspaceId: WORKSPACE_ID,
            text: sanitizeDecisionText(entry.text, item.defaultProposal),
            resolved: Boolean(entry.resolved),
            updatedByUid: actorId,
            updatedAt: serverTimestamp(),
          });
        }
        try {
          await decBatch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `workspaces/${WORKSPACE_ID}/decisions`);
        }

        hasAutoSeededCloudPackRef.current = true;
        preConnectModifiedTasksRef.current = [];
        setHasPendingLocalEdits(false);
      } finally {
        isInitializingWorkspaceRef.current = false;
      }
    },
    [seedTasksIntoCloudWorkspace]
  );

  // Track Firebase Auth (optional admin login)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !firebaseUser.emailVerified) {
        // Ensure unverified sessions sign out cleanly so Public Live Mode works uninterrupted
        void signOut(auth);
        setUser(null);
        setAuthReady(true);
        return;
      }
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Attach real-time PUBLIC LIVE Firestore listeners automatically on boot (no login required!)
  useEffect(() => {
    if (!authReady) return;

    setSyncState('connecting');
    const wsPath = `workspaces/${WORKSPACE_ID}`;
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);

    const rebuildOrderedTasks = () => {
      const ordered: VictorTask[] = [];
      for (const id of taskIdsRef.current) {
        const found = cloudTasksMapRef.current.get(id);
        if (found) ordered.push(found);
      }
      if (ordered.length > 0 || taskIdsRef.current.length === 0) {
        setTasks(ordered);
      }
      if (cloudTasksMapRef.current.size >= taskIdsRef.current.length) {
        recomputePendingLocalEdits();
      }
    };

    const ensureDecisionListeners = () => {
      for (const decId of DECISION_IDS) {
        if (!decisionUnsubsRef.current.has(decId)) {
          const decPath = `workspaces/${WORKSPACE_ID}/decisions/${decId}`;
          const decRef = doc(db, 'workspaces', WORKSPACE_ID, 'decisions', decId);
          const decUnsub = onSnapshot(
            decRef,
            (dSnap) => {
              if (dSnap.exists()) {
                const dData = dSnap.data();
                if (typeof dData.text === 'string') {
                  setDecisions((prev) => ({
                    ...prev,
                    [decId]: {
                      text: dData.text,
                      resolved: Boolean(dData.resolved),
                    },
                  }));
                }
              }
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, decPath);
            }
          );
          decisionUnsubsRef.current.set(decId, decUnsub);
        }
      }
    };

    const wsUnsub = onSnapshot(
      wsRef,
      (wsSnap) => {
        if (!wsSnap.exists()) {
          void initializePublicWorkspaceAndSeed(
            activeActorId,
            initialLocal.current.tasks,
            syncMeetingDate,
            decisions
          );
          return;
        }

        setIsWorkspaceReady(true);
        const data = wsSnap.data();

        if (typeof data.syncMeetingDate === 'string') {
          setSyncMeetingDate(data.syncMeetingDate);
        }
        if (typeof data.teamCode === 'string') {
          setActiveTeamCode(data.teamCode);
        }

        ensureDecisionListeners();

        const incomingIds: string[] = Array.isArray(data.taskIds) ? data.taskIds : [];
        taskIdsRef.current = incomingIds;

        // Unsubscribe removed task listeners
        for (const [existingId, unsubTask] of taskUnsubsRef.current.entries()) {
          if (!incomingIds.includes(existingId)) {
            unsubTask();
            taskUnsubsRef.current.delete(existingId);
            cloudTasksMapRef.current.delete(existingId);
          }
        }

        // Subscribe to newly added task IDs via deterministic doc listeners (Zero `list` queries)
        for (const taskId of incomingIds) {
          if (!taskUnsubsRef.current.has(taskId)) {
            const tPath = `workspaces/${WORKSPACE_ID}/tasks/${taskId}`;
            const tRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', taskId);
            const tUnsub = onSnapshot(
              tRef,
              (tSnap) => {
                if (tSnap.exists()) {
                  const tData = tSnap.data();
                  const mapped: VictorTask = sanitizeTaskFields({
                    id: tData.id,
                    title: tData.title,
                    requestedBy: tData.requestedBy,
                    module: tData.module,
                    priority: tData.priority,
                    deadline: tData.deadline,
                    status: tData.status,
                    observations: tData.observations,
                    specs: tData.specs || '',
                    createdAt: tData.createdDateLabel || '2026-10-28',
                    createdByUid: tData.createdByUid,
                  });
                  cloudTasksMapRef.current.set(taskId, mapped);
                } else {
                  cloudTasksMapRef.current.delete(taskId);
                }
                rebuildOrderedTasks();
                setSyncState('synced');
                setLastSavedAt(formatNowTime());
              },
              (err) => {
                handleFirestoreError(err, OperationType.GET, tPath);
              }
            );
            taskUnsubsRef.current.set(taskId, tUnsub);
          }
        }

        rebuildOrderedTasks();
        setSyncState('synced');
        setLastSavedAt(formatNowTime());

        // Auto-seed the 37-item Reports & Fields Pack if workspace existed prior to that pack
        if (
          !isInitializingWorkspaceRef.current &&
          !hasAutoSeededCloudPackRef.current &&
          incomingIds.length > 0 &&
          !incomingIds.some((id) => id.startsWith('campo-divo-') || id.startsWith('rep-divo-'))
        ) {
          hasAutoSeededCloudPackRef.current = true;
          void (async () => {
            const packClean = VICTOR_REPORTES_PACK_TASKS.map((t) => sanitizeTaskFields(t));
            const nextIds = [...incomingIds];
            for (let i = 0; i < packClean.length; i += 4) {
              const chunk = packClean.slice(i, i + 4);
              const batch = writeBatch(db);
              for (const t of chunk) {
                if (nextIds.length >= MAX_TASK_IDS_COUNT) break;
                if (nextIds.includes(t.id)) continue;
                nextIds.push(t.id);
                const tRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', t.id);
                batch.set(tRef, {
                  id: t.id,
                  workspaceId: WORKSPACE_ID,
                  title: t.title,
                  requestedBy: t.requestedBy,
                  module: t.module,
                  priority: t.priority,
                  deadline: t.deadline,
                  status: t.status,
                  observations: t.observations,
                  specs: t.specs || '',
                  createdDateLabel: sanitizeDate(t.createdAt),
                  createdByUid: activeActorId,
                  updatedByUid: activeActorId,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
              batch.update(wsRef, {
                taskIds: [...nextIds],
                updatedAt: serverTimestamp(),
                updatedByUid: activeActorId,
              });
              try {
                await batch.commit();
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `workspaces/${WORKSPACE_ID}/tasks`);
              }
            }
          })();
        }
      },
      (err) => {
        setSyncState('error');
        handleFirestoreError(err, OperationType.GET, wsPath);
      }
    );

    const unsubsMap = taskUnsubsRef.current;
    const decUnsubsMap = decisionUnsubsRef.current;
    const tasksCacheMap = cloudTasksMapRef.current;

    return () => {
      wsUnsub();
      for (const u of unsubsMap.values()) {
        u();
      }
      for (const u of decUnsubsMap.values()) {
        u();
      }
      unsubsMap.clear();
      decUnsubsMap.clear();
      tasksCacheMap.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, activeActorId]);

  const signInToCloud = async () => {
    setUnauthorizedDomain(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(window.location.hostname);
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        console.error('Google Sign-In error:', err);
      }
    }
  };

  const signOutFromCloud = async () => {
    setUnauthorizedDomain(null);
    await signOut(auth);
  };

  const canDeleteTasks = true;
  const canModifyFinalizedTask = isAdminUser;

  const canEditAllFieldsOfTask = useCallback(
    (task: VictorTask): boolean => {
      if (task.status === 'finalizado') return isAdminUser;
      return true;
    },
    [isAdminUser]
  );

  // Sync bulk task list (from pre-connect local edits or imported .json) into live Firestore
  const syncTaskArrayToCloud = async (sourceTasks: VictorTask[]): Promise<number> => {
    const sanitizedList = sourceTasks
      .slice(0, MAX_TASK_IDS_COUNT)
      .map((t) => sanitizeTaskFields(t));

    if (!isWorkspaceReady) {
      setTasks(sanitizedList);
      return sanitizedList.length;
    }

    setSyncState('saving');
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
    const currentIds = [...taskIdsRef.current];
    let syncedCount = 0;

    // 1. Create tasks that don't exist yet in chunks of 4
    const toCreate = sanitizedList.filter((t) => !cloudTasksMapRef.current.has(t.id));
    for (let i = 0; i < toCreate.length; i += 4) {
      const chunk = toCreate.slice(i, i + 4);
      const batch = writeBatch(db);
      for (const t of chunk) {
        if (currentIds.length >= MAX_TASK_IDS_COUNT) break;
        currentIds.unshift(t.id);
        const tRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', t.id);
        batch.set(tRef, {
          id: t.id,
          workspaceId: WORKSPACE_ID,
          title: t.title,
          requestedBy: t.requestedBy,
          module: t.module,
          priority: t.priority,
          deadline: t.deadline,
          status: t.status,
          observations: t.observations,
          specs: t.specs || '',
          createdDateLabel: sanitizeDate(t.createdAt),
          createdByUid: activeActorId,
          updatedByUid: activeActorId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        syncedCount++;
      }
      batch.update(wsRef, {
        taskIds: [...currentIds],
        updatedAt: serverTimestamp(),
        updatedByUid: activeActorId,
      });
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `workspaces/${WORKSPACE_ID}/tasks`);
      }
    }

    // 2. Update existing non-finalized tasks (or finalized if admin) whose fields changed
    const toUpdate = sanitizedList.filter((t) => {
      const existing = cloudTasksMapRef.current.get(t.id);
      if (!existing) return false;
      if (existing.status === 'finalizado' && !isAdminUser) return false;
      return !tasksContentEqual(existing, t);
    });

    for (const t of toUpdate) {
      const tRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', t.id);
      try {
        await updateDoc(tRef, {
          title: t.title,
          requestedBy: t.requestedBy,
          module: t.module,
          priority: t.priority,
          deadline: t.deadline,
          status: t.status,
          observations: t.observations,
          specs: t.specs || '',
          updatedByUid: activeActorId,
          updatedAt: serverTimestamp(),
        });
        syncedCount++;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `workspaces/${WORKSPACE_ID}/tasks/${t.id}`);
      }
    }

    preConnectModifiedTasksRef.current = [];
    setSyncState('synced');
    setLastSavedAt(formatNowTime());
    setHasPendingLocalEdits(false);
    return syncedCount;
  };

  const pushLocalBrowserEditsToCloud = async (): Promise<number> => {
    return syncTaskArrayToCloud(preConnectModifiedTasksRef.current);
  };

  const importTasksFromJson = async (importedTasks: VictorTask[]): Promise<number> => {
    return syncTaskArrayToCloud(importedTasks);
  };

  const createTask = async (rawTask: VictorTask): Promise<void> => {
    const clean = sanitizeTaskFields(rawTask);

    if (!isWorkspaceReady) {
      setTasks((prev) => [clean, ...prev]);
      return;
    }

    if (taskIdsRef.current.length >= MAX_TASK_IDS_COUNT) {
      return;
    }

    setSyncState('saving');
    const nextIds = [clean.id, ...taskIdsRef.current.filter((id) => id !== clean.id)];
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', clean.id);

    const batch = writeBatch(db);
    batch.set(taskRef, {
      id: clean.id,
      workspaceId: WORKSPACE_ID,
      title: clean.title,
      requestedBy: clean.requestedBy,
      module: clean.module,
      priority: clean.priority,
      deadline: clean.deadline,
      status: clean.status,
      observations: clean.observations,
      specs: clean.specs || '',
      createdDateLabel: sanitizeDate(clean.createdAt),
      createdByUid: activeActorId,
      updatedByUid: activeActorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(wsRef, {
      taskIds: nextIds,
      updatedAt: serverTimestamp(),
      updatedByUid: activeActorId,
    });

    try {
      await batch.commit();
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.CREATE, `workspaces/${WORKSPACE_ID}/tasks/${clean.id}`);
    }
  };

  const updateTaskProgress = async (
    taskId: string,
    updates: Partial<Pick<VictorTask, 'status' | 'deadline' | 'observations' | 'specs'>>
  ): Promise<void> => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return;

    const merged = sanitizeTaskFields({ ...existing, ...updates });

    if (!isWorkspaceReady) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? merged : t)));
      return;
    }

    if (existing.status === 'finalizado' && !isAdminUser) {
      return;
    }

    // Optimistic UI update while Firestore syncs
    setTasks((prev) => prev.map((t) => (t.id === taskId ? merged : t)));
    setSyncState('saving');

    const taskPath = `workspaces/${WORKSPACE_ID}/tasks/${taskId}`;
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', taskId);

    const payload: Record<string, unknown> = {
      updatedByUid: activeActorId,
      updatedAt: serverTimestamp(),
    };
    if (updates.status !== undefined) payload.status = merged.status as TaskStatus;
    if (updates.deadline !== undefined) payload.deadline = merged.deadline;
    if (updates.observations !== undefined) payload.observations = merged.observations;
    if (updates.specs !== undefined) payload.specs = merged.specs || '';

    try {
      await updateDoc(taskRef, payload);
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.UPDATE, taskPath);
    }
  };

  const updateFullTask = async (updatedTask: VictorTask): Promise<void> => {
    const existing = tasks.find((t) => t.id === updatedTask.id);
    if (!existing) return;

    const clean = sanitizeTaskFields({
      ...updatedTask,
      createdAt: existing.createdAt,
      createdByUid: existing.createdByUid,
    });

    if (!isWorkspaceReady) {
      setTasks((prev) => prev.map((t) => (t.id === clean.id ? clean : t)));
      return;
    }

    if (existing.status === 'finalizado' && !isAdminUser) {
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === clean.id ? clean : t)));
    setSyncState('saving');

    const taskPath = `workspaces/${WORKSPACE_ID}/tasks/${clean.id}`;
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', clean.id);

    try {
      await updateDoc(taskRef, {
        title: clean.title,
        requestedBy: clean.requestedBy,
        module: clean.module,
        priority: clean.priority,
        deadline: clean.deadline,
        status: clean.status,
        observations: clean.observations,
        specs: clean.specs || '',
        updatedByUid: activeActorId,
        updatedAt: serverTimestamp(),
      });
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.UPDATE, taskPath);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return;
    if (existing.status === 'finalizado' && !isAdminUser) return;

    if (!isWorkspaceReady) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return;
    }

    setSyncState('saving');
    const nextIds = taskIdsRef.current.filter((id) => id !== taskId);
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', taskId);

    const batch = writeBatch(db);
    batch.delete(taskRef);
    batch.update(wsRef, {
      taskIds: nextIds,
      updatedAt: serverTimestamp(),
      updatedByUid: activeActorId,
    });

    try {
      await batch.commit();
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.DELETE, `workspaces/${WORKSPACE_ID}/tasks/${taskId}`);
    }
  };

  const updateSyncMeetingDate = async (rawDate: string): Promise<void> => {
    const cleanDate = sanitizeDate(rawDate, syncMeetingDate);
    setSyncMeetingDate(cleanDate);

    if (!isWorkspaceReady) return;

    setSyncState('saving');
    const wsPath = `workspaces/${WORKSPACE_ID}`;
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);

    try {
      await updateDoc(wsRef, {
        syncMeetingDate: cleanDate,
        updatedByUid: activeActorId,
        updatedAt: serverTimestamp(),
      });
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.UPDATE, wsPath);
    }
  };

  const saveDirectionDecision = async (
    rawId: string,
    rawText: string,
    resolved: boolean
  ): Promise<void> => {
    const cleanId = sanitizeId(rawId);
    if (!(DECISION_IDS as readonly string[]).includes(cleanId)) return;

    const cleanText = sanitizeDecisionText(rawText);
    setDecisions((prev) => ({
      ...prev,
      [cleanId]: { text: cleanText, resolved },
    }));

    if (!isWorkspaceReady) return;

    setSyncState('saving');
    const decPath = `workspaces/${WORKSPACE_ID}/decisions/${cleanId}`;
    const decRef = doc(db, 'workspaces', WORKSPACE_ID, 'decisions', cleanId);

    try {
      await setDoc(decRef, {
        id: cleanId,
        workspaceId: WORKSPACE_ID,
        text: cleanText,
        resolved,
        updatedByUid: activeActorId,
        updatedAt: serverTimestamp(),
      });
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.WRITE, decPath);
    }
  };

  return (
    <CloudSyncContext.Provider
      value={{
        tasks,
        syncMeetingDate,
        decisions,
        user,
        authReady,
        isAdminUser,
        memberRole,
        syncState,
        lastSavedAt,
        unauthorizedDomain,
        hasPendingLocalEdits,
        activeTeamCode,
        canDeleteTasks,
        canEditAllFieldsOfTask,
        canModifyFinalizedTask,
        signInToCloud,
        signOutFromCloud,
        pushLocalBrowserEditsToCloud,
        importTasksFromJson,
        createTask,
        updateTaskProgress,
        updateFullTask,
        deleteTask,
        updateSyncMeetingDate,
        saveDirectionDecision,
      }}
    >
      {children}
    </CloudSyncContext.Provider>
  );
};

export function useCloudSync(): CloudSyncContextValue {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) {
    throw new Error('useCloudSync must be used within a CloudSyncProvider');
  }
  return ctx;
}
