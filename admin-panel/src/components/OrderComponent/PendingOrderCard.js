import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Button, TextField, List, ListItem, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Price from '../Price/Price';
import { useTranslation } from 'react-i18next';

const OrderCard = ({ order, onAccept, onReject }) => {
  const [preparationTime, setPreparationTime] = useState('');
  const [error, setError] = useState('');
  const {t}= useTranslation()

  const handleAccept = () => {
    const prepTime = parseInt(preparationTime, 10);
    if (prepTime > 0) {
      onAccept(order.id, prepTime);
      setError('');
    } else {
      setError('Preparation time must be greater than 0');
    }
  };

  const handlePreparationTimeChange = (e) => {
    const value = e.target.value;
    setPreparationTime(value);
    if (parseInt(value, 10) <= 0) {
      setError('Preparation time must be greater than 0');
    } else {
      setError('');
    }
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardHeader title={t("order_no") +`${order.id}`} subheader={t("status") +`: ${t(order.status)}`} />
      <CardContent>
        <List>
          <ListItem><strong>{t("total_price")}</strong><Price price={`${order.total_price}`}/> </ListItem>
          <ListItem><strong>{t("payment_status")}</strong> {t(order.payment_status)}</ListItem>
          <ListItem><strong>{t("created_at")}</strong> {new Date(order.created_at).toLocaleString()}</ListItem>
          <ListItem><strong>{t("branch")}</strong> {order.branch_name}</ListItem>
          <ListItem><strong>{t("user")}</strong> {order.user}</ListItem>
          <ListItem>
            <strong>{t("items")}</strong>
            <ul>
              {order.items && order.items.map((item, index) => (
                <li key={index}>
                  {item.item.name} - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </ListItem>
        </List>
        <TextField
          label={t("preparation_time_minutes")}
          type="number"
          value={preparationTime}
          onChange={handlePreparationTimeChange}
          error={!!error}
          helperText={error}
          fullWidth
          sx={{ mt: 2 }}
          InputProps={{ inputProps: { min: 1 } }}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={handleAccept}
          sx={{ mt: 2, mr: 2 }}
          disabled={!preparationTime || parseInt(preparationTime, 10) <= 0}
        >
          {t("accept")}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => onReject(order.id)}
          sx={{ mt: 2 }}
        >
          {t("reject")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
