import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Orderlist = React.lazy(() => import('./views/orderlist/Orderlist'))
const Category = React.lazy(() => import('./views/masterdata/category/Category'))
const Shop = React.lazy(() => import('./views/masterdata/shop/Shop'))
const Plant = React.lazy(() => import('./views/masterdata/plant/Plant'))
const Supplier = React.lazy(() => import('./views/masterdata/supplier/Supplier'))
const Material = React.lazy(() => import('./views/masterdata/material/Material'))
const Role = React.lazy(() => import('./views/masterdata/role/Role'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/inventory', name: 'Inventory', element: Inventory },
  { path: '/category', name: 'Category', element: Category },
  { path: '/shop', name: 'Shop', element: Shop },
  { path: '/plant', name: 'Plant', element: Plant },
  { path: '/supplier', name: 'Supplier', element: Supplier },
  { path: '/material', name: 'Material', element: Material },
  { path: '/role', name: 'Role', element: Material },
]

export default routes