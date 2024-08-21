import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
// import jwtDecode from 'jwt-decode'; // Optional, jika ingin mengecek expired

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

const useAxiosWithAuth = () => {
  const navigate = useNavigate()

  const refreshAccessToken = async () => {
    try {
      console.log('Meminta refresh token...')
      const response = await axiosInstance.get('/token') // Endpoint untuk refresh token
      console.log('Berhasil mendapatkan access token baru:', response.data.accessToken)
      return response.data.accessToken
    } catch (error) {
      console.error('Gagal refresh token:', error)
      navigate('/login') // Redirect ke halaman login jika refresh token gagal
      throw error
    }
  }

  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = Cookies.get('accessToken') // Ambil token dari cookies
      console.log('accessToken:', accessToken)
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Interceptor untuk menangani pembaruan accessToken jika kadaluarsa
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      console.log('Pembaruan accessToken...')
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = Cookies.get('refreshToken')

        // Jika tidak ada refresh token, langsung redirect ke login
        if (!refreshToken) {
          console.error('Refresh token tidak ada, arahkan ke halaman login')
          navigate('/login') // Navigasi langsung ke halaman login
          return Promise.reject(error)
        }

        try {
          const newAccessToken = await refreshAccessToken()
          Cookies.set('accessToken', newAccessToken, { expires: 1 / 1440 })

          // Jika berhasil mendapatkan token baru, lanjutkan dengan permintaan asli
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return axiosInstance(originalRequest)
          } else {
            // Jika tidak ada access token baru, redirect ke login
            navigate('/login')
            return Promise.reject(error)
          }
        } catch (err) {
          console.error('Gagal memperbarui access token:', err)
          navigate('/login')
          return Promise.reject(err)
        }
      }

      return Promise.reject(error)
    },
  )

  return axiosInstance
}

export default useAxiosWithAuth
