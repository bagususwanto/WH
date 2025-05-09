import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useCartService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getCart = async (id) => {
    try {
      const response = await axiosJWT.get(`/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }
  const postCart = async (data, warehouseId) => {
    try {
      const response = await axiosJWT.post(`/cart/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }
  const updateCart = async (data, warehouseId) => {
    try {
      const response = await axiosJWT.put(`/cart/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }
  const deleteCart = async (id, warehouseId) => {
    try {
      const response = await axiosJWT.delete(`/cart/${id}/${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error deleting data for ID ${id}:`)
    }
  }

  const getCartCount = async (id) => {
    try {
      const response = await axiosJWT.get(`/cart-count/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error delete data for ID ${id}:`)
    }
  }

  return {
    getCart,
    postCart,
    updateCart,
    deleteCart,
    getCartCount,
  }
}

export default useCartService
