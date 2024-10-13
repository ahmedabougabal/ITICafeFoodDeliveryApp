import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardActions, Typography, Button, TextField } from '@mui/material';

const OrderCard = ({ order, onAccept, onReject }) => {
  const [preparationTime, setPreparationTime] = useState('');

  const handleAccept = () => {
    if (!preparationTime) {
      alert('Please enter a preparation time');
      return;
    }
    onAccept(order.id, parseInt(preparationTime));
  };

  const handleReject = () => {
    onReject(order.id);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardHeader title={`Order #${order.id}`} />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          <strong>Total Price:</strong> ${order.total_price}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Status:</strong> {order.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Payment Status:</strong> {order.payment_status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Branch:</strong> {order.branch_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>User:</strong> {order.user}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Items:</strong>
        </Typography>
        <ul>
          {order.items && order.items.map((item, index) => (
            <li key={index}>
              {item.item.name} - Quantity: {item.quantity}, Price: ${item.price_at_time_of_order}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardActions>
        <TextField
          label="Preparation Time (minutes)"
          type="number"
          value={preparationTime}
          onChange={(e) => setPreparationTime(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button size="small" color="primary" onClick={handleAccept}>
          Accept
        </Button>
        <Button size="small" color="secondary" onClick={handleReject}>
          Reject
        </Button>
      </CardActions>
    </Card>
  );
};

export default OrderCard;
