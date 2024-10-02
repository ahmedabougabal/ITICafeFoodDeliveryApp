import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { acceptOrder, rejectOrder, markOrderAsCompleted } from '../../slices/orderSlice';

const OrderItem = ({ order }) => {
  const dispatch = useDispatch();
  const [preparationTime, setPreparationTime] = useState('')

  const handleAccept = () => {
    if (preparationTime) {
      dispatch(acceptOrder({ id: order.id, preparationTime: parseInt(preparationTime) }))
    } else {
      alert('Please set a preparation time before accepting the order.')
    }
  };

  const handleReject = () => {
    dispatch(rejectOrder(order.id));
  };

  const handleComplete = () => {
    dispatch(markOrderAsCompleted(order.id));
  };

  return (
    <div>
      <h3>Order #{order.id}</h3>
      <p>Status: {order.status}</p>
      <p>Total Price: ${order.total_price}</p>
      <p>Payment Method: Cash on Pickup</p>
      {order.preparation_time && <p>Preparation Time: {order.preparation_time} minutes</p>}
      {order.status === 'pending' && (
        <>
          <input
            type="number"
            value={preparationTime}
            onChange={(e) => setPreparationTime(e.target.value)}
            placeholder="Preparation time (minutes)"
          />
          <button onClick={handleAccept}>Accept Order</button>
          <button onClick={handleReject}>Reject Order</button>
        </>
      )}
      {order.status === 'ready' && (
        <button onClick={handleComplete}>Mark as Completed and Paid</button>
      )}
    </div>
  );
};

export default OrderItem;
