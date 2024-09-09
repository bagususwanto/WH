import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://10.65.133.99:5000/api',
  withCredentials: true,
})

export default axiosInstance
