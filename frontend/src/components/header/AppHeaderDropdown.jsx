import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownHeader,
} from '@coreui/react'
import { cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import profile from './../../assets/images/avatars/profile.png'
import profileDark from './../../assets/images/avatars/profile-dark.png'

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useVerify from '../../hooks/UseVerify'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuthService from '../../services/AuthService'
import config from '../../utils/Config'

const AppHeaderDropdown = ({ colorMode }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { name, imgProfile } = useVerify()
  const navigate = useNavigate()
  const { logout } = useAuthService()
  const MySwal = withReactContent(swal)

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

  const handleProfile = () => {
    navigate('/profile')
  }
  const [firstName, lastName] = name.split(' ')

  const handleDropdownToggle = () => {
    const dropdownElement = document.querySelector('.order-header')
    if (!isDropdownOpen) {
      dropdownElement?.classList.remove('sticky-search-bar')
    } else {
      dropdownElement?.classList.add('sticky-search-bar')
    }
    setIsDropdownOpen(!isDropdownOpen) // Toggle state
  }

  return (
    <CDropdown variant="nav-item" onClick={handleDropdownToggle}>
      <CDropdownToggle className="d-flex align-items-center py-0 pe-0" caret={false}>
        <CAvatar
          src={
  imgProfile
    ? imgProfile.startsWith('http') || imgProfile.startsWith('//')
      ? imgProfile
      : `${config.BACKEND_URL}${imgProfile}`
    : colorMode === 'light'
      ? profile
      : profileDark
}
          size="md"
        />
        <div className="d-flex flex-column ms-2">
          <span style={{ fontSize: '0.7em' }}>Welcome,</span>
          <span style={{ fontSize: '1em' }}>
            {firstName}
            {''} {lastName}
          </span>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary my-2 fw-semibold">Account</CDropdownHeader>
        <CDropdownItem onClick={handleProfile} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
