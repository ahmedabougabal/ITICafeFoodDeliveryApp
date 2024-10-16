import { Button, Card, CardContent, CardHeader , List, ListItem } from '@mui/material'
import { CIcon } from '@coreui/icons-react';
import { cibCcVisa,cibCashapp,cibCcPaypal } from '@coreui/icons';

import DoneIcon from '@mui/icons-material/Done';

import React from 'react'

export default function CompletedOrderCard({order,handlePayOrder,refresh}) {
    const [paid,paymentMethod]=order.payment_status.split('-')
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
                      onClick={()=>{handlePayOrder(order.id)}}
                      disabled={paid=='paid'}
                      sx={{ mt: 2 }}
                    >
                      Cash Payment
                    </Button>
                    
                  </CardContent>
                  {
                    paymentMethod=='visa'?(<CIcon icon={cibCcVisa} width={50}/>):paymentMethod=='cash'?<CIcon icon={cibCashapp} width={50}/>:paymentMethod=='paypal'?<CIcon icon={cibCcPaypal} width={50}/>:<span>..</span>
                  }
                  
                  
                </Card>
  )
}
