import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownHeader,
} from '@coreui/react'
import {
  cilUser,
  cilAccountLogout,
  cilHistory,
  cilBadge,
  cilEnvelopeLetter,
  cilHeart,
  cilClipboard,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import profile from './../../assets/images/avatars/profile.png'
import React, { useEffect, useState, useContext, useRef } from 'react'
import config from '../../utils/Config'
import { useNavigate } from 'react-router-dom'
import useVerify from '../../hooks/UseVerify'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuthService from '../../services/AuthService'

const AppHeaderDropdown = () => {
  const { name, roleName, isWarehouse, imgProfile } = useVerify() // Pastikan roleName disertakan di sini
  const navigate = useNavigate()
  const { logout } = useAuthService()
  const MySwal = withReactContent(swal)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // Tambahkan state untuk mengontrol dropdown
  const dropdownRef = useRef(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const handleHistory = () => {
    navigate('/history')
  }

  const handleProfile = () => {
    navigate('/profile')
  }
  const handleWhislist = () => {
    navigate('/wishlist')
  }
  const handleapproveall = () => {
    navigate('/approveall')
  }
  const handleconfirmall = () => {
    navigate('/confirmall')
  }
  const handledatacomplete = () => {
    window.open(`${config.INVEN_URL}/#/goodissue`, '_blank')
  }

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

  const [firstName, lastName] = name.split(' ')
  let shouldShowApproval = false
  let shouldShowWarehouse = false

  // Cek kondisi untuk roleName
  if (
    roleName === 'line head' ||
    roleName === 'super admin' ||
    roleName === 'section head' ||
    roleName === 'department head'
  ) {
    shouldShowApproval = true
  }
  if (
    roleName === 'super admin' ||
    roleName === 'warehouse staff' ||
    roleName === 'warehouse member' ||
    (isWarehouse == 1 && roleName === 'group head') ||
    (isWarehouse == 1 && roleName === 'line head') ||
    (isWarehouse == 1 && roleName === 'section head') ||
    (isWarehouse == 1 && roleName === 'department head')
  ) {
    shouldShowWarehouse = true
  }
  const handleDropdownToggle = () => {
    const dropdownElement = document.querySelector('.order-header')
    if (!isDropdownOpen) {
      dropdownElement?.classList.remove('sticky-search-bar')
    } else {
      dropdownElement?.classList.add('sticky-search-bar')
    }
    setIsDropdownOpen(!isDropdownOpen) // Toggle state
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <CDropdown
      variant="nav-item"
      autoClose="outside"
      visible={isDropdownOpen}
      ref={dropdownRef}
      onMouseEnter={() => {
        s
        // Buka saat hover
        setIsDropdownOpen(true)
        setIsCartOpen(false)
        setIsNotifOpen(false)
      }}
      onMouseLeave={() => setIsDropdownOpen('outside')} // Tutup saat keluar
    >
      <CDropdownToggle
        className="py-0 pe-0 d-flex align-items-center"
        caret={false}
        onClick={() => setIsDropdownOpen((prev) => !prev)} // Tampilkan/hidden dropdown saat diklik
      >
        <CAvatar src={imgProfile ? `${config.BACKEND_URL}${imgProfile}` : profile} size="md" />
        <div className="ms-2 d-flex flex-column">
          <span style={{ fontSize: '0.7em' }}>Welcome,</span>
          <span style={{ fontSize: '1em' }}>
            {firstName}
            {''} {lastName}
          </span>
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

        {/* Conditional Approve All Item */}
        {shouldShowApproval && (
          <>
            <CDropdownDivider />
            <CDropdownItem onClick={handleapproveall} style={{ cursor: 'pointer' }}>
              <CIcon icon={cilEnvelopeLetter} className="me-2" />
              Approval
            </CDropdownItem>
          </>
        )}
        {shouldShowWarehouse && (
          <>
            <CDropdownDivider />
            <CDropdownItem onClick={handleconfirmall} style={{ cursor: 'pointer' }}>
              <CIcon icon={cilEnvelopeLetter} className="me-2" />
              GI Confirm
            </CDropdownItem>
          </>
        )}
        {shouldShowApproval && (
          <>
            <CDropdownDivider />
            <CDropdownItem onClick={handledatacomplete} style={{ cursor: 'pointer' }}>
              <CIcon icon={cilClipboard} className="me-2" />
              Complete Data
            </CDropdownItem>
          </>
        )}

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
