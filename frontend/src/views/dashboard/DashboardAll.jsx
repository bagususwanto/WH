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
} from '@coreui/react'
import useDashboardService from '../../services/DashboardService'
import useManageStockService from '../../services/ManageStockService'
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

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState('ASC')
  const [modalOpen, setModalOpen] = useState(false)
  const [itemNb, setItemNb] = React.useState(8) //item untuk critical
  const [lowestItemNb, setLowestItemNb] = React.useState(8) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(8) //Item untuk slider over flow
  const [inventories, setInventories] = useState([]) // Inventory data
  const [selectedData, setSelectedData] = useState(null)
  const [showTable, setShowTable] = useState(false) // State to control table visibility
  const { getInventoryCriticalStock } = useDashboardService() // Service
  const { getInventoryLowestStock } = useDashboardService() // Service
  const { getInventoryOverflowStock } = useDashboardService() // Service
  const [inventoriesCritical, setInventoriesCritical] = useState([])
  const [selectedChart, setSelectedChart] = useState('critical')
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const { getAllInventory } = useManageStockService() // Service
  // Handle for ordering: ascending or descending
  const handleOrderChange = (event) => {
    setOrder(event.target.value)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData()
      updateURL() // Call to update the URL
    }, 40000) // Fetch data every 25 seconds
    return () => clearInterval(interval) // Cleanup on unmount
  }, [order, itemNb, lowestItemNb, overflowItemNb]) // Dependencies

  const fetchData = async () => {
    setLoading(true);
    try {
      // Determine sorting order based on the current order state
      const criticalOrder = order === 'ASC' ? 'ASC' : 'DESC';
      const overflowOrder = order === 'ASC' ? 'DESC' : 'ASC';
  
      await Promise.all([
        fetchInventoryCriticalStock(itemNb, criticalOrder),
        fetchInventoryLowestStock(lowestItemNb, order),
        fetchInventoryOverflowStock(overflowItemNb, overflowOrder),
        fetchInventory(),
      ]);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryCriticalStock = async (itemNb, order) => {
    try {
      const response = await getInventoryCriticalStock(itemNb, order)
      setInventoriesCritical(response.data)
    } catch (error) {
      console.error('Error fetching critical inventory:', error)
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
      // Ambil severity dan background color berdasarkan status
      const { severity, backgroundColor } = getSeverity(status)

      // Kembalikan Tag dengan gaya yang sesuai
      return (
        <Tag
          value={status.charAt(0).toUpperCase() + status.slice(1)} // Capitalize the first letter
          severity={severity}
          style={{ backgroundColor: backgroundColor }} // Set background color
        />
      )
    }

    return null // Kembalikan null jika tidak ada status
  }

  const prepareChartData = (data, color) => ({
    labels: data.map((item) => `${item.Material.materialNo}\n${item.Material.description}`),
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
            size: 15,
            weight: 'bold', // Set weight to bold
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
        color: 'black',
        anchor: 'end',
        align: 'top',
        font: { size: 16, weight: 'bold' },
        formatter: (value) => value.toLocaleString(),
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
        <CCard className="mb-1 ">
          <CCardHeader>Order Options</CCardHeader>
          <CCardBody>
            <div className="mb-1" style={{ display: 'flex', gap: '1 rem' }}>
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
              <CButton className="ms-3" color="secondary" onClick={toggleTableVisibility}>
                {showTable ? 'Hide Table' : 'Show Table'}
              </CButton>
            </div>
          </CCardBody>
        </CCard>

        <CCard className="mb-1">
          <CCardHeader>Critical Stock</CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
              <Bar
                data={prepareChartData(inventoriesCritical, 'powderblue', 2)}
                options={{
                  ...chartOptions(inventoriesCritical, 0, 2.2, 2, false),
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

            {showTable && (
              <DataTable
                value={inventoriesCritical}
                tableStyle={{ minWidth: '40rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                loading={loading}
                emptyMessage="No inventory data available."
                size="small"
                scrollable
              >
                {/* Kolom DataTable */}
                <Column field="Material.materialNo" header="Material No" sortable />
                <Column field="Material.description" header="Description" sortable />
                <Column field="Material.uom" header="UoM" sortable />
                <Column field="Material.Supplier.supplierName" header="Supplier" sortable />
                <Column field="Material.minStock" header="Min" sortable />
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

        {/* <CCard className="mb-2">
          <CCardHeader>Lowest Stock</CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
              <Bar
                data={prepareChartData(inventorieslowest, 'skyblue', 1)}
                options={chartOptions(inventorieslowest, 0, 1.1, 1)}
                height={300}
              />
            </Box>

            Modal for displaying selected data
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
                      <strong>Supplier:</strong> {selectedData.Material.supplier}
                    </p>
                    <p>
                      <strong>Stock Actual:</strong> {selectedData.quantityActualCheck}
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

            {showTable && (
              <DataTable
                value={inventorieslowest}
                tableStyle={{ minWidth: '50rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                loading={loading}
                emptyMessage="No inventory data available."
                size="small"
                scrollable
              >
                Kolom DataTable
                <Column field="Material.materialNo" header="Material" sortable />
                <Column field="Material.description" header="Description" sortable />
                <Column field="Material.uom" header="UoM" sortable />
                <Column field="Material.minStock" header="Min" sortable />
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
        </CCard> */}
        <CCard className="mb-1">
          <CCardHeader>Overflow Stock</CCardHeader>
          <CCardBody>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
              <Bar
                data={prepareChartData(inventoriesoverflow, 'steelblue', 5)}
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
                height={260}
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

            {showTable && (
              <DataTable
                value={inventoriesoverflow}
                tableStyle={{ minWidth: '30rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                loading={loading}
                emptyMessage="No inventory data available."
                size="small"
                scrollable
              >
                {/* Kolom DataTable */}
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
