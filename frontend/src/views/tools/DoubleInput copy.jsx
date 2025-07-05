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
import useMasterDataService from '../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { add, format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import { FaSyncAlt } from "react-icons/fa";
import config from '../../utils/Config'

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
  const [showFilteredTable, setShowFilteredTable] = useState(false);
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
    { field: 'uploadAt', header: 'Upload At', sortable: true },
    { field: 'updatedBy', header: 'Updated By', sortable: true },

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
      className="mt-2 mb-2 w-full sm:w-20rem"
      display="chip"
      placeholder="Show Hiden Columns"
      style={{ borderRadius: '5px' }}
    />
  )

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

    const handleProcessData = () => {
    setLoadingImport(true);

    // Find duplicates based on 'tanggal' and 'headerText'
    const counts = {};
    allMaterials.forEach(item => {
      const key = `${item.tanggal}|${item.headerText}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const duplicates = allMaterials.filter(item => {
      const key = `${item.tanggal}|${item.headerText}`;
      return counts[key] > 1;
    });

    setFilteredMaterials(duplicates);
    setShowFilteredTable(duplicates.length > 0);
    
    // Simulate a delay for the loading spinner
    setTimeout(() => {
        setLoadingImport(false);
    }, 500);
  };

  

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div> {/* Kiri */}
                <label>Filter</label>
            </div>
            <div> {/* Kanan */}
                <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear Filter"
                outlined
                onClick={clearFilter}
                className="mb-2"
                style={{ borderRadius: '5px' }}
                />
            </div>
            </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['plant'].value}
                  options={plantOptions}
                  onChange={handlePlantChange}
                  placeholder="Select Plant"
                  className="mb-2 p-column-filter"
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
                  className="mb-2 p-column-filter"
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
                  className="mb-2 p-column-filter"
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
                        label="Upload"
                        icon="pi pi-file-import"
                        severity="primary"
                        className="me-2 mb-2 rounded-5"
                        onClick={showModalUpload}
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
                  className="p-datatable-gridlines p-datatable-sm text-nowrap custom-datatable"
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
                   <Column
                    field="tanggal"
                    header="Tanggal"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                    sortable
                    />
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
                  <Column field="qty" header="Qty" style={{ width: '25%' }} sortable />
                  <Column field="costcenter" header="Cost Center" style={{ width: '25%' }} sortable />
                  <Column
                    header="Header Text"
                    field="headerText"
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
                <div className="d-flex justify-content-end ">
                 <Button
                    onClick={handleProcessData}
                    className='rounded-5'
                    type="button"
                    disabled={loadingImport}
                >
                    {loadingImport ? (
                    <>
                        <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                        Processing...
                    </>
                    ) : (
                    // Fixed layout with proper alignment and spacing
                    <div className='d-flex align-items-center gap-2'>
                        <FaSyncAlt />
                        <span>Process Data</span>
                    </div>
                    )}
                </Button>
                </div>
              </>
            )}
              {showFilteredTable && (
        <div>
          <DataTable
            value={filteredMaterials}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            tableStyle={{ minWidth: '30rem' }}
            className="p-datatable-gridlines p-datatable-sm text-nowrap custom-datatable mt-3"
            scrollable
            header={filteredHeader}
          >
            <Column
              header="No"
              body={(data, options) => options.rowIndex + 1}
              frozen
              alignFrozen="left"
            />
            <Column field="tanggal" header="Tanggal" sortable frozen alignFrozen="left" />
            <Column field="materialNo" header="Material No" sortable frozen alignFrozen="left" />
            <Column field="description" header="Description" sortable />
            <Column field="qty" header="Qty" sortable />
            <Column field="costcenter" header="Cost Center" sortable />
            <Column field="headerText" header="Header Text" sortable />
          </DataTable>
        </div>
      )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Upload Inventory Inquery</CModalTitle>
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
