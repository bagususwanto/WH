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

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useVerify from '../../hooks/UseVerify'

const AppHeaderDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { name } = useVerify()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/logout')
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
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0 d-flex align-items-center"
        caret={false}
      >
        <CAvatar src={profile} size="md" />
        <div className="ms-3 d-flex flex-column">
          <span>{firstName}</span>
          <span>{lastName}</span>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Account</CDropdownHeader>
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
