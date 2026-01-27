import { Agent, PositionRequest, Organization, FunctionalProfile, AuthResponse } from '../types';

const API_URL = 'http://localhost:3001/api';

let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    setAuthToken(null);
    window.location.reload();
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  setAuthToken(data.token);
  return data;
};

export const logout = () => {
  setAuthToken(null);
  window.location.reload();
};

export const getAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_URL}/agents`, { headers: getHeaders() });
  return handleResponse(response);
};

export const saveAgent = async (agent: Agent): Promise<Agent> => {
  const response = await fetch(`${API_URL}/agents`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(agent),
  });
  return handleResponse(response);
};

export const getPositions = async (): Promise<PositionRequest[]> => {
  const response = await fetch(`${API_URL}/positions`, { headers: getHeaders() });
  return handleResponse(response);
};

export const savePosition = async (position: PositionRequest): Promise<PositionRequest> => {
  const response = await fetch(`${API_URL}/positions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(position),
  });
  return handleResponse(response);
};

export const getSmartMatches = async (positionId: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/matching`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ positionId }),
  });
  return handleResponse(response);
};

// Admin Services
export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch(`${API_URL}/organizations`, { headers: getHeaders() });
  return handleResponse(response);
};

export const saveOrganization = async (org: Partial<Organization>): Promise<Organization> => {
  const response = await fetch(`${API_URL}/organizations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(org),
  });
  return handleResponse(response);
};

export const deleteOrganization = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/organizations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getProfiles = async (): Promise<FunctionalProfile[]> => {
  const response = await fetch(`${API_URL}/profiles`, { headers: getHeaders() });
  return handleResponse(response);
};

export const saveProfile = async (profile: Partial<FunctionalProfile>): Promise<FunctionalProfile> => {
  const response = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(profile),
  });
  return handleResponse(response);
};

export const deleteProfile = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/profiles/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};
