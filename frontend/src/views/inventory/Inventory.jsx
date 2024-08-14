import React, { useState, useEffect, useRef } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCol, CRow } from '@coreui/react'
import axiosInstance from '../../utils/AxiosInstance'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { FilterMatchMode } from 'primereact/api'
import 'primeicons/primeicons.css'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/mira/theme.css'
import 'primereact/resources/primereact.min.css'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [location, setLocation] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Material.Address_Rack.Location.locationName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const dt = useRef(null)

  useEffect(() => {
    getInventory()
    getPlant()
    getLocation()
    setLoading(false)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, globalFilterValue, inventory])

  const getInventory = async () => {
    try {
      const response = await axiosInstance.get('/inventory')
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const getPlant = async () => {
    try {
      const response = await axiosInstance.get('/plant')
      setPlant(response.data)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getLocation = async () => {
    try {
      const response = await axiosInstance.get('/location')
      const locationNames = response.data.map((loc) => loc.locationName)
      setLocation(locationNames)
    } catch (error) {
      console.error('Error fetching location:', error)
    }
  }

  const handleLocationChange = (e) => {
    const value = e.value
    let _filters = { ...filters }
    _filters['Material.Address_Rack.Location.locationName'].value = value
    setFilters(_filters)
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const applyFilters = () => {
    let filteredData = [...inventory]

    if (filters['global'].value) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filters['global'].value.toLowerCase()),
        ),
      )
    }

    if (filters['Material.Address_Rack.Location.locationName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Material.Address_Rack.Location.locationName ===
          filters['Material.Address_Rack.Location.locationName'].value,
      )
    }

    setVisibleData(filteredData)
  }

  const renderHeader = () => {
    return (
      <div className="d-flex align-items-center justify-content-end">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    )
  }

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = visibleData.map((item) => ({
        'Material No': item.Material.materialNo,
        Description: item.Material.description,
        Address: item.Material.Address_Rack.addressRackName,
        UOM: item.Material.uom,
        Plant: item.Material.Address_Rack.Location.Shop.Plant.plantName,
        Location: item.Material.Address_Rack.Location.locationName,
      }))

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'inventory')
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

        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION)
      }
    })
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Filter</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={4}>
                <Dropdown
                  value={filters['Material.Address_Rack.Location.locationName'].value}
                  options={location}
                  onChange={handleLocationChange}
                  placeholder="Select Location"
                  className="p-column-filter"
                  showClear
                  style={{ minWidth: '12rem' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>Inventory Table</CCardHeader>
          <CCardBody>
            <CRow className="mb-2">
              <CCol md={3}>
                <Button
                  type="button"
                  label="Excel"
                  icon="pi pi-file-excel"
                  severity="success"
                  className="rounded-5"
                  onClick={exportExcel}
                  data-pr-tooltip="XLS"
                />
              </CCol>
              <CCol>{renderHeader()}</CCol>
            </CRow>
            <DataTable
              ref={dt}
              value={visibleData}
              tableStyle={{ minWidth: '50rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500, 1000]}
              rows={10}
              dataKey="id"
              filters={filters}
              loading={loading}
              emptyMessage="No inventory found."
              size="small"
            >
              <Column field="Material.materialNo" header="Material No"></Column>
              <Column field="Material.description" header="Description"></Column>
              <Column field="Material.Address_Rack.addressRackName" header="Address"></Column>
              <Column field="Material.uom" header="UoM"></Column>
              <Column
                field="Material.Address_Rack.Location.Shop.Plant.plantName"
                header="Plant"
              ></Column>
              <Column
                field="Material.Address_Rack.Location.locationName"
                header="Location"
              ></Column>
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Inventory
