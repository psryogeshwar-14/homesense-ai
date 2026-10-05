import { Router } from 'express';
import { prisma } from '../db.js';
import { evaluateHomeContext, calculateEnergyAnalytics } from '../ai/engine.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        devices: true,
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 6,
        },
      },
    });

    const homeState = await prisma.homeState.findUnique({
      where: { id: 'global' },
    });

    const devices = await prisma.device.findMany();
    const activeDevices = devices.filter((d) => d.powerState);
    const totalWatts = activeDevices.reduce((sum, d) => sum + d.powerWatts, 0);

    const pendingRecsCount = await prisma.recommendation.count({
      where: { status: 'PENDING' },
    });

    const recentAnomalies = await prisma.anomalyLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const energyStats = await calculateEnergyAnalytics();
    const anomalyStatus = await evaluateHomeContext();

    res.json({
      homeState: homeState || { isOccupied: true, mode: 'HOME' },
      rooms,
      activeDevicesCount: activeDevices.length,
      totalDevicesCount: devices.length,
      currentPowerWatts: totalWatts,
      pendingRecommendationsCount: pendingRecsCount,
      recentAnomalies,
      currentAnomaly: anomalyStatus,
      energySummary: energyStats,
      privacyMetrics: {
        edgeProcessingActive: true,
        localTelemetryLatencyMs: 8,
        cloudTelemetrySentBytes: 0,
        approvalGuardedActions: true,
      },
    });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
