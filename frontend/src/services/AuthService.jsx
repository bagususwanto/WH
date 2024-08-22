import useAxiosWithAuth from '../utils/AxiosInstance'
import axiosBaseUrl from '../utils/AxiosBaseUrl'
import { useNavigate } from 'react-router-dom'
import useCookies from '../utils/Cookies'

const useAuthService = () => {
  const axiosInstance = useAxiosWithAuth()
  const navigate = useNavigate()
  const { getCookieRefreshToken } = useCookies()

  const register = async (username, password) => {
    try {
      const response = await axiosInstance.post('/register', { username, password })
      return response
    } catch (error) {
      console.error('Error during registration:', error)
      // Tangani error sesuai kebutuhan (misalnya, dengan menampilkan pesan kepada pengguna)
      throw error
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axiosBaseUrl.post('/login', { username, password })
      return response
    } catch (error) {
      console.error('Error during login:', error)
      // Tangani error sesuai kebutuhan (misalnya, dengan menampilkan pesan kepada pengguna)
      throw error
    }
  }

  const logout = async () => {
    try {
      const response = await axiosInstance.delete('/logout')
      return response
    } catch (error) {
      console.error('Error during logout:', error)
      const refreshToken = getCookieRefreshToken()

      // Cek apakah refreshToken ada di cookies
      if (!refreshToken) {
        navigate('/login')
      }

      // Tangani error sesuai kebutuhan (misalnya, dengan menampilkan pesan kepada pengguna)
      throw error
    }
  }

  const getUser = async () => {
    try {
      const response = await axiosInstance.get('/user')
      return response
    } catch (error) {
      console.error('Error fetching user:', error)

      const refreshToken = getCookieRefreshToken()

      // Cek apakah refreshToken ada di cookies
      if (!refreshToken) {
        navigate('/login')
      }

      // Tangani error sesuai kebutuhan (misalnya, dengan menampilkan pesan kepada pengguna)
      throw error
    }
  }

  return {
    register,
    login,
    logout,
    getUser,
  }
}

export default useAuthService
