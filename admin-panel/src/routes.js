import React from 'react'
import OrderList from './components/OrderComponent/OrderList'
import PendingOrdersList from './components/OrderComponent/PendingOrdersList'
import CheckoutComponent from './components/Checkout/CheckoutComponent'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Orders = React.lazy(() => import('./views/orders/Orders'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/orders', name: 'Orders', element: Orders },
  { path: '/orders', name: 'Orders', element: OrderList },
  { path: '/pending-orders', name: 'Pending Orders', element: PendingOrdersList },
  { path: '/checkout', name: 'Checkout', element: CheckoutComponent },
]

export default routes;
