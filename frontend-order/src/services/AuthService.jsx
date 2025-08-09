import axiosInstance from '../utils/AxiosInstance'
import useAuth from '../hooks/UseAuth'


const useAuthService = () => {
   const {  setTokenAndDecode, clearAuth } = useAuth()
  const handleError = (error, message) => {
    console.error(message, error)
    throw new Error(message + error.message)
  }

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/login', { username, password })
         setTokenAndDecode(response.data.accessToken)
      return response
    } catch (error) {
      handleError(error, 'Error during login:')
    }
  }

  const logout = async () => {
    try {
      const response = await axiosInstance.delete('/logout')
        clearAuth()
      return response
    } catch (error) {
        clearAuth()
      handleError(error, 'Error during logout:')
    }
  }

  return {
    login,
    logout,
  }
}

export default useAuthService
