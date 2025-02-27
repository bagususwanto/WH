/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react'
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
  CImage,
} from '@coreui/react'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { format, parseISO } from 'date-fns'
import 'flatpickr/dist/flatpickr.min.css'

const MySwal = withReactContent(swal)

const CostCenter = () => {
  const [costCenters, setCostCenters] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentCostCenter, setCurrentCostCenter] = useState({
    id: '',
    costCenter: '',
    costCenterName: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiCostCenter = 'cost-center'
  const apiCostCenterDelete = 'cost-center-delete'

  useEffect(() => {
    setLoading(false)
    getCostCenters()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getCostCenters()
    setShouldFetch(false)
  }, [shouldFetch])

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
  ]

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    )

    setVisibleColumns(orderedSelectedColumns)
  }

  const getCostCenters = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiCostCenter)
      const dataWithFormattedFields = response.data.map((item) => {
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.User?.username
        const updatedBy = item.updatedBy?.[0]?.User?.username
        return {
          ...item,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
        }
      })
      setCostCenters(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching cost center:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddCostCenter = () => {
    setIsEdit(false)
    setCurrentCostCenter({
      id: '',
      costCenter: '',
      costCenterName: ''
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditCostCenter(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteCostCenter(rowData.id)}
      />
    </div>
  )

  const handleEditCostCenter = (cc) => {
    setIsEdit(true)
    setCurrentCostCenter({
      id: cc.id,
      costCenter: cc.costCenter, 
      costCenterName: cc.costCenterName, 
    })
    setModal(true)
  }

  const handleDeleteCostCenter = (cc) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This Cost Center cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(cc)
      }
    })
  }

  const confirmDelete = async (cc) => {
    try {
      await deleteMasterDataById(apiCostCenterDelete, cc)
      MySwal.fire('Deleted!', 'Cost Center deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error deleting Cost Center:', error)
    }
  }

  const validateCostCenter = (cc) => {
    const requiredFields = [
      { field: 'costCenter', message: 'Cost center is required' },
      { field: 'costCenterName', message: 'Cost center name is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!cc[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveCostCenter = async () => {
    setLoading(true)

    if (!validateCostCenter(currentCostCenter)) {
      setLoading(false)
      return
    }

    try {
      const costCenterToSave = { ...currentCostCenter }

      if (isEdit) {
        await updateMasterDataById(apiCostCenter, currentCostCenter.id, {
          ...costCenterToSave,
          costCenter: costCenterToSave.costCenter,
          costCenterName: costCenterToSave.costCenterName,
        })
        MySwal.fire('Updated!', 'Cost Center has been updated.', 'success')
      } else {
        delete costCenterToSave.id
        await postMasterData(apiCostCenter, {
          ...costCenterToSave,
          costCenter: costCenterToSave.costCenter,
          costCenterName: costCenterToSave.costCenterName,
        })
        MySwal.fire('Added!', 'Cost Center has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving cost center:', error)
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
  
  const filteredCostCenter = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return costCenters.filter((item) => {
      return [
        item.costCenter,
        item.costCenterName,
      ].some((val) => val?.toLowerCase().includes(globalFilter))
    })
  }, [costCenters, filters.global.value])

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
      const mappedData = costCenters.map((item, index) => ({
        No: index + 1,
        'Cost Center': item.costCenter,
        'Cost Center Name': item.costCenterName,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'cost center')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_cost-center')
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

        if (fileName === 'template_master_data_organization') {
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
      <p>Loading Cost Center data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Cost Center</CCardHeader>
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
                        onClick={handleAddCostCenter}
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
                  value={filteredCostCenter}
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
                    field="costCenter"
                    header="Cost Center"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="costCenterName"
                    header="Cost Center Name"
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
          <CModalTitle>{isEdit ? 'Edit Cost Center' : 'Add Cost Center'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Cost Center */}
              <CCol xs={12}>
                <h5>Cost Center Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                    <label className="mb-2 required-label" htmlFor="group">
                        Cost Center
                    </label>
                    <CFormInput
                        id="costCenter"
                        disabled={isEdit}
                        value={currentCostCenter.costCenter}
                        onChange={(e) =>
                            setCurrentCostCenter({
                                ...currentCostCenter,
                                costCenter: e.target.value,
                            })
                        }
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter'){
                                handleSaveSection()
                            }
                        }}
                    />
                </div>
              </CCol>
              
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                    <label className="mb-2 required-label" htmlFor="group">
                        Cost Center Name
                    </label>
                    <CFormInput
                        id="costCenterName"
                        value={currentCostCenter.costCenterName}
                        onChange={(e) =>
                            setCurrentCostCenter({
                                ...currentCostCenter,
                                costCenterName: e.target.value,
                            })
                        }
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter'){
                                handleSaveSection()
                            }
                        }}
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
            <CButton color="primary" onClick={handleSaveCostCenter}>
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

export default CostCenter
