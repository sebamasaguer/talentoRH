
import React from 'react';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const MOCK_AGENTS = [
  {
    id: 'A-001',
    fullName: 'Juan Pérez',
    originOrg: 'Ministerio de Economía',
    profile: 'Administrativo',
    keyCompetencies: 'Gestión documental, SAP, Redacción técnica',
    workingHours: 40,
    availableForRotation: true,
    interviewDate: '2023-10-15'
  },
  {
    id: 'A-002',
    fullName: 'María García',
    originOrg: 'Secretaría de Salud',
    profile: 'Profesional',
    keyCompetencies: 'Análisis de datos, Epidemiología, Gestión de Proyectos',
    workingHours: 35,
    availableForRotation: false,
    interviewDate: '2023-11-02'
  }
];

export const MOCK_POSITIONS = [
  {
    id: 'B-100',
    requestingOrg: 'Dirección General de Catastro',
    requestingArea: 'Administración',
    profileRequired: 'Administrativo',
    mainFunctions: 'Atención al público, archivo de expedientes, carga de datos.',
    hoursRequired: 40,
    requestDate: '2023-11-20',
    status: 'Abierta'
  }
];
