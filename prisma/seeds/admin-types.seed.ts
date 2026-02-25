// prisma/seed/01-admin-types.ts
import { PrismaClient } from "@prisma/client";

export async function seedAdminTypes(prisma: PrismaClient) {
  const types = [{ name: "SUPER_ADMIN" }, { name: "ADMIN" }, { name: "MODERATOR" }, { name: "SUPPORT" }];

  for (const type of types) {
    await prisma.adminType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log(`→ AdminTypes seeded (${types.length} items)`);
}
