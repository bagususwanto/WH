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
} from '@coreui/react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'

import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Modal, Button } from '@mui/material' // Importing Material-UI components
import useManageStockService from '../../services/ManageStockService'
import useDashboardService from '../../services/DashboardService'
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

const MAX_NAME_LENGTH = 10 // Maksimal karakter untuk label sumbu X

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const { getAllInventory } = useManageStockService() // Service
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const { getInventoryLowestStock } = useDashboardService() // Service
  const { getInventoryOverflowStock } = useDashboardService() // Service
  const [inventoriescritical, setInventoriesCritical] = useState([]) // Inventory data
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [isTableVisible, setIsTableVisible] = useState(false) // Toggle for table visibility
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const [inventories, setInventories] = useState([]) // Inventory data
  const [lowestItemNb, setLowestItemNb] = React.useState(8) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(8) //Item untuk slider over flow
  const [itemNb, setItemNb] = React.useState(8) //item untuk critical
  const [chartWidth, setChartWidth] = useState(window.innerWidth)
  const [order, setOrder] = useState('ASC')
  const [selectedChart, setSelectedChart] = useState('critical')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)


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

  const prepareChartData = (data, chartTitle, shiftLevel) => ({
    labels: data.map((item) => `${item.Material.materialNo}\n${item.Material.description}`),
    datasets: [
      {
        label: chartTitle,
        data: data.map((item) => item.stock),
        backgroundColor: 'skyblue',
      },
    ],
    shiftLevel, // Used to draw red line
  })

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
            size: 16,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          callback: function (value, index, ticks) {
            const item = data[index]
            const materialNo = item.Material.materialNo
            const description = item.Material.description

            return `${materialNo}`
          },
          maxRotation: 0, // Prevents diagonal rotation
          autoSkip: false, // Ensures labels are displayed without skipping
        },
        title: {
          display: true,
          text: 'Inventory Items',
          font: {
            size: 16,
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
            <div className="mb-1" style={{ display: 'flex', gap: '0.5rem' }}>
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
              <CDropdown className="ms-2">
                <CDropdownToggle color="secondary">Status</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => setSelectedChart('critical')}>
                    Critical
                  </CDropdownItem>
                  <CDropdownItem onClick={() => setSelectedChart('lowest')}>Low</CDropdownItem>
                  <CDropdownItem onClick={() => setSelectedChart('overflow')}>
                    Overflow
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CButton
                className="ms-2"
                color="secondary"
                onClick={() => setIsTableVisible(!isTableVisible)}
              >
                {isTableVisible ? 'Hide Table' : 'Show Table'}
              </CButton>
              <div style={{ marginLeft: 'auto' }}>
                <Link to="/dashboardall" style={{ textDecoration: 'none' }}>
                  <CButton color="primary" variant="outline">
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
            {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}
          </CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 3 }}>
              <Bar
                data={
                  selectedChart === 'critical'
                    ? prepareChartData(inventoriescritical, 'Critical Stock', 2)
                    : selectedChart === 'lowest'
                      ? prepareChartData(inventorieslowest, 'Low Stock', 1)
                      : prepareChartData(inventoriesoverflow, 'Overflow Stock', 5)
                }
                options={
                  selectedChart === 'critical'
                    ? chartOptions(inventoriescritical, 0, 2.2, 2)
                    : selectedChart === 'lowest'
                      ? chartOptions(inventorieslowest, 0, 1.1, 1)
                      : chartOptions(inventoriesoverflow, 0, 7, 5)
                }
                height={510}
              />
            </Box>
            {/* Modal for displaying selected data */}
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
                    <strong>Planning Incoming:</strong> {selectedData.Incomings[0].planning}{' '}
                    {selectedData.Material.uom}
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
                loading={loading}
                emptyMessage="Tidak ada data inventaris."
                size="small"
                scrollable
              >
                  <Column field="Material.materialNo" header="Material No" sortable />
                <Column field="Material.description" header="Description" sortable />
                <Column field="Material.uom" header="UoM" sortable />
                <Column field="Material.Supplier.supplierName" header="Supplier" sortable />
                <Column field="Material.maxStock" header="Max" sortable />
                <Column field="quantityActualCheck" header="Actual" sortable />
                <Column field="stock" header="Remain Stock" sortable />
                <Column
                  field="evaluation"
                  header="Evaluation"
                  body={statusBodyTemplate}
                  bodyStyle={{ textAlign: 'center' }}
                  sortable
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
