import { CCard, CCardBody, CCardLink, CCardText, CCardTitle, CListGroup, CListGroupItem } from '@coreui/react'
import React from 'react'
import classes from './ordercomponent.module.css'
import DetailsModal from '../DetailsModal/DetailsModal'

export default function OrderComponent({ order, actionHandler }) {
  const { orderId,userName,totalPrice,items,status,finishedDate } = order
  return (

    <>
      {

        order ? (

          <CCard className={classes.card} style={{ width: '30rem' }}>
            <CCardBody>
              <CCardTitle>OrderID:#{orderId}</CCardTitle>
              
            </CCardBody>
            <CListGroup flush className={classes.list}>
              <CListGroupItem><div>Price</div><div>{totalPrice}</div></CListGroupItem>
              <CListGroupItem><div>Discount</div><div>50%</div></CListGroupItem>
              <CListGroupItem><div>User Name</div><div>{userName}</div></CListGroupItem>
              <CListGroupItem style={{visibility:finishedDate}}><div>finished in</div><div>{finishedDate}</div></CListGroupItem>
            </CListGroup>
            <CCardBody className={classes.links}>
              <div>
                <DetailsModal items={items} orderId={orderId} />
              </div>
              <div className={classes.actions}>
              {
                status==='pending'?(
                <>
                <CCardLink onClick={()=>{actionHandler(orderId,'accept')}}>Accept</CCardLink>
                <CCardLink onClick={()=>{actionHandler(orderId,'reject')}}>Reject</CCardLink>
                </>):status ==='active'?(
                  <>
                  <CCardLink onClick={()=>{actionHandler(orderId,'finished')}}>finished</CCardLink>
                  <CCardLink onClick={()=>{actionHandler(orderId,'susbend')}}>susbend</CCardLink>

                  </>
                ):(
                  <>
                  <CCardLink>Remove</CCardLink>
                  </>
                )
              }
              
                
              </div>

            </CCardBody>
          </CCard>
        ) : (<></>)

      }
    </>
  )
}
