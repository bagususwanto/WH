import axiosBaseUrl from './AxiosBaseUrl'
import useCookies from './Cookies'

const useAxiosWithAuth = () => {
  const axiosInstance = axiosBaseUrl.create()
  const { getCookieAccessToken, getCookieRefreshToken, setCookieAccessToken } = useCookies()

  const refreshAccessToken = async () => {
    try {
      const response = await axiosInstance.get('/token') // Endpoint untuk refresh token
      return response.data.accessToken
    } catch (error) {
      console.error('Gagal refresh token:', error)
      throw error
    }
  }

  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = getCookieAccessToken()
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
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = getCookieRefreshToken()

        if (!refreshToken) {
          console.error('Refresh token tidak ada, kembali ke halaman login')
          return Promise.reject(error)
        }

        try {
          const newAccessToken = await refreshAccessToken()
          setCookieAccessToken(newAccessToken)

          // Jika berhasil mendapatkan token baru, lanjutkan dengan permintaan asli
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return axiosInstance(originalRequest)
          } else {
            console.error('Gagal mendapatkan token baru')
            return Promise.reject(error)
          }
        } catch (err) {
          console.error('Gagal memperbarui access token:', err)
          return Promise.reject(err)
        }
      }

      return Promise.reject(error)
    },
  )

  return axiosInstance
}

export default useAxiosWithAuth
