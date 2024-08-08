import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilAccountLogout,
  cilAddressBook,
  cilGrain,
  cilBasket,
  cilPaintBucket,
  cilSpeedometer,
  cilTablet,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Order To Warehouse',
    to: '/order',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Inventory',
    to: '/inventory',
    icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Master',
  },
  {
    component: CNavItem,
    name: 'Material',
    to: '/master/material',
    icon: <CIcon icon={cilPaintBucket} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'User',
    to: '/master/user',
    icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'User',
  },
  {
    component: CNavItem,
    name: 'Profile',
    to: 'user/profile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
  },
]

export default _nav
