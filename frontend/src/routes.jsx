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

const routes = [

  { path: '/login', name: '', element: Login },
  { path: '/dashboard', name: '', element: Dashboard },
  { path: '/home', name: '', element: Home },
  { path: '/inventory', name: '', element: Inventory },
  { path: '/incoming', name: '', element: Incoming },
  { path: '/orderitem', name: '', element: Orderitem },
  { path: '/tracking', name: '', element: Tracking },
  { path: '/category', name: '', element: Category },
  { path: '/shop', name: '', element: Shop },
  { path: '/plant', name: '', element: Plant },
  { path: '/supplier', name: '', element: Supplier },
  { path: '/material', name: '', element: Material },
  { path: '/role', name: '', element: Role },
  { path: '/cost', name: '', element: Cost },
  { path: '/storage', name: '', element: Storage },
  { path: '/address', name: '', element: Address },
  { path: '/user', name: '', element: User },
  { path: '/goodissue', name: '', element: Goodissue },
]

export default routes
