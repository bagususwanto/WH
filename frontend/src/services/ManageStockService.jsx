import useVerify from '../hooks/UseVerify'

const useManageStockService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error);
    throw new Error(message + error.message); 
  };
  

  const getInventory = async () => {
    try {
      const response = await axiosJWT.get('/inventory', {
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
      handleError(error, 'Error post user:')
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

  return {
    getInventory,
    getIncoming,
    updateInventoryById,
    postIncomingPlan,
    postIncomingActual,
  }
}

export default useManageStockService
