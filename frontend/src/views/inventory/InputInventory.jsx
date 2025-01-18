import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
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
  CCollapse,
} from '@coreui/react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { CIcon } from '@coreui/icons-react'
import { cilPencil, cilQrCode, cilTrash } from '@coreui/icons'
import { Scanner } from '@yudiel/react-qr-scanner'
import Pagination from '../../components/Pagination'

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
  const [quantity, setQuantity] = useState('') // State untuk quantity
  const [quantityConversion, setQuantityConversion] = useState('') // State untuk quantity
  const [quantityOver, setQuantityOver] = useState('')
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
  const [conversionUom, setConversionUom] = useState('')
  const [baseUom, setBaseUom] = useState('')
  const [conversionRate, setConversionRate] = useState(0)
  const [visible, setVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(1)
  const [matchedMaterialNos, setMatchedMaterialNos] = useState([])
  const [remainCounter, setRemainCounter] = useState(0)
  const itemsPerPage = 10

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfLastItem2 = currentPage2 * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const indexOfFirstItem2 = indexOfLastItem2 - itemsPerPage
  const currentItems =
    filteredInventory.length > 0
      ? filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
      : inventory.slice(indexOfFirstItem, indexOfLastItem)

  const itemsList = items.slice(indexOfFirstItem2, indexOfLastItem2)

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

  useEffect(() => {
    let total

    // Pastikan semua nilai memiliki default 0 jika tidak valid
    const conversion = parseFloat(quantityConversion) || 0
    const over = parseFloat(quantityOver) || 0
    const rate = parseFloat(conversionRate) || 0

    if (rate) {
      total = parseFloat((conversion * rate + over).toFixed(2))
    } else {
      total = conversion + over
    }

    setQuantity(total)
  }, [quantityConversion, quantityOver, conversionRate])

  useEffect(() => {
    const inventoryData = filteredInventory.length > 0 ? filteredInventory : inventory

    // Mencari materialNo yang cocok antara items dan inventory
    const matches = inventoryData
      .filter(
        (item) =>
          item.Material?.materialNo && // Pastikan materialNo ada
          items.some((i) => i.materialNo === item.Material.materialNo), // Cek kecocokan dengan items
      )
      .map((item) => item.Material.materialNo)

    // Cari materialNo dengan quantityActual yang tidak null
    const done = inventoryData
      .filter((item) => item.quantityActual !== null) // Cek quantityActual tidak null
      .map((item) => item.Material?.materialNo) // Ambil materialNo;

    // Gabungkan hasil dan hilangkan duplikat
    const uniqueMatches = Array.from(new Set([...matches, ...done]))

    // Perbarui state dengan daftar materialNo yang cocok
    setMatchedMaterialNos(uniqueMatches)
    setRemainCounter(inventoryData.length - uniqueMatches.length)
  }, [items, filteredInventory, inventory, selectedAddressCodeVal])

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

  const getInventories = async (plantIdParams, type) => {
    try {
      const response = await getInventory(plantIdParams, '', type)

      // Urutkan data berdasarkan addressRackName secara ascending
      const sortedData = response.data.sort((a, b) => {
        const rackA = a.Address_Rack?.addressRackName?.toLowerCase() || '' // Lowercase untuk konsistensi
        const rackB = b.Address_Rack?.addressRackName?.toLowerCase() || ''
        return rackA.localeCompare(rackB)
      })
      setFilteredInventory([]) // Kosongkan filteredInventory
      setInventory(sortedData) // Simpan data yang sudah diurutkan
      setCurrentPage(1) // Reset halaman ke 1
    } catch (error) {
      console.error(error)
    }
  }

  const plantOptions = plant.map((plant) => ({
    value: plant.id,
    label: plant.plantName,
  }))

  const handlePlantOpen = () => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      setSelectedPlantVal(selectedPlantVal)
      return // Hentikan aksi jika offline
    }
  }

  const handlePlantChange = async (selectedPlant) => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      setSelectedPlantVal(selectedPlantVal)
      return // Hentikan aksi jika offline
    }

    const warehouseId = await getMasterDataById(apiWarehousePlant, selectedPlant.value)
    await getMasterDataById('check-warehouse', warehouseId.id)

    if (!selectedPlant) {
      // Jika dropdown di-clear
      setSelectedPlantVal(null)
      setPlantId(null)
      setStorageOptions([]) // Kosongkan opsi storage jika plant di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedAddressCodeVal(null)
      setSelectedStorageVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      setInventory([])
      setFilteredInventory([])
      return
    }

    setIsLoading(true) // Set loading to true when plant change starts

    if (selectedPlant) {
      setPlantId(selectedPlant.value)
      setSelectedPlantVal(selectedPlant)
      setSelectedStorageVal(null)

      const filteredStorages = storage
        .filter((s) => s.plantId === selectedPlant.value)
        .map((s) => ({
          value: s.id,
          label: `${s.storageName} - ${s.addressCode}`,
        }))

      await getInventories(selectedPlant.value, 'DIRECT')

      fetchInventoryFromIndexedDB(selectedPlant.value, (inventoryData) => {
        setItems(inventoryData) // Update state `items` dengan data terbaru yang difilter
      })

      setStorageOptions(filteredStorages)
      setTypeMaterialOptions([])
      // setInventory([])
      // setFilteredInventory([])
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedAddressCodeVal(null)
      setSelectedStorageVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
    } else {
      setStorageOptions([])
    }
    setIsLoading(false) // Set loading to false after processing
  }

  const handleStorageChange = async (selectedStorage) => {
    // if (!navigator.onLine) {
    //   // Jika jaringan offline, tampilkan notifikasi
    //   MySwal.fire({
    //     title: 'Offline!',
    //     text: 'You are currently offline. Please check your internet connection.',
    //     icon: 'warning',
    //   })
    //   setSelectedStorageVal(selectedStorageVal)
    //   return // Hentikan aksi jika offline
    // }

    if (!selectedStorage) {
      // Urutkan data yang difilter berdasarkan addressRackName secara ASC
      const sortedInventory = inventory.sort((a, b) => {
        const rackA = a.Address_Rack?.addressRackName?.toLowerCase() || ''
        const rackB = b.Address_Rack?.addressRackName?.toLowerCase() || ''
        return rackA.localeCompare(rackB)
      })
      // Jika dropdown di-clear
      setSelectedStorageVal(null)
      // setInventory([]) // Kosongkan inventory jika storage di-clear
      setFilteredInventory(sortedInventory) // Kosongkan filteredInventory jika storage di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedAddressCodeVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      return
    }

    if (selectedStorage) {
      // setInventory([])
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      setSelectedStorageVal(selectedStorage)
      setIsLoading(true) // Aktifkan loading

      const mapTypeMaterial = typeMaterial.map((tm) => ({
        value: tm.id,
        label: tm.type,
      }))

      setTypeMaterialOptions(mapTypeMaterial)
      try {
        // await getInventories(selectedStorage.value, 'DIRECT')
        // const selectedTypeMaterialOpt = mapTypeMaterial.find((tm) => tm.label === 'DIRECT')
        // setSelectedTypeMaterial(selectedTypeMaterialOpt)
        // Fetch data yang sesuai dengan selectedStorageVal
        // fetchInventoryFromIndexedDB(plantId, (inventoryData) => {
        //   setItems(inventoryData) // Update state `items` dengan data terbaru yang difilter
        // })

        // Filter data inventory berdasarkan address code yang dipilih
        const inventoryByStorage = inventory.filter(
          (item) => item.Address_Rack.Storage.id === selectedStorage.value,
        )

        // validasi jika inventoryByStorage tidak ada
        if (inventoryByStorage.length === 0) {
          MySwal.fire({
            title: 'Error!',
            text: 'No inventory data found for this storage.',
            icon: 'error',
          })
          setIsLoading(false)
          return
        }

        // Urutkan data yang difilter berdasarkan addressRackName secara ASC
        const sortedInventory = inventoryByStorage.sort((a, b) => {
          const rackA = a.Address_Rack?.addressRackName?.toLowerCase() || ''
          const rackB = b.Address_Rack?.addressRackName?.toLowerCase() || ''
          return rackA.localeCompare(rackB)
        })

        setCurrentPage(1)
        setFilteredInventory(sortedInventory) // Simpan data yang sudah difilter dan diurutkan ke state
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false) // Nonaktifkan loading setelah data ter-load
        setSelectedMaterialNo(null)
        setSelectedDescription(null)
        setSelectedAddress(null)
        setSelectedAddressCodeVal(null)
        setQuantity('')
        setQuantityOver('')
        setConversionUom('')
        setBaseUom('')
        setConversionRate(0)
        setQuantityConversion('')
      }
    } else {
      setInventory([])
    }
  }

  const handleStorageOpen = async () => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      setSelectedStorageVal(selectedStorageVal)
      return // Hentikan aksi jika offline
    }
  }

  const handleTypeOpen = async () => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      setSelectedTypeMaterial(selectedTypeMaterial)
      return // Hentikan aksi jika offline
    }
  }

  const handleTypeChange = async (selectedType) => {
    if (!navigator.onLine) {
      // Jika jaringan offline, tampilkan notifikasi
      MySwal.fire({
        title: 'Offline!',
        text: 'You are currently offline. Please check your internet connection.',
        icon: 'warning',
      })
      setSelectedTypeMaterial(selectedTypeMaterial)
      return // Hentikan aksi jika offline
    }
    if (!selectedType) {
      // Jika dropdown di-clear
      setSelectedStorageVal(null)
      setInventory([]) // Kosongkan inventory jika storage di-clear
      setFilteredInventory([])
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setSelectedAddressCodeVal(null)
      setSelectedTypeMaterial(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      return
    }

    if (selectedType) {
      setInventory([])
      setFilteredInventory([])
      setSelectedAddressCodeVal(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      setSelectedTypeMaterial(selectedType)
      setIsLoading(true) // Aktifkan loading
      try {
        await getInventories(selectedType.label)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false) // Nonaktifkan loading setelah data ter-load
        setSelectedMaterialNo(null)
        setSelectedDescription(null)
        setSelectedAddress(null)
        setQuantity('')
        setQuantityOver('')
        setConversionUom('')
        setBaseUom('')
        setConversionRate(0)
        setQuantityConversion('')
      }
    } else {
      setInventory([])
    }
  }

  const fetchInventoryFromIndexedDB = (selectedPlantId, callback) => {
    const request = indexedDB.open('InventoryDB', 1)

    request.onupgradeneeded = function (e) {
      const db = e.target.result
      if (!db.objectStoreNames.contains('inventory')) {
        const store = db.createObjectStore('inventory', { keyPath: 'id' })
        store.createIndex('materialNo', 'materialNo', { unique: false })
        store.createIndex('plantId', 'plantId', { unique: false }) // Tambahkan index untuk plantId
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = function (e) {
      const db = e.target.result
      const transaction = db.transaction('inventory', 'readonly')
      const store = transaction.objectStore('inventory')

      // Filter data berdasarkan nilai `plantId`
      const index = store.index('plantId')
      const plantIdRequest = index.getAll(selectedPlantId)

      plantIdRequest.onsuccess = function () {
        // Urutkan hasil berdasarkan createdAt secara ascending
        const sortedData = plantIdRequest.result.sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt)
        })

        // Kirim data yang sudah diurutkan ke callback
        callback(sortedData)
      }

      plantIdRequest.onerror = function () {
        MySwal.fire({
          title: 'Error!',
          text: 'Failed to fetch data from IndexedDB.',
          icon: 'error',
        })
      }
    }

    request.onerror = function () {
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to open IndexedDB.',
        icon: 'error',
      })
    }
  }

  const handleAddInventory = () => {
    if (
      selectedMaterialNo &&
      selectedDescription &&
      selectedAddress &&
      baseUom &&
      quantity !== ''
    ) {
      const newInventoryItem = {
        id: selectedMaterialNo.value,
        materialNo: selectedMaterialNo.label,
        description: selectedDescription.label,
        address: selectedAddress.label,
        uom: baseUom,
        quantity: quantity,
        plantId: plantId,
        createdAt: new Date().toISOString(),
      }

      // Buka atau buat IndexedDB database
      const request = indexedDB.open('InventoryDB', 1)

      request.onupgradeneeded = function (e) {
        const db = e.target.result
        if (!db.objectStoreNames.contains('inventory')) {
          const store = db.createObjectStore('inventory', { keyPath: 'id' })
          store.createIndex('materialNo', 'materialNo', { unique: false })
          store.createIndex('plantId', 'plantId', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }

      request.onsuccess = function (e) {
        const db = e.target.result
        const transaction = db.transaction('inventory', 'readwrite')
        const store = transaction.objectStore('inventory')

        // Cek apakah item dengan id yang sama sudah ada dalam IndexedDB
        const getRequest = store.get(newInventoryItem.id)

        getRequest.onsuccess = function () {
          if (getRequest.result) {
            // Tampilkan pesan error jika item duplikat
            MySwal.fire({
              title: 'Error!',
              text: 'Item already exists in the inventory list.',
              icon: 'error',
            })
          } else {
            // Jika tidak ada duplikasi, tambahkan item baru ke IndexedDB
            const addRequest = store.add(newInventoryItem)

            addRequest.onsuccess = function () {
              MySwal.fire({
                title: 'Success!',
                text: 'Item added to inventory.',
                icon: 'success',
              })
              // Fetch data yang sesuai dengan selectedStorageVal
              fetchInventoryFromIndexedDB(plantId, (inventoryData) => {
                setItems(inventoryData) // Update state `items` dengan data terbaru yang difilter
              })
            }

            addRequest.onerror = function () {
              MySwal.fire({
                title: 'Error!',
                text: 'Failed to add item to inventory.',
                icon: 'error',
              })
            }
          }
        }

        getRequest.onerror = function () {
          MySwal.fire({
            title: 'Error!',
            text: 'Failed to check item existence.',
            icon: 'error',
          })
        }
      }

      request.onerror = function () {
        MySwal.fire({
          title: 'Error!',
          text: 'Failed to open IndexedDB.',
          icon: 'error',
        })
      }

      // Reset input setelah menambahkan item
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
    } else {
      MySwal.fire({
        title: 'Error!',
        text: 'Please fill all fields correctly.',
        icon: 'error',
      })
    }
  }

  // Fungsi untuk menghapus item dari tabel
  const handleDeleteInventory = (itemId) => {
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
        // Buka IndexedDB
        const request = indexedDB.open('InventoryDB', 1)

        request.onsuccess = function (e) {
          const db = e.target.result
          const transaction = db.transaction('inventory', 'readwrite')
          const store = transaction.objectStore('inventory')

          // Hapus item berdasarkan itemId
          const deleteRequest = store.delete(itemId)

          deleteRequest.onsuccess = function () {
            // Tampilkan pesan sukses
            MySwal.fire('Deleted!', 'Your item has been removed.', 'success')

            // Fetch data yang sesuai dengan selectedStorageVal
            fetchInventoryFromIndexedDB(plantId, (inventoryData) => {
              setItems(inventoryData) // Update state `items` dengan data terbaru yang difilter
            })
          }

          deleteRequest.onerror = function () {
            MySwal.fire({
              title: 'Error!',
              text: 'Failed to delete the item from inventory.',
              icon: 'error',
            })
          }
        }

        request.onerror = function () {
          MySwal.fire({
            title: 'Error!',
            text: 'Failed to open IndexedDB.',
            icon: 'error',
          })
        }
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
        setConversionUom(selectedItem.Material.Packaging?.packaging)
        setConversionRate(selectedItem.Material.Packaging?.unitPackaging)
        setBaseUom(selectedItem.Material.uom)
        quantityInputRef.current?.focus()
      }
    } else {
      // Reset semua state jika tidak ada material yang dipilih
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
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
        setConversionUom(selectedItem.Material.Packaging?.packaging)
        setConversionRate(selectedItem.Material.Packaging?.unitPackaging)
        setBaseUom(selectedItem.Material.uom)
        quantityInputRef.current?.focus()
      }
    } else {
      // Reset semua state jika tidak ada material yang dipilih
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
    }
  }

  // Fungsi untuk membersihkan IndexedDB
  const clearIndexedDB = () => {
    const request = indexedDB.open('InventoryDB', 1)

    request.onsuccess = function (e) {
      const db = e.target.result
      const transaction = db.transaction('inventory', 'readwrite')
      const store = transaction.objectStore('inventory')
      const index = store.index('plantId')

      // Ambil semua data dengan plantId tertentu
      const getRequest = index.getAll(plantId)

      getRequest.onsuccess = function () {
        const items = getRequest.result

        // Loop untuk menghapus setiap item berdasarkan keyPath (id)
        items.forEach((item) => {
          const deleteRequest = store.delete(item.id)

          deleteRequest.onsuccess = function () {
            console.log(`Item with id ${item.id} deleted successfully.`)
          }

          deleteRequest.onerror = function () {
            console.error(`Failed to delete item with id ${item.id}.`)
          }
        })

        // MySwal.fire({
        //   title: 'Success!',
        //   text: 'IndexedDB cleared successfully for the selected plant.',
        //   icon: 'success',
        // })
      }

      getRequest.onerror = function () {
        MySwal.fire({
          title: 'Error!',
          text: 'Failed to fetch data from IndexedDB.',
          icon: 'error',
        })
      }
    }

    request.onerror = function () {
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to open IndexedDB.',
        icon: 'error',
      })
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
          await getInventories(plantId, 'DIRECT')
          MySwal.fire('Success', 'Inventory updated successfully!', 'success')

          // Membersihkan IndexedDB
          clearIndexedDB()

          // Fetch data yang sesuai dengan selectedStorageVal
          fetchInventoryFromIndexedDB(plantId, (inventoryData) => {
            setItems(inventoryData) // Update state `items` dengan data terbaru yang difilter
          })

          setSelectedStorageVal(null)
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
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')
      return
    }

    if (selectedAddressCode) {
      setFilteredInventory([]) // Kosongkan filteredInventory jika address code di-clear
      setSelectedMaterialNo(null)
      setSelectedDescription(null)
      setSelectedAddress(null)
      setQuantity('')
      setQuantityOver('')
      setConversionUom('')
      setBaseUom('')
      setConversionRate(0)
      setQuantityConversion('')

      setSelectedAddressCodeVal(selectedAddressCode)
      // Filter data inventory berdasarkan address code yang dipilih
      const inventoryByAddress = inventory.filter(
        (item) => item.Address_Rack.addressRackName.slice(0, 2) === selectedAddressCode.label,
      )

      // Urutkan data yang difilter berdasarkan addressRackName secara ASC
      const sortedInventory = inventoryByAddress.sort((a, b) => {
        const rackA = a.Address_Rack?.addressRackName?.toLowerCase() || ''
        const rackB = b.Address_Rack?.addressRackName?.toLowerCase() || ''
        return rackA.localeCompare(rackB)
      })

      setCurrentPage(1)
      setFilteredInventory(sortedInventory) // Simpan data yang sudah difilter dan diurutkan ke state
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
    const request = indexedDB.open('InventoryDB', 1)

    request.onsuccess = function (e) {
      const db = e.target.result
      const transaction = db.transaction('inventory', 'readwrite')
      const store = transaction.objectStore('inventory')

      // Ambil data item yang akan diubah
      const getRequest = store.get(id)

      getRequest.onsuccess = function () {
        const existingItem = getRequest.result

        if (existingItem) {
          // Update quantity item
          const updatedItem = { ...existingItem, quantity: newQuantity }

          // Simpan kembali item yang diperbarui ke IndexedDB
          const updateRequest = store.put(updatedItem)

          updateRequest.onsuccess = function () {
            MySwal.fire({
              title: 'Success!',
              text: 'Quantity updated successfully.',
              icon: 'success',
            })

            // Refresh data inventory setelah update
            fetchInventoryFromIndexedDB(plantId, (inventoryData) => {
              setItems(inventoryData) // Update state dengan data terbaru
            })

            // Keluar dari mode edit
            setEditId(null)
            setNewQuantity('')
          }

          updateRequest.onerror = function () {
            MySwal.fire({
              title: 'Error!',
              text: 'Failed to update the quantity.',
              icon: 'error',
            })
          }
        } else {
          MySwal.fire({
            title: 'Error!',
            text: 'Item not found in inventory.',
            icon: 'error',
          })
        }
      }

      getRequest.onerror = function () {
        MySwal.fire({
          title: 'Error!',
          text: 'Failed to fetch item from inventory.',
          icon: 'error',
        })
      }
    }

    request.onerror = function () {
      MySwal.fire({
        title: 'Error!',
        text: 'Failed to open IndexedDB.',
        icon: 'error',
      })
    }
  }

  const handleQrCode = () => {
    setIsQrScannerOpen(true)
  }

  const [boundingBoxes, setBoundingBoxes] = useState([])

  const handleScan = (result) => {
    setBoundingBoxes([])
    if (!result || result.length === 0) {
      // Jika tidak ada hasil, kosongkan bounding boxes
      setBoundingBoxes([])
      return
    }

    if (result && result.length > 0) {
      const videoElement = document.querySelector('video') // Ambil elemen video dari Scanner
      const videoRect = videoElement.getBoundingClientRect() // Dimensi dan posisi video di viewport

      const boxes = result.map((res) => ({
        x: res.boundingBox.x * (videoRect.width / videoElement.videoWidth),
        y: res.boundingBox.y * (videoRect.height / videoElement.videoHeight),
        width: res.boundingBox.width * (videoRect.width / videoElement.videoWidth),
        height: res.boundingBox.height * (videoRect.height / videoElement.videoHeight),
        rawValue: res.rawValue,
      }))

      setBoundingBoxes(boxes)
    }

    // Menghapus karakter newline dari hasil scan
    const rawValue = result[0].rawValue.replace(/\n/g, '')

    if (!selectedPlantVal) {
      MySwal.fire({
        title: 'Error!',
        text: 'Plant is required, please select a dropdown plant',
        icon: 'error',
        toast: true,
      })
      return
    }

    if (!selectedStorageVal) {
      MySwal.fire({
        title: 'Error!',
        text: 'Storage is required, please select a dropdown storage',
        icon: 'error',
        toast: true,
      })
      return
    }

    if (rawValue === '') {
      MySwal.fire({
        title: 'Error!',
        text: 'QR code is empty, please scan again',
        icon: 'error',
        toast: true,
      })
      return
    }

    // Mencari item yang sesuai dengan materialNo yang dipindai
    const selectedMaterialData = inventory.find((item) => item.Material.materialNo === rawValue)

    if (selectedMaterialData) {
      // Mengatur selectedMaterialNo dengan objek yang berisi value dan label
      const selectedOption = {
        value: selectedMaterialData.id, // Mengambil ID sebagai value
        label: selectedMaterialData.Material.materialNo, // Mengambil materialNo sebagai label
      }

      setSelectedMaterialNo(selectedOption) // Simpan hasil pemindaian ke state
      handleMaterialNoChange(selectedOption)

      MySwal.fire({
        title: 'Success!',
        text: 'Material found, please input quantity',
        icon: 'success',
        toast: true,
        timer: 3000,
        timerProgressBar: true, // Show progress bar
        didClose: () => {
          quantityInputRef.current?.focus() // Focus on quantity input after closing
          setBoundingBoxes([])
        },
      })

      setTimeout(() => {
        setIsQrScannerOpen(false)
      }, 3000)
    } else {
      MySwal.fire({
        title: 'Error!',
        text: 'Material not found, please check the QR code',
        icon: 'error',
        toast: true,
      })
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

  const handleConversionChange = (e) => {
    const value = e.target.value.replace(/,/g, '')
    setQuantityConversion(value)
    // // Cek apakah nilai yang dimasukkan valid
    // if (!isNaN(value)) {
    //   const numericValue = parseFloat(value) || 0
    //   setQuantityConversion(numericValue)
    //   if (conversionRate) {
    //     const convertedValue = numericValue * conversionRate + quantityOver
    //     setQuantity(convertedValue)
    //     setInitialQuantity(convertedValue) // Simpan nilai awal
    //   } else {
    //     setQuantity(numericValue + quantityOver)
    //     setInitialQuantity(numericValue + quantityOver) // Simpan nilai awal
    //   }
    // }
  }

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/,/g, '')

    // Cek apakah nilai yang dimasukkan valid
    if (!isNaN(value)) {
      const numericValue = parseFloat(value) || 0
      setQuantity(numericValue)
      setInitialQuantity(numericValue) // Simpan nilai awal
    }
  }

  const handleQuantityOverChange = (e) => {
    const value = e.target.value.replace(/,/g, '')
    setQuantityOver(value)
    // // Cek apakah nilai yang dimasukkan valid
    // if (!isNaN(value)) {
    //   const numericValue = parseFloat(value) || 0
    //   const initQty = parseFloat(initialQuantity) || 0

    //   setQuantityOver(numericValue)
    //   setQuantity(initQty + numericValue)
    // }
  }
  const handleQtyInputChange = (e) => {
    // Menghapus koma dari nilai input
    const value = e.target.value.replace(/,/g, '')

    // Pastikan nilai input valid (berupa angka)
    if (!isNaN(value)) {
      setNewQuantity(value)
    }
  }

  // Fungsi untuk memformat angka dengan koma
  const formatWithCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleRowClick = (row) => {
    setSelectedMaterialNo({ value: row.id, label: row.Material.materialNo })
    setSelectedDescription({ value: row.id, label: row.Material.description })
    setSelectedAddress({ value: row.id, label: row.Address_Rack.addressRackName })
    setConversionUom(row.Material.Packaging?.packaging)
    setConversionRate(row.Material.Packaging?.unitPackaging)
    setBaseUom(row.Material.uom)
    quantityInputRef.current?.focus() // Focus on quantity input
    window.scrollTo(0, 0)
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Form Input</CCardHeader>
          <CForm>
            <CCardBody>
              <CRow>
                <CCol xs={12} sm={6} md={5} xl={4} className="mt-3">
                  <CFormLabel htmlFor="plant">Plant</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    options={plantOptions}
                    id="plant"
                    onMenuOpen={handlePlantOpen}
                    onChange={handlePlantChange}
                    styles={customStyles}
                    value={selectedPlantVal}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={5} xl={4} className="mt-3">
                  <CFormLabel htmlFor="storage">Storage</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={storageOptions}
                    id="storage"
                    // onMenuOpen={handleStorageOpen}
                    onChange={handleStorageChange}
                    // styles={customStyles}
                    value={selectedStorageVal}
                  />
                </CCol>
                {/* <CCol xs={12} sm={6} md={3} className="mt-3">
                  <CFormLabel htmlFor="type">Type</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={typeMaterialOptions}
                    id="type"
                    onMenuOpen={handleTypeOpen}
                    onChange={handleTypeChange}
                    styles={customStyles}
                    value={selectedTypeMaterial}
                  />
                </CCol> */}
                {/* <CCol xs={12} sm={6} md={3} className="mt-3">
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
                </CCol> */}
              </CRow>
              <CRow>
                <CCol xs={12} sm={12} md={12} xl={12} className="mt-3">
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
                <CCol xs={12} sm={6} md={6} xl={6} className="mt-3">
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
                <CCol xs={12} sm={6} md={6} xl={6} className="mt-3">
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
                  <CFormInput
                    ref={quantityInputRef}
                    type="text"
                    id="quantityConversion"
                    label={`Quantity (${conversionUom ? conversionUom : baseUom})`}
                    placeholder="Input.."
                    text="Must be number."
                    aria-describedby="quantity"
                    required
                    onChange={handleConversionChange}
                    value={quantityConversion ? formatWithCommas(quantityConversion) : ''}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3} xl={3} className="mt-3">
                  <CFormInput
                    type="text"
                    id="quantityOver"
                    label={`Quantity Over (${baseUom})`}
                    placeholder="Input.."
                    text="Must be number."
                    aria-describedby="quantity"
                    required
                    onChange={handleQuantityOverChange}
                    value={quantityOver ? formatWithCommas(quantityOver) : ''}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3} xl={3} className="mt-3">
                  <CFormInput
                    type="text"
                    id="quantityBase"
                    label={`Total (${baseUom})`}
                    // placeholder="Input.."
                    // text="Must be number."
                    aria-describedby="quantity"
                    required
                    onChange={handleQuantityChange}
                    value={quantity ? formatWithCommas(quantity) : ''}
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={true}
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
              {/* Collapse content */}
              <CButton color="secondary" className="mt-3" onClick={() => setVisible(!visible)}>
                {visible ? 'Hide List' : 'Show List'}
              </CButton>

              {/* Remain counter */}
              <div className="mt-3">
                <h5>Remain: {remainCounter}</h5>
              </div>

              <CCollapse visible={visible}>
                <CCard className="mt-3">
                  <CCardBody>
                    <CTable align="middle" responsive className="text-center">
                      <CTableCaption>List of items</CTableCaption>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">#</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Material No</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Address</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {currentItems.length > 0 ? (
                          currentItems.map((item, index) => {
                            const isMatch = matchedMaterialNos.includes(item.Material?.materialNo)
                            return (
                              <CTableRow
                                key={item.id}
                                color={
                                  isMatch // Jika cocok, gunakan warna "success"
                                    ? 'success'
                                    : 'transparent' // Jika tidak cocok, gunakan warna "primary"
                                }
                                onClick={() => handleRowClick(item)} // Tambahkan event onClick
                                style={{ cursor: 'pointer' }} // Tambahkan gaya pointer untuk indikasi interaksi
                              >
                                <CTableDataCell>{index + 1 + indexOfFirstItem}</CTableDataCell>
                                <CTableDataCell>
                                  {item.Material?.materialNo || 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.Material?.description || 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.Address_Rack?.addressRackName || 'N/A'}
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan={4}>No data available</CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                    <div className="mt-3 d-flex justify-content-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          filteredInventory.length > 0
                            ? filteredInventory.length / itemsPerPage
                            : inventory.length / itemsPerPage,
                        )}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  </CCardBody>
                </CCard>
              </CCollapse>

              <CRow className="mt-3">
                {/* Modal untuk QR Scanner */}
                <CModal
                  visible={isQrScannerOpen}
                  onClose={() => {
                    setIsQrScannerOpen(false)
                    setBoundingBoxes([])
                  }}
                >
                  <CModalHeader closeButton>Scan QR Code</CModalHeader>
                  <CModalBody style={{ position: 'relative' }}>
                    <Scanner
                      onError={handleError}
                      constraints={{ video: { facingMode: 'environment' } }}
                      onScan={handleScan}
                      style={{ width: '100%' }}
                      allowMultiple={true} // mendukung banyak QR Code
                      scanDelay={3000}
                    />
                    {/* Menampilkan teks hasil scan QR Code di posisi barcode */}
                    {boundingBoxes.length > 0 &&
                      boundingBoxes.map((box, index) => (
                        <span
                          key={index}
                          style={{
                            position: 'absolute',
                            top: `${box.y}px`,
                            left: `${box.x}px`,
                            color: 'yellow', // Warna teks
                            fontSize: '14px', // Ukuran teks
                            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Latar belakang semi-transparan untuk visibilitas
                            padding: '2px 5px', // Jarak di dalam teks
                            borderRadius: '4px', // Sudut membulat
                            whiteSpace: 'nowrap', // Teks tidak membungkus
                          }}
                        >
                          {box.rawValue}
                        </span>
                      ))}
                  </CModalBody>
                </CModal>
              </CRow>
              <hr />
              <CRow className="mt-4">
                <CTable striped align="middle" responsive className="text-center">
                  <CTableCaption>List of items ready to submit</CTableCaption>
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
                    {itemsList.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.materialNo}</CTableDataCell>
                        <CTableDataCell>{item.description}</CTableDataCell>
                        <CTableDataCell>{item.address}</CTableDataCell>
                        <CTableDataCell>{item.uom}</CTableDataCell>
                        <CTableDataCell>
                          {editId === item.id ? (
                            <input
                              type="text"
                              value={newQuantity ? formatWithCommas(newQuantity) : ''}
                              onChange={handleQtyInputChange}
                              onBlur={() => handleSaveQuantity(item.id)} // Simpan saat kehilangan fokus
                              autoFocus
                              // Sesuaikan lebar input dengan panjang teks
                              style={{
                                width: `${newQuantity.length + 5}ch`,
                                padding: '4px',
                                fontSize: '14px',
                              }}
                              inputMode="numeric"
                            />
                          ) : (
                            <span
                              onClick={() => handleEditClick(item)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.quantity ? parseInt(item.quantity).toLocaleString() : ''}
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
                            onClick={() => handleDeleteInventory(item.id)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                <div className="d-flex justify-content-center">
                  <Pagination
                    currentPage={currentPage2}
                    totalPages={items.length > 0 ? Math.ceil(items.length / itemsPerPage) : 1} // Menentukan total halaman
                    onPageChange={(page) => setCurrentPage2(page)}
                  />
                </div>
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
