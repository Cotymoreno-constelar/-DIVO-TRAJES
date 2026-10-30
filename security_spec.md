# Zero-Trust Firestore Security Specification — DIVO & OWL SYSTEM (Hardened Public Live Board)

## 1. Data Invariants & Master Source of Truth
1. **Default Deny & Zero `list` Queries**: All collection `list` operations across every path are unconditionally denied (`allow list: if false;`). Tasks are indexed via a bounded `taskIds` array (`<= 250`) on `/workspaces/divo-owl` and Direction decisions use the 4 deterministic IDs (`dir-pending-1`..`dir-pending-4`), fetched strictly via individual `doc` listeners (`allow get`).
2. **Singleton Workspace Boundary (`divo-owl`)**: Public live collaboration is strictly isolated to `workspaceId == 'divo-owl'` (`isPublicDivoWorkspace`). Any attempt to read or write arbitrary workspace IDs is rejected.
3. **Actor Identity Anti-Spoofing (`isAuthorizedActor`)**:
   - Unauthenticated public collaborators (`request.auth == null`) MUST use a prefixed client session actor ID matching `^pub-[a-zA-Z0-9_\-]{6,60}$` (`10..64` chars) — they can NEVER forge a Firebase Auth UID.
   - Authenticated users MUST have `request.auth.token.email_verified == true` and `actorId == request.auth.uid` — unverified accounts (`email_verified == false`) cannot spoof either `pub-...` IDs or verified UIDs, and verified users cannot spoof another user's UID.
   - Bootstrapped admin (`jimenacmoreno@gmail.com`) strictly requires `email_verified == true`.
4. **Master Gate & Atomic Relational Sync**: Every subcollection operation under `/workspaces/{workspaceId}` verifies `exists(/workspaces/$(workspaceId))`. Creating a task requires `taskId in getAfter(/workspaces/$(workspaceId)).data.taskIds`; deleting a task requires `!(taskId in getAfter(/workspaces/$(workspaceId)).data.taskIds)`.
5. **Terminal State Locking**: Once an `OwlTask` reaches `status == 'finalizado'`, subsequent updates or deletions are blocked unless `isAdmin()` overrides.
6. **Strict Validation Blueprints & Zero PII**: Every `create` and `update` wraps logic with `isValid[Entity](incoming())`, enforcing `hasAll`/`hasOnly` keys, string `.size()` bounds, regex patterns, immutable creation fields, `request.time` server timestamps, and zero PII storage.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return `PERMISSION_DENIED`)

1. **Payload 1 — Unverified Email Admin Spoof**: Authenticated user with `email: "jimenacmoreno@gmail.com"` and `email_verified: false` attempting `create` on `/admins/spoof_uid`.
2. **Payload 2 — Arbitrary Workspace Intrusion**: Public or authenticated actor attempting to create or read `/workspaces/evil-workspace` outside the singleton `'divo-owl'`.
3. **Payload 3 — Unauthenticated Firebase UID Spoof**: Unauthenticated public visitor (`request.auth == null`) attempting to create a task with `createdByUid: "coty_uid"` instead of a valid `pub-...` actor ID.
4. **Payload 4 — Cross-UID Identity Spoofing**: Verified user `victor_uid` creating `/workspaces/divo-owl/tasks/task-1` with `createdByUid: "coty_uid"`.
5. **Payload 5 — Shadow Field Injection ("Ghost Field")**: Public collaborator updating `/workspaces/divo-owl/tasks/v-req-08` with an extra undeclared property `isVerified: true`.
6. **Payload 6 — Terminal State Mutation Bypass**: Non-admin actor attempting to update or reopen a task where `existing().status == "finalizado"`.
7. **Payload 7 — Orphaned Task Write (Sync Vulnerability)**: Actor creating `/workspaces/divo-owl/tasks/task-orphan` without atomically adding `"task-orphan"` into `/workspaces/divo-owl.taskIds` (`getAfter` invariant).
8. **Payload 8 — ID Poisoning / Resource Exhaustion**: Actor attempting `create` on `/workspaces/divo-owl/tasks/<200-char-invalid-id!@#>`.
9. **Payload 9 — Value Poisoning on Whitelisted Update Key**: Actor updating `deadline` (an allowed key in `affectedKeys()`) with `"not-a-date"` or oversized string.
10. **Payload 10 — Immortal Field Tampering**: Actor attempting to mutate `createdAt` or `createdByUid` during an `OwlTask` update.
11. **Payload 11 — Temporal Forgery (Client Timestamp Spoof)**: Actor creating a task with `createdAt` set to a past client timestamp (`request.time - 1 day`) instead of `request.time`.
12. **Payload 12 — Unauthorized Collection Scraping (`list`)**: Executing a collection `list` query on `/workspaces/divo-owl/tasks` or `/workspaces/divo-owl/decisions`.
