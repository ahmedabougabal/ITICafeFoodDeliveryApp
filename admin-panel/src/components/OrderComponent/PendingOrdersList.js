import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingOrders } from '../../slices/orderSlice';
import OrderItem from './OrderItem';

const PendingOrdersList = () => {
  const dispatch = useDispatch();
  const { pendingOrders, status, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchPendingOrders())
    // Set up polling to fetch pending orders every 30 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchPendingOrders())
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Pending Orders</h2>
      {pendingOrders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
};

export default PendingOrdersList;
