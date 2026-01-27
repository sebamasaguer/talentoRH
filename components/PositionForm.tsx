
import React, { useState, useEffect } from 'react';
import { PositionStatus, PositionRequest, Organization, FunctionalProfile } from '../types';
import { getOrganizations, getProfiles } from '../services/apiService';

interface PositionFormProps {
  onSave: (position: PositionRequest) => void;
  onCancel: () => void;
  initialData?: PositionRequest;
}

const PositionForm: React.FC<PositionFormProps> = ({ onSave, onCancel, initialData }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<FunctionalProfile[]>([]);

  const [formData, setFormData] = useState<PositionRequest>(initialData || {
    id: `B-${Math.floor(Math.random() * 900) + 100}`,
    requestingOrgId: 0,
    requestingArea: '',
    profileRequiredId: 0,
    mainFunctions: '',
    hoursRequired: 40,
    requestDate: new Date().toISOString().split('T')[0],
    status: PositionStatus.OPEN
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [orgs, profs] = await Promise.all([getOrganizations(), getProfiles()]);
        setOrganizations(orgs);
        setProfiles(profs);

        // If creating new and we have data, set first items as default
        if (!initialData) {
          setFormData(prev => ({
            ...prev,
            requestingOrgId: orgs[0]?.id || 0,
            profileRequiredId: profs[0]?.id || 0
          }));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadMasterData();
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.requestingOrgId === 0 || formData.profileRequiredId === 0) {
      alert('Por favor seleccione un organismo y un perfil.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 bg-blue-900 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? 'Editar Búsqueda' : 'Cargar Nuevo Pedido'}</h3>
          <button onClick={onCancel} className="text-blue-300 hover:text-white transition">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ID Búsqueda</label>
            <input 
              readOnly 
              value={formData.id} 
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Organismo Solicitante</label>
            <select
              required
              value={formData.requestingOrgId}
              onChange={e => setFormData({...formData, requestingOrgId: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value={0} disabled>Seleccione un organismo...</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Área Solicitante</label>
            <input 
              required
              value={formData.requestingArea} 
              onChange={e => setFormData({...formData, requestingArea: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="Ej. Recursos Humanos"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Perfil Requerido</label>
            <select 
              required
              value={formData.profileRequiredId}
              onChange={e => setFormData({...formData, profileRequiredId: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value={0} disabled>Seleccione un perfil...</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Funciones Principales</label>
            <textarea 
              required
              value={formData.mainFunctions} 
              onChange={e => setFormData({...formData, mainFunctions: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none" 
              placeholder="Descripción de tareas y responsabilidades..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Carga Horaria Requerida</label>
            <input 
              type="number" 
              required
              value={formData.hoursRequired} 
              onChange={e => setFormData({...formData, hoursRequired: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="Ej. 30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Estado Inicial</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as PositionStatus})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              {Object.values(PositionStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Fecha de Solicitud</label>
            <input 
              type="date" 
              required
              value={formData.requestDate} 
              onChange={e => setFormData({...formData, requestDate: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
            />
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
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 shadow-md shadow-blue-200 transition font-medium"
            >
              Cargar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionForm;
