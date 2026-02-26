import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
  });
};

type PrismaSingleton = ReturnType<typeof prismaClientSingleton>;

declare const globalThis: {
  prismaGlobal: PrismaSingleton;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
