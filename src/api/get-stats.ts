// /api/get-stats.ts
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: userId as string },
        select: { cardsProcessed: true },
      });

      const totalCardsProcessed = await prisma.user.aggregate({
        _sum: { cardsProcessed: true },
      });

      const totalUsers = await prisma.user.count();

      if (user) {
        res.status(200).json({
          user,
          global: {
            totalCardsProcessed: totalCardsProcessed._sum.cardsProcessed || 0,
            totalUsers,
          },
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}