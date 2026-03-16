
import React, { useState } from 'react';
import logo from '../public/logorh.png';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'supply' | 'demand' | 'matching' | 'matches' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'supply' | 'demand' | 'matching' | 'matches' | 'admin') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [currentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-center">
          <img src={logo} alt="Talento RH Logo" className="h-20 w-auto" />
          
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            📊 Panel Principal
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo A - Oferta</div>
          <button 
            onClick={() => setActiveTab('supply')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'supply' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            👤 Agentes / Entrevistas
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo B - Demanda</div>
          <button 
            onClick={() => setActiveTab('demand')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'demand' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            🏢 Búsquedas / Pedidos
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inteligencia</div>
          <button 
            onClick={() => setActiveTab('matching')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'matching' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            ✨ Matching Inteligente
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo C - Resultados</div>
          <button
            onClick={() => setActiveTab('matches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'matches' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            🤝 Confirmaciones / Matches
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuración</div>
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'admin' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            ⚙️ Administración
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          &copy; 2024 Recursos Humanos v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">
            {activeTab === 'dashboard' && 'Dashboard de Gestión'}
            {activeTab === 'supply' && 'Gestión de Agentes (Oferta)'}
            {activeTab === 'demand' && 'Pedidos de Organismos (Demanda)'}
            {activeTab === 'matching' && 'Emparejamiento Inteligente'}
            {activeTab === 'matches' && 'Matches Confirmados'}
            {activeTab === 'admin' && 'Administración de Tablas Maestras'}
          </h2>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition"
            >
              Cerrar Sesión
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser?.email.split('@')[0]}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{currentUser?.role}</p>
              </div>
              <div className="relative">
                <span className="block w-3 h-3 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white"></span>
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                  {currentUser?.email[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
