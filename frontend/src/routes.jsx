import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const DashboardAll = React.lazy(() => import('./views/dashboard/DashboardAll'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Incoming = React.lazy(() => import('./views/incoming/incoming'))
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
const Home = React.lazy(() => import('./views/home/Home'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const InputInventory = React.lazy(() => import('./views/inventory/InputInventory'))
const GoodIssue = React.lazy(() => import('./views/gidata/GoodIssue'))

const routes = [
  { path: '/login', name: '', element: Login },
  { path: '/dashboard', name: 'dashboard', element: Dashboard },
  { path: '/dashboardall', name: 'dashboardall', element: DashboardAll },
  { path: '/home', name: '', element: Home },
  { path: '/inventory/data', name: 'Inventory / data', element: Inventory },
  { path: '/inventory/input', name: 'Inventory / Input', element: InputInventory },
  { path: '/incoming', name: 'Incoming', element: Incoming },
  { path: '/category', name: 'Category', element: Category },
  { path: '/shop', name: 'Shop', element: Shop },
  { path: '/plant', name: 'Plant', element: Plant },
  { path: '/supplier', name: 'Supplier', element: Supplier },
  { path: '/material', name: 'Material', element: Material },
  { path: '/role', name: 'Role', element: Role },
  { path: '/cost', name: 'Cost', element: Cost },
  { path: '/storage', name: 'Storage', element: Storage },
  { path: '/address', name: 'Address', element: Address },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/user', name: 'User', element: User },
  { path: '/goodissue', name: 'Good Issue', element: GoodIssue },
]

export default routes
