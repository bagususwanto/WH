import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import avatar2 from './../../assets/images/avatars/2.jpg'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import axiosInstance from '../../utils/AxiosInstance'

const AppHeaderDropdown = () => {
  const [name, setName] = useState('')
  const [shopName, setShopName] = useState('')
  const [expire, setExpire] = useState('')
  const navigate = useNavigate()

  // useEffect(() => {
  //   refreshToken();
  // }, []);

  // const refreshToken = async () => {
  //   try {
  //     const response = await axiosInstance.get('/token')
  //     const decoded = jwtDecode(response.data.accessToken)
  //     setName(decoded.name)
  //     setShopName(decoded.shopName)
  //     setExpire(decoded.exp)
  //   } catch (error) {
  //     if (error.response) {
  //       navigate('/login')
  //     }
  //   }
  // }

  // const axiosJWT = axiosInstance.create()

  // axiosJWT.interceptors.request.use(
  //   async (config) => {
  //     const currentDate = new Date()
  //     if (expire * 1000 < currentDate.getTime()) {
  //       const response = await axiosInstance.get('/token')
  //       config.headers.Authorization = `Bearer ${response.data.accessToken}`
  //       const decoded = jwtDecode(response.data.accessToken)
  //       setName(decoded.name)
  //       setExpire(decoded.exp)
  //     }
  //     return config
  //   },
  //   (error) => {
  //     return Promise.reject(error)
  //   },
  // )

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
        <CAvatar src={avatar2} size="md" />
        <div className="ms-3 d-flex flex-column">
          <span>{firstName}</span>
          <span>{lastName}</span>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Account</CDropdownHeader>
        <CDropdownItem href="#">
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
