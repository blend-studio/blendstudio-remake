import axios from 'axios';
import localProjects from '../data/projects.json';

// Change this URL if your PHP backend is running on a different port/host
const API_BASE_URL = 'http://localhost:8000/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies/sessions if needed
    headers: {
        'Content-Type': 'application/json',
    },
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
        console.error("Error fetching projects from backend:", error);
        throw error;
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

export default api;
