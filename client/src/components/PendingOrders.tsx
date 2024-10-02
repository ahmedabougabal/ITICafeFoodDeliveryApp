import { useEffect, useState } from 'react';
import fetchPendingOrders from '../services/orderService.ts'
const PendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const orders = await fetchPendingOrders();
        setPendingOrders(orders);
      } catch (error) {
        console.error('Error loading pending orders:', error);
      }
    };

    loadPendingOrders();
  }, []);

  return (
    <div>
      <h2>Pending Orders</h2>
      {pendingOrders.map(order => (
        <div key={order.id}>
          <p>Order ID: {order.id}</p>
          <p>Total: ${order.total_price}</p>
          {/* Add more order details as needed */}
        </div>
      ))}
    </div>
  );
};

export default PendingOrders;