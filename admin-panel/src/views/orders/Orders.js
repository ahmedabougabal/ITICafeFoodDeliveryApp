import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CForm, CFormInput } from '@coreui/react';
import { fetchPendingOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';
import orderService from 'src/services/orderService';

export default function Orders() {
  const dispatch = useDispatch();
  const pendingOrders = useSelector((state) => state.orders.pendingOrders || []);
  const status = useSelector((state) => state.orders.status);
  const error = useSelector((state) => state.orders.error);

  const [activeTab, setActiveTab] = useState('pending');
  const [preparationTime, setPreparationTime] = useState('');

  useEffect(() => {
    dispatch(fetchPendingOrders());
  }, [dispatch]);

  useEffect(() => {
    console.log('pendingOrders:', pendingOrders);
  }, [pendingOrders]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleAcceptOrder = async (orderId) => {
    if (!preparationTime) {
      alert('Please enter a preparation time');
      return;
    }
    try {
      await orderService.acceptOrder(orderId, parseInt(preparationTime));
      dispatch(fetchPendingOrders());
      setPreparationTime('');
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await orderService.rejectOrder(orderId);
      dispatch(fetchPendingOrders());
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
            <strong>Orders</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12}>
                <CButton
                  color={activeTab === 'pending' ? 'primary' : 'secondary'}
                  onClick={() => handleTabClick('pending')}
                  className="me-2"
                >
                  Pending
                </CButton>
                <CButton
                  color={activeTab === 'preparing' ? 'primary' : 'secondary'}
                  onClick={() => handleTabClick('preparing')}
                  className="me-2"
                >
                  Preparing
                </CButton>
                <CButton
                  color={activeTab === 'completed' ? 'primary' : 'secondary'}
                  onClick={() => handleTabClick('completed')}
                >
                  Completed
                </CButton>
              </CCol>
            </CRow>
            <CRow className="mt-3">
              {Array.isArray(pendingOrders) ? (
                pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <CCol xs={12} md={6} xl={4} key={order.id}>
                      <CCard className="mb-4">
                        <CCardHeader>Order #{order.id}</CCardHeader>
                        <CCardBody>
                          <p><strong>Total Price:</strong> ${order.total_price}</p>
                          <p><strong>Status:</strong> {order.status}</p>
                          <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
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
                )
              ) : (
                <CCol>
                  <p>Error: Pending orders data is not in the expected format.</p>
                </CCol>
              )}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
