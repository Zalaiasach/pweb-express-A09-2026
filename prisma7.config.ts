import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI (migrate/studio) memakai koneksi direct jika ada, selain itu pooled
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
