import { Router } from 'express';
import { prisma } from '../db.js';

export const roomsRouter = Router();

roomsRouter.get('/', async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        devices: true,
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 4,
        },
      },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});
