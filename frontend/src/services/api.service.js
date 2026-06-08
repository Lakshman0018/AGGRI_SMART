import axios from 'axios';
import { API_CONFIG, API_ERRORS } from '../config/api.config';
import { handleMockRequest } from './mockInterceptor';

// Save reference to default adapter
const defaultAxiosAdapter = axios.defaults.adapter;

// Create axios instance with absolute URL to backend
// This ensures all API calls go to http://localhost:9653/api
const api = axios.create({
  baseURL: 'http://localhost:9653/api', // Absolute URL - ensures correct port
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

// Debug: Log the base URL on initialization
console.log('🔗 API Base URL configured:', api.defaults.baseURL);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the full URL being called for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    
    // Add auth token if available
    const token = localStorage.getItem('agrismart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    }

    // Add timestamp to prevent caching for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - ONLY handles successful responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    // Return the data directly (server response body)
    return response.data;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      console.error(`❌ API Error Response: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error(`❌ API Network Error: No response received`, {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        code: error.code,
        message: error.message
      });
    } else {
      console.error('❌ API Error:', error.message);
    }
    // For errors, let them pass through to be handled by ApiService methods
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // GET request
  async get(url, params = {}) {
    try {
      const response = await api.get(url, { params });
      return response; // This is already response.data from interceptor
    } catch (error) {
      return this.handleError(error);
    }
  }

  // POST request
  async post(url, data = {}) {
    try {
      const response = await api.post(url, data);
      return response; // This is already response.data from interceptor
    } catch (error) {
      return this.handleError(error);
    }
  }

  // PUT request
  async put(url, data = {}) {
    try {
      const response = await api.put(url, data);
      return response; // This is already response.data from interceptor
    } catch (error) {
      return this.handleError(error);
    }
  }

  // PATCH request
  async patch(url, data = {}) {
    try {
      const response = await api.patch(url, data);
      return response; // This is already response.data from interceptor
    } catch (error) {
      return this.handleError(error);
    }
  }

  // DELETE request
  async delete(url) {
    try {
      const response = await api.delete(url);
      return response; // This is already response.data from interceptor
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Handle errors consistently
  handleError(error) {
    // If no response, it's a network error
    if (!error.response) {
      let errorMessage = API_ERRORS.NETWORK_ERROR;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:9653';
      } else if (error.code === 'ERR_CORS' || error.message?.includes('CORS')) {
        errorMessage = 'CORS error: Backend may not be allowing requests from frontend. Check CORS configuration.';
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = API_ERRORS.TIMEOUT_ERROR;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('🔴 Network Error Details:', {
        code: error.code,
        message: error.message,
        config: error.config ? {
          url: error.config.url,
          baseURL: error.config.baseURL,
          method: error.config.method
        } : 'No config'
      });
      
      return { success: false, error: errorMessage };
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    let errorMessage = data?.message || 'An unexpected error occurred';

    switch (status) {
      case 400:
        errorMessage = data?.message || API_ERRORS.VALIDATION_ERROR;
        break;
      case 401:
        errorMessage = data?.message || API_ERRORS.AUTH_ERROR;
        break;
      case 403:
        errorMessage = API_ERRORS.PERMISSION_DENIED;
        break;
      case 404:
        errorMessage = API_ERRORS.NOT_FOUND;
        break;
      case 408:
        errorMessage = API_ERRORS.TIMEOUT_ERROR;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = API_ERRORS.SERVER_ERROR;
        break;
      default:
        errorMessage = data?.message || 'An unexpected error occurred';
    }

    return { success: false, error: errorMessage };
  }

  // File upload
  async upload(url, formData, onProgress = null) {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Download file
  async download(url, filename) {
    try {
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export singleton instance
export default new ApiService();

// Export axios instance for custom configurations
export { api };
