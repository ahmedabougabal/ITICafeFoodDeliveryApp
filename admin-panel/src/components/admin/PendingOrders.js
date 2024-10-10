import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CForm, CFormInput } from '@coreui/react';
import { fetchActiveOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';
import withAuth from '../../utils/withAuth';

const PendingOrders = () => {
  const dispatch = useDispatch();
  const activeOrders = useSelector((state) => state.orders.activeOrders || []);
  const status = useSelector((state) => state.orders.status);
  const error = useSelector((state) => state.orders.error);

  const [preparationTime, setPreparationTime] = useState('');

  useEffect(() => {
    const fetchOrders = () => {
      console.log('Fetching pending orders...');
      dispatch(fetchActiveOrders())
        .then(() => console.log('Fetch completed'))
        .catch((error) => console.error('Fetch error:', error));
    };

    fetchOrders(); // Initial fetch

    // Set up interval to fetch orders every 30 seconds (polling)
    const intervalId = setInterval(fetchOrders, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleAcceptOrder = async (orderId) => {
    if (!preparationTime) {
      alert('Please enter a preparation time');
      return;
    }
    try {
      await dispatch(acceptOrder({ id: orderId, preparationTime: parseInt(preparationTime) }));
      dispatch(fetchActiveOrders());
      setPreparationTime('');
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await dispatch(rejectOrder(orderId));
      dispatch(fetchActiveOrders());
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Pending Orders</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mt-3">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <CCol xs={12} md={6} xl={4} key={order.id}>
                    <CCard className="mb-4">
                      <CCardHeader>Order #{order.id}</CCardHeader>
                      <CCardBody>
                        <p><strong>Total Price:</strong> ${order.total_price}</p>
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
                            id={`preparationTime-${order.id}`}
                            label="Preparation Time (minutes)"
                            value={preparationTime}
                            onChange={(e) => setPreparationTime(e.target.value)}
                            required
                          />
                          <CButton
                            color="success"
                            onClick={() => handleAcceptOrder(order.id)}
                            className="me-2 mt-2"
                          >
                            Accept
                          </CButton>
                          <CButton
                            color="danger"
                            onClick={() => handleRejectOrder(order.id)}
                            className="mt-2"
                          >
                            Reject
                          </CButton>
                        </CForm>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))
              ) : (
                <CCol>
                  <p>No pending orders at the moment.</p>
                </CCol>
              )}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default withAuth(PendingOrders);