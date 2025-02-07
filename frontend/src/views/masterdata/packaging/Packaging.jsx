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
} from '@coreui/react'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { format, parseISO, set } from 'date-fns'
import 'flatpickr/dist/flatpickr.min.css'

const MySwal = withReactContent(swal)

const Packaging = () => {
  const [packaging, setPackaging] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [currentPackaging, setCurrentPackaging] = useState({
    id: '',
    packaging: '',
    unitPackaging: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [uomOptions, setUomOptions] = useState([])
  const [isClearable, setIsClearable] = useState(true)

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    plant: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    packaging: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const apiPackaging = 'packaging'
  const apiPackagingDelete = 'packaging-delete'
  const apiUom = 'uom'

  useEffect(() => {
    getPackaging()
    getUoms()
    setLoading(false)
  }, [])

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

  const getUoms = async () => {
    try {
      const response = await getMasterData(apiUom)
      const uomOptions = response.data.map((uom) => ({
        label: uom.uom,
        value: uom.id,
      }))
      setUomOptions(uomOptions)
    } catch (error) {
      console.error('Error fetching uom:', error)
    }
  }

  const getPackaging = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiPackaging)

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
      setPackaging(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching packaging:', error)
    } finally {
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddPackaging = () => {
    setIsEdit(false)
    setCurrentPackaging({
      id: '',
      packaging: '',
      unitPackaging: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditPackaging(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeletePackaging(rowData.id)}
      />
    </div>
  )

  const handleEditPackaging = (packaging) => {
    setIsEdit(true)
    setCurrentPackaging({
      id: packaging.id,
      packaging: packaging.packaging,
      unitPackaging: packaging.unitPackaging,
    })
    setModal(true)
  }

  const handleDeletePackaging = (addressId) => {
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
      await deleteMasterDataById(apiPackagingDelete, addressId)
      MySwal.fire('Deleted!', 'Packaging deleted successfully.', 'success')
      await getPackaging() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus address:', error)
    }
  }

  const validatePackaging = (packaging) => {
    const requiredFields = [
      { field: 'packaging', message: 'Packaging is required' },
      { field: 'unitPackaging', message: 'Unit of Packaging is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!packaging[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSavePackaging = async () => {
    setLoading(true)
    if (!validatePackaging(currentPackaging)) {
      setLoading(false)
      return
    }

    try {
      const packagingToSave = { ...currentPackaging }

      if (isEdit) {
        await updateMasterDataById(apiPackaging, currentPackaging.id, {
          packaging: packagingToSave.packaging.label,
          unitPackaging: packagingToSave.unitPackaging,
        })
        MySwal.fire('Updated!', 'Packaging has been updated.', 'success')
      } else {
        delete packagingToSave.id
        await postMasterData(apiPackaging, {
          packaging: packagingToSave.packaging.label,
          unitPackaging: packagingToSave.unitPackaging,
        })
        MySwal.fire('Added!', 'Packaging has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving packaging:', error)
    } finally {
      setLoading(false)
      setModal(false)
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

  const filteredPackaging = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return packaging.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [packaging, filters.global.value])

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
      const mappedData = packaging.map((item, index) => ({
        no: index + 1,
        packagingCode: item.packagingCode,
        packagingName: item.packagingName,
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
      xlsx.utils.book_append_sheet(workbook, worksheet, 'packaging')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_packaging')
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

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading address data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Packaging</CCardHeader>
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
                        onClick={handleAddPackaging}
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
                  value={filteredPackaging}
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
                  <Column field="packaging" header="Packaging" style={{ width: '25%' }} sortable />
                  <Column
                    field="unitPackaging"
                    header="Unit of Packaging"
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
          <CModalTitle>{isEdit ? 'Edit Packaging' : 'Add Packaging'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Packaging */}
              <CCol xs={12}>
                <h5>Packaging Information</h5>
              </CCol>
              {/* Form Packaging */}
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="packagingId">
                    Packaging {isEdit ? '' : <span>*</span>}
                  </label>
                  <Select
                    value={currentPackaging.packaging}
                    options={uomOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="packagingId"
                    onChange={(e) => setCurrentPackaging({ ...currentPackaging, packaging: e })}
                    styles={customStyles}
                    isDisabled={isEdit}
                  />
                </div>
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="unitPackaging">
                  Unit of Packaging <span>*</span>
                </label>
                <CFormInput
                  type="number"
                  id="unitPackaging"
                  value={currentPackaging.unitPackaging}
                  onChange={(e) =>
                    setCurrentPackaging({
                      ...currentPackaging,
                      unitPackaging: e.target.value,
                    })
                  }
                />
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
            <CButton color="primary" onClick={handleSavePackaging}>
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

export default Packaging
