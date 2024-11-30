// /api/user.ts
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  if (req.method === 'POST') {
    const { telegramId, username, firstName, lastName, photoUrl } = req.body;

    try {
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: {
          username,
          firstName,
          lastName,
          photoUrl,
        },
        create: {
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'Failed to create/update user' });
    }
  } else if (req.method === 'GET') {
    const { telegramId } = req.query;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
