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
  cilStorage,
  cilGraph,
  cilTruck,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import useVerify from './hooks/UseVerify'

const useNavigation = () => {
  const [navigation, setNavigation] = useState([])
  const { roleName } = useVerify()

  useEffect(() => {
    const baseNav = [
      
      {
        component: CNavItem,
        name: 'Dasboard',
        to: '/dashboard',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
      },
     
      // {
      //   component: CNavGroup,
      //   name: 'Order To Warehouse',
      //   to: '/order',
      //   icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
      //   items: [
      //     {
      //       component: CNavItem,
      //       name: 'Order Item',
      //       to: '/orderitem',
      //       icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
      //     },
      //     {
      //       component: CNavItem,
      //       name: 'Tracking Item',
      //       to: '/tracking',
      //       icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
      //     },
      //     {
      //       component: CNavItem,
      //       name: 'Good Issue',
      //       to: '/goodissue',
      //       icon: <CIcon icon={cilList} customClassName="nav-icon" />,
      //     },
      //   ],
      // },
      {
        component: CNavItem,
        name: 'Incoming',
        to: '/incoming',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Inventory',
        to: '/inventory',
        icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
      },
    ]

    if (roleName === 'super admin') {
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
              component: CNavGroup,
              name: 'Location',
              to: '/order',
              icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
              items: [
                {
                  component: CNavItem,
                  name: 'Storage',
                  to: '/storage',
                  icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
                },
                {
                  component: CNavItem,
                  name: 'Address',
                  to: '/address',
                  icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
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
              ],
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
  }, [roleName])

  return navigation
}

export default useNavigation
