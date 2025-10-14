import axios from 'axios';
import type { User, Assignment, Submission, Feedback, AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),

  updateProfile: (data: { language?: string; firstName?: string; lastName?: string }) =>
    api.patch<User>('/auth/profile', data),
};

// Assignment API
export const assignmentAPI = {
  create: (data: Partial<Assignment>) =>
    api.post<Assignment>('/assignments', data),

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ assignments: Assignment[]; total: number; page: number; totalPages: number }>('/assignments', { params }),

  getById: (id: string) =>
    api.get<Assignment>(`/assignments/${id}`),

  update: (id: string, data: Partial<Assignment>) =>
    api.put<Assignment>(`/assignments/${id}`, data),

  delete: (id: string) =>
    api.delete(`/assignments/${id}`),
};

// Submission API
export const submissionAPI = {
  createOrUpdate: (data: FormData) =>
    api.post<Submission>('/submissions', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMy: (params?: { assignmentId?: string }) =>
    api.get<Submission[]>('/submissions/my', { params }),

  getById: (id: string) =>
    api.get<Submission>(`/submissions/${id}`),

  getByAssignment: (assignmentId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ submissions: Submission[]; total: number; page: number; totalPages: number }>(
      `/submissions/by-assignment/${assignmentId}`,
      { params }
    ),

  downloadAttachment: (attachmentId: string) =>
    api.get(`/submissions/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    }),
};

// Feedback API
export const feedbackAPI = {
  create: (data: { submissionId: string; content: string; grade?: number }) =>
    api.post<Feedback>('/feedback', data),

  update: (id: string, data: { content?: string; grade?: number }) =>
    api.put<Feedback>(`/feedback/${id}`, data),

  getBySubmission: (submissionId: string) =>
    api.get<Feedback[]>(`/feedback/by-submission/${submissionId}`),
};

// User API
export const userAPI = {
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<{ users: User[]; total: number; page: number; totalPages: number }>('/users', { params }),

  updateRole: (userId: string, role: string) =>
    api.patch<User>(`/users/${userId}/role`, { role }),
};

export default api;
