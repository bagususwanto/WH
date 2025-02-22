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
// import "flatpickr/dist/themes/material_green.css";
import Flatpickr from 'react-flatpickr';

const MySwal = withReactContent(swal)

const Wbs = () => {
  const [wbs, setWbs] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [wbsYear, setWbsYear] = useState()

  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentWbs, setCurrentWbs] = useState({
    id: '',
    wbsNumber: '',
    wbsYear: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiWbs = 'wbs'
  const apiWbsDelete = 'wbs-delete'

  useEffect(() => {
    setLoading(false)
    getWbs()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getWbs()
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

  const getWbs = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiWbs)
      console.log("response section:", response)
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
      setWbs(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching wbs:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddWbs = () => {
    setIsEdit(false)
    setCurrentWbs({
      id: '',
      wbsNumber: '',
      wbsYear: ''
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditWbs(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteWbs(rowData.id)}
      />
    </div>
  )

  const handleEditWbs = (wbs) => {
    setIsEdit(true)
    setCurrentWbs({
      id: wbs.id,
      wbsNumber: wbs.wbsNumber, 
      wbsYear: wbs.wbsYear, 
    })
    setModal(true)
  }

  const handleDeleteWbs = (wbs) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This WBS cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(wbs)
      }
    })
  }

  const confirmDelete = async (wbs) => {
    try {
      await deleteMasterDataById(apiWbsDelete, wbs)
      MySwal.fire('Deleted!', 'WBS deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error deleting WBS:', error)
    }
  }

  const validateWbs = (wbs) => {
    const requiredFields = [
      { field: 'wbsNumber', message: 'WBS number is required' },
      { field: 'wbsYear', message: 'WBS year is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!wbs[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveWbs = async () => {
    setLoading(true)

    if (!validateWbs(currentWbs)) {
      setLoading(false)
      return
    }

    try {
      const wbsToSave = { ...currentWbs }

      if (isEdit) {
        await updateMasterDataById(apiWbs, currentWbs.id, {
          ...wbsToSave,
          wbsNumber: wbsToSave.wbsNumber,
          wbsYear: wbsToSave.wbsYear,
        })
        MySwal.fire('Updated!', 'WBS has been updated.', 'success')
      } else {
        delete wbsToSave.id
        await postMasterData(apiWbs, {
            ...wbsToSave,
            wbsNumber: wbsToSave.wbsNumber,
            wbsYear: wbsToSave.wbsYear,
        })
        MySwal.fire('Added!', 'WBS has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving wbs:', error)
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
  
  const filteredWbs = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return wbs.filter((item) => {
      return [
        item.wbsNumber,
        item.wbsYear,
      ].some((val) => val?.toLowerCase().includes(globalFilter))
    })
  }, [wbs, filters.global.value])

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
      const mappedData = wbs.map((item, index) => ({
        No: index + 1,
        'WBS Number': item.wbsNumber,
        'WBS Year': item.wbsYear,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'wbs')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_wbs')
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
      <p>Loading WBS data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data WBS</CCardHeader>
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
                        onClick={handleAddWbs}
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
                  value={filteredWbs}
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
                    field="wbsNumber"
                    header="WBS Number"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="wbsYear"
                    header="WBS Year"
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
          <CModalTitle>{isEdit ? 'Edit WBS' : 'Add WBS'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi WBS */}
              <CCol xs={12}>
                <h5>WBS Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                    <label className="mb-2 required-label" htmlFor="group">
                        WBS Number
                    </label>
                    <CFormInput
                        id="wbsNumber"
                        disabled={isEdit}
                        value={currentWbs.wbsNumber}
                        onChange={(e) =>
                            setCurrentWbs({
                                ...currentWbs,
                                wbsNumber: e.target.value,
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
                        WBS Year
                    </label>
                    <CFormInput
                      id="wbsYear"
                      type='number'
                      value={currentWbs.wbsYear}
                      onChange={(e) =>
                          setCurrentWbs({
                              ...currentWbs,
                              wbsYear: e.target.value,
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
            <CButton color="primary" onClick={handleSaveWbs}>
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

export default Wbs
