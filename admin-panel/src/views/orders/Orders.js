import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, Grid, Button, TextField, List, ListItem, Typography, Tabs, Tab, CircularProgress, Snackbar } from '@mui/material';
import { fetchPendingOrders, acceptOrder, rejectOrder } from 'src/slices/orderSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const Orders = () => {
  const dispatch = useDispatch();
  const pendingOrders = useSelector((state) => state.orders.pendingOrders || []);
  const status = useSelector((state) => state.orders.status);
  const error = useSelector((state) => state.orders.error);

  const [activeTab, setActiveTab] = useState('pending');
  const [preparationTime, setPreparationTime] = useState('');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch pending orders
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAcceptOrder = async (orderId) => {
    if (!preparationTime) {
      setSnackbarOpen(true); // Show snackbar for error
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
              <Grid item xs={12} md={6} lg={4} key={order.id}>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardHeader title={`Order #${order.id}`} subheader={`Status: ${order.status}`} />
                  <CardContent>
                    <List>
                      <ListItem><strong>Total Price:</strong> ${order.total_price}</ListItem>
                      <ListItem><strong>Payment Status:</strong> {order.payment_status}</ListItem>
                      <ListItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</ListItem>
                      <ListItem><strong>Branch:</strong> {order.branch_name}</ListItem>
                      <ListItem><strong>User:</strong> {order.user}</ListItem>
                      <ListItem>
                        <strong>Items:</strong>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            <li key={index}>
                              {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                            </li>
                          ))}
                        </ul>
                      </ListItem>
                    </List>
                    <TextField
                      label="Preparation Time (minutes)"
                      type="number"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleAcceptOrder(order.id)}
                      sx={{ mt: 2, mr: 2 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleRejectOrder(order.id)}
                      sx={{ mt: 2 }}
                    >
                      Reject
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
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
              <Grid item xs={12} md={6} lg={4} key={order.id}>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardHeader title={`Order #${order.id}`} subheader={`Status: ${order.status}`} />
                  <CardContent>
                    <List>
                      <ListItem><strong>Total Price:</strong> ${order.total_price}</ListItem>
                      <ListItem><strong>Payment Status:</strong> {order.payment_status}</ListItem>
                      <ListItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</ListItem>
                      <ListItem><strong>Branch:</strong> {order.branch_name}</ListItem>
                      <ListItem><strong>User:</strong> {order.user}</ListItem>
                      <ListItem>
                        <strong>Items:</strong>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            <li key={index}>
                              {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                            </li>
                          ))}
                        </ul>
                      </ListItem>
                    </List>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DoneIcon />}
                      onClick={() => handleCompleteOrder(order.id)}
                      sx={{ mt: 2 }}
                    >
                      Mark as Completed
                    </Button>
                  </CardContent>
                </Card>
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
              <Grid item xs={12} md={6} lg={4} key={order.id}>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardHeader title={`Order #${order.id}`} subheader={`Status: ${order.status}`} />
                  <CardContent>
                    <List>
                      <ListItem><strong>Total Price:</strong> ${order.total_price}</ListItem>
                      <ListItem><strong>Payment Status:</strong> {order.payment_status}</ListItem>
                      <ListItem><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</ListItem>
                      <ListItem><strong>Branch:</strong> {order.branch_name}</ListItem>
                      <ListItem><strong>User:</strong> {order.user}</ListItem>
                      <ListItem>
                        <strong>Items:</strong>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            <li key={index}>
                              {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
                            </li>
                          ))}
                        </ul>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No completed orders yet.</Typography>
          )}
        </Grid>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          Please enter a preparation time!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;
