import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CForm, CFormInput } from '@coreui/react';
import Price from '../Price/Price';

const OrderCard = ({ order, onAccept, onReject }) => {
  const [preparationTime, setPreparationTime] = useState('');

  const handleAccept = () => {
    if (!preparationTime) {
      alert('Please enter a preparation time');
      return;
    }
    onAccept(order.id, parseInt(preparationTime));
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Order #{order.id}</CCardHeader>
      <CCardBody>
        <p><strong>Total Price:</strong> <Price price={`${order.total_price}`}/></p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Items:</strong></p>
        <ul>
          {order.items && order.items.map((item, index) => (
            <li key={index}>{item.item.name} - Quantity: {item.quantity}</li>
          ))}
        </ul>
        <CForm>
          <CFormInput
            type="number"
            label="Preparation Time (minutes)"
            value={preparationTime}
            onChange={(e) => setPreparationTime(e.target.value)}
            required
          />
          <CButton
            color="success"
            onClick={handleAccept}
            className="me-2 mt-2"
          >
            Accept
          </CButton>
          <CButton
            color="danger"
            onClick={() => onReject(order.id)}
            className="mt-2"
          >
            Reject
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

const OrderList = () => {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders.allOrders);
  const error = useSelector(state => state.orders.error);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    dispatch(fetchActiveOrders())
      .then(() => {
        console.log('Active orders fetched successfully');
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching active orders:', error);
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  const handleAcceptOrder = async (orderId, preparationTime) => {
    try {
      await dispatch(acceptOrder({ id: orderId, preparationTime }));
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await dispatch(rejectOrder(orderId));
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Active Orders</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {orders.map(order => (
                <CCol xs={12} md={6} xl={4} key={order.id}>
                  <OrderCard
                    order={order}
                    onAccept={handleAcceptOrder}
                    onReject={handleRejectOrder}
                  />
                </CCol>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default OrderList;
