import { Agent, PositionRequest } from '../types';

const API_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = `HTTP error! status: ${response.status}`;

    if (errorData.error) {
      if (Array.isArray(errorData.error)) {
        // Handle Zod validation errors
        errorMessage = errorData.error.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      } else if (typeof errorData.error === 'object') {
        errorMessage = JSON.stringify(errorData.error);
      } else {
        errorMessage = errorData.error;
      }
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

export const getAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_URL}/agents`);
  return handleResponse(response);
};

export const saveAgent = async (agent: Agent): Promise<Agent> => {
  const response = await fetch(`${API_URL}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  return handleResponse(response);
};

export const getPositions = async (): Promise<PositionRequest[]> => {
  const response = await fetch(`${API_URL}/positions`);
  return handleResponse(response);
};

export const savePosition = async (position: PositionRequest): Promise<PositionRequest> => {
  const response = await fetch(`${API_URL}/positions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(position),
  });
  return handleResponse(response);
};

export const getSmartMatches = async (positionId: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/matching`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionId }),
  });
  return handleResponse(response);
};
