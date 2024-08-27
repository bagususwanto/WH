import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow } from '@coreui/react'
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
import withReactContent from 'sweetalert2-react-content'
import { MultiSelect } from 'primereact/multiselect'
import useManageStockService from '../../services/ManageStockService'
import useMasterDataService from '../../services/MasterDataService'

const MySwal = withReactContent(Swal)

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [storage, setStorage] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel

  const { getInventory, updateInventoryById } = useManageStockService()
  const { getMasterData, getMasterDataById } = useMasterDataService()

  const apiPlant = 'plant'
  const apiShop = 'shop-plant'
  const apiStorage = 'storage-shop'

  const columns = [
    {
      field: 'formattedUpdateBy',
      header: 'Update By',
      sortable: true,
    },
    {
      field: 'formattedUpdateAt',
      header: 'Update At',
      sortable: true,
    },
    {
      field: 'Address_Rack.Storage.Shop.Plant.plantName',
      header: 'Plant',
      sortable: true,
    },
    { field: 'Address_Rack.Storage.Shop.shopName', header: 'Shop', sortable: true },
    { field: 'Address_Rack.Storage.storageName', header: 'Storage', sortable: true },
  ]

  const [visibleColumns, setVisibleColumns] = useState([])

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Address_Rack.Storage.storageName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Address_Rack.Storage.Shop.Plant.plantName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Address_Rack.Storage.Shop.shopName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'Address_Rack.Storage.storageName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      'Address_Rack.Storage.Shop.Plant.plantName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      'Address_Rack.Storage.Shop.shopName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })
    setGlobalFilterValue('')
  }

  useEffect(() => {
    fetchInventory()
    getPlant()
    setLoading(false)
    initFilters()
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

  const fetchInventory = async () => {
    try {
      const response = await getInventory()
      const dataWithFormattedFields = response.data.map((item) => {
        // Evaluasi untuk menentukan status inventory
        const evaluation =
          item.quantityActual < item.Material.minStock
            ? 'shortage'
            : item.quantityActual > item.Material.minStock
              ? 'over'
              : 'ok'

        return {
          ...item,
          evaluation, // Tambahkan evaluasi ke item yang dikembalikan
          formattedUpdateBy: item.Log_Entries?.[0]?.User?.userName || '',
          formattedUpdateAt: item.updatedAt
            ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
            : '',
        }
      })
      setInventory(dataWithFormattedFields)
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch inventory data.',
      })
      console.error('Error fetching inventory:', error)
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

  const getShopByPlantId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await getMasterDataById(apiShop, id)
      const shopOptions = response.map((shop) => ({
        label: shop.shopName,
        value: shop.shopName,
        id: shop?.id,
      }))
      setShop(shopOptions)
    } catch (error) {
      console.error('Error fetching shop by ID:', error)
    }
  }

  const getStorageByShopId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await getMasterDataById(apiStorage, id)
      const storageOptions = response.map((storage) => ({
        label: storage.storageName,
        value: storage.storageName,
      }))
      setStorage(storageOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const editInventory = async (updateItem) => {
    try {
      const { id, ...data } = updateItem

      await updateInventoryById(id, data)
      fetchInventory()
      Swal.fire('Updated!', 'Data has been updated.', 'success')
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const handleStorageChange = (e) => {
    const value = e.value
    let _filters = { ...filters }
    _filters['Address_Rack.Storage.storageName'].value = value
    setFilters(_filters)
  }

  const handleShopChange = (e) => {
    const selectedShopName = e.value
    const selectedShop = shop.find((s) => s.value === selectedShopName) // Cari objek shop berdasarkan shopName
    const shopId = selectedShop?.id // Dapatkan shop.id

    getStorageByShopId(shopId)

    let _filters = { ...filters }
    _filters['Address_Rack.Storage.Shop.shopName'].value = selectedShopName
    setFilters(_filters)
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id

    getShopByPlantId(plantId)

    let _filters = { ...filters }
    _filters['Address_Rack.Storage.Shop.Plant.plantName'].value = selectedPlantName
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

    if (filters['Address_Rack.Storage.storageName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Address_Rack.Storage.storageName ===
          filters['Address_Rack.Storage.storageName'].value,
      )
    }

    if (filters['Address_Rack.Storage.Shop.Plant.plantName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Address_Rack.Storage.Shop.Plant.plantName ===
          filters['Address_Rack.Storage.Shop.Plant.plantName'].value,
      )
    }

    if (filters['Address_Rack.Storage.Shop.shopName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Address_Rack.Storage.Shop.shopName ===
          filters['Address_Rack.Storage.Shop.shopName'].value,
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
        const { quantityActualCheck, Material } = item
        const minStock = Material?.minStock
        const maxStock = Material?.maxStock

        let evaluation
        if (quantityActualCheck < minStock) {
          evaluation = 'shortage'
        } else if (quantityActualCheck > maxStock) {
          evaluation = 'over'
        } else {
          evaluation = 'ok'
        }

        return {
          'Material No': Material.materialNo,
          Description: Material.description,
          Address: Address_Rack.addressRackName,
          UoM: Material.uom,
          'Min. Stock': Material.minStock,
          'Max Stock': Material.maxStock,
          'Stock System': quantitySistem,
          'Stock Inventory': quantityActual,
          'Stock On Hand': quantityActualCheck,
          Evaluation: evaluation,
          Plant: Address_Rack.Storage.Shop.Plant.plantName,
          Shop: Address_Rack.Storage.Shop.shopName,
          Storage: Address_Rack.Storage.storageName,
          'Update By': Log_Entries[0]?.User?.userName || '',
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

    MySwal.fire({
      title: 'Are you sure?',
      text: 'You are about to update the data. Do you want to proceed?',
      icon: 'question',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        _inventory[index] = newData
        setInventory(_inventory)
        editInventory(_inventory[index])
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
    const { quantityActualCheck, Material } = rowData
    const minStock = Material?.minStock
    const maxStock = Material?.maxStock

    if (quantityActualCheck < minStock)
      return <Tag value="shortage" severity={getSeverity('shortage')} />
    if (quantityActualCheck > maxStock) return <Tag value="over" severity={getSeverity('over')} />
    return <Tag value="ok" severity={getSeverity('ok')} />
  }

  const discrapencyBodyTemplate = (rowData) => {
    const { quantityActual, quantitySistem, Material } = rowData

    const discrapency = quantityActual - quantitySistem

    if (discrapency < 0) return <Tag value={discrapency} severity={getSeverity('shortage')} />
    if (discrapency > 0) return <Tag value={discrapency} severity={getSeverity('over')} />
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
                <Dropdown
                  value={filters['Address_Rack.Storage.Shop.Plant.plantName'].value}
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
                  value={filters['Address_Rack.Storage.Shop.shopName'].value}
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
                  value={filters['Address_Rack.Storage.storageName'].value}
                  options={storage}
                  onChange={handleStorageChange}
                  placeholder="Select Storage"
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
              tableStyle={{ minWidth: '50rem' }}
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
              header={header}
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
              <Column field="Address_Rack.addressRackName" header="Address" sortable></Column>
              <Column field="Material.uom" header="UoM" sortable></Column>
              <Column field="Material.minStock" header="Min. Stock" sortable></Column>
              <Column field="Material.maxStock" header="Max Stock" sortable></Column>
              <Column field="quantitySistem" header="Stock System" sortable></Column>
              <Column
                field="quantityActual"
                header="Stock Inventory"
                editor={(options) => qtyActualEditor(options)}
                style={{ width: '5%' }}
                sortable
              ></Column>
              <Column
                field=""
                header="Discrapency"
                body={discrapencyBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              ></Column>
              <Column field="quantityActualCheck" header="Stock On Hand" sortable></Column>
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
