// prisma/seed.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { seedAdminTypes } from "./seeds/admin-types.seed";
import { seedAdmins } from "./seeds/admins.seed";
// import { seedUsers } from "./seed/03-users.js";

// ────────────────────────────────────────────────
//  Prisma Client with adapter (required in Prisma 7+)
// ────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env file");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  // log: ['query', 'info', 'warn', 'error'], // ← uncomment during debugging
});

async function main() {
  console.log("🌱 Starting database seeding...");
  //   console.log("Using DATABASE_URL:", connectionString.replace(/\/\/.*@/, "//***:***@"));

  try {
    // Run seeders in correct order (relations matter)
    await seedAdminTypes(prisma);
    await seedAdmins(prisma);
    // await seedUsers(prisma);

    console.log("\n✅ Seeding completed successfully");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Unexpected error in seed script:", e);
  process.exit(1);
});
