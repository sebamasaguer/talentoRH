
import React, { useState, useEffect, useMemo } from 'react';
import { Organization, FunctionalProfile } from '../types';
import {
  getOrganizations, saveOrganization, deleteOrganization,
  getProfiles, saveProfile, deleteProfile
} from '../services/apiService';
import Pagination from './Pagination';

const AdminPanel: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<FunctionalProfile[]>([]);

  const [newOrgName, setNewOrgName] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingProfile, setEditingProfile] = useState<FunctionalProfile | null>(null);

  const itemsPerPage = 10;
  const [currentPageOrgs, setCurrentPageOrgs] = useState(1);
  const [currentPageProfiles, setCurrentPageProfiles] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orgsData, profilesData] = await Promise.all([
        getOrganizations(),
        getProfiles()
      ]);
      setOrganizations(orgsData);
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveOrganization({ id: editingOrg?.id, name: newOrgName });
      setNewOrgName('');
      setEditingOrg(null);
      loadData();
    } catch (error) {
      alert('Error saving organization');
    }
  };

  const handleDeleteOrg = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este organismo?')) {
      try {
        await deleteOrganization(id);
        loadData();
      } catch (error: any) {
        alert(error.message || 'Error deleting organization');
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile({ id: editingProfile?.id, name: newProfileName });
      setNewProfileName('');
      setEditingProfile(null);
      loadData();
    } catch (error) {
      alert('Error saving profile');
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este perfil funcional?')) {
      try {
        await deleteProfile(id);
        loadData();
      } catch (error: any) {
        alert(error.message || 'Error deleting profile');
      }
    }
  };

  const paginatedOrgs = useMemo(() => {
    const start = (currentPageOrgs - 1) * itemsPerPage;
    return organizations.slice(start, start + itemsPerPage);
  }, [organizations, currentPageOrgs]);

  const paginatedProfiles = useMemo(() => {
    const start = (currentPageProfiles - 1) * itemsPerPage;
    return profiles.slice(start, start + itemsPerPage);
  }, [profiles, currentPageProfiles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Organizations CRUD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Gestionar Organismos</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveOrg} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Nombre del organismo..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {editingOrg ? 'Actualizar' : 'Agregar'}
            </button>
            {editingOrg && (
              <button
                type="button"
                onClick={() => { setEditingOrg(null); setNewOrgName(''); }}
                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                X
              </button>
            )}
          </form>

          <ul className="divide-y divide-slate-100">
            {paginatedOrgs.map(org => (
              <li key={org.id} className="py-3 flex justify-between items-center group">
                <span className="text-slate-700 font-medium">{org.name}</span>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setEditingOrg(org); setNewOrgName(org.name); }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteOrg(org.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {organizations.length === 0 && (
              <li className="py-8 text-center text-slate-400">No hay organismos cargados.</li>
            )}
          </ul>
          <Pagination
            currentPage={currentPageOrgs}
            totalPages={Math.ceil(organizations.length / itemsPerPage)}
            onPageChange={setCurrentPageOrgs}
          />
        </div>
      </div>

      {/* Profiles CRUD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Gestionar Perfiles Funcionales</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveProfile} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nombre del perfil..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {editingProfile ? 'Actualizar' : 'Agregar'}
            </button>
            {editingProfile && (
              <button
                type="button"
                onClick={() => { setEditingProfile(null); setNewProfileName(''); }}
                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                X
              </button>
            )}
          </form>

          <ul className="divide-y divide-slate-100">
            {paginatedProfiles.map(p => (
              <li key={p.id} className="py-3 flex justify-between items-center group">
                <span className="text-slate-700 font-medium">{p.name}</span>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setEditingProfile(p); setNewProfileName(p.name); }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(p.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {profiles.length === 0 && (
              <li className="py-8 text-center text-slate-400">No hay perfiles cargados.</li>
            )}
          </ul>
          <Pagination
            currentPage={currentPageProfiles}
            totalPages={Math.ceil(profiles.length / itemsPerPage)}
            onPageChange={setCurrentPageProfiles}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
