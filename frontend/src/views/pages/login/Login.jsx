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
  CSpinner,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons'
import { cilLockLocked, cilUser, cibCircleci } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import '../../../scss/_tabels.scss'
import withReactContent from 'sweetalert2-react-content'
import useAuthService from './../../../services/AuthService'
import logo from '../../../assets/brand/TWIIS-NEW.png'
import background from '../../../assets/brand/bgwh.png'
import backgroundDark from '../../../assets/brand/bgwh-dark.png'

import { useTheme } from '../../../context/ThemeProvider'

const MySwal = withReactContent(Swal)

const Login = () => {
  const { colorModeContext, setColorModeContext } = useTheme()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()
  const { login } = useAuthService()

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

    if (!username || !password) {
      setMsg('Username dan password harus diisi')
      return
    }

    if (password.length < 6) {
      setMsg('Password harus lebih dari 6 karakter')
      return
    }
    

    try {
      setLoading(true)
      await login(username, password)
      navigate('/dashboard')
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg)
      } else {
        console.error('Error:', error.message)
      }
    } finally {
      setLoading(false)
    }

  
  }

  return (
    <div
      className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center"
      style={{
        backgroundImage: `url(${colorModeContext === 'light' ? background : backgroundDark})`, // Menggunakan gambar impor
        backgroundSize: 'cover', // Agar gambar menyesuaikan dengan ukuran viewport
        backgroundPosition: 'center', // Posisi gambar di tengah
        backgroundRepeat: 'no-repeat', // Mencegah pengulangan gambar
        overlay: 'auto',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={12} sm={12} lg={8} xl={7}>
            <CCardGroup className="d-flex flex-column-reverse flex-sm-row">
              <div className="d-block d-sm-flex ">
                <CCard className=" px-2 max-sm-width-100 max-width-50px rounded-2 rounded-end-0 card-theme-toggle"
                style={{backgroundColor:'rgba(255,255,255,0.5)', backdropFilter:'blur(1px)'}}>
                  <div className="d-flex pt-2 pt-sm-5 pb-2 flex-sm-column flex-row  align-items-center justify-content-center gap-3">
                    <CButton
                      onClick={() => {
                        setColorModeContext('light')
                        setColorMode('light')
                      }}
                      color={colorModeContext === 'light' && 'dark'}
                      className="border-0"
                    >
                      <CIcon icon={icon.cilSun} size="lg" />
                    </CButton>
                    <CButton
                      onClick={() => {
                        setColorModeContext('dark')
                        setColorMode('dark')
                      }}
                      color={colorModeContext === 'dark' && 'light'}
                      className="border-0"
                    >
                      <CIcon icon={icon.cilMoon} size="lg" />
                    </CButton>
                  </div>
                </CCard>
                 
              </div>
              <CCard className="text-white shadow-lg p-2 rounded-0 card-login" style={{backgroundColor:'rgba(255,255,255,0.5)', backdropFilter:'blur(1px)'}}>
                <CCardBody>
                 <CRow> 
                    <label className="fw-bold display-6 justify-content-start align-items-start"
                    style={{color:'black',opacity:'0.4',color: colorModeContext === 'light' ? 'black' : 'white'}} >
                      Hello!
                    </label>
                  </CRow>
                  <CRow>
                    <label className="fw-bold display-6 justify-content-start align-items-start mb-5"
                      style={{color:'black',opacity:'0.3',color: colorModeContext === 'light' ? 'black' : 'white'}}  >
                      Welcome To
                    </label>
                  </CRow >
                   <div className="text-center w-100">
                  <img
                    src={logo}
                    alt="Logo"
                    className="img-fluid"
                    style={{
                      width: window.innerWidth >= 1080 ? '210px'
                            : window.innerWidth >= 800 ? '150px'
                            : '190px',
                      height: 'auto',
                    }}
                  />
                  </div>
                </CCardBody>
               
              </CCard>
               <CCard className="text-white shadow-lg p-4 rounded-0 card-login" style={{backgroundColor:'rgba(255,255,255,0.5)', backdropFilter:'blur(1px)'}}>
                  <CCardBody>
                    <CForm onSubmit={Auth}>
                      <h1 style={{ color: colorModeContext === 'light' ? 'black' : 'white'}} >Login</h1>
                      <p className="text-body-secondary">Sign In to your account</p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Username"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={6}>
                          <CButton
                            color={colorModeContext === 'light' ? 'dark' : 'secondary'}
                            className={` login-button w-100 d-flex align-items-center justify-content-center gap-2 ${loading && 'disabled'}`}
                            type="submit"
                          >
                            {loading && <CSpinner size="sm" />} Login
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
