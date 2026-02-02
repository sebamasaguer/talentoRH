
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AgentForm from './components/AgentForm';
import PositionForm from './components/PositionForm';
import SmartMatching from './components/SmartMatching';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { Agent, PositionRequest, PositionStatus, AgentStatus, MatchRecord } from './types';
import { getAgents, getPositions, saveAgent, savePosition, getMatches, deleteMatch } from './services/apiService';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'supply' | 'demand' | 'matching' | 'matches' | 'admin'>('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [positions, setPositions] = useState<PositionRequest[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [agentsData, positionsData, matchesData] = await Promise.all([
        getAgents(),
        getPositions(),
        getMatches()
      ]);
      if (Array.isArray(agentsData)) setAgents(agentsData);
      if (Array.isArray(positionsData)) setPositions(positionsData);
      if (Array.isArray(matchesData)) setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
  const [editingPosition, setEditingPosition] = useState<PositionRequest | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    return agents
      .filter(a => a.status === AgentStatus.AVAILABLE)
      .filter(a =>
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.profile || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.originOrg || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [agents, searchQuery]);

  const filteredPositions = useMemo(() => {
    return positions
      .filter(p => p.status === PositionStatus.OPEN)
      .filter(p =>
        (p.requestingOrg || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.profileRequired || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.requestingArea || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [positions, searchQuery]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m =>
      (m.agentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.requestingOrg || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.requestingArea || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.profileName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [matches, searchQuery]);

  const handleSaveAgent = async (agent: Agent) => {
    try {
      await saveAgent(agent);
      await fetchData();
      setShowAgentForm(false);
      setEditingAgent(undefined);
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  const handleSavePosition = async (pos: PositionRequest) => {
    try {
      await savePosition(pos);
      await fetchData();
      setShowPositionForm(false);
      setEditingPosition(undefined);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este match? El agente volverá a estar disponible y la búsqueda se abrirá nuevamente.')) {
      try {
        await deleteMatch(matchId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('No se pudo eliminar el match.');
      }
    }
  };

  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard agents={agents} positions={positions} />}

      {activeTab === 'supply' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, perfil u organismo..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAgentForm(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <span>+</span> Nueva Entrevista
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">ID / Nombre</th>
                  <th className="px-6 py-4">Organismo Origen</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Competencias</th>
                  <th className="px-6 py-4">Hs / Rot.</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAgents.map(agent => (
                  <tr key={agent.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{agent.fullName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          agent.status === 'Asignado' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{agent.id} • Entrevista: {agent.interviewDate}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{agent.originOrg}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        agent.profile === 'Profesional' ? 'bg-purple-100 text-purple-700' :
                        agent.profile === 'Administrativo' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {agent.profile}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-500 max-w-xs truncate">{agent.keyCompetencies}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{agent.workingHours}hs</p>
                      <p className={`text-[10px] font-bold ${agent.availableForRotation ? 'text-green-600' : 'text-slate-400'}`}>
                        {agent.availableForRotation ? 'DISP. ROTACIÓN' : 'SÓLO ESTÁTICO'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => { setEditingAgent(agent); setShowAgentForm(true); }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAgents.length === 0 && (
              <div className="py-20 text-center text-slate-400">No se encontraron agentes.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'demand' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por organismo, área o perfil..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowPositionForm(true)}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <span>+</span> Cargar Pedido
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">ID / Organismo</th>
                  <th className="px-6 py-4">Área</th>
                  <th className="px-6 py-4">Perfil Req.</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4">Fecha Solicitud</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPositions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{pos.requestingOrg}</p>
                      <p className="text-xs text-slate-400">{pos.id}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{pos.requestingArea}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-semibold">{pos.profileRequired}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{pos.hoursRequired} HORAS SEM.</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        pos.status === PositionStatus.OPEN ? 'bg-green-100 text-green-700' :
                        pos.status === PositionStatus.FILLED ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pos.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{pos.requestDate}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => { setEditingPosition(pos); setShowPositionForm(true); }}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPositions.length === 0 && (
              <div className="py-20 text-center text-slate-400">No hay búsquedas cargadas.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'matching' && (
        <SmartMatching
          agents={agents}
          positions={positions}
          onMatchSuccess={fetchData}
        />
      )}

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Buscar por agente, organismo o área..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Agente</th>
                  <th className="px-6 py-4">Puesto Asignado</th>
                  <th className="px-6 py-4">Fecha Match</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4">Justificación</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMatches.map(match => (
                  <tr key={match.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{match.agentName}</p>
                      <p className="text-xs text-slate-500">{match.profileName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{match.requestingOrg}</p>
                      <p className="text-xs text-slate-500">{match.requestingArea}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {match.matchDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold">
                        {match.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-500 max-w-xs truncate" title={match.reasoning}>
                        {match.reasoning}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMatches.length === 0 && (
              <div className="py-20 text-center text-slate-400">No hay matches confirmados.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <AdminPanel />
      )}

      {/* Forms Modals */}
      {showAgentForm && (
        <AgentForm 
          onSave={handleSaveAgent} 
          onCancel={() => { setShowAgentForm(false); setEditingAgent(undefined); }}
          initialData={editingAgent}
        />
      )}
      
      {showPositionForm && (
        <PositionForm 
          onSave={handleSavePosition} 
          onCancel={() => { setShowPositionForm(false); setEditingPosition(undefined); }}
          initialData={editingPosition}
        />
      )}
    </Layout>
  );
};

export default App;
