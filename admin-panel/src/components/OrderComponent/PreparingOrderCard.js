import { Button, Card, CardContent, CardHeader, List, ListItem } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done';
import CountDown from 'ant-design-pro/lib/CountDown';

import React from 'react'

export default function PreparingOrderCard({order,handleCompleteOrder}) {
  
// Parse the given timestamp into a Date object
const initialTime = new Date(order.updated_at);

// Add 10 minutes (600,000 milliseconds)
const targetTime = new Date(initialTime.getTime() + order.preparation_time * 60 * 1000);
  return (
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
                    <CountDown style={{ fontSize: 20 }} target={targetTime} />
                  </CardContent>
                </Card>
  )
}
