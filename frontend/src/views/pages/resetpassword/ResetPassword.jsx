import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuthService from '../../../services/AuthService'
import logo from '../../../assets/brand/TWIIS-NEW.png'
import background from '../../../assets/brand/bgwh.png'

const MySwal = withReactContent(Swal)

const ResetPassword = () => {
  const [password, setPassword] = useState({
    currrentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const { resetPassword } = useAuthService()

  useEffect(() => {
    if (msg) {
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: msg,
      })
      setMsg('')
    }
  }, [msg])

  const Auth = async (e) => {
    e.preventDefault()

    if (!password.currrentPassword || !password.newPassword || !password.confirmPassword) {
      setMsg('All fields are required')
      return
    }

    if (password.newPassword !== password.confirmPassword) {
      setMsg('Passwords do not match')
      return
    }

    if (password.newPassword.length < 6 || password.confirmPassword.length < 6) {
      setMsg('Password must be at least 6 characters long')
      return
    }

    try {
      await resetPassword(password)
      navigate('/login')
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg)
      } else {
        console.error('Error:', error.message)
      }
    }
  }

  return (
    <div
      className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center"
      style={{
        backgroundImage: `url(${background})`, // Menggunakan gambar impor
        backgroundSize: 'cover', // Agar gambar menyesuaikan dengan ukuran viewport
        backgroundPosition: 'center', // Posisi gambar di tengah
        backgroundRepeat: 'no-repeat', // Mencegah pengulangan gambar
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={Auth}>
                    <h2>Reset Password</h2>
                    <p className="text-body-secondary">Change your password account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Current Password"
                        autoComplete="currentpassword"
                        value={password.currrentPassword}
                        onChange={(e) => setPassword({ currrentPassword: e.target.value })}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="New Password"
                        autoComplete="newpassword"
                        value={password.newPassword}
                        onChange={(e) => setPassword({ newPassword: e.target.value })}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Confirm Password"
                        autoComplete="confirmpassword"
                        value={password.confirmPassword}
                        onChange={(e) => setPassword({ confirmPassword: e.target.value })}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Reset
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-white py-5  px-1" style={{ width: '%' }}>
                <CCardBody className="text-center">
                  <img src={logo} alt="Logo" className="sidebar-brand-full" height={80} />

                  <label style={{ color: 'black' }} className="fw-bold fs-5">
                    Toyota Warehouse Integrated Inventory System
                  </label>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ResetPassword
