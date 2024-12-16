import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow, CSpinner } from '@coreui/react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { FilterMatchMode } from 'primereact/api'
import 'primeicons/primeicons.css'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { format, parseISO } from 'date-fns'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MultiSelect } from 'primereact/multiselect'
import useManageStockService from '../../services/ManageStockService'
import useMasterDataService from '../../services/MasterDataService'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const MySwal = withReactContent(Swal)

const Redpost = () => {
  const [redpost, setRedpost] = useState([])
  const [plant, setPlant] = useState([])
  const [section, setSection] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel
  const [plantId, setPlantId] = useState()
  const [sectionId, setSectionId] = useState()
  const [status, setStatus] = useState([])
  const [statusOrder, setStatusOrder] = useState()
  const [dates, setDates] = useState([null, null])
  const [shouldFetch, setShouldFetch] = useState(false)

  const { getRedpost } = useManageStockService()
  const { getMasterData, getMasterDataById } = useMasterDataService()

  const apiPlant = 'plant-public'
  const apiSection = 'section-plant'

  const columns = [
    {
      field: 'orderedBy',
      header: 'Ordered By',
      sortable: true,
    },
    {
      field: 'quantityRequest',
      header: 'Quantity Request',
      sortable: true,
    },
    {
      field: 'quantityReturn',
      header: 'Quantity Return',
      sortable: true,
    },
  ]

  const [visibleColumns, setVisibleColumns] = useState([])

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sectionName: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    plantName: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    status: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      sectionName: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      plantName: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      status: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })

    setGlobalFilterValue('')
    setPlantId(null)
    setSectionId(null)
    setStatusOrder(null)
    setDates([null, null])
    setRedpost([])
  }

  useEffect(() => {
    getPlant()
    getStatus()
    setLoading(false)
    initFilters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, globalFilterValue, redpost])

  useEffect(() => {
    if (!shouldFetch) return
    fetchRedpost()
  }, [shouldFetch, dates, plantId, sectionId, statusOrder])

  const getSeverity = (status) => {
    switch (status) {
      case 'shortage':
        return 'danger'

      case 'ok':
        return 'success'

      case 'over':
        return 'warning'
    }
  }

  const fetchRedpost = async () => {
    setLoading(true)
    try {
      let startDate
      let endDate

      if (dates[0] && dates[1]) {
        startDate = format(dates[0], 'yyyy-MM-dd')
        endDate = format(dates[1], 'yyyy-MM-dd')
      }

      if (!startDate && !endDate && !plantId && !sectionId) {
        setRedpost([])
        setLoading(false)
        return
      }

      const response = await getRedpost(
        startDate ? startDate : '',
        endDate ? endDate : '',
        plantId ? plantId : '',
        sectionId ? sectionId : '',
      )
      console.log('response.data', response.data)
      const dataWithFormattedFields = response.data.map((item) => {
        const date = format(parseISO(item.date), 'yyyy-MM-dd')
        const materialNo = item.Detail_Order.Inventory.Material.materialNo
        const description = item.Detail_Order.Inventory.Material.description
        const uom = item.Detail_Order.Inventory.Material.uom
        const sectionName = item.Detail_Order.Order.User.Organization.Section.sectionName
        const plantName = item.Detail_Order.Order.User.Organization.Plant.plantName
        const pic = item.User.username
        const orderedBy = item.Detail_Order.Order.User.username
        return {
          ...item,
          materialNo,
          description,
          uom,
          date,
          sectionName,
          plantName,
          pic,
          orderedBy,
        }
      })
      console.log('dataWithFormattedFields', dataWithFormattedFields)

      setRedpost(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching redpost:', error)
    } finally {
      setLoading(false)
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
      setPlant(plantOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getStatus = async () => {
    try {
      const response = await getMasterData(apiStatus)
      const statusOptions = response.data.map((status) => ({
        label: status.status
          .split(' ') // Pisahkan berdasarkan spasi
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Ubah huruf pertama jadi kapital dan sisanya kecil
          .join(' '), // Gabungkan kembali menjadi string
        value: status.status,
        id: status.id,
      }))
      setStatus(statusOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getSectionByPlantId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await getMasterDataById(apiSection, id)
      const sectionOptions = response.map((section) => ({
        label: section.sectionName,
        value: section.sectionName,
        id: section.id,
      }))
      setSection(sectionOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const handleSectionChange = (e) => {
    const selectedSectionName = e.value
    const selectedSection = section.find((s) => s.value === selectedSectionName)
    const selectedSectionId = selectedSection?.id

    setSectionId(selectedSectionId)
    let _filters = { ...filters }
    _filters['sectionName'].value = e.value
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handleStatusChange = (e) => {
    const selectedStatus = e.value

    setStatusOrder(selectedStatus)
    let _filters = { ...filters }
    _filters['status'].value = e.value
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id

    setPlantId(plantId)
    getSectionByPlantId(plantId)

    let _filters = { ...filters }
    _filters['plantName'].value = selectedPlantName
    setFilters(_filters)
    setShouldFetch(true)
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const applyFilters = () => {
    let filteredData = [...redpost]
    console.log('redpost', redpost)

    if (filters['global'].value) {
      const globalFilterValue = filters['global'].value.toLowerCase()
      filteredData = filteredData.filter((item) => {
        const searchString = JSON.stringify(item).toLowerCase()
        return searchString.includes(globalFilterValue)
      })
    }

    if (filters['sectionName'].value) {
      filteredData = filteredData.filter(
        (item) => item.sectionName === filters['sectionName'].value,
      )
    }

    if (filters['plantName'].value) {
      filteredData = filteredData.filter((item) => item.plantName === filters['plantName'].value)
    }

    if (filters['status'].value) {
      filteredData = filteredData.filter((item) => item.status === filters['status'].value)
    }
    console.log('filteredData', filteredData)
    setVisibleData(filteredData)
  }

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

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = visibleData.map((item) => {
        return {
          'Material No': item.materialNo,
          Description: item.description,
          Quantity: item.quantity,
          UOM: item.uom,
          PIC: item.pic,
          'Redpost Date': item.date,
          Section: item.sectionName,
          Plant: item.plantName,
          'Ordered By': item.orderedBy,
          'Quantity Request': item.quantityRequest,
          'Quantity Return': item.quantityReturn,
        }
      })

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'redpost')
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

        if (fileName === 'template_redpost') {
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

  const qtyActualEditor = (options) => {
    return (
      <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />
    )
  }

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    )

    setVisibleColumns(orderedSelectedColumns)
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

  const clearFilter = () => {
    initFilters()
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading redpost data...</p>
    </div>
  )
  console.log('visibleData', visibleData)
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
              <CCol xs={12} sm={6} md={4}>
                <Flatpickr
                  value={dates}
                  options={{
                    dateFormat: 'Y-m-d',
                    maxDate: new Date(),
                    allowInput: true,
                    mode: 'range',
                  }}
                  onChange={(date) => {
                    setDates(date)
                    setShouldFetch(true)
                  }}
                  className="form-control mb-2"
                  placeholder="Select a date"
                  style={{
                    width: '100%',
                    borderRadius: '5px',
                    border: '1px solid #a5acb3',
                    height: '33px',
                  }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['plantName'].value}
                  options={plant}
                  onChange={handlePlantChange}
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['sectionName'].value}
                  options={section}
                  onChange={handleSectionChange}
                  placeholder="Select Section"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              {/* <CCol xs={12} sm={6} md={3}>
                <Dropdown
                  value={filters['status'].value}
                  options={status}
                  onChange={handleStatusChange}
                  placeholder="Select Status"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol> */}
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>Redpost</CCardHeader>
          <CCardBody>
            {loading ? (
              <LoadingComponent /> // Render loading component when loading is true
            ) : (
              <>
                <CRow className="mb-2">
                  <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
                    <div className="d-flex flex-wrap justify-content-start">
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
                  value={visibleData}
                  tableStyle={{ minWidth: '50rem' }}
                  className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                  paginator
                  rowsPerPageOptions={[10, 50, 100, 500]}
                  rows={10}
                  dataKey="id"
                  filters={filters}
                  loading={loading}
                  emptyMessage="No redpost found."
                  size="small"
                  scrollable
                  editMode="row"
                  removableSort
                  header={header}
                >
                  <Column
                    header="No"
                    sortable
                    frozen={true}
                    body={(data, props) => props.rowIndex + 1}
                    bodyStyle={{ textAlign: 'center' }}
                  ></Column>
                  <Column
                    field="materialNo"
                    header="Material"
                    frozen={true}
                    alignFrozen="left"
                    sortable
                  ></Column>
                  <Column field="description" header="Description" sortable></Column>
                  <Column
                    field="quantity"
                    header="Quantity"
                    sortable
                    bodyStyle={{ textAlign: 'center' }}
                  ></Column>
                  <Column field="uom" header="UOM" sortable></Column>
                  <Column field="pic" header="PIC" sortable></Column>
                  <Column field="date" header="Redpost Date" sortable></Column>
                  <Column field="sectionName" header="Section" sortable></Column>
                  <Column field="plantName" header="Plant" sortable></Column>
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
                </DataTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Redpost
