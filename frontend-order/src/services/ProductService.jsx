import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useProductService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getProduct = async (id) => {
    try {
      const response = await axiosJWT.get(`/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }
  const getProductByCategory = async (warehouseId, categoryId, page) => {
    try {
      const response = await axiosJWT.get(
        `/product-category/${warehouseId}/${categoryId}?${page}&limit=24`,
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

  const getProductByQuery = async (id, q) => {
    try {
      const response = await axiosJWT.get(`/product/search/${id}?page=1&limit=20&q=${q}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getAllProduct = async (id) => {
    try {
      const response = await axiosJWT.get(`/product-all/${id}`, {
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
    getProduct,
    getProductByCategory,
    getProductByQuery,
    getAllProduct,
  }
}

export default useProductService
