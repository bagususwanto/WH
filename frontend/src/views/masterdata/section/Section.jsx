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

const Section = () => {
  const [sections, setSections] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [wbsOptions, setWbsOptions] = useState([])
  const [gicOptions, setGicOptions] = useState([])

  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentSection, setCurrentSection] = useState({
    id: '',
    // sectionCode: '',
    sectionName: '',
    wbsId: '',
    gicId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiSection = 'section'
  const apiSectionDelete = 'section-delete'

  const apiWbs = 'wbs'
  const apiGic = 'gic'

  useEffect(() => {
    setLoading(false)
    getSections()
    getWbs()
    getGic()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getSections()
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
    try {
      const response = await getMasterData(apiWbs)
      const wbsOption = response.data.map((wbs) => ({
        label: wbs.wbsNumber,
        value: wbs.wbsNumber,
        id: wbs.id,
      }))
      setWbsOptions(wbsOption)
    } catch (error) {
      console.error('Error fetching Plant:', error)
    }
  }

  const getGic = async () => {
    try {
      const response = await getMasterData(apiGic)
      const gicOption = response.data.map((gic) => ({
        label: gic.gicNumber,
        value: gic.gicNumber,
        id: gic.id,
      }))
      setGicOptions(gicOption)
    } catch (error) {
      console.error('Error fetching Plant:', error)
    }
  }

  const getSections = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiSection)
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
      setSections(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddSection = () => {
    setIsEdit(false)
    setCurrentSection({
      id: '',
      // sectionCode: '',
      sectionName: '',
      wbsId: '',
      gicId: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditSection(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteSection(rowData.id)}
      />
    </div>
  )

  const handleEditSection = (sections) => {
    const selectedWbs = wbsOptions.find((wbs) => wbs.id === sections.wbsId) || ""
    const selectedGic = gicOptions.find((gic) => gic.id === sections.gicId) || ""

    setIsEdit(true)
    setCurrentSection({
      id: sections.id,
      // sectionCode: sections.sectionCode,
      sectionName: sections.sectionName,
      wbsId: selectedWbs,
      gicId: selectedGic,
    })
    setModal(true)
  }

  const handleDeleteSection = (section) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This section cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(section)
      }
    })
  }

  const confirmDelete = async (section) => {
    try {
      await deleteMasterDataById(apiSectionDelete, section)
      MySwal.fire('Deleted!', 'Section deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const validateSection = (sections) => {
    const requiredFields = [
      // { field: 'sectionCode', message: 'Section code is required' },
      { field: 'sectionName', message: 'Section name is required' },
      { field: 'wbsId', message: 'WBS is required' },
      { field: 'gicId', message: 'GIC is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!sections[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveSection = async () => {
    setLoading(true)

    if (!validateSection(currentSection)) {
      setLoading(false)
      return
    }

    try {
      const sectionToSave = { ...currentSection }

      if (isEdit) {
        await updateMasterDataById(apiSection, currentSection.id, {
          ...sectionToSave,
          wbsId: sectionToSave.wbsId.id,
          gicId: sectionToSave.gicId.id,
        })
        MySwal.fire('Updated!', 'Section has been updated.', 'success')
      } else {
        delete sectionToSave.id
        await postMasterData(apiSection, {
            ...sectionToSave,
            wbsId: sectionToSave.wbsId.id,
            gicId: sectionToSave.gicId.id,
        })
        MySwal.fire('Added!', 'Section has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving section:', error)
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
  
  const filteredSections = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return sections.filter((item) => {
      return [
        // item.sectionCode,
        item.sectionName,
        item.WB?.wbsNumber,
        item.GIC?.gicNumber,
      ].some((val) => val?.toLowerCase().includes(globalFilter))
    })
  }, [sections, filters.global.value])

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

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = sections.map((item, index) => ({
        No: index + 1,
        // 'Section Code': item.sectionCode,
        'Section Name': item.sectionName,
        WBS: item.wbsId,
        GIC: item.gicId,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'sections')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_sections')
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
      <p>Loading sections data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Section</CCardHeader>
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
                        className="me-2 mb-2 rounded-5"
                        onClick={handleAddSection}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        className="me-2 mb-2 rounded-5"
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
                  value={filteredSections}
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
                  {/* <Column
                    field="sectionCode"
                    header="Section Code"
                    style={{ width: '25%' }}
                    sortable
                  /> */}
                  <Column
                    field="sectionName"
                    header="Section Name"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="GIC.gicNumber"
                    header="GIC"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="WB.wbsNumber"
                    header="WBS"
                    style={{ width: '25%' }}
                    sortable
                  />
                  
                  {/* <Column
                    field="Plant.plantName"
                    header="Plant"
                    style={{ width: '25%' }}
                    sortable
                  /> */}
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
          <CModalTitle>{isEdit ? 'Edit Section' : 'Add Section'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Section */}
              <CCol xs={12}>
                <h5>Section Information</h5>
              </CCol>

              {/* <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                    <label className="mb-2 required-label" htmlFor="group">
                        Section Code
                    </label>
                    <CFormInput
                        id="sectionCode"
                        disabled={isEdit}
                        value={currentSection.sectionCode}
                        onChange={(e) =>
                            setCurrentSection({
                                ...currentSection,
                                sectionCode: e.target.value,
                            })
                        }
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter'){
                                handleSaveSection()
                            }
                        }}
                    />
                </div>
              </CCol> */}

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                    <label className="mb-2 required-label" htmlFor="group">
                        Section Name
                    </label>
                    <CFormInput
                        id="sectionName"
                        disabled={isEdit}
                        value={currentSection.sectionName}
                        onChange={(e) =>
                            setCurrentSection({
                                ...currentSection,
                                sectionName: e.target.value,
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
                    WBS <span>*</span>
                  </label>
                  <Select
                    value={currentSection.wbsId}
                    options={wbsOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="wbs"
                    onChange={(e) => setCurrentSection({ ...currentSection, wbsId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    GIC <span>*</span>
                  </label>
                  <Select
                    value={currentSection.gicId}
                    options={gicOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="gic"
                    onChange={(e) => {
                        setCurrentSection({ ...currentSection, gicId: e })
                    }}
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
            <CButton color="primary" onClick={handleSaveSection}>
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

export default Section
