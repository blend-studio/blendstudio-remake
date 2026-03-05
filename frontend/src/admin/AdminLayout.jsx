import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center">Caricamento...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Progetti', path: '/admin/projects', icon: '📁' },
    { name: 'Contenuti', path: '/admin/content', icon: '📝' },
    { name: 'Messaggi', path: '/admin/messages', icon: '✉️' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blend-dark text-white flex flex-col">
        <div className="p-8 border-b border-[#2c5f7a]">
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">Blend Admin</h1>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-[#2c5f7a] text-white font-bold' 
                : 'text-slate-300 hover:text-white hover:bg-[#254f68]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2c5f7a] space-y-4">
           <div className="px-4">
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Utente</p>
              <p className="text-sm font-bold truncate">{user?.email}</p>
           </div>
           <button 
             onClick={logout}
             className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all"
             style={{ color: '#fca5a5' }}
             onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7f1d1d30'}
             onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
           >
             🚪 Esci
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-8 md:p-12" data-lenis-prevent>
        <motion.div
           key={location.pathname}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
        >
           <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
