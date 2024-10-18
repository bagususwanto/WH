import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useOrderService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getWishlist = async (id) => {
    try {
      const response = await axiosJWT.get(`/wishlist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const clearWishlist = async (data) => {
    try {
      const response = await axiosJWT.delete('/wishlist-clear', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: data, // Letakkan data di sini untuk metode DELETE
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching wishlist:')
    }
  }

  const getMyorder = async (id) => {
    try {
      const response = await axiosJWT.get(`/myorder/${id}?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }
  const checkout = async (data) => {
    try {
      const response = await axiosJWT.post('/checkout', data, {
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
    getWishlist,
    clearWishlist,
    getMyorder,
    checkout,
  }
}

export default useOrderService
