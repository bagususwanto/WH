import axios from 'axios'

const axiosBaseUrl = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

export default axiosBaseUrl