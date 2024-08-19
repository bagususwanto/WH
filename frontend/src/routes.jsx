import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Orderlist = React.lazy(() => import('./views/orderwarehouse/orderlist/Orderlist'))
const Tracking = React.lazy(() => import('./views/orderwarehouse/tracking/Tracking'))
const Category = React.lazy(() => import('./views/masterdata/category/Category'))
const Shop = React.lazy(() => import('./views/masterdata/shop/Shop'))
const Plant = React.lazy(() => import('./views/masterdata/plant/Plant'))
const Supplier = React.lazy(() => import('./views/masterdata/supplier/Supplier'))
const Material = React.lazy(() => import('./views/masterdata/material/Material'))
const Role = React.lazy(() => import('./views/masterdata/role/Role'))
const Cost = React.lazy(() => import('./views/masterdata/cost/Cost'))
const Location = React.lazy(() => import('./views/masterdata/location/Location'))
const Address = React.lazy(() => import('./views/masterdata/address/Address'))
const User = React.lazy(() => import('./views/masterdata/user/User'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/inventory', name: 'Inventory', element: Inventory },
  { path: '/orderlist', name: 'Orderlist', element: Orderlist },
  { path: '/tracking', name: 'Tracking', element: Tracking },
  { path: '/category', name: 'Category', element: Category },
  { path: '/shop', name: 'Shop', element: Shop },
  { path: '/plant', name: 'Plant', element: Plant },
  { path: '/supplier', name: 'Supplier', element: Supplier },
  { path: '/material', name: 'Material', element: Material },
  { path: '/role', name: 'Role', element: Role },
  { path: '/cost', name: 'Cost', element: Cost },
  { path: '/location', name: 'Location', element: Location },
  { path: '/address', name: 'Address', element: Address },
  { path: '/user', name: 'User', element: User },
]

export default routes
