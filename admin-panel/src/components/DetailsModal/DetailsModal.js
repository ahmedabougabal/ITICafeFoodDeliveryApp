import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'

const DetailsModal = ({ items, orderId }) => {
  const [visible, setVisible] = React.useState(false)

  return (
    <>
      <CButton onClick={() => setVisible(!visible)}>View Details</CButton>
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Order #{orderId} Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ul>
            {items.map((item, index) => (
              <li key={`${orderId}-item-${index}`}>
                {item.item.name} - Quantity: {item.quantity} - Price: ${item.price_at_time_of_order}
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

export default DetailsModal
