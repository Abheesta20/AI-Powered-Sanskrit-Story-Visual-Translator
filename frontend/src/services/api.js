import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://ai-powered-sanskrit-story-visual.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (adds JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



// ==================== AUTH API ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login/json', data),

  getCurrentUser: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/auth/me', data),

  changePassword: (data) =>
    api.post('/auth/change-password', data),

  logout: () => api.post('/auth/logout'),
};



// ==================== UPLOAD API ====================
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadText: (text) =>
    api.post('/uploads/text', {
      original_text: text,
      file_type: 'text',
    }),

  getUploads: (page = 1, pageSize = 10) =>
    api.get('/uploads/', {
      params: {
        page,
        page_size: pageSize,
      },
    }),

  getUpload: (id) =>
    api.get(`/uploads/${id}`),

  deleteUpload: (id) =>
    api.delete(`/uploads/${id}`),

  extractText: (id) =>
    api.post(`/uploads/${id}/extract`),
};



// ==================== TRANSLATION API ====================
export const translationAPI = {
  createTranslation: (
    uploadId,
    targetLanguage,
    sourceText = null
  ) =>
    api.post('/translations/', {
      upload_id: uploadId,
      target_language: targetLanguage,
      source_text: sourceText,
    }),

  translateDirect: (
    sourceText,
    targetLanguage = 'telugu'
  ) =>
    api.post('/translations/direct', {
      source_text: sourceText,
      target_language: targetLanguage,
    }),

  getTranslations: (
    page = 1,
    pageSize = 10,
    targetLanguage = null
  ) =>
    api.get('/translations/', {
      params: {
        page,
        page_size: pageSize,
        target_language: targetLanguage,
      },
    }),

  getTranslation: (id) =>
    api.get(`/translations/${id}`),

  getTranslationResult: (id) =>
    api.get(`/translations/${id}/result`),

  getHistory: (limit = 20) =>
    api.get('/translations/history', {
      params: { limit },
    }),

  deleteTranslation: (id) =>
    api.delete(`/translations/${id}`),

  getSupportedLanguages: () =>
    api.get('/translations/languages/supported'),
};

export default api;