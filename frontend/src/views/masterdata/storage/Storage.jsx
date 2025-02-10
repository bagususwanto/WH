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
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'

const MySwal = withReactContent(swal)

const Storage = () => {
  const [storage, setStorage] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [plantId, setPlantId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentStorage, setCurrentStorage] = useState({
    id: '',
    storageCode: '',
    storageName: '',
    addressCode: '',
    plantId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

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
  })

  const apiPlant = 'plant-public'
  const apiStorage = `storage?plantId=${plantId}`
  const apiPostStorage = 'storage'
  const apiStorageDelete = 'storage-delete'

  useEffect(() => {
    setLoading(false)
    getPlant()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getStorage()
  }, [plantId, shouldFetch])

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '38px', // Sesuaikan dengan tinggi CFormInput
      minHeight: '38px', // Hindari auto-resize
    }),
  }

  const columns = [
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

  const getStorage = async () => {
    setLoading(true)
    try {
      if (!plantId) {
        setStorage([])
        setLoading(false)
        return
      }

      const response = await getMasterData(apiStorage)
      const dataWithFormattedFields = response.data.map((item) => {
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.User?.username || ''
        const updatedBy = item.updatedBy?.[0]?.User?.username || ''
        const importBy = item.Log_Import?.User?.username || ''

        return {
          ...item,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
          importBy,
        }
      })
      setStorage(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching address rack:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddStorage = () => {
    setIsEdit(false)
    setCurrentStorage({
      id: '',
      storageCode: '',
      storageName: '',
      addressCode: '',
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
        onClick={() => handleEditStorage(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteStorage(rowData.id)}
      />
    </div>
  )

  const handleEditStorage = (storage) => {
    const selectedPlant = plantOptions.find((p) => p.value === storage.plantId)

    setIsEdit(true)
    setCurrentStorage({
      id: storage.id,
      storageCode: storage.storageCode,
      storageName: storage.storageName,
      addressCode: storage.addressCode,
      plantId: selectedPlant || null,
    })
    setModal(true)
  }

  const handleDeleteStorage = (storageId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This storage cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(storageId)
      }
    })
  }

  const confirmDelete = async (storageId) => {
    try {
      await deleteMasterDataById(apiStorageDelete, storageId)
      MySwal.fire('Deleted!', 'Storage deleted successfully.', 'success')
      await getStorage() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus storage:', error)
    }
  }

  const validateMaterial = (storage) => {
    const requiredFields = [
      { field: 'storageCode', message: 'Storage Code is required' },
      { field: 'storageName', message: 'Storage Name is required' },
      { field: 'addressCode', message: 'Address Code is required' },
      { field: 'plantId', message: 'Plant is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!storage[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveStorage = async () => {
    setLoading(true)
    if (!validateMaterial(currentStorage)) {
      setLoading(false)
      return
    }

    try {
      const storageToSave = { ...currentStorage }

      if (isEdit) {
        await updateMasterDataById(apiPostStorage, currentStorage.id, storageToSave)
        MySwal.fire('Updated!', 'Storage has been updated.', 'success')
      } else {
        delete storageToSave.id
        await postMasterData(apiPostStorage, storageToSave)
        MySwal.fire('Added!', 'Storage has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving storage:', error)
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

  const filteredStorage = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return storage.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [storage, filters.global.value])

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
      const mappedData = storage.map((item, index) => ({
        no: index + 1,
        storageCode: item.storageCode,
        storageName: item.storageName,
        rackCode: item.addressCode,
        plant: item.Plant.plantName,
        createdAt: item.formattedCreatedAt,
        updatedAt: item.formattedUpdatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'storage')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_storage')
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

        if (fileName === 'template_master_data_address') {
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

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },

      plant: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })
    setGlobalFilterValue('')
    setPlantId(null)
    setStorage([])
  }

  const clearFilter = () => {
    initFilters()
  }

  const handlePlantChange = (e) => {
    const selectedPlantId = e.value
    const selectedPlant = plantOptions.find((p) => p.value === selectedPlantId) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.value // Dapatkan plant.id
    setPlantId(plantId)

    let _filters = { ...filters }
    _filters['plant'].value = plantId
    setFilters(_filters)
    setShouldFetch(true)
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading address data...</p>
    </div>
  )

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
              <CCol xs={12} sm={6} md={6} lg={6} xl={4}>
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
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>Master Data Storage</CCardHeader>
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
                        onClick={handleAddStorage}
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
                    </div>
                  </CCol>
                  <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                  </CCol>
                </CRow>
                <DataTable
                  value={filteredStorage}
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
                  <Column
                    field="storageCode"
                    header="Storage Code"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column
                    field="storageName"
                    header="Storage Name"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="addressCode"
                    header="Rack Code"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Plant.plantName"
                    header="Plant"
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
          <CModalTitle>{isEdit ? 'Edit Storage' : 'Add Storage'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Storage */}
              <CCol xs={12}>
                <h5>Storage Information</h5>
              </CCol>
              {/* Form Storage */}
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="storageCode">
                  Storage Code {isEdit ? '' : <span>*</span>}
                </label>
                <CFormInput
                  disabled={isEdit}
                  value={currentStorage.storageCode}
                  onChange={(e) =>
                    setCurrentStorage({
                      ...currentStorage,
                      storageCode: e.target.value,
                    })
                  }
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="storageName">
                  Storage Name <span>*</span>
                </label>
                <CFormInput
                  value={currentStorage.storageName}
                  onChange={(e) =>
                    setCurrentStorage({
                      ...currentStorage,
                      storageName: e.target.value,
                    })
                  }
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="addressCode">
                  Rack Code <span>*</span>
                </label>
                <CFormInput
                  value={currentStorage.addressCode}
                  onChange={(e) =>
                    setCurrentStorage({
                      ...currentStorage,
                      addressCode: e.target.value,
                    })
                  }
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plantId">
                    Plant <span>*</span>
                  </label>
                  <Select
                    value={currentStorage.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plantId"
                    onChange={(e) => setCurrentStorage({ ...currentStorage, plantId: e })}
                    styles={customStyles}
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
            <CButton color="primary" onClick={handleSaveStorage}>
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
    </CRow>
  )
}

export default Storage
