import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useManageStockService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    MySwal.fire('Error', `${error.response.data.message}`, 'error')
    throw new Error(message + error.message)
  }

  const getInventory = async (id) => {
    try {
      const response = await axiosJWT.get(`/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getIncoming = async () => {
    try {
      const response = await axiosJWT.get('/incoming', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const updateInventoryById = async (id, data) => {
    try {
      const response = await axiosJWT.put(`inventory/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error update data for ID ${id}:`)
    }
  }

  const updateIncomingById = async (id, data) => {
    try {
      const response = await axiosJWT.put(`incoming/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error update data for ID ${id}:`)
    }
  }

  const postIncomingPlan = async (api, data) => {
    try {
      const response = await axiosJWT.post(`/${api}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post incoming:')
    }
  }

  const postIncomingActual = async (api, data) => {
    try {
      const response = await axiosJWT.post(`/${api}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post user:')
    }
  }

  const executeInventory = async () => {
    try {
      const response = await axiosJWT.get('/inventory-execute', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const getAllInventory = async () => {
    try {
      const response = await axiosJWT.get('/inventory-all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching inventory:')
    }
  }

  const updateInventorySubmit = async (data) => {
    try {
      const response = await axiosJWT.post('/inventory-submit', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, 'Error update inventory:')
    }
  }

  return {
    getInventory,
    getIncoming,
    updateInventoryById,
    postIncomingPlan,
    postIncomingActual,
    updateIncomingById,
    executeInventory,
    getAllInventory,
    updateInventorySubmit,
  }
}

export default useManageStockService
