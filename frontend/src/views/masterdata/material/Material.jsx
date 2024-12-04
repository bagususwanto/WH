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
} from '@coreui/react'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import config from '../../../utils/Config'

const MySwal = withReactContent(swal)

const Material = () => {
  const [materials, setMaterials] = useState([])
  const [supplier, setSupplier] = useState([])
  const [category, setCategory] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plant, setPlant] = useState([])
  const [storage, setStorage] = useState([])
  const [type, setType] = useState()
  const [typeOptions, setTypeOptions] = useState([])
  const [storageId, setStorageId] = useState()
  const [plantId, setPlantId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    description: '',
    uom: '',
    price: '',
    type: '',
    categoryId: '',
    supplierId: '',
    minStock: '',
    maxStock: '',
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
  const apiMaterial = `material?plantId=${plantId ? plantId : ''}&storageId=${storageId ? storageId : ''}&type=${type ? type : ''}`
  const apiTypeMaterial = 'material-type'
  const apiMaterialDelete = 'material-delete'
  const apiSupplier = 'supplier'
  const apiCategory = 'category'
  const apiUpload = 'upload-master-material'

  useEffect(() => {
    setLoading(false)
    getPlant()
    getMaterialType()
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
    { field: 'Packaging.packaging', header: 'Packaging', sortable: true },
    { field: 'Packaging.unitPackaging', header: 'Unit Packaging', sortable: true },
    { field: 'Supplier.supplierName', header: 'Supplier', sortable: true },
    { field: 'storages', header: 'Storages', sortable: true },
    { field: 'plant', header: 'Plant', sortable: true },
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
        label: plant.plantName,
        value: plant.plantName,
        id: plant.id,
      }))
      setPlant(plantOptions)
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

  const getCategory = async () => {
    try {
      const response = await getMasterData(apiCategory)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching Category:', error)
    }
  }

  const getSupplier = async () => {
    try {
      const response = await getMasterData(apiSupplier)
      setSupplier(response.data)
    } catch (error) {
      console.error('Error fetching Supplier:', error)
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
        const plant = item.Storages[0]?.Plant?.plantName
        const storages = item.Storages.map((storage) => storage.storageName).join(', ')
        const formatedPrice = item.price
          ? 'Rp. ' + item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          : null
        return {
          ...item,
          plant,
          storages,
          formatedPrice,
          // formattedUpdateBy: item.Log_Entries?.[0]?.User?.username || '',
          // formattedUpdateAt: item.updatedAt
          //   ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          //   : '',
        }
      })
      setMaterials(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching incoming:', error)
    } finally {
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
      price: '',
      type: '',
      Category: '',
      Supplier: '',
      minStock: '',
      maxStock: '',
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
    setIsEdit(true)
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: material.uom,
      price: material.price,
      type: material.type,
      categoryId: material.Category ? material.Category.id : '',
      supplierId: material.Supplier ? material.Supplier.id : '',
      minStock: material.minStock,
      maxStock: material.maxStock,
    })
    setModal(true)
  }

  const handleDeleteMaterial = (materialId) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Material ini tidak dapat dipulihkan!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(materialId)
      }
    })
  }

  const confirmDelete = async (materialId) => {
    try {
      await deleteMasterDataById(apiMaterialDelete, materialId)
      MySwal.fire('Terhapus!', 'Material telah dihapus.', 'success')
      await getMaterial() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus material:', error)
    }
  }

  const validateMaterial = (material) => {
    const requiredFields = [
      { field: 'materialNo', message: 'Material No. is required' },
      { field: 'description', message: 'Description is required' },
      { field: 'uom', message: 'UOM is required' },
      { field: 'price', message: 'Price is required' },
      { field: 'type', message: 'Type is required' },
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
        await updateMasterDataById(apiMaterial, currentMaterial.id, materialToSave)
        MySwal.fire('Updated!', 'Material has been updated.', 'success')
      } else {
        delete materialToSave.id
        await postMasterData(apiMaterial, materialToSave)
        MySwal.fire('Added!', 'Material has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving material:', error)
    } finally {
      setLoading(false)
      setModal(false)
      getMaterial() // Refresh the list
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

  const selectCategory = category.map((cat) => ({
    value: cat.id,
    label: cat.categoryName,
  }))

  const handleCategoryChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      categoryId: selectedOption ? selectedOption.value : '',
    })
  }

  // Find the selected address option for initial value
  const selectedCategoryOption = selectCategory.find(
    (cat) => cat.value === currentMaterial.categoryId,
  )

  // Prepare address options for Select
  const selectSupplier = supplier.map((supp) => ({
    value: supp.id,
    label: supp.supplierName,
  }))

  const handleSupplierChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      supplierId: selectedOption ? selectedOption.value : '',
    })
  }

  // Find the selected address option for initial value
  const selectedSupplierOption = selectSupplier.find(
    (supp) => supp.value === currentMaterial.supplierId,
  )

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item) => ({
        id: item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        price: item.price,
        type: item.type,
        Category: item.Category.categoryName,
        Supplier: item.Supplier.supplierName,
        minStock: item.minStock,
        maxStock: item.maxStock,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
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
          img: '',
          minOrder: '',
          packaging: '',
          unitPackaging: '',
          category: '',
          supplier: '',
          storageName: '',
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

      await uploadMasterData(apiUpload, uploadData)
      MySwal.fire('Success', 'File uploaded successfully', 'success')

      setImported(true)
      setShouldFetch(true)
    } catch (error) {
      console.error('Error during import:', error)
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
    setPlantId(null)
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
        label: storage.storageName,
        value: storage.storageName,
        id: storage.id,
      }))
      setStorage(storageOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id

    setPlantId(plantId)
    getStorageByPlantId(plantId)

    let _filters = { ...filters }
    _filters['plant'].value = selectedPlantName
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handleStorageChange = (e) => {
    const selectedStorageName = e.value
    const selectedStorage = storage.find((s) => s.value === selectedStorageName) // Cari objek storage berdasarkan storageName
    const storageId = selectedStorage?.id // Dapatkan storage.id
    setStorageId(storageId)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['storage'].value = e.value
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
    return <img src={`${config.IMG_URL}${rowData.img}`} style={{ width: '50px', height: '50px' }} />
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
                  options={plant}
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

        <CCard>
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
                >
                  <Column
                    header="No"
                    body={(data, options) => options.rowIndex + 1}
                    frozen
                    alignFrozen="left"
                  />
                  <Column
                    header="Image"
                    body={imageBodyTemplate}
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                  />
                  <Column
                    field="materialNo"
                    header="Material No"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                  />
                  <Column field="description" header="Description" style={{ width: '25%' }} />
                  <Column field="uom" header="UoM" style={{ width: '25%' }} />
                  <Column field="type" header="Type" style={{ width: '25%' }} />
                  <Column
                    header="Category"
                    field="Category.categoryName"
                    style={{ width: '25%' }}
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

      <CModal backdrop="static" size="lg" visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <CFormInput
                  label="Material No"
                  value={currentMaterial.materialNo}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })
                  }
                />
              </CCol>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <CFormInput
                  label="Description"
                  value={currentMaterial.description}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, description: e.target.value })
                  }
                />
              </CCol>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <CFormInput
                  label="UOM"
                  value={currentMaterial.uom}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e.target.value })}
                />
              </CCol>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <CFormInput
                  label="Type"
                  value={currentMaterial.type}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
                />
              </CCol>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={isClearable}
                  // options={categoryOptions}
                  id="category"
                  onChange={handlePlantChange}
                  styles={customStyles}
                  // value={selectedPlantVal}
                />
              </CCol>
              <CCol className="mb-2" xs={12} sm={12} md={6} lg={3}>
                <CFormInput
                  label="Price"
                  type="number"
                  value={currentMaterial.price}
                  onChange={(e) =>
                    setCurrentMaterial({ ...currentMaterial, price: e.target.value })
                  }
                />
              </CCol>
            </CRow>
            <CFormInput
              label="Min Stock"
              className="mb-2"
              type="number"
              value={currentMaterial.minStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, minStock: e.target.value })}
            />
            <CFormInput
              label="Max Stock"
              className="mb-2"
              type="number"
              value={currentMaterial.maxStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, maxStock: e.target.value })}
            />
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
