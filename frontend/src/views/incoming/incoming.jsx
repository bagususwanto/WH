import React, { useState, useEffect, Suspense } from 'react'
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
  CFormLabel,
  CFormCheck,
  CSpinner,
  CFormSelect,
} from '@coreui/react'
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
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const MySwal = withReactContent(Swal)

const Incoming = () => {
  const [incoming, setIncoming] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [storage, setStorage] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [radio, setRadio] = useState('plan')
  const [plantId, setPlantId] = useState()
  const [storageId, setStorageId] = useState()
  const [incomingData, setIncomingData] = useState({
    importDate: date,
    file: null, // Mengubah tipe ke null karena file adalah objek
  })
  const [loadingImport, setLoadingImport] = useState(false)
  const [imported, setImported] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dates, setDates] = useState([null, null])

  const { getIncoming, postIncomingPlan, postIncomingActual, updateIncomingById } =
    useManageStockService()
  const { getMasterData, getMasterDataById } = useMasterDataService()

  const apiPlant = 'plant-public'
  const apiShop = 'shop-plant'
  const apiStorage = 'storage-plant'
  const apiIncomingPlan = 'upload-incoming-plan'
  const apiIncomingActual = 'upload-incoming-actual'
  const apiWarehousePlant = 'warehouse-plant'

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
      field: 'Address_Rack.Storage.Plant.plantName',
      header: 'Plant',
      sortable: true,
    },
    { field: 'Address_Rack.Storage.storageName', header: 'Storage', sortable: true },
  ]

  const [visibleColumns, setVisibleColumns] = useState([])

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Log_Import.importDate': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Inventory.Address_Rack.Storage.storageName': {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    'Inventory.Address_Rack.Storage.Plant.plantName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'Log_Import.importDate': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      'Inventory.Address_Rack.Storage.storageName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      'Inventory.Address_Rack.Storage.Plant.plantName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })
    setGlobalFilterValue('')
    setSelectedDate(null)
  }

  useEffect(() => {
    getPlant()
    setLoading(false)
    initFilters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, globalFilterValue, incoming])

  useEffect(() => {
    if (imported) {
      fetchIncoming()
      setImported(false) // Reset state
      return
    }

  }, [imported, dates, plantId, storageId])

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

  // const fetchIncoming = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await getIncoming()
  //     const dataWithFormattedFields = response.data.map((item) => {
  //       const discrepancy = item.actual - item.planning

  //       return {
  //         ...item,
  //         discrepancy,
  //         formattedUpdateBy: item.Log_Entries?.[0]?.User?.username || '',
  //         formattedUpdateAt: item.updatedAt
  //           ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
  //           : '',
  //       }
  //     })
  //     setIncoming(dataWithFormattedFields)
  //   } catch (error) {
  //     console.error('Error fetching incoming:', error)
  //   } finally {
  //     setLoading(false) // Set loading to false after data is fetched
  //   }
  // }

  const fetchIncoming = async () => {
    setLoading(true)
    try {
      let startDate
      let endDate

      if (dates[0] && dates[1]) {
        startDate = format(dates[0], 'yyyy-MM-dd')
        endDate = format(dates[1], 'yyyy-MM-dd')
      }

      const response = await getIncoming(
        startDate ? startDate : '',
        endDate ? endDate : '',
        plantId ? plantId : '',
        storageId ? storageId : '',
      )
      const dataWithFormattedFields = response.data.map((item) => {
        const discrepancy = item.actual - item.planning

        return {
          ...item,
          discrepancy,
          formattedUpdateBy: item.Log_Entries?.[0]?.User?.username || '',
          formattedUpdateAt: item.updatedAt
            ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
            : '',
        }
      })
      setIncoming(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching incoming:', error)
    } finally {
      setLoading(false) // Set loading to false after data is fetched
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

  const getStorageByPlantId = async (id) => {
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

  const editIncoming = async (updateItem) => {
    try {
      const { id, ...data } = updateItem
      if (!plantId) {
        MySwal.fire('Error!', 'Plant is required, please select a dropdown plant', 'error')
        return
      }
      const warehouseId = await getMasterDataById(apiWarehousePlant, plantId)
      await updateIncomingById(id, warehouseId.id, data)
      fetchIncoming()
      Swal.fire('Updated!', 'Data has been updated.', 'success')
    } catch (error) {
      console.error('Error fetching incoming:', error)
    }
  }

  const handleStorageChange = (e) => {
    const selectedStorageName = e.value
    const selectedStorage = storage.find((s) => s.value === selectedStorageName) // Cari objek storage berdasarkan storageName
    const storageId = selectedStorage?.id // Dapatkan storage.id
    setStorageId(storageId)
    // let _filters = { ...filters }
    // _filters['Inventory.Address_Rack.Storage.storageName'].value = value
    // setFilters(_filters)
  }

  const handleShopChange = (e) => {
    const selectedShopName = e.value
    const selectedShop = shop.find((s) => s.value === selectedShopName) // Cari objek shop berdasarkan shopName
    const shopId = selectedShop?.id // Dapatkan shop.id

    getStorageByShopId(shopId)

    let _filters = { ...filters }
    _filters['Inventory.Address_Rack.Storage.shopName'].value = selectedShopName
    setFilters(_filters)
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id
    setPlantId(plantId)

    getStorageByPlantId(plantId)

    // let _filters = { ...filters }
    // _filters['Inventory.Address_Rack.Storage.Plant.plantName'].value = selectedPlantName
    // setFilters(_filters)
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const applyFilters = () => {
    let filteredData = [...incoming]

    if (filters['global'].value) {
      const globalFilterValue = filters['global'].value.toLowerCase()
      filteredData = filteredData.filter((item) => {
        const searchString = JSON.stringify(item).toLowerCase()
        return searchString.includes(globalFilterValue)
      })
    }

    if (filters['Log_Import.importDate'].value) {
      filteredData = filteredData.filter(
        (item) => item.Log_Import.importDate === filters['Log_Import.importDate'].value,
      )
    }

    if (filters['Inventory.Address_Rack.Storage.storageName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Inventory.Address_Rack.Storage.storageName ===
          filters['Inventory.Address_Rack.Storage.storageName'].value,
      )
    }

    if (filters['Inventory.Address_Rack.Storage.Plant.plantName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Inventory.Address_Rack.Storage.Plant.plantName ===
          filters['Inventory.Address_Rack.Storage.Plant.plantName'].value,
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
        return {
          'Material No': item.Inventory.Material.materialNo,
          Description: item.Inventory.Material.description,
          Address: item.Inventory.Address_Rack.addressRackName,
          UoM: item.Inventory.Material.uom,
          'Planning Incoming': item.planning,
          'Actual Incoming': item.actual,
          Discrepancy: item.discrepancy,
          Date: item.Log_Import.importDate,
          'Import By': item.Log_Import?.User?.username || '',
          Plant: item.Inventory.Address_Rack.Storage.Plant.plantName,
          Storage: item.Inventory.Address_Rack.Storage.storageName,
          'Update By': item.Log_Entries[0]?.User?.username || '',
          'Update At': format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
        }
      })

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'incoming')
    })
  }

  const downloadTemplate = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = [
        {
          materialNo: '',
          addressRackName: '',
          planning: '',
          actual: '',
          storageName: '',
        },
      ]

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { incoming: worksheet }, SheetNames: ['incoming'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'template_incoming')
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

        if (fileName === 'template_incoming') {
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

  const onRowEditComplete = (e) => {
    let _incoming = [...incoming]
    let { newData, index } = e
    MySwal.fire({
      title: 'Are you sure?',
      html: `You are about to update the data <span style="color: red;">${newData.Inventory.Material.materialNo}</span>
      with quantity <span style="color: blue;">${newData.actual}</span>. Do you want to proceed?`,
      icon: 'question',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        _incoming[index] = newData
        setIncoming(_incoming)
        editIncoming(_incoming[index])
      }
    })
  }

  const qtyActualEditor = (options) => {
    return (
      <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />
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

  const discrepancyBodyTemplate = (rowData) => {
    const { discrepancy } = rowData

    if (discrepancy < 0) {
      return <Tag value={discrepancy} severity={getSeverity('shortage')} />
    }
    if (discrepancy > 0) {
      return <Tag value={discrepancy} severity={getSeverity('over')} />
    }
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

  // Handle perubahan date picker
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate)
    // setIncomingData((prevData) => ({
    //   ...prevData,
    //   importDate: selectedDate[0],
    // }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setIncomingData((prevData) => ({
      ...prevData,
      file: file,
    }))
  }

  const showModalUpload = () => {
    setVisible(true)
  }

  const handleImport = async () => {
    setLoadingImport(true)
    try {
      if (!plantId) {
        MySwal.fire('Error', 'Plant is required, please select a dropdown plant.', 'error')
        return
      }

      if (!incomingData.file) {
        MySwal.fire('Error', 'Please select a file', 'error')
        return
      }

      const warehouseId = await getMasterDataById(apiWarehousePlant, plantId)

      if (radio === 'plan') {
        await postIncomingPlan(apiIncomingPlan, warehouseId.id, incomingData)
        MySwal.fire('Success', 'Data Incoming Plan Berhasil', 'success')
      } else if (radio === 'actual') {
        await postIncomingActual(apiIncomingActual, warehouseId.id, incomingData)
        MySwal.fire('Success', 'Data Incoming Actual Berhasil', 'success')
      }

      setImported(true)
    } catch (error) {
      console.error('Error during import:', error)
    } finally {
      setLoadingImport(false)
      setVisible(false)
    }
  }

  const handleFilterDate = (date) => {
    setDates(date)
    // const fornmattedDate = date[0].toLocaleDateString('en-CA')

    // let _filters = { ...filters }
    // _filters['Log_Import.importDate'].value = fornmattedDate
    // setFilters(_filters)
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading incoming data...</p>
    </div>
  )

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
                  onChange={(date) => setDates(date)}
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
                  value={filters['Inventory.Address_Rack.Storage.Plant.plantName'].value}
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
                  value={filters['Inventory.Address_Rack.Storage.storageName'].value}
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
          <CCardHeader>Incoming Table</CCardHeader>
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
                      <Button
                        type="button"
                        label="Upload"
                        icon="pi pi-file-import"
                        severity="primary"
                        className="rounded-5 me-2 mb-2"
                        onClick={showModalUpload}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Template"
                        icon="pi pi-download"
                        severity="primary"
                        className="rounded-5 mb-2"
                        onClick={downloadTemplate}
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
                  emptyMessage="No incoming found."
                  size="small"
                  scrollable
                  editMode="row"
                  onRowEditComplete={onRowEditComplete}
                  removableSort
                  header={header}
                >
                  <Column
                    field="Inventory.Material.materialNo"
                    header="Material"
                    frozen={true}
                    alignFrozen="left"
                    sortable
                  ></Column>
                  <Column
                    field="Inventory.Material.description"
                    header="Description"
                    frozen={true}
                    alignFrozen="left"
                    sortable
                  ></Column>
                  <Column
                    field="Inventory.Address_Rack.addressRackName"
                    header="Address"
                    sortable
                  ></Column>
                  <Column field="Inventory.Material.uom" header="UoM" sortable></Column>
                  <Column field="planning" header="Plan." sortable></Column>
                  <Column
                    field="actual"
                    header="Act."
                    editor={(options) => qtyActualEditor(options)}
                    style={{ width: '5%' }}
                    sortable
                  ></Column>
                  <Column
                    field="discrepancy"
                    header="Disc."
                    // body={discrepancyBodyTemplate}
                    bodyStyle={{ textAlign: 'center' }}
                    sortable
                  ></Column>
                  <Column field="Log_Import.importDate" header="Date" sortable></Column>
                  <Column field="Log_Import.User.username" header="Import By" sortable></Column>
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
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Upload Incoming</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormSelect
              label="Plant"
              aria-label="Select Plant"
              options={[
                'Select Plant',
                ...plant.map((plant) => ({ label: plant.label, value: plant.id })),
              ]}
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            />
          </div>
          <CFormLabel>Date</CFormLabel>
          <div className="mb-3">
            <Flatpickr
              value={date}
              options={{
                dateFormat: 'Y-m-d',
                maxDate: new Date(),
                allowInput: true,
              }}
              onChange={(date) => setDate(date)}
              className="form-control"
              placeholder="Select a date"
            />
          </div>
          <div className="mb-3">
            <CFormInput
              onChange={handleFileChange} // Handle perubahan file
              type="file"
              label="Excel File"
              accept=".xlsx" // Hanya menerima file Excel
            />
          </div>
          <div className="mb-3 d-flex justify-content-center">
            <CFormCheck
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault1"
              label="Incoming Plan"
              defaultChecked={radio === 'plan'}
              inline
              onChange={() => setRadio('plan')}
            />
            <CFormCheck
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
              label="Incoming Actual"
              defaultChecked={radio === 'actual'}
              inline
              onChange={() => setRadio('actual')}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={() => handleImport()}>
              {loadingImport ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Incoming
