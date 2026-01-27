import { Agent, PositionRequest, Organization, FunctionalProfile } from '../types';

const API_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

// Admin Services
export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch(`${API_URL}/organizations`);
  return handleResponse(response);
};

export const saveOrganization = async (org: Partial<Organization>): Promise<Organization> => {
  const response = await fetch(`${API_URL}/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(org),
  });
  return handleResponse(response);
};

export const deleteOrganization = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/organizations/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const getProfiles = async (): Promise<FunctionalProfile[]> => {
  const response = await fetch(`${API_URL}/profiles`);
  return handleResponse(response);
};

export const saveProfile = async (profile: Partial<FunctionalProfile>): Promise<FunctionalProfile> => {
  const response = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handleResponse(response);
};

export const deleteProfile = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/profiles/${id}`, {
    method: 'DELETE',
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
