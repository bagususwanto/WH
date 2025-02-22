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
import { format, parseISO } from 'date-fns'
import 'flatpickr/dist/flatpickr.min.css'
import Select from 'react-select'

const MySwal = withReactContent(swal)

const Plant = () => {
  const [plant, setPlant] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [currentPlant, setCurrentPlant] = useState({
    id: '',
    plantCode: '',
    plantName: '',
    warehouseId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [warehouseOptions, setWarehouseOptions] = useState([])

  const { getMasterData, deleteMasterDataById, updateMasterDataById, postMasterData } =
    useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const apiPlant = 'plant'
  const apiPlantDelete = 'plant-delete'
  const apiWarehouse = 'warehouse'

  useEffect(() => {
    getPlant()
    getWarehouse()
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

  const getPlant = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiPlant)

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
      setPlant(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching plant:', error)
    } finally {
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const getWarehouse = async () => {
    try {
      const response = await getMasterData(apiWarehouse)
      const warehouseOptions = response.data.map((warehouse) => ({
        label: `${warehouse.warehouseName} - ${warehouse.warehouseCode}`,
        value: warehouse.id,
      }))
      setWarehouseOptions(warehouseOptions)
    } catch (error) {
      console.error('Error fetching warehouse:', error)
    }
  }

  const handleAddPlant = () => {
    setIsEdit(false)
    setCurrentPlant({
      id: '',
      plantCode: '',
      plantName: '',
      warehouseId: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditPlant(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeletePlant(rowData.id)}
      />
    </div>
  )

  const handleEditPlant = (plant) => {
    const selectedWarehouse = warehouseOptions.find((option) => option.value === plant.warehouseId)
    setIsEdit(true)
    setCurrentPlant({
      id: plant.id,
      plantCode: plant.plantCode,
      plantName: plant.plantName,
      warehouseId: selectedWarehouse || '',
    })
    setModal(true)
  }

  const handleDeletePlant = (plantId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This plant cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(plantId)
      }
    })
  }

  const confirmDelete = async (plantId) => {
    try {
      await deleteMasterDataById(apiPlantDelete, plantId)
      await getPlant() // Refresh the list after deletion
      MySwal.fire('Deleted!', 'Plant deleted successfully.', 'success')
    } catch (error) {
      console.error('Error menghapus plant:', error)
    }
  }

  const validatePlant = (plant) => {
    const requiredFields = [
      { field: 'plantCode', message: 'Plant Code is required' },
      { field: 'plantName', message: 'Plant is required' },
      { field: 'warehouseId', message: 'Warehouse is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!plant[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSavePlant = async () => {
    setLoading(true)
    if (!validatePlant(currentPlant)) {
      setLoading(false)
      return
    }

    try {
      const plantToSave = { ...currentPlant }

      if (isEdit) {
        await updateMasterDataById(apiPlant, currentPlant.id, {
          ...plantToSave,
          warehouseId: plantToSave.warehouseId.value,
          plantName: plantToSave.plantName,
        })
        await getPlant()
        MySwal.fire('Updated!', 'Plant has been updated.', 'success')
      } else {
        delete plantToSave.id
        await postMasterData(apiPlant, {
          ...plantToSave,
          warehouseId: plantToSave.warehouseId.value,
          plantName: plantToSave.plantName,
          plantCode: plantToSave.plantCode,
        })
        await getPlant()
        MySwal.fire('Added!', 'Plant has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving plant:', error)
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

  const filteredPlant = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return plant.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [plant, filters.global.value])

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
      const mappedData = plant.map((item, index) => ({
        no: index + 1,
        plantCode: item.plantCode,
        plantName: item.plantName,
        warehouseName: item.Warehouse.warehouseName,
        createdAt: item.formattedCreatedAt,
        updatedAt: item.formattedUpdatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'plant')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_plant')
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

        if (fileName === 'template_master_data_plant') {
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
      <p>Loading plant data...</p>
    </div>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Plant</CCardHeader>
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
                        onClick={handleAddPlant}
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
                  value={filteredPlant}
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
                    header="Plant Code"
                    field="plantCode"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column field="plantName" header="Plant Name" style={{ width: '25%' }} sortable />
                  <Column
                    field="Warehouse.warehouseName"
                    header="Warehouse Name"
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
          <CModalTitle>{isEdit ? 'Edit Plant' : 'Add Plant'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Plant */}
              <CCol xs={12}>
                <h5>Plant Information</h5>
              </CCol>
              {/* Form Plant */}
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="plantCode">
                  Plant Code {!isEdit && <span>*</span>}
                </label>
                <CFormInput
                  id="plantCode"
                  value={currentPlant.plantCode}
                  onChange={(e) =>
                    setCurrentPlant({
                      ...currentPlant,
                      plantCode: e.target.value,
                    })
                  }
                  disabled={isEdit}
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <label className="mb-2 required-label" htmlFor="plantName">
                  Plant Name <span>*</span>
                </label>
                <CFormInput
                  id="plantName"
                  value={currentPlant.plantName}
                  onChange={(e) =>
                    setCurrentPlant({
                      ...currentPlant,
                      plantName: e.target.value,
                    })
                  }
                />
              </CCol>
              <CCol xs={12} md={12} lg={6} className="mb-3">
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="warehouseId">
                    Warehouse Name <span>*</span>
                  </label>
                  <Select
                    value={currentPlant.warehouseId}
                    options={warehouseOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={true}
                    id="warehouseId"
                    onChange={(e) => setCurrentPlant({ ...currentPlant, warehouseId: e })}
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
            <CButton color="primary" onClick={handleSavePlant}>
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

export default Plant
