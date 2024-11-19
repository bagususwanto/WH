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

  const deleteWishlist = async (id, warehouseId) => {
    try {
      const response = await axiosJWT.delete(`/wishlist-delete/${id}/${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching wishlist:')
    }
  }

  const addWishlist = async (data, warehouseId) => {
    try {
      const response = await axiosJWT.post(`/wishlist/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getMyorder = async ({ id, status = 'all', page = 1, isReject = 0, q = '' }) => {
    try {
      const response = await axiosJWT.get(
        `/myorder/${id}?page=${page}&limit=10&status=${status}&isReject=${isReject}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getOrderHistory = async (id) => {
    try {
      const response = await axiosJWT.get(`/order-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching Order History:')
    }
  }

  const checkout = async (data, warehouseId) => {
    try {
      const response = await axiosJWT.post(`/checkout/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const createOrder = async (data, warehouseId) => {
    try {
      const response = await axiosJWT.post(`/order/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error Create Order:')
    }
  }

  return {
    getWishlist,
    clearWishlist,
    deleteWishlist,
    addWishlist,
    getMyorder,
    checkout,
    createOrder,
    getOrderHistory,
  }
}

export default useOrderService
