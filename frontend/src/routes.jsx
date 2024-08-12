import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Orderlist = React.lazy(() => import('./views/orderlist/Orderlist'))
const Category = React.lazy(() => import('./views/masterdata/category/Category'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/inventory', name: 'Inventory', element: Inventory },
  { path: '/category', name: 'Category', element: Category },
]

export default routes