import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { MultiSelect } from 'primereact/multiselect'
import 'primereact/resources/themes/nano/theme.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CForm,
  CSpinner,
  CFormLabel,
  CImage,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilImagePlus, cilXCircle } from '@coreui/icons'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { add, format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import config from '../../../utils/Config'

const MySwal = withReactContent(swal)

const Material = () => {
  const [materials, setMaterials] = useState([])
  const [supplierOptions, setSupplierOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [storage, setStorage] = useState([])
  const [type, setType] = useState()
  const [typeOptions, setTypeOptions] = useState([])
  const [uomOptions, setUomOptions] = useState([])
  const [mrpTypeOptions, setMRPTypeOptions] = useState([])
  const [packagingOptions, setPackagingOptions] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [addressRackOptions, setAddressRackOptions] = useState([])
  const [storageId, setStorageId] = useState()
  const [plantId, setPlantOptionsId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    description: '',
    uom: '',
    price: 0,
    type: '',
    mrpType: '',
    categoryId: '',
    supplierId: '',
    packagingId: '',
    minStock: '',
    maxStock: '',
    minOrder: '',
    img: '',
    storageId: '',
    plantId: '',
  })
  const [loading, setLoading] = useState(true)
  const [loadingImport, setLoadingImport] = useState(false)
  const [modalUpload, setModalUpload] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [uploadData, setUploadData] = useState({
    importDate: date,
    file: null,
  })
  const [imported, setImported] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)

  const {
    getMasterData,
    getMasterDataById,
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
    uploadMasterData,
    uploadImageMaterial,
  } = useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    plant: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    storage: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    type: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const apiPlant = 'plant-public'
  const apiStorage = 'storage-plant'
  const apiMasterMaterial = 'material'
  const apiMaterial = `material?plantId=${plantId ? plantId : ''}&storageId=${storageId ? storageId : ''}&type=${type ? type : ''}`
  const apiTypeMaterial = 'material-type'
  const apiUOMS = 'uom'
  const apiMRPType = 'mrp-type'
  const apiMaterialDelete = 'material-delete'
  const apiSupplier = 'supplier'
  const apiStorages = 'storage'
  const apiAddressRack = 'address-rack'
  const apiCategory = 'category'
  const apiPackaging = 'packaging'
  const apiUpload = 'upload-master-material'
  const apiDeleteImgMaterial = 'material-delete-image'
  const apiUploadImageMaterial = 'material-upload-image'

  useEffect(() => {
    setLoading(false)
    getPlant()
    getMaterialType()
    getUOMS()
    getCategory()
    getMRPType()
    getPackaging()
    getSupplier()
    getStorage()
    getAddressRack()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getMaterial()
  }, [plantId, storageId, type, shouldFetch, imported])

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '38px', // Sesuaikan dengan tinggi CFormInput
      minHeight: '38px', // Hindari auto-resize
    }),
  }

  const columns = [
    {
      field: 'formatedPrice',
      header: 'Price',
      sortable: true,
    },
    { field: 'mrpType', header: 'MRP Type', sortable: true },
    { field: 'minStock', header: 'Min. Stock', sortable: true },
    { field: 'maxStock', header: 'Max. Stock', sortable: true },
    { field: 'minOrder', header: 'Min. Order', sortable: true },
    { field: 'packaging', header: 'Packaging', sortable: true },
    { field: 'supplier', header: 'Supplier', sortable: true },
    { field: 'Inventory.Address_Rack.addressRackName', header: 'Address Rack', sortable: true },
    { field: 'storage', header: 'Storage', sortable: true },
    { field: 'plant', header: 'Plant', sortable: true },
    { field: 'formattedCreatedAt', header: 'Created At', sortable: true },
    { field: 'formattedUpdatedAt', header: 'Updated At', sortable: true },
    { field: 'createdBy', header: 'Created By', sortable: true },
    { field: 'updatedBy', header: 'Updated By', sortable: true },
    { field: 'importBy', header: 'Import By', sortable: true },
  ]

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    )

    setVisibleColumns(orderedSelectedColumns)
  }

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      const plantOptions = response.data.map((plant) => ({
        label: `${plant.plantName} - ${plant.plantCode}`,
        value: plant.id,
      }))
      setPlantOptions(plantOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getMaterialType = async () => {
    try {
      const response = await getMasterData(apiTypeMaterial)
      const typeOptions = response.data.map((type) => ({
        label: type.type,
        value: type.type,
        id: type.id,
      }))
      setTypeOptions(typeOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getUOMS = async () => {
    try {
      const response = await getMasterData(apiUOMS)
      const uomOptions = response.data.map((uom) => ({
        label: uom.uom,
        value: uom.uom,
        id: uom.id,
      }))
      setUomOptions(uomOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getMRPType = async () => {
    try {
      const response = await getMasterData(apiMRPType)
      const mrpTypeOptions = response.data.map((mrpType) => ({
        label: mrpType.type,
        value: mrpType.type,
        id: mrpType.id,
      }))
      setMRPTypeOptions(mrpTypeOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getCategory = async () => {
    try {
      const response = await getMasterData(apiCategory)
      const categoryOptions = response.data.map((category) => ({
        label: category.categoryName,
        value: category.id,
      }))
      setCategoryOptions(categoryOptions)
    } catch (error) {
      console.error('Error fetching Category:', error)
    }
  }

  const getPackaging = async () => {
    try {
      const response = await getMasterData(apiPackaging)

      const packagingOptions = response.data.map((packaging) => ({
        label: `${packaging.packaging} (${packaging.unitPackaging})`,
        value: packaging.id,
      }))

      setPackagingOptions(packagingOptions)
    } catch (error) {
      console.error('Error fetching Packaging:', error)
    }
  }

  const getSupplier = async () => {
    try {
      const response = await getMasterData(apiSupplier)
      const supplierOptions = response.data.map((supplier) => ({
        label: supplier.supplierName,
        value: supplier.id,
      }))
      setSupplierOptions(supplierOptions)
    } catch (error) {
      console.error('Error fetching Supplier:', error)
    }
  }

  const getStorage = async () => {
    try {
      const response = await getMasterData(apiStorages)
      const storageOptions = response.data.map((storage) => ({
        label: `${storage.storageName} - ${storage.storageCode}`,
        value: storage.id,
        plantId: storage.plantId,
      }))
      setStorageOptions(storageOptions)
    } catch (error) {
      console.error('Error fetching Storage:', error)
    }
  }

  const getAddressRack = async () => {
    try {
      const response = await getMasterData(apiAddressRack)
      const addressRackOptions = response.data.map((address) => ({
        label: address.addressRackName,
        value: address.id,
        storageId: address.storageId,
      }))
      setAddressRackOptions(addressRackOptions)
    } catch (error) {
      console.error('Error fetching Storage:', error)
    }
  }

  const getMaterial = async () => {
    setLoading(true)
    try {
      if (!plantId && !storageId && !type) {
        setMaterials([])
        setLoading(false)
        return
      }

      const response = await getMasterData(apiMaterial)
      const dataWithFormattedFields = response.data.map((item) => {
        const plant = `${item.Inventory.Address_Rack.Storage.Plant.plantName} - ${item.Inventory.Address_Rack.Storage.Plant.plantCode}`
        const storage = `${item.Inventory.Address_Rack.Storage.storageName} - ${item.Inventory.Address_Rack.Storage.storageCode}`
        const supplier = `${item.Supplier?.supplierName} - ${item.Supplier?.supplierCode}`
        const formatedPrice = item.price
          ? 'Rp. ' + item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          : null
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.User?.username || ''
        const updatedBy = item.updatedBy?.[0]?.User?.username || ''
        const importBy = item.Log_Import?.User?.username || ''
        const packaging = `${item.Packaging?.packaging} (${item.Packaging?.unitPackaging})`

        return {
          ...item,
          formatedPrice,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
          importBy,
          plant,
          storage,
          supplier,
          packaging,
        }
      })
      setMaterials(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching material:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddMaterial = () => {
    setIsEdit(false)
    setCurrentMaterial({
      id: '',
      materialNo: '',
      description: '',
      uom: '',
      price: 0,
      type: '',
      mrpType: '',
      categoryId: '',
      supplierId: '',
      packagingId: '',
      minStock: '',
      maxStock: '',
      minOrder: '',
      img: '',
      addressRackId: '',
      storageId: '',
      plantId: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditMaterial(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteMaterial(rowData.id)}
      />
    </div>
  )

  const handleEditMaterial = (material) => {
    const selectedUOM = uomOptions.find((option) => option.value === material.uom)
    const selectedType = typeOptions.find((option) => option.value === material.type)
    const selectedCategory = categoryOptions.find((option) => option.value === material.Category.id)
    const selectedMRPType = mrpTypeOptions.find((option) => option.value === material.mrpType)
    const selectedPackaging = packagingOptions.find(
      (option) => option?.value === material.Packaging?.id,
    )
    const selectedSupplier = supplierOptions.find(
      (option) => option?.value === material.Supplier?.id,
    )
    const selectedAddressRack = addressRackOptions.find(
      (option) => option?.value === material.Inventory?.Address_Rack?.id,
    )
    const selectedStorage = storageOptions.find(
      (option) => option?.value === material.Inventory.Address_Rack.storageId,
    )
    const selectedPlant = plantOptions.find(
      (p) => p.value === material.Inventory.Address_Rack.Storage.plantId,
    )
    setIsEdit(true)
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: selectedUOM || null,
      price: material.price,
      type: selectedType || null,
      mrpType: selectedMRPType || null,
      categoryId: selectedCategory || null,
      supplierId: selectedSupplier || null,
      packagingId: selectedPackaging || null,
      minStock: material.minStock,
      maxStock: material.maxStock,
      minOrder: material.minOrder,
      img: material.img,
      addressRackId: selectedAddressRack || null,
      storageId: selectedStorage || null,
      plantId: selectedPlant || null,
    })
    setModal(true)
  }

  const handleDeleteMaterial = (materialId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This material cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(materialId)
      }
    })
  }

  const confirmDelete = async (materialId) => {
    try {
      await deleteMasterDataById(apiMaterialDelete, materialId)
      MySwal.fire('Deleted!', 'Material deleted successfully.', 'success')
      await getMaterial() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus material:', error)
    }
  }

  const validateMaterial = (material) => {
    let requiredFields = [
      { field: 'materialNo', message: 'Material No. is required' },
      { field: 'description', message: 'Description is required' },
      { field: 'uom', message: 'UOM is required' },
      // { field: 'price', message: 'Price is required' },
      { field: 'type', message: 'Type is required' },
      { field: 'mrpType', message: 'MRP Type is required' },
      { field: 'categoryId', message: 'Category is required' },
      { field: 'supplierId', message: 'Supplier is required' },
      { field: 'minStock', message: 'Minimum Stock is required' },
      { field: 'maxStock', message: 'Maximum Stock is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!material[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveMaterial = async () => {
    setLoading(true)
    if (!validateMaterial(currentMaterial)) {
      setLoading(false)
      return
    }

    try {
      const materialToSave = { ...currentMaterial }

      if (isEdit) {
        await updateMasterDataById(apiMasterMaterial, currentMaterial.id, materialToSave)
        MySwal.fire('Updated!', 'Material has been updated.', 'success')
      } else {
        delete materialToSave.id
        await postMasterData(apiMasterMaterial, materialToSave)
        MySwal.fire('Added!', 'Material has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving material:', error)
    } finally {
      setLoading(false)
      setModal(false)
      setShouldFetch(true)
    }
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setFilters({
      ...filters,
      global: { value },
    })
    setGlobalFilterValue(value)
  }

  const filteredMaterials = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return materials.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [materials, filters.global.value])

  const renderHeader = () => {
    return (
      <div>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
            style={{ width: '100%', borderRadius: '5px' }}
          />
        </IconField>
      </div>
    )
  }

  const header = () => (
    <MultiSelect
      value={visibleColumns}
      options={columns}
      optionLabel="header"
      onChange={onColumnToggle}
      className="w-full sm:w-20rem mb-2 mt-2"
      display="chip"
      placeholder="Show Hiden Columns"
      style={{ borderRadius: '5px' }}
    />
  )

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item, index) => ({
        no: index + 1,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        type: item.type,
        category: item.Category?.categoryName,
        price: item.price,
        mrpType: item.mrpType,
        minStock: item.minStock,
        maxStock: item.maxStock,
        minOrder: item.minOrder,
        packaging: item.Packaging?.packaging,
        unitPackaging: item.Packaging?.unitPackaging,
        supplier: item.Supplier?.supplierName,
        addressRack: item.Inventory.Address_Rack.addressRackName,
        storageCode: item.Inventory.Address_Rack.Storage.storageCode,
        storage: item.Inventory.Address_Rack.Storage.storageName,
        plantCode: item.Inventory.Address_Rack.Storage.Plant.plantCode,
        plant: item.Inventory.Address_Rack.Storage.Plant.plantName,
        createdAt: item.formattedCreatedAt,
        updatedAt: item.formattedUpdatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'material')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_material')
    })
  }

  const downloadTemplate = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = [
        {
          materialNo: '',
          description: '',
          uom: '',
          price: '',
          type: '',
          mrpType: '',
          minStock: '',
          maxStock: '',
          minOrder: '',
          packaging: '',
          unitPackaging: '',
          category: '',
          supplierCode: '',
          addressRack: '',
        },
      ]

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { template: worksheet }, SheetNames: ['template'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'template_master_data_material')
    })
  }

  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        let EXCEL_EXTENSION = '.xlsx'
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        })

        if (fileName === 'template_master_data_material') {
          module.default.saveAs(
            data,
            fileName + '_download_' + new Date().getTime() + EXCEL_EXTENSION,
          )
        } else {
          module.default.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION,
          )
        }
      }
    })
  }

  const handleImport = async () => {
    setLoadingImport(true)
    try {
      if (!uploadData.file) {
        MySwal.fire('Error', 'Please select a file', 'error')
        return
      }

      const response = await uploadMasterData(apiUpload, uploadData)

      // Format pesan error jika ada
      const errors = response.data.errors
        ? response.data.errors
            .map((err) => `- ${err.error}`) // Format setiap error
            .join('\n') // Gabungkan setiap pesan error dengan newline
        : ''

      // Tampilkan pesan sukses dengan detail error (jika ada)
      if (errors) {
        MySwal.fire({
          title: 'Success with Errors',
          html: `
            <div>
              <p>${response.data.message}</p>
              <p><strong>Errors:</strong></p>
              <pre style="text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">${errors}</pre>
            </div>
          `,
          icon: 'warning', // Gunakan icon warning untuk success dengan error
        })
      } else {
        MySwal.fire('Success', response.data.message, 'success')
      }

      setImported(true)
      setShouldFetch(true)
    } catch (error) {
      console.error('Error during import:', error)
      MySwal.fire('Error', 'Failed to import data', 'error')
    } finally {
      setLoadingImport(false)
      setModalUpload(false)
    }
  }

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate[0])
    setUploadData((prevData) => ({
      ...prevData,
      importDate: selectedDate[0],
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setUploadData((prevData) => ({
      ...prevData,
      file: file,
    }))
  }

  const showModalUpload = () => {
    setModalUpload(true)
  }

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },

      plant: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },

      storage: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },

      type: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })
    setGlobalFilterValue('')
    setPlantOptionsId(null)
    setStorageId(null)
    setType(null)
    setMaterials([])
  }

  const clearFilter = () => {
    initFilters()
  }

  const getStorageByPlantId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await getMasterDataById(apiStorage, id)
      const storageOptions = response.map((storage) => ({
        label: `${storage.storageName} - ${storage.storageCode}`,
        value: storage.id,
      }))
      setStorage(storageOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const handlePlantChange = (e) => {
    const plantId = e.value // Dapatkan plant.id

    setPlantOptionsId(plantId)
    getStorageByPlantId(plantId)

    let _filters = { ...filters }
    _filters['plant'].value = plantId
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handleStorageChange = (e) => {
    const storageId = e.value // Dapatkan storage.id
    setStorageId(storageId)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['storage'].value = storageId
    setFilters(_filters)
  }

  const handleTypeChange = (e) => {
    const selectedTypeName = e.value
    setType(selectedTypeName)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['type'].value = e.value
    setFilters(_filters)
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading material data...</p>
    </div>
  )

  const imageBodyTemplate = (rowData) => {
    return (
      <img src={`${config.BACKEND_URL}${rowData.img}`} style={{ width: '50px', height: '50px' }} />
    )
  }

  const handleDeleteImage = async (id) => {
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })

      if (result.isConfirmed) {
        await updateMasterDataById(apiDeleteImgMaterial, id)
        setCurrentMaterial({
          ...currentMaterial,
          img: '',
        })
        MySwal.fire('Success', 'Image deleted successfully', 'success')
        setShouldFetch(true)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleAddImage = async (id) => {
    try {
      // Membuat elemen input file secara dinamis
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*' // Hanya menerima file gambar

      // Menangani pemilihan file
      input.onchange = async (event) => {
        const file = event.target.files[0]
        if (!file) {
          return MySwal.fire('Error', 'No file selected', 'error')
        }

        // Membuat FormData untuk mengirim file ke backend
        const formData = new FormData()
        formData.append('image', file)

        try {
          // Melakukan request POST ke endpoint backend
          const response = await uploadImageMaterial(apiUploadImageMaterial, id, formData)

          setCurrentMaterial({
            ...currentMaterial,
            img: response.data.imgPath,
          })
          MySwal.fire('Success', 'Image added successfully', 'success')
          setShouldFetch(true) // Memperbarui data setelah upload sukses
        } catch (error) {
          console.error('Error uploading image:', error)
        }
      }

      // Memicu dialog pemilihan file
      input.click()
    } catch (error) {
      console.error('Error adding image:', error)
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Filter</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear Filter"
                  outlined
                  onClick={clearFilter}
                  className="mb-2"
                  style={{ borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['plant'].value}
                  options={plantOptions}
                  onChange={handlePlantChange}
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['storage'].value}
                  options={storage}
                  onChange={handleStorageChange}
                  placeholder="Select Storage"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['type'].value}
                  options={typeOptions}
                  onChange={handleTypeChange}
                  placeholder="Select Type"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>Master Data Material</CCardHeader>
          <CCardBody>
            {loading ? (
              <LoadingComponent />
            ) : (
              <>
                <CRow className="mb-2">
                  <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
                    <div className="d-flex flex-wrap justify-content-start">
                      <Button
                        type="button"
                        label="Add"
                        icon="pi pi-plus"
                        severity="primary"
                        className="rounded-5 me-2 mb-2"
                        onClick={handleAddMaterial}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Upload"
                        icon="pi pi-file-import"
                        severity="primary"
                        className="rounded-5 me-2 mb-2"
                        onClick={showModalUpload}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        className="rounded-5 me-2 mb-2"
                        onClick={exportExcel}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Template"
                        icon="pi pi-download"
                        severity="success"
                        className="rounded-5 mb-2"
                        onClick={downloadTemplate}
                        data-pr-tooltip="XLS"
                      />
                    </div>
                  </CCol>
                  <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                  </CCol>
                </CRow>
                <DataTable
                  value={filteredMaterials}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  tableStyle={{ minWidth: '30rem' }}
                  className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                  scrollable
                  globalFilter={filters.global.value} // Aplikasikan filter global di sini
                  header={header}
                  onMouseDownCapture={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Column
                    header="No"
                    body={(data, options) => options.rowIndex + 1}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column header="Image" body={imageBodyTemplate} frozen alignFrozen="left" />
                  <Column
                    field="materialNo"
                    header="Material No"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column
                    field="description"
                    header="Description"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column field="uom" header="UoM" style={{ width: '25%' }} sortable />
                  <Column field="type" header="Type" style={{ width: '25%' }} sortable />
                  <Column
                    header="Category"
                    field="Category.categoryName"
                    style={{ width: '25%' }}
                    sortable
                  />
                  {visibleColumns.map((col, index) => (
                    <Column
                      key={index}
                      field={col.field}
                      header={col.header}
                      body={col.body}
                      sortable={col.sortable}
                      headerStyle={col.headerStyle}
                      bodyStyle={col.bodyStyle}
                    />
                  ))}
                  <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
                </DataTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal backdrop="static" size="xl" visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Material */}
              <CCol xs={12}>
                <h5>Material Information</h5>
              </CCol>
              <div className="clearfix d-flex flex-wrap align-items-start">
                {/* Foto Material */}
                <CCol
                  xs={12}
                  lg={3}
                  className="d-flex justify-content-center align-items-center mb-3"
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    position: 'relative', // Relative untuk parent gambar
                  }}
                >
                  {currentMaterial.img ? (
                    <div
                      className="position-relative"
                      style={{
                        width: '160px',
                        height: '160px',
                      }}
                    >
                      {/* Gambar Material */}
                      <CImage
                        align="start"
                        rounded
                        src={`${config.BACKEND_URL}${currentMaterial.img}`}
                        className="shadow-sm w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                      {/* Tombol Delete (X) */}
                      <CIcon
                        icon={cilXCircle}
                        size="lg"
                        className="position-absolute"
                        style={{
                          top: '-5px',
                          right: '-5px',
                          cursor: 'pointer',
                          color: 'red',
                        }}
                        onClick={() => handleDeleteImage(currentMaterial.id)}
                      />
                    </div>
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center border border-secondary"
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        position: 'relative', // Untuk memastikan elemen di dalamnya tetap proporsional
                      }}
                    >
                      {/* Tombol Tambah Gambar (+) */}
                      <CIcon
                        icon={cilImagePlus}
                        size="xl"
                        style={{
                          cursor: 'pointer',
                          color: 'green',
                        }}
                        onClick={() => handleAddImage(currentMaterial.id)}
                      />
                    </div>
                  )}
                </CCol>
                {/* Form Material */}
                <CCol xs={12} lg={9}>
                  <CRow className="gy-3">
                    <CCol xs={12} md={6} lg={4}>
                      <label className="mb-2 required-label" htmlFor="materialNo">
                        Material No <span>*</span>
                      </label>
                      <CFormInput
                        value={currentMaterial.materialNo}
                        onChange={(e) =>
                          setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })
                        }
                        disabled={isEdit}
                        readOnly={isEdit}
                      />
                    </CCol>
                    <CCol xs={12} md={6} lg={4}>
                      <div className="form-group">
                        <label className="mb-2 required-label" htmlFor="uom">
                          Base UOM <span>*</span>
                        </label>
                        <Select
                          value={currentMaterial.uom}
                          options={uomOptions}
                          className="basic-single"
                          classNamePrefix="select"
                          isClearable={isClearable}
                          id="uom"
                          onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e })}
                          styles={customStyles}
                        />
                      </div>
                    </CCol>
                    <CCol xs={12} md={6} lg={4}>
                      <div className="form-group">
                        <label className="mb-2 required-label" htmlFor="materialNo">
                          Type <span>*</span>
                        </label>
                        <Select
                          value={currentMaterial.type}
                          options={typeOptions}
                          className="basic-single"
                          classNamePrefix="select"
                          isClearable={isClearable}
                          id="type"
                          onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e })}
                          styles={customStyles}
                        />
                      </div>
                    </CCol>
                    <CCol xs={12} className="mb-3">
                      <label className="mb-2 required-label" htmlFor="materialNo">
                        Description <span>*</span>
                      </label>
                      <CFormInput
                        value={currentMaterial.description}
                        onChange={(e) =>
                          setCurrentMaterial({ ...currentMaterial, description: e.target.value })
                        }
                      />
                    </CCol>
                  </CRow>
                </CCol>
              </div>

              {/* Section: Kategori dan MRP */}
              <CCol xs={12}>
                <h5>Category & MRP</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={4}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="category">
                    Category <span>*</span>
                  </label>
                  <Select
                    value={currentMaterial.categoryId}
                    options={categoryOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="category"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, categoryId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={4}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="mrpType">
                    MRP Type <span>*</span>
                  </label>
                  <Select
                    value={currentMaterial.mrpType}
                    options={mrpTypeOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="mrpType"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, mrpType: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Harga dan Stok */}
              <CCol xs={12}>
                <h5>Price & Stock</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={3}>
                <label htmlFor="price" className="mb-2 required-label">
                  Price (Rp) <span>*</span>
                </label>
                <CFormInput
                  type="number"
                  value={currentMaterial.price}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, price: e.target.value })
                  }
                />
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={3}>
                <label htmlFor="minStock" className="mb-2 required-label">
                  Min. Stock <span>*</span>
                </label>
                <CFormInput
                  type="number"
                  value={currentMaterial.minStock}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, minStock: e.target.value })
                  }
                />
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={3}>
                <label htmlFor="maxStock" className="mb-2 required-label">
                  Max. Stock <span>*</span>
                </label>
                <CFormInput
                  type="number"
                  value={currentMaterial.maxStock}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, maxStock: e.target.value })
                  }
                />
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={3}>
                <label htmlFor="minOrder" className="mb-2 required-label">
                  Min. Order ({currentMaterial?.uom.label})<span>*</span>
                </label>
                <CFormInput
                  type="number"
                  value={currentMaterial.minOrder}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, minOrder: e.target.value })
                  }
                />
              </CCol>

              {/* Section: Packaging dan Supplier */}
              <CCol xs={12}>
                <h5>Packaging & Supplier</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={3}>
                <div className="form-group">
                  <label htmlFor="packaging" className="mb-2 required-label">
                    Packaging {currentMaterial?.packagingId ? <span>*</span> : null}
                  </label>
                  <Select
                    value={currentMaterial.packagingId}
                    options={packagingOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="packaging"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, packagingId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="supplier">
                    Supplier <span>*</span>
                  </label>
                  <Select
                    value={currentMaterial.supplierId}
                    options={supplierOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="supplier"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, supplierId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Informasi Tambahan */}
              <CCol xs={12}>
                <h5>Other Information</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={4} lg={4}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="addressRack">
                    Address Rack <span>*</span>
                  </label>
                  <Select
                    value={currentMaterial.addressRackId}
                    options={addressRackOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="addressRack"
                    onChange={(e) => {
                      // cari storage berdasarkan storageId
                      const selectedStorageOption = storageOptions.find(
                        (option) => option.value === e.storageId,
                      )

                      // caari plant berdasarkan storageId
                      const selectedPlant = plantOptions.find(
                        (option) => option.value === selectedStorageOption?.plantId,
                      )

                      setCurrentMaterial({
                        ...currentMaterial,
                        addressRackId: e,
                        storageId: selectedStorageOption,
                        plantId: selectedPlant,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={4} lg={4}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="storage">
                    Storage
                  </label>
                  <Select
                    value={currentMaterial.storageId}
                    options={storageOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="storage"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, storageId: e })}
                    styles={customStyles}
                    isDisabled={true}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={4} lg={4}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plant">
                    Plant
                  </label>
                  <Select
                    value={currentMaterial.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plant"
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, plantId: e })}
                    styles={customStyles}
                    isDisabled={true}
                  />
                </div>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>
            Close
          </CButton>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={handleSaveMaterial}>
              {loading ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  {isEdit ? 'Update' : 'Save'}
                </>
              ) : (
                <>{isEdit ? 'Update' : 'Save'}</>
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>

      <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Upload Master Material</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Date</CFormLabel>
            <Flatpickr
              value={date}
              options={{
                dateFormat: 'Y-m-d',
                maxDate: new Date(),
                allowInput: true,
              }}
              onChange={handleDateChange}
              className="form-control"
              placeholder="Select a date"
            />
          </div>
          <div className="mb-3">
            <CFormInput
              onChange={handleFileChange} // Handle perubahan file
              type="file"
              label="Excel File"
              accept=".xlsx" // Hanya menerima file Excel
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={() => handleImport()}>
              {loadingImport ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Material
