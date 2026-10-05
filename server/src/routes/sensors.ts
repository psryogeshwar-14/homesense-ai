import { Router } from 'express';
import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';

export const sensorsRouter = Router();

sensorsRouter.post('/readings', async (req, res) => {
  const { roomId, sensorType, value, unit } = req.body;

  if (!roomId || !sensorType || value === undefined) {
    return res.status(400).json({ error: 'Missing required sensor reading fields' });
  }

  try {
    const reading = await prisma.sensorReading.create({
      data: {
        roomId,
        sensorType,
        value: Number(value),
        unit: unit || '',
      },
      include: { room: true },
    });

    broadcastEvent('sensor:reading', reading);

    // Create a timeline event for significant sensor changes
    if (sensorType === 'MOTION' || sensorType === 'DOOR' || value >= 40) {
      broadcastEvent('event:created', {
        id: reading.id,
        action: sensorType === 'MOTION' ? (value === 1 ? 'MOTION_DETECTED' : 'MOTION_CLEARED') : (value === 1 ? 'DOOR_OPENED' : 'DOOR_CLOSED'),
        source: 'SENSOR',
        approved: true,
        details: `${sensorType} in ${reading.room.name}: ${value} ${unit || ''}`,
        createdAt: reading.recordedAt,
        type: 'SENSOR',
        room: reading.room,
      });
    }

    // Run AI evaluation immediately on new sensor telemetry
    const anomaly = await evaluateHomeContext();
    broadcastEvent('context:updated', anomaly);

    res.status(201).json({ success: true, reading, anomaly });
  } catch (error) {
    console.error('Error creating sensor reading:', error);
    res.status(500).json({ error: 'Failed to record sensor reading' });
  }
});
