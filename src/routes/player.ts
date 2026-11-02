import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../middleware.js';

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

export default router;
