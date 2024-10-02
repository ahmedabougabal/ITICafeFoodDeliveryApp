import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/orders/';

const getAuthToken = () => localStorage.getItem('authToken');

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const orderService = {
  getAllOrders: async () => {
    const response = await axiosInstance.get('');
    return response.data;
  },

  getOrder: async (id) => {
    const response = await axiosInstance.get(`${id}/`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axiosInstance.post('', orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await axiosInstance.patch(`${id}/`, orderData);
    return response.data;
  },

  completeAndPayOrder: async (id) => {
    const response = await axiosInstance.post(`${id}/complete_and_pay/`);
    return response.data;
  },

  getPastOrders: async () => {
    const response = await axiosInstance.get('past-orders/');
    return response.data;
  },

  getActiveOrders: async () => {
    const response = await axiosInstance.get('active-orders/');
    return response.data;
  },

  acceptOrder: async (id, preparationTime) => {
    const response = await axiosInstance.post(`${id}/accept/`, { preparation_time: preparationTime });
    return response.data;
  },

  rejectOrder: async (id) => {
    const response = await axiosInstance.post(`${id}/reject/`);
    return response.data;
  },

  getPendingOrders: async () => {
    const response = await axiosInstance.get('pending/');
    return response.data;
  },

  markAsCompleted: async (id) => {
    const response = await axiosInstance.post(`${id}/complete/`);
    return response.data;
  },
};

export default orderService;
