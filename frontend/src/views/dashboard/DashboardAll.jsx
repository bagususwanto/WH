import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CButtonGroup,
  CBadge,
} from '@coreui/react'
import useDashboardService from '../../services/DashboardService'
import useManageStockService from '../../services/ManageStockService'
import Select from 'react-select'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
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
import useMasterDataService from '../../services/MasterDataService'

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
const chartvalue = [
  { value: 'critical', label: 'Critical' },
  { value: 'lowest', label: 'Low' },
  { value: 'overflow', label: 'Overflow' },
]

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState('ASC')
  const [modalOpen, setModalOpen] = useState(false)
  const [itemNb, setItemNb] = React.useState(15) //item untuk critical
  const [lowestItemNb, setLowestItemNb] = React.useState(15) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(15) //Item untuk slider over flow
  const [inventories, setInventories] = useState([]) // Inventory data
  const [selectedData, setSelectedData] = useState(null)
  const [showTable, setShowTable] = useState(false) // State to control table visibility
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const { getInventoryLowestStock } = useDashboardService() // Service
  const { getInventoryOverflowStock } = useDashboardService() // Service
  const [inventoriesCritical, setInventoriesCritical] = useState([])
  const [selectedChart, setSelectedChart] = useState('critical')
  const [isTableVisible, setIsTableVisible] = useState(true) // Toggle for table visibility
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const { getAllInventory } = useManageStockService() // Service
  const [plant, setPlant] = useState([])
  const { getMasterData, getMasterDataById } = useMasterDataService()
  const [selectedPlant, setSelectedPlant] = useState({ value: 'all', label: 'All' })

  const apiPlant = 'plant-public'
  // Handle for ordering: ascending or descending
  const handleOrderChange = (event) => {
    setOrder(event.target.value)
  }

  useEffect(() => {
    // Set order based on the chart type
    const criticalOrder = 'ASC' // Always ASC for critical
    const overflowOrder = 'DESC' // Always DESC for overflow

    // Fetch all stock data at once with the appropriate order for each chart
    fetchInventoryCriticalStock(itemNb, criticalOrder, selectedPlant.value)
    fetchInventoryLowestStock(lowestItemNb, order, selectedPlant.value) // Use the current order for lowest stock
    fetchInventoryOverflowStock(overflowItemNb, overflowOrder, selectedPlant.value)
  }, [itemNb, lowestItemNb, overflowItemNb, order, selectedPlant])

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

  const getEvaluation = (rowData) => {
    const { quantityActualCheck, Material } = rowData
    const minStock = Material?.minStock
    const maxStock = Material?.maxStock

    if (quantityActualCheck < minStock) {
      return <Tag value="critical" severity={getSeverity('critical')} />
    }
    if (quantityActualCheck > maxStock) {
      return <Tag value="Over" severity={getSeverity('over')} />
    }
    return <Tag value="Ok" severity={getSeverity('ok')} />
  }

  const statusBodyTemplate = (rowData) => {
    const { quantityActualCheck, Material } = rowData
    const minStock = Material?.minStock
    const maxStock = Material?.maxStock

    // Tentukan status berdasarkan jumlah aktual
    let status = '' // Tidak ada status default
    if (quantityActualCheck < minStock) {
      status = 'critical' // Jika kurang dari minStock
    } else if (quantityActualCheck < 0.5 * minStock) {
      status = 'critical' // Jika lebih dari 50% di bawah minStock
    } else if (quantityActualCheck > maxStock) {
      status = 'over' // Jika lebih dari maxStock
    }

    // Hanya mengembalikan Tag jika status diatur
    if (status) {
      // Kembalikan Tag dengan latar belakang merah
      return (
        <Tag
          value={status.charAt(0).toUpperCase() + status.slice(1)} // Capitalize the first letter
          severity="danger" // Gunakan "danger" untuk merah (atau Anda bisa langsung gunakan backgroundColor)
          style={{ backgroundColor: 'red', color: 'white' }} // Set background merah dan teks putih
        />
      )
    }

    return null // Kembalikan null jika tidak ada status
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
  const prepareChartData = (data, color) => ({
    labels: data.map(
      (item) =>
        `${item.Material.materialNo}\n${item.Material.description}\n${item.Address_Rack.Storage.Plant.plantName}`,
    ),
    datasets: [
      {
        label: 'Stock Levels',
        data: data.map((item) => item.stock),
        backgroundColor: color,
      },
    ],
  })
  const fetchInventory = async () => {
    try {
      const response = await getAllInventory()
      const dataWithFormattedFields = response.data
        .map((item) => {
          const evaluation = item.quantityActual < item.Material.minStock ? 'critical' : 'ok' // Hanya tanda status 'critical' atau 'ok'

          const stockDifferencelowes = item.quantityActual / item.Material.minStock // Selisih antara quantityActual dan minStock
          const stockDifference = item.quantityActual / item.Material.maxStock // Selisih antara quantityActual dan maxStock
          const useByShift = (item.quantityActual / item.Material.minStock) * 2 || 0 // Gunakan nilai default jika undefined

          return {
            ...item,
            evaluation,
            stockDifferencelowes,
            stockDifference,
            useByShift, // Pastikan selalu ada nilai untuk useByShift
          }
        })
        .filter((item) => {
          // Pastikan hanya item dengan evaluation 'critical' yang diambil
          return (
            item.evaluation === 'critical' &&
            item.quantityActual != null &&
            item.Material.maxStock != null &&
            item.quantityActual !== '' &&
            item.Material.maxStock !== ''
          )
        })

      // Set data hanya dengan status 'critical'
      setInventories({
        critical: dataWithFormattedFields, // Hanya status 'critical' yang disimpan
      })
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }
  const updateURL = () => {
    // Update the URL to include the current timestamp
    const timestamp = new Date().getTime()
    navigate(`/dashboardall?timestamp=${timestamp}`, { replace: true })
  }

  const chartOptions = (data, minValue, maxValue, referenceLineValue, isMaxStock) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: minValue,
        max: maxValue,

        title: {
          display: true,
          text: 'Stock Shift',
          color: 'black', // Set color to black
        },
      },
      x: {
        ticks: {
          font: {
            size: 9,
          },
          callback: function (value, index, ticks) {
            const item = data[index]
            const materialNo = item.Material.materialNo
            const description = item.Material.description

            return `${description.substring(0, 16)}..`
          },
          maxRotation: 0, // Prevents diagonal rotation
          autoSkip: false, // Ensures labels are displayed without skipping
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataIndex = tooltipItem.dataIndex
            const item = dataIndex !== undefined ? data[dataIndex] : null
            return item ? `Stock: ${tooltipItem.raw.toLocaleString()}` : ''
          },
        },
        titleFont: {
          size: 17, // Ukuran font untuk judul tooltip
          weight: 'bold', // Ketebalan font untuk judul tooltip
          family: 'Arial', // Jenis font untuk judul tooltip (ganti sesuai kebutuhan)
        },
        bodyFont: {
          size: 14, // Ukuran font untuk isi tooltip
          weight: 'normal', // Ketebalan font untuk isi tooltip
          family: 'Arial', // Jenis font untuk isi tooltip (ganti sesuai kebutuhan)
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
          criticalStockLine: {
            type: 'line',
            yMin: referenceLineValue,
            yMax: referenceLineValue,
            borderColor: 'red', // Color for critical stock
            borderWidth: 2,
            label: {
              display: true,
              content: `Max Stock: ${referenceLineValue} Shift`, // Keep your label here
              position: 'end',
              yAdjust: -7,
              color: 'white',
            },
          },
          overflowStockLine: {
            type: 'line',
            yMin: 5, // Adjust as needed
            yMax: 5,
            borderColor: 'orange', // Color for overflow stock
            borderWidth: 2,
            label: {
              display: true,
              content: `Min Stock: 5 Shift`, // Keep your label here
              position: 'end',
              yAdjust: -7,
              color: 'white',
            },
          },
        },
      },
    },
  })

  const toggleTableVisibility = () => {
    setShowTable((prev) => !prev)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-2">
          <CCardHeader>Filter Dashboard</CCardHeader>
          <CCardBody>
            <div
              className="mb-1"
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                justifyContent: 'space-between', // Make sure items are spaced out
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Radio Buttons */}
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

                {/* Plant Selection */}
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  options={plantOptions} // plantOptions termasuk "All"
                  value={selectedPlant} // Menetapkan state sebagai value yang dipilih
                  id="plant"
                  onChange={handlePlantChange} // Event handler saat memilih plant
                />

                {/* Toggle Table Visibility Button */}
                <CButton
                  className="ms-2"
                  color="secondary"
                  onClick={() => setIsTableVisible(!isTableVisible)}
                >
                  {isTableVisible ? 'Hide Table' : 'Show Table'}
                </CButton>
              </div>

              {/* Badge Section - Positioned at the right */}
              {(inventorieslowest.length > 0 || inventoriesoverflow.length > 0) && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Incoming Item (Green Badge) */}
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

                  {/* Not Yet Incoming (Red Badge) */}
                  <CCol xs="auto">
                    <div
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>Not Yet Incoming</div>
                    </div>
                  </CCol>
                </div>
              )}
            </div>
          </CCardBody>
        </CCard>

        <CCard className="mb-1">
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
                <CBadge color="primary">Critical Stock</CBadge>
              </h5>
            </div>
          </CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
              <Bar
                data={prepareChartData(inventoriesCritical, 'salmon', 2)}
                options={{
                  ...chartOptions(inventoriesCritical, 0, 2.8, 2.5, false),
                  onClick: (evt, activeElements) => {
                    if (activeElements.length > 0) {
                      const index = activeElements[0].index
                      const selectedItem = inventoriesCritical[index]
                      setSelectedData(selectedItem)
                      setModalOpen(true)
                    }
                  },
                }}
                height={260}
              />
            </Box>

            {/* Modal for displaying selected data */}
            <CModal
              visible={modalOpen}
              onClose={handleCloseModal}
              alignment="center"
              backdropClassName="custom-modal-backdrop"
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
                    <strong>Incoming:</strong> {selectedData.Incomings}
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
                value={inventoriesCritical}
                tableStyle={{ minWidth: '40rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                emptyMessage="No inventory data available."
                size="small"
                scrollable
              >
                {/* Kolom DataTable */}
                <Column
                  field="Material.materialNo"
                  header="Material No"
                  sortable
                  style={{ padding: '5px' }}
                />
                <Column
                  field="Material.description"
                  header="Description"
                  style={{ padding: '5px' }}
                />
                <Column field="Material.uom" header="UoM" style={{ padding: '5px' }} />
                <Column
                  field="Material.Supplier.supplierName"
                  header="Supplier"
                  style={{ padding: '5px' }}
                />
                <Column field="Material.minStock" header="Min" style={{ padding: '5px' }} />
                <Column
                  field="quantityActualCheck"
                  header="Actual"
                  sortable
                  style={{ padding: '5px' }}
                />
                <Column field="stock" header="Remain Stock" style={{ padding: '5px' }} />
                <Column field="" header="Incom Date" style={{ padding: '5px' }} />
                <Column field="" header="Qty Incom" style={{ padding: '5px' }} />
                <Column field="" header="Estimation" style={{ padding: '5px' }} />
                <Column
                  field="evaluation"
                  header="Evaluation"
                  body={statusBodyTemplate}
                  bodyStyle={{ textAlign: 'center', padding: '1px' }}
                  sortable
                />
              </DataTable>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-1">
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
                <CBadge color="primary">Overflow Stock</CBadge>
              </h5>
            </div>
          </CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
              <Bar
                data={prepareChartData(inventoriesoverflow, 'lightcoral', 5)}
                options={{
                  ...chartOptions(inventoriesoverflow, 0, 6, 5, true), // isMaxStock = true
                  onClick: (evt, activeElements) => {
                    if (activeElements.length > 0) {
                      const index = activeElements[0].index
                      const selectedItem = inventoriesoverflow[index]
                      setSelectedData(selectedItem)
                      setModalOpen(true)
                    }
                  },
                }}
                height={280}
              />
            </Box>

            {/* Modal for displaying selected data */}
            <CModal visible={modalOpen} onClose={handleCloseModal} alignment="center">
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
                value={inventoriesoverflow}
                tableStyle={{ minWidth: '30rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                emptyMessage="No inventory data available."
                size="small"
                scrollable
              >
                {/* Kolom DataTable */}
                <Column
                  field="Material.materialNo"
                  header="Material No"
                  sortable
                  style={{ padding: '5px' }}
                />
                <Column
                  field="Material.description"
                  header="Description"
                  style={{ padding: '5px' }}
                />
                <Column field="Material.uom" header="UoM" style={{ padding: '5px' }} />
                <Column
                  field="Material.Supplier.supplierName"
                  header="Supplier"
                  style={{ padding: '5px' }}
                />
                <Column field="Material.maxStock" header="Max" style={{ padding: '5px' }} />
                <Column field="quantityActualCheck" header="Actual" style={{ padding: '5px' }} />
                <Column field="stock" header="Remain Stock" style={{ padding: '5px' }} />
                <Column field="" header="Incom Date" style={{ padding: '5px' }} />
                <Column field="" header="Qty Incom" style={{ padding: '5px' }} />
                <Column field="" header="Estimation" style={{ padding: '5px' }} />
                <Column
                  field="evaluation"
                  header="Evaluation"
                  body={statusBodyTemplate}
                  bodyStyle={{ textAlign: 'center' }}
                  style={{ padding: '5px' }}
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
