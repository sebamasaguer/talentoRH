import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Zod Schemas
const AgentSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  originOrg: z.string(),
  profile: z.enum(['Administrativo', 'Mantenimiento', 'Profesional']),
  keyCompetencies: z.string().optional().nullable(),
  workingHours: z.number().default(40),
  availableForRotation: z.boolean().default(true),
  interviewDate: z.string().or(z.date()).transform(val => new Date(val))
});

const PositionSchema = z.object({
  id: z.string(),
  requestingOrg: z.string(),
  requestingArea: z.string(),
  profileRequired: z.enum(['Administrativo', 'Mantenimiento', 'Profesional']),
  mainFunctions: z.string().optional().nullable(),
  hoursRequired: z.number().default(40),
  requestDate: z.string().or(z.date()).transform(val => new Date(val)),
  status: z.enum(['Abierta', 'Cubierta', 'Desierta']).default('Abierta')
});

// Endpoints
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany();
    // Format dates back to YYYY-MM-DD for the frontend
    const formattedAgents = agents.map(agent => ({
      ...agent,
      interviewDate: agent.interviewDate instanceof Date
        ? agent.interviewDate.toISOString().split('T')[0]
        : String(agent.interviewDate).split('T')[0]
    }));
    res.json(formattedAgents);
  } catch (error) {
    console.error('Error in GET /api/agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/agents', async (req, res) => {
  console.log('POST /api/agents request body:', req.body);
  try {
    const data = AgentSchema.parse(req.body);
    const agent = await prisma.agent.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
    res.json({
      ...agent,
      interviewDate: agent.interviewDate instanceof Date
        ? agent.interviewDate.toISOString().split('T')[0]
        : String(agent.interviewDate).split('T')[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error in POST /api/agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const positions = await prisma.position.findMany();
    const formattedPositions = positions.map(pos => ({
      ...pos,
      requestDate: pos.requestDate instanceof Date
        ? pos.requestDate.toISOString().split('T')[0]
        : String(pos.requestDate).split('T')[0]
    }));
    res.json(formattedPositions);
  } catch (error) {
    console.error('Error in GET /api/positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/positions', async (req, res) => {
  console.log('POST /api/positions request body:', req.body);
  try {
    const data = PositionSchema.parse(req.body);
    const position = await prisma.position.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
    res.json({
      ...position,
      requestDate: position.requestDate instanceof Date
        ? position.requestDate.toISOString().split('T')[0]
        : String(position.requestDate).split('T')[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error in POST /api/positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/matching', async (req, res) => {
  try {
    const { positionId } = req.body;

    const position = await prisma.position.findUnique({ where: { id: positionId } });
    const agents = await prisma.agent.findMany();

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como un experto en Recursos Humanos. Analiza el siguiente pedido de puesto y la lista de agentes disponibles para reubicación.
    Evalúa la compatibilidad basándote en el perfil funcional, competencias y carga horaria.
    Genera una lista de los 3 mejores candidatos indicando un puntaje de compatibilidad (0-100) y una breve justificación.

    PUESTO SOLICITADO:
    - Organismo: ${position.requestingOrg}
    - Área: ${position.requestingArea}
    - Perfil: ${position.profileRequired}
    - Funciones: ${position.mainFunctions}
    - Horas: ${position.hoursRequired}

    AGENTES DISPONIBLES:
    ${agents.map(a => `- ID: ${a.id}, Nombre: ${a.fullName}, Perfil: ${a.profile}, Competencias: ${a.keyCompetencies}, Horas: ${a.workingHours}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentId: { type: Type.STRING },
              fullName: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["agentId", "fullName", "score", "reasoning"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || '[]'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing with AI' });
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:');
    console.error(error);
    process.exit(1);
  }
}

main();
