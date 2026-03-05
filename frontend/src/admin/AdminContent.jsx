import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent, updateContent } from '../services/api';

// ─── Metadati pagine ────────────────────────────────────────────────────────
const KNOWN_SLUGS = [
  { slug: 'globals',  label: 'Globals',  icon: '\uD83C\uDF10', desc: 'Navbar, Footer, Socials, Info azienda' },
  { slug: 'home',     label: 'Home',     icon: '\uD83C\uDFE0', desc: 'Hero, Statement, Clienti, Preview servizi, CTA' },
  { slug: 'about',    label: 'About',    icon: '\uD83D\uDC65', desc: 'Hero, Manifesto, Gallery, Valori, Team CTA' },
  { slug: 'services', label: 'Services', icon: '\u2699\uFE0F',  desc: 'Hero, Lista servizi, CTA' },
  { slug: 'contact',  label: 'Contact',  icon: '\u2709\uFE0F',  desc: 'Hero, Socials, Form, Info, Mappa' },
  { slug: 'careers',  label: 'Careers',  icon: '\uD83D\uDCBC', desc: 'Hero, Perks, Posizioni aperte' },
];

function prettyJson(val) {
  try { return JSON.stringify(val, null, 2); } catch { return '{}'; }
}
function tryParseJson(str) {
  try { return { ok: true, value: JSON.parse(str) }; } catch (e) { return { ok: false, error: e.message }; }
}

// --- Campo singolo ---
function FieldInput({ value, onChange, label }) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <span className="text-sm font-semibold text-gray-600 capitalize">{label}</span>
        <button
          onClick={() => onChange(!value)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ backgroundColor: value ? '#1e4659' : '#e5e7eb' }}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  }
  if (typeof value === 'number') {
    return (
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
        />
      </div>
    );
  }
  if (typeof value === 'string') {
    const isLong = value.length > 80 || value.includes('\n');
    return (
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
        {isLong ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white resize-y"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          />
        )}
      </div>
    );
  }
  return null;
}

// --- Editor ricorsivo ---
function ObjectEditor({ data, onChange, depth = 0 }) {
  if (!data || typeof data !== 'object') return null;

  // Array di primitive
  if (Array.isArray(data) && data.every(i => typeof i !== 'object' || i === null)) {
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item ?? ''}
              onChange={e => { const n = [...data]; n[idx] = e.target.value; onChange(n); }}
              className="flex-grow border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <button
              onClick={() => onChange(data.filter((_, i) => i !== idx))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >&#x2715;</button>
          </div>
        ))}
        <button
          onClick={() => onChange([...data, ''])}
          className="mt-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >+ Aggiungi</button>
      </div>
    );
  }

  // Array di oggetti
  if (Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">#{idx + 1}</span>
              <button
                onClick={() => onChange(data.filter((_, i) => i !== idx))}
                className="text-xs font-bold px-2 py-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >Rimuovi</button>
            </div>
            <ObjectEditor
              data={item}
              onChange={newItem => { const n = [...data]; n[idx] = newItem; onChange(n); }}
              depth={depth + 1}
            />
          </div>
        ))}
        <button
          onClick={() => {
            const tmpl = data[0] ? Object.fromEntries(Object.keys(data[0]).map(k => [k, typeof data[0][k] === 'number' ? 0 : ''])) : {};
            onChange([...data, tmpl]);
          }}
          className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >+ Aggiungi elemento</button>
      </div>
    );
  }

  // Oggetto normale
  return (
    <div>
      {Object.entries(data).map(([key, val]) => {
        const isComplex = typeof val === 'object' && val !== null;
        if (isComplex) {
          return (
            <div key={key} className={`mb-5 ${depth === 0 ? 'bg-white border border-gray-100 rounded-2xl p-5 shadow-sm' : ''}`}>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{key}</p>
              <ObjectEditor
                data={val}
                onChange={newVal => onChange({ ...data, [key]: newVal })}
                depth={depth + 1}
              />
            </div>
          );
        }
        return (
          <FieldInput
            key={key}
            label={key}
            value={val}
            onChange={newVal => onChange({ ...data, [key]: newVal })}
          />
        );
      })}
    </div>
  );
}

