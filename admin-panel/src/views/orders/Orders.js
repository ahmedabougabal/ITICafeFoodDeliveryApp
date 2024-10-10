import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CForm, CFormInput, CListGroup, CListGroupItem } from '@coreui/react';
import { fetchPendingOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';

const Orders = () => {
  const dispatch = useDispatch();
  const pendingOrders = useSelector((state) => state.orders.pendingOrders || []);
  const status = useSelector((state) => state.orders.status);
  const error = useSelector((state) => state.orders.error);

  const [activeTab, setActiveTab] = useState('pending');
  const [preparationTime, setPreparationTime] = useState('');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  // Function to fetch pending orders
  const fetchOrders = () => {
    dispatch(fetchPendingOrders());
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [dispatch]);

  // Set up polling to fetch orders every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [dispatch]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleAcceptOrder = async (orderId) => {
    if (!preparationTime) {
      alert('Please enter a preparation time');
      return;
    }
    try {
      await dispatch(acceptOrder({ id: orderId, preparationTime: parseInt(preparationTime) }));
      fetchOrders(); // Fetch orders immediately after accepting
      setPreparationTime('');
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await dispatch(rejectOrder(orderId));
      fetchOrders(); // Fetch orders immediately after rejecting
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleCompleteOrder = (orderId) => {
    const updatedPreparingOrders = preparingOrders.filter(order => order.id !== orderId);
    const completedOrder = preparingOrders.find(order => order.id === orderId);
    setPreparingOrders(updatedPreparingOrders);
    setCompletedOrders([...completedOrders, completedOrder]);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Orders</h1>
      <div>
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
      </div>
      <CButton onClick={fetchOrders} color="primary" className="mb-3">
        Refresh Orders
      </CButton>
      {activeTab === 'pending' && (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Pending Orders</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="mt-3">
                  {Array.isArray(pendingOrders) && pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <CCol xs={12} md={6} xl={4} key={order.id}>
                        <CCard className="mb-4">
                          <CCardHeader>Order #{order.id}</CCardHeader>
                          <CCardBody>
                            <CListGroup flush>
                              <CListGroupItem><strong>Total Price:</strong> ${order.total_price}</CListGroupItem>
                              <CListGroupItem><strong>Status:</strong> {order.status}</CListGroupItem>
                              <CListGroupItem><strong>Payment Status:</strong> {order.payment_status}</CListGroupItem>
                              <CListGroupItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</CListGroupItem>
                              <CListGroupItem><strong>Branch:</strong> {order.branch_name}</CListGroupItem>
                              <CListGroupItem><strong>User:</strong> {order.user}</CListGroupItem>
                              <CListGroupItem>
                                <strong>Items:</strong>
                                <ul>
                                  {order.items && order.items.map((item, index) => (
                                    <li key={index}>
                                      {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                                    </li>
                                  ))}
                                </ul>
                              </CListGroupItem>
                            </CListGroup>
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
      )}
      {activeTab === 'preparing' && (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Preparing Orders</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="mt-3">
                  {Array.isArray(preparingOrders) && preparingOrders.length > 0 ? (
                    preparingOrders.map((order) => (
                      <CCol xs={12} md={6} xl={4} key={order.id}>
                        <CCard className="mb-4">
                          <CCardHeader>Order #{order.id}</CCardHeader>
                          <CCardBody>
                            <CListGroup flush>
                              <CListGroupItem><strong>Total Price:</strong> ${order.total_price}</CListGroupItem>
                              <CListGroupItem><strong>Status:</strong> {order.status}</CListGroupItem>
                              <CListGroupItem><strong>Payment Status:</strong> {order.payment_status}</CListGroupItem>
                              <CListGroupItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</CListGroupItem>
                              <CListGroupItem><strong>Branch:</strong> {order.branch_name}</CListGroupItem>
                              <CListGroupItem><strong>User:</strong> {order.user}</CListGroupItem>
                              <CListGroupItem>
                                <strong>Items:</strong>
                                <ul>
                                  {order.items && order.items.map((item, index) => (
                                    <li key={index}>
                                      {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                                    </li>
                                  ))}
                                </ul>
                              </CListGroupItem>
                            </CListGroup>
                            <CButton
                              color="success"
                              onClick={() => handleCompleteOrder(order.id)}
                              className="mt-2"
                            >
                              Mark as Completed
                            </CButton>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))
                  ) : (
                    <CCol>
                      <p>No orders are currently being prepared.</p>
                    </CCol>
                  )}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
      {activeTab === 'completed' && (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Completed Orders</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="mt-3">
                  {Array.isArray(completedOrders) && completedOrders.length > 0 ? (
                    completedOrders.map((order) => (
                      <CCol xs={12} md={6} xl={4} key={order.id}>
                        <CCard className="mb-4">
                          <CCardHeader>Order #{order.id}</CCardHeader>
                          <CCardBody>
                            <CListGroup flush>
                              <CListGroupItem><strong>Total Price:</strong> ${order.total_price}</CListGroupItem>
                              <CListGroupItem><strong>Status:</strong> {order.status}</CListGroupItem>
                              <CListGroupItem><strong>Payment Status:</strong> {order.payment_status}</CListGroupItem>
                              <CListGroupItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</CListGroupItem>
                              <CListGroupItem><strong>Branch:</strong> {order.branch_name}</CListGroupItem>
                              <CListGroupItem><strong>User:</strong> {order.user}</CListGroupItem>
                              <CListGroupItem>
                                <strong>Items:</strong>
                                <ul>
                                  {order.items && order.items.map((item, index) => (
                                    <li key={index}>
                                      {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                                    </li>
                                  ))}
                                </ul>
                              </CListGroupItem>
                            </CListGroup>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))
                  ) : (
                    <CCol>
                      <p>No completed orders at the moment.</p>
                    </CCol>
                  )}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </div>
  );
};

export default Orders;
