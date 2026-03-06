import React, { useEffect, useMemo, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import {
  AdminBadge,
  AdminButton,
  AdminDialog,
  AdminDialogHeader,
  AdminEmptyState,
  AdminField,
  AdminInput,
  AdminKpiCard,
  AdminNotice,
  AdminPage,
  AdminPanel,
  AdminSelect,
  AdminTextarea,
} from './AdminUI';

const EMPTY_FORM = {
  title: '',
  slug: '',
  client: '',
  services: '',
  description: '',
  coverImage: '',
  layoutType: 'default',
  projectDate: new Date().toISOString().split('T')[0],
};

const LAYOUT_TYPES = ['default', 'wide', 'minimal'];

function IcoFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IcoGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IcoImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function GalleryEditor({ images, onChange }) {
  const [newUrl, setNewUrl] = useState('');

  const add = () => {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...images, url]);
    setNewUrl('');
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="col-span-2 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Gallery visual ({images.length})</p>
        {images.length > 0 && <AdminBadge tone="slate">Ordina drag-like</AdminBadge>}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((url, idx) => (
            <div key={`${url}-${idx}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/80 shadow-sm">
              <div className="aspect-video bg-slate-100">
                <img
                  src={url}
                  alt="Anteprima gallery"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-3 p-4">
                <p className="truncate text-xs font-medium text-slate-500">{url}</p>
                <div className="flex flex-wrap gap-2">
                  <AdminButton type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => moveUp(idx)} disabled={idx === 0}>
                    ↑ Su
                  </AdminButton>
                  <AdminButton type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => moveDown(idx)} disabled={idx === images.length - 1}>
                    ↓ Giù
                  </AdminButton>
                  <AdminButton type="button" variant="danger" className="px-3 py-2 text-xs" onClick={() => remove(idx)}>
                    Rimuovi
                  </AdminButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <AdminInput
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="https://... URL immagine"
          className="flex-1"
        />
        <AdminButton type="button" onClick={add}>+ Aggiungi immagine</AdminButton>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLayout, setFilterLayout] = useState('all');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [gallery, setGallery] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      setProjects(res.data ?? []);
    } catch {
      setError('Errore nel caricamento dei progetti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setGallery([]);
    setFormError(null);
    setEditing(null);
    setModal('create');
  };

  const openEdit = (project) => {
    setForm({
      title: project.title ?? '',
      slug: project.slug ?? '',
      client: project.client ?? '',
      services: project.services ?? '',
      description: project.description ?? '',
      coverImage: project.coverImage ?? project.cover_image ?? '',
      layoutType: project.layoutType ?? project.layout_type ?? 'default',
      projectDate: project.projectDate
        ? project.projectDate.split('T')[0]
        : project.project_date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    });

    const raw = project.gallery_images ?? [];
    setGallery(raw.map((item) => (typeof item === 'string' ? item : item?.src ?? item?.url ?? '')).filter(Boolean));
    setFormError(null);
    setEditing(project);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setGallery([]);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Il titolo è obbligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        client: form.client,
        services: form.services,
        description: form.description,
        coverImage: form.coverImage,
        galleryImages: JSON.stringify(gallery),
        layoutType: form.layoutType,
        projectDate: new Date(form.projectDate).toISOString(),
      };

      if (modal === 'create') {
        await createProject(payload);
      } else {
        await updateProject(editing.id, payload);
      }

      closeModal();
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message ?? 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteProject(confirmDelete.id);
      setConfirmDelete(null);
      await load();
    } catch {
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (filterLayout !== 'all') list = list.filter((p) => (p.layoutType ?? p.layout_type ?? 'default') === filterLayout);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.client?.toLowerCase().includes(q) ||
          p.services?.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [projects, search, filterLayout]);

  const safeDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('it-IT');
  };

  return (
    <AdminPage
      eyebrow="Area riservata / Progetti"
      title="Portfolio management"
      description="Una griglia editoriale più premium per monitorare lavori, copertine, layout e metadati di ciascun progetto pubblicato."
      stats={[
        { label: 'Totale progetti', value: projects.length },
        { label: 'Layout supportati', value: LAYOUT_TYPES.length },
        { label: 'Media gallery', value: projects.reduce((acc, item) => acc + (item.gallery_images?.length ?? 0), 0), meta: 'immagini collegate' },
      ]}
      actions={
        <>
          <AdminBadge tone="violet">Portfolio live</AdminBadge>
          <AdminButton type="button" variant="dark" onClick={openCreate}>+ Nuovo progetto</AdminButton>
        </>
      }
    >
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKpiCard label="Schede attive" value={projects.length} subtitle="Voci pubblicabili dal portfolio" tone="cyan" icon={<IcoFolder />} />
        <AdminKpiCard label="Layout design" value={LAYOUT_TYPES.length} subtitle="Template gestiti dall’editor" tone="violet" icon={<IcoGrid />} />
        <AdminKpiCard label="Asset visivi" value={projects.reduce((acc, item) => acc + (item.gallery_images?.length ?? 0), 0)} subtitle="Immagini aggregate dalle gallery" tone="amber" icon={<IcoImage />} />
      </div>

      <AdminPanel
        title="Archivio progetti"
        description="Ogni card mostra una vista più editoriale del portfolio, con cover, slug, cliente e azioni rapide di gestione."
        action={<AdminButton type="button" variant="secondary" onClick={load}>Aggiorna</AdminButton>}
      >
        {/* Filter bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 sm:w-72">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per titolo, cliente, servizi…"
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...LAYOUT_TYPES].map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setFilterLayout(lt)}
                className={`rounded-2xl border px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] transition ${filterLayout === lt ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {lt === 'all' ? 'Tutti' : lt}
              </button>
            ))}
            {(search || filterLayout !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setFilterLayout('all'); }}
                className="rounded-2xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                Resetta filtri
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <AdminEmptyState
            icon="🗂️"
            title="Nessun progetto presente"
            description="Aggiungi il primo case study per popolare il portfolio e gestirlo dal nuovo pannello visuale."
            action={<AdminButton type="button" onClick={openCreate}>Crea progetto</AdminButton>}
          />
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-4xl">🔍</div>
            <p className="text-sm font-black text-slate-600">Nessun risultato</p>
            <p className="mt-1 text-xs text-slate-400">Prova a modificare la ricerca o i filtri attivi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredProjects.map((p) => {
              const cover = p.coverImage ?? p.cover_image;
              const layout = p.layoutType ?? p.layout_type ?? 'default';
              const projectDate = p.projectDate ?? p.project_date;
              const galleryCount = p.gallery_images?.length ?? 0;

              return (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.11)]"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900">
                    {cover ? (
                      <img src={cover} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl text-white/70">🖼️</div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <AdminBadge tone="slate" className="border-white/15 bg-white/10 text-white">{layout}</AdminBadge>
                      <AdminBadge tone="slate" className="border-white/15 bg-white/10 text-white">{galleryCount} gallery</AdminBadge>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">/{p.slug}</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{p.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{p.description || 'Nessuna descrizione disponibile.'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AdminBadge tone="cyan">{p.client || 'Cliente non indicato'}</AdminBadge>
                      {p.services && <AdminBadge tone="amber">{p.services}</AdminBadge>}
                      <AdminBadge tone="slate">{safeDate(projectDate)}</AdminBadge>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <AdminButton type="button" className="flex-1" onClick={() => openEdit(p)}>Modifica</AdminButton>
                      <AdminButton type="button" variant="danger" className="flex-1" onClick={() => setConfirmDelete(p)}>Elimina</AdminButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AdminPanel>

      {modal && (
        <AdminDialog onClose={closeModal} maxWidth="max-w-4xl">
          <AdminDialogHeader
            title={modal === 'create' ? 'Nuovo progetto' : 'Modifica progetto'}
            description="Compila i campi principali, scegli il layout e costruisci una gallery ordinata per il portfolio."
            onClose={closeModal}
          />

          <form onSubmit={handleSave} className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6" data-lenis-prevent>
            <div className="space-y-5">
              {formError && <AdminNotice tone="danger">{formError}</AdminNotice>}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <AdminField label="Titolo *" className="md:col-span-2">
                  <AdminInput name="title" value={form.title} onChange={handleChange} placeholder="Nome del progetto" />
                </AdminField>

                <AdminField label="Slug" className="md:col-span-2" hint="Se lasciato vuoto, può essere generato lato backend.">
                  <AdminInput name="slug" value={form.slug} onChange={handleChange} placeholder="slug-del-progetto" className="font-mono" />
                </AdminField>

                <AdminField label="Cliente">
                  <AdminInput name="client" value={form.client} onChange={handleChange} placeholder="Nome cliente" />
                </AdminField>

                <AdminField label="Servizi">
                  <AdminInput name="services" value={form.services} onChange={handleChange} placeholder="Branding, Web Design..." />
                </AdminField>

                <AdminField label="Descrizione" className="md:col-span-2">
                  <AdminTextarea name="description" value={form.description} onChange={handleChange} rows={5} className="resize-none" />
                </AdminField>

                <AdminField label="Cover image URL" className="md:col-span-2">
                  <AdminInput name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." />
                </AdminField>

                <GalleryEditor images={gallery} onChange={setGallery} />

                <AdminField label="Layout">
                  <AdminSelect name="layoutType" value={form.layoutType} onChange={handleChange}>
                    {LAYOUT_TYPES.map((layout) => (
                      <option key={layout} value={layout}>{layout}</option>
                    ))}
                  </AdminSelect>
                </AdminField>

                <AdminField label="Data progetto">
                  <AdminInput type="date" name="projectDate" value={form.projectDate} onChange={handleChange} />
                </AdminField>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <AdminButton type="button" variant="secondary" onClick={closeModal}>Annulla</AdminButton>
                <AdminButton type="submit" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva progetto'}</AdminButton>
              </div>
            </div>
          </form>
        </AdminDialog>
      )}

      {confirmDelete && (
        <AdminDialog onClose={() => setConfirmDelete(null)} maxWidth="max-w-md">
          <AdminDialogHeader
            title="Elimina progetto"
            description="Conferma la rimozione definitiva della scheda portfolio selezionata."
            onClose={() => setConfirmDelete(null)}
          />
          <div className="space-y-6 px-6 py-6">
            <p className="text-sm leading-6 text-slate-600">
              Vuoi davvero eliminare <span className="font-black text-slate-900">{confirmDelete.title}</span>? L’operazione è irreversibile.
            </p>
            <div className="flex justify-end gap-3">
              <AdminButton type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>Annulla</AdminButton>
              <AdminButton type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminazione…' : 'Elimina'}
              </AdminButton>
            </div>
          </div>
        </AdminDialog>
      )}
    </AdminPage>
  );
}
