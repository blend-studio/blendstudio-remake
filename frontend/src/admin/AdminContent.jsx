import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent, updateContent } from '../services/api';

// ─── Slugs noti con etichette leggibili ────────────────────────────────────
const KNOWN_SLUGS = [
  { slug: 'globals',  label: 'Globals',  icon: '🌐', desc: 'Navbar, Footer, Socials, Info azienda' },
  { slug: 'home',     label: 'Home',     icon: '🏠', desc: 'Hero, Statement, Clienti, Preview servizi, CTA' },
  { slug: 'about',    label: 'About',    icon: '👥', desc: 'Hero, Manifesto, Gallery, Valori, Team CTA' },
  { slug: 'services', label: 'Services', icon: '⚙️', desc: 'Hero, Lista servizi completa, CTA' },
  { slug: 'contact',  label: 'Contact',  icon: '✉️', desc: 'Hero, Socials, Form, Info, Mappa' },
  { slug: 'careers',  label: 'Careers',  icon: '💼', desc: 'Hero, Perks, Posizioni aperte' },
];

function prettyJson(val) {
  try { return JSON.stringify(val, null, 2); } catch { return '{}'; }
}
function tryParseJson(str) {
  try { return { ok: true, value: JSON.parse(str) }; } catch (e) { return { ok: false, error: e.message }; }
}

