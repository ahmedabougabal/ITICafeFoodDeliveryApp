// import axiosInstance from "axios";
import axiosInstance from '../utils/AxiosInstance';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/orders/`;

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/api/orders/create-order/', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  fetchPendingOrders: async () => {
    try {
      const response = await axiosInstance.get('/api/orders/pending/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  },

  getActiveOrders: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}active_orders/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPastOrders: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}past_orders/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;