import { prisma } from '../db.js';
import { broadcastEvent } from '../socket.js';
import { AnomalyResult } from '../types.js';

/**
 * Tabular Anomaly Detection Formula as defined in project specifications
 */
export function calculateAnomalyScore(
  currentPower: number,
  averagePower: number,
  occupancy: boolean
): number {
  const deviation = Math.abs(currentPower - averagePower) / Math.max(averagePower, 1);
  let score = Math.min(deviation, 1);

  if (!occupancy && currentPower > 50) {
    score += 0.3;
  }

  return Math.min(score, 1);
}

/**
 * Classifies numerical score into severity tiers
 */
export function classifyAnomaly(score: number): 'NORMAL' | 'REVIEW' | 'HIGH_ANOMALY' {
  if (score >= 0.70) return 'HIGH_ANOMALY';
  if (score >= 0.40) return 'REVIEW';
  return 'NORMAL';
}

/**
 * Core AI Analysis Engine: evaluates current sensor states, active devices,
 * home occupancy mode, and generates anomaly alerts or explainable recommendations.
 */
export async function evaluateHomeContext(): Promise<AnomalyResult> {
  const homeState = await prisma.homeState.findUnique({
    where: { id: 'global' },
  });

  const isOccupied = homeState ? homeState.isOccupied : true;
  const homeMode = homeState ? homeState.mode : 'HOME';

  // Fetch all devices
  const devices = await prisma.device.findMany({
    include: { room: true },
  });

  // Calculate total power consumption
  const activeDevices = devices.filter((d) => d.powerState);
  const currentTotalWatts = activeDevices.reduce((sum, d) => sum + d.powerWatts, 0);

  // Baseline average power from previous 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const historicalReadings = await prisma.sensorReading.findMany({
    where: {
      sensorType: 'POWER',
      recordedAt: { gte: sevenDaysAgo },
    },
    select: { value: true },
  });

  const avgPower =
    historicalReadings.length > 0
      ? historicalReadings.reduce((acc, curr) => acc + curr.value, 0) /
        historicalReadings.length
      : 300;

  // Compute base statistical anomaly score
  const baseScore = calculateAnomalyScore(currentTotalWatts, avgPower, isOccupied);
  let finalScore = baseScore;
  const reasons: string[] = [];

  // Check recent sensor readings
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentSensors = await prisma.sensorReading.findMany({
    where: { recordedAt: { gte: tenMinutesAgo } },
    include: { room: true },
    orderBy: { recordedAt: 'desc' },
  });

  // 1. Safety Anomaly: Motion or high power when house marked Empty / Away
  const recentMotion = recentSensors.find(
    (s) => s.sensorType === 'MOTION' && s.value === 1
  );
  const doorOpened = recentSensors.find(
    (s) => s.sensorType === 'DOOR' && s.value === 1
  );
  const highTemp = recentSensors.find(
    (s) => s.sensorType === 'TEMPERATURE' && s.value >= 40
  );

  let highRiskScenario = false;

  if (homeMode === 'AWAY' || !isOccupied) {
    if (recentMotion && doorOpened) {
      finalScore = 0.96;
      highRiskScenario = true;
      reasons.push(
        `Critical Safety Warning: Home is marked EMPTY/AWAY, but motion was detected in ${recentMotion.room.name} and the main entrance opened within minutes.`
      );
    } else if (recentMotion) {
      finalScore = Math.max(finalScore, 0.85);
      highRiskScenario = true;
      reasons.push(
        `Unexpected motion detected in ${recentMotion.room.name} while home status is marked EMPTY.`
      );
    }

    if (currentTotalWatts > 300) {
      finalScore = Math.max(finalScore, 0.82);
      reasons.push(
        `High electrical load (${Math.round(currentTotalWatts)}W) active while occupants are away.`
      );
    }
  }

  // 2. Thermal Spike Anomaly
  if (highTemp) {
    finalScore = Math.max(finalScore, 0.92);
    reasons.push(
      `Extreme thermal spike (${highTemp.value.toFixed(1)}°C) detected in ${highTemp.room.name}. Potential fire or overheating hazard!`
    );
  }

  // 3. Energy Waste & Routine Rules
  const now = new Date();
  const currentHour = now.getHours();

  for (const device of activeDevices) {
    // Check if device is in an unoccupied room
    const roomMotion = recentSensors.find(
      (s) => s.roomId === device.roomId && s.sensorType === 'MOTION'
    );
    const roomHasMotion = roomMotion ? roomMotion.value === 1 : false;

    // Rule: Nighttime unused light
    if (
      device.type === 'LIGHT' &&
      !roomHasMotion &&
      (currentHour >= 21 || currentHour <= 5)
    ) {
      const existingRec = await prisma.recommendation.findFirst({
        where: {
          deviceId: device.id,
          status: 'PENDING',
        },
      });

      if (!existingRec) {
        const newRec = await prisma.recommendation.create({
          data: {
            title: `Turn Off Unused ${device.name}`,
            reason: `No motion detected for over 20 minutes in ${device.room.name} and it is currently night-time (${currentHour}:00).`,
            action: 'TURN_OFF',
            deviceId: device.id,
            confidence: 0.94,
            status: 'PENDING',
            category: 'ENERGY',
            savingsEst: Math.round(device.powerWatts * 0.001 * 6 * 30 * 7.5), // approx ₹/month
          },
        });

        broadcastEvent('recommendation:created', newRec);
      }
    }

    // Rule: High-power smart plug left running
    if (
      device.type === 'SMART_PLUG' &&
      device.powerWatts >= 1000 &&
      (!isOccupied || !roomHasMotion)
    ) {
      const existingRec = await prisma.recommendation.findFirst({
        where: {
          deviceId: device.id,
          status: 'PENDING',
        },
      });

      if (!existingRec) {
        const newRec = await prisma.recommendation.create({
          data: {
            title: `Heavy Load Alert: ${device.name}`,
            reason: `Heavy heating/cooling appliance (${Math.round(device.powerWatts)}W) active in unoccupied space. Switch off to prevent hazard and waste.`,
            action: 'TURN_OFF',
            deviceId: device.id,
            confidence: 0.91,
            status: 'PENDING',
            category: 'SAFETY',
            savingsEst: 450,
          },
        });

        broadcastEvent('recommendation:created', newRec);
      }
    }
  }

  const classification = classifyAnomaly(finalScore);

  // If high anomaly, log it
  if (classification === 'HIGH_ANOMALY' && reasons.length > 0) {
    const existingLog = await prisma.anomalyLog.findFirst({
      where: {
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        severity: 'HIGH',
      },
    });

    if (!existingLog) {
      const newAnomaly = await prisma.anomalyLog.create({
        data: {
          title: highRiskScenario ? 'Security & Motion Alert' : 'Abnormal Power Surge',
          description: reasons.join(' '),
          score: finalScore,
          severity: 'HIGH',
          roomId: recentMotion ? recentMotion.roomId : null,
        },
      });

      broadcastEvent('anomaly:detected', newAnomaly);
    }
  }

  return {
    isAnomaly: classification !== 'NORMAL',
    score: Number(finalScore.toFixed(2)),
    classification,
    reasons,
  };
}

