import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent, updateContent } from '../services/api';
import {
  AdminBadge,
  AdminInput,
  AdminNotice,
  AdminPage,
  AdminPanel,
  AdminTextarea,
} from './AdminUI';

const KNOWN_SLUGS = [
  { slug: 'globals', label: 'Globals', icon: '🌐', desc: 'Navbar, Footer, Socials, Info azienda' },
  { slug: 'home', label: 'Home', icon: '🏠', desc: 'Hero, Statement, Clienti, Preview servizi, CTA' },
  { slug: 'about', label: 'About', icon: '👥', desc: 'Hero, Manifesto, Gallery, Valori, Team CTA' },
  { slug: 'services', label: 'Services', icon: '⚙️', desc: 'Hero, Lista servizi, CTA' },
  { slug: 'contact', label: 'Contact', icon: '✉️', desc: 'Hero, Socials, Form, Info, Mappa' },
  { slug: 'careers', label: 'Careers', icon: '💼', desc: 'Hero, Perks, Posizioni aperte' },
];

function prettyJson(val) {
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return '{}';
  }
}

function tryParseJson(str) {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function IcoLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IcoCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IcoSparkles() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M5 3v4" />
      <path d="M3 5h4" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function FieldInput({ value, onChange, label }) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold capitalize text-slate-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${value ? 'bg-slate-950' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</label>
        <AdminInput type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    );
  }

  if (typeof value === 'string') {
    const isLong = value.length > 80 || value.includes('\n');
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</label>
        {isLong ? (
          <AdminTextarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="resize-y" />
        ) : (
          <AdminInput type="text" value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  return null;
}

function ObjectEditor({ data, onChange, depth = 0 }) {
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray(data) && data.every((item) => typeof item !== 'object' || item === null)) {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <AdminInput
              type="text"
              value={item ?? ''}
              onChange={(e) => {
                const next = [...data];
                next[idx] = e.target.value;
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div className="mb-4">
              <AdminBadge tone="slate">Elemento #{idx + 1}</AdminBadge>
            </div>
            <ObjectEditor
              data={item}
              onChange={(newItem) => {
                const next = [...data];
                next[idx] = newItem;
                onChange(next);
              }}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, val]) => {
        const isComplex = typeof val === 'object' && val !== null;

        if (isComplex) {
          return (
            <div
              key={key}
              className={`space-y-4 rounded-[26px] border border-slate-200 ${depth === 0 ? 'bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]' : 'bg-slate-50/70 p-4'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{key}</p>
                <AdminBadge tone="slate">Struttura</AdminBadge>
              </div>
              <ObjectEditor
                data={val}
                onChange={(newVal) => onChange({ ...data, [key]: newVal })}
                depth={depth + 1}
              />
            </div>
          );
        }

        if (key === 'href') {
          return (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">href</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-sm text-slate-400 select-none">
                {String(val)}
              </div>
            </div>
          );
        }

        return <FieldInput key={key} label={key} value={val} onChange={(newVal) => onChange({ ...data, [key]: newVal })} />;
      })}
    </div>
  );
}

export default function AdminContent() {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelected] = useState('globals');
  const [activeSection, setSection] = useState(null);
  const [localData, setLocalData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllContent();
      const map = {};
      (res.data ?? []).forEach((item) => {
        map[item.slug] = item.data ?? {};
      });
      setContents(map);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    if (jsonMode) {
      setJsonText(prettyJson(localData));
      setJsonError(null);
    }
  }, [jsonMode, localData]);

  const handleFieldChange = (newSectionData) => {
    setLocalData((prev) => ({ ...prev, [activeSection]: newSectionData }));
    setIsDirty(true);
    setSuccessMsg(null);
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    setIsDirty(true);
    const result = tryParseJson(text);
    if (result.ok) {
      setLocalData(result.value);
      setJsonError(null);
    } else {
      setJsonError(result.error);
    }
  };

  const handleSave = async () => {
    if (jsonError) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateContent(selectedSlug, localData);
      setContents((prev) => ({ ...prev, [selectedSlug]: localData }));
      setIsDirty(false);
      setSuccessMsg('Salvato con successo ✓');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setJsonError(err?.response?.data?.message ?? 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
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
  const selectedMeta = KNOWN_SLUGS.find((item) => item.slug === selectedSlug);
  const seededCount = KNOWN_SLUGS.filter((item) => isSeeded(item.slug)).length;

  return (
    <AdminPage
      eyebrow="Area riservata / Contenuti"
      title="Content editor"
      description="Modifica i contenuti di ciascuna pagina del sito. Seleziona la pagina, scegli la sezione e modifica i campi nel pannello a destra."
      stats={[
        { label: 'Pagine gestite', value: KNOWN_SLUGS.length },
        { label: 'Pagine con contenuti', value: seededCount },
        { label: 'Pagina attiva', value: selectedMeta?.label ?? '—', meta: isDirty ? 'bozza' : 'sync' },
      ]}
      actions={
        <>
          {isDirty && <AdminBadge tone="amber">● Modifiche non salvate</AdminBadge>}
        </>
      }
    >
      {jsonError && <AdminNotice tone="danger">JSON non valido: {jsonError}</AdminNotice>}
      {successMsg && <AdminNotice tone="success">{successMsg}</AdminNotice>}

      {loading ? (
        <AdminPanel title="Caricamento\u2026" description="Recupero struttura dal backend.">
          <div className="flex items-center justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        </AdminPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">

          {/* \u2500\u2500 Left: Page navigator \u2500\u2500 */}
          <div className="space-y-5">
            <AdminPanel title="Pagine del sito" description="Seleziona la pagina da modificare.">
              <div className="space-y-2">
                {KNOWN_SLUGS.map(({ slug, label, icon }) => {
                  const seeded = isSeeded(slug);
                  const active = selectedSlug === slug;
                  const sectionCount = seeded ? Object.keys(contents[slug]).length : 0;
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setSelected(slug)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                        active
                          ? 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl ${active ? 'bg-white/10' : 'bg-slate-100'}`}>{icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-black ${active ? 'text-white' : 'text-slate-900'}`}>{label}</p>
                          <p className={`mt-0.5 text-[11px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                            {seeded ? `${sectionCount} sezioni` : 'Non seedata'}
                          </p>
                        </div>
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          seeded ? (active ? 'bg-emerald-300' : 'bg-emerald-400') : active ? 'bg-slate-500' : 'bg-slate-200'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </AdminPanel>

          </div>

          {/* \u2500\u2500 Right: Content editor \u2500\u2500 */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">

              {/* Editor top bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{selectedMeta?.icon}</span>
                  <span className="font-black text-slate-900">{selectedMeta?.label ?? 'Pagina'}</span>
                  {activeSection && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span className="font-semibold text-slate-500">{activeSection}</span>
                    </>
                  )}
                  {isDirty && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Non salvato
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setJsonMode(false)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${!jsonMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Visuale
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonMode(true)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${jsonMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      JSON
                    </button>
                  </div>
                  {isDirty && (
                    <button type="button" onClick={handleDiscard} className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200">
                      Ripristina
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !!jsonError || !isDirty}
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? 'Salvataggio\u2026' : 'Salva'}
                  </button>
                </div>
              </div>

              {/* Editor body */}
              <div className="px-5 py-5">
                {!isSeeded(selectedSlug) ? (
                  <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-4xl text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)]">\ud83d\uddc3\ufe0f</div>
                    <p className="text-lg font-black text-slate-900">{selectedMeta?.label ?? 'Pagina'} non disponibile</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Questa pagina non è ancora stata seedata. Avvia il seed dal container analytics per popolare i contenuti.
                    </p>
                  </div>
                ) : jsonMode ? (
                  <div className="space-y-3">
                    <AdminTextarea
                      value={jsonText}
                      onChange={handleJsonChange}
                      spellCheck={false}
                      data-lenis-prevent
                      rows={24}
                      className="min-h-[60vh] resize-y bg-slate-950 font-mono text-sm leading-7 text-emerald-300 placeholder:text-emerald-700 focus:border-slate-700 focus:ring-slate-800"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400">{jsonText.length} caratteri</span>
                      {jsonError && <span className="text-xs font-semibold text-red-500">\u26a0\ufe0f {jsonError}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {sectionKeys.length > 0 && (
                      <div>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Sezioni di {selectedMeta?.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {sectionKeys.map((key) => {
                            const sectionData = localData[key];
                            const fieldCount = sectionData && typeof sectionData === 'object' ? Object.keys(sectionData).length : 0;
                            const isActive = activeSection === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSection(key)}
                                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition ${
                                  isActive
                                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)]'
                                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                <span className="uppercase tracking-[0.15em]">{key}</span>
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-white/15 text-slate-200' : 'bg-white text-slate-500'}`}>
                                  {fieldCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeSection && localData[activeSection] !== undefined ? (
                      <div className="max-h-[66vh] overflow-y-auto pr-1" data-lenis-prevent>
                        <ObjectEditor data={localData[activeSection]} onChange={handleFieldChange} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                        <p className="text-sm font-black text-slate-500">Seleziona una sezione per iniziare a modificare</p>
                      </div>
                    )}

                    {isDirty && !jsonError && (
                      <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-semibold text-amber-700">● Modifiche non salvate in <strong>{selectedMeta?.label}</strong></p>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={handleDiscard} className="rounded-2xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-700 transition hover:bg-amber-50">
                            Annulla
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-2xl bg-slate-950 px-4 py-1.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-45"
                          >
                            {saving ? 'Salvataggio\u2026' : 'Salva ora'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
