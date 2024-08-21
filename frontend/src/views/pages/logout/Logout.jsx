import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthService from '../../../services/AuthService'

const Logout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthService()

  useEffect(() => {
    const logoutHandler = async () => {
      await logout()
      navigate('/login')
    }
    logoutHandler()
  }, [navigate])

  return <div>Logging out...</div>
}

export default Logout
