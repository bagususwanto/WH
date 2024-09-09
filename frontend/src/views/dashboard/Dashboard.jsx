import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCol, CRow, CFormCheck } from '@coreui/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import { MultiSelect } from 'primereact/multiselect'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { BarChart } from '@mui/x-charts/BarChart'
import useManageStockService from '../../services/ManageStockService'
import useDashboardService from '../../services/DashboardService'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Tag } from 'primereact/tag'
import { Box } from '@mui/material'
//import '../../scss/customchart.scss'

const MySwal = withReactContent(Swal)

// Translation object
const translations = {}

// Function to add labels
export function tambahLabel(series) {
  return series.map((item) => ({
    ...item,
    label: translations[item.dataKey],
    valueFormatter: (v) => (v ? ` ${v.toLocaleString()}` : '-'),
  }))
}

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

const MAX_NAME_LENGTH = 10 // Maksimal karakter untuk label sumbu X

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const { getInventory } = useManageStockService() // Service
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const [inventoriescritical, setInventoriesCritical] = useState([]) // Inventory data
  const [inventories, setInventories] = useState([]) // Inventory data
  const [itemNb, setItemNb] = React.useState(5)
  const [chartWidth, setChartWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setChartWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchInventory()
    fetchInventoryCriticalStock(itemNb)
    setLoading(false)
    console.log(inventoriescritical)
  }, [])

  const handleItemNbChange = (event, newValue) => {
    if (typeof newValue === 'number') {
      setItemNb(newValue)
    }
  }

  const fetchInventoryCriticalStock = async (itemNb) => {
    try {
      const response = await getInventoryCriticalStock(itemNb)
      // console.log(response.data)
      setInventoriesCritical(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getInventories = async () => {
    try {
      const response = await getInventory()
      setInventories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getSeverity = (status) => {
    switch (status) {
      case 'shortage':
        return 'danger'
      case 'ok':
        return 'success'
      case 'over':
        return 'warning'
      default:
        return 'default'
    }
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

  const fetchInventory = async () => {
    try {
      const response = await getInventory()
      const dataWithFormattedFields = response.data
        .map((item) => {
          const evaluation =
            item.quantityActual < item.Material.minStock
              ? 'shortage'
              : item.quantityActual > item.Material.maxStock
                ? 'over'
                : 'ok'
  
          const stockDifference = item.quantityActual / item.Material.minStock // Selisih antara quantityActual dan maxStock
          const useByShift = (item.quantityActual / item.Material.minStock) * 2 || 0 // Use default value if undefined
  
          return {
            ...item,
            evaluation,
            stockDifference,
            useByShift, // Ensure useByShift is always defined
          }
        })
  
        .filter((item) => {
          // Pastikan semua nilai yang digunakan valid dan tidak kosong
          return (
            item.quantityActual != null &&
            item.Material.maxStock != null &&
            item.quantityActual !== '' &&
            item.Material.maxStock !== ''
          )
        })
  
      // Set data berdasarkan penilaian
      setInventories({
        critical: dataWithFormattedFields.filter((item) => item.evaluation === 'shortage'),
        lowest: dataWithFormattedFields.filter((item) => item.evaluation === 'shortage'),
        overflow: dataWithFormattedFields.filter((item) => item.evaluation === 'over'),
      })
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch inventory data.',
      })
      console.error('Error fetching inventory:', error)
    }
  }
  
  //Critical Grafik
  const prepareBarChartData1 = (data) => {
    // Ambil item sesuai dengan nilai itemNb
    const limitedData = data.slice(0, itemNb)
    console.log(limitedData)

    // Fungsi untuk memotong name jika melebihi MAX_NAME_LENGTH
    const formatName = (name) => {
      if (name.length > MAX_NAME_LENGTH) {
        return `${name.substring(0, 50)}...` // Potong name dan tambahkan ellipsis
      }
      return name
    }

    // Siapkan data dengan field yang diperbarui berdasarkan jenis kategori
    return limitedData.map((item) => ({
      name: item.name, // Terapkan formatName pada name
      stock: item.stock,
    }))
  }

  //Lowest & Overflow Grafik
  const prepareBarChartData2 = (data, type) => {
    // Ambil hanya 10 item pertama
    const limitedData = data.slice(0, 10)

    // Siapkan data dengan field yang diperbarui berdasarkan jenis kategori
    return limitedData.map((item) => ({
      MaterialNo: item.Material.materialNo,
      quantityActual: item.quantityActual,
      description: item.Material.description,
      maxStock: item.Material.maxStock,
      stockDifference:
        type === 'overflow'
          ? item.quantityActual - item.Material.maxStock // Untuk overflow, actual - maxStock
          : item.Material.minStock - item.quantityActual, // Untuk critical dan lowest, maxStock - actual
    }))
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>filter</CCardHeader>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <CFormCheck
              button={{ color: 'primary', variant: 'outline' }}
              type="radio"
              name="options-outlined"
              id="primary-outlined"
              autoComplete="off"
              label="Tertinggi"
              defaultChecked
            />
            <CFormCheck
              button={{ color: 'primary', variant: 'outline' }}
              type="radio"
              name="options-outlined"
              id="second-outlined"
              autoComplete="off"
              label="terendah"
            />
          </div>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Critical</CCardHeader>
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: { xs: 170, sm: 270, md: 370 }, // Menyesuaikan tinggi berdasarkan ukuran layar
                }}
              >
                <BarChart
                  dataset={prepareBarChartData1(inventoriescritical)}
                  series={[
                    {
                      dataKey: 'stock',
                      stack: 'Stock Difference',
                      label: 'Stock',
                      value: 'stock', // Ensure this matches the key in the dataset
                      type: 'bar',
                    },
                  ]}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'name',
                    },
                  ]}
                  yAxis={[{ type: 'number', min: 0, max: 2 }]} // Set min and max values
                  width={1400}
                  height={500}
                  barLabel="value"
                >
                  <ChartsReferenceLine
                    y={2}
                    label="2 Shift"
                    labelAlign="end"
                    lineStyle={{ stroke: 'red' }}
                  />
                  <ChartsXAxis />
                  <ChartsYAxis />
                </BarChart>
              </Box>
              <Typography id="input-item-number" gutterBottom>
                Number of items
              </Typography>
              <Slider
                value={itemNb}
                onChange={handleItemNbChange}
                valueLabelDisplay="auto"
                min={1}
                max={10}
                aria-labelledby="input-item-number"
              />
            </ThemeProvider>
            <DataTable
              value={inventories.critical || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="quantityActual" header="Stok Inv." style={{ width: '5%' }} sortable />
               <Column
              field="useByShift" // Kolom baru untuk use by shift
              header="Use By Shift"
              body={(rowData) => rowData.useByShift.toFixed(2)} // Format sebagai angka dengan dua desimal
              sortable
            />

              <Column
                field="evaluation"
                header="Penilaian"
                body={statusBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              />
            </DataTable>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Lowest</CCardHeader>
          {/* Grafik Lowest */}
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: { xs: 170, sm: 270, md: 370 }, // Menyesuaikan tinggi berdasarkan ukuran layar
                }}
              >
                <BarChart
                  dataset={prepareBarChartData2(inventories.overflow || [], 'overflow')}
                  series={tambahLabel([
                    {
                      dataKey: 'maxStock',
                      stack: 'maxStock',
                      label: 'maxStock',
                      value: 'maxStock', // Ensure this matches the key in the dataset
                      type: 'bar',
                    },
                  ])}
                  xAxis={[{ scaleType: 'band', dataKey: 'description' }]}
                  yAxis={[{ type: 'number', min: 0, max: 1 }]} // Set min and max values
                  width={1400}
                  height={500}
                  barLabel="value"
                >
                  <ChartsReferenceLine
                    y={1}
                    label="1 Shift"
                    labelAlign="end"
                    lineStyle={{ stroke: 'red' }}
                  />
                  <ChartsXAxis />
                  <ChartsYAxis />
                </BarChart>
              </Box>
              <Typography id="input-item-number" gutterBottom>
                Number of items
              </Typography>
              <Slider
                valueLabelDisplay="auto"
                min={1}
                max={10}
                aria-labelledby="input-item-number"
              />
            </ThemeProvider>
            <DataTable
              value={inventories.lowest || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column field="quantityActual" header="Stok Inv." style={{ width: '5%' }} sortable />
              <Column field="quantityActualCheck" header="SoH" sortable />
              <Column
                field="stockDifference" // Kolom baru untuk selisih stock
                header="Selisih Max Stock"
                body={(rowData) => rowData.stockDifference.toLocaleString()} // Format sebagai angka
                sortable
              />
             <Column
              field="useByShift" // Kolom baru untuk use by shift
              header="Use By Shift"
              body={(rowData) => (rowData.useByShift ? rowData.useByShift.toFixed(2) : 'N/A')} // Format sebagai angka dengan dua desimal
              sortable
            />
            </DataTable>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Overflow</CCardHeader>
          {/* Grafik Overflow */}
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: { xs: 170, sm: 270, md: 370 }, // Menyesuaikan tinggi berdasarkan ukuran layar
                }}
              >
                <BarChart
                  dataset={prepareBarChartData2(inventories.overflow || [], 'overflow')}
                  series={tambahLabel([
                    { dataKey: 'maxStock', stack: 'Stock Levels', color: 'orange' },
                  ])}
                  xAxis={[{ scaleType: 'band', dataKey: 'description' }]}
                  yAxis={[{ type: 'number', min: 0, max: 10 }]} // Set min and max values
                  width={1400}
                  height={500}
                  barLabel="value"
                >
                  <ChartsReferenceLine
                    y={5}
                    label="5 Shift"
                    labelAlign="end"
                    lineStyle={{ stroke: 'red' }}
                  />
                  <ChartsXAxis />
                  <ChartsYAxis />
                </BarChart>
              </Box>
              <Typography id="input-item-number" gutterBottom>
                Number of items
              </Typography>
              <Slider
                // value={itemNb}
                // onChange={handleItemNbChange}
                valueLabelDisplay="auto"
                min={1}
                max={10}
                aria-labelledby="input-item-number"
              />
            </ThemeProvider>
            <DataTable
              value={inventories.overflow || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column field="quantityActual" header="Stok Inv." style={{ width: '5%' }} sortable />
              <Column field="quantityActualCheck" header="SoH" sortable />
              <Column
                field="stockDifference" // Kolom baru untuk selisih stock
                header="Selisih Max Stock"
                body={(rowData) => rowData.stockDifference.toLocaleString()} // Format sebagai angka
                sortable
              />
              <Column
                field="evaluation"
                header="Penilaian"
                body={statusBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Dashboard
