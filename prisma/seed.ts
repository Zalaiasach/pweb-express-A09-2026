import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/db.js'; // Tambahkan ekstensi .js atau sesuaikan
import { Role, Lane, Rarity, Currency } from '@prisma/client';

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Kosongkan semua tabel dan reset urutan ID ke 1
  await prisma.$executeRawUnsafe(
    `TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE;`
  );

  // 2. Baca dan masukkan data Hero (133 hero)
  const heroesPath = path.join(process.cwd(), 'data', 'heroes.json');
  const heroesRaw = JSON.parse(fs.readFileSync(heroesPath, 'utf-8'));

  const heroesData = heroesRaw.map((h: any) => ({
    name: h.name,
    role: h.primaryRole as Role,
    lane: h.primaryLane as Lane,
    releaseYear: h.releaseYear,
    priceBP: h.priceBP ?? null,
    priceDiamond: h.priceDiamond ?? null,
  }));

  await prisma.hero.createMany({ data: heroesData });
  console.log('Berhasil memasukkan 133 Hero.');

  // 3. Baca dan masukkan data Skin (892 skin)
  const skinsPath = path.join(process.cwd(), 'data', 'skins.json');
  const skinsRaw = JSON.parse(fs.readFileSync(skinsPath, 'utf-8'));

  const skinsData = skinsRaw.map((s: any) => ({
    name: s.name,
    heroId: s.heroId,
    rarity: s.rarity as Rarity,
    priceDiamond: s.priceDiamond ?? null,
  }));

  await prisma.skin.createMany({ data: skinsData });
  console.log('Berhasil memasukkan 892 Skin.');

  // 4. Masukkan 3 Player awal
  await prisma.player.createMany({
    data: [
      { nickname: 'ArekITS', bp: 1500, diamond: 75 },
      { nickname: 'SangPushRank', bp: 13000, diamond: 2892 },
      { nickname: 'MageSurabaya', bp: 10000, diamond: 0 },
    ],
  });
  console.log('Berhasil memasukkan 3 Player.');

  // 5. Masukkan data PlayerHero
  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: Currency.BP, pricePaid: 2000 },       // Layla
      { playerId: 1, heroId: 1, currency: Currency.BP, pricePaid: 10800 },       // Miya
      { playerId: 2, heroId: 84, currency: Currency.DIAMOND, pricePaid: 599 },   // Ling
      { playerId: 2, heroId: 56, currency: Currency.BP, pricePaid: 32000 },      // Gusion
    ],
  });
  console.log('Berhasil memasukkan data PlayerHero.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });