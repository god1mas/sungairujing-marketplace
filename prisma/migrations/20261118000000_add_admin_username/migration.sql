-- Expand-only: existing merchant and Super Admin records remain valid.
ALTER TABLE "users" ADD COLUMN "admin_username" VARCHAR(32);

CREATE UNIQUE INDEX "users_admin_username_key" ON "users"("admin_username");

ALTER TABLE "users" ADD CONSTRAINT "users_admin_username_role_format_check"
CHECK (
  "admin_username" IS NULL OR (
    "global_role" = 'SUPER_ADMIN' AND
    "admin_username" ~ '^[a-z][a-z0-9_]{3,31}$'
  )
);
