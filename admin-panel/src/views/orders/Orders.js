import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  Grid, Button, Typography, Tabs, Tab, CircularProgress, Snackbar} from '@mui/material';
import { fetchPendingOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';
import MuiAlert from '@mui/material/Alert';
import PendingOrderCard from '../../components/OrderComponent/PendingOrderCard'; // Import the separate OrderCard component
import { completeOrder, fetchActiveOrders, fetchCompletedOrders, payOrder } from '../../slices/orderSlice';
import PreparingOrderCard from '../../components/OrderComponent/PreparingOrderCard';
import CompletedOrderCard from '../../components/OrderComponent/CompletedOrderCard';
const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const Orders = () => {
  const dispatch = useDispatch();
  const pendingOrders = useSelector((state) => state.orders.pendingOrders || []);
  const preparingOrders = useSelector((state) => state.orders.preparingOrders || []); // Get active orders
  const completedOrders = useSelector((state) => state.orders.completedOrders || []); // Get completed  orders
  
  const status = useSelector((state) => state.orders.status);
  const error = useSelector((state) => state.orders.error);

  const [activeTab, setActiveTab] = useState('pending');
  // const [preparingOrders, setPreparingOrders] = useState([]);
  // const [completedOrders, setCompletedOrders] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch pending orders
  const fetchOrders = () => {
    dispatch(fetchPendingOrders());
    dispatch(fetchActiveOrders());
    dispatch(fetchCompletedOrders())
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAcceptOrder = async (orderId, preparationTime) => {
    if (!preparationTime) {
      setSnackbarOpen(true); // Show snackbar for error
      return;
    }
    try {
      await dispatch(acceptOrder({ id: orderId, preparationTime: parseInt(preparationTime) }));
      fetchOrders(); // Fetch orders immediately after accepting
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };
  const handlePayOrder = async (orderId) => {
    
    try {
      await dispatch(payOrder({ id: orderId, method: 'cash' }));
      await dispatch(fetchCompletedOrders()) // Fetch orders immediately after pay
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
  const handleCompleteOrder = async (orderId) => {
    
    try {
      await dispatch(completeOrder(orderId ));
      fetchOrders(); // Fetch orders immediately after accepting
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };
  // const handleCompleteOrder = (orderId) => {
  //   const updatedPreparingOrders = preparingOrders.filter(order => order.id !== orderId);
  //   const completedOrder = preparingOrders.find(order => order.id === orderId);
  //   setPreparingOrders(updatedPreparingOrders);
  //   setCompletedOrders([...completedOrders, completedOrder]);
  // };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (status === 'failed') {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#1976d2' }}>
        Orders Management
      </Typography>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Pending" value="pending" />
        <Tab label="Preparing" value="preparing" />
        <Tab label="Completed" value="completed" />
      </Tabs>

      <Button variant="contained" color="primary" onClick={fetchOrders} sx={{ mt: 2, mb: 2 }}>
        Refresh Orders
      </Button>

      {activeTab === 'pending' && (
        <Grid container spacing={2}>
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
            <>
            
              <Grid item xs={12} md={6} lg={4} >
                <PendingOrderCard
                key={order.id}
                  order={order}
                  onAccept={handleAcceptOrder}
                  onReject={handleRejectOrder}
                />
              </Grid>
               <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
               <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
                 Please enter a preparation time!
               </Alert>
             </Snackbar>
            </>
            ))
          ) : (
            <Typography>No pending orders at the moment.</Typography>
          )}
        </Grid>
      )}
     
      
      {activeTab === 'preparing' && (
        <Grid container spacing={2}>
          {preparingOrders.length > 0 ? (
            preparingOrders.map((order) => (
              <Grid item xs={12} md={6} lg={4} >
                <PreparingOrderCard key={order.id} order={order} handleCompleteOrder={handleCompleteOrder} />
              </Grid>
            ))
          ) : (
            <Typography>No orders are currently being prepared.</Typography>
          )}
        </Grid>
      )}

      {activeTab === 'completed' && (
        <Grid container spacing={2}>
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <Grid item xs={12} md={6} lg={4} >
                <CompletedOrderCard key={order.id} order={order} handlePayOrder={handlePayOrder} />
              </Grid>
            ))
          ) : (
            <Typography>No completed orders yet.</Typography>
          )}
        </Grid>
         
      )}

  
    </div>
  );
};

export default Orders;
