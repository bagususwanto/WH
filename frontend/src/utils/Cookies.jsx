import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const useCookies = () => {
  const getCookieRefreshToken = () => {
    return Cookies.get('refreshToken')
  }

  const getPayloadCookies = () => {
    try {
      const token = getCookieRefreshToken() // Ambil token
      if (!token) {
        console.warn('Refresh token tidak ditemukan')
        return null
      }
      const decodedToken = jwtDecode(token) // Decode token
      if (decodedToken && decodedToken.roleId) {
        decodedToken.roleId = parseInt(decodedToken.roleId, 10)
      }
      return decodedToken
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  return { getCookieRefreshToken, getPayloadCookies }
}

export default useCookies
