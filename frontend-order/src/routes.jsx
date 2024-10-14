import React from 'react'


const Home = React.lazy(() => import('./views/home/Home'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Wishlist = React.lazy(() => import('./views/wishllist/Wishlist'))
const History = React.lazy(() => import('./views/history/History'))
const HistoryApp = React.lazy(() => import('./views/history/HistoryApprove'))
const ApproveAll = React.lazy(() => import('./views/confirm/ConfirmAllWarehouse'))
const ConfirmAll = React.lazy(() => import('./views/confirm/ConfirmApprove'))
const ConfirmApp = React.lazy(() => import('./views/confirm/ConfirmApprove'))
const ConfirmRec = React.lazy(() => import('./views/confirm/ConfirmRecipent'))
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
const Order = React.lazy(() => import('./views/order/Order'))
const Cart = React.lazy(() => import('./views/cart/Cart'))

const routes = [
  { path: '/login', name: '', element: Login },
  { path: '/home', name: '', element: Home },
  { path: '/wishlist', name: 'Wishlist', element: Wishlist},
  { path: '/profile', name: 'Profile', element: Profile},
  { path: '/history', name: 'History', element: History},
  { path: '/historyapp', name: 'HistoryApp', element: HistoryApp},
  { path: '/order', name: 'Order', element: Order },
  { path: '/cart', name: 'Cart', element: Cart },
  { path: '/ApproveAll', name: 'Confirm', element: ApproveAll},
  { path: '/ConfirmAll', name: 'Confirm', element: ConfirmAll},
  { path: '/confirmapp', name: 'Confirm', element: ConfirmApp},
  { path: '/confirmrec', name: 'ConfirmRec', element: ConfirmRec},
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
]

export default routes
