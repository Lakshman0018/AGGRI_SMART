import axios from 'axios';
import toast from 'react-hot-toast';
import { handleMockRequest } from './mockInterceptor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9653/api';

// Save reference to default adapter
const defaultAxiosAdapter = axios.defaults.adapter;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: async (config) => {
    const isMockMode = localStorage.getItem('agrismart_demo_mode') === 'true';
    if (isMockMode) {
      return handleMockRequest(config);
    }
    
    try {
      const adapter = defaultAxiosAdapter;
      if (typeof adapter !== 'function') {
        return handleMockRequest(config);
      }
      return await adapter(config);
    } catch (error) {
      // On network connection error, automatically fallback to mock database
      const isNetworkError = !error.response;
      if (isNetworkError) {
        console.warn('📡 Network connection failed. Automatically falling back to offline mock database.');
        localStorage.setItem('agrismart_demo_mode', 'true');
        return handleMockRequest(config);
      }
      throw error;
    }
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('token', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/my-products', { params }),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  bulkUpdate: (data) => api.post('/products/bulk-update', data),
  getCategories: () => api.get('/products/categories'),
  getFeatured: (limit) => api.get('/products/featured', { params: { limit } }),
  getTrending: () => api.get('/products/trending'),
  rateProduct: (id, data) => api.post(`/products/${id}/rate`, data),
  getAnalytics: (id) => api.get(`/products/${id}/analytics`),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
  processPayment: (id, data) => api.post(`/orders/${id}/payment`, data),
};

// Disease Detection API
export const diseaseAPI = {
  scan: (formData) => api.post('/disease/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyScans: (params) => api.get('/disease/my-scans', { params }),
  getScanById: (id) => api.get(`/disease/scan/${id}`),
  updateScan: (id, data) => api.put(`/disease/scan/${id}`, data),
  getExpertReview: (id) => api.get(`/disease/scan/${id}/review`),
  submitExpertReview: (id, data) => api.post(`/disease/scan/${id}/review`, data),
};

// Soil API
export const soilAPI = {
  createReport: (data) => api.post('/soil/report', data),
  getReports: (params) => api.get('/soil/reports', { params }),
  getReportById: (id) => api.get(`/soil/report/${id}`),
  updateReport: (id, data) => api.put(`/soil/report/${id}`, data),
  getRecommendations: (data) => api.post('/soil/recommendations', data),
  compareReports: (ids) => api.post('/soil/compare', { reportIds: ids }),
};

// Crop API
export const cropAPI = {
  getRecommendations: (params) => api.get('/crop/recommendations', { params }),
  getCalendar: (params) => api.get('/crop/calendar', { params }),
  getSeasonalCrops: (season, location) => api.get('/crop/seasonal', {
    params: { season, location },
  }),
  getCropDetails: (cropName) => api.get(`/crop/details/${cropName}`),
  saveCropPlan: (data) => api.post('/crop/plan', data),
  getMyCropPlans: () => api.get('/crop/my-plans'),
};

// Weather API
export const weatherAPI = {
  getForecast: (location) => api.get('/weather/forecast', { params: { location } }),
  getAlerts: (location) => api.get('/weather/alerts', { params: { location } }),
  getInsights: (location) => api.get('/weather/insights', { params: { location } }),
  getHistorical: (location, days) => api.get('/weather/historical', {
    params: { location, days },
  }),
  subscribeToAlerts: (data) => api.post('/weather/subscribe', data),
};

// Government Schemes API
export const schemeAPI = {
  getAll: (params) => api.get('/schemes', { params }),
  getById: (id) => api.get(`/schemes/${id}`),
  apply: (id, data) => api.post(`/schemes/${id}/apply`, data),
  getMyApplications: () => api.get('/schemes/my-applications'),
  checkEligibility: (id, data) => api.post(`/schemes/${id}/check-eligibility`, data),
};

// Price Trends API
export const priceAPI = {
  getTrends: (params) => api.get('/prices/trends', { params }),
  getByProduct: (productId) => api.get(`/prices/product/${productId}`),
  getMarketPrices: (location) => api.get('/prices/market', { params: { location } }),
  getPredictions: (productId) => api.get(`/prices/predictions/${productId}`),
  subscribeToAlerts: (data) => api.post('/prices/subscribe', data),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  updateSettings: (data) => api.put('/notifications/settings', data),
};

// Info API
export const infoAPI = {
  getFertilizers: () => api.get('/info/fertilizers'),
  getPests: () => api.get('/info/pests'),
  getDiseases: () => api.get('/info/diseases'),
  getPesticides: () => api.get('/info/pesticides'),
  getCropGuides: () => api.get('/info/crop-guides'),
  getVideoTutorials: () => api.get('/info/tutorials'),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadDocument: (formData) => api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteFile: (url) => api.delete('/upload/file', { data: { url } }),
};

export default api;
