import React, { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';

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
    <div className="col-span-2 space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
        Gallery ({images.length} immagini)
      </label>

      {/* Existing items */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((url, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              {/* Thumbnail */}
              <img
                src={url}
                alt=""
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                onError={e => { e.target.style.display = 'none'; }}
              />
              {/* URL */}
              <span className="flex-grow text-xs text-gray-600 truncate font-mono">{url}</span>
              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors text-xs">
                  ▲
                </button>
                <button type="button" onClick={() => moveDown(idx)}
                  disabled={idx === images.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors text-xs">
                  ▼
                </button>
                <button type="button" onClick={() => remove(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors text-sm font-bold">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new URL */}
      <div className="flex gap-2">
        <input
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="https://... URL immagine"
          className="flex-grow border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e4659]"
        />
        <button type="button" onClick={add}
          className="px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity whitespace-nowrap"
          style={{ backgroundColor: '#1e4659', color: '#ffffff' }}>
          + Aggiungi
        </button>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null); // project object
  const [form, setForm] = useState(EMPTY_FORM);
  const [gallery, setGallery] = useState([]); // array of URL strings
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null); // project object
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data ?? []);
    } catch {
      setError('Errore nel caricamento dei progetti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    // parse gallery: supporta sia array di stringhe che array di oggetti { src }
    const raw = project.gallery_images ?? [];
    setGallery(raw.map(item => (typeof item === 'string' ? item : item?.src ?? item?.url ?? '')).filter(Boolean));
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) { setFormError('Il titolo è obbligatorio.'); return; }

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Progetti</h1>
          <p className="text-gray-400 mt-1">{projects.length} progett{projects.length === 1 ? 'o' : 'i'}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-opacity"
          style={{ backgroundColor: '#1e4659', color: '#ffffff' }}
        >
          + Nuovo progetto
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blend-dark border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-20">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400 py-20 italic">Nessun progetto. Creane uno!</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Titolo</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Cliente</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Layout</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Data</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{p.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.client || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">
                      {p.layoutType ?? p.layout_type ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(p.projectDate ?? p.project_date).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                        style={{ backgroundColor: '#1e4659', color: '#ffffff', border: '1px solid #1e4659' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c5f7a'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e4659'}
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                        style={{ backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black">
                {modal === 'create' ? 'Nuovo progetto' : 'Modifica progetto'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Titolo *</label>
                  <input name="title" value={form.title} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]"
                    placeholder="Nome del progetto" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Slug</label>
                  <input name="slug" value={form.slug} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659] font-mono text-sm"
                    placeholder="auto-generato dal titolo se vuoto" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</label>
                  <input name="client" value={form.client} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Servizi</label>
                  <input name="services" value={form.services} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]"
                    placeholder="es. Branding, Web Design" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descrizione</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659] resize-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cover Image (URL)</label>
                  <input name="coverImage" value={form.coverImage} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]" />
                </div>

                <GalleryEditor images={gallery} onChange={setGallery} />

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Layout</label>
                  <select name="layoutType" value={form.layoutType} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]">
                    {LAYOUT_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Data progetto</label>
                  <input type="date" name="projectDate" value={form.projectDate} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e4659]" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                  Annulla
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#1e4659', color: '#ffffff' }}>
                  {saving ? 'Salvataggio…' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-black mb-2">Elimina progetto</h2>
            <p className="text-gray-500 mb-6">
              Sei sicuro di voler eliminare <span className="font-bold text-gray-800">"{confirmDelete.title}"</span>? L'operazione è irreversibile.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                Annulla
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                {deleting ? 'Eliminazione…' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
