import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const useCookies = () => {
  const getCookieAccessToken = () => {
    return Cookies.get('accessToken')
  }
  const getCookieRefreshToken = () => {
    return Cookies.get('refreshToken')
  }

  const setCookieAccessToken = (accessToken) => {
    return Cookies.set('accessToken', accessToken, { expires: 20 / (24 * 60 * 60) })
  }

  const setCookieRefreshToken = (refreshToken) => {
    return Cookies.set('refreshToken', refreshToken, { expires: 1 })
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

  return {
    getCookieAccessToken,
    getCookieRefreshToken,
    getPayloadCookies,
    setCookieAccessToken,
    setCookieRefreshToken,
  }
}

export default useCookies
