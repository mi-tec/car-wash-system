import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
  // 2025–2026 OWASP-ish sensible & future-resistant parameters
  return argon2.hash(password, {
    type: argon2.argon2id, // hybrid → best side-channel + GPU resistance
    memoryCost: 65536, // 64 MiB — good minimum in 2026 (many now use 128 MiB+)
    timeCost: 3, // iterations
    parallelism: 4, // threads
    hashLength: 32,
  });
}

export async function seedAdmins(prisma: PrismaClient) {
  const adminTypeMap = await prisma.adminType.findMany({
    select: { id: true, name: true },
  });

  const typeId = (name: string) => adminTypeMap.find((t) => t.name === name)?.id;

  const SAMPLE_HASH = await hashPassword("admin123");

  const admins = [
    {
      name: "Super Admin",
      email: "super@admin.dev",
      password: SAMPLE_HASH,
      adminTypeName: "SUPER_ADMIN",
    },
    {
      name: "Main Admin",
      email: "admin@example.com",
      password: SAMPLE_HASH,
      adminTypeName: "ADMIN",
    },
    {
      name: "Moderator Anna",
      email: "anna.mod@example.com",
      password: SAMPLE_HASH,
      adminTypeName: "MODERATOR",
    },
  ];

  for (const admin of admins) {
    const adminTypeId = typeId(admin.adminTypeName);
    if (!adminTypeId) {
      throw new Error(`AdminType ${admin.adminTypeName} not found`);
    }

    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        adminTypeId,
        updatedAt: new Date(), // Ensure updatedAt is set on create
      },
    });
  }

  console.log(`→ Admins seeded (${admins.length} items)`);
}
