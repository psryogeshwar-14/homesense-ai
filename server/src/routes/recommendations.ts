import { Router } from 'express';
import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';

export const recommendationsRouter = Router();

const ALLOWED_ACTIONS = ['TURN_OFF', 'TURN_ON', 'SET_BRIGHTNESS', 'REDUCE_SPEED'];

recommendationsRouter.get('/', async (_req, res) => {
  try {
    const recommendations = await prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * Strict 7-Step Backend Approval Implementation
 */
recommendationsRouter.post('/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Recommendation exists
    const rec = await prisma.recommendation.findUnique({ where: { id } });
    if (!rec) {
      return res.status(404).json({ error: 'Check 1 Failed: Recommendation does not exist' });
    }

    // 2. Recommendation is still pending
    if (rec.status !== 'PENDING') {
      return res.status(400).json({
        error: `Check 2 Failed: Recommendation is already ${rec.status}`,
      });
    }

    // 3. Target device exists
    if (!rec.deviceId) {
      return res.status(400).json({ error: 'Check 3 Failed: No target device specified' });
    }
    const device = await prisma.device.findUnique({
      where: { id: rec.deviceId },
      include: { room: true },
    });
    if (!device) {
      return res.status(404).json({ error: 'Check 3 Failed: Target device does not exist' });
    }

    // 4. Action is in an allowed list
    if (!ALLOWED_ACTIONS.includes(rec.action)) {
      return res.status(400).json({
        error: `Check 4 Failed: Action ${rec.action} is not permitted`,
      });
    }

    // 5. User approval is recorded
    const updatedRec = await prisma.recommendation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        resolvedAt: new Date(),
      },
    });

    // 6. Device event is created
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        action: rec.action,
        source: 'AI_RECOMMENDATION',
        approved: true,
        details: `Approved AI recommendation: "${rec.title}" (${rec.reason})`,
      },
    });

    // 7. Device state is updated
    let updatedDeviceData: any = {};
    if (rec.action === 'TURN_OFF') {
      updatedDeviceData = { powerState: false };
    } else if (rec.action === 'TURN_ON') {
      updatedDeviceData = { powerState: true };
    } else if (rec.action === 'SET_BRIGHTNESS') {
      updatedDeviceData = { brightness: 50 };
    } else if (rec.action === 'REDUCE_SPEED') {
      updatedDeviceData = { speed: 'low' };
    }

    const updatedDevice = await prisma.device.update({
      where: { id: device.id },
      data: updatedDeviceData,
      include: { room: true },
    });

    // Real-time broadcasts
    broadcastEvent('recommendation:updated', updatedRec);
    broadcastEvent('device:updated', updatedDevice);
    broadcastEvent('event:created', {
      ...event,
      type: 'USER_APPROVAL',
      device: updatedDevice,
    });

    // Re-evaluate context
    const anomaly = await evaluateHomeContext();
    broadcastEvent('context:updated', anomaly);

    res.json({
      success: true,
      message: 'All 7 security checks passed. Action executed.',
      recommendation: updatedRec,
      device: updatedDevice,
    });
  } catch (error) {
    console.error('Error approving recommendation:', error);
    res.status(500).json({ error: 'Failed to approve recommendation' });
  }
});

recommendationsRouter.post('/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const rec = await prisma.recommendation.findUnique({ where: { id } });
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

    const updated = await prisma.recommendation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
      },
    });

    broadcastEvent('recommendation:updated', updated);
    res.json({ success: true, recommendation: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
});
