import { prisma } from '../db.js';
import { AssistantResponse, StructuredAction } from '../types.js';

/**
 * Natural Language Command Processor for HomeSense AI
 * Follows strict privacy-first guardrails:
 * 1. Produces an action plan, NEVER directly executes.
 * 2. Matches only real existing devices in the house.
 * 3. Requires explicit human confirmation.
 */
export async function parseNaturalLanguageCommand(prompt: string): Promise<AssistantResponse> {
  const devices = await prisma.device.findMany({
    include: { room: true },
  });

  const normalized = prompt.toLowerCase().trim();

  // Check if GEMINI_API_KEY is available for LLM inference
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const llmResult = await queryGeminiApi(prompt, devices, apiKey);
      if (llmResult) {
        return validateAndBindDevices(llmResult, devices);
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to local edge NLP engine:', err);
    }
  }

  // Local Edge Semantic & Routine Parser (Runs 100% offline, privacy-first)
  return localEdgeParser(normalized, devices);
}

/**
 * Local deterministic smart pattern parser
 */
function localEdgeParser(prompt: string, devices: any[]): AssistantResponse {
  const actions: StructuredAction[] = [];

  // Find devices by name or type
  const studyLight = devices.find((d) => d.name.toLowerCase().includes('study desk light') || (d.type === 'LIGHT' && d.room.name.toLowerCase().includes('study')));
  const studyFan = devices.find((d) => d.name.toLowerCase().includes('study ceiling fan') || (d.type === 'FAN' && d.room.name.toLowerCase().includes('study')));
  const tv = devices.find((d) => d.type === 'TV');
  const lrLight = devices.find((d) => d.type === 'LIGHT' && d.room.name.toLowerCase().includes('living'));
  const brFan = devices.find((d) => d.type === 'FAN' && d.room.name.toLowerCase().includes('bedroom'));
  const brLight = devices.find((d) => d.type === 'LIGHT' && d.room.name.toLowerCase().includes('bedroom'));
  const kitchenLight = devices.find((d) => d.type === 'LIGHT' && d.room.name.toLowerCase().includes('kitchen'));
  const mainDoor = devices.find((d) => d.type === 'DOOR');

  // Scenario 1: Study routine / Focus session
  if (prompt.includes('study') || prompt.includes('focus') || prompt.includes('homework') || prompt.includes('reading')) {
    if (studyLight) {
      actions.push({
        deviceId: studyLight.id,
        deviceName: studyLight.name,
        action: 'SET_BRIGHTNESS',
        value: 70,
      });
    }
    if (tv) {
      actions.push({
        deviceId: tv.id,
        deviceName: tv.name,
        action: 'TURN_OFF',
        value: null,
      });
    }
    if (studyFan) {
      actions.push({
        deviceId: studyFan.id,
        deviceName: studyFan.name,
        action: 'SET_SPEED',
        value: 'medium',
      });
    }

    return {
      intent: 'CREATE_ROUTINE',
      actions,
      explanation: 'Prepare study room for optimal focus: desk light set to 70% brightness, ceiling fan on medium, and living room television powered off to eliminate distractions.',
      requiresConfirmation: true,
      status: 'PENDING_CONFIRMATION',
    };
  }

  // Scenario 2: Sleep / Night / Bedtime routine
  if (prompt.includes('sleep') || prompt.includes('bedtime') || prompt.includes('good night') || prompt.includes('sleeping')) {
    if (lrLight) actions.push({ deviceId: lrLight.id, deviceName: lrLight.name, action: 'TURN_OFF' });
    if (tv) actions.push({ deviceId: tv.id, deviceName: tv.name, action: 'TURN_OFF' });
    if (kitchenLight) actions.push({ deviceId: kitchenLight.id, deviceName: kitchenLight.name, action: 'TURN_OFF' });
    if (brFan) actions.push({ deviceId: brFan.id, deviceName: brFan.name, action: 'SET_SPEED', value: 'high' });
    if (brLight) actions.push({ deviceId: brLight.id, deviceName: brLight.name, action: 'SET_BRIGHTNESS', value: 20 });
    if (mainDoor) actions.push({ deviceId: mainDoor.id, deviceName: mainDoor.name, action: 'TURN_ON' }); // lock

    return {
      intent: 'CREATE_ROUTINE',
      actions,
      explanation: 'Bedtime routine activated: main lights and TV turned off, main entrance locked, bedroom ambient light dimmed to 20%, and ceiling fan set for cool sleep.',
      requiresConfirmation: true,
      status: 'PENDING_CONFIRMATION',
    };
  }

  // Scenario 3: Leaving home / Away mode
  if (prompt.includes('leave') || prompt.includes('leaving') || prompt.includes('away') || prompt.includes('goodbye')) {
    for (const d of devices) {
      if (d.type === 'LIGHT' || d.type === 'TV' || d.type === 'SMART_PLUG') {
        actions.push({
          deviceId: d.id,
          deviceName: d.name,
          action: 'TURN_OFF',
        });
      }
    }
    if (mainDoor) {
      actions.push({
        deviceId: mainDoor.id,
        deviceName: mainDoor.name,
        action: 'TURN_ON', // locked
      });
    }

    return {
      intent: 'CREATE_ROUTINE',
      actions,
      explanation: 'Eco-Away routine prepared: all active lights, TV, and high-power appliances switched off, and main door secured.',
      requiresConfirmation: true,
      status: 'PENDING_CONFIRMATION',
    };
  }

  // Scenario 4: Specific device controls
  if (prompt.includes('fan')) {
    const targetFan = prompt.includes('bedroom') ? brFan : prompt.includes('study') ? studyFan : brFan;
    const isOff = prompt.includes('off') || prompt.includes('stop');
    if (targetFan) {
      actions.push({
        deviceId: targetFan.id,
        deviceName: targetFan.name,
        action: isOff ? 'TURN_OFF' : 'TURN_ON',
      });
      return {
        intent: 'CONTROL_DEVICE',
        actions,
        explanation: `${isOff ? 'Turn off' : 'Turn on'} ${targetFan.name}.`,
        requiresConfirmation: true,
        status: 'PENDING_CONFIRMATION',
      };
    }
  }

  if (prompt.includes('light')) {
    const isOff = prompt.includes('off');
    const target = prompt.includes('living') ? lrLight : prompt.includes('bedroom') ? brLight : prompt.includes('kitchen') ? kitchenLight : studyLight;
    if (target) {
      actions.push({
        deviceId: target.id,
        deviceName: target.name,
        action: isOff ? 'TURN_OFF' : 'TURN_ON',
      });
      return {
        intent: 'CONTROL_DEVICE',
        actions,
        explanation: `${isOff ? 'Turn off' : 'Turn on'} ${target.name}.`,
        requiresConfirmation: true,
        status: 'PENDING_CONFIRMATION',
      };
    }
  }

  // Fallback for general status or unknown
  return {
    intent: 'UNKNOWN',
    actions: [],
    explanation: `I understood: "${prompt}". For your safety, I recommend specifying a recognized room (Living Room, Bedroom, Study, Kitchen) or routine (e.g., "Prepare study room for a 45-minute session", "Turn off living room light", "Leaving home").`,
    requiresConfirmation: false,
    status: 'INFO_ONLY',
  };
}

