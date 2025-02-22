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

const GIC = () => {
  const [gics, setGics] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [costCenterOptions, setCostCenterOptions] = useState([])

  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentGic, setCurrentGic] = useState({
    id: '',
    gicNumber: '',
    costCenterId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])

  const {
    getMasterData,
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
  } = useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiCostCenter = 'cost-center'
  const apiGic = 'gic'
  const apiGicDelete = 'gic-delete'

  useEffect(() => {
    setLoading(false)
    getGics()
    getCostCenter()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getGics()
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

  const getCostCenter = async() => {
    try {
        const response = await getMasterData(apiCostCenter)
      //   console.log("response wbs:", response)
        const ccOption = response.data.map((cc) => ({
          label: `${cc.costCenter} - ${cc.costCenterName}`,
          value: `${cc.costCenter} - ${cc.costCenterName}`,
          id: cc.id,
        }))
        setCostCenterOptions(ccOption)
      } catch (error) {
        console.error('Error fetching Cost Center:', error)
      }
  }

  const getGics = async () => {
    try {
      const response = await getMasterData(apiGic)
      console.log(response)
      const dataWithFormattedFields = response.data.map((item) => {
        const formattedCreatedAt = item.createdAt
        ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
        : ''
        const formattedUpdatedAt = item.updatedAt
        ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
        : ''
        const createdBy = item.createdBy?.[0]?.User?.username
        const updatedBy = item.updatedBy?.[0]?.User?.username
        const formattedCostCenter = `${item.Cost_Center?.costCenter} - ${item.Cost_Center?.costCenterName}`
        return {
            ...item,
            formattedCostCenter,
            formattedCreatedAt,
            formattedUpdatedAt,
            createdBy,
            updatedBy,
        }
      })
      setGics(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching Division:', error)
    }
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '38px', // Sesuaikan dengan tinggi CFormInput
      minHeight: '38px', // Hindari auto-resize
    }),
  }


  const handleAddGic = () => {
    setIsEdit(false)
    setCurrentGic({
      id: '',
      gicNumber: '',
      costCenterId: ''
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditGic(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteGic(rowData.id)}
      />
    </div>
  )

  const handleEditGic = (gic) => {
    console.log('division:', gic)
    const selectedCC = costCenterOptions.find((option) => option.id === gic.costCenterId) || ""

    setIsEdit(true)
    setCurrentGic({
      id: gic.id,
      gicNumber: gic.gicNumber,
      costCenterId: selectedCC,
    })
    setModal(true)
  }

  const handleDeleteGic = (gicId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This GI Card cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(gicId)
      }
    })
  }

  const confirmDelete = async (gicId) => {
    try {
      await deleteMasterDataById(apiGicDelete, gicId)
      MySwal.fire('Deleted!', 'GI Card deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error deleting GI Card:', error)
    }
  }

  const validateGic = (gic) => {
    const requiredFields = [
        { field: 'gicNumber', message: 'GIC number is required' },
        { field: 'costCenterId', message: 'Cost Center is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!gic[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveGic = async () => {
    setLoading(true)

    if (!validateGic(currentGic)) {
      setLoading(false)
      return
    }

    try {
      const gicToSave = { ...currentGic }

      if (isEdit) {
        await updateMasterDataById(apiGic, currentGic.id, {
            ...gicToSave,
            costCenterId: gicToSave.costCenterId.id
        })
        MySwal.fire('Updated!', 'GI Card has been updated.', 'success')
      } else {
        delete gicToSave.id
        await postMasterData(apiGic, {
            ...gicToSave,
            costCenterId: gicToSave.costCenterId.id
        })
        MySwal.fire('Added!', 'GI Card has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving GI Card:', error)
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

  const filteredGics = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return gics.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [gics, filters.global.value])

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
      const mappedData = gics.map((item, index) => ({
        No: index + 1,
        'GIC Number': item.gicNumber,
        'Cost Center': item.Cost_Center.costCenter,
        'Cost Center Name': item.Cost_Center.costCenterName,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'gic')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_gic')
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
      <p>Loading gic data...</p>
    </div>
  )


  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data GI Card</CCardHeader>
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
                        onClick={handleAddGic}
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
                  value={filteredGics}
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
                    field="gicNumber"
                    header="GI Card Number"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Cost_Center.costCenter"
                    header="Cost Center"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Cost_Center.costCenterName"
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

      <CModal backdrop="static"  visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit GI Card' : 'Add GI Card'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Organization */}
              <CCol xs={12}>
                <h5>GI Card Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={12}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    GI Card Number
                  </label>
                  <CFormInput
                    id="gicNumber"
                    value={currentGic.gicNumber}
                    disabled={isEdit}
                    type='number'
                    onChange={(e) =>
                        setCurrentGic({
                            ...currentGic,
                            gicNumber: Number(e.target.value),
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

              <CCol className="mb-3" sm={12} md={12} lg={12}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Cost Center
                  </label>
                  <Select
                    value={currentGic.costCenterId}
                    options={costCenterOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    id="costCenter"
                    onChange={(e) => setCurrentGic({ ...currentGic, costCenterId: e })}
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
            <CButton color="primary" onClick={handleSaveGic}>
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

export default GIC
