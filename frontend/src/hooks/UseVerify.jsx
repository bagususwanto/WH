import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/AxiosInstance'

const useVerify = () => {
  const [name, setName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [token, setToken] = useState('')
  const [expire, setExpire] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    refreshToken()
  }, [])

  const refreshToken = async () => {
    try {
      const response = await axiosInstance.get('/token')
      setToken(response.data.accessToken)
      const decoded = jwtDecode(response.data.accessToken)
      setName(decoded.name)
      setRoleId(decoded.roleId)
      setExpire(decoded.exp)
    } catch (error) {
      console.error('Error refreshing token:', error)
      navigate('/login')
    }
  }

  const axiosJWT = axiosInstance.create()

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date()
      if (expire * 1000 < currentDate.getTime()) {
        try {
          const response = await axiosInstance.get('/token')
          config.headers.Authorization = `Bearer ${response.data.accessToken}`
          setToken(response.data.accessToken)
          const decoded = jwtDecode(response.data.accessToken)
          setName(decoded.name)
          setRoleId(decoded.roleId)
          setExpire(decoded.exp)
        } catch (error) {
          console.error('Error refreshing token in interceptor:', error)
          navigate('/login')
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  return { name, roleId, token, axiosJWT }
}

export default useVerify
