import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useDashboardService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }
  const getInventoryAll = async (limit, order,id) => {
    try {
      const response = await axiosJWT.get(
        `/inventory-dashboard?limit=${limit}&order=${order}&status=&plant=${id}`,
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

  const getInventoryCriticalStock = async (limit, order,id) => {
    try {
      const response = await axiosJWT.get(
        `/inventory-dashboard?limit=${limit}&order=${order}&status=critical&plant=${id}`,
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

  const getInventoryLowestStock = async (limit, order,id) => {
    try {
      const response = await axiosJWT.get(
        `/inventory-dashboard?limit=${limit}&order=${order}&status=lowest&plant=${id}`,
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

  const getInventoryOverflowStock = async (limit, order,id) => {
    try {
      const response = await axiosJWT.get(
        `/inventory-dashboard?limit=${limit}&order=${order}&status=overflow&plant=${id}`,
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
  const getIncoming= async (startdate, enddate,plant,stroge) => {
    try {
      const response = await axiosJWT.get(
        `/incoming?startDate=${startdate}&endDate=${enddate}&plantId=${plant}&storageId=${stroge}`,
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
  const createIncomingPlan = async (warehouseId,data) => {
    try {
      const response = await axiosJWT.post(
        `/incoming/${warehouseId}`, data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response
    } catch (error) {
      handleError(error, 'Error fetching  post inventory:')
    }
  }
  const updateIncoming = async (incomingId,warehouseId,data) => {
    try {
      const response = await axiosJWT.put(
        `/incoming/${incomingId}/${warehouseId}`, data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response
    } catch (error) {
      handleError(error, 'Error fetching  update inventory:')
    }
  }

  return {
    getInventoryAll,
    getInventoryCriticalStock,
    getInventoryLowestStock,
    getInventoryOverflowStock,
    createIncomingPlan,
    updateIncoming,
    getIncoming,
  }
}

export default useDashboardService
