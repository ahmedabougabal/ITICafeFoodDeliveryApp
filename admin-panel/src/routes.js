import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Orders = React.lazy(() => import('./views/orders/Orders'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/orders', name: 'Orders', element: Orders },

 ]

export default routes
