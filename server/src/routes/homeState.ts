import { Router } from 'express';
import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';

export const homeStateRouter = Router();

homeStateRouter.get('/', async (_req, res) => {
  try {
    let state = await prisma.homeState.findUnique({ where: { id: 'global' } });
    if (!state) {
      state = await prisma.homeState.create({
        data: { id: 'global', isOccupied: true, mode: 'HOME' },
      });
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch home state' });
  }
});

homeStateRouter.post('/mode', async (req, res) => {
  const { mode, isOccupied } = req.body;

  try {
    const updated = await prisma.homeState.upsert({
      where: { id: 'global' },
      update: {
        ...(mode ? { mode } : {}),
        ...(isOccupied !== undefined ? { isOccupied } : mode === 'AWAY' ? { isOccupied: false } : { isOccupied: true }),
      },
      create: {
        id: 'global',
        mode: mode || 'HOME',
        isOccupied: mode === 'AWAY' ? false : true,
      },
    });

    broadcastEvent('homeState:updated', updated);

    // Re-evaluate context with new occupancy mode
    const anomaly = await evaluateHomeContext();
    broadcastEvent('context:updated', anomaly);

    res.json(updated);
  } catch (error) {
    console.error('Error updating home state:', error);
    res.status(500).json({ error: 'Failed to update home mode' });
  }
});
