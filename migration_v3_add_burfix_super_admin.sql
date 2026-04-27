-- migration_v3_add_burfix_super_admin.sql
--
-- Upserts the burfix@gmail.com admin user.
-- ADMIN is the highest role in this system (no SUPER_ADMIN exists).
-- Safe to run multiple times — uses ON CONFLICT DO UPDATE.

INSERT INTO "users" (id, username, name, role, active, "createdAt")
VALUES (
  gen_random_uuid(),
  'burfix@gmail.com',
  'Burfix Admin',
  'ADMIN',
  true,
  now()
)
ON CONFLICT (username)
DO UPDATE SET
  role     = 'ADMIN',
  active   = true,
  name     = COALESCE(EXCLUDED.name, "users".name);
