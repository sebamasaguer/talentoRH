
export interface Organization {
  id: number;
  name: string;
}

export interface FunctionalProfile {
  id: number;
  name: string;
}

export enum PositionStatus {
  OPEN = 'Abierta',
  FILLED = 'Cubierta',
  VOID = 'Desierta'
}

export interface Agent {
  id: string;
  fullName: string;
  originOrgId: number;
  originOrg?: string; // For display
  profileId: number;
  profile?: string; // For display
  keyCompetencies: string;
  workingHours: number;
  availableForRotation: boolean;
  interviewDate: string;
}

export interface PositionRequest {
  id: string;
  requestingOrgId: number;
  requestingOrg?: string; // For display
  requestingArea: string;
  profileRequiredId: number;
  profileRequired?: string; // For display
  mainFunctions: string;
  hoursRequired: number;
  requestDate: string;
  status: PositionStatus;
}

export interface MatchingResult {
  agentId: string;
  score: number;
  reasoning: string;
}
