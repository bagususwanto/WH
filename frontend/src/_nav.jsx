import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  cilDescription,
  cilCopy,
  cilMinus,
  cilUserX,
  cilUserFollow,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import useVerify from './hooks/UseVerify'
import config from './utils/Config'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuthService from './services/AuthService'

const useNavigation = () => {
  const location = useLocation() // untuk mendapatkan lokasi saat ini
  const [navigation, setNavigation] = useState([])
  const { roleName, isWarehouse } = useVerify()

  const MySwal = withReactContent(Swal)
  const navigate = useNavigate()
  const { logout } = useAuthService()

  const handleLogout = async () => {
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to log out?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      if (result.isConfirmed) {
        await logout()
        navigate('/login')
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // NAV HOME
    const baseNav = [
      {
        component: CNavItem,
        name: 'Home',
        to: '/home',
        icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
        active: location.pathname === '/home', // Membuatnya aktif jika path sesuai
      },
    ]
    // NAV DASHBOARD
    if (
      (isWarehouse == 1 && roleName === 'super admin') ||
      (isWarehouse == 1 && roleName === 'group head') ||
      (isWarehouse == 1 && roleName === 'line head') ||
      (isWarehouse == 1 && roleName === 'section head')
    ) {
      baseNav.push({
        component: CNavItem,
        name: 'Dasboard',
        to: '/dashboard',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        active: location.pathname === '/dashboard',
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
          name: 'TWIIS',
        },
        {
          component: CNavGroup,
          name: 'TWIIS-Inventory',
          to: '/order',
          icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Input Inventory',
              to: '/inventory/input',
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Data Inventory',
              to: '/inventory/data',
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
            },
          ],
        },
      )
    }

    // NAV INVENTORY UNTUK GH UP WH
    if (
      (isWarehouse == 1 && roleName === 'group head') ||
      (isWarehouse == 1 && roleName === 'line head') ||
      (isWarehouse == 1 && roleName === 'section head') ||
      (isWarehouse == 1 && roleName === 'department head')
    ) {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'TWIIS',
        },
        {
          component: CNavGroup,
          name: 'TWIIS-Inventory',
          to: '/order',
          icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Data Inventory',
              to: '/inventory/data',
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
            },
          ],
        },
      )
    }
    //ORDER DAN CONFIRMATION UNTUK SUPER ADMIN
    if (roleName === 'super admin') {
      baseNav.push(
        {
          component: CNavGroup,
          name: 'TWISS-Order',
          to: '/order',
          icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Good Issue Order',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/#/home`, '_blank') // Opens URL in a new tab
              },
            },

            {
              component: CNavItem,
              name: 'Good Issue Approval',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/#/approveall`, '_blank') // Use base URL from config
              },
            },
          ],
        },
        {
          component: CNavGroup,
          name: 'TWIIS-Confirmation',
          to: '/order',
          icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Good Issue Confirm',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/#/confirmall`, '_blank') // Use base URL from config
              },
            },
            {
              component: CNavItem,
              name: 'Shopping',
              to: '/dummy-route', // Internal route, just a placeholder
              icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
              onClick: (e) => {
                e.preventDefault() // Prevent the default behavior of `to`
                window.open(`${config.ORDER_URL}/#/shopping`, '_blank') // Use base URL from config
              },
            },
          ],
        },
      )
    }
    if (roleName === 'group head' || roleName === 'line head' || roleName === 'section head') {
      // Lakukan sesuatu jika roleName adalah salah satu dari nilai tersebut

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
            e.preventDefault() // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/#/home`, '_blank') // Opens URL in a new tab
          },
        },
      )
    }

    if (roleName === 'line head' || roleName === 'section head' || roleName === 'department head') {
      baseNav.push(
        {
          component: CNavTitle,
          name: 'Approval Order',
        },
        {
          component: CNavItem,
          name: 'Good Issue Approval',
          to: '/dummy-route', // Internal route, just a placeholder
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          onClick: (e) => {
            e.preventDefault() // Prevent the default behavior of `to`
            window.open(`${config.ORDER_URL}/#/approveall`, '_blank') // Opens URL in a new tab
          },
        },
      )
    }

    if (roleName === 'warehouse staff') {
      baseNav.push({
        component: CNavGroup,
        name: 'TWIIS-Confirmation',
        to: '/order',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Good Issue Confirm',
            to: '/dummy-route', // Internal route, just a placeholder
            icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
            onClick: (e) => {
              e.preventDefault() // Prevent the default behavior of `to`
              window.open(`${config.ORDER_URL}/#/confirmall`, '_blank') // Use base URL from config
            },
          },
          {
            component: CNavItem,
            name: 'Shopping',
            to: '/dummy-route', // Internal route, just a placeholder
            icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
            onClick: (e) => {
              e.preventDefault() // Prevent the default behavior of `to`
              window.open(`${config.ORDER_URL}/#/shopping`, '_blank') // Use base URL from config
            },
          },
        ],
      })
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
            window.open(`${config.ORDER_URL}/#/shopping`, '_blank') // Use base URL from config
          },
        },
      )
    }
    baseNav.push(
      {
        component: CNavTitle,
        name: 'Data',
      },
      {
        component: CNavItem,
        name: 'Good Issue Data',
        to: '/goodissue',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },
    )

    if (isWarehouse == 1) {
      baseNav.push({
        component: CNavItem,
        name: 'Incoming Data',
        to: '/incoming',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      })
      baseNav.push({
        component: CNavItem,
        name: 'Redpost Data',
        to: '/redpost',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      })
    }

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
                  icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
                },
                {
                  component: CNavItem,
                  name: 'Address',
                  to: '/address',
                  icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
                },
                {
                  component: CNavItem,
                  name: 'Plant',
                  to: '/plant',
                  icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
                },
                {
                  component: CNavItem,
                  name: 'Shop',
                  to: '/shop',
                  icon: <CIcon icon={cilMinus} customClassName="nav-icon" />,
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
        icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
        to: '/logout',
        onClick: (e) => {
          e.preventDefault()
          handleLogout()
        },
      },
    )

    setNavigation(baseNav)
  }, [roleName, location.pathname]) // update saat roleName atau location berubah

  return navigation
}

export default useNavigation
