import { useNavigate } from 'react-router-dom'
import useVerify from '../hooks/UseVerify'
import axiosInstance from '../utils/AxiosInstance'

const useAuthService = () => {
  const navigate = useNavigate()
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    // Handle error as needed (e.g., show message to user)
    throw error
  }

  const register = async (username, password) => {
    try {
      const response = await axiosJWT.post('/register', { username, password })
      return response
    } catch (error) {
      handleError(error, 'Error during registration:')
    }
  }

  // const login = async (username, password) => {
  //   try {
  //     const response = await axiosInstance.post('/login', { username, password })
  //     return response
  //   } catch (error) {
  //     handleError(error, 'Error during login:')
  //   }
  // }

  const logout = async () => {
    try {
      const response = await axiosJWT.delete('/logout')
      return response
    } catch (error) {
      handleError(error, 'Error during logout:')
    }
  }

  const getUser = async () => {
    try {
      const response = await axiosJWT.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching user:')
    }
  }

  return {
    register,
    // login,
    logout,
    getUser,
  }
}

export default useAuthService