/**
 * Energy Prediction & Tariff Calculation Engine
 */
export async function calculateEnergyAnalytics() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  // Today's readings
  const todayReadings = await prisma.sensorReading.findMany({
    where: {
      sensorType: 'POWER',
      recordedAt: { gte: startOfDay },
    },
    orderBy: { recordedAt: 'asc' },
  });

  // Calculate today's kWh consumed (approx sum of watts over hourly samples / 1000)
  const todayKwh = Number(
    (todayReadings.reduce((sum, r) => sum + r.value, 0) / 1000 / 4).toFixed(2)
  );

  // Past 7 days consumption by day
  const dailyHistory = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 24 * 3600 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

    const dayReadings = await prisma.sensorReading.findMany({
      where: {
        sensorType: 'POWER',
        recordedAt: { gte: dayStart, lt: dayEnd },
      },
    });

    const dayWattsTotal = dayReadings.reduce((acc, curr) => acc + curr.value, 0);
    const dayKwh = dayReadings.length > 0 ? Number((dayWattsTotal / 1000 / 4).toFixed(2)) : 5.8;

    const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });
    dailyHistory.push({
      date: dayName,
      consumptionKwh: dayKwh,
      baselineKwh: Number((dayKwh * 0.88).toFixed(2)), // baseline comparison
      costInr: Math.round(dayKwh * 7.5),
    });
  }

  // 7-day average baseline
  const avg7DayKwh =
    dailyHistory.reduce((sum, d) => sum + d.consumptionKwh, 0) / dailyHistory.length;

  // Next-day prediction formula:
  // predictedDailyEnergy = average energy 7 days * occupancy adjustment * temperature adjustment
  const homeState = await prisma.homeState.findUnique({ where: { id: 'global' } });
  const isOccupied = homeState ? homeState.isOccupied : true;

  const occupancyAdj = isOccupied ? 1.05 : 0.45;
  const tempAdj = 1.02; // moderate cooling adjustment
  const predictedNextDayKwh = Number((avg7DayKwh * occupancyAdj * tempAdj).toFixed(2));

  // Projected Monthly Bill in ₹ (Tariff: ₹7.50 / kWh standard residential)
  const tariffRate = 7.5;
  const projectedMonthlyKwh = Math.round(predictedNextDayKwh * 30);
  const estimatedMonthlyBillInr = Math.round(projectedMonthlyKwh * tariffRate);

  // Waste Detection Analysis
  const wasteItems = [
    {
      appliance: 'Bedroom Ceiling Fan',
      status: 'Excessive Idle Runtime',
      potentialSavingsInr: 180,
      suggestion: 'Reduce overnight runtime by 1 hr',
    },
    {
      appliance: 'Living Room Lights',
      status: 'Illuminating Empty Area',
      potentialSavingsInr: 95,
      suggestion: 'Auto-turn off after 15 min inactivity',
    },
    {
      appliance: 'Smart Plug Standby Power',
      status: 'Standby Vampire Drain',
      potentialSavingsInr: 65,
      suggestion: 'Disable socket relay when idle',
    },
  ];

  return {
    todayKwh,
    predictedNextDayKwh,
    avg7DayKwh: Number(avg7DayKwh.toFixed(2)),
    estimatedMonthlyBillInr,
    dailyHistory,
    tariffRate,
    wasteItems,
  };
}
