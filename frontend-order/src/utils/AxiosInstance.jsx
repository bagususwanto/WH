import axios from 'axios'
import config from './Config'

const axiosInstance = axios.create({
  baseURL: `${config.BACKEND_URL}/api`,
  withCredentials: true,
})

export default axiosInstance
