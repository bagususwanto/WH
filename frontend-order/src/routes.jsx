import React from 'react'

const Home = React.lazy(() => import('./views/home/Home'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Wishlist = React.lazy(() => import('./views/wishllist/Wishlist'))
const History = React.lazy(() => import('./views/history/History'))
const HistoryApp = React.lazy(() => import('./views/history/HistoryApprove'))
const ConfirmWer = React.lazy(() => import('./views/confirm/ConfirmWarehouse'))
const ConfirmDel = React.lazy(() => import('./views/confirm/ConfirmDelivery'))
const ConfirmAll = React.lazy(() => import('./views/confirm/ConfirmAllWarehouse'))
const ApproveAll = React.lazy(() => import('./views/confirm/ConfirmAllApprove'))
const ConfirmApp = React.lazy(() => import('./views/confirm/ConfirmApprove'))
const ConfirmRec = React.lazy(() => import('./views/confirm/ConfirmRecipent'))
const Shopping = React.lazy(() => import('./views/confirm/Shopping'))
const Order = React.lazy(() => import('./views/order/Order'))
const Cart = React.lazy(() => import('./views/cart/Cart'))

const routes = [
  { path: '/login', name: '', element: Login },
  { path: '/home', name: '', element: Home },
  { path: '/wishlist', name: 'Wishlist', element: Wishlist },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/history', name: 'History', element: History },
  { path: '/historyapp', name: 'HistoryApp', element: HistoryApp },
  { path: '/order', name: 'Order', element: Order },
  { path: '/order/:warehouseId', name: 'Order', element: Order },
  { path: '/order/category/:categoryId', name: 'Order', element: Order },
  { path: '/cart', name: 'Cart', element: Cart },
  { path: '/approveall', name: 'AprroveAll', element: ApproveAll },
  { path: '/confirmall', name: 'ConfirmAll', element: ConfirmAll },
  { path: '/confirmwer', name: 'ConfirmWer', element: ConfirmWer },
  { path: '/confirmapp', name: 'ConfirmApp', element: ConfirmApp },
  { path: '/confirmrec', name: 'ConfirmRec', element: ConfirmRec },
  { path: '/confirmdel', name: 'ConfirmDel', element: ConfirmDel },
  { path: '/shopping', name: 'Shopping', element: Shopping},
]

export default routes
