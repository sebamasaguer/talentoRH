
import React, { useState } from 'react';
import { FunctionalProfile, Agent } from '../types';

interface AgentFormProps {
  onSave: (agent: Agent) => void;
  onCancel: () => void;
  initialData?: Agent;
}

const AgentForm: React.FC<AgentFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Agent>(initialData || {
    id: `A-${Math.floor(Math.random() * 900) + 100}`,
    fullName: '',
    originOrg: '',
    profile: FunctionalProfile.ADMIN,
    keyCompetencies: '',
    workingHours: 40,
    availableForRotation: true,
    interviewDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Editar Entrevista' : 'Cargar Nueva Entrevista'}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ID Agente</label>
            <input 
              readOnly 
              value={formData.id} 
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
            <input 
              required
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Organismo de Origen</label>
            <input 
              required
              value={formData.originOrg} 
              onChange={e => setFormData({...formData, originOrg: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="Ej. Ministerio de Infraestructura"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Perfil Funcional</label>
            <select 
              value={formData.profile}
              onChange={e => setFormData({...formData, profile: e.target.value as FunctionalProfile})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              {Object.values(FunctionalProfile).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Competencias Clave</label>
            <textarea 
              required
              value={formData.keyCompetencies} 
              onChange={e => setFormData({...formData, keyCompetencies: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none" 
              placeholder="Habilidades, herramientas, conocimientos específicos..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Carga Horaria Semanal</label>
            <input 
              type="number" 
              required
              value={formData.workingHours} 
              onChange={e => setFormData({...formData, workingHours: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="Ej. 40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Fecha de Entrevista</label>
            <input 
              type="date" 
              required
              value={formData.interviewDate} 
              onChange={e => setFormData({...formData, interviewDate: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              id="rotation"
              checked={formData.availableForRotation} 
              onChange={e => setFormData({...formData, availableForRotation: e.target.checked})}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="rotation" className="text-sm font-medium text-slate-700">
              Disponible para rotación interna
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition font-medium"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentForm;
