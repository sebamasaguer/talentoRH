
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Agent, PositionRequest, AgentStatus } from '../types';

interface DashboardProps {
  agents: Agent[];
  positions: PositionRequest[];
}

const Dashboard: React.FC<DashboardProps> = ({ agents, positions }) => {
  const profileStats = [
    { name: 'Administrativo', count: agents.filter(a => a.profile === 'Administrativo').length },
    { name: 'Mantenimiento', count: agents.filter(a => a.profile === 'Mantenimiento').length },
    { name: 'Profesional', count: agents.filter(a => a.profile === 'Profesional').length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Agentes Disponibles</p>
          <h3 className="text-3xl font-bold mt-1">{agents.filter(a => a.status === AgentStatus.AVAILABLE).length}</h3>
          <p className="text-blue-600 text-xs mt-2 font-semibold">{agents.length} agentes totales</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Búsquedas Abiertas</p>
          <h3 className="text-3xl font-bold mt-1">{positions.filter(p => p.status === 'Abierta').length}</h3>
          <p className="text-blue-600 text-xs mt-2 font-semibold">{positions.length} totales</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Matchings Posibles</p>
          <h3 className="text-3xl font-bold mt-1">{agents.length * positions.length}</h3>
          <p className="text-slate-400 text-xs mt-2 italic">Basado en perfiles compatibles</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Tasa de Cobertura</p>
          <h3 className="text-3xl font-bold mt-1">
            {positions.length > 0 ? Math.round((positions.filter(p => p.status === 'Cubierta').length / positions.length) * 100) : 0}%
          </h3>
          <p className="text-orange-500 text-xs mt-2 font-semibold">Objetivo: 85%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-800">Distribución de Perfiles (Oferta)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profileStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {profileStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-800">Alertas de Urgencia</h4>
          <div className="space-y-4">
            {positions.filter(p => p.status === 'Abierta').slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4 border-red-500">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{p.requestingOrg}</p>
                  <p className="text-xs text-slate-500">{p.requestingArea} - {p.profileRequired}</p>
                </div>
                <div className="text-right">
                   <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Urgente</span>
                   <p className="text-[10px] text-slate-400 mt-1">{p.requestDate}</p>
                </div>
              </div>
            ))}
            {positions.filter(p => p.status === 'Abierta').length === 0 && (
              <p className="text-slate-500 italic text-sm text-center py-8">No hay búsquedas abiertas actualmente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
