import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useDashboardService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data}`, 'error')
    throw new Error(message + error.message)
  }

  const getInventoryCriticalStock = async (limit,order) => {
    try {
      const response = await axiosJWT.get(`/inventory-dashboard?limit=${limit}&order=${order}&status=critical`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getInventoryLowestStock = async (limit,order) => {
    try {
      const response = await axiosJWT.get(`/inventory-dashboard?limit=${limit}&order=${order}&status=lowest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getInventoryOverflowStock = async (limit,order) => {
    try {
      const response = await axiosJWT.get(`/inventory-dashboard?limit=${limit}&order=${order}&status=overflow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  return {
    getInventoryCriticalStock,
    getInventoryLowestStock,
    getInventoryOverflowStock,
  }
}

export default useDashboardService
