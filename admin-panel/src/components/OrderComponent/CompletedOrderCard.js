import { Button, Card, CardContent, CardHeader , List, ListItem } from '@mui/material'
import { CIcon } from '@coreui/icons-react';
import { cibCcVisa,cibCashapp,cibCcPaypal } from '@coreui/icons';
import Price from '../Price/Price';

import DoneIcon from '@mui/icons-material/Done';

import React from 'react'
import { t } from 'i18next';

export default function CompletedOrderCard({order,handlePayOrder,refresh}) {
    const [paid,paymentMethod]=order.payment_status.split('-')
  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardHeader title={t("order_no") +`${order.id}`} subheader={t("status") +`: ${t(order.status)}`} />
                  <CardContent>
                    <List>
                      <ListItem><strong>{t("total_price")}</strong> <Price price={`${order.total_price}`}/></ListItem>
                      <ListItem><strong>{t("payment_status")}</strong> {t(order.payment_status)}</ListItem>
                      <ListItem><strong>{t("created_at")}</strong> {new Date(order.created_at).toLocaleString()}</ListItem>
                      <ListItem><strong>{t("branch")}</strong> {order.branch_name}</ListItem>
                      <ListItem><strong>{t("user")}</strong> {order.user}</ListItem>
                      <ListItem>
                        <strong>{t("items")}</strong>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            <li key={index}>
                              {item.item.name} - Quantity: {item.quantity}, Price: <Price price={`${item.item.price}`}/>
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
                      {t('cash_payment')}
                    </Button>
                    
                  </CardContent>
                  {
                    paymentMethod=='visa'?(<CIcon icon={cibCcVisa} width={50}/>):paymentMethod=='cash'?<CIcon icon={cibCashapp} width={50}/>:paymentMethod=='paypal'?<CIcon icon={cibCcPaypal} width={50}/>:<span>..</span>
                  }
                  
                  
                </Card>
  )
}
