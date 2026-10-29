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
  OperationType,
  handleFirestoreError,
  sanitizeTaskFields,
  sanitizeDate,
  sanitizeDisplayName,
  sanitizeId,
} from '../firebase';
import { VICTOR_INITIAL_TASKS } from '../data/constelarData';
import { VictorTask, TaskStatus } from '../types/flow';

export const TASKS_STORAGE_KEY = 'divo_victor_tasks_v3';
export const MEETING_DATE_STORAGE_KEY = 'divo_sync_meeting_date_v1';

export type SyncState = 'local' | 'connecting' | 'synced' | 'saving' | 'error';
export type MemberRole = 'owner' | 'collaborator' | null;

interface CloudSyncContextValue {
  tasks: VictorTask[];
  syncMeetingDate: string;
  user: User | null;
  authReady: boolean;
  isAdminUser: boolean;
  memberRole: MemberRole;
  syncState: SyncState;
  lastSavedAt: string | null;
  needsTeamCode: boolean;
  unauthorizedDomain: string | null;
  hasPendingLocalEdits: boolean;
  activeTeamCode: string;
  canDeleteTasks: boolean;
  canEditAllFieldsOfTask: (task: VictorTask) => boolean;
  canModifyFinalizedTask: boolean;
  signInToCloud: () => Promise<void>;
  signOutFromCloud: () => Promise<void>;
  submitTeamCode: (code: string) => Promise<boolean>;
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
}

const CloudSyncContext = createContext<CloudSyncContextValue | undefined>(undefined);

