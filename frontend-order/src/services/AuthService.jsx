import axiosInstance from '../utils/AxiosInstance'

const useAuthService = () => {
  const handleError = (error, message) => {
    console.error(message, error)
    throw new Error(message + error.message)
  }

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/login', { username, password })
      return response
    } catch (error) {
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

  return {
    login,
    logout,
  }
}

export default useAuthService
