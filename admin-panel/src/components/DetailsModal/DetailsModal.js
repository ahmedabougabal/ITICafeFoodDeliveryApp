import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import React, { useState } from 'react'
import classes from './detailsmodal.module.css'
export default function DetailsModal({items,orderId}) {
    const [visible, setVisible] = useState(false)
    return (
      <>
        <CButton onClick={() => setVisible(!visible)}>Order Details</CButton>
        <CModal
          visible={visible}
          onClose={() => setVisible(false)}
          aria-labelledby="OrderDetailsLabel"
        >
          <CModalHeader>
            <CModalTitle id="OrderDetailsLabel">Order ID:# {orderId}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ul>
                {items.map((item)=>(
                    <li className={classes.item}>
                        <div>{item.name}</div>
                        <div>{item.quantity}</div>
                    </li>
                ))}
            </ul>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Close
            </CButton>
            
          </CModalFooter>
        </CModal>
      </>
    )
}
