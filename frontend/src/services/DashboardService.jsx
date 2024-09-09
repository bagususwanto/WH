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
      const response = await axiosJWT.get(`/inventory-critical-stock?limit=${limit}&order=${order}`, {
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
  }
}

export default useDashboardService
