import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

app.use(cors());
app.use(express.json());

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Zod Schemas
const OrganizationSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1)
});

const FunctionalProfileSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1)
});

const AgentSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  originOrgId: z.number(),
  profileId: z.number(),
  keyCompetencies: z.string().optional().nullable(),
  workingHours: z.number().default(40),
  availableForRotation: z.boolean().default(true),
  interviewDate: z.string().or(z.date()).transform(val => new Date(val))
});

const PositionSchema = z.object({
  id: z.string(),
  requestingOrgId: z.number(),
  requestingArea: z.string(),
  profileRequiredId: z.number(),
  mainFunctions: z.string().optional().nullable(),
  hoursRequired: z.number().default(40),
  requestDate: z.string().or(z.date()).transform(val => new Date(val)),
  status: z.enum(['Abierta', 'Cubierta', 'Desierta']).default('Abierta')
});

// Auth Endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Endpoints
// Organizations
app.get('/api/organizations', authenticateToken, async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({ orderBy: { name: 'asc' } });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching organizations' });
  }
});

app.post('/api/organizations', authenticateToken, async (req, res) => {
  try {
    const data = OrganizationSchema.parse(req.body);
    const org = await prisma.organization.upsert({
      where: { id: data.id || 0 },
      update: { name: data.name },
      create: { name: data.name },
    });
    res.json(org);
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.delete('/api/organizations/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.organization.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Cannot delete organization, it might be in use.' });
  }
});

// Functional Profiles
app.get('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await prisma.functionalProfile.findMany({ orderBy: { name: 'asc' } });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profiles' });
  }
});

app.post('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const data = FunctionalProfileSchema.parse(req.body);
    const profile = await prisma.functionalProfile.upsert({
      where: { id: data.id || 0 },
      update: { name: data.name },
      create: { name: data.name },
    });
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.delete('/api/profiles/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.functionalProfile.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Cannot delete profile, it might be in use.' });
  }
});

// Main Endpoints
app.get('/api/agents', authenticateToken, async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { originOrg: true, profile: true }
    });
    // Format dates back to YYYY-MM-DD for the frontend
    const formattedAgents = agents.map(agent => ({
      ...agent,
      originOrg: agent.originOrg.name,
      profile: agent.profile.name,
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

app.post('/api/agents', authenticateToken, async (req, res) => {
  try {
    const data = AgentSchema.parse(req.body);
    const agent = await prisma.agent.upsert({
      where: { id: data.id },
      update: data,
      create: data,
      include: { originOrg: true, profile: true }
    });
    res.json({
      ...agent,
      originOrg: agent.originOrg.name,
      profile: agent.profile.name,
      interviewDate: agent.interviewDate instanceof Date
        ? agent.interviewDate.toISOString().split('T')[0]
        : String(agent.interviewDate).split('T')[0]
    });
  } catch (error) {
    console.error('Error in POST /api/agents:', error);
    res.status(400).json({ error });
  }
});

app.get('/api/positions', authenticateToken, async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      include: { requestingOrg: true, profileRequired: true }
    });
    const formattedPositions = positions.map(pos => ({
      ...pos,
      requestingOrg: pos.requestingOrg.name,
      profileRequired: pos.profileRequired.name,
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

app.post('/api/positions', authenticateToken, async (req, res) => {
  try {
    const data = PositionSchema.parse(req.body);
    const position = await prisma.position.upsert({
      where: { id: data.id },
      update: data,
      create: data,
      include: { requestingOrg: true, profileRequired: true }
    });
    res.json({
      ...position,
      requestingOrg: position.requestingOrg.name,
      profileRequired: position.profileRequired.name,
      requestDate: position.requestDate instanceof Date
        ? position.requestDate.toISOString().split('T')[0]
        : String(position.requestDate).split('T')[0]
    });
  } catch (error) {
    console.error('Error in POST /api/positions:', error);
    res.status(400).json({ error });
  }
});

app.post('/api/matching', authenticateToken, async (req, res) => {
  try {
    const { positionId } = req.body;

    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { requestingOrg: true, profileRequired: true }
    });
    const agents = await prisma.agent.findMany({
      include: { originOrg: true, profile: true }
    });

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
    - Organismo: ${position.requestingOrg.name}
    - Área: ${position.requestingArea}
    - Perfil: ${position.profileRequired.name}
    - Funciones: ${position.mainFunctions}
    - Horas: ${position.hoursRequired}

    AGENTES DISPONIBLES:
    ${agents.map(a => `- ID: ${a.id}, Nombre: ${a.fullName}, Perfil: ${a.profile.name}, Competencias: ${a.keyCompetencies}, Horas: ${a.workingHours}`).join('\n')}
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
