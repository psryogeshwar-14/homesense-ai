import { Router } from 'express';
import { prisma } from '../db.js';
import { parseNaturalLanguageCommand } from '../ai/nlp.js';
import { broadcastEvent } from '../socket.js';
import { evaluateHomeContext } from '../ai/engine.js';
import { StructuredAction } from '../types.js';

export const assistantRouter = Router();

assistantRouter.post('/command', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Please provide a command prompt' });
  }

  try {
    const plan = await parseNaturalLanguageCommand(prompt);
    res.json(plan);
  } catch (error) {
    console.error('Error parsing command:', error);
    res.status(500).json({ error: 'Failed to process natural-language command' });
  }
});

assistantRouter.post('/execute', async (req, res) => {
  const { actions, routineName } = req.body;

  if (!Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: 'No actions to execute' });
  }

  try {
    const executedResults = [];

    for (const actionItem of actions as StructuredAction[]) {
      if (!actionItem.deviceId) continue;

      const device = await prisma.device.findUnique({
        where: { id: actionItem.deviceId },
        include: { room: true },
      });

      if (!device) continue;

      let updateData: any = {};
      if (actionItem.action === 'TURN_ON') {
        updateData.powerState = true;
      } else if (actionItem.action === 'TURN_OFF') {
        updateData.powerState = false;
      } else if (actionItem.action === 'SET_BRIGHTNESS' && actionItem.value !== undefined) {
        updateData.powerState = true;
        updateData.brightness = Number(actionItem.value);
      } else if (actionItem.action === 'SET_SPEED' && actionItem.value !== undefined) {
        updateData.powerState = true;
        updateData.speed = String(actionItem.value);
      }

      const updated = await prisma.device.update({
        where: { id: device.id },
        data: updateData,
        include: { room: true },
      });

      const event = await prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          action: actionItem.action,
          source: 'ASSISTANT',
          approved: true,
          details: `Action executed via AI Assistant: ${actionItem.action} on ${device.name}`,
        },
      });

      broadcastEvent('device:updated', updated);
      broadcastEvent('event:created', {
        ...event,
        type: 'DEVICE_ACTION',
        device: updated,
      });

      executedResults.push(updated);
    }

    // Re-evaluate context
    const anomaly = await evaluateHomeContext();
    broadcastEvent('context:updated', anomaly);

    res.json({
      success: true,
      message: `Executed ${executedResults.length} approved actions.`,
      executedDevices: executedResults,
    });
  } catch (error) {
    console.error('Error executing assistant actions:', error);
    res.status(500).json({ error: 'Failed to execute actions' });
  }
});