function loadLocalTasks(): { tasks: VictorTask[]; differsFromInitial: boolean } {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.map((t: VictorTask) => sanitizeTaskFields(t));
        const initialNormalized = VICTOR_INITIAL_TASKS.map((t) => sanitizeTaskFields(t));
        const differs = JSON.stringify(sanitized) !== JSON.stringify(initialNormalized);
        return { tasks: sanitized, differsFromInitial: differs };
      }
    }
  } catch (e) {
    console.error('Error reading local tasks cache:', e);
  }
  return {
    tasks: VICTOR_INITIAL_TASKS.map((t) => sanitizeTaskFields(t)),
    differsFromInitial: false,
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

function getUrlTeamCode(): string {
  if (typeof window === 'undefined') return DEFAULT_TEAM_CODE;
  const params = new URLSearchParams(window.location.search);
  const fromKey = params.get('key') || params.get('invite') || params.get('team');
  if (fromKey && fromKey.trim().length >= 4) {
    return sanitizeId(fromKey.trim()).slice(0, 32);
  }
  return DEFAULT_TEAM_CODE;
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
  const preLoginLocalSnapshotRef = useRef<VictorTask[]>(initialLocal.current.tasks);

  const [tasks, setTasks] = useState<VictorTask[]>(initialLocal.current.tasks);
  const [syncMeetingDate, setSyncMeetingDate] = useState<string>(loadLocalMeetingDate);
  const [hasPendingLocalEdits, setHasPendingLocalEdits] = useState<boolean>(
    initialLocal.current.differsFromInitial
  );

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [memberRole, setMemberRole] = useState<MemberRole>(null);
  const [syncState, setSyncState] = useState<SyncState>('local');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [needsTeamCode, setNeedsTeamCode] = useState<boolean>(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [activeTeamCode, setActiveTeamCode] = useState<string>(DEFAULT_TEAM_CODE);

  const taskIdsRef = useRef<string[]>(initialLocal.current.tasks.map((t) => t.id));
  const cloudTasksMapRef = useRef<Map<string, VictorTask>>(new Map());
  const taskUnsubsRef = useRef<Map<string, Unsubscribe>>(new Map());

  const isAdminUser = Boolean(
    user && user.emailVerified && user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
  );

  const isCloudConnected = Boolean(user && user.emailVerified && memberRole !== null);

  // Persist local cache whenever tasks or syncMeetingDate change
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

  // Helper: Seed tasks into an already-created workspace in safe chunks of 4 tasks per batch
  const seedTasksIntoCloudWorkspace = useCallback(
    async (currentUser: User, tasksToSeed: VictorTask[]) => {
      const boundedTasks = tasksToSeed.slice(0, MAX_TASK_IDS_COUNT).map((t) => sanitizeTaskFields(t));
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
            createdByUid: currentUser.uid,
            updatedByUid: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        batch.update(wsRef, {
          taskIds: [...accumulatedIds],
          updatedAt: serverTimestamp(),
          updatedByUid: currentUser.uid,
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

  // Helper: Initialize workspace + owner member when workspace doesn't exist yet
  const initializeWorkspaceAndSeed = useCallback(
    async (currentUser: User, codeToSet: string, seedTasks: VictorTask[], initialMeetingDate: string) => {
      const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
      const memberRef = doc(db, 'workspaces', WORKSPACE_ID, 'members', currentUser.uid);

      const initBatch = writeBatch(db);
      initBatch.set(wsRef, {
        id: WORKSPACE_ID,
        name: 'DIVO · Sistema Owl & Estrategia',
        ownerId: currentUser.uid,
        teamCode: codeToSet,
        syncMeetingDate: sanitizeDate(initialMeetingDate, '2026-10-26'),
        taskIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedByUid: currentUser.uid,
      });

      initBatch.set(memberRef, {
        uid: currentUser.uid,
        workspaceId: WORKSPACE_ID,
        displayName: sanitizeDisplayName(currentUser.displayName),
        role: 'owner',
        teamCode: codeToSet,
        joinedAt: serverTimestamp(),
      });

      try {
        await initBatch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `workspaces/${WORKSPACE_ID}`);
      }

      await seedTasksIntoCloudWorkspace(currentUser, seedTasks);
      setHasPendingLocalEdits(false);
      setMemberRole('owner');
      setActiveTeamCode(codeToSet);
    },
    [seedTasksIntoCloudWorkspace]
  );

  // Bootstrap membership after Firebase Auth state resolves
  const ensureWorkspaceMembership = useCallback(
    async (currentUser: User) => {
      if (!currentUser.emailVerified) {
        setSyncState('error');
        return;
      }

      setSyncState('connecting');
      const memberPath = `workspaces/${WORKSPACE_ID}/members/${currentUser.uid}`;
      const memberRef = doc(db, 'workspaces', WORKSPACE_ID, 'members', currentUser.uid);

      let memberSnap;
      try {
        memberSnap = await getDoc(memberRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, memberPath);
      }

      if (memberSnap.exists()) {
        const data = memberSnap.data();
        setMemberRole((data.role as MemberRole) || 'collaborator');
        if (typeof data.teamCode === 'string') {
          setActiveTeamCode(data.teamCode);
        }
        setNeedsTeamCode(false);
        return;
      }

      const candidateCode = getUrlTeamCode();
      const userIsBootstrapAdmin =
        currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (userIsBootstrapAdmin) {
        const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
        let wsSnap;
        try {
          wsSnap = await getDoc(wsRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `workspaces/${WORKSPACE_ID}`);
        }

        if (!wsSnap.exists()) {
          await initializeWorkspaceAndSeed(
            currentUser,
            DEFAULT_TEAM_CODE,
            preLoginLocalSnapshotRef.current,
            syncMeetingDate
          );
          return;
        } else {
          const existingCode = (wsSnap.data().teamCode as string) || DEFAULT_TEAM_CODE;
          try {
            await setDoc(memberRef, {
              uid: currentUser.uid,
              workspaceId: WORKSPACE_ID,
              displayName: sanitizeDisplayName(currentUser.displayName || 'Coty'),
              role: 'owner',
              teamCode: existingCode,
              joinedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, memberPath);
          }
          setActiveTeamCode(existingCode);
          setMemberRole('owner');
          setNeedsTeamCode(false);
          return;
        }
      }

      // Non-admin user (e.g., Víctor or Yasmín):
      // Attempt 1: Join existing workspace as collaborator with URL/default teamCode
      try {
        await setDoc(memberRef, {
          uid: currentUser.uid,
          workspaceId: WORKSPACE_ID,
          displayName: sanitizeDisplayName(currentUser.displayName),
          role: 'collaborator',
          teamCode: candidateCode,
          joinedAt: serverTimestamp(),
        });
        setActiveTeamCode(candidateCode);
        setMemberRole('collaborator');
        setNeedsTeamCode(false);
        return;
      } catch {
        // Either workspace does not exist yet OR candidateCode didn't match custom teamCode
      }

      // Attempt 2: If workspace hasn't been created yet at all, initialize it cleanly
      try {
        await initializeWorkspaceAndSeed(
          currentUser,
          DEFAULT_TEAM_CODE,
          preLoginLocalSnapshotRef.current,
          syncMeetingDate
        );
        setNeedsTeamCode(false);
        return;
      } catch {
        // Workspace already exists with a custom teamCode; ask user for teamCode
        setNeedsTeamCode(true);
        setSyncState('local');
      }
    },
    [initializeWorkspaceAndSeed, syncMeetingDate]
  );

  // Track Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setMemberRole(null);
        setNeedsTeamCode(false);
        setSyncState('local');
      }
    });
    return () => unsub();
  }, []);

  // Trigger membership bootstrap when user signs in
  useEffect(() => {
    if (!authReady || !user) return;
    if (memberRole !== null) return;
    ensureWorkspaceMembership(user).catch((err) => {
      console.error('Error initializing cloud workspace membership:', err);
      setSyncState('error');
    });
  }, [authReady, user, memberRole, ensureWorkspaceMembership]);

  // Attach real-time Firestore doc listeners ONLY when authenticated & authorized
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified || !memberRole) {
      return;
    }

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
    };

    const wsUnsub = onSnapshot(
      wsRef,
      (wsSnap) => {
        if (!wsSnap.exists()) return;
        const data = wsSnap.data();

        if (typeof data.syncMeetingDate === 'string') {
          setSyncMeetingDate(data.syncMeetingDate);
        }
        if (typeof data.teamCode === 'string') {
          setActiveTeamCode(data.teamCode);
        }

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

        // Subscribe to newly added task IDs via individual doc listeners (Zero `list` queries)
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
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, wsPath);
      }
    );

    const unsubsMap = taskUnsubsRef.current;
    const tasksCacheMap = cloudTasksMapRef.current;

    return () => {
      wsUnsub();
      for (const u of unsubsMap.values()) {
        u();
      }
      unsubsMap.clear();
      tasksCacheMap.clear();
    };
  }, [authReady, user, memberRole]);

  const signInToCloud = async () => {
    setUnauthorizedDomain(null);
    // Snapshot current tasks on screen right before sign-in so we never lose local edits!
    preLoginLocalSnapshotRef.current = tasks.map((t) => sanitizeTaskFields(t));
    const initialNorm = VICTOR_INITIAL_TASKS.map((t) => sanitizeTaskFields(t));
    if (JSON.stringify(preLoginLocalSnapshotRef.current) !== JSON.stringify(initialNorm)) {
      setHasPendingLocalEdits(true);
    }

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
    await signOut(auth);
    setMemberRole(null);
    setSyncState('local');
  };

  const submitTeamCode = async (rawCode: string): Promise<boolean> => {
    if (!user) return false;
    const cleanedCode = sanitizeId(rawCode.trim()).slice(0, 32);
    if (cleanedCode.length < 4) return false;

    const memberRef = doc(db, 'workspaces', WORKSPACE_ID, 'members', user.uid);
    try {
      await setDoc(memberRef, {
        uid: user.uid,
        workspaceId: WORKSPACE_ID,
        displayName: sanitizeDisplayName(user.displayName),
        role: 'collaborator',
        teamCode: cleanedCode,
        joinedAt: serverTimestamp(),
      });
      setActiveTeamCode(cleanedCode);
      setMemberRole('collaborator');
      setNeedsTeamCode(false);
      return true;
    } catch {
      return false;
    }
  };

  const canDeleteTasks = !isCloudConnected || isAdminUser || memberRole === 'owner';

  const canModifyFinalizedTask = !isCloudConnected || isAdminUser;

  const canEditAllFieldsOfTask = useCallback(
    (task: VictorTask): boolean => {
      if (!isCloudConnected) return true;
      if (isAdminUser || memberRole === 'owner') return true;
      if (user && task.createdByUid === user.uid) return true;
      return false;
    },
    [isCloudConnected, isAdminUser, memberRole, user]
  );

  // Sync bulk task list (from localStorage snapshot or imported JSON) into Firestore
  const syncTaskArrayToCloud = async (sourceTasks: VictorTask[]): Promise<number> => {
    const sanitizedList = sourceTasks
      .slice(0, MAX_TASK_IDS_COUNT)
      .map((t) => sanitizeTaskFields(t));

    if (!isCloudConnected || !user) {
      setTasks(sanitizedList);
      return sanitizedList.length;
    }

    setSyncState('saving');
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
    const currentIds = [...taskIdsRef.current];
    let syncedCount = 0;

    // 1. Create any tasks that don't exist yet in chunks of 4
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
          createdByUid: user.uid,
          updatedByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        syncedCount++;
      }
      batch.update(wsRef, {
        taskIds: [...currentIds],
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      });
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `workspaces/${WORKSPACE_ID}/tasks`);
      }
    }

    // 2. Update existing tasks whose fields changed (respecting terminal state & Tier 1/2 rules)
    const toUpdate = sanitizedList.filter((t) => {
      const existing = cloudTasksMapRef.current.get(t.id);
      if (!existing) return false;
      if (existing.status === 'finalizado' && !isAdminUser) return false;
      return (
        existing.status !== t.status ||
        existing.deadline !== t.deadline ||
        existing.observations !== t.observations ||
        (existing.specs || '') !== (t.specs || '') ||
        (canEditAllFieldsOfTask(existing) &&
          (existing.title !== t.title ||
            existing.requestedBy !== t.requestedBy ||
            existing.module !== t.module ||
            existing.priority !== t.priority))
      );
    });

    for (const t of toUpdate) {
      const existing = cloudTasksMapRef.current.get(t.id)!;
      const tRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', t.id);
      try {
        if (canEditAllFieldsOfTask(existing)) {
          await updateDoc(tRef, {
            title: t.title,
            requestedBy: t.requestedBy,
            module: t.module,
            priority: t.priority,
            deadline: t.deadline,
            status: t.status,
            observations: t.observations,
            specs: t.specs || '',
            updatedByUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(tRef, {
            deadline: t.deadline,
            status: t.status,
            observations: t.observations,
            specs: t.specs || '',
            updatedByUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        }
        syncedCount++;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `workspaces/${WORKSPACE_ID}/tasks/${t.id}`);
      }
    }

    setSyncState('synced');
    setLastSavedAt(formatNowTime());
    setHasPendingLocalEdits(false);
    return syncedCount;
  };

  const pushLocalBrowserEditsToCloud = async (): Promise<number> => {
    return syncTaskArrayToCloud(preLoginLocalSnapshotRef.current);
  };

  const importTasksFromJson = async (importedTasks: VictorTask[]): Promise<number> => {
    return syncTaskArrayToCloud(importedTasks);
  };

  const createTask = async (rawTask: VictorTask): Promise<void> => {
    const clean = sanitizeTaskFields(rawTask);

    if (!isCloudConnected || !user) {
      setTasks((prev) => [clean, ...prev]);
      setHasPendingLocalEdits(true);
      preLoginLocalSnapshotRef.current = [clean, ...tasks];
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
      createdByUid: user.uid,
      updatedByUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(wsRef, {
      taskIds: nextIds,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
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

    if (!isCloudConnected || !user) {
      const updatedList = tasks.map((t) => (t.id === taskId ? merged : t));
      setTasks(updatedList);
      setHasPendingLocalEdits(true);
      preLoginLocalSnapshotRef.current = updatedList;
      return;
    }

    if (existing.status === 'finalizado' && !isAdminUser) {
      return;
    }

    setSyncState('saving');
    const taskPath = `workspaces/${WORKSPACE_ID}/tasks/${taskId}`;
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', taskId);

    const payload: Record<string, unknown> = {
      updatedByUid: user.uid,
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

    if (!isCloudConnected || !user) {
      const updatedList = tasks.map((t) => (t.id === clean.id ? clean : t));
      setTasks(updatedList);
      setHasPendingLocalEdits(true);
      preLoginLocalSnapshotRef.current = updatedList;
      return;
    }

    if (existing.status === 'finalizado' && !isAdminUser) {
      return;
    }

    setSyncState('saving');
    const taskPath = `workspaces/${WORKSPACE_ID}/tasks/${clean.id}`;
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', clean.id);

    try {
      if (canEditAllFieldsOfTask(existing)) {
        await updateDoc(taskRef, {
          title: clean.title,
          requestedBy: clean.requestedBy,
          module: clean.module,
          priority: clean.priority,
          deadline: clean.deadline,
          status: clean.status,
          observations: clean.observations,
          specs: clean.specs || '',
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(taskRef, {
          deadline: clean.deadline,
          status: clean.status,
          observations: clean.observations,
          specs: clean.specs || '',
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.UPDATE, taskPath);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!isCloudConnected || !user) {
      const updatedList = tasks.filter((t) => t.id !== taskId);
      setTasks(updatedList);
      setHasPendingLocalEdits(true);
      preLoginLocalSnapshotRef.current = updatedList;
      return;
    }

    if (!canDeleteTasks) return;

    setSyncState('saving');
    const nextIds = taskIdsRef.current.filter((id) => id !== taskId);
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);
    const taskRef = doc(db, 'workspaces', WORKSPACE_ID, 'tasks', taskId);

    const batch = writeBatch(db);
    batch.delete(taskRef);
    batch.update(wsRef, {
      taskIds: nextIds,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
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

    if (!isCloudConnected || !user) {
      return;
    }

    setSyncState('saving');
    const wsPath = `workspaces/${WORKSPACE_ID}`;
    const wsRef = doc(db, 'workspaces', WORKSPACE_ID);

    try {
      await updateDoc(wsRef, {
        syncMeetingDate: cleanDate,
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setSyncState('synced');
      setLastSavedAt(formatNowTime());
    } catch (err) {
      setSyncState('error');
      handleFirestoreError(err, OperationType.UPDATE, wsPath);
    }
  };

  return (
    <CloudSyncContext.Provider
      value={{
        tasks,
        syncMeetingDate,
        user,
        authReady,
        isAdminUser,
        memberRole,
        syncState,
        lastSavedAt,
        needsTeamCode,
        unauthorizedDomain,
        hasPendingLocalEdits,
        activeTeamCode,
        canDeleteTasks,
        canEditAllFieldsOfTask,
        canModifyFinalizedTask,
        signInToCloud,
        signOutFromCloud,
        submitTeamCode,
        pushLocalBrowserEditsToCloud,
        importTasksFromJson,
        createTask,
        updateTaskProgress,
        updateFullTask,
        deleteTask,
        updateSyncMeetingDate,
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
