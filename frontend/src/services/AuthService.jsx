import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/AxiosInstance'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useAuthService = () => {
  const navigate = useNavigate()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/login', { username, password })
      return response
    } catch (error) {
      if (error.response?.status === 403) {
        navigate('/reset-password')
      }
      handleError(error, 'Error during login:')
    }
  }

  const logout = async () => {
    try {
      const response = await axiosInstance.delete('/logout')
      return response
    } catch (error) {
      handleError(error, 'Error during logout:')
    }
  }

  const resetPassword = async (password) => {
    try {
      const response = await axiosInstance.post('/reset-password', password)
      return response
    } catch (error) {
      handleError(error, 'Error during reset password:')
    }
  }

  return {
    login,
    logout,
    resetPassword,
  }
}

export default useAuthService
