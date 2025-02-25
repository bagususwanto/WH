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
import { CIcon } from '@coreui/icons-react'
import { cilImagePlus, cilXCircle } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { format, parseISO } from 'date-fns'
import 'flatpickr/dist/flatpickr.min.css'
import config from '../../../utils/Config'
import { IMaskMixin } from 'react-imask'

const MySwal = withReactContent(swal)

const Division = () => {
  const [divisions, setDivisions] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [positionOptions, setPositionOptions] = useState([])

  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentDivision, setCurrentDivision] = useState({
    id: '',
    divisionName: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)
  const [roleValid, setRoleValid] = useState([])

  const animatedComponents = makeAnimated()

  const {
    getMasterData,
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
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

  const apiDivision = 'division'
  const apiDivisionDelete = 'division-delete'

  useEffect(() => {
    setLoading(false)
    getDivision()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    // getOrganizations()
    getDivision()
    setShouldFetch(false)
  }, [shouldFetch])


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

  const getDivision = async () => {
    try {
      const response = await getMasterData(apiDivision)
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
      setDivisions(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching Division:', error)
    }
  }


  const handleAddDivision = () => {
    setIsEdit(false)
    setCurrentDivision({
      id: '',
      divisionName: ''
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditDivision(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteDivision(rowData.id)}
      />
    </div>
  )

  const handleEditDivision = (division) => {
    // const selectedPosition = positionOptions.find(
    //   (option) => option.value === organizations.position,
    // )

    setIsEdit(true)
    setCurrentDivision({
      id: division.id,
      divisionName: division.divisionName,
    })
    setModal(true)
  }

  const handleDeleteDivision = (divisionId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This division cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(divisionId)
      }
    })
  }

  const confirmDelete = async (divisionId) => {
    try {
      await deleteMasterDataById(apiDivisionDelete, divisionId)
      MySwal.fire('Deleted!', 'Division deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error deleting division:', error)
    }
  }

  const validateDivision = (division) => {
    const requiredFields = [{ field: 'divisionName', message: 'Division is required' }]

    for (const { field, message } of requiredFields) {
      if (!division[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveDivision = async () => {
    setLoading(true)

    if (!validateDivision(currentDivision)) {
      setLoading(false)
      return
    }

    try {
      const divisionToSave = { ...currentDivision }

      if (isEdit) {
        await updateMasterDataById(apiDivision, currentDivision.id, divisionToSave)
        MySwal.fire('Updated!', 'Division has been updated.', 'success')
      } else {
        delete divisionToSave.id
        await postMasterData(apiDivision, divisionToSave)
        MySwal.fire('Added!', 'Division has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving divisions:', error)
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

  const filteredDivisions = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return divisions.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [divisions, filters.global.value])

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
      const mappedData = divisions.map((item, index) => ({
        No: index + 1,
        Division: item.divisionName,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'divisions')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_division')
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

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading divisions data...</p>
    </div>
  )


  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Divisions</CCardHeader>
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
                        onClick={handleAddDivision}
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
                  value={filteredDivisions}
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
                    field="divisionName"
                    header="Divisions"
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

      <CModal backdrop="static"  visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Division' : 'Add Division'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Organization */}
              <CCol xs={12}>
                <h5>Division Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={12}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Division Name
                  </label>
                  <CFormInput
                    id="division"
                    value={currentDivision.divisionName}
                    onChange={(e) =>
                        setCurrentDivision({
                        ...currentDivision,
                        divisionName: e.target.value,
                        })
                    }
                    onKeyDown={(e)=>{
                        if(e.key === 'Enter'){
                            handleSaveDivision()
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
            <CButton color="primary" onClick={handleSaveDivision}>
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

export default Division
