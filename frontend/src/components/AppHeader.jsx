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
  useColorModes,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilBell, cilMenu } from '@coreui/icons'
import * as icon from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import logo from 'src/assets/brand/TWIIS-NEW.png'
import logoDark from 'src/assets/brand/TWIIS-NEW2.png'
import { useTheme } from '../context/ThemeProvider'

const AppHeader = () => {
  const headerRef = useRef()
  const location = useLocation() // Get the current location
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { colorModeContext, setColorModeContext } = useTheme()

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

  // useEffect(() => {
  //   localStorage.setItem('coreui-free-react-admin-template-theme', colorMode)
  // }, [colorMode])

  return (
    <CHeader position="sticky" className={headerClass} ref={headerRef}>
      <CContainer className="border-bottom px-1" fluid>
        <CHeaderToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}>
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <img
          src={colorMode === 'light' ? logo : logoDark}
          alt="Logo"
          className="sidebar-brand-full"
          style={{
            position: 'fixed',
            top: '0.5rem',
            left: '3rem',
            zIndex: 1050,
            height: '40px',
          }}
        />
        <CCol sm={8}></CCol>
        {/* <CHeaderNav className="d-none d-flex"></CHeaderNav> */}
        {/* <CHeaderNav className="ms-auto">
          <CDropdown variant="nav-item" onClick={handleDropdownToggle}>
            <CDropdownToggle className="py-0 pe-0 d-flex align-items-center" caret={false}>
              <CIcon icon={cilBell} size="lg" style={{ marginRight: '0.5rem' }} />
            </CDropdownToggle>
  
          </CDropdown>
        </CHeaderNav> */}
        {/* THEME MODE */}
        <div className="position-absolute end-0 me-3">
          <div className="d-flex">
            <CHeaderNav>
              <li className="nav-item py-1  py-0 d-flex align-items-center">
                <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
              </li>
              <CDropdown variant="nav-item" placement="bottom-end">
                <CDropdownToggle caret={false}>
                  {colorMode === 'dark' ? (
                    <CIcon icon={icon.cilMoon} size="lg" />
                  ) : colorMode === 'auto' ? (
                    <CIcon icon={icon.cilContrast} size="lg" />
                  ) : (
                    <CIcon icon={icon.cilSun} size="lg" />
                  )}
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem
                    active={colorMode === 'light'}
                    className="d-flex align-items-center"
                    as="button"
                    type="button"
                    onClick={() => {
                      setColorMode('light')
                      setColorModeContext('light')
                    }}
                  >
                    <CIcon className="me-2" icon={icon.cilSun} size="lg" /> Light
                  </CDropdownItem>
                  <CDropdownItem
                    active={colorMode === 'dark'}
                    className="d-flex align-items-center"
                    as="button"
                    type="button"
                    onClick={() => {
                      setColorMode('dark')
                      setColorModeContext('dark')
                    }}
                  >
                    <CIcon className="me-2" icon={icon.cilMoon} size="lg" /> Dark
                  </CDropdownItem>
                  {/* <CDropdownItem
                    active={colorMode === 'auto'}
                    className="d-flex align-items-center"
                    as="button"
                    type="button"
                    onClick={() => {
                      setColorMode('auto')
                      setColorModeContext('auto')
                    }}
                  >
                    <CIcon className="me-2" icon={icon.cilContrast} size="lg" /> Auto
                  </CDropdownItem> */}
                </CDropdownMenu>
              </CDropdown>
              <li className="nav-item py-1  py-0 d-flex align-items-center">
                <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
              </li>
            </CHeaderNav>
            <CHeaderNav>
              <AppHeaderDropdown colorMode={colorMode} />
            </CHeaderNav>
          </div>
        </div>
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
