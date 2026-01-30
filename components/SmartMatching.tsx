
import React, { useState, useMemo } from 'react';
import { Agent, PositionRequest, AgentStatus } from '../types';
import { getSmartMatches, createMatch } from '../services/apiService';

interface SmartMatchingProps {
  agents: Agent[];
  positions: PositionRequest[];
  onMatchSuccess: () => void;
}

const SmartMatching: React.FC<SmartMatchingProps> = ({ agents, positions, onMatchSuccess }) => {
  const [selectedPosition, setSelectedPosition] = useState<PositionRequest | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmingMatch, setConfirmingMatch] = useState<string | null>(null);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [agentSearch, setAgentSearch] = useState('');

  const availableAgents = useMemo(() => {
    return agents
      .filter(a => a.status === AgentStatus.AVAILABLE)
      .filter(a =>
        a.fullName.toLowerCase().includes(agentSearch.toLowerCase()) ||
        (a.profile || '').toLowerCase().includes(agentSearch.toLowerCase())
      );
  }, [agents, agentSearch]);

  const handleRunMatch = async () => {
    if (!selectedPosition) return;
    setLoading(true);
    try {
      const matchResults = await getSmartMatches(selectedPosition.id);
      setResults(matchResults);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar el matching con la IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async (result: any) => {
    if (!selectedPosition) return;

    if (!window.confirm(`¿Estás seguro de asignar a ${result.fullName} a esta posición? Se actualizarán los estados automáticamente.`)) {
      return;
    }

    setConfirmingMatch(result.agentId);
    try {
      await createMatch({
        agentId: result.agentId,
        positionId: selectedPosition.id,
        score: result.score || 100,
        reasoning: result.reasoning || 'Asignación manual por el administrador.'
      });
      alert("¡Match confirmado exitosamente!");
      setResults([]);
      setSelectedPosition(null);
      setAgentSearch('');
      onMatchSuccess();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al confirmar el match.");
    } finally {
      setConfirmingMatch(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Motor de Reubicación Inteligente</h3>
          <p className="opacity-90 max-w-2xl">
            Utiliza nuestra IA para analizar la compatibilidad entre agentes reubicables y las necesidades actuales de los organismos.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl font-black">AI</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">1. Seleccionar Búsqueda</h4>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => {
                const pos = positions.find(p => p.id === e.target.value);
                setSelectedPosition(pos || null);
                setResults([]);
              }}
            >
              <option value="">-- Elige una vacante --</option>
              {positions.filter(p => p.status === 'Abierta').map(p => (
                <option key={p.id} value={p.id}>{p.id} - {p.requestingOrg}</option>
              ))}
            </select>
            
            {selectedPosition && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2">Detalles del Puesto</p>
                <p className="text-sm font-semibold">{selectedPosition.requestingArea}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedPosition.profileRequired} | {selectedPosition.hoursRequired}hs</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 italic">"{selectedPosition.mainFunctions}"</p>
              </div>
            )}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('ai')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition ${mode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🤖 Smart AI
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition ${mode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              👤 Manual
            </button>
          </div>

          {mode === 'ai' ? (
            <button
              onClick={handleRunMatch}
              disabled={!selectedPosition || loading}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                !selectedPosition || loading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando con Gemini...
                </>
              ) : (
                <>✨ Ejecutar Análisis AI</>
              )}
            </button>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Buscar Agente</h4>
              <input
                type="text"
                placeholder="Nombre o perfil..."
                className="w-full p-2 text-sm border border-slate-200 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setResults([{
                        agentId: agent.id,
                        fullName: agent.fullName,
                        score: 100,
                        reasoning: 'Asignación manual seleccionada por el usuario.'
                      }]);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                      results[0]?.agentId === agent.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-slate-800">{agent.fullName}</p>
                    <p className="text-xs text-slate-500">{agent.profile} | {agent.workingHours}hs</p>
                  </button>
                ))}
                {availableAgents.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">No hay agentes disponibles.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">
            {mode === 'ai' ? '2. Resultados del Matching AI' : '2. Confirmar Selección'}
          </h4>
          
          {!selectedPosition && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl py-20 flex flex-col items-center justify-center text-slate-400">
              <p>Selecciona un puesto a la izquierda para ver los candidatos ideales</p>
            </div>
          )}

          {selectedPosition && results.length === 0 && !loading && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl py-20 flex flex-col items-center justify-center text-slate-400">
              <p>
                {mode === 'ai'
                  ? 'Haz clic en "Ejecutar Análisis AI" para ver recomendaciones'
                  : 'Selecciona un agente de la lista de la izquierda'
                }
              </p>
            </div>
          )}

          {loading && (
             <div className="space-y-4 animate-pulse">
               {[1,2,3].map(i => (
                 <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200"></div>
               ))}
             </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-4">
              {results.map((res: any, idx: number) => (
                <div 
                  key={res.agentId} 
                  className={`bg-white p-6 rounded-xl border-2 transition hover:shadow-md ${idx === 0 ? 'border-blue-500' : 'border-slate-100'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {res.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">{res.fullName}</h5>
                        <p className="text-xs text-slate-500">ID: {res.agentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                        {res.score}% Match
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      {mode === 'ai' ? 'Análisis de la IA:' : 'Detalles de Asignación:'}
                    </p>
                    <p className="text-sm text-slate-700 italic">"{res.reasoning}"</p>
                  </div>

                  <button
                    onClick={() => handleConfirmMatch(res)}
                    disabled={!!confirmingMatch}
                    className={`w-full py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                      confirmingMatch === res.agentId
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {confirmingMatch === res.agentId ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        Confirmando...
                      </>
                    ) : (
                      <>✅ Confirmar Asignación</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMatching;
