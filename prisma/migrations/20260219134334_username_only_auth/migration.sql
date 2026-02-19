-- AlterTable
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- Update existing rows with username based on email
UPDATE "users" SET "username" = SPLIT_PART("email", '@', 1) WHERE "username" IS NULL;

-- Make username required
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

-- Drop email and passwordHash
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "passwordHash";

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
