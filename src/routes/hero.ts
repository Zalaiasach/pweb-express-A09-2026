import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../middleware.js';
import { Role, Lane } from '@prisma/client';

const router = Router();

// GET /api/heroes
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || undefined;
    const role = (req.query.role as Role) || undefined;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive', // case-insensitive search
      };
    }

    if (role) {
      where.role = role;
    }

    const totalItems = await prisma.hero.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const heroes = await prisma.hero.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
    });

    res.status(200).json({
      status: true,
      message: 'Berhasil mengambil data hero',
      data: heroes,
      metadata: {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/heroes/:hero_id
router.get('/:hero_id', async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.hero_id as string);
    if (isNaN(heroId)) {
      throw new HttpError(400, 'ID Hero tidak valid');
    }

    const hero = await prisma.hero.findUnique({
      where: { id: heroId },
      include: {
        skins: true,
      },
    });

    if (!hero) {
      throw new HttpError(404, 'Hero tidak ditemukan');
    }

    res.status(200).json({
      status: true,
      message: 'Berhasil mengambil detail hero',
      data: hero,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/heroes
router.post('/', async (req, res, next) => {
  try {
    const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body;

    // 1. Validasi: name, role, lane, atau releaseYear tidak diisi -> 400
    if (!name || !role || !lane || releaseYear === undefined || releaseYear === null) {
      throw new HttpError(400, 'Semua field wajib (name, role, lane, releaseYear) harus diisi');
    }

    // 2. Cek apakah nama hero sudah ada -> 409
    const existingHero = await prisma.hero.findUnique({
      where: { name },
    });

    if (existingHero) {
      throw new HttpError(409, 'Nama hero sudah ada');
    }

    // 3. Tambahkan ke database -> 201
    const newHero = await prisma.hero.create({
      data: {
        name,
        role: role as Role,
        lane: lane as Lane,
        releaseYear: Number(releaseYear),
        priceBP: priceBP !== undefined && priceBP !== null ? Number(priceBP) : null,
        priceDiamond: priceDiamond !== undefined && priceDiamond !== null ? Number(priceDiamond) : null,
      },
    });

    res.status(201).json({
      status: true,
      message: 'Hero berhasil dibuat',
      data: newHero,
    });
  } catch (error) {
    next(error);
  }
});

export default router;