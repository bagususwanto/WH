import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CButtonGroup,
  CBadge,
  CFormLabel,
  CFormSelect,
} from '@coreui/react'
import Select from 'react-select'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'

import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Modal, Button } from '@mui/material' // Importing Material-UI components
import useManageStockService from '../../services/ManageStockService'
import useDashboardService from '../../services/DashboardService'
import useMasterDataService from '../../services/MasterDataService'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Tag } from 'primereact/tag'
import { Box } from '@mui/material'
import annotationPlugin from 'chartjs-plugin-annotation'
import ChartDataLabels from 'chartjs-plugin-datalabels'
//import '../../scss/customchart.scss'
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels,
)

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
const chartvalue = [
  { value: 'critical', label: 'Critical' },
  { value: 'lowest', label: 'Low' },
  { value: 'overflow', label: 'Overflow' },
]

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const { getAllInventory } = useManageStockService() // Service
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const { getInventoryLowestStock } = useDashboardService() // Service
  const { getInventoryOverflowStock } = useDashboardService() // Service
  const [inventoriescritical, setInventoriesCritical] = useState([]) // Inventory data
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [isTableVisible, setIsTableVisible] = useState(true) // Toggle for table visibility
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const [inventories, setInventories] = useState([]) // Inventory data
  const [lowestItemNb, setLowestItemNb] = React.useState(12) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(12) //Item untuk slider over flow
  const [itemNb, setItemNb] = React.useState(12) //item untuk critical
  const [chartWidth, setChartWidth] = useState(window.innerWidth)
  const [order, setOrder] = useState('ASC')
  const [selectedChart, setSelectedChart] = useState('critical')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState({ value: 'all', label: 'All' })

  const [plant, setPlant] = useState([])
  const { getMasterData, getMasterDataById } = useMasterDataService()

  const apiPlant = 'plant-public'

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
    // Set default order based on selected chart
    if (selectedChart === 'overflow') {
      setOrder('DESC') // Overflow should be sorted highest
    } else if (selectedChart === 'lowest,') {
      setOrder('ASC') // Lowest should be sorted lowest
    }
    fetchInventoryCriticalStock(itemNb, order, selectedPlant.value)
    fetchInventoryLowestStock(lowestItemNb, order, selectedPlant.value)
    fetchInventoryOverflowStock(overflowItemNb, order, selectedPlant.value)
  }, [selectedChart, itemNb, lowestItemNb, overflowItemNb, order, selectedPlant])

  // useEffect(() => {
  //   getWarehouse() // Fetch products on mount
  // }, []) // Empty dependency array ensures it only runs once

  const fetchInventoryCriticalStock = async (itemNb, order, id) => {
    try {
      const response = await getInventoryCriticalStock(itemNb, order, id)
      if (response.data && response.data.length > 0) {
        setInventoriesCritical(response.data)
      } else {
        setInventoriesCritical([]) // Set empty data if no results
      }
    } catch (error) {
      console.error('Error fetching critical stock data:', error)
      setInventoriesCritical([]) // Set empty data on error
    }
  }
  // Function to fetch lowest stock data and handle empty data
  const fetchInventoryLowestStock = async (lowestItemNb, order, id) => {
    try {
      const response = await getInventoryLowestStock(lowestItemNb, order, id)
      if (response.data && response.data.length > 0) {
        setInventoriesLowest(response.data)
      } else {
        setInventoriesLowest([]) // Set empty data if no results
      }
    } catch (error) {
      console.error('Error fetching lowest stock data:', error)
      setInventoriesLowest([]) // Set empty data on error
    }
  }

  // Function to fetch overflow stock data and handle empty data
  const fetchInventoryOverflowStock = async (overflowItemNb, order, id) => {
    try {
      const response = await getInventoryOverflowStock(overflowItemNb, order, id)
      if (response.data && response.data.length > 0) {
        setInventoriesOverflow(response.data)
      } else {
        setInventoriesOverflow([]) // Set empty data if no results
      }
    } catch (error) {
      console.error('Error fetching overflow stock data:', error)
      setInventoriesOverflow([]) // Set empty data on error
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

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant) // Ambil data dari API
      setPlant(response.data)
    } catch (error) {
      console.error('Error fetching plant data:', error)
      MySwal.fire('Error', 'Failed to load plant data.', 'error')
    }
  }

  useEffect(() => {
    getPlant()
  }, [])

  const handlePlantChange = (selectedPlant) => {
    if (selectedPlant && selectedPlant.value !== 'all' && selectedPlant.value !== '') {
      setSelectedPlant(selectedPlant)
      // Fetch data based on selected plant
      fetchInventoryCriticalStock(itemNb, order, selectedPlant.value)
      fetchInventoryLowestStock(lowestItemNb, order, selectedPlant.value)
      fetchInventoryOverflowStock(overflowItemNb, order, selectedPlant.value)
    } else {
      setSelectedPlant({ value: 'all', label: 'All' })
      // Fetch default data for 'All'
      fetchInventoryCriticalStock(itemNb, order, 'all')
      fetchInventoryLowestStock(lowestItemNb, order, 'all')
      fetchInventoryOverflowStock(overflowItemNb, order, 'all')
    }
  }

  const plantOptions = [
    { value: 'all', label: 'All' }, // Menambahkan opsi "All" di awal
    ...plant.map((plant) => ({
      value: plant.id,
      label: plant.plantName,
    })),
  ]

  const prepareChartData = (data, chartTitle, shiftLevel) => {
    return {
      labels: data.map(
        (item) =>
          `${item.Material.materialNo}\n${item.Material.description}\n${item.Address_Rack.Storage.Plant.plantName}`,
      ),
      datasets: [
        {
          label: chartTitle,
          data: data.map((item) => item.stock),
          backgroundColor: data.map((item) => {
            // Check incoming value
            if (item.Incomings && item.Incomings.length > 0 && item.Incomings[0].planning > 0) {
              // If incoming is filled (>= 1)
              return 'forestgreen' // Change to red for incoming >= 1
            }

            // Apply color based on chart type
            switch (chartTitle) {
              case 'Critical Stock':
                return 'salmon' // Critical -> skyblue
              case 'Low Stock':
                return 'lightcoral' // Lowest -> blue
              case 'Overflow Stock':
                return 'indianred' // Overflow -> darkblue
              default:
                return 'gray' // Default color
            }
          }),
        },
      ],
      shiftLevel, // Used to draw red line
    }
  }
  const handleChartChange = (selectedOption) => {
    setSelectedChart(selectedOption.value) // Update selected chart based on user's choice
  }

  const chartOptions = (data, minValue, maxValue, referenceLineValue) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: minValue,
        max: maxValue,
        ticks: {
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: 'Stock Levels',
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 9, // Ukuran font
            weight: 'bold', // Menjadikan font bold
          },
          callback: function (value, index, ticks) {
            const item = data[index]

            const materialNo = item.Material.materialNo
            const plantName = item.Address_Rack.Storage.Plant.plantName
            const description = item.Material.description

            // Ambil hanya 10 karakter pertama dari description
            return `${description.substring(0, 19)}..`
          },
          maxRotation: 0, // Mencegah rotasi diagonal
          autoSkip: false, // Pastikan label ditampilkan tanpa di-skip
        },
        title: {
          display: true,
          text: 'Inventory Items',
          font: {
            size: 11,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataIndex = tooltipItem.dataIndex
            const item = dataIndex !== undefined ? data[dataIndex] : null
            return item ? `Stock: ${tooltipItem.raw.toLocaleString()}` : ''
          },
        },
      },
      datalabels: {
        display: true,
        // For the top label
        color: 'black', // Color of the label text for top label
        anchor: 'end', // Anchor position of the label
        align: 'top', // Align the label on top of the bar
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: (value, context) => {
          // Display "Remain Stock" for the top label
          return context.dataset.label === 'Remain Stock' ? value.toLocaleString() : ''
        },
        // Second label configuration
        backgroundColor: 'white', // Background color for better visibility
        borderRadius: 4, // Optional: rounded corners
        padding: 4, // Optional: padding around the label
        // Using this configuration to create another label for "Actual Stock"
        label: {
          display: true,
          color: 'black', // Color of the label text for bottom label
          anchor: 'end', // Anchor position for the bottom label
          align: 'bottom', // Align the label at the bottom of the bar
          font: {
            size: 15,
            weight: 'bold',
          },
          formatter: (value, context) => {
            // Display "Actual Stock" for the bottom label
            return context.dataset.label === 'Actual Stock' ? value.toLocaleString() : ''
          },
        },

        formatter: (value) => value.toLocaleString(), // Format the label value
        background: {
          color: 'yellow', // Background color of the label
          padding: 6, // Padding around the label
          borderRadius: 4, // Rounded corners for the background
          // Optionally you can add a shadow or other styles
        },
        // Optional: Add an offset if needed to move the label up or down
        offset: 10, // Adjust this to move the label away from the bar
      },
      annotation: {
        annotations: {
          line: {
            type: 'line',
            yMin: referenceLineValue,
            yMax: referenceLineValue,
            borderColor: 'orange',
            borderWidth: 2,
            label: {
              display: true,
              content:
                selectedChart === 'overflow'
                  ? `Max Stock: ${referenceLineValue} Shift`
                  : `Min Stock: ${referenceLineValue} Shift`,
              position: 'end',
              yAdjust: -7,
              color: 'white',
            },
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index
        if (index >= 0 && index < data.length) {
          // Ensure index is valid
          const dataItem = data[index]
          setSelectedData(dataItem)
          setModalOpen(true)
        }
      } else {
        console.log('No elements clicked on the chart.')
      }
    },
  })
  //Critical Grafik

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-2">
          <CCardHeader>Filter Dashboard</CCardHeader>
          <CCardBody>
            <div className="mb-1" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CButtonGroup>
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
              </CButtonGroup>

              <Select
                className="basic-single"
                classNamePrefix="select"
                isClearable
                options={plantOptions} // plantOptions termasuk "All"
                value={selectedPlant} // Menetapkan state sebagai value yang dipilih
                id="plant"
                onChange={handlePlantChange} // Event handler saat memilih plant
              />

              <Select
                className="basic-single"
                classNamePrefix="select"
                options={chartvalue} // Pass the chart options
                value={chartvalue.find((option) => option.value === selectedChart)} // Set selected value based on selectedChart
                onChange={handleChartChange} // Handle chart type change
                isClearable={false} // Make it non-clearable
                placeholder="Select Status" // Placeholder text
              />
              <CButton
                className="ms-2"
                color="secondary"
                onClick={() => setIsTableVisible(!isTableVisible)}
              >
                {isTableVisible ? 'Hide Table' : 'Show Table'}
              </CButton>

              {/* Adding the green and red boxes with labels */}

              <div style={{ marginLeft: 'auto' }}>
                <Link to="/dashboardall" style={{ textDecoration: 'none' }}>
                  <CButton color="black" variant="outline">
                    ALWAYS DISPLAY
                  </CButton>
                </Link>
              </div>
            </div>
          </CCardBody>
        </CCard>

        {/* Single Card for Conditional Rendering */}
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center w-100">
              {/* Left Side: Displaying selected plant */}
              <div className="d-flex align-items-center">
                <div className="fw-bold fs-6 me-1">Plant:</div>
                <div className="fw-bold fs-6 me-3">
                  {selectedPlant ? selectedPlant.label : 'All'}
                </div>{' '}
                {/* Display selected plant label */}
              </div>

              <h5>
                <CBadge color="primary">
                  {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}
                </CBadge>
              </h5>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow
              className="ms-5"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              {/* Show the Incoming and Not Yet Incoming badges only if relevant data is available */}
              {(inventoriescritical.length > 0 ||
                inventorieslowest.length > 0 ||
                inventoriesoverflow.length > 0) && (
                <>
                  {/* Incoming Item (Green) */}
                  <CCol xs="auto">
                    <div
                      style={{
                        backgroundColor: 'green',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>Incoming</div>
                    </div>
                  </CCol>

                  {/* Not Yet Incoming (Red) */}
                  <CCol xs="auto">
                    <div
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1px',
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>Not Yet Incoming</div>
                    </div>
                  </CCol>
                </>
              )}
            </CRow>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 3 }}>
              {/* Display message when no data is available */}
              {selectedChart === 'critical' && inventoriescritical.length === 0 && (
                <div>No data available for the selected plant in Critical Stock.</div>
              )}
              {selectedChart === 'lowest' && inventorieslowest.length === 0 && (
                <div>No data available for the selected plant in Low Stock.</div>
              )}
              {selectedChart === 'overflow' && inventoriesoverflow.length === 0 && (
                <div>No data available for the selected plant in Overflow Stock.</div>
              )}

              {/* Render Bar chart only if data exists */}
              {selectedChart === 'critical' && inventoriescritical.length > 0 && (
                <Bar
                  data={prepareChartData(inventoriescritical, 'Critical Stock', 2)}
                  options={chartOptions(inventoriescritical, 0, 2.7, 2.5)}
                  height={410}
                />
              )}

              {selectedChart === 'lowest' && inventorieslowest.length > 0 && (
                <Bar
                  data={prepareChartData(inventorieslowest, 'Low Stock', 1)}
                  options={chartOptions(inventorieslowest, 0, 1.1, 1)}
                  height={410}
                />
              )}

              {selectedChart === 'overflow' && inventoriesoverflow.length > 0 && (
                <Bar
                  data={prepareChartData(inventoriesoverflow, 'Overflow Stock', 5)}
                  options={chartOptions(inventoriesoverflow, 0, 7, 5)}
                  height={410}
                />
              )}
            </Box>

            <CModal
              visible={modalOpen}
              onClose={handleCloseModal}
              alignment="center" // This aligns the modal in the center of the screen
            >
              <CModalHeader>
                <CModalTitle>Detail Information</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedData && (
                  <>
                    <p>
                      <strong>Plant:</strong> {selectedData.Address_Rack.Storage.Plant.plantName}
                    </p>
                    <p>
                      <strong>Material Number:</strong> {selectedData.Material.materialNo}
                    </p>
                    <p>
                      <strong>Description:</strong> {selectedData.Material.description}
                    </p>
                    <p>
                      <strong>Supplier:</strong> {selectedData.Material.Supplier.supplierName}
                    </p>
                    <p>
                      <strong>Stock Actual:</strong> {selectedData.quantityActualCheck}{' '}
                      {selectedData.Material.uom}
                    </p>
                    <p>
                      <strong>Planning Incoming:</strong>{' '}
                      {selectedData.Incomings.length > 0 ? selectedData.Incomings[0].planning : 0}
                      {' '} {selectedData.Material.uom}
                    </p>
                  </>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={handleCloseModal}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>
            {isTableVisible && (
              <DataTable
                value={
                  selectedChart === 'critical'
                    ? inventoriescritical
                    : selectedChart === 'lowest'
                      ? inventorieslowest
                      : inventoriesoverflow
                }
                tableStyle={{ minWidth: '30rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                emptyMessage="Tidak ada data inventaris."
                size="small"
                scrollable
              >
                <Column field="Material.materialNo" header="Material No"sortable  />
                <Column field="Material.description" header="Description"  />
                <Column field="Material.uom" header="UoM"  />
                <Column field="Material.Supplier.supplierName" header="Supplier"  />
           

                {/* Conditional rendering of minStock/maxStock based on selected chart */}
                {selectedChart === 'critical' || selectedChart === 'lowest' ? (
                  <Column field="Material.minStock" header="Min"  />
                ) : selectedChart === 'overflow' ? (
                  <Column field="Material.maxStock" header="Max"  />
                ) : null}

                <Column field="quantityActualCheck" header="Actual"  />
                <Column field="stock" header="Remain Stock" sortable />
                <Column field="" header="Incom Date"  />
                <Column field="" header="Qty Incom"  />
                <Column field="" header="Estimation"  />
                <Column
                  field="evaluation"
                  header="Evaluation"
                  body={statusBodyTemplate}
                  bodyStyle={{ textAlign: 'center' }}
                  
                />
              </DataTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Dashboard
