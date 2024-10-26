import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormTextarea,
  CTableRow,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTableCaption,
} from '@coreui/react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CFormInput, CButton, CFormLabel, CForm, CTable } from '@coreui/react'
import Select from 'react-select'
import { CIcon } from '@coreui/icons-react'
import { cilXCircle } from '@coreui/icons'

import useMasterDataService from '../../services/MasterDataService'
import useManageStockService from '../../services/ManageStockService'

const MySwal = withReactContent(Swal)

const InputInventory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isClearable, setIsClearable] = useState(true)
  const [plant, setPlant] = useState([])
  const [storage, setStorage] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [inventory, setInventory] = useState([])
  const [selectedMaterialNo, setSelectedMaterialNo] = useState(null)
  const [selectedDescription, setSelectedDescription] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedUom, setSelectedUom] = useState(null)
  const [quantity, setQuantity] = useState(0) // State untuk quantity
  const [items, setItems] = useState([]) // State untuk menyimpan item yang ditambahkan
  const [plantId, setPlantId] = useState()
  const [filteredInventory, setFilteredInventory] = useState([])

  const { getMasterData, getMasterDataById } = useMasterDataService()
  const { getInventory, updateInventorySubmit } = useManageStockService()

  const apiPlant = 'plant-public'
  const apiStorage = 'storage-public'
  const apiWarehousePlant = 'warehouse-plant'

  // Konfirmasi sebelum refresh halaman
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = '' // Standar untuk menampilkan prompt konfirmasi di beberapa browser
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    getPlant()
    getStorage()
  }, [])

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      setPlant(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getStorage = async () => {
    try {
      const response = await getMasterData(apiStorage)
      setStorage(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getInventories = async (id) => {
    try {
      const response = await getInventory(id)
      setInventory(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const materialNoOptions = inventory.map((i) => ({
    value: i.id,
    label: i.Material.materialNo,
  }))

  const descriptionOptions = inventory.map((i) => ({
    value: i.id,
    label: i.Material.description,
  }))

  const addressOptions = inventory.map((i) => ({
    value: i.id,
    label: i.Address_Rack.addressRackName,
  }))

  const uomOptions = inventory.map((i) => ({
    value: i.id,
    label: i.Material.uom,
  }))

  const plantOptions = plant.map((plant) => ({
    value: plant.id,
    label: plant.plantName,
  }))

  const handlePlantChange = (selectedPlant) => {
    setIsLoading(true) // Set loading to true when plant change starts

    if (selectedPlant) {
      setPlantId(selectedPlant.value)

      const filteredStorages = storage
        .filter((s) => s.plantId === selectedPlant.value)
        .map((s) => ({
          value: s.id,
          label: s.storageName,
        }))
      setStorageOptions(filteredStorages)
    } else {
      setStorageOptions([])
    }
    setIsLoading(false) // Set loading to false after processing
  }

  const handleStorageChange = async (selectedStorage) => {
    if (selectedStorage) {
      setIsLoading(true) // Aktifkan loading
      try {
        await getInventories(selectedStorage.value)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false) // Nonaktifkan loading setelah data ter-load
      }
    } else {
      setInventory([])
    }
  }

  const handleAddInventory = () => {
    if (
      selectedMaterialNo &&
      selectedDescription &&
      selectedAddress &&
      selectedUom &&
      quantity > 0
    ) {
      const newInventoryItem = {
        id: selectedMaterialNo.value,
        materialNo: selectedMaterialNo.label,
        description: selectedDescription.label,
        address: selectedAddress.label,
        uom: selectedUom.label,
        quantity: quantity,
      }

      // Cek apakah item dengan id yang sama sudah ada dalam items
      const isDuplicate = items.some((item) => item.id === newInventoryItem.id)

      if (isDuplicate) {
        // Tampilkan pesan error jika item duplikat
        MySwal.fire({
          title: 'Error!',
          text: 'Item already exists in the inventory list.',
          icon: 'error',
        })
      } else {
        // Jika tidak ada duplikasi, tambahkan item baru
        setItems([...items, newInventoryItem])

        // Reset input setelah menambahkan item
        setSelectedMaterialNo(null)
        setSelectedDescription(null)
        setSelectedAddress(null)
        setSelectedUom(null)
        setQuantity(0)
      }
    } else {
      MySwal.fire({
        title: 'Error!',
        text: 'Please fill all fields correctly.',
        icon: 'error',
      })
    }
  }

  // Fungsi untuk menghapus item dari tabel
  const handleDeleteInventory = (index) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this item from the inventory?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika pengguna mengonfirmasi, hapus item berdasarkan index
        const updatedItems = items.filter((_, i) => i !== index)
        setItems(updatedItems)

        MySwal.fire('Deleted!', 'Your item has been removed.', 'success')
      }
    })
  }

  const handleMaterialNoChange = (selectedMaterial) => {
    if (selectedMaterial) {
      // Temukan item dari inventory berdasarkan materialNo yang dipilih
      const selectedItem = inventory.find((item) => item.id === selectedMaterial.value)

      if (selectedItem) {
        // Set nilai description, address, dan uom berdasarkan item yang ditemukan
        setSelectedMaterialNo(selectedMaterial) // Atur material yang dipilih
        setSelectedDescription({ value: selectedItem.id, label: selectedItem.Material.description })
        setSelectedAddress({
          value: selectedItem.id,
          label: selectedItem.Address_Rack.addressRackName,
        })
        setSelectedUom({ value: selectedItem.id, label: selectedItem.Material.uom })
      }
    } else {
      // Reset semua state jika tidak ada material yang dipilih
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
    }
  }

  const handleDescriptionChange = (selectedDescription) => {
    if (selectedDescription) {
      // Temukan item dari inventory berdasarkan description yang dipilih
      const selectedItem = inventory.find((item) => item.id === selectedDescription.value)

      if (selectedItem) {
        // Set nilai description, address, dan uom berdasarkan item yang ditemukan
        setSelectedDescription(selectedDescription) // Atur material yang dipilih
        setSelectedMaterialNo({ value: selectedItem.id, label: selectedItem.Material.materialNo })
        setSelectedAddress({
          value: selectedItem.id,
          label: selectedItem.Address_Rack.addressRackName,
        })
        setSelectedUom({ value: selectedItem.id, label: selectedItem.Material.uom })
      }
    } else {
      // Reset semua state jika tidak ada material yang dipilih
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
    }
  }

  const handleSubmit = async () => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      return // Hentikan aksi jika offline
    }

    // Tampilkan konfirmasi menggunakan SweetAlert
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit the inventory update?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Jika user mengkonfirmasi, lakukan submit
        try {
          if (!plantId) {
            MySwal.fire('Error', 'Plant is required, please select a dropdown plant.', 'error')
            return
          }

          const warehouseId = await getMasterDataById(apiWarehousePlant, plantId)
          await updateInventorySubmit(warehouseId.id, items) // Mengirimkan semua item dalam satu body
          setItems([]) // Kosongkan tabel setelah submit berhasil
          MySwal.fire('Success', 'Inventory updated successfully!', 'success')
        } catch (error) {
          console.error('Error updating items:', error)
        }
      }
    })
  }

  // Fungsi untuk menangani perubahan pada Address Code
  const handleAddressCodeChange = (selectedAddressCode) => {
    if (selectedAddressCode) {
      // Filter data inventory berdasarkan address code yang dipilih
      const inventoryByAddress = inventory.filter(
        (item) => item.Address_Rack.addressRackName.slice(0, 2) === selectedAddressCode.label,
      )
      setFilteredInventory(inventoryByAddress) // Simpan data yang sudah difilter ke state
    } else {
      // Reset jika tidak ada address code yang dipilih
      setFilteredInventory([]) // Set empty jika tidak ada address code
    }
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#b22e2e', // Ganti dengan warna border yang diinginkan
      boxShadow: 'none', // Menghilangkan efek shadow
      '&:hover': {
        borderColor: '#b22e2e', // Warna border saat hover
      },
    }),
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Form Input</CCardHeader>
          <CForm>
            <CCardBody>
              <CRow>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="plant">Plant</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    options={plantOptions}
                    id="plant"
                    onChange={handlePlantChange}
                    styles={customStyles}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="storage">Storage</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={storageOptions}
                    id="storage"
                    onChange={handleStorageChange}
                    styles={customStyles}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="address">Address Code</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={inventory
                      .map((i) => ({
                        value: i.id,
                        label: i.Address_Rack.addressRackName.slice(0, 2),
                      }))
                      .filter(
                        (option, index, self) =>
                          index === self.findIndex((o) => o.label === option.label),
                      )}
                    id="address"
                    onChange={handleAddressCodeChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="description">Description</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={(filteredInventory.length > 0 ? filteredInventory : inventory).map(
                      (i) => ({
                        value: i.id,
                        label: i.Material.description,
                      }),
                    )}
                    id="description"
                    onChange={handleDescriptionChange}
                    value={selectedDescription}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="materialNo">Material No</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={(filteredInventory.length > 0 ? filteredInventory : inventory).map(
                      (i) => ({
                        value: i.id,
                        label: i.Material.materialNo,
                      }),
                    )}
                    id="materialNo"
                    onChange={handleMaterialNoChange}
                    value={selectedMaterialNo}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="address">Address</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={(filteredInventory.length > 0 ? filteredInventory : inventory).map(
                      (i) => ({
                        value: i.id,
                        label: i.Address_Rack.addressRackName,
                      }),
                    )}
                    id="address"
                    onChange={setSelectedAddress}
                    value={selectedAddress}
                    isDisabled={true}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="uom">UoM</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={(filteredInventory.length > 0 ? filteredInventory : inventory).map(
                      (i) => ({
                        value: i.id,
                        label: i.Material.uom,
                      }),
                    )}
                    id="uom"
                    onChange={setSelectedUom}
                    value={selectedUom}
                    isDisabled={true}
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12} sm={6} md={3}>
                  <CFormInput
                    type="number"
                    id="quantity"
                    label="Quantity"
                    placeholder="Input.."
                    text="Must be number."
                    aria-describedby="quantity"
                    required
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    value={quantity == 0 ? '' : quantity}
                  />
                </CCol>
                <CCol
                  xs={12}
                  sm={6}
                  md={3}
                  className="d-flex justify-content-start align-items-center"
                >
                  <CButton onClick={handleAddInventory} color="primary">
                    Add
                  </CButton>
                </CCol>
              </CRow>
              <hr />
              <CRow className="mt-4">
                <CTable striped align="middle" responsive className="text-center">
                  <CTableCaption>List of items</CTableCaption>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Material No</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Address</CTableHeaderCell>
                      <CTableHeaderCell scope="col">UoM</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {items.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.materialNo}</CTableDataCell>
                        <CTableDataCell>{item.description}</CTableDataCell>
                        <CTableDataCell>{item.address}</CTableDataCell>
                        <CTableDataCell>{item.uom}</CTableDataCell>
                        <CTableDataCell>{item.quantity}</CTableDataCell>
                        <CTableDataCell>
                          <CIcon
                            icon={cilXCircle}
                            size="xl"
                            style={{ fontSize: '80px', cursor: 'pointer', color: 'red' }} // Memperbesar ukuran dan ubah warna
                            onClick={() => handleDeleteInventory(index)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CRow>
              <CRow className="mt-3">
                <CCol className="d-flex justify-content-end">
                  <CButton
                    onClick={() => {
                      if (items.length > 0) {
                        handleSubmit() // Hanya menjalankan handleSubmit jika ada item
                      } else {
                        Swal.fire('Error', 'Please add inventory first!', 'error') // Menampilkan error jika tidak ada item
                      }
                    }}
                    color="primary"
                    className="text-white"
                  >
                    Submit
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CForm>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default InputInventory
