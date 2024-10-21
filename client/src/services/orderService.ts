import axiosInstance from '../utils/AxiosInstance';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/orders/`;

export const orderService = {
  createOrder: async (orderData) => {
    try {
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      const response = await axiosInstance.post(`${API_URL}create-order/`, orderData);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  },

  fetchPendingOrders: async () => {
    try {
      console.log('Fetching pending orders...');
      const response = await axiosInstance.get(`${API_URL}orders/pending/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending orders:', error.response?.data || error.message);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      console.log('Fetching all orders...');
      const response = await axiosInstance.get(`${API_URL}orders/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error;
    }
  },

  getPastOrders: async () => {
    try {
      console.log('Fetching past orders...');
      const response = await axiosInstance.get(`${API_URL}past-orders/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching past orders:', error.response?.data || error.message);
      throw error;
    }
  },

  getLatestOrder: async () => {
    try {
      console.log('Fetching latest order...');
      const response = await axiosInstance.get(`${API_URL}latest-order/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest order:', error.response?.data || error.message);
      throw error;
    }
  },

  reorder: async (orderId) => {
    try {
      console.log(`Reordering order with ID: ${orderId}...`);
      const response = await axiosInstance.post(`${API_URL}${orderId}/reorder/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error reordering:', error.response?.data || error.message);
      throw error;
    }
  },

  acceptOrder: async (orderId) => {
    try {
      console.log(`Accepting order with ID: ${orderId}...`);
      const response = await axiosInstance.post(`${API_URL}orders/${orderId}/accept/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error accepting order:', error.response?.data || error.message);
      throw error;
    }
  },

  payOrder: async (orderId, method) => {
    try {
      console.log(`Paying order with ID: ${orderId}...`);
      const response = await axiosInstance.post(`${API_URL}${orderId}/pay/`,{"method": method});
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error paying order:', error.response?.data || error.message);
      throw error;
    }
  },

  ActiveOrders: async () => {
  try {
    console.log('Fetching active orders...');
    const response = await axiosInstance.get(`${API_URL}active-orders/`);
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching active orders:', error.response?.data || error.message);
    throw error;
  }
},


  rejectOrder: async (orderId) => {
    try {
      console.log(`Rejecting order with ID: ${orderId}...`);
      const response = await axiosInstance.post(`${API_URL}orders/${orderId}/reject/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting order:', error.response?.data || error.message);
      throw error;
    }
  },

  completeOrder: async (orderId) => {
    try {
      console.log(`Completing order with ID: ${orderId}...`);
      const response = await axiosInstance.post(`${API_URL}orders/${orderId}/complete/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing order:', error.response?.data || error.message);
      throw error;
    }
  },
  getNotifications: async () => {
    try {
      console.log('Fetching notifications...');
      const response = await axiosInstance.get(`${API_URL}notifications/`);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default orderService;