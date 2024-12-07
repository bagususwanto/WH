import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // Import useLocation
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CCol,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilBell, cilMenu } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import logo from 'src/assets/brand/TWIIS-NEW.png'

const AppHeader = () => {
  const headerRef = useRef()
  const location = useLocation() // Get the current location
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDropdownToggle = () => {
    const dropdownElement = document.querySelector('.order-header')
    if (!isDropdownOpen) {
      dropdownElement?.classList.remove('sticky-search-bar')
    } else {
      dropdownElement?.classList.add('sticky-search-bar')
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const notificationCount = 3

  // Conditionally apply 'mb-4' based on the current path
  const headerClass = location.pathname === '/home' ? 'mb-1 p-0' : 'mb-4 p-0'

  return (
    <CHeader position="sticky" className={headerClass} ref={headerRef}>
      <CContainer className="border-bottom px-1" fluid>
        <CHeaderToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}>
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <img src={logo} alt="Logo" className="sidebar-brand-full" height={40} />
        <CCol sm={8}></CCol>
        <CHeaderNav className="d-none d-md-flex"></CHeaderNav>
        {/* <CHeaderNav className="ms-auto">
          <CDropdown variant="nav-item" onClick={handleDropdownToggle}>
            <CDropdownToggle className="py-0 pe-0 d-flex align-items-center" caret={false}>
              <CIcon icon={cilBell} size="lg" style={{ marginRight: '0.5rem' }} />
            </CDropdownToggle>
  
          </CDropdown>
        </CHeaderNav> */}
        <CHeaderNav>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      {location.pathname !== '/home' && (
        <CContainer className="px-4" fluid>
          <AppBreadcrumb />
        </CContainer>
      )}
    </CHeader>
  )
}

export default AppHeader
