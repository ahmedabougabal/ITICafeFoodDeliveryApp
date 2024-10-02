import { store } from '../store';
import { fetchPendingOrders } from '../slices/orderSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket('ws://localhost:8000/ws/notifications/');

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_order') {
        // Fetch pending orders when a new order is received
        store.dispatch(fetchPendingOrders());
      } else if (data.type === 'order_status_changed') {
        store.dispatch(fetchPendingOrders());
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default new WebSocketService();
