import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow } from '@coreui/react'
import axiosInstance from '../../utils/AxiosInstance'
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
import { Tag } from 'primereact/tag'
import { format, parseISO } from 'date-fns'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import Swal from 'sweetalert2'

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
    'Material.Address_Rack.Location.Shop.Plant.plantName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Material.Address_Rack.Location.Shop.shopName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  useEffect(() => {
    getInventory()
    getPlant()
    setLoading(false)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, globalFilterValue, inventory])

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

  const getShopByPlantId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await axiosInstance.get(`/shop-plant/${id}`)
      const shopOptions = response.data.map((shop) => ({
        label: shop.shopName,
        value: shop.shopName,
        id: shop?.id,
      }))
      setShop(shopOptions)
    } catch (error) {
      console.error('Error fetching shop by ID:', error)
    }
  }

  const getLocationByShopId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await axiosInstance.get(`/location-shop/${id}`)
      const locationOptions = response.data.map((location) => ({
        label: location.locationName,
        value: location.locationName,
      }))
      setLocation(locationOptions)
    } catch (error) {
      console.error('Error fetching location by ID:', error)
    }
  }

  const updateInventory = async (updateItem) => {
    try {
      await axiosInstance.put(`/inventory/${updateItem.id}`, updateItem)
      getInventory()
      Swal.fire('Updated!', 'Data has been updated.', 'success')
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const handleLocationChange = (e) => {
    const value = e.value
    let _filters = { ...filters }
    _filters['Material.Address_Rack.Location.locationName'].value = value
    setFilters(_filters)
  }

  const handleShopChange = (e) => {
    const selectedShopName = e.value
    const selectedShop = shop.find((s) => s.value === selectedShopName) // Cari objek shop berdasarkan shopName
    const shopId = selectedShop?.id // Dapatkan shop.id

    getLocationByShopId(shopId)

    let _filters = { ...filters }
    _filters['Material.Address_Rack.Location.Shop.shopName'].value = selectedShopName
    setFilters(_filters)
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id

    getShopByPlantId(plantId)

    let _filters = { ...filters }
    _filters['Material.Address_Rack.Location.Shop.Plant.plantName'].value = selectedPlantName
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
      const globalFilterValue = filters['global'].value.toLowerCase()
      filteredData = filteredData.filter((item) => {
        const searchString = JSON.stringify(item).toLowerCase()
        return searchString.includes(globalFilterValue)
      })
    }

    if (filters['Material.Address_Rack.Location.locationName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Material.Address_Rack.Location.locationName ===
          filters['Material.Address_Rack.Location.locationName'].value,
      )
    }

    if (filters['Material.Address_Rack.Location.Shop.Plant.plantName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Material.Address_Rack.Location.Shop.Plant.plantName ===
          filters['Material.Address_Rack.Location.Shop.Plant.plantName'].value,
      )
    }

    if (filters['Material.Address_Rack.Location.Shop.shopName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Material.Address_Rack.Location.Shop.shopName ===
          filters['Material.Address_Rack.Location.Shop.shopName'].value,
      )
    }

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
        const { quantityActual, Material } = item
        const stdStock = Material?.stdStock

        let evaluation
        if (quantityActual < stdStock) {
          evaluation = 'shortage'
        } else if (quantityActual > stdStock) {
          evaluation = 'over'
        } else {
          evaluation = 'ok'
        }

        return {
          'Material No': Material.materialNo,
          Description: Material.description,
          Address: Material.Address_Rack.addressRackName,
          UoM: Material.uom,
          'Standar Stock': Material.stdStock,
          'Actual Stock': quantityActual,
          Evaluation: evaluation, // Perbaiki typo dari Evalution ke Evaluation
          Plant: Material.Address_Rack.Location.Shop.Plant.plantName,
          Shop: Material.Address_Rack.Location.Shop.shopName,
          Location: Material.Address_Rack.Location.locationName,
          'Update By': Material.Log_Entries[0]?.User?.userName || '',
          'Update At': format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
        }
      })

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

  const onRowEditComplete = (e) => {
    let _inventory = [...inventory]
    let { newData, index } = e

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to update the data. Do you want to proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        _inventory[index] = newData
        setInventory(_inventory)
        updateInventory(_inventory[index])
      }
    })
  }

  const qtyActualEditor = (options) => {
    return (
      <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />
    )
  }

  const remarksEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value || ''}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    )
  }

  const statusBodyTemplate = (rowData) => {
    const { quantityActual, Material } = rowData
    const stdStock = Material?.stdStock

    if (quantityActual < stdStock)
      return <Tag value="shortage" severity={getSeverity('shortage')} />
    if (quantityActual > stdStock) return <Tag value="over" severity={getSeverity('over')} />
    return <Tag value="ok" severity={getSeverity('ok')} />
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Filter</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['Material.Address_Rack.Location.Shop.Plant.plantName'].value}
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
                  value={filters['Material.Address_Rack.Location.Shop.shopName'].value}
                  options={shop}
                  onChange={handleShopChange}
                  placeholder="Select Shop"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['Material.Address_Rack.Location.locationName'].value}
                  options={location}
                  onChange={handleLocationChange}
                  placeholder="Select Location"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>Inventory Table</CCardHeader>
          <CCardBody>
            <CRow className="mb-2">
              <CCol xs={6} sm={6} md={3}>
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
              <CCol xs={6} sm={6} md={9} className="d-flex justify-content-end align-items-center">
                {renderHeader()}
              </CCol>
            </CRow>
            <DataTable
              value={visibleData}
              tableStyle={{ minWidth: '100rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              filters={filters}
              loading={loading}
              emptyMessage="No inventory found."
              size="small"
              scrollable
              editMode="row"
              onRowEditComplete={onRowEditComplete}
              removableSort
            >
              <Column
                field="Material.materialNo"
                header="Material No"
                frozen={true}
                alignFrozen="left"
                sortable
              ></Column>
              <Column
                field="Material.description"
                header="Description"
                frozen={true}
                alignFrozen="left"
                sortable
              ></Column>
              <Column
                field="Material.Address_Rack.addressRackName"
                header="Address"
                sortable
              ></Column>
              <Column field="Material.uom" header="UoM" sortable></Column>
              <Column field="Material.stdStock" header="Standar Stock" sortable></Column>
              <Column
                field="quantityActual"
                header="Actual Stock"
                editor={(options) => qtyActualEditor(options)}
                style={{ width: '5%' }}
                sortable
              ></Column>
              <Column
                field="evaluation"
                header="Evaluation"
                body={statusBodyTemplate} // Menggunakan fungsi evaluasi
                bodyStyle={{ textAlign: 'center' }}
                sortable
              ></Column>
              <Column
                field="remarks"
                header="Remarks"
                editor={(options) => remarksEditor(options)}
                sortable
              ></Column>
              <Column
                field="Material.Log_Entries[0].User.userName"
                header="Update By"
                body={(rowData) => rowData.Material.Log_Entries[0]?.User?.userName || ''}
                sortable
              ></Column>
              <Column
                field="updatedAt"
                header="Update At"
                body={(rowData) => format(parseISO(rowData.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
                sortable
              ></Column>
              <Column
                field="Material.Address_Rack.Location.Shop.Plant.plantName"
                header="Plant"
                sortable
              ></Column>
              <Column
                field="Material.Address_Rack.Location.Shop.shopName"
                header="Shop"
                sortable
              ></Column>
              <Column
                field="Material.Address_Rack.Location.locationName"
                header="Location"
                sortable
              ></Column>
              <Column
                header="Action"
                rowEditor={true}
                headerStyle={{ width: '5%' }}
                bodyStyle={{ textAlign: 'center' }}
                frozen={true}
                alignFrozen="right"
              ></Column>
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Inventory
