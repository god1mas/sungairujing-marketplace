# Admin Username Authentication Migration

This runbook covers only the approved separation of Super Admin and Merchant login. Gates 4C.1 and 4C.2 were separately authorized and completed. Gate 4C.3 authorizes a focused release branch commit/push and safe Vercel Preview verification only; it does not authorize merging to `main`, Production application deployment, password rotation, or further Production database changes.

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
- Gate 4C.3 — focused release commit, branch push, and Vercel Preview verification: **IN PROGRESS**. Preview authentication tests require isolated non-Production database, rate-limiter service, and test credentials.
- Production application cutover, admin login verification, and password rotation: **NOT AUTHORIZED / NOT COMPLETED**.

## Remaining Production cutover checklist — NOT APPROVED YET

1. Preserve the verified private backup and restore evidence. Recheck its freshness and recovery readiness immediately before the separately authorized Production release; do not assume an older backup covers newer writes.
2. Complete Gate 4C.3: review the exact auth release diff, validate locally, push only `release/admin-username-auth`, and verify Preview without using Production database or credentials. Do not treat development-mode E2E as proof of Production-mode rate limiting or Preview auth readiness.
3. Request separate approval for merge and Production application deployment. Confirm deployment target, release commit, Production environment scope, and current admin-account state before proceeding. Do not rerun the completed migration or provisioning by default.
4. After an approved Production deployment, test `/admin/login` with the existing admin password, `/admin`, merchant `/login`, registration/recovery, and denial of old admin WhatsApp login. Do not log credentials or replay tests against Production without operator control.
5. After successful login and separate operator approval, rotate the admin password via `/admin/account`. This updates `users.updated_at` and invalidates older sessions. The admin is signed out to `/admin/login`. Retain the legacy WhatsApp column for compatibility but never use it for admin authentication in the new application.

## Rollback

- Before password rotation, the prior application version can be restored if necessary because the migration is additive and the legacy row/hash are preserved. Do not drop the column or delete the admin row as an automatic rollback.
- After password rotation, rolling back the application would restore the legacy WhatsApp login path with the **new** password. This is a security downgrade requiring an explicit incident decision and follow-up rotation; prefer a forward fix. Existing sessions should be invalidated by `updated_at` changes.
- Do not mark cutover complete until authenticated admin and merchant checks pass on the deployed version and the observed Production state is recorded.