// --- Componente principale ---
export default function AdminContent() {
  const [contents, setContents]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [selectedSlug, setSelected] = useState('globals');
  const [activeSection, setSection] = useState(null);
  const [localData, setLocalData]   = useState({});
  const [isDirty, setIsDirty]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [jsonMode, setJsonMode]     = useState(false);
  const [jsonText, setJsonText]     = useState('');
  const [jsonError, setJsonError]   = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllContent();
      const map = {};
      (res.data ?? []).forEach(item => { map[item.slug] = item.data ?? {}; });
      setContents(map);
    } catch { /* vuoto */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const data = contents[selectedSlug] ?? {};
    setLocalData(JSON.parse(JSON.stringify(data)));
    setSection(Object.keys(data)[0] ?? null);
    setIsDirty(false);
    setJsonMode(false);
    setJsonError(null);
    setSuccessMsg(null);
  }, [selectedSlug, contents]);

  useEffect(() => {
    if (jsonMode) { setJsonText(prettyJson(localData)); setJsonError(null); }
  }, [jsonMode]);

  const handleFieldChange = (newSectionData) => {
    setLocalData(prev => ({ ...prev, [activeSection]: newSectionData }));
    setIsDirty(true);
    setSuccessMsg(null);
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    setIsDirty(true);
    const result = tryParseJson(text);
    if (result.ok) { setLocalData(result.value); setJsonError(null); }
    else { setJsonError(result.error); }
  };

  const handleSave = async () => {
    if (jsonError) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateContent(selectedSlug, localData);
      setContents(prev => ({ ...prev, [selectedSlug]: localData }));
      setIsDirty(false);
      setSuccessMsg('Salvato con successo \u2713');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setJsonError(err?.response?.data?.message ?? 'Errore durante il salvataggio.');
    } finally { setSaving(false); }
  };

  const handleDiscard = () => {
    const data = contents[selectedSlug] ?? {};
    setLocalData(JSON.parse(JSON.stringify(data)));
    setIsDirty(false);
    setJsonError(null);
    if (jsonMode) setJsonText(prettyJson(data));
  };

  const isSeeded = (slug) => !!contents[slug] && Object.keys(contents[slug]).length > 0;
  const sectionKeys = Object.keys(localData);
  const selectedMeta = KNOWN_SLUGS.find(s => s.slug === selectedSlug);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Contenuti</h1>
          <p className="text-gray-400 mt-1 text-sm">Modifica i contenuti del sito memorizzati su MongoDB.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >Annulla</button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !!jsonError || !isDirty}
            className="px-6 py-2.5 text-sm font-black rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#1e4659' }}
          >
            {saving ? 'Salvataggio\u2026' : isDirty ? '\uD83D\uDCBE Salva modifiche' : 'Salvato'}
          </button>
        </div>
      </div>

      {/* Notifiche */}
      {jsonError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono">
          &#x2715; JSON non valido: {jsonError}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold">
          {successMsg}
        </div>
      )}
      {isDirty && !jsonError && !successMsg && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium">
          &#x26A0;&#xFE0F; Hai modifiche non salvate
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#1e4659', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="flex gap-6 flex-grow min-h-0">

          {/* Sidebar */}
          <div className="w-52 flex-shrink-0 space-y-1">
            {KNOWN_SLUGS.map(({ slug, label, icon }) => {
              const seeded = isSeeded(slug);
              const active = selectedSlug === slug;
              return (
                <button
                  key={slug}
                  onClick={() => setSelected(slug)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
                  style={{ backgroundColor: active ? '#1e4659' : 'transparent' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-black leading-none truncate ${active ? 'text-white' : 'text-gray-700'}`}>{label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                      {seeded ? `${Object.keys(contents[slug]).length} sezioni` : 'Non in DB'}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seeded ? '#22c55e' : '#d1d5db' }} />
                </button>
              );
            })}

            {/* Seed shortcut */}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Seed DB</p>
              <button
                onClick={() => navigator.clipboard?.writeText('docker exec blendstudio_analytics python /app/seed_content.py --force')}
                className="w-full text-left px-3 py-2 bg-gray-900 text-green-400 rounded-xl font-mono text-[9px] leading-snug hover:bg-gray-800 transition-colors"
                title="Clicca per copiare"
              >
                docker exec ...<br />seed_content.py --force
              </button>
              <p className="text-[9px] text-gray-400 mt-1 px-2">Clicca per copiare</p>
            </div>
          </div>

          {/* Area principale */}
          <div className="flex-grow flex flex-col min-w-0">

            {/* Intestazione pagina + toggle JSON */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: '#f0f6f9' }}>
                  {selectedMeta?.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedMeta?.label}</h2>
                  <p className="text-xs text-gray-400">{selectedMeta?.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setJsonMode(m => !m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  jsonMode ? 'bg-gray-900 text-green-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{'{ }'}</span> {jsonMode ? 'Modalit\u00E0 JSON' : 'Vista JSON'}
              </button>
            </div>

            {!isSeeded(selectedSlug) ? (
              /* Stato vuoto */
              <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">\uD83D\uDDC4\uFE0F</div>
                <h3 className="text-xl font-black text-gray-700 mb-2">Nessun contenuto in DB</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Esegui il seed per popolare la pagina <strong>{selectedMeta?.label}</strong>.</p>
                <code
                  className="block text-xs bg-gray-900 text-green-400 px-4 py-3 rounded-xl font-mono cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => navigator.clipboard?.writeText('docker exec blendstudio_analytics python /app/seed_content.py --force')}
                >
                  docker exec blendstudio_analytics python /app/seed_content.py --force
                </code>
                <p className="text-xs text-gray-400 mt-3">Clicca per copiare</p>
              </div>
            ) : jsonMode ? (
              /* JSON raw editor */
              <div className="flex-grow flex flex-col">
                <textarea
                  value={jsonText}
                  onChange={handleJsonChange}
                  spellCheck={false}
                  data-lenis-prevent
                  className="flex-grow font-mono text-sm resize-none border rounded-2xl p-6 focus:outline-none bg-gray-900 text-green-300 leading-relaxed"
                  style={{ minHeight: '500px', borderColor: jsonError ? '#fca5a5' : '#374151' }}
                />
                <p className="text-[10px] text-gray-400 mt-2 text-right font-mono">{jsonText.length} chars</p>
              </div>
            ) : (
              /* Visual editor */
              <div className="flex-grow flex flex-col min-h-0">
                {/* Tab sezioni */}
                {sectionKeys.length > 1 && (
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {sectionKeys.map(key => (
                      <button
                        key={key}
                        onClick={() => setSection(key)}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        style={activeSection === key ? { backgroundColor: '#1e4659', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                        onMouseEnter={e => { if (activeSection !== key) e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                        onMouseLeave={e => { if (activeSection !== key) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                )}

                {/* Form */}
                {activeSection && localData[activeSection] !== undefined && (
                  <div className="flex-grow overflow-y-auto pr-1" data-lenis-prevent>
                    <ObjectEditor
                      data={localData[activeSection]}
                      onChange={handleFieldChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



