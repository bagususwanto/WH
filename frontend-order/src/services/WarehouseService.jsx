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

  const getWarehouseConfirm = async ({id,status = '',page = 1,startDate = '', endDate = '',q = '',isReject= 0}) => {
    try {
      const response = await axiosJWT.get(
        `/list-orders/${id}?status=${status}&page=${page}&limit=10&startDate=${startDate}&endDate=${endDate}&q=${q}&isReject=${isReject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response
    } catch (error) {
      console.log(error, 'Error fetching confrim warehouse:')
    }
  }
  const postWarehouseConfirm = async (warehouseId,orderId,data) => {
    try {
      const response = await axiosJWT.post(`/process-order/${warehouseId}/${orderId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }
  const postWarehouseShopping = async (warehouseId,orderId,data) => {
    try {
      const response = await axiosJWT.post(`/shoping-order/${warehouseId}/${orderId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }
  const completeWarehouse = async (warehouseId,orderId,data) => {
    try {
      const response = await axiosJWT.post(`/complete-order/${warehouseId}/${orderId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }
  const rejectWarehouseConfirm = async (warehouseId,detailorderId,data) => {
    try {
      const response = await axiosJWT.post(`/reject-order/${warehouseId}/${detailorderId}`, data, {
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
    getWarehouseConfirm,
    postWarehouseConfirm,
    postWarehouseShopping,
    completeWarehouse,
    rejectWarehouseConfirm
  }
}

export default useApprovalService
