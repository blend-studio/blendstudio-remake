import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAnalyticsStats, getAnalyticsTrends, getAnalyticsTopPages, getAnalyticsTopActions, getAnalyticsEvents } from '../services/api';
import { fetchDeviceStats, fetchSessionStats, fetchReferrerStats, fetchFunnelStats } from '../hooks/useTelemetry';

/* ─── Icons ─── */
function IcoRefresh() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function IcoUsers() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcoZap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function IcoCalendar() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoTrend() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function IcoGlobe() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

/* ─── Helpers ─── */
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/* ─── Line chart SVG ─── */
function LineChart({ data, colorStroke = '#2f6580', colorFill = 'rgba(47,101,128,0.12)', height = 120 }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-28 text-slate-400 text-sm">Nessun dato</div>;

  const values = data.map(d => d.events);
  const maxVal = Math.max(...values, 1);
  const W = 600;
  const H = height;
  const PAD_X = 4;
  const PAD_Y = 8;

  const pts = values.map((v, i) => {
    const x = PAD_X + (i / (values.length - 1 || 1)) * (W - PAD_X * 2);
    const y = PAD_Y + (1 - v / maxVal) * (H - PAD_Y * 2);
    return [x, y];
  });

  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;

  // Labels every ~7 points
  const labelStep = Math.max(1, Math.floor(values.length / 7));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Fill */}
      <path d={fillD} fill={colorFill} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={colorStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots + labels */}
      {pts.map(([x, y], i) => (
        <g key={i}>
          {i % labelStep === 0 && (
            <text x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {data[i].date.slice(5)}
            </text>
          )}
          {i === values.length - 1 && (
            <circle cx={x} cy={y} r="3.5" fill={colorStroke} />
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Horizontal bar chart ─── */
function HBarChart({ data, labelKey = 'page', valueKey = 'views', color = '#2f6580' }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm py-6 text-center">Nessun dato</div>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-5 text-[10px] font-black text-slate-400 text-right shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[70%]">{d[labelKey]}</span>
              <span className="text-xs font-black text-slate-500 shrink-0 ml-2">{d[valueKey]}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d[valueKey] / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, sub, icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[24px] p-6 text-white"
      style={{ background: gradient }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">{icon}</div>
        <div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">{label}</p>
          <p className="text-3xl font-black leading-none tabular-nums">{fmt(value)}</p>
          {sub != null && <p className="text-white/50 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main component ─── */
export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topActions, setTopActions] = useState([]);
  const [events, setEvents] = useState(null);
  const [deviceStats, setDeviceStats] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [referrerStats, setReferrerStats] = useState([]);
  const [funnelStats, setFunnelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendDays, setTrendDays] = useState(30);
  const [eventsPage, setEventsPage] = useState(1);
  const EVENTS_LIMIT = 20;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, tr, tp, ta, ev, ds, ss, rs, fn] = await Promise.allSettled([
        getAnalyticsStats(),
        getAnalyticsTrends(trendDays),
        getAnalyticsTopPages(10),
        getAnalyticsTopActions(8),
        getAnalyticsEvents(eventsPage, EVENTS_LIMIT),
        fetchDeviceStats(),
        fetchSessionStats(),
        fetchReferrerStats(8),
        fetchFunnelStats(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value);
      else setError('Servizio analytics non raggiungibile (porta 8001).');
      if (tr.status === 'fulfilled') setTrends(tr.value);
      if (tp.status === 'fulfilled') setTopPages(tp.value);
      if (ta.status === 'fulfilled') setTopActions(ta.value);
      if (ev.status === 'fulfilled') setEvents(ev.value);
      if (ds.status === 'fulfilled') setDeviceStats(ds.value);
      if (ss.status === 'fulfilled') setSessionStats(ss.value);
      if (rs.status === 'fulfilled') setReferrerStats(rs.value);
      if (fn.status === 'fulfilled') setFunnelStats(fn.value);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [trendDays, eventsPage]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalEventsPages = events ? Math.ceil(events.total / EVENTS_LIMIT) : 1;

  return (
    <div className="p-8 md:p-10 space-y-7 max-w-7xl mx-auto">

      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Area riservata / Analytics</p>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 leading-none">Analytics Hub</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Dati reali dal servizio Python · MongoDB telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} type="button" onClick={() => setTrendDays(d)}
              className={`rounded-2xl border px-3.5 py-2 text-xs font-black transition ${trendDays === d ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {d}gg
            </button>
          ))}
          <button type="button" onClick={loadAll}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 transition ml-1">
            <IcoRefresh /> Aggiorna
          </button>
        </div>
      </motion.div>

      {/* ═══ Error banner ═══ */}
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          {error}
          <span className="text-xs text-amber-500 ml-auto">Avvia il container <code className="font-mono">blendstudio_analytics</code></span>
        </div>
      )}

      {/* ═══ KPI row ═══ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Totale eventi" value={stats?.total_events} sub="tutti i tempi" icon={<IcoZap />} gradient="linear-gradient(135deg,#2f6580,#4a8fa3)" delay={0} />
        <KpiCard label="Oggi" value={stats?.today_events} sub="ultime 24h" icon={<IcoCalendar />} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0.07} />
        <KpiCard label="Questa settimana" value={stats?.week_events} sub="ultimi 7 giorni" icon={<IcoTrend />} gradient="linear-gradient(135deg,#11998e,#38ef7d)" delay={0.14} />
        <KpiCard label="Sessioni uniche" value={stats?.unique_sessions} sub="utenti distinti" icon={<IcoUsers />} gradient="linear-gradient(135deg,#f093fb,#f5576c)" delay={0.21} />
      </div>

      {/* ═══ Trend chart + top actions ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        {/* Line chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Andamento</p>
              <h3 className="text-base font-black tracking-tight text-slate-900">Traffico ultimi {trendDays} giorni</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2f6580]" />Events</span>
            </div>
          </div>
          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-[#2f6580] border-t-transparent animate-spin" />
            </div>
          ) : (
            <LineChart data={trends} />
          )}
        </motion.div>

        {/* Top actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Azioni</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-5">Top azioni</h3>
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            </div>
          ) : topActions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Nessun dato</p>
          ) : (
            <div className="space-y-2">
              {topActions.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500">{i + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{a.action}</span>
                  </div>
                  <span className="text-xs font-black text-slate-500 shrink-0 tabular-nums">{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Top pages + recent events ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
        {/* Top pages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Pagine</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-5">Pagine più visitate</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            </div>
          ) : (
            <HBarChart data={topPages} labelKey="page" valueKey="views" color="#2f6580" />
          )}
        </motion.div>

        {/* Recent events table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Log</p>
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Ultimi eventi
                {events && <span className="ml-2 text-[11px] font-semibold text-slate-400">({events.total} totali)</span>}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={eventsPage <= 1}
                onClick={() => setEventsPage(p => p - 1)}
                className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">
                ‹ Prec
              </button>
              <span className="text-xs text-slate-400 font-semibold">{eventsPage}/{totalEventsPages}</span>
              <button type="button" disabled={eventsPage >= totalEventsPages}
                onClick={() => setEventsPage(p => p + 1)}
                className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">
                Succ ›
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#2f6580] border-t-transparent animate-spin" />
            </div>
          ) : !events || events.data?.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400">
              <span className="text-3xl mb-3">📭</span>
              <p className="text-sm font-semibold">Nessun evento registrato</p>
              <p className="text-xs mt-1">Naviga sul sito per generare dati</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Azione</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Pagina</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px] hidden md:table-cell">Sessione</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px] hidden lg:table-cell">Schermo</th>
                    <th className="text-right px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.map((ev, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-black text-slate-700">
                          {ev.action || '?'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 max-w-[160px] truncate">
                        <span className="flex items-center gap-1"><IcoGlobe />{ev.page || '/'}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-400 text-[10px] hidden md:table-cell">{ev.sessionId ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-400 hidden lg:table-cell">
                        {ev.screenW && ev.screenH ? `${ev.screenW}×${ev.screenH}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400 whitespace-nowrap">{fmtDate(ev.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Session quality + Device breakdown ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Session quality */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Qualità</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-5">Sessioni</h3>
          {loading || !sessionStats ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bounce rate',         value: `${sessionStats.bounce_rate}%`,    sub: 'sessioni a 1 pagina',  color: sessionStats.bounce_rate > 60 ? '#f5576c' : '#11998e' },
                { label: 'Avg eventi/sessione', value: sessionStats.avg_events_per_session, sub: 'interazioni medie', color: '#2f6580' },
                { label: 'Pagine/sessione',     value: sessionStats.avg_pages_per_session,  sub: 'profondità visita',  color: '#764ba2' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Device breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Dispositivi</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-5">Ripartizione device</h3>
          {loading || !deviceStats ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Desktop', key: 'desktop', color: '#2f6580', icon: '🖥' },
                { label: 'Mobile',  key: 'mobile',  color: '#f5576c', icon: '📱' },
                { label: 'Tablet',  key: 'tablet',  color: '#764ba2', icon: '📲' },
              ].map(({ label, key, color, icon }) => {
                const d = deviceStats[key] || { count: 0, pct: 0 };
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">{icon} {label}</span>
                      <span className="text-xs font-black text-slate-500">{d.count} ({d.pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-400 pt-1">{deviceStats.total_sessions} sessioni analizzate</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Funnel conversione + Referrers ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Conversioni</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-1">Funnel contatti</h3>
          {funnelStats && (
            <p className="text-xs text-slate-400 mb-5">Conversion rate: <strong className="text-slate-700">{funnelStats.conversion_rate}%</strong></p>
          )}
          {loading || !funnelStats ? (
            <div className="h-28 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {funnelStats.steps.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ background: `hsl(${200 - i * 30},60%,50%)` }}>{i + 1}</span>
                      <span className="text-xs font-semibold text-slate-700">{step.step}</span>
                    </div>
                    <span className="text-xs font-black text-slate-500 tabular-nums">{step.count} · {step.rate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.rate}%` }}
                      transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `hsl(${200 - i * 30},60%,50%)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Traffico</p>
          <h3 className="text-base font-black tracking-tight text-slate-900 mb-5">Sorgenti di traffico</h3>
          {loading || referrerStats.length === 0 ? (
            <div className="h-28 flex items-center justify-center text-slate-400 text-sm">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /> : 'Nessun dato referrer'}
            </div>
          ) : (
            <HBarChart data={referrerStats} labelKey="source" valueKey="count" color="#764ba2" />
          )}
        </motion.div>
      </div>

    </div>
  );
}


function IcoChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IcoPulse() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

