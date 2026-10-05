import { Router } from 'express';
import { prisma } from '../db.js';

export const eventsRouter = Router();

eventsRouter.get('/', async (_req, res) => {
  try {
    // 1. Device events
    const deviceEvents = await prisma.deviceEvent.findMany({
      include: {
        device: {
          include: { room: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    // 2. Anomaly events
    const anomalies = await prisma.anomalyLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // 3. Sensor events (recent motion, door, temp spikes)
    const sensorEvents = await prisma.sensorReading.findMany({
      where: {
        OR: [
          { sensorType: 'MOTION', value: 1 },
          { sensorType: 'DOOR' },
          { sensorType: 'TEMPERATURE', value: { gte: 35 } },
        ],
      },
      include: { room: true },
      orderBy: { recordedAt: 'desc' },
      take: 20,
    });

    // 4. Recommendations
    const recs = await prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // Combine and format into unified explainable timeline
    const timeline = [
      ...deviceEvents.map((e) => ({
        id: `dev-${e.id}`,
        type: e.approved ? 'USER_APPROVAL' : 'DEVICE_ACTION',
        title: `${e.device.name} - ${e.action}`,
        details: e.details || `Source: ${e.source}`,
        timestamp: e.createdAt,
        roomName: e.device.room.name,
        badgeColor: e.approved ? 'emerald' : 'indigo',
        approved: e.approved,
      })),
      ...anomalies.map((a) => ({
        id: `anom-${a.id}`,
        type: 'AI_DETECTION',
        title: a.title,
        details: a.description,
        timestamp: a.createdAt,
        roomName: 'Home Security',
        badgeColor: a.severity === 'HIGH' ? 'rose' : 'amber',
        approved: false,
      })),
      ...sensorEvents.map((s) => ({
        id: `sens-${s.id}`,
        type: 'SENSOR',
        title: `${s.sensorType === 'MOTION' ? 'Motion Detected' : s.sensorType === 'DOOR' ? (s.value === 1 ? 'Door Opened' : 'Door Closed') : 'Temperature Alert'}`,
        details: `Sensor Reading: ${s.value} ${s.unit} in ${s.room.name}`,
        timestamp: s.recordedAt,
        roomName: s.room.name,
        badgeColor: 'sky',
        approved: true,
      })),
      ...recs.map((r) => ({
        id: `rec-${r.id}`,
        type: 'SUGGESTION',
        title: `AI Suggestion: ${r.title}`,
        details: `${r.reason} (Confidence: ${Math.round(r.confidence * 100)}%)`,
        timestamp: r.createdAt,
        roomName: r.category,
        badgeColor: 'violet',
        approved: r.status === 'APPROVED',
      })),
    ];

    // Sort descending by timestamp
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(timeline.slice(0, 40));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch timeline events' });
  }
});
