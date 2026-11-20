# Admin Username Authentication Migration

This runbook covers the approved separation of Super Admin and Merchant login. Gates 4C.1 and 4C.2 completed the additive Production migration and ID-scoped username provisioning. The reviewed release snapshot from commit `304a77760177fd1bd569a71d516ef8a4a81b06f9` is live as Vercel Production deployment `dpl_D1CpvYqv5RbQGUyJHqyXFpC4pp3K` at `https://umkmdesasungairujing.web.id`. Preview-specific testing was skipped by operator decision. This document records the later Production audit; it does not authorize Git `main` reconciliation, password rotation, rollback, or further Production changes.

## Local contract

- Merchant: `/login`, WhatsApp + password, `credentials` provider, `USER` role only.
- Super Admin: `/admin/login`, username + password, `admin-credentials` provider, `SUPER_ADMIN` role only.
- Initial admin username: `admin_sungairujing` (not a password or secret).
- Both paths use Argon2id hashes, generic errors, independent rate-limit keys, eight-hour JWT sessions, and database-backed role/session-version checks.
- Existing `users.id`, WhatsApp, password hash, and audit relations remain intact.
- A fresh development seed/bootstrap creates `admin_sungairujing`; an existing admin row is **not** assigned a username by WhatsApp lookup. After applying the migration locally, verify that row's `User.id` and run the same ID-scoped provisioning command against the local database. The development seed is forbidden against Production.

## Phase 3 local verification — COMPLETED

- Both reviewed migrations applied successfully to an isolated PostgreSQL 17 database; `migrate status` is current and all 16 application tables remain present.
- `admin_username` is nullable and unique; the database rejects non-Super-Admin usernames. Existing admin `User.id`, password hash, moderation audit relation, and merchant membership relation were preserved during ID-scoped provisioning.
- Real database authentication and browser E2E passed for admin username login, merchant WhatsApp login, cross-role denial, inactive accounts, rate limiting, session validation, and protected-route redirects. No Production database or account was changed.

## Production gate status

- Gate 4A — manual Production PostgreSQL backup and isolated restore: **PASS**. Retain the private backup and verified checksum outside Git; PostgreSQL backup does not include Supabase Storage objects.
- Gate 4B — isolated auth release preparation and local verification: **PASS**.
- Gate 4C.1 — only migration `20261118000000_add_admin_username` applied to the verified Production project: **PASS**. The nullable column, unique index, role/format constraint, migration history, and existing application relationships were verified.
- Gate 4C.2 — username `admin_sungairujing` provisioned on the operator-selected existing active Super Admin `User.id`: **PASS**. The ID, role, password hash, other user data, and relationships were verified unchanged except for the expected timestamp; the username was not assigned to another user. The private ID and connection details are not recorded here.
- Gate 4C.3 — focused release commit and branch push: **PASS**. Preview-specific testing: **SKIPPED by operator decision**, not PASS.
- Gate 4C.3D/4C.3E — staged Production deployment and promotion of the existing deployment: **PASS**. The custom-domain alias points to `dpl_D1CpvYqv5RbQGUyJHqyXFpC4pp3K`; no rebuild was performed during promotion. All 376 uploaded source files were independently matched to the `304a777` release snapshot before promotion. Vercel CLI Git metadata instead shows older SHA `34d24d0`; do not use that metadata alone as provenance.
- Phase 4D — operator-controlled Production checks: **PASS as reported by the operator** for new Super Admin username login, Merchant WhatsApp login, rejection of legacy Super Admin WhatsApp login, both logouts, and cross-role route protection. Automated Production login attempts were not made. Public `/`, `/products`, `/merchants`, `/admin/login`, and `/login` smoke checks returned HTTP 200 with expected content.
- Phase 4E — read-only recovery audit: **PASS**. The earlier Production deployment `dpl_HwndAapXWh2Z8EzUV2EsKiNS8RhW` remains READY. The post-provisioning private PostgreSQL backup remains accessible with SHA-256 `327AA138DDB39AD7610C001D33384B222AA5EEDE5EFACEA0C57F6DCE6B7B42CF`; its isolated restore passed at Gate 4C.3D. The backup does not include Supabase Storage objects and may not contain later writes.
- Phase 4F — local documentation update: **PASS**. Git reconciliation of `main`: **PENDING separate authorization**. Password rotation: **PENDING separate authorization**.

