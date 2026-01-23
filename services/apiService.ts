import { Agent, PositionRequest } from '../types';

const API_URL = 'http://localhost:3001/api';

export const getAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_URL}/agents`);
  return response.json();
};

export const saveAgent = async (agent: Agent): Promise<Agent> => {
  const response = await fetch(`${API_URL}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  return response.json();
};

export const getPositions = async (): Promise<PositionRequest[]> => {
  const response = await fetch(`${API_URL}/positions`);
  return response.json();
};

export const savePosition = async (position: PositionRequest): Promise<PositionRequest> => {
  const response = await fetch(`${API_URL}/positions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(position),
  });
  return response.json();
};

export const getSmartMatches = async (positionId: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/matching`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionId }),
  });
  return response.json();
};
