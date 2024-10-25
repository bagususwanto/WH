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
  cilEnvelopeLetter,
  cilCart,
  cilStorage,
  cilGraph,
  cilTruck,
  cilEqualizer,
  cilHandPointUp,
  cilUserX,
  cilUserFollow,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import useVerify from './hooks/UseVerify'
import config from './utils/Config'

const useNavigation = () => {
  const [navigation, setNavigation] = useState([])
  const { roleName } = useVerify()
  //NAV HOME
  useEffect(() => {
    const baseNav = [
      {
        component: CNavItem,
        name: 'Home',
        to: '/home',
        icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
      },
    ]
    // NAV DASHBOARD
    if (
      roleName === 'super admin' ||
      roleName === 'line head' ||
      roleName === 'section head' ||
      roleName === 'section head' ||
      roleName === 'section head'
    ) {
      baseNav.push({
        component: CNavItem,
        name: 'Dasboard',
        to: '/dashboard',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
      })
    }
    // NAV INVENTORY
    if (
      roleName === 'super admin' ||
      roleName === 'warehouse staff' ||
      roleName === 'warehouse member'
    ) {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'INVENTORY',
        },
        {
          component: CNavGroup,
          name: 'TWIIS-Inventory',
          to: '/order',
          icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Incoming',
              to: '/incoming',
              icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
            },
            {
              component: CNavGroup,
              name: 'Inventory',
              to: '/order',
              icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
              items: [
                {
                  component: CNavItem,
                  name: 'Input Inventory',
                  to: '/inventory/input',
                  icon: <CIcon icon={cilHandPointUp} customClassName="nav-icon" />,
                },
                {
                  component: CNavItem,
                  name: 'Data Inventory',
                  to: '/inventory/data',
                  icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
                },
              ],
            },
          ],
        },
      )
    }
    //ORDER DAN CONFIRMATION UNTUK SUPER ADMIN
    if (roleName === 'super admin') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Order',
        },
        {
          component: CNavGroup,
          name: 'TWISS-Order',
          to: '/order',
          icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Order By Recipient',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault(); // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/home`, '_blank'); // Opens URL in a new tab
              },
            },

            {
              component: CNavItem,
              name: 'Approval By Line Head',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/approveall`, '_blank') // Use base URL from config
              },
            },
            {
              component: CNavItem,
              name: 'Approval By Group Head',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/approveall`, '_blank') // Use base URL from config
              },
            },
            {
              component: CNavItem,
              name: 'Approval By Dph Head',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/approveall`, '_blank') // Use base URL from config
              },
            },
          ],
        },
        {
          component: CNavTitle,
          name: 'Confirmation Order',
        },
        {
          component: CNavGroup,
          name: 'TWIIS-Confirmation',
          to: '/order',
          icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Confirmation Order',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilEnvelopeLetter} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/confirmall`, '_blank') // Use base URL from config
              },
            },
            {
              component: CNavItem,
              name: 'Shopping',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/shopping`, '_blank') // Use base URL from config
              },
            },
          ],
        },
      )
    }
    if (roleName === 'group head') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Order',
        },
        {
          component: CNavItem,
          name: 'Order By Recipient',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault(); // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/home`, '_blank'); // Opens URL in a new tab
          },
        },
      )
    }

    if (roleName === 'line head') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Approval Order',
        },
        {
          component: CNavItem,
          name: 'Approval Order By Line Head',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault(); // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/approveall`, '_blank'); // Opens URL in a new tab
          },
        }
      )
    }
    if (roleName === 'section head') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Approval Order',
        },
        {
          component: CNavItem,
          name: 'Approval Order By Section Head',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault(); // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/approveall`, '_blank'); // Opens URL in a new tab
          },
        },
      )
    }
    if (roleName === 'department head') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Approval Order',
        },
        {
          component: CNavItem,
          name: 'Approval Order By Department Head',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault(); // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/approveall`, '_blank'); // Opens URL in a new tab
          },
        },
      )
    }


    if (roleName === 'warehouse staff') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Confirmation Order',
        },
        {
          component: CNavItem,
          name: 'Confirmation Order',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault() // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/confirmall`, '_blank') // Use base URL from config
          },
        },
      )
    }
    if (roleName === 'warehouse member') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'TWIIS-Shopping',
        },
        {
          component: CNavItem,

          name: 'Shopping',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault() // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/shopping`, '_blank') // Use base URL from config
          },
        },
      )
    }
    baseNav.push(
      {
        component: CNavTitle,
        name: 'Good Issue Data',
      },
      {
        component: CNavGroup,
        name: 'Data Good Issue',
        to: '/order',
        icon: <CIcon icon={cilEqualizer} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Good Issue Data',
            to: '/category',
            icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
          },
        ],
      },
    )
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
          icon: <CIcon icon={cilEqualizer} customClassName="nav-icon" />,
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
        to: '/profile',
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
