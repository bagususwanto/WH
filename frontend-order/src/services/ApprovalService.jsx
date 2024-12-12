import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useApprovalService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getApproval = async ({
    id,
    isApproved = 0,
    page = 1,
    startDate = '',
    endDate = '',
    q = '',
  }) => {
    try {
      const response = await axiosJWT.get(
        `/approval/${id}?approved=${isApproved}&page=${page}&limit=10&startDate=${startDate}&endDate=${endDate}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response
    } catch (error) {
      handleError(error, 'Error fetching Approval:')
    }
  }

  const deleteOrderItemApproval = async (detailorderId, warehouseId, data) => {
    try {
      const response = await axiosJWT.put(`/order-item/${detailorderId}/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching Approval:')
    }
  }
  const postApproval = async (orderId, warehouseId, data) => {
    try {
      const response = await axiosJWT.post(`/approve/${orderId}/${warehouseId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }

  const getMasterDataById = async (api, id) => {
    try {
      const response = await axiosJWT.get(`/${api}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error fetching data for ID ${id}:`)
    }
  }

  return {
    getApproval,
    deleteOrderItemApproval,
    postApproval,
  }
}

export default useApprovalService
