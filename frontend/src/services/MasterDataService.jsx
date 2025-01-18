import useVerify from '../hooks/UseVerify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const useMasterDataService = () => {
  const { token, axiosJWT } = useVerify()

  const handleError = (error, message) => {
    console.error(message, error)

    // Cek apakah ada data duplikat di error.response.data
    if (error.response?.data?.duplicates) {
      const duplicates = error.response.data.duplicates
        .map((dup) => `Row: ${dup.rowNumber}, Data: ${dup.data.join(', ')}`)
        .join('<br>')

      MySwal.fire({
        icon: 'error',
        title: 'Duplicate Data',
        html: `<p>${error.response.data.message}</p><p>${duplicates}</p>`,
      })
    } else {
      // Tampilkan pesan error biasa
      MySwal.fire('Error', `${error.response?.data?.message || 'Terjadi kesalahan'}`, 'error')
    }

    // Lempar error agar bisa ditangani di level berikutnya
    throw new Error(message + (error.message || ''))
  }

  const getMasterData = async (api) => {
    try {
      const response = await axiosJWT.get(`/${api}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error fetching:')
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

  const postMasterData = async (api, data) => {
    try {
      const response = await axiosJWT.post(`/${api}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }

  const uploadMasterData = async (api, data) => {
    try {
      const response = await axiosJWT.post(`/${api}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }

  const updateMasterDataById = async (api, id, data) => {
    try {
      const response = await axiosJWT.put(`/${api}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error update data for ID ${id}:`)
    }
  }

  const deleteMasterDataById = async (api, id) => {
    try {
      const response = await axiosJWT.get(`/${api}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data // Returning the data instead of the whole response
    } catch (error) {
      handleError(error, `Error delete data for ID ${id}:`)
    }
  }

  const uploadImageMaterial = async (api, id, file) => {
    try {
      const response = await axiosJWT.post(`/${api}/${id}`, file, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response
    } catch (error) {
      handleError(error, 'Error post:')
    }
  }

  return {
    getMasterData,
    getMasterDataById,
    postMasterData,
    updateMasterDataById,
    deleteMasterDataById,
    uploadMasterData,
    uploadImageMaterial,
  }
}

export default useMasterDataService
