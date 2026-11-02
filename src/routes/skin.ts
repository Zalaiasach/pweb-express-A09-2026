import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../middleware.js';
import { Rarity } from '@prisma/client';

const router = Router();

// GET /api/skins
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const heroId = req.query.heroId ? parseInt(req.query.heroId as string) : undefined;
    const rarity = (req.query.rarity as Rarity) || undefined;

    const where: any = {};

    if (heroId) {
      where.heroId = heroId;
    }

    if (rarity) {
      where.rarity = rarity;
    }

    const totalItems = await prisma.skin.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const skins = await prisma.skin.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
      include: {
        hero: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      status: true,
      message: 'Berhasil mengambil data skin',
      data: skins,
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

// GET /api/skins/:skin_id
router.get('/:skin_id', async (req, res, next) => {
  try {
    const skinId = parseInt(req.params.skin_id as string);
    if (isNaN(skinId)) {
      throw new HttpError(400, 'ID Skin tidak valid');
    }

    const skin = await prisma.skin.findUnique({
      where: { id: skinId },
      include: {
        hero: true,
      },
    });

    if (!skin) {
      throw new HttpError(404, 'Skin tidak ditemukan');
    }

    res.status(200).json({
      status: true,
      message: 'Berhasil mengambil detail skin',
      data: skin,
    });
  } catch (error) {
    next(error);
  }
});

export default router;