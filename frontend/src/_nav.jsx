import React, { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilAccountLogout,
  cilAddressBook,
  cilBasket,
  cilTablet,
  cilUser,
  cilBluetooth,
  cilNoteAdd,
  cilCarAlt,
  cilPaintBucket,
  cilCompass,
  cilFlagAlt,
  cilLocationPin,
  cilFactory,
  cilBank,
  cilMoney,
  cilHome,
  cilTransfer,
  cilList,
  cilCart,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const useNavigation = () => {
  const [navigation, setNavigation] = useState([])


  useEffect(() => {
    const roleId = 1

    const baseNav = [
      {
        component: CNavItem,
        name: 'Home',
        to: '/dashboard',
        icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: 'Order To Warehouse',
        to: '/order',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Order Item',
            to: '/orderitem',
            icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Tracking Item',
            to: '/tracking',
            icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'Good Issue',
            to: '/goodissue',
            icon: <CIcon icon={cilList} customClassName="nav-icon" />,
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
    ]

    if (roleId === 1) {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Master',
        },
        {
          component: CNavGroup,
          name: 'Master Data',
          to: '/order',
          icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Category',
              to: '/category',
              icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Supplier',
              to: '/supplier',
              icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
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
              icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Address',
              to: '/address',
              icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Plant',
              to: '/plant',
              icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Shop',
              to: '/shop',
              icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Cost',
              to: '/cost',
              icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'User',
              to: '/user',
              icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
            },
          ],
        },
      )
    }

    baseNav.push(
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
    )

    setNavigation(baseNav)
  }, [])

  return navigation
}

export default useNavigation
