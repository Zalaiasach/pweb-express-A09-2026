import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../middleware.js';
import {Currency} from '@prisma/client';

const router = Router();
const playerIdFrom = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID Player tidak valid');
  return id;
};

router.post('/', async (req, res, next) => {
  try {
    const nickname = req.body?.nickname;
    if (typeof nickname !== 'string' || !nickname.trim()) throw new HttpError(400, 'Nickname wajib diisi');
    const existing = await prisma.player.findUnique({ where: { nickname: nickname.trim() } });
    if (existing) throw new HttpError(409, 'Nickname sudah digunakan');
    const player = await prisma.player.create({ data: { nickname: nickname.trim() } });
    res.status(201).json({ status: true, message: 'Player berhasil dibuat', data: player });
  } catch (error) { next(error); }
});

router.get('/:player_id', async (req, res, next) => {
  try {
    const id = playerIdFrom(req.params.player_id);
    const player = await prisma.player.findUnique({ where: { id }, include: { playerHeroes: { include: { hero: true } } } });
    if (!player) throw new HttpError(404, 'Player tidak ditemukan');
    res.json({ status: true, message: 'Berhasil mengambil detail player', data: player });
  } catch (error) { next(error); }
});

router.patch('/:player_id', async (req, res, next) => {
  try {
    const id = playerIdFrom(req.params.player_id);
    const nickname = req.body?.nickname;
    if (typeof nickname !== 'string' || !nickname.trim()) throw new HttpError(400, 'Nickname wajib diisi');
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new HttpError(404, 'Player tidak ditemukan');
    const duplicate = await prisma.player.findUnique({ where: { nickname: nickname.trim() } });
    if (duplicate && duplicate.id !== id) throw new HttpError(409, 'Nickname sudah digunakan');
    const updated = await prisma.player.update({ where: { id }, data: { nickname: nickname.trim() } });
    res.json({ status: true, message: 'Nickname player berhasil diperbarui', data: updated });
  } catch (error) { next(error); }
});

router.delete('/:player_id', async (req, res, next) => {
  try {
    const id = playerIdFrom(req.params.player_id);
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new HttpError(404, 'Player tidak ditemukan');
    await prisma.player.delete({ where: { id } });
    res.json({ status: true, message: 'Player berhasil dihapus' });
  } catch (error) { next(error); }
});

router.post('/:player_id/topup', async (req, res, next) => {
  try {
    const id = playerIdFrom(req.params.player_id);
    const { amount } = req.body ?? {};
    if (!Number.isInteger(amount) || amount <= 0) throw new HttpError(400, 'Amount harus bilangan bulat lebih dari 0');
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new HttpError(404, 'Player tidak ditemukan');
    const updated = await prisma.player.update({ where: { id }, data: { diamond: { increment: amount } } });
    res.json({ status: true, message: 'Top up Diamond berhasil', data: { amount, diamond: updated.diamond } });
  } catch (error) { next(error); }
});

router.post('/:player_id/matches', async (req, res, next) => {
  try {
    const id = playerIdFrom(req.params.player_id);
    const { result } = req.body ?? {};
    if (result !== 'WIN' && result !== 'LOSE') throw new HttpError(400, 'Result harus WIN atau LOSE');
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new HttpError(404, 'Player tidak ditemukan');
    const bpEarned = result === 'WIN' ? 300 : 100;
    const updated = await prisma.player.update({ where: { id }, data: { bp: { increment: bpEarned } } });
    res.json({ status: true, message: 'Match berhasil dicatat', data: { result, bpEarned, bp: updated.bp } });
  } catch (error) { next(error); }
});

router.post(':/player_id/heroes', async(req, res, next) => {
    try{
      const playerId = playerIdFrom(req.params.player_id);

      const {heroId, currency} = req.body ?? {};

      if(!Number.isInteger(heroId) || heroId <= 0){
        throw new HttpError(400, 'Hero ID tidak valid')
      }

      if(currency !== Currency.BP && currency !== Currency.DIAMOND){
        throw new HttpError(400, 'Currency harus BP atau DIAMOND');
      }

      //3. transaksi database
      const result = await prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
          where: { id: playerId },
        });//periksa player
        if (!player) {
          throw new HttpError(404, 'Player tidak ditemukan');
        }

        // Periksa Hero
        const hero = await tx.hero.findUnique({
          where: { id: heroId },
        });
        if (!hero) {
          throw new HttpError(404, 'Hero tidak ditemukan');
        }

        const existing = await tx.playerHero.findUnique({
          where: {
            playerId_heroId: {
              playerId,
              heroId,
            },
          },
        });

        if (existing) {
          throw new HttpError(
            409,
            'Player sudah memiliki Hero ini'
          );
      }

     //4. Tentukan harga berdasarkan currency 
      const price = currency === Currency.BP ? hero.priceBP : hero.priceDiamond;

      if (price === null || price === undefined) {
        throw new HttpError(
          400,
          `Hero tidak tersedia untuk pembelian ${currency}`
        );
      }

       //5. kurangin saldo secara kondisional
    const debit = currency === Currency.BP
          ? await tx.player.updateMany({
              where: {
                id: playerId,
                bp: { gte: price },
              },
              data: {
                bp: { decrement: price },
              },
            })
          : await tx.player.updateMany({
              where: {
                id: playerId,
                diamond: { gte: price },
              },
              data: {
                diamond: { decrement: price },
              },
            });

      if (debit.count === 0) {
        throw new HttpError(
          400,
          `Saldo ${currency} tidak mencukupi`
        );
      }

      // 6. Simpan kepemilikan Hero
      const ownership = await tx.playerHero.create({
        data: {
          playerId,
          heroId,
          currency,
          pricePaid: price,
        },
        include: {
          hero: true,
        },
      });

      // 7. Ambil saldo terbaru
      const updatedPlayer = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          nickname: true,
          bp: true,
          diamond: true,
        },
      });

      return {
          ownership,
          player: updatedPlayer,
        };
      });

      // 8. Response berhasil
      res.status(201).json({
        status: true,
        message: 'Hero berhasil dibeli',
        data: result,
      });
      
    }catch (error) {
    next(error);
  }
});

export default router;
