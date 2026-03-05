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

export const replyMessage = async (id, body) => {
    const response = await api.post(`/admin/messages/${id}/reply`, { body });
    return response.data;
};

export default api;
