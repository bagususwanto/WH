import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/AxiosInstance'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuth from './UseAuth'

const MySwal = withReactContent(swal)

let isRefreshing = false // Flag to prevent multiple refresh requests
let refreshPromise = null // Store the promise for the refresh request

const useVerify = () => {
  const { auth, setTokenAndDecode } = useAuth()
  const navigate = useNavigate()

  const axiosJWT = axiosInstance.create()

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date()
      if (auth.expire * 1000 < currentDate.getTime()) {
        console.log('Token expired, refreshing...')

        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = axiosInstance
            .get('/token') // pakai axios TANPA interceptor
            .then((response) => {
              const newAccessToken = response.data.accessToken
              setTokenAndDecode(newAccessToken)
              isRefreshing = false
              return newAccessToken
            })
            .catch((error) => {
              isRefreshing = false
              console.error('Token refresh failed:', error)
              MySwal.fire({
                icon: 'error',
                title: 'Session expired',
                text: 'Please log in again.',
              })
              navigate('/login')
              return Promise.reject(error)
            })
        }

        try {
          const newToken = await refreshPromise
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (err) {
          return Promise.reject(err)
        }

      } else {
        config.headers.Authorization = `Bearer ${auth.token}`
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  return {
    ...auth,
    axiosJWT,
    setTokenAndDecode,
  }
}

export default useVerify
