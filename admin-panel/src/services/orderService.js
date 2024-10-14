import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add an interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const orderService = {
  getActiveOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/active-orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error.response || error);
      throw error;
    }
  },
  getAdminActiveOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/admin-active-orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error.response || error);
      throw error;
    }
  },

  getOrder: async (id) => {
    try {
      const response = await axiosInstance.get(`/orders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error.response || error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/orders/', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response || error);
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await axiosInstance.patch(`/orders/${id}/`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error.response || error);
      throw error;
    }
  },

  completeAndPayOrder: async (id) => {
    try {
      const response = await axiosInstance.post(`/orders/${id}/complete_and_pay/`);
      return response.data;
    } catch (error) {
      console.error('Error completing and paying order:', error.response || error);
      throw error;
    }
  },

  getPastOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/past-orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching past orders:', error.response || error);
      throw error;
    }
  },

  getActiveOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/active-orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error.response || error);
      throw error;
    }
  },

  acceptOrder: async (orderId, preparationTime) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/accept/`, {preparation_time: preparationTime});
      return response.data;
    } catch (error) {
      console.error('Error accepting order:', error.response || error);
      throw error;
    }
  },

  rejectOrder: async (orderId) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/reject/`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting order:', error.response || error);
      throw error;
    }
  },

  getPendingOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders/pending-orders/');
      console.log('API Response:', response);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  markAsCompleted: async (id) => {
    try {
      const response = await axiosInstance.post(`/orders/${id}/complete/`);
      return response.data;
    } catch (error) {
      console.error('Error marking order as completed:', error.response || error);
      throw error;
    }
  },

  connectToOrderUpdates: (onMessageCallback) => {
    const ws = new WebSocket('ws://localhost:8000/ws/orders/');

    ws.onopen = () => {
      console.log('Connected to orders WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_notification') {
        onMessageCallback(data.order);
      }
    };

    return ws;
  },
};

export default orderService;
