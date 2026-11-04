import {Router} from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
    try{
        const[totalHeroes, totalSkins, totalPlayers, totalOwnedHeroes, playerBalances, purchasesByCurrency,]
        = await Promise.all([
            prisma.hero.count(), prisma.skin.count(), prisma.player.count(), prisma.playerHero.count(),
            prisma.player.aggregate({
                _sum : {
                    bp: true,
                    diamond: true,
                },
            }),

            prisma.playerHero.groupBy({
                by: ['currency'],
                _count: {
                id: true,
                },
            }),
        ]);

        const bpPurchases = purchasesByCurrency.find((item) => item.currency === 'BP')?._count_id ?? 0;
        const diamondPurchases = purchasesByCurrency.find((item) => item.currency === 'DIAMOND')?._count.id ?? 0;

        // 3. Kirim hasil statistik
        res.status(200).json({
        status: true,
        message: 'Berhasil mengambil statistik',

        data: {
            totalHeroes,
            totalSkins,
            totalPlayers,
            totalOwnedHeroes,

            totalBalance: {
            bp: playerBalances._sum.bp ?? 0,
            diamond: playerBalances._sum.diamond ?? 0,
            },

            purchases: {
            bp: bpPurchases,
            diamond: diamondPurchases,
            total: totalOwnedHeroes,
            },
        },
        });
    } catch (error) {
    next(error);
  }
});

export default router;