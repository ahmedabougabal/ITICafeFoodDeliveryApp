import { Button, Card, CardContent, CardHeader, List, ListItem } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done';
import CountDown from 'ant-design-pro/lib/CountDown';



import React, { useState } from 'react'
import Price from '../Price/Price';
import { useTranslation } from 'react-i18next';
import CountdownTimer from '../CountDownTimer';

export default function PreparingOrderCard({order,handleCompleteOrder}) {
  const {t}= useTranslation()
  const [isTimerEnded, setIsTimerEnded] = useState(false);


  const handleTimerEnd=()=>{
    setIsTimerEnded(true)
  }
  
// Parse the given timestamp into a Date object
const initialTime = new Date(order.updated_at);

// Add 10 minutes (600,000 milliseconds)
const targetTime = new Date(initialTime.getTime() + order.preparation_time * 60 * 1000);
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
                      <ListItem><strong>{isTimerEnded?`${t("time_delayed")}`:`${t("time_left")}`}</strong> <CountdownTimer targetTime={targetTime} onComplete={handleTimerEnd} />
                      </ListItem>
                      <ListItem>
                        <strong>{t("items")}</strong>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            <li key={index}>
                              {item.item.name} - Quantity: {item.quantity}, Price: <Price price={`${item.item.price}`} />
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
                      {t("mark_as_completed")}
                    </Button>
                    
                  </CardContent>
                </Card>
  )
}
