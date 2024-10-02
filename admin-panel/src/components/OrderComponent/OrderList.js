import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../slices/orderSlice';

const OrderList = () => {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders.orders);
  const error = useSelector(state => state.orders.error);

  useEffect(() => {
    dispatch(fetchOrders())
      .then(() => {
        console.log('Orders fetched successfully');
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, [dispatch]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.name}</div>
      ))}
    </div>
  );
};

export default OrderList;
