import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveOrders } from 'src/slices/orderSlice';
import OrderComponent from './OrderComponent';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

const OrderList = () => {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders.allOrders);
  const error = useSelector(state => state.orders.error);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
                  <OrderComponent order={order} />
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
