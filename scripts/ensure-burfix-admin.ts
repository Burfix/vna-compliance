/**
 * scripts/ensure-burfix-admin.ts
 *
 * Safely upserts burfix@gmail.com as an ADMIN user.
 * Safe to run multiple times — will not duplicate.
 *
 * Usage:
 *   npx tsx scripts/ensure-burfix-admin.ts
 *   (or via npm run ensure:admin)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "burfix@gmail.com";

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      role: "ADMIN",
      active: true,
      name: "Burfix Admin",
    },
    create: {
      username,
      name: "Burfix Admin",
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`✅ User ensured: ${user.username} (role: ${user.role}, id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
