import React, { useState, useEffect, Suspense } from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow, CFormTextarea } from '@coreui/react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { FilterMatchMode } from 'primereact/api'
import 'primeicons/primeicons.css'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
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
import {
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CButton,
} from '@coreui/react'

const MySwal = withReactContent(Swal)

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [storage, setStorage] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel
  const [editData, setEditData] = useState({})
  const [modalInventory, setModalInventory] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [plantId, setPlantId] = useState()
  const [storageId, setStorageId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [plantName, setPlantName] = useState()
  const [typeMaterial, setTypeMaterial] = useState()
  const [type, setType] = useState()
  const [remarks, setRemarks] = useState('') // State to store remarks entered in CModal
  const { getInventory, updateInventoryById, executeInventory } = useManageStockService()
  const { getMasterData, getMasterDataById } = useMasterDataService()

  const apiPlant = 'plant-public'
  const apiShop = 'shop-plant'
  const apiStorage = 'storage-plant'
  const apiWarehousePlant = 'warehouse-plant'
  const apiTypeMaterial = 'material-type'

  const columns = [
    {
      field: 'quantityActual',
      header: 'Stock Inv.',
      sortable: true,
    },
    {
      field: 'quantitySistem',
      header: 'Stock System',
      sortable: true,
    },
    {
      field: 'discrepancy',
      header: 'Discrepancy',
      sortable: true,
    },
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
    {
      field: 'Filling Note',
      header: 'Note',
      sortable: true,
      body: (rowData) => {
        const { status, severity } = getNoteStatus(rowData)
        return <Tag value={status} severity={severity} />
      },
    },
    { field: 'Material.type', header: 'Type', sortable: true },
  ]

  const getNoteStatus = (rowData) => {
    // Memeriksa apakah quantityActualCheck null, undefined, atau kosong
    const isFilled =
      rowData.quantityActualCheck !== null &&
      rowData.quantityActualCheck !== undefined &&
      rowData.quantityActualCheck !== ''

    // Jika quantityActualCheck ada nilainya selain null, undefined, atau kosong, dianggap "ALREADY FILLED", jika tidak "NOT FILLED YET"
    const status = isFilled ? 'ALREADY FILLED' : 'NOT FILLED YET'

    // Tentukan severity berdasarkan status
    const severity = isFilled ? getSeverity('ok') : getSeverity('over')

    return { status, severity }
  }

  const [visibleColumns, setVisibleColumns] = useState([])

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Address_Rack.Storage.storageName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Address_Rack.Storage.Plant.plantName': {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    'Material.type': { value: null, matchMode: FilterMatchMode.EQUALS },
    'Address_Rack.Storage.storageName': {
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
      'Address_Rack.Storage.Plant.plantName': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      'Material.type': {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    })
    setGlobalFilterValue('')
    setPlantId(null)
    setStorageId(null)
    setType(null)
    setInventory([])
  }

  useEffect(() => {
    // fetchInventory()
    getPlant()
    getTypeMaterial()
    setLoading(false)
    initFilters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, globalFilterValue, inventory])

  useEffect(() => {
    if (!shouldFetch) return
    fetchInventory()
  }, [shouldFetch, plantId, type, storageId])

  const getSeverity = (status) => {
    switch (status) {
      case 'minim':
        return 'danger'

      case 'ok':
        return 'success'

      case 'over':
        return 'warning'
    }
  }

  const fetchInventory = async () => {
    setLoading(true)
    try {
      if (!plantId && !storageId && !type) {
        setInventory([])
        setLoading(false)
        return
      }
      const response = await getInventory(
        plantId ? plantId : '',
        storageId ? storageId : '',
        type ? type : '',
      )
      const dataWithFormattedFields = response.data.map((item) => {
        // Evaluasi untuk menentukan status inventory
        const evaluation =
          item.quantityActual < item.Material.minStock
            ? 'minim'
            : item.quantityActual > item.Material.minStock
              ? 'over'
              : 'ok'

        const discrepancy = item.quantityActual - item.quantitySistem

        return {
          ...item,
          discrepancy,
          evaluation, // Tambahkan evaluasi ke item yang dikembalikan
          formattedUpdateBy: item.Log_Entries?.[0]?.User?.username || '',
          formattedUpdateAt: item.updatedAt
            ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
            : '',
        }
      })
      setInventory(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  // useEffect(() => {
  //   const fetchInventory = async () => {
  //     setLoading(true)
  //     try {
  //       const response = await getAllInventory()
  //       const dataWithFormattedFields = response.data.map((item) => {
  //         // Evaluasi untuk menentukan status inventory
  //         const evaluation =
  //           item.quantityActual < item.Material.minStock
  //             ? 'minim'
  //             : item.quantityActual > item.Material.minStock
  //               ? 'over'
  //               : 'ok'

  //         const discrepancy = item.quantityActual - item.quantitySistem

  //         return {
  //           ...item,
  //           discrepancy,
  //           evaluation, // Tambahkan evaluasi ke item yang dikembalikan
  //           formattedUpdateBy: item.Log_Entries?.[0]?.User?.username || '',
  //           formattedUpdateAt: item.updatedAt
  //             ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
  //             : '',
  //         }
  //       })
  //       setInventory(dataWithFormattedFields)
  //     } catch (error) {
  //       console.error('Error fetching inventory:', error)
  //     } finally {
  //       setLoading(false) // Set loading to false after data is fetched
  //     }
  //   }

  //   fetchInventory()
  // }, [])

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

  const getTypeMaterial = async () => {
    try {
      const response = await getMasterData(apiTypeMaterial)

      const typeMaterialOptions = response.data.map((tm) => ({
        label: tm.type,
        value: tm.type,
        id: tm.id,
      }))
      setTypeMaterial(typeMaterialOptions)
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
        id: storage.id,
      }))
      setStorage(storageOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const handleStorageChange = (e) => {
    const selectedStorageName = e.value
    const selectedStorage = storage.find((s) => s.value === selectedStorageName) // Cari objek storage berdasarkan storageName
    const storageId = selectedStorage?.id // Dapatkan storage.id
    console.log('Storage ID:', storageId)

    setStorageId(storageId)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['Address_Rack.Storage.storageName'].value = e.value
    setFilters(_filters)
  }

  const handleTypeChange = (e) => {
    const value = e.value
    setType(value)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['Material.type'].value = value
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
    setPlantName(selectedPlantName)
    const selectedPlant = plant.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id
    setPlantId(plantId)
    setShouldFetch(true)
    getStorageByPlantId(plantId)

    let _filters = { ...filters }
    _filters['Address_Rack.Storage.Plant.plantName'].value = selectedPlantName
    setFilters(_filters)
  }
  const handleSave = async () => {
    setLoadingSave(true)
    setModalInventory(false)
    try {
      if (!plantId) {
        setLoadingSave(false)
        MySwal.fire('Error!', 'Plant is required, please select a dropdown plant', 'error')
        return
      }
      const warehouseId = await getMasterDataById(apiWarehousePlant, plantId)

      await updateInventoryById(editData.id, warehouseId.id, editData) // editData now contains updated remarks
      fetchInventory()
      MySwal.fire('Updated!', 'Data has been updated.', 'success')
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoadingSave(false)
      setModalInventory(false)
    }
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

    if (filters['Address_Rack.Storage.Plant.plantName'].value) {
      filteredData = filteredData.filter(
        (item) =>
          item.Address_Rack.Storage.Plant.plantName ===
          filters['Address_Rack.Storage.Plant.plantName'].value,
      )
    }

    if (filters['Material.type'].value) {
      filteredData = filteredData.filter(
        (item) => item.Material.type === filters['Material.type'].value,
      )
    }

    // if (filters['Address_Rack.Storage.shopName'].value) {
    //   filteredData = filteredData.filter(
    //     (item) =>
    //       item.Address_Rack.Storage.shopName ===
    //       filters['Address_Rack.Storage.shopName'].value,
    //   )
    // }

    setVisibleData(filteredData)
  }
  const updateRemarks = (rowData) => {
    return rowData.id === editData.id ? editData.remarks : rowData.remarks
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
          evaluation = 'minim'
        } else if (quantityActualCheck > maxStock) {
          evaluation = 'over'
        } else {
          evaluation = 'ok'
        }

        return {
          'Material No': Material.materialNo,
          // Description: Material.description,
          // Address: item.Address_Rack.addressRackName,
          UoM: Material.uom,
          // 'Min Stock': Material.minStock,
          // 'Max Stock': Material.maxStock,
          // 'Stock System': item.quantitySistem,
          // 'Stock Inventory': item.quantityActual,
          // Discrepancy: item.discrepancy,
          Stock: quantityActualCheck,
          // Evaluation: evaluation,
          // Remarks: item.remarks,
          // Plant: item.Address_Rack.Storage.Plant.plantName,
          // Storage: item.Address_Rack.Storage.storageName,
          // 'Update By': item.Log_Entries[0]?.User?.username || '',
          // 'Update At': format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
        }
      })

      // Timestamp download untuk baris atas
      const downloadTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      const downloadAtRow = [
        {
          'Material No': `downloadAt: ${downloadTimestamp}`,
          UoM: '',
          Stock: '',
        },
      ]

      // Header data utama
      const headerRow = [
        {
          'Material No': 'Material No',
          UoM: 'UoM',
          Stock: 'Stock',
        },
      ]

      // Gabungkan baris downloadAt, header utama, dan data
      const finalData = [...downloadAtRow, ...headerRow, ...mappedData]

      // Mengkonversi data ke worksheet tanpa menambahkan header otomatis
      const worksheet = xlsx.utils.json_to_sheet(finalData, { skipHeader: true })

      // Auto-width untuk kolom
      const colWidth = finalData.reduce((acc, row) => {
        Object.keys(row).forEach((key) => {
          const cellValue = row[key] ? row[key].toString() : ''
          const currentWidth = acc[key] || 0
          acc[key] = Math.max(currentWidth, cellValue.length)
        })
        return acc
      }, {})

      // Menetapkan lebar kolom ke worksheet
      worksheet['!cols'] = Object.keys(colWidth).map((key) => ({
        wch: colWidth[key] + 2, // Menambahkan padding ekstra untuk kolom
      }))

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

        // Format tanggal menjadi yyyyMMddHHmmss
        const formattedDate = format(new Date(), 'yyyyMMddHHmmss')

        // Membuat blob data untuk file
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        })

        // Menyimpan file dengan nama yang mengandung tanggal terformat
        module.default.saveAs(data, `${fileName}_export_${formattedDate}${EXCEL_EXTENSION}`)
      }
    })
  }

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex justify-content-center align-items-center">
      <Button
        icon="pi pi-pencil"
        className="p-row-editor-init p-link"
        onClick={() => handleInputInventory(rowData)}
      />
    </div>
  )

  const handleInputInventory = (rowData) => {
    setEditData(rowData)
    setModalInventory(true)
  }

  const statusBodyTemplate = (rowData) => {
    const { quantityActualCheck, Material } = rowData
    const minStock = Material?.minStock
    const maxStock = Material?.maxStock

    if (quantityActualCheck < minStock) return <Tag value="minim" severity={getSeverity('minim')} />
    if (quantityActualCheck > maxStock) return <Tag value="over" severity={getSeverity('over')} />
    return <Tag value="ok" severity={getSeverity('ok')} />
  }

  // const discrepancyBodyTemplate = (rowData) => {
  //   const { quantityActual, quantitySistem } = rowData

  //   const discrepancy = quantityActual - quantitySistem

  //   if (discrepancy < 0) return <Tag value={discrepancy} severity={getSeverity('minim')} />
  //   if (discrepancy > 0) return <Tag value={discrepancy} severity={getSeverity('over')} />
  // }

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

  const confirmExecute = async () => {
    try {
      if (!plantId) {
        MySwal.fire('Error!', 'Plant is required, please select a dropdown plant', 'error')
        return
      }

      const warehouseId = await getMasterDataById(apiWarehousePlant, plantId)
      await executeInventory(plantId, warehouseId)
      fetchInventory()
      MySwal.fire('Success!', 'Data has been executed.', 'success')
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const handleExecute = () => {
    if (!plantId) {
      MySwal.fire('Error!', 'Plant is required, please select a dropdown plant', 'error')
      return
    }

    MySwal.fire({
      title: 'Apakah Anda yakin?',
      icon: 'question',
      input: 'text',
      html: `Data inventory <b>${plantName}</b> akan diproses <br/>
      Data ini tidak dapat dikembalikan! <br/> 
      Ketik "<b>execute</b>" untuk konfirmasi`,
      inputPlaceholder: 'Ketik "execute"',
      showCancelButton: true,
      confirmButtonColor: '#121629',
      confirmButtonText: 'Ya, execute!',
      cancelButtonText: 'Batal',
      preConfirm: (inputValue) => {
        if (inputValue !== 'execute') {
          Swal.showValidationMessage('Teks konfirmasi salah. Ketik "execute" untuk melanjutkan.')
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        confirmExecute()
      }
    })
  }

  // Placeholder component for loading
  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading inventory data...</p>
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
                <Dropdown
                  value={filters['Address_Rack.Storage.Plant.plantName'].value}
                  options={plant}
                  onChange={handlePlantChange}
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                  id={filters['Address_Rack.Storage.Plant.id']?.value}
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
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['Material.type'].value}
                  options={typeMaterial}
                  onChange={handleTypeChange}
                  placeholder="Select Type"
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
                        label="Execute"
                        icon="pi pi-play"
                        severity="warning"
                        className="rounded-5 mb-2"
                        onClick={handleExecute}
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
                  emptyMessage="No inventory found."
                  size="small"
                  scrollable
                  removableSort
                  header={header}
                >
                  <Column
                    field="Material.materialNo"
                    header="Material"
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column
                    field="Material.description"
                    header="Description"
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column field="Address_Rack.addressRackName" header="Address" sortable />
                  <Column field="Material.uom" header="UoM" sortable />
                  <Column field="Material.minStock" header="Min" sortable />
                  <Column field="Material.maxStock" header="Max" sortable />
                  <Column field="quantityActualCheck" header="Act" sortable />
                  <Column
                    field="evaluation"
                    header="Eval."
                    body={statusBodyTemplate} // Menggunakan fungsi evaluasi
                    bodyStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    field="remarks"
                    header="Remarks"
                    body={(rowData) => updateRemarks(rowData)}
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

                  <Column
                    header="Action"
                    body={actionBodyTemplate}
                    headerStyle={{ width: '5%' }}
                    bodyStyle={{ textAlign: 'center' }}
                    frozen
                    alignFrozen="right"
                  />
                </DataTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modalInventory} onClose={() => setModalInventory(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Inventory Input</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={editData?.Material?.materialNo || ''}
            label="Material No."
            disabled
            className="mb-3"
          />
          <CFormInput
            type="text"
            value={editData?.Material?.description || ''}
            label="Description"
            disabled
            className="mb-3"
          />

          <CRow>
            <CCol md={12}>
              <CFormInput
                type="text"
                value={editData?.Address_Rack?.addressRackName || ''}
                label="Address"
                disabled
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <CFormInput
                type="number"
                value={editData?.quantityActual || ''}
                onChange={(e) => setEditData({ ...editData, quantityActual: e.target.value })}
                label="Quantity"
                className="mb-3"
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="text"
                value={editData?.Material?.uom || ''}
                label="UoM"
                disabled
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <CFormTextarea
                type="text"
                value={editData.remarks || ''} // Directly use editData.remarks for real-time binding
                onChange={(e) => setEditData({ ...editData, remarks: e.target.value })} // Update editData
                label="Remarks"
                className="mb-3"
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={handleSave}>
              {loadingSave ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Inventory
