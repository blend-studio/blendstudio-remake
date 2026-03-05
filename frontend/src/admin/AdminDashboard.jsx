import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Animated counter
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (typeof value !== 'number') { setDisplay(value); return; }
    const start = prev.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

const CARDS = [
  {
    title: 'Azioni tracciate',
    key: 'total_events',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'Progetti attivi',
    key: 'projects',
    gradient: 'linear-gradient(135deg, #2f6580 0%, #4a8fa3 100%)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Messaggi ricevuti',
    key: 'messages',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Previsione flusso',
    key: 'forecast',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_events: 0, projects: null, messages: null, forecast: '+12%' });

  useEffect(() => {
    const token = localStorage.getItem('blend_admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const base = import.meta.env.VITE_API_BASE_URL;

    Promise.allSettled([
      fetch(`${base}/api/telemetry/stats`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${base}/api/projects`).then(r => r.ok ? r.json() : null),
      fetch(`${base}/api/admin/messages`, { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([telemetry, projects, messages]) => {
      setStats({
        total_events: telemetry.value?.total_events ?? 0,
        projects: projects.value?.data?.length ?? 0,
        messages: messages.value?.data?.length ?? 0,
        forecast: '+12%',
      });
    });
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const cardAnim = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  };

  return (
    <div className="space-y-10 max-w-5xl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black tracking-tighter text-gray-900">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {CARDS.map((card) => (
          <motion.div
            key={card.key}
            variants={cardAnim}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg cursor-default"
            style={{ background: card.gradient }}
          >
            {/* Blob decorativo */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
                {card.icon}
              </div>
              <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">{card.title}</p>
              <p className="text-4xl font-black leading-none">
                {typeof stats[card.key] === 'number'
                  ? <AnimatedNumber value={stats[card.key]} />
                  : stats[card.key] ?? 'â€¦'
                }
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Analytics placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col justify-center items-center text-center min-h-[300px]"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f6580" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </motion.div>
          <h3 className="text-lg font-black text-gray-800 tracking-tight mb-2">Grafici Analytics</h3>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Le statistiche in tempo reale elaborate dal servizio Python appariranno qui.
          </p>
        </motion.div>

        {/* AI card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
          className="rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(160deg, #0d1117 0%, #1e4659 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 10, 0], y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(74,143,163,0.3) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ x: [0, -8, 0], y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-8 -left-8 w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)' }}
            />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">AI Live</p>
            </div>
            <h3 className="text-lg font-black tracking-tighter mb-3">AI Intelligence</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Il modello ML sta analizzando i dati storici per prevedere il traffico.
            </p>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Trend atteso</p>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl font-black text-green-400"
              >
                +8.5% Users
              </motion.p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
