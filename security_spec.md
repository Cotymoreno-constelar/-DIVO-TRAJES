# Zero-Trust Firestore Security Specification — DIVO & OWL SYSTEM

## 1. Data Invariants & Master Source of Truth
1. **Default Deny & Zero `list` Queries**: All collection `list` operations are unconditionally denied (`allow list: if false;`). Tasks are indexed via a bounded `taskIds` array (`<= 100`) on `/workspaces/divo-owl` and fetched via individual `doc` listeners (`allow get`).
2. **Master Gate Relational Sync**: `/workspaces/{workspaceId}` is the parent source of truth, and `/workspaces/{workspaceId}/members/{memberId}` tracks active members. Revoking `/members/{uid}` immediately revokes all `get`, `create`, `update`, and `delete` rights on `/workspaces/{workspaceId}` and `/workspaces/{workspaceId}/tasks/{taskId}`.
3. **Verified Identity & Anti-Email-Spoofing**: Every write requires `request.auth != null && request.auth.token.email_verified == true`. Bootstrapped admin (`jimenacmoreno@gmail.com`) requires `email_verified == true`.
4. **Anti-Privilege-Escalation**: Non-admin users joining an existing workspace via `teamCode` can ONLY create their own membership doc (`memberId == request.auth.uid`) with `role == 'collaborator'` and matching `teamCode`. `role` is immutable on update.
5. **Atomic Relational Integrity**: Creating `/workspaces/divo-owl` requires `existsAfter(/workspaces/divo-owl/members/$(request.auth.uid))`. Creating a task requires `taskId in getAfter(/workspaces/$(workspaceId)).data.taskIds`; deleting a task requires `!(taskId in getAfter(/workspaces/$(workspaceId)).data.taskIds)`.
6. **Terminal State Locking**: Once an `OwlTask` reaches `status == 'finalizado'`, subsequent updates are blocked unless `isAdmin()` overrides.
7. **Zero PII Storage**: No emails, phone numbers, or physical addresses are stored in `workspaces`, `members`, or `tasks`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return `PERMISSION_DENIED`)

1. **Payload 1 — Unverified Email Admin Spoof**: Authenticated user with `email: "jimenacmoreno@gmail.com"` and `email_verified: false` attempting `create` on `/admins/attacker_uid`.
2. **Payload 2 — Self-Assigned Owner Privilege Escalation**: Verified user joining existing `/workspaces/divo-owl/members/attacker_uid` with `role: "owner"` instead of `"collaborator"`.
3. **Payload 3 — Invalid Team Code Intrusion**: Verified outsider creating `/workspaces/divo-owl/members/attacker_uid` with guessed `teamCode: "WRONG-CODE"`.
4. **Payload 4 — Identity Spoofing on Task Creation**: Workspace member creating `/workspaces/divo-owl/tasks/task-1` with `createdByUid: "coty_uid"` while `request.auth.uid == "victor_uid"`.
5. **Payload 5 — Shadow Field Injection ("Ghost Field")**: Workspace member updating `/workspaces/divo-owl/tasks/task-1` with an extra undeclared property `isVerified: true`.
6. **Payload 6 — Terminal State Mutation Bypass**: Non-admin collaborator attempting to update `observations` or `status` on a task where `existing().status == "finalizado"`.
7. **Payload 7 — Orphaned Task Write (Sync Vulnerability)**: Workspace member creating `/workspaces/divo-owl/tasks/task-orphan` without atomically adding `"task-orphan"` into `/workspaces/divo-owl.taskIds` (`getAfter` invariant).
8. **Payload 8 — ID Poisoning / Resource Exhaustion**: Workspace member attempting `create` on `/workspaces/divo-owl/tasks/<200-char-invalid-id!@#>`.
9. **Payload 9 — Value Poisoning on Whitelisted Update Key**: Workspace member updating `deadline` (an allowed key in `affectedKeys()`) with `"not-a-date"` or a 5,000-char string.
10. **Payload 10 — Immortal Field Tampering**: Workspace owner attempting to mutate `createdAt` or `createdByUid` during an `OwlTask` update.
11. **Payload 11 — Temporal Forgery (Client Timestamp Spoof)**: Workspace member creating a task with `createdAt` set to a past timestamp (`request.time - 1 day`) instead of `request.time`.
12. **Payload 12 — Unauthorized Collection Scraping (`list`)**: Authenticated workspace member executing a collection `list` query on `/workspaces/divo-owl/tasks`.
