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
  cilCursor,
  cilBluetooth,
  cilCompass,
  cilAlarm,
  cilAsterisk,
  cilTv
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
    component: CNavGroup,
    name: 'Order To Warehouse',
    to: '/order',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Order List',
        to: '/orderlist',
        icon: <CIcon icon={cilCompass} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Tracking Item',
        to: '/tracking',
        icon: <CIcon icon={cilAlarm} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: 'Good Issue',
        to: '/goodissue',
        icon: <CIcon icon={cilAsterisk} customClassName="nav-icon" />,
      },

    ], 
  },
  {
    component: CNavItem,
    name: 'Inventory',
    to: '/inventory',
    icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Tracking Order',
    to: '/tracking',
    icon: <CIcon icon={cilBluetooth} customClassName="nav-icon" />,
  },

  
  {
    component: CNavTitle,
    name: 'Master',
  },
      {
        component: CNavItem,
        name: 'Category',
        to: '/category',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Supplier',
        to: '/supplier',
        icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Material',
        to: '/material',
        icon: <CIcon icon={cilPaintBucket} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Role',
        to: '/role',
        icon: <CIcon icon={cilCompass} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Location',
        to: '/location',
        icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Address',
        to: '/Address',
        icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Plant',
        to: '/plant',
        icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Shop',
        to: '/shop',
        icon: <CIcon icon={cilCompass} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Cost',
        to: '/cost',
        icon: <CIcon icon={cilCompass} customClassName="nav-icon" />,
      },
     {
          component: CNavItem,
          name: 'User',
          to: '/user',
          icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
     },
  {
    component: CNavTitle,
    name: 'Profile',
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
