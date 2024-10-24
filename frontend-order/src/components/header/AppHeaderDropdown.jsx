import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownHeader,
} from '@coreui/react'
import { cilUser, cilAccountLogout, cilHistory, cilBadge, cilCart, cilHeart } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import profile from './../../assets/images/avatars/profile.png'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import useVerify from '../../hooks/UseVerify'

const AppHeaderDropdown = () => {
  const { name } = useVerify()
  const navigate = useNavigate()

  const handleHistory = () => {
    navigate('/history')
  }

  const handleProfile = () => {
    navigate('/profile')
  }
  const handleWhislist = () => {
    navigate('/wishlist')
  }

  const handleLogout = () => {
    navigate('/logout')
  }

  const [firstName, lastName] = name.split(' ')

  return (
    <CDropdown variant="nav-item">
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
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">My Account</CDropdownHeader>
        <CDropdownItem onClick={handleProfile} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownDivider />

        <CDropdownItem onClick={handleHistory} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilHistory} className="me-2" />
          History Order
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleWhislist} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilHeart} className="me-2" />
          Wishlist
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
