import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { initSocketIO } from './socket.js';

import { dashboardRouter } from './routes/dashboard.js';
import { roomsRouter } from './routes/rooms.js';
import { devicesRouter } from './routes/devices.js';
import { sensorsRouter } from './routes/sensors.js';
import { energyRouter } from './routes/energy.js';
import { recommendationsRouter } from './routes/recommendations.js';
import { assistantRouter } from './routes/assistant.js';
import { eventsRouter } from './routes/events.js';
import { homeStateRouter } from './routes/homeState.js';
import { simulatorRouter } from './routes/simulator.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initSocketIO(io);

// API Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/energy', energyRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/events', eventsRouter);
app.use('/api/home-state', homeStateRouter);
app.use('/api/simulator', simulatorRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'HomeSense AI Intelligence Layer',
    timestamp: new Date().toISOString(),
    edgePrivacy: 'Active',
  });
});

import path from 'path';
import fs from 'fs';

// Static client hosting support in production
const candidatePaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'dist'),
];
const clientDistPath = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`🏠 HomeSense AI Server listening on http://localhost:${port}`);
  if (clientDistPath) {
    console.log(`🌐 Serving Web Frontend from: ${clientDistPath}`);
  }
  console.log(`⚡ Privacy-First Edge Decision Engine Active`);
});
