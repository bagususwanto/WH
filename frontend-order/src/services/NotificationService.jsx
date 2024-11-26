import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useNotificationService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getNotification = async (warehouseId) => {
    try {
      const response = await axiosJWT.get(`/notification/${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      // handleError(error, `Error get data`)
      console.log(error)
    }
  }

  const getNotificationCount = async (warehouseId) => {
    try {
      const response = await axiosJWT.get(`/notification-count/${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      // handleError(error, `Error get data`)
      console.log(error)
    }
  }

  const postNotification = async (warehouseId, postId) => {
    try {
      const response = await axiosJWT.post(`/read-notification/${warehouseId}/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }
  
  const postAllNotification = async (warehouseId) => {
    try {
      const response = await axiosJWT.post(`/read-all-notification/${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }

  return {
    getNotification,
    getNotificationCount,
    postNotification,
    postAllNotification
  }
}

export default useNotificationService
