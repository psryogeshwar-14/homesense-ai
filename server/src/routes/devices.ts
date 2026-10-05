import { Router } from 'express';
import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';

export const devicesRouter = Router();

devicesRouter.get('/', async (_req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: { room: true },
      orderBy: { name: 'asc' },
    });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

devicesRouter.post('/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const device = await prisma.device.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const newPowerState = !device.powerState;
    const updated = await prisma.device.update({
      where: { id },
      data: {
        powerState: newPowerState,
      },
      include: { room: true },
    });

    // Record device event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: id,
        action: newPowerState ? 'TURN_ON' : 'TURN_OFF',
        source: 'USER',
        approved: true,
        details: `${device.name} was turned ${newPowerState ? 'ON' : 'OFF'} by user`,
      },
    });

    broadcastEvent('device:updated', updated);
    broadcastEvent('event:created', {
      ...event,
      type: 'DEVICE_ACTION',
      device: updated,
    });

    // Re-evaluate context
    const anomaly = await evaluateHomeContext();
    broadcastEvent('context:updated', anomaly);

    res.json({ success: true, device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle device' });
  }
});

devicesRouter.post('/:id/control', async (req, res) => {
  const { id } = req.params;
  const { powerState, brightness, speed, powerWatts } = req.body;

  try {
    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Device not found' });

    const updated = await prisma.device.update({
      where: { id },
      data: {
        ...(powerState !== undefined ? { powerState } : {}),
        ...(brightness !== undefined ? { brightness } : {}),
        ...(speed !== undefined ? { speed } : {}),
        ...(powerWatts !== undefined ? { powerWatts } : {}),
      },
      include: { room: true },
    });

    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: id,
        action: 'UPDATE_STATE',
        source: 'USER',
        approved: true,
        details: `${updated.name} updated: ${brightness ? `brightness ${brightness}%` : ''} ${speed ? `speed ${speed}` : ''}`,
      },
    });

    broadcastEvent('device:updated', updated);
    broadcastEvent('event:created', {
      ...event,
      type: 'DEVICE_ACTION',
      device: updated,
    });

    res.json({ success: true, device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to control device' });
  }
});
