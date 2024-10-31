import React, { useState, useEffect, useRef } from 'react'
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
  CFormInput,
  CButton,
  CFormLabel,
  CForm,
  CTable,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalBody,
} from '@coreui/react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { CIcon } from '@coreui/icons-react'
import { cilPencil, cilQrCode, cilTrash, cilXCircle } from '@coreui/icons'
import { Scanner } from '@yudiel/react-qr-scanner'

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
  const [selectedPlantVal, setSelectedPlantVal] = useState(null)
  const [selectedStorageVal, setSelectedStorageVal] = useState(null)
  const [selectedAddressCodeVal, setSelectedAddressCodeVal] = useState(null)
  const [selectedMaterialNo, setSelectedMaterialNo] = useState(null)
  const [selectedDescription, setSelectedDescription] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedUom, setSelectedUom] = useState(null)
  const [quantity, setQuantity] = useState('') // State untuk quantity
  const [items, setItems] = useState([]) // State untuk menyimpan item yang ditambahkan
  const [plantId, setPlantId] = useState()
  const [filteredInventory, setFilteredInventory] = useState([])
  const [editId, setEditId] = useState(null) // Untuk menyimpan id item yang sedang di-edit
  const [newQuantity, setNewQuantity] = useState('')
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [typeMaterial, setTypeMaterial] = useState([])
  const [selectedTypeMaterial, setSelectedTypeMaterial] = useState(null)
  const [typeMaterialOptions, setTypeMaterialOptions] = useState([])
  const quantityInputRef = useRef(null) // Reference for quantity input field

  const { getMasterData, getMasterDataById } = useMasterDataService()
  const { getInventory, updateInventorySubmit } = useManageStockService()

  const apiPlant = 'plant-public'
  const apiStorage = 'storage-public'
  const apiWarehousePlant = 'warehouse-plant'
  const apiMaterialType = 'material-type'

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
    getMaterialType()
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

  const getMaterialType = async () => {
    try {
      const response = await getMasterData(apiMaterialType)
      setTypeMaterial(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getInventories = async (id, type) => {
    try {
      const response = await getInventory(id, type)
      setInventory(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const plantOptions = plant.map((plant) => ({
    value: plant.id,
    label: plant.plantName,
  }))

  const handlePlantChange = (selectedPlant) => {
    if (items && items.length > 0) {
      MySwal.fire({
        title: 'Warning',
        html: `You have unsaved changes. <br/>
    Please submit the current inventory before making any changes.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmit()
        }
      })
      setSelectedPlantVal(selectedPlantVal)
    }

    if (!selectedPlant) {
      // Jika dropdown di-clear
      setSelectedPlantVal(null)
      setPlantId(null)
      setStorageOptions([]) // Kosongkan opsi storage jika plant di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedAddressCodeVal(null)
      setSelectedStorageVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      setInventory([])
      setFilteredInventory([])
      return
    }

    setIsLoading(true) // Set loading to true when plant change starts

    if (selectedPlant) {
      setPlantId(selectedPlant.value)
      setSelectedPlantVal(selectedPlant)

      const filteredStorages = storage
        .filter((s) => s.plantId === selectedPlant.value)
        .map((s) => ({
          value: s.id,
          label: s.storageName,
        }))
      setStorageOptions(filteredStorages)
      setTypeMaterialOptions([])
      setInventory([])
      setFilteredInventory([])
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedAddressCodeVal(null)
      setSelectedStorageVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
    } else {
      setStorageOptions([])
    }
    setIsLoading(false) // Set loading to false after processing
  }

  const handleStorageChange = async (selectedStorage) => {
    if (!selectedStorage) {
      // Jika dropdown di-clear
      setSelectedStorageVal(null)
      setInventory([]) // Kosongkan inventory jika storage di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedAddressCodeVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      return
    }

    if (selectedStorage) {
      setInventory([])
      setQuantity('')
      setSelectedStorageVal(selectedStorage)
      setIsLoading(true) // Aktifkan loading

      const mapTypeMaterial = typeMaterial.map((tm) => ({
        value: tm.id,
        label: tm.type,
      }))

      setTypeMaterialOptions(mapTypeMaterial)
      try {
        await getInventories(selectedStorage.value, 'DIRECT')
        const selectedTypeMaterialOpt = mapTypeMaterial.find((tm) => tm.label === 'DIRECT')
        setSelectedTypeMaterial(selectedTypeMaterialOpt)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false) // Nonaktifkan loading setelah data ter-load
        setSelectedMaterialNo(null)
        setSelectedDescription(null)
        setSelectedAddress(null)
        setSelectedUom(null)
        setSelectedAddressCodeVal(null)
        setQuantity('')
      }
    } else {
      setInventory([])
    }
  }

  const handleTypeChange = async (selectedType) => {
    if (!selectedType) {
      // Jika dropdown di-clear
      setSelectedStorageVal(null)
      setInventory([]) // Kosongkan inventory jika storage di-clear
      setFilteredInventory([])
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedAddressCodeVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      return
    }

    if (selectedType) {
      setInventory([])
      setFilteredInventory([])
      setSelectedAddressCodeVal(null)
      setQuantity('')
      setSelectedTypeMaterial(selectedType)
      setIsLoading(true) // Aktifkan loading
      try {
        await getInventories(selectedStorageVal.value, selectedType.label)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false) // Nonaktifkan loading setelah data ter-load
        setSelectedMaterialNo(null)
        setSelectedDescription(null)
        setSelectedAddress(null)
        setSelectedUom(null)
        setQuantity('')
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
      quantity !== ''
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
        setQuantity('')
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
        quantityInputRef.current?.focus()
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
        quantityInputRef.current?.focus()
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
    if (!selectedAddressCode) {
      // Jika dropdown di-clear
      setSelectedAddressCodeVal(null)
      setFilteredInventory([]) // Kosongkan filteredInventory jika address code di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      return
    }

    if (selectedAddressCode) {
      setFilteredInventory([]) // Kosongkan filteredInventory jika address code di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedUom(null)
      setSelectedTypeMaterial(null)
      setQuantity('')

      setSelectedAddressCodeVal(selectedAddressCode)
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

  // Fungsi untuk memulai edit quantity
  const handleEditClick = (item) => {
    setEditId(item.id)
    setNewQuantity(item.quantity) // Mengisi dengan nilai quantity saat ini
  }

  // Fungsi untuk menyimpan perubahan quantity
  const handleSaveQuantity = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)),
    )
    setEditId(null) // Keluar dari mode edit setelah menyimpan
    setNewQuantity('') // Reset input
  }

  const handleQrCode = () => {
    setIsQrScannerOpen(true)
  }

  const handleScan = (result) => {
    if (!selectedPlantVal) {
      MySwal.fire({
        title: 'Error!',
        text: 'Plant is required, please select a dropdown plant',
        icon: 'error',
      })

      return
    }

    if (!selectedStorageVal) {
      MySwal.fire({
        title: 'Error!',
        text: 'Storage is required, please select a dropdown storage',
        icon: 'error',
      })

      return
    }

    if (result[0].rawValue === null) {
      MySwal.fire({
        title: 'Error!',
        text: 'Qr code is empty, please scan again',
        icon: 'error',
      })

      return
    }

    // Mencari item yang sesuai dengan materialNo yang dipindai
    const selectedMaterialData = inventory.find(
      (item) => item.Material.materialNo === result[0].rawValue,
    )

    if (selectedMaterialData) {
      // Mengatur selectedMaterialNo dengan objek yang berisi value dan label
      const selectedOption = {
        value: selectedMaterialData.id, // Mengambil ID sebagai value
        label: selectedMaterialData.Material.materialNo, // Mengambil materialNo sebagai label
      }

      setSelectedMaterialNo(selectedOption) // Simpan hasil pemindaian ke state
      handleMaterialNoChange(selectedOption)

      setIsQrScannerOpen(false)

      MySwal.fire({
        title: 'Success!',
        text: 'Material found, please input quantity',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true, // Show progress bar
        didClose: () => {
          quantityInputRef.current?.focus() // Focus on quantity input after closing
        },
      })

      return
    } else {
      MySwal.fire({
        title: 'Error!',
        text: 'Material not found, please check the QR code',
        icon: 'error',
      })

      return
    }
  }

  const handleError = (error) => {
    setIsQrScannerOpen(false)
    MySwal.fire({
      title: 'Error!',
      text: 'Error on scan, please scan again',
      icon: 'error',
    })
    console.error('Error saat scan QR: ', error)
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
                    value={selectedPlantVal}
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
                    value={selectedStorageVal}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="type">Type</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={typeMaterialOptions}
                    id="type"
                    onChange={handleTypeChange}
                    styles={customStyles}
                    value={selectedTypeMaterial}
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
                    value={selectedAddressCodeVal}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={12} sm={6} md={6} xl={3} className="mt-3">
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
                <CCol xs={12} sm={6} md={6} xl={3} className="mt-3">
                  <CFormLabel htmlFor="materialNo">Material No</CFormLabel>
                  <CInputGroup className="flex-nowrap" style={{ width: '100%' }}>
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
                      styles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                    />
                    <CInputGroupText id="addon-wrapping">
                      <CIcon
                        icon={cilQrCode}
                        size="xl"
                        style={{ fontSize: '80px', cursor: 'pointer', color: 'black' }} // Memperbesar ukuran dan ubah warna
                        onClick={handleQrCode}
                      />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
                <CCol xs={12} sm={6} md={3} xl={3} className="mt-3">
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
                <CCol xs={12} sm={6} md={3} xl={3} className="mt-3">
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
                <CCol xs={12} sm={6} md={3} xl={3} className="mt-3">
                  <CFormInput
                    ref={quantityInputRef}
                    type="number"
                    id="quantity"
                    label="Quantity"
                    placeholder="Input.."
                    text="Must be number."
                    aria-describedby="quantity"
                    required
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    value={quantity}
                  />
                </CCol>
                <CCol
                  xs={12}
                  sm={6}
                  md={3}
                  xl={3}
                  className="d-flex justify-content-start align-items-center mt-3"
                >
                  <CButton onClick={handleAddInventory} color="primary">
                    Add
                  </CButton>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                {/* Modal untuk QR Scanner */}
                <CModal visible={isQrScannerOpen} onClose={() => setIsQrScannerOpen(false)}>
                  <CModalHeader closeButton>Scan QR Code</CModalHeader>
                  <CModalBody>
                    <Scanner
                      onError={handleError}
                      constraints={{ facingMode: 'environment' }}
                      onScan={handleScan}
                      style={{ width: '100%' }}
                    />
                  </CModalBody>
                </CModal>
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
                        <CTableDataCell>
                          {editId === item.id ? (
                            <input
                              type="number"
                              value={newQuantity}
                              onChange={(e) => setNewQuantity(e.target.value)}
                              onBlur={() => handleSaveQuantity(item.id)} // Simpan saat kehilangan fokus
                              autoFocus
                              style={{ width: '80px', padding: '4px', fontSize: '14px' }}
                            />
                          ) : (
                            <span
                              onClick={() => handleEditClick(item)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.quantity}
                            </span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CIcon
                            className="me-3"
                            icon={cilPencil}
                            size="xl"
                            style={{ fontSize: '80px', cursor: 'pointer', color: 'black' }} // Memperbesar ukuran dan ubah warna
                            onClick={() => handleEditClick(item)}
                          />
                          <CIcon
                            icon={cilTrash}
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
