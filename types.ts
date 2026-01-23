
export enum FunctionalProfile {
  ADMIN = 'Administrativo',
  MAINT = 'Mantenimiento',
  PROF = 'Profesional'
}

export enum PositionStatus {
  OPEN = 'Abierta',
  FILLED = 'Cubierta',
  VOID = 'Desierta'
}

export interface Agent {
  id: string;
  fullName: string;
  originOrg: string;
  profile: FunctionalProfile;
  keyCompetencies: string;
  workingHours: number;
  availableForRotation: boolean;
  interviewDate: string;
}

export interface PositionRequest {
  id: string;
  requestingOrg: string;
  requestingArea: string;
  profileRequired: FunctionalProfile;
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
