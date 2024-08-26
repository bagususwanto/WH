import useVerify from '../hooks/UseVerify'

const useManageStockService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)
    // Handle error as needed (e.g., show message to user)
    throw error
  }

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

  return {
    getInventory,
    updateInventoryById,
  }
}

export default useManageStockService
