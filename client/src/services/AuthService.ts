import axios from 'axios';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api-auth/`;

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}login`, { username, password });
      if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}register/`, { username, email, password });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },


  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
};

axios.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.access) {
      config.headers['Authorization'] = 'Bearer ' + user.access;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);