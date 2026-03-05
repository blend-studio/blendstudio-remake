import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_events: 0 });

  useEffect(() => {
    // Fetch stats from Python Analytics via .NET or directly (per ora usiamo il backend .NET)
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/telemetry/stats`, {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('blend_admin_token')}` }
        });
        if (response.ok) {
           const data = await response.json();
           setStats(data);
        }
      } catch (e) {}
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Azioni Tracciate', value: stats.total_events, icon: '🔥', color: 'bg-blue-500' },
    { title: 'Progetti Attivi', value: '12', icon: '📁', color: 'bg-blend' },
    { title: 'Contatti Ricevuti', value: '48', icon: '✉️', color: 'bg-green-500' },
    { title: 'Previsione Flusso', value: '+12%', icon: '📈', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-12">
      <div>
         <h1 className="text-4xl font-black text-blend uppercase tracking-tighter italic">Dashboard Overview</h1>
         <p className="text-gray-400 font-medium">Benvenuto nel centro di controllo di Blend Studio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {cards.map((card, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
               <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-black/5`}>
                  {card.icon}
               </div>
               <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{card.title}</p>
               <p className="text-4xl font-black text-blend">{card.value}</p>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 min-h-[400px] flex flex-col justify-center items-center text-center">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-xl font-bold text-blend uppercase italic mb-2">Grafici Analytics</h3>
            <p className="text-gray-400 max-w-sm">
               Qui verranno visualizzate le statistiche in tempo reale elaborate dal servizio Python e tracciate tramite MLflow.
            </p>
         </div>
         
         <div className="bg-blend-dark rounded-[2.5rem] shadow-xl p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-xl font-black tracking-tighter uppercase italic mb-4">Ai Intelligence</h3>
               <p className="text-white/60 mb-8 leading-relaxed">
                  Il modello di regressione lineare sta analizzando i dati storici per prevedere il traffico della prossima settimana.
               </p>
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Trend Atteso</p>
                  <p className="text-3xl font-black text-green-400">+8.5% Users</p>
               </div>
            </div>
            {/* Onde sfondo decorative */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blend-light/20 rounded-full blur-[60px]"></div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
