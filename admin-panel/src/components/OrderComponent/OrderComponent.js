import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardLink, CCardTitle, CListGroup, CListGroupItem, CButton, CForm, CFormInput } from '@coreui/react'
import classes from './ordercomponent.module.css'
import DetailsModal from '../DetailsModal/DetailsModal'
import Price from '../Price/Price'

export default function OrderComponent({ order, actionHandler, handleRefresh }) {
  const {
    id,
    total_price,
    discounted_price,
    discount,
    status,
    payment_status,
    created_at,
    completed_at,
    items,
    branch_name,
    user,
  } = order

  const [preparationTime, setPreparationTime] = useState('')

  useEffect(() => {
    console.log('Order details:', order);
  }, [order]);

  const handleAction = (action, prepTime = null) => {
    if (actionHandler) {
      actionHandler(id, action, prepTime);
    } else {
      console.error('actionHandler is not defined');
    }
  }

  return (
    <CCard className={classes.card} style={{ width: '30rem' }}>
      <CCardBody>
        <CCardTitle>OrderID: #{id}</CCardTitle>
      </CCardBody>
      <CListGroup flush className={classes.list}>
        <CListGroupItem key="price"><div>Price</div><div><Price price={`${total_price}`}/></div></CListGroupItem>
        {discounted_price && <CListGroupItem key="discounted_price"><div>Discounted Price</div><div><Price price={`${discounted_price}`}/></div></CListGroupItem>}
        <CListGroupItem key="discount"><div>Discount</div><div>{discount}%</div></CListGroupItem>
        <CListGroupItem key="branch"><div>Branch</div><div>{branch_name}</div></CListGroupItem>
        <CListGroupItem key="status"><div>Status</div><div>{status}</div></CListGroupItem>
        <CListGroupItem key="payment_status"><div>Payment Status</div><div>{payment_status}</div></CListGroupItem>
        <CListGroupItem key="created_at"><div>Created At</div><div>{new Date(created_at).toLocaleString()}</div></CListGroupItem>
        {completed_at && <CListGroupItem key="completed_at"><div>Completed At</div><div>{new Date(completed_at).toLocaleString()}</div></CListGroupItem>}
      </CListGroup>
      <CCardBody className={classes.links}>
        <div>
          <DetailsModal items={items} orderId={id} />
        </div>
        <div className={classes.actions}>
          {actionHandler && status === 'pending' && (
            <>
              <CForm className="mt-3">
                <CFormInput
                  type="number"
                  placeholder="Preparation time (minutes)"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                />
                <CButton color="success" onClick={() => handleAction('accept', preparationTime)}>
                  Accept with Preparation Time
                </CButton>
              </CForm>
              <CCardLink onClick={() => handleAction('reject')}>Reject</CCardLink>
            </>
          )}
          {actionHandler && status === 'preparing' && (
            <CCardLink onClick={() => handleAction('ready')}>Mark as Ready</CCardLink>
          )}
          {actionHandler && status === 'ready' && (
            <CCardLink onClick={() => handleAction('complete')}>Complete & Pay</CCardLink>
          )}
          {actionHandler && (status === 'completed' || status === 'cancelled') && (
            <CCardLink onClick={() => handleAction('remove')}>Remove</CCardLink>
          )}
        </div>
        <div>
          <CButton onClick={handleRefresh} color="primary">Refresh Orders</CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}