export default function AdminContent() {
  const [contents, setContents]     = useState({});   // { slug: data }
  const [loading, setLoading]       = useState(true);
  const [selectedSlug, setSelected] = useState('globals');
  const [editorText, setEditorText] = useState('');
  const [isDirty, setIsDirty]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [parseError, setParseError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchKey, setSearchKey]   = useState('');

  // ── Carica tutti i contenuti da MongoDB ────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllContent();
      const map = {};
      (res.data ?? []).forEach(item => { map[item.slug] = item.data ?? {}; });
      setContents(map);
    } catch {
      // se MongoDB è vuoto, map rimane {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Quando cambia il slug selezionato, aggiorna l'editor ───────────────
  useEffect(() => {
    const data = contents[selectedSlug] ?? {};
    setEditorText(prettyJson(data));
    setIsDirty(false);
    setParseError(null);
    setSuccessMsg(null);
  }, [selectedSlug, contents]);

  // ── Gestione textarea ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const text = e.target.value;
    setEditorText(text);
    setIsDirty(true);
    setSuccessMsg(null);
    const result = tryParseJson(text);
    setParseError(result.ok ? null : result.error);
  };

  // ── Salva ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const result = tryParseJson(editorText);
    if (!result.ok) { setParseError(result.error); return; }
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateContent(selectedSlug, result.value);
      setContents(prev => ({ ...prev, [selectedSlug]: result.value }));
      setIsDirty(false);
      setSuccessMsg('Salvato con successo ✓');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setParseError(err?.response?.data?.message ?? 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  // ── Annulla modifiche ──────────────────────────────────────────────────
  const handleDiscard = () => {
    const data = contents[selectedSlug] ?? {};
    setEditorText(prettyJson(data));
    setIsDirty(false);
    setParseError(null);
  };

  // ── Statistiche sezioni ────────────────────────────────────────────────
  const getSectionKeys = (slug) => {
    const data = contents[slug];
    if (!data || typeof data !== 'object') return [];
    return Object.keys(data);
  };

  const getFilteredKeys = () => {
    const keys = editorText ? Object.keys(tryParseJson(editorText).value ?? {}) : [];
    if (!searchKey.trim()) return keys;
    return keys.filter(k => k.toLowerCase().includes(searchKey.toLowerCase()));
  };

  const isSeeded = (slug) => !!contents[slug] && Object.keys(contents[slug]).length > 0;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 80px)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Contenuti</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Modifica i contenuti del sito memorizzati su MongoDB.
          </p>
        </div>

        {/* Istruzioni seed */}
        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Seed iniziale</p>
          <code
            className="block text-xs bg-gray-900 text-green-400 px-3 py-2 rounded-lg font-mono max-w-xs truncate cursor-pointer"
            title="Copia il comando"
            onClick={() => {
              navigator.clipboard?.writeText('docker exec blendstudio_analytics python /app/seed_content.py');
            }}
          >
            docker exec blendstudio_analytics python /app/seed_content.py
          </code>
          <p className="text-[10px] text-gray-400 mt-1">Clicca per copiare • <code className="text-gray-500">--force</code> per sovrascrivere</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#1e4659', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="flex gap-6 flex-grow min-h-0">

          {/* ── Sidebar pagine ─────────────────────────────────────────── */}
          <div className="w-56 flex-shrink-0 space-y-1" data-lenis-prevent>
            {KNOWN_SLUGS.map(({ slug, label, icon }) => {
              const seeded = isSeeded(slug);
              const active = selectedSlug === slug;
              return (
                <button
                  key={slug}
                  onClick={() => setSelected(slug)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: active ? '#1e4659' : 'transparent',
                    color: active ? '#ffffff' : '#6b7280',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span className="text-base">{icon}</span>
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-bold leading-none truncate ${active ? 'text-white' : 'text-gray-700'}`}>{label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                      {seeded ? `${getSectionKeys(slug).length} sezioni` : 'Non ancora in DB'}
                    </p>
                  </div>
                  {/* Dot status */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seeded ? '#22c55e' : '#d1d5db' }}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Editor principale ──────────────────────────────────────── */}
          <div className="flex-grow flex flex-col min-w-0 min-h-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {KNOWN_SLUGS.find(s => s.slug === selectedSlug)?.icon}
                </span>
                <div>
                  <p className="font-black text-gray-900">
                    {KNOWN_SLUGS.find(s => s.slug === selectedSlug)?.label ?? selectedSlug}
                  </p>
                  <p className="text-xs text-gray-400">
                    {KNOWN_SLUGS.find(s => s.slug === selectedSlug)?.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isDirty && (
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annulla
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !!parseError || !isDirty}
                  className="px-5 py-2 text-sm font-bold rounded-xl transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#1e4659', color: '#ffffff' }}
                >
                  {saving ? 'Salvataggio…' : 'Salva'}
                </button>
              </div>
            </div>

            {/* Messaggi stato */}
            {parseError && (
              <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono flex-shrink-0">
                ✕ JSON non valido: {parseError}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold flex-shrink-0">
                {successMsg}
              </div>
            )}

            {/* Preview sezioni (keys) */}
            {!isDirty && isSeeded(selectedSlug) && (
              <div className="mb-3 flex items-center gap-2 flex-wrap flex-shrink-0">
                <input
                  type="text"
                  value={searchKey}
                  onChange={e => setSearchKey(e.target.value)}
                  placeholder="Filtra sezioni…"
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none"
                />
                {getSectionKeys(selectedSlug).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      const data = contents[selectedSlug] ?? {};
                      const section = { [key]: data[key] };
                      setEditorText(prettyJson(section));
                      setIsDirty(true);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 rounded-lg transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {/* Textarea JSON */}
            <div className="flex-grow relative min-h-0">
              <textarea
                value={editorText}
                onChange={handleChange}
                spellCheck={false}
                data-lenis-prevent
                className="w-full h-full font-mono text-sm resize-none border rounded-2xl p-6 focus:outline-none focus:ring-2 bg-gray-50 text-gray-800 leading-relaxed"
                style={{
                  minHeight: '420px',
                  borderColor: parseError ? '#fca5a5' : isDirty ? '#93c5fd' : '#e5e7eb',
                  focusRingColor: '#1e4659',
                }}
                placeholder={
                  isSeeded(selectedSlug)
                    ? ''
                    : `Nessun contenuto in DB per "${selectedSlug}".\n\nEsegui il seed con:\ndocker exec blendstudio_analytics python /app/seed_content.py\n\nOppure incolla qui il JSON e premi Salva.`
                }
              />
              {/* Char count */}
              <span className="absolute bottom-3 right-4 text-[10px] text-gray-300 font-mono pointer-events-none">
                {editorText.length} chars
              </span>
            </div>

            {/* Legenda sezioni per slug selezionato */}
            {!isDirty && isSeeded(selectedSlug) && (
              <div className="mt-3 flex-shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Struttura documento</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {getSectionKeys(selectedSlug).map(key => {
                    const val = (contents[selectedSlug] ?? {})[key];
                    const type = Array.isArray(val) ? `array[${val.length}]` : typeof val === 'object' ? 'object' : typeof val;
                    return (
                      <div key={key} className="px-3 py-2 bg-white border border-gray-100 rounded-xl">
                        <p className="text-xs font-bold text-gray-700 truncate">{key}</p>
                        <p className="text-[10px] text-gray-400">{type}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
