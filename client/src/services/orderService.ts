import axios from 'axios';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/orders/`;

export const orderService = {
  createOrder: async (orderData: any) => {
    try {
      const response = await axios.post(API_URL, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  },

  getActiveOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}active_orders/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPastOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}past_orders/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};