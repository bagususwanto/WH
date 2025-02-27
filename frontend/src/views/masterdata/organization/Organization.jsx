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

const Organization = () => {
  const [organizations, setOrganizations] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [lineOptions, setLineOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [divisionOptions, setDivisionOptions] = useState([])
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentOrg, setCurrentOrg] = useState({
    id: '',
    groupId: '',
    lineId: '',
    sectionId: '',
    departmentId: '',
    divisionId: '',
    plantId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiOrgDelete = 'organization-delete'
  const apiGroup = 'group-public'
  const apiLine = 'line-public'
  const apiSection = 'section-public'
  const apiDepartment = 'department-public'
  const apiDivision = 'division-public'
  const apiPlant = 'plant-public'
  const apiOrg = 'organization'

  useEffect(() => {
    setLoading(false)
    getOrganizations()
    getGroup()
    getLine()
    getSection()
    getDepartment()
    getDivision()
    getPlant()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getOrganizations()
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

  const getGroup = async () => {
    try {
      const response = await getMasterData(apiGroup)
      const groupOptions = response.data.map((group) => ({
        label: group.groupName,
        value: group.groupName,
        id: group.id,
      }))
      setGroupOptions(groupOptions)
    } catch (error) {
      console.error('Error fetching Group:', error)
    }
  }

  const getLine = async () => {
    try {
      const response = await getMasterData(apiLine)
      const lineOptions = response.data.map((line) => ({
        label: line.lineName,
        value: line.lineName,
        id: line.id,
      }))
      setLineOptions(lineOptions)
    } catch (error) {
      console.error('Error fetching Line:', error)
    }
  }

  const getSection = async () => {
    try {
      const response = await getMasterData(apiSection)
      const sectionOptions = response.data.map((section) => ({
        label: `${section.sectionName} - ${section.sectionCode}`,
        value: section.sectionName,
        id: section.id,
      }))
      setSectionOptions(sectionOptions)
    } catch (error) {
      console.error('Error fetching Section:', error)
    }
  }

  const getDepartment = async () => {
    try {
      const response = await getMasterData(apiDepartment)
      const departmentOptions = response.data.map((department) => ({
        label: department.departmentName,
        value: department.departmentName,
        id: department.id,
      }))
      setDepartmentOptions(departmentOptions)
    } catch (error) {
      console.error('Error fetching Department:', error)
    }
  }

  const getDivision = async () => {
    try {
      const response = await getMasterData(apiDivision)
      const divisionOptions = response.data.map((division) => ({
        label: division.divisionName,
        value: division.divisionName,
        id: division.id,
      }))
      setDivisionOptions(divisionOptions)
    } catch (error) {
      console.error('Error fetching Division:', error)
    }
  }

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      const plantOptions = response.data.map((plant) => ({
        label: plant.plantName,
        value: plant.plantName,
        id: plant.id,
      }))
      setPlantOptions(plantOptions)
    } catch (error) {
      console.error('Error fetching Plant:', error)
    }
  }

  const getOrganizations = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiOrg)
      const dataWithFormattedFields = response.data.map((item) => {
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.Organization?.username
        const updatedBy = item.updatedBy?.[0]?.Organization?.username
        return {
          ...item,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
        }
      })
      setOrganizations(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddOrg = () => {
    setIsEdit(false)
    setCurrentOrg({
      id: '',
      groupId: '',
      lineId: '',
      sectionId: '',
      departmentId: '',
      divisionId: '',
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
        onClick={() => handleEditOrg(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteOrg(rowData.id)}
      />
    </div>
  )

  const handleEditOrg = (organizations) => {
    const selectedGroup = groupOptions.find((group) => group.id === organizations.groupId)

    const selectedLine = lineOptions.find((line) => line.id === organizations.lineId)

    const selectedSection = sectionOptions.find((section) => section.id === organizations.sectionId)

    const selectedDepartment = departmentOptions.find(
      (department) => department.id === organizations.departmentId,
    )

    const selectedDivision = divisionOptions.find(
      (division) => division.id === organizations.divisionId,
    )

    const selectedPlant = plantOptions.find((plant) => plant.id === organizations.plantId)

    setIsEdit(true)
    setCurrentOrg({
      id: organizations.id,
      groupId: selectedGroup || '',
      lineId: selectedLine || '',
      sectionId: selectedSection || '',
      departmentId: selectedDepartment || '',
      divisionId: selectedDivision || '',
      plantId: selectedPlant || '',
    })
    setModal(true)
  }

  const handleDeleteOrg = (org) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This organizations cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(org)
      }
    })
  }

  const confirmDelete = async (org) => {
    try {
      await deleteMasterDataById(apiOrgDelete, org)
      MySwal.fire('Deleted!', 'Organization deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error menghapus organizations:', error)
    }
  }

  const validateOrg = (organizations) => {
    const requiredFields = [
      { field: 'groupId', message: 'Group is required' },
      { field: 'lineId', message: 'Line is required' },
      { field: 'sectionId', message: 'Section is required' },
      { field: 'departmentId', message: 'Department is required' },
      { field: 'divisionId', message: 'Division is required' },
      { field: 'plantId', message: 'Plant is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!organizations[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveOrg = async () => {
    setLoading(true)

    if (!validateOrg(currentOrg)) {
      setLoading(false)
      return
    }

    try {
      const orgToSave = { ...currentOrg }

      if (isEdit) {
        await updateMasterDataById(apiOrg, currentOrg.id, {
          ...orgToSave,
          groupId: orgToSave.groupId.id,
          lineId: orgToSave.lineId.id,
          sectionId: orgToSave.sectionId.id,
          departmentId: orgToSave.departmentId.id,
          divisionId: orgToSave.divisionId.id,
          plantId: orgToSave.plantId.id,
        })
        MySwal.fire('Updated!', 'Organization has been updated.', 'success')
      } else {
        delete orgToSave.id
        await postMasterData(apiOrg, {
          ...orgToSave,
          groupId: orgToSave.groupId.id,
          lineId: orgToSave.lineId.id,
          sectionId: orgToSave.sectionId.id,
          departmentId: orgToSave.departmentId.id,
          divisionId: orgToSave.divisionId.id,
          plantId: orgToSave.plantId.id,
        })
        MySwal.fire('Added!', 'Organization has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving organizations:', error)
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
  
  const filteredOrganizations = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return organizations.filter((item) => {
      return [
        item.Department?.departmentName,
        item.Division?.divisionName,
        item.Group?.groupName,
        item.Line?.lineName,
        item.Plant?.plantName,
        item.Section?.sectionName,
      ].some((val) => val?.toLowerCase().includes(globalFilter))
    })
  }, [organizations, filters.global.value])

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
      const mappedData = organizations.map((item, index) => ({
        No: index + 1,
        Group: item.Group?.groupName,
        Line: item.Line?.lineName,
        Section: item.Section?.sectionName,
        Department: item.Department?.departmentName,
        Division: item.Division?.divisionName,
        Plant: item.Plant?.plantName,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'organizations')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_organization')
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
      <p>Loading organizations data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Organization</CCardHeader>
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
                        onClick={handleAddOrg}
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
                  value={filteredOrganizations}
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
                    field="Group.groupName"
                    header="Group"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column field="Line.lineName" header="Line" style={{ width: '25%' }} sortable />
                  <Column
                    field="Section.sectionName"
                    header="Section"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Department.departmentName"
                    header="Department"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Division.divisionName"
                    header="Division"
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
          <CModalTitle>{isEdit ? 'Edit Organization' : 'Add Organization'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Organization */}
              <CCol xs={12}>
                <h5>Organization Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Group <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.groupId}
                    options={groupOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="group"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, groupId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="line">
                    Line <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.lineId}
                    options={lineOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="line"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, lineId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="section">
                    Section <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.sectionId}
                    options={sectionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="section"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, sectionId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="department">
                    Department <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.departmentId}
                    options={departmentOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="department"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, departmentId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="division">
                    Division <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.divisionId}
                    options={divisionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="division"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, divisionId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plant">
                    Plant <span>*</span>
                  </label>
                  <Select
                    value={currentOrg.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plant"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, plantId: e })}
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
            <CButton color="primary" onClick={handleSaveOrg}>
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

export default Organization
