import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('task_token');
      localStorage.removeItem('task_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ── Auth ──────────────────────────────────────────
  login: async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    localStorage.setItem('task_token', data.token);
    return data;
  },

  signup: async (name, email, password, role) => {
    const { data } = await axiosInstance.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('task_token', data.token);
    return data;
  },

  getMe: async () => {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  // ── Users ─────────────────────────────────────────
  getUsers: async () => {
    const { data } = await axiosInstance.get('/users');
    return data;
  },

  updateUserRole: async (userId, role) => {
    const { data } = await axiosInstance.patch(`/users/${userId}/role`, { role });
    return data;
  },

  deactivateUser: async (userId) => {
    const { data } = await axiosInstance.patch(`/users/${userId}/deactivate`);
    return data;
  },

  getMyTeam: async () => {
    const { data } = await axiosInstance.get('/users/team');
    return data;
  },

  // ── Projects ──────────────────────────────────────
  getProjects: async () => {
    const { data } = await axiosInstance.get('/projects');
    return data;
  },

  getProject: async (id) => {
    const { data } = await axiosInstance.get(`/projects/${id}`);
    return data;
  },

  createProject: async (projectData) => {
    const { data } = await axiosInstance.post('/projects', projectData);
    return data;
  },

  updateProject: async (id, projectData) => {
    const { data } = await axiosInstance.put(`/projects/${id}`, projectData);
    return data;
  },

  deleteProject: async (id) => {
    const { data } = await axiosInstance.delete(`/projects/${id}`);
    return data;
  },

  archiveProject: async (id) => {
    const { data } = await axiosInstance.patch(`/projects/${id}/archive`);
    return data;
  },

  addProjectMember: async (projectId, userId, role) => {
    const { data } = await axiosInstance.post(`/projects/${projectId}/members`, { userId, role });
    return data;
  },

  removeProjectMember: async (projectId, userId) => {
    const { data } = await axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
    return data;
  },

  // ── Tasks ─────────────────────────────────────────
  getProjectTasks: async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}/tasks`);
    return data;
  },

  getAllTasks: async () => {
    const { data } = await axiosInstance.get('/tasks');
    return data;
  },

  createTask: async (projectId, taskData) => {
    const { data } = await axiosInstance.post(`/projects/${projectId}/tasks`, taskData);
    return data;
  },

  updateTask: async (taskId, taskData) => {
    const { data } = await axiosInstance.put(`/tasks/${taskId}`, taskData);
    return data;
  },

  updateTaskStatus: async (taskId, status) => {
    const { data } = await axiosInstance.patch(`/tasks/${taskId}/status`, { status });
    return data;
  },

  deleteTask: async (taskId) => {
    const { data } = await axiosInstance.delete(`/tasks/${taskId}`);
    return data;
  },

  addComment: async (taskId, text) => {
    const { data } = await axiosInstance.post(`/tasks/${taskId}/comments`, { text });
    return data;
  },

  // ── Dashboard ─────────────────────────────────────
  getDashboardStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await axiosInstance.get(`/dashboard/stats${query}`);
    return data;
  },

  // ── Activity ──────────────────────────────────────
  getProjectActivity: async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}/activity`);
    return data;
  },
};

export default api;
