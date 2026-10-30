import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Currency } from "@prisma/client";
import { prisma } from "../src/db.js";

const readJson = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf-8"));

async function main() {
  console.log("Memulai proses seeding...");

  // Pilih hanya kolom yang ada di schema
  const heroes = readJson("heroes.json").map((h: any) => ({
    name: h.name,
    role: h.primaryRole,
    lane: h.primaryLane,
    releaseYear: h.releaseYear,
    priceBP: h.priceBP,
    priceDiamond: h.priceDiamond,
  }));

  const skins = readJson("skins.json").map((s: any) => ({
    name: s.name,
    heroId: s.heroId,
    rarity: s.rarity,
    priceDiamond: s.priceDiamond,
  }));

  await prisma.$executeRawUnsafe(
    `TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE;`,
  );

  await prisma.hero.createMany({ data: heroes });
  console.log(`Berhasil memasukkan ${heroes.length} hero.`);

  await prisma.skin.createMany({ data: skins });
  console.log(`Berhasil memasukkan ${skins.length} skin.`);

  await prisma.player.createMany({
    data: [
      { nickname: "ArekITS", bp: 1500, diamond: 75 },
      { nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });
  console.log("Berhasil memasukkan 3 player.");

  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: Currency.BP, pricePaid: 2000 }, // Layla
      { playerId: 1, heroId: 1, currency: Currency.BP, pricePaid: 10800 }, // Miya
      { playerId: 2, heroId: 84, currency: Currency.DIAMOND, pricePaid: 599 }, // Ling
      { playerId: 2, heroId: 56, currency: Currency.BP, pricePaid: 32000 }, // Gusion
    ],
  });
  console.log("Berhasil memasukkan data PlayerHero.");

  const [h, s, p] = await Promise.all([
    prisma.hero.count(),
    prisma.skin.count(),
    prisma.player.count(),
  ]);
  console.log(`Cek akhir -> hero: ${h}, skin: ${s}, player: ${p}`);
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });