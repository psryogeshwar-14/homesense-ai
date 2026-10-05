import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HomeSense AI database seeding...');

  // Clean existing data
  await prisma.deviceEvent.deleteMany({});
  await prisma.sensorReading.deleteMany({});
  await prisma.anomalyLog.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.device.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.homeState.deleteMany({});

  // 1. Create Home State
  await prisma.homeState.create({
    data: {
      id: 'global',
      isOccupied: true,
      mode: 'HOME',
    },
  });

  // 2. Create Rooms
  const livingRoom = await prisma.room.create({
    data: {
      name: 'Living Room',
      floor: 1,
    },
  });

  const bedroom = await prisma.room.create({
    data: {
      name: 'Bedroom',
      floor: 1,
    },
  });

  const studyRoom = await prisma.room.create({
    data: {
      name: 'Study Room',
      floor: 1,
    },
  });

  const kitchen = await prisma.room.create({
    data: {
      name: 'Kitchen & Entrance',
      floor: 1,
    },
  });

  // 3. Create Devices
  const lrLight = await prisma.device.create({
    data: {
      name: 'Living Room Main Light',
      type: 'LIGHT',
      roomId: livingRoom.id,
      isOnline: true,
      powerState: true,
      powerWatts: 60,
      brightness: 80,
    },
  });

  const lrTv = await prisma.device.create({
    data: {
      name: 'Living Room Television',
      type: 'TV',
      roomId: livingRoom.id,
      isOnline: true,
      powerState: false,
      powerWatts: 120,
    },
  });

  const lrPlug = await prisma.device.create({
    data: {
      name: 'Living Room AC Smart Plug',
      type: 'SMART_PLUG',
      roomId: livingRoom.id,
      isOnline: true,
      powerState: false,
      powerWatts: 1500,
    },
  });

  const brFan = await prisma.device.create({
    data: {
      name: 'Bedroom Ceiling Fan',
      type: 'FAN',
      roomId: bedroom.id,
      isOnline: true,
      powerState: true,
      powerWatts: 75,
      speed: 'high',
    },
  });

  const brLight = await prisma.device.create({
    data: {
      name: 'Bedroom Ambient Light',
      type: 'LIGHT',
      roomId: bedroom.id,
      isOnline: true,
      powerState: false,
      powerWatts: 40,
      brightness: 40,
    },
  });

  const studyLight = await prisma.device.create({
    data: {
      name: 'Study Desk Light',
      type: 'LIGHT',
      roomId: studyRoom.id,
      isOnline: true,
      powerState: false,
      powerWatts: 30,
      brightness: 70,
    },
  });

  const studyFan = await prisma.device.create({
    data: {
      name: 'Study Ceiling Fan',
      type: 'FAN',
      roomId: studyRoom.id,
      isOnline: true,
      powerState: false,
      powerWatts: 70,
      speed: 'medium',
    },
  });

  const kitchenLight = await prisma.device.create({
    data: {
      name: 'Kitchen Light',
      type: 'LIGHT',
      roomId: kitchen.id,
      isOnline: true,
      powerState: false,
      powerWatts: 45,
      brightness: 100,
    },
  });

  const mainDoor = await prisma.device.create({
    data: {
      name: 'Main Entrance Door',
      type: 'DOOR',
      roomId: kitchen.id,
      isOnline: true,
      powerState: true, // locked
      powerWatts: 10,
    },
  });

  const kitchenPlug = await prisma.device.create({
    data: {
      name: 'Kitchen Oven Smart Plug',
      type: 'SMART_PLUG',
      roomId: kitchen.id,
      isOnline: true,
      powerState: false,
      powerWatts: 1200,
    },
  });

  // 4. Create Initial Sensors
  const now = new Date();
  const rooms = [livingRoom, bedroom, studyRoom, kitchen];

  for (const room of rooms) {
    await prisma.sensorReading.create({
      data: {
        roomId: room.id,
        sensorType: 'MOTION',
        value: room.name === 'Living Room' ? 1 : 0,
        unit: 'bool',
        recordedAt: now,
      },
    });

    await prisma.sensorReading.create({
      data: {
        roomId: room.id,
        sensorType: 'TEMPERATURE',
        value: 23.5 + Math.random() * 2,
        unit: '°C',
        recordedAt: now,
      },
    });

    await prisma.sensorReading.create({
      data: {
        roomId: room.id,
        sensorType: 'HUMIDITY',
        value: 48 + Math.random() * 8,
        unit: '%',
        recordedAt: now,
      },
    });
  }

  // Door sensor reading (0 = closed, 1 = open)
  await prisma.sensorReading.create({
    data: {
      roomId: kitchen.id,
      sensorType: 'DOOR',
      value: 0,
      unit: 'bool',
      recordedAt: now,
    },
  });

  // 5. Generate 7-day Historical Energy Readings
  console.log('Generating 7-day baseline energy readings...');
  const baseWattsByHour = [
    120, 110, 100, 95, 105, 140, 280, 450, 320, 210, 190, 220, 260, 240, 210, 230,
    310, 480, 650, 720, 580, 420, 280, 160,
  ];

  for (let d = 7; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      if (d === 0 && h > now.getHours()) continue; // don't generate future today

      const timestamp = new Date(now.getTime() - (d * 24 * 3600 * 1000) + (h * 3600 * 1000));
      const variation = (Math.random() - 0.5) * 40;
      const powerVal = Math.max(50, baseWattsByHour[h] + variation);

      // Distribute across rooms
      await prisma.sensorReading.create({
        data: {
          roomId: livingRoom.id,
          sensorType: 'POWER',
          value: Math.round(powerVal * 0.4),
          unit: 'W',
          recordedAt: timestamp,
        },
      });

      await prisma.sensorReading.create({
        data: {
          roomId: bedroom.id,
          sensorType: 'POWER',
          value: Math.round(powerVal * 0.3),
          unit: 'W',
          recordedAt: timestamp,
        },
      });

      await prisma.sensorReading.create({
        data: {
          roomId: studyRoom.id,
          sensorType: 'POWER',
          value: Math.round(powerVal * 0.15),
          unit: 'W',
          recordedAt: timestamp,
        },
      });

      await prisma.sensorReading.create({
        data: {
          roomId: kitchen.id,
          sensorType: 'POWER',
          value: Math.round(powerVal * 0.15),
          unit: 'W',
          recordedAt: timestamp,
        },
      });
    }
  }

  // 6. Create Initial Recommendations
  await prisma.recommendation.create({
    data: {
      title: 'Reduce Bedroom Fan Runtime',
      reason:
        'The bedroom fan has consumed 18% more energy than usual this week. Reducing its overnight runtime by one hour could save approximately ₹140 this month.',
      action: 'TURN_OFF',
      deviceId: brFan.id,
      confidence: 0.89,
      status: 'PENDING',
      category: 'ENERGY',
      savingsEst: 140,
    },
  });

  await prisma.recommendation.create({
    data: {
      title: 'Switch Off Unoccupied Living Room Light',
      reason:
        'No motion detected for 22 minutes in Living Room while main light remains active at 60W.',
      action: 'TURN_OFF',
      deviceId: lrLight.id,
      confidence: 0.94,
      status: 'PENDING',
      category: 'ENERGY',
      savingsEst: 95,
    },
  });

  // 7. Create Seed Timeline Events
  const events = [
    {
      deviceId: lrLight.id,
      action: 'TURN_ON',
      source: 'USER',
      approved: true,
      details: 'Living room light turned on via app',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    },
    {
      deviceId: brFan.id,
      action: 'SET_SPEED',
      source: 'USER',
      approved: true,
      details: 'Bedroom fan set to high speed',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      deviceId: lrLight.id,
      action: 'SUGGEST_OFF',
      source: 'AI_RECOMMENDATION',
      approved: false,
      details: 'AI suggested switching off living room light due to 20m vacancy',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
  ];

  for (const ev of events) {
    await prisma.deviceEvent.create({ data: ev });
  }

  console.log('✅ HomeSense AI database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
