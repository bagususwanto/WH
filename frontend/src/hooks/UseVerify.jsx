import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/AxiosInstance'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(swal)

const useVerify = () => {
  const [name, setName] = useState('')
  const [roleName, setRoleName] = useState('')
  const [warehouseId, setWarehouseId] = useState(0)
  const [token, setToken] = useState('')
  const [expire, setExpire] = useState(0)
  const [isWarehouse, setIsWarehouse] = useState(0)
  const [imgProfile, setImgProfile] = useState('')
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
      setRoleName(decoded.roleName)
      setWarehouseId(decoded.anotherWarehouseId)
      setExpire(decoded.exp)
      setIsWarehouse(decoded.isWarehouse)
      setImgProfile(decoded.img)
    } catch (error) {
      console.error('Error refreshing token:', error)
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Token Expired',
      })
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
          setRoleName(decoded.roleName)
          setWarehouseId(decoded.anotherWarehouseId)
          setExpire(decoded.exp)
          setIsWarehouse(decoded.isWarehouse)
          setImgProfile(decoded.img)
        } catch (error) {
          console.error('Error refreshing token in interceptor:', error)
          MySwal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Token Expired',
          })
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

  return { name, roleName, warehouseId, token, isWarehouse, imgProfile, axiosJWT }
}

export default useVerify
