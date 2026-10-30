import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Neon butuh WebSocket di Node.js (diperlukan untuk $transaction)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL tidak ditemukan di file .env");
}

// Prisma 7: PrismaNeon menerima config pool, bukan instance Pool
const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });
