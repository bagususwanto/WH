import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Home = React.lazy(() => import('./views/home/Home'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Incoming = React.lazy(() => import('./views/incoming/incoming'))
const Orderitem = React.lazy(() => import('./views/orderwarehouse/orderitem/Orderitem'))
const Tracking = React.lazy(() => import('./views/orderwarehouse/tracking/Tracking'))
const Category = React.lazy(() => import('./views/masterdata/category/Category'))
const Shop = React.lazy(() => import('./views/masterdata/shop/Shop'))
const Plant = React.lazy(() => import('./views/masterdata/plant/Plant'))
const Supplier = React.lazy(() => import('./views/masterdata/supplier/Supplier'))
const Material = React.lazy(() => import('./views/masterdata/material/Material'))
const Role = React.lazy(() => import('./views/masterdata/role/Role'))
const Cost = React.lazy(() => import('./views/masterdata/cost/Cost'))
const Storage = React.lazy(() => import('./views/masterdata/storage/Storage'))
const Address = React.lazy(() => import('./views/masterdata/address/Address'))
const User = React.lazy(() => import('./views/masterdata/user/User'))
const Goodissue = React.lazy(() => import('./views/orderwarehouse/goodissue/Goodissue'))
const Order = React.lazy(() => import('./views/order/Order'))

const routes = [
  { path: '/login', name: '', element: Login },
  { path: '/home', name: '', element: Home },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/order', name: 'Order', element: Order },
  { path: '/inventory', name: 'Inventory', element: Inventory },
  { path: '/incoming', name: 'Incoming', element: Incoming },
  { path: '/orderitem', name: 'Orderitem', element: Orderitem },
  { path: '/tracking', name: 'Tracking', element: Tracking },
  { path: '/category', name: 'Category', element: Category },
  { path: '/shop', name: 'Shop', element: Shop },
  { path: '/plant', name: 'Plant', element: Plant },
  { path: '/supplier', name: 'Supplier', element: Supplier },
  { path: '/material', name: 'Material', element: Material },
  { path: '/role', name: 'Role', element: Role },
  { path: '/cost', name: 'Cost', element: Cost },
  { path: '/storage', name: 'Storage', element: Storage },
  { path: '/address', name: 'Address', element: Address },
  { path: '/user', name: 'User', element: User },
  { path: '/goodissue', name: 'Goodissue', element: Goodissue },
]

export default routes
