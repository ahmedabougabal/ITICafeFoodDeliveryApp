import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilNotes,
  cilSpeedometer,
  cilBasket,
  cilClock,
  cilCart,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { useTranslation } from 'react-i18next'


const _nav = [
  {
    component: CNavItem,
    name: 'dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'orders',
    to: '/orders',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
]

export default _nav