## Production runtime audit — 2026-11-20

- Read-only TLS `verify-full` connection to Supabase project `tjoftscbreotryznwuyc` succeeded. Both repository migrations are recorded as applied; the expected active named Super Admin exists. Counts at audit time: 2 users, 1 merchant, 1 product. This was not a database write or a full integrity/backup refresh.
- Available Vercel runtime-log window reviewed: **10:17–10:47 UTC**. Six `error` entries were expected `UnauthenticatedError`/`ForbiddenError` on protected routes after unauthorized access; no P1001, P2024, Prisma, Upstash, NextAuth, or HTTP 500 evidence was found in that window. Later incidents or intermittent failures remain possible.
- Temporary `AUTH_DIAGNOSTIC_LOGGING` is verbose: 35 of 40 `info` records in the reviewed window were stage events. The events were stage-only, with no credential values observed. Disabling the flag or removing telemetry requires separate authorization and a controlled deployment/configuration decision.
- Production scenarios **NOT TESTED** in this gate include password rotation, password-recovery delivery, high-volume rate-limit behavior, long-running database stability, and Preview-specific integration. Do not infer their success from HTTP 200 responses or local tests.

## Git reconciliation — preparation only

- Remote `main`: `2ed488512745bec8dc93b8e8289ac780c7ce4a9b`; remote `release/admin-username-auth`: `304a77760177fd1bd569a71d516ef8a4a81b06f9`. The release is one focused descendant commit and can reproduce the reviewed source snapshot. The original `main` worktree is locally at `34d24d0` with unrelated uncommitted changes; preserve it intact.
- A push or merge to the Vercel-connected Production branch can create a new Production deployment and, by default, automatically assign its domains. Treat Git reconciliation as a release operation, not bookkeeping. Before authorizing it, verify current Git/Vercel Production-branch settings and establish a reviewed hold/release mechanism (for example, required Deployment Checks) or explicitly approve and verify the new deployment. Do not assume the existing CLI-promoted deployment will stay live after a `main` push.
- After separate authorization, recheck remote branch SHAs and the 51-file release diff. Prefer an exact fast-forward of the reviewed release commit if repository protection permits; otherwise review the PR merge method and resulting commit/source tree. Perform this from the isolated release context, not by overwriting the dirty original worktree. Verify the resulting Vercel deployment and domain before marking Git reconciliation complete.
- No merge, push to `main`, Production deployment, password rotation, environment change, or database mutation was performed by this audit.

## Rollback

- Before password rotation, the prior application version can be restored if necessary because the migration is additive and the legacy row/hash are preserved. Do not drop the column or delete the admin row as an automatic rollback.
- After password rotation, rolling back the application would restore the legacy WhatsApp login path with the **new** password. This is a security downgrade requiring an explicit incident decision and follow-up rotation; prefer a forward fix. Existing sessions should be invalidated by `updated_at` changes.
- The rollback candidate is `dpl_HwndAapXWh2Z8EzUV2EsKiNS8RhW`. If a critical incident requires rollback, first verify it remains READY and is the immediate previous Production deployment for the correct project/team. Obtain separate operator authorization before running `vercel rollback dpl_HwndAapXWh2Z8EzUV2EsKiNS8RhW --scope god1mas`. Then verify the custom-domain alias, public smoke routes, and legacy authentication exposure; never automatically restore the database or reverse the additive migration. Rollback would re-enable the legacy Super Admin WhatsApp login path even before password rotation. Vercel disables automatic Production-domain assignment after rollback until a later approved promotion restores it.
- The operator-reported authenticated admin and merchant checks have passed on the live release; do not repeat real-account login tests automatically. Password rotation and Git reconciliation remain separate pending actions.