/**
 * Validates and binds actions from LLM to real database IDs
 */
function validateAndBindDevices(rawResponse: any, existingDevices: any[]): AssistantResponse {
  const validActions: StructuredAction[] = [];

  if (Array.isArray(rawResponse.actions)) {
    for (const act of rawResponse.actions) {
      const match = existingDevices.find(
        (d) =>
          d.name.toLowerCase() === act.deviceName?.toLowerCase() ||
          d.name.toLowerCase().includes(act.deviceName?.toLowerCase())
      );

      if (match) {
        validActions.push({
          deviceId: match.id,
          deviceName: match.name,
          action: act.action || 'TURN_OFF',
          value: act.value,
        });
      }
    }
  }

  return {
    intent: rawResponse.intent || 'CONTROL_DEVICE',
    actions: validActions,
    explanation: rawResponse.explanation || 'Proposed smart home action plan.',
    requiresConfirmation: validActions.length > 0,
    status: validActions.length > 0 ? 'PENDING_CONFIRMATION' : 'INFO_ONLY',
  };
}

/**
 * Query Google Gemini API via native fetch
 */
async function queryGeminiApi(prompt: string, devices: any[], apiKey: string): Promise<any> {
  const deviceList = devices.map((d) => `${d.name} (${d.type} in ${d.room.name})`).join(', ');

  const systemInstruction = `You are HomeSense AI, a smart-home command parser.
Available devices in the home: [${deviceList}].

Return STRICT JSON only without markdown formatting:
{
  "intent": "CONTROL_DEVICE | CREATE_ROUTINE | QUERY_STATUS | UNKNOWN",
  "actions": [
    {
      "deviceName": "exact name from available devices",
      "action": "TURN_ON | TURN_OFF | SET_BRIGHTNESS | SET_SPEED",
      "value": number or null
    }
  ],
  "explanation": "short explanation"
}

Never invent devices that do not exist.
Never execute actions directly.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser command: "${prompt}"` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const json: any = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return JSON.parse(text);
}
