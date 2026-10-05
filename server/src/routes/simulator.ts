import { Router } from 'express';
import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';

export const simulatorRouter = Router();

simulatorRouter.post('/scenario', async (req, res) => {
  const { scenarioId } = req.body;

  try {
    const kitchen = await prisma.room.findFirst({ where: { name: { contains: 'Kitchen' } } });
    const study = await prisma.room.findFirst({ where: { name: { contains: 'Study' } } });
    const bedroom = await prisma.room.findFirst({ where: { name: { contains: 'Bedroom' } } });
    const living = await prisma.room.findFirst({ where: { name: { contains: 'Living' } } });

    const now = new Date();

    if (scenarioId === 'empty_house_anomaly') {
      // 1. Mark house as empty / AWAY
      const homeState = await prisma.homeState.upsert({
        where: { id: 'global' },
        update: { mode: 'AWAY', isOccupied: false },
        create: { id: 'global', mode: 'AWAY', isOccupied: false },
      });
      broadcastEvent('homeState:updated', homeState);

      // 2. Simulate motion in kitchen
      if (kitchen) {
        const motionReading = await prisma.sensorReading.create({
          data: {
            roomId: kitchen.id,
            sensorType: 'MOTION',
            value: 1,
            unit: 'bool',
            recordedAt: now,
          },
          include: { room: true },
        });
        broadcastEvent('sensor:reading', motionReading);

        // 3. Open main door
        const doorReading = await prisma.sensorReading.create({
          data: {
            roomId: kitchen.id,
            sensorType: 'DOOR',
            value: 1,
            unit: 'bool',
            recordedAt: new Date(now.getTime() + 1000),
          },
          include: { room: true },
        });
        broadcastEvent('sensor:reading', doorReading);
      }

      // 4. Turn on high power appliance (Kitchen Microwave or AC Smart Plug)
      const heavyPlug = await prisma.device.findFirst({
        where: { type: 'SMART_PLUG' },
      });
      if (heavyPlug) {
        const updatedPlug = await prisma.device.update({
          where: { id: heavyPlug.id },
          data: { powerState: true, powerWatts: 1500 },
          include: { room: true },
        });
        broadcastEvent('device:updated', updatedPlug);
      }

      // 5. Evaluate home context -> triggers High Anomaly
      const anomaly = await evaluateHomeContext();
      broadcastEvent('context:updated', anomaly);

      return res.json({
        success: true,
        message: 'Scenario activated: Home marked EMPTY, kitchen motion & door opened, and high-power appliance switched on. High anomaly security alert generated.',
        anomaly,
      });
    }

    if (scenarioId === 'study_routine') {
      // Prepare study room
      if (study) {
        const motion = await prisma.sensorReading.create({
          data: {
            roomId: study.id,
            sensorType: 'MOTION',
            value: 1,
            unit: 'bool',
            recordedAt: now,
          },
          include: { room: true },
        });
        broadcastEvent('sensor:reading', motion);
      }

      return res.json({
        success: true,
        message: 'Scenario activated: Motion detected in Study Room. Ready for Assistant study command.',
      });
    }

    if (scenarioId === 'night_waste') {
      const homeState = await prisma.homeState.upsert({
        where: { id: 'global' },
        update: { mode: 'NIGHT', isOccupied: true },
        create: { id: 'global', mode: 'NIGHT', isOccupied: true },
      });
      broadcastEvent('homeState:updated', homeState);

      // Turn bedroom fan on
      const fan = await prisma.device.findFirst({
        where: { type: 'FAN', name: { contains: 'Bedroom' } },
      });
      if (fan) {
        const updatedFan = await prisma.device.update({
          where: { id: fan.id },
          data: { powerState: true, speed: 'high' },
          include: { room: true },
        });
        broadcastEvent('device:updated', updatedFan);
      }

      if (bedroom) {
        // Clear motion in bedroom
        await prisma.sensorReading.create({
          data: {
            roomId: bedroom.id,
            sensorType: 'MOTION',
            value: 0,
            unit: 'bool',
            recordedAt: now,
          },
        });
      }

      const anomaly = await evaluateHomeContext();
      broadcastEvent('context:updated', anomaly);

      return res.json({
        success: true,
        message: 'Scenario activated: Night mode, bedroom vacant with fan running. Recommendation generated.',
      });
    }

    if (scenarioId === 'reset') {
      // Reset Home State
      const homeState = await prisma.homeState.upsert({
        where: { id: 'global' },
        update: { mode: 'HOME', isOccupied: true },
        create: { id: 'global', mode: 'HOME', isOccupied: true },
      });
      broadcastEvent('homeState:updated', homeState);

      // Reset devices to sensible defaults
      await prisma.device.updateMany({
        where: { type: 'SMART_PLUG' },
        data: { powerState: false },
      });

      // Reset main door
      const door = await prisma.device.findFirst({ where: { type: 'DOOR' } });
      if (door) {
        await prisma.device.update({
          where: { id: door.id },
          data: { powerState: true },
        });
      }

      // Clear anomalies
      await prisma.anomalyLog.deleteMany({});

      const anomaly = await evaluateHomeContext();
      broadcastEvent('context:updated', anomaly);

      return res.json({
        success: true,
        message: 'System restored to normal home baseline.',
      });
    }

    res.status(400).json({ error: `Unknown scenario: ${scenarioId}` });
  } catch (error) {
    console.error('Error running scenario:', error);
    res.status(500).json({ error: 'Failed to run scenario' });
  }
});
