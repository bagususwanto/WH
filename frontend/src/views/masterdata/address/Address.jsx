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
import { format, parseISO, set } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'

const MySwal = withReactContent(swal)

const Address = () => {
  const [address, setAddress] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [storage, setStorage] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [storageId, setStorageId] = useState()
  const [plantId, setPlantId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentAddress, setCurrentAddress] = useState({
    id: '',
    addressRackName: '',
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
  })

  console.log('filters', filters)

  const apiPlant = 'plant-public'
  const apiStorage = 'storage-plant'
  const apiMasterAddress = 'address-rack'
  const apiAddress = `address-rack?plantId=${plantId ? plantId : ''}&storageId=${storageId ? storageId : ''}`
  const apiAddressDelete = 'address-rack-delete'
  const apiStorages = 'storage'
  const apiUpload = 'upload-master-address'

  useEffect(() => {
    setLoading(false)
    getPlant()
    getStorage()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getAddress()
  }, [plantId, storageId, shouldFetch, imported])

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
    try {
      const response = await getMasterData(apiStorages)
      const storageOptions = response.data.map((storage) => ({
        label: `${storage.storageName} - ${storage.storageCode}`,
        value: storage.id,
        addressCode: storage.addressCode,
        plantId: storage.plantId,
      }))
      setStorageOptions(storageOptions)
    } catch (error) {
      console.error('Error fetching Storage:', error)
    }
  }

  const getAddress = async () => {
    setLoading(true)
    try {
      console.log('plantId', plantId)
      if (!plantId && !storageId) {
        setAddress([])
        setLoading(false)
        return
      }

      const response = await getMasterData(apiAddress)
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
      setAddress(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching address rack:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddAddress = () => {
    setIsEdit(false)
    setCurrentAddress({
      id: '',
      addressRackName: '',
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
        onClick={() => handleEditAddress(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteAddress(rowData.id)}
      />
    </div>
  )

  const handleEditAddress = (address) => {
    const selectedStorage = storageOptions.find((option) => option.value === address.Storage.id)
    const selectedPlant = plantOptions.find((p) => p.value === address.Storage.plantId)

    setIsEdit(true)
    setCurrentAddress({
      id: address.id,
      addressRackName: address.addressRackName,
      storageId: selectedStorage || null,
      plantId: selectedPlant || null,
    })
    setModal(true)
  }

  const handleDeleteAddress = (addressId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This address cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(addressId)
      }
    })
  }

  const confirmDelete = async (addressId) => {
    try {
      await deleteMasterDataById(apiAddressDelete, addressId)
      MySwal.fire('Deleted!', 'Address deleted successfully.', 'success')
      await getAddress() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus address:', error)
    }
  }

  const validateMaterial = (address) => {
    const requiredFields = [
      { field: 'addressRackName', message: 'Address is required' },
      { field: 'storageId', message: 'Storage is required' },
      { field: 'plantId', message: 'Plant is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!address[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveAddress = async () => {
    setLoading(true)
    if (!validateMaterial(currentAddress)) {
      setLoading(false)
      return
    }

    try {
      const materialToSave = { ...currentAddress }

      if (isEdit) {
        await updateMasterDataById(apiMasterAddress, currentAddress.id, materialToSave)
        MySwal.fire('Updated!', 'Address has been updated.', 'success')
      } else {
        delete materialToSave.id
        await postMasterData(apiMasterAddress, materialToSave)
        MySwal.fire('Added!', 'Address has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving address:', error)
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

  const filteredAddress = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return address.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [address, filters.global.value])

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
      const mappedData = address.map((item, index) => ({
        no: index + 1,
        address: item.addressRackName,
        storage: item.Storage.storageName,
        plant: item.Storage.Plant.plantName,
        createdAt: item.formattedCreatedAt,
        updatedAt: item.formattedUpdatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'address')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_address')
    })
  }

  const downloadTemplate = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = [
        {
          address: '',
        },
      ]

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { template: worksheet }, SheetNames: ['template'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'template_master_data_address')
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

  // SWAL DENGAN VALIDASI ERROR
  const handleUploadResponse = (response) => {
    let showAllErrors = false // State untuk toggle menampilkan semua error

    const displayErrors = () => {
      const errorsToDisplay = showAllErrors
        ? response.data.errors
        : response.data.errors.slice(0, 3)

      return errorsToDisplay.map((err) => `<li>Row ${err.row}: ${err.error}</li>`).join('')
    }

    MySwal.fire({
      title: 'Success',
      html: `
        <p>${response.data.message}</p>
        ${
          response.data.errors?.length > 0
            ? `
              <p>Errors:</p>
              <ul id="error-list">
                ${displayErrors()}
              </ul>
              ${
                response.data.errors.length > 3
                  ? `<button id="load-more-errors" style="margin-top: 10px;">Load More</button>`
                  : ''
              }
            `
            : ''
        }
      `,
      icon: 'success',
      didOpen: () => {
        const loadMoreButton = document.getElementById('load-more-errors')
        if (loadMoreButton) {
          loadMoreButton.addEventListener('click', () => {
            showAllErrors = true // Ubah state untuk menampilkan semua error
            const errorList = document.getElementById('error-list')
            errorList.innerHTML = displayErrors() // Update daftar error
            loadMoreButton.style.display = 'none' // Sembunyikan tombol "Load More"
          })
        }
      },
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
      handleUploadResponse(response) // Tangani respons sukses

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
    })
    setGlobalFilterValue('')
    setPlantId(null)
    setStorageId(null)
    setType(null)
    setAddress([])
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
    const selectedPlantId = e.value
    const selectedPlant = plantOptions.find((p) => p.value === selectedPlantId) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.value // Dapatkan plant.id
    setPlantId(plantId)
    getStorageByPlantId(plantId)

    let _filters = { ...filters }
    _filters['plant'].value = plantId
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handleStorageChange = (e) => {
    const selectedStorageId = e.value
    const selectedStorage = storage.find((s) => s.value === selectedStorageId) // Cari objek storage berdasarkan storageName
    const storageId = selectedStorage?.id // Dapatkan storage.id
    setStorageId(storageId)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['storage'].value = e.value
    setFilters(_filters)
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
              <CCol xs={12} sm={6} md={6} lg={6} xl={4}>
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
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>Master Data Address</CCardHeader>
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
                        onClick={handleAddAddress}
                        data-pr-tooltip="XLS"
                      />
                      {/* <Button
                        type="button"
                        label="Upload"
                        icon="pi pi-file-import"
                        severity="primary"
                        className="rounded-5 me-2 mb-2"
                        onClick={showModalUpload}
                        data-pr-tooltip="XLS"
                      /> */}
                      <Button
                        type="button"
                        label="Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        className="rounded-5 me-2 mb-2"
                        onClick={exportExcel}
                        data-pr-tooltip="XLS"
                      />
                      {/*  <Button
                        type="button"
                        label="Template"
                        icon="pi pi-download"
                        severity="success"
                        className="rounded-5 mb-2"
                        onClick={downloadTemplate}
                        data-pr-tooltip="XLS"
                      /> */}
                    </div>
                  </CCol>
                  <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                  </CCol>
                </CRow>
                <DataTable
                  value={filteredAddress}
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
                  />
                  <Column
                    field="addressRackName"
                    header="Address"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                  />
                  <Column field="Storage.storageName" header="Storage" style={{ width: '25%' }} />
                  <Column field="Storage.Plant.plantName" header="Plant" style={{ width: '25%' }} />
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
          <CModalTitle>{isEdit ? 'Edit Address' : 'Add Address'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Address */}
              <CCol xs={12}>
                <h5>Address Information</h5>
              </CCol>
              {/* Form Address */}
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="addressRackName">
                  Address {isEdit ? '' : <span>*</span>}
                </label>
                <CFormInput
                  value={currentAddress.addressRackName}
                  onChange={(e) => {
                    // cari storage berdasarkan addressCode dari e substring 2
                    const selectedStorage = storageOptions.find(
                      (s) => s.addressCode === e.target.value.substring(0, 2),
                    )

                    // cari plant berdasarkan plantId dari selectedStorage
                    const selectedPlant = plantOptions.find(
                      (p) => p.value === selectedStorage?.plantId,
                    )

                    setCurrentAddress({
                      ...currentAddress,
                      addressRackName: e.target.value.toUpperCase(),
                      storageId: selectedStorage || null,
                      plantId: selectedPlant || null,
                    })
                  }}
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="storageId">
                    Storage
                  </label>
                  <Select
                    value={currentAddress.storageId}
                    options={storageOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="storageId"
                    onChange={(e) => setCurrentAddress({ ...currentAddress, storageId: e })}
                    styles={customStyles}
                    isDisabled
                  />
                </div>
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plantId">
                    Plant
                  </label>
                  <Select
                    value={currentAddress.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plantId"
                    onChange={(e) => setCurrentAddress({ ...currentAddress, plantId: e })}
                    styles={customStyles}
                    isDisabled
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
            <CButton color="primary" onClick={handleSaveAddress}>
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
          <CModalTitle id="LiveDemoExampleLabel">Upload Master Address</CModalTitle>
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

export default Address
