import axios from 'axios';
import localProjects from '../data/projects.json';

// Change this URL if your PHP backend is running on a different port/host
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Allega il JWT token ad ogni richiesta se presente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('blend_admin_token');
    if (token && token !== 'undefined' && token !== 'null') {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Helper to detect if we should use local JSON (GitHub Pages) or Real Backend
const isStaticEnv = () => {
    // Check if hostname is github.io OR if we explicitly set a VITE_MODE to static
    return window.location.hostname.includes('github.io') || import.meta.env.VITE_APP_MODE === 'static';
};

export const getProjects = async () => {
    if (isStaticEnv()) {
        console.log("Using static data for GitHub Pages / Static Mode");
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: "success", data: localProjects });
            }, 300);
        });
    }

    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        throw error;
    }
};

export const getPageContent = async (slug) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/content/${slug}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching content for ${slug}:`, error);
        return null;
    }
};

export const getProjectById = async (id) => {
    if (isStaticEnv()) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if id is numeric (id) or string (slug)
                const project = localProjects.find(p => p.id == id || p.slug === id);

                if (project) {
                    resolve({
                        status: "success",
                        data: project
                    });
                } else {
                    resolve({
                        status: "error",
                        message: "Project not found"
                    });
                }
            }, 300);
        });
    }

    try {
        const response = await api.get(`/project?id=${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching project ${id} from backend:`, error);
        throw error;
    }
};

// ── Admin CRUD ─────────────────────────────────────────────────────────────

export const createProject = async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

// ── Admin Messaggi ─────────────────────────────────────────────────────────

export const getMessages = async () => {
    const response = await api.get('/admin/messages');
    return response.data;
};

export const markMessageRead = async (id) => {
    const response = await api.patch(`/admin/messages/${id}/read`);
    return response.data;
};

export const deleteMessage = async (id) => {
    const response = await api.delete(`/admin/messages/${id}`);
    return response.data;
};

export const replyMessage = async (id, payload) => {
    /* payload può essere una stringa (legacy) o { body, to, cc, bcc } */
    const data = typeof payload === 'string'
        ? { body: payload, to: [], cc: [], bcc: [] }
        : payload;
    const response = await api.post(`/admin/messages/${id}/reply`, data);
    return response.data;
};

// ── Upload immagini ──────────────────────────────────────────────────────

export const uploadImage = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/admin/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { status, url, file_name }
};

export const deleteUploadedImage = async (fileName) => {
    const response = await api.delete(`/admin/upload/image/${fileName}`);
    return response.data;
};

// ── Firma email ────────────────────────────────────────────────────────────

export const getSignature = async () => {
    const response = await api.get('/admin/settings/signature');
    return response.data;
};

export const uploadSignature = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/admin/settings/signature', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ── Contenuti MongoDB ──────────────────────────────────────────────────────

export const getContent = async (slug) => {
    const response = await api.get(`/content/${slug}`);
    return response.data;
};

export const getAllContent = async () => {
    const response = await api.get('/admin/content');
    return response.data;
};

export const updateContent = async (slug, data) => {
    const response = await api.put(`/admin/content/${slug}`, { slug, data });
    return response.data;
};

// -- Admin Utenti --

export const getUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const createUser = async (email, password) => {
    const response = await api.post('/admin/users', { email, password });
    return response.data;
};

export const changeUserPassword = async (id, password) => {
    const response = await api.patch(`/admin/users/${id}/password`, { password });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

// ── Analytics (servizio Python porta 8001) ─────────────────────────────

const ANALYTICS_BASE = import.meta.env.VITE_ANALYTICS_BASE_URL || 'http://localhost:8001';

export const getAnalyticsStats = async () => {
    const r = await fetch(`${ANALYTICS_BASE}/stats`);
    if (!r.ok) throw new Error('Analytics stats failed');
    return r.json();
};

export const getAnalyticsTrends = async (days = 30) => {
    const r = await fetch(`${ANALYTICS_BASE}/trends?days=${days}`);
    if (!r.ok) return [];
    return r.json();
};

export const getAnalyticsTopPages = async (limit = 10) => {
    const r = await fetch(`${ANALYTICS_BASE}/top-pages?limit=${limit}`);
    if (!r.ok) return [];
    return r.json();
};

export const getAnalyticsTopActions = async (limit = 10) => {
    const r = await fetch(`${ANALYTICS_BASE}/top-actions?limit=${limit}`);
    if (!r.ok) return [];
    return r.json();
};

export const getAnalyticsEvents = async (page = 1, limit = 50) => {
    const r = await fetch(`${ANALYTICS_BASE}/events?page=${page}&limit=${limit}`);
    if (!r.ok) return null;
    return r.json();
};

export const getAnalyticsScrollDepth = async () => {
    const r = await fetch(`${ANALYTICS_BASE}/scroll-depth`);
    if (!r.ok) return [];
    return r.json();
};

export const getAnalyticsHourly = async () => {
    const r = await fetch(`${ANALYTICS_BASE}/hourly-traffic`);
    if (!r.ok) return [];
    return r.json();
};

export default api;
