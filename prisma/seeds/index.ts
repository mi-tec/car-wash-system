// prisma/seed/index.ts
import { PrismaClient } from "@prisma/client";

import { seedAdminTypes } from "./admin-types.seed";
import { seedAdmins } from "./admins.seed";
// import { seedUsers } from "./03-users";

const prisma = new PrismaClient();

export async function seed() {
  try {
    // Order matters if there are relations
    await seedAdminTypes(prisma);
    await seedAdmins(prisma);
    // await seedUsers(prisma);

    console.log("All seeders finished.");
  } catch (e) {
    console.error("Error during seeding:", e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}
