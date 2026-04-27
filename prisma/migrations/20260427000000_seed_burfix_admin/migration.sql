-- Ensure burfix@gmail.com exists as ADMIN in production
-- Safe to run multiple times (ON CONFLICT DO UPDATE)

INSERT INTO "users" (
  "id",
  "username",
  "name",
  "role",
  "active",
  "createdAt"
)
VALUES (
  gen_random_uuid(),
  'burfix@gmail.com',
  'Burfix Admin',
  'ADMIN',
  true,
  now()
)
ON CONFLICT ("username")
DO UPDATE SET
  "role"    = 'ADMIN',
  "active"  = true,
  "name"    = COALESCE("users"."name", 'Burfix Admin');
