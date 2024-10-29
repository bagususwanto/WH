import React, { useState, useEffect } from 'react'

import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormCheck,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
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
  const { getAllInventory } = useManageStockService() // Service
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const { getInventoryLowestStock } = useDashboardService() // Service
  const { getInventoryOverflowStock } = useDashboardService() // Service
  const [inventoriescritical, setInventoriesCritical] = useState([]) // Inventory data
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const [inventories, setInventories] = useState([]) // Inventory data
  const [lowestItemNb, setLowestItemNb] = React.useState(8) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(8) //Item untuk slider over flow
  const [itemNb, setItemNb] = React.useState(8) //item untuk critical
  const [chartWidth, setChartWidth] = useState(window.innerWidth)
  const [order, setOrder] = useState('DESC')
  const [selectedChart, setSelectedChart] = useState('critical')

  //Handle change Desc,Asc
  const handleOrderChange = (event) => {
    setOrder(event.target.value)
  }

  //Size Window
  useEffect(() => {
    const handleResize = () => setChartWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchInventory()
    fetchInventoryCriticalStock(itemNb, order)
    fetchInventoryLowestStock(lowestItemNb, order)
    fetchInventoryOverflowStock(overflowItemNb, order)
    setLoading(false)
  }, [itemNb, lowestItemNb, overflowItemNb, order])

  //Handle untuk Critical
  const handleItemNbChange = (event, newValue) => {
    if (typeof newValue === 'number') {
      setItemNb(newValue)
    }
  }
  //Handle untuk lowest
  const handlelowestItemNbChange = (event, newValue) => {
    if (typeof newValue === 'number') {
      setLowestItemNb(newValue)
    }
  }
  //handle untuk overflow
  const handleoverflowItemNbChange = (event, newValue) => {
    if (typeof newValue === 'number') {
      setOverflowItemNb(newValue)
    }
  }

  const fetchInventoryCriticalStock = async (itemNb, order) => {
    try {
      const response = await getInventoryCriticalStock(itemNb, order)
      // console.log(response.data)
      setInventoriesCritical(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchInventoryLowestStock = async (lowestItemNb, order) => {
    try {
      const response = await getInventoryLowestStock(lowestItemNb, order)
      setInventoriesLowest(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchInventoryOverflowStock = async (overflowItemNb, order) => {
    try {
      const response = await getInventoryOverflowStock(overflowItemNb, order)
      // console.log(response.data)
      setInventoriesOverflow(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getSeverity = (status) => {
    switch (status) {
      case 'critical':
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
      return <Tag value="Low" severity={getSeverity('critical')} />
    if (quantityActualCheck > maxStock) return <Tag value="Over" severity={getSeverity('over')} />
    return <Tag value="ok" severity={getSeverity('ok')} />
  }

  const fetchInventory = async () => {
    try {
      const response = await getAllInventory()
      const dataWithFormattedFields = response.data
        .map((item) => {
          const evaluation =
            item.quantityActual < item.Material.minStock
              ? 'critical'
              : item.quantityActual > item.Material.maxStock
                ? 'over'
                : 'ok'

          const stockDifferencelowes = item.quantityActual / item.Material.minStock // Selisih antara quantityActual dan maxStock
          const stockDifference = item.quantityActual / item.Material.maxStock // Selisih antara quantityActual dan maxStock
          const useByShift = (item.quantityActual / item.Material.minStock) * 2 || 0 // Use default value if undefined

          return {
            ...item,
            evaluation,
            stockDifferencelowes,
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
        critical: dataWithFormattedFields.filter((item) => item.evaluation === 'critical'),
        lowest: dataWithFormattedFields.filter((item) => item.evaluation === 'critical'),
        overflow: dataWithFormattedFields.filter((item) => item.evaluation === 'over'),
      })
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  //Critical Grafik
  const prepareBarChartData1 = (data) => {
    // Ambil item sesuai dengan nilai itemNb
    const limitedData = data.slice(0, itemNb)

    // Fungsi untuk memotong name jika melebihi MAX_NAME_LENGTH

    // Siapkan data dengan field yang diperbarui berdasarkan jenis kategori
    return limitedData.map((item) => ({
      name: item.name, // Terapkan formatName pada name
      stock: item.stock,
    }))
  }

  
  //Critical Grafik

  return (
    <CRow>
      <CCol>
        <div className="mb-3" style={{ display: 'flex', gap: '0.5rem' }}>
          <CFormCheck
            button={{ color: 'primary', variant: 'outline' }}
            type="radio"
            name="options-outlined"
            id="primary-outlined"
            autoComplete="off"
            label="Lowest"
            value="ASC"
            checked={order === 'ASC'}
            onChange={handleOrderChange}
          />
          <CFormCheck
            button={{ color: 'primary', variant: 'outline' }}
            type="radio"
            name="options-outlined"
            id="second-outlined"
            autoComplete="off"
            label="Highest"
            value="DESC"
            checked={order === 'DESC'}
            onChange={handleOrderChange}
          />
          <CDropdown className="ml-auto">
            <CDropdownToggle color="secondary">Status</CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => setSelectedChart('critical')}>Critical</CDropdownItem>
              <CDropdownItem onClick={() => setSelectedChart('lowest')}>Low</CDropdownItem>
              <CDropdownItem onClick={() => setSelectedChart('overflow')}>Overflow</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>

        {/* Single Card for Conditional Rendering */}
        <CCard className="mb-4">
          <CCardHeader>
            {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}
          </CCardHeader>
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: { xs: 180, sm: 280, md: 380 },
                  marginBottom: '3rem', // Add margin-bottom to create space below the chart
                  marginTop: '3rem', // Add margin-bottom to create space below the chart
                }}
              >
                {selectedChart === 'critical' && (
                  <BarChart
                    dataset={prepareBarChartData1(inventoriescritical)}
                    series={[
                      {
                        dataKey: 'stock',
                        stack: 'Stock Difference',
                        label: 'Critical Stock',
                        value: 'stock',
                        type: 'bar',
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: 'band',
                        dataKey: 'name',
                        valueFormatter: (value, context) =>
                          context.location === 'tooltip'
                            ? inventoriescritical.find((item) => item.name === value)?.Material
                                ?.description || value
                            : value,
                        categoryGapRatio: 0.2, // Gap between categories
                        barGapRatio: 0, // Gap between bars in the same category
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        type: 'number',
                        min: 0,
                        max: 2,
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
                    width={1400}
                    height={460}
                    barLabel="value"
                  >
                    <ChartsReferenceLine
                      y={2}
                      label="2 Shift"
                      labelAlign="end"
                      lineStyle={{ stroke: 'red' }}
                    />
                    <ChartsXAxis sx={{ fontSize: '22px' }} />
                    <ChartsYAxis sx={{ fontSize: '22px' }} />
                  </BarChart>
                )}
                {selectedChart === 'lowest' && (
                  <BarChart
                    dataset={prepareBarChartData1(inventorieslowest)}
                    series={[
                      {
                        dataKey: 'stock',
                        stack: 'Stock Difference',
                        label: 'Low Stock',
                        value: 'stock',
                        type: 'bar',
                        color: 'skyblue',
                        showLabel: true, // Ensures the label is visible
                        labelStyle: {
                          position: 'top', // Position label above the bar
                          fontSize: '14px',
                          fontWeight: 'bold',
                        },
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: 'band',
                        dataKey: 'name',
                        valueFormatter: (value, context) =>
                          context.location === 'tooltip'
                            ? inventorieslowest.find((item) => item.name === value)?.Material
                                ?.description || value
                            : value,
                        categoryGapRatio: 0.2, // Gap between categories
                        barGapRatio: 0, // Gap between bars in the same category
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        type: 'number',
                        min: 0,
                        max: 1,
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
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
                    <ChartsXAxis sx={{ fontSize: '22px' }} />
                    <ChartsYAxis sx={{ fontSize: '22px' }} />
                  </BarChart>
                )}
                {selectedChart === 'overflow' && (
                  <BarChart
                    dataset={prepareBarChartData1(inventoriesoverflow)}
                    series={[
                      {
                        dataKey: 'stock',
                        stack: 'Stock Difference',
                        label: 'Overflow Stock',
                        value: 'stock',
                        type: 'bar',
                        color: 'lightblue',
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: 'band',
                        dataKey: 'name',
                        valueFormatter: (value, context) =>
                          context.location === 'tooltip'
                            ? inventoriesoverflow.find((item) => item.name === value)?.Material
                                ?.description || value
                            : value,
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        type: 'number',
                        min: 0,
                        max: 7,
                        tick: {
                          sx: {
                            fontSize: '20px',
                          },
                        },
                      },
                    ]}
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
                    <ChartsXAxis sx={{ fontSize: '22px' }} />
                    <ChartsYAxis sx={{ fontSize: '22px' }} />
                  </BarChart>
                )}
              </Box>
            </ThemeProvider>

            <DataTable
              value={
                selectedChart === 'critical'
                  ? inventoriescritical
                  : selectedChart === 'lowest'
                    ? inventorieslowest
                    : selectedChart === 'overflow'
                      ? inventoriesoverflow
                      : []
              }
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              // dataKey="id"
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
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column
                field="quantityActualCheck"
                header="Actual"
                style={{ width: '5%' }}
                sortable
              />
              <Column
                field="stock" // Kolom baru untuk use by shift
                header="Remain Stock"
                sortable
              />
              <Column
                field="evaluation"
                header="Evaluation"
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
