import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

// Pastikan connection string terbaca
if (!connectionString) {
  throw new Error('DATABASE_URL tidak ditemukan di file .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any); // Type casting 'as any' untuk menghindari error tipe argumen Pool

export const prisma = new PrismaClient({ adapter });