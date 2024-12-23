import React, { useState, useEffect, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormCheck,
  CSpinner,
  CInputGroupText,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CButtonGroup,
  CBadge,
  CFormInput,
  CDropdown,
  CDropdownItem,
  CInputGroup,
} from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import CIcon from '@coreui/icons-react'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Button } from 'primereact/button'
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
import 'react-datepicker/dist/react-datepicker.css'
import { cilCalendar } from '@coreui/icons'
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
  const { createIncomingPlan, updateIncoming } = useDashboardService() // Service
  const [inventoriescritical, setInventoriesCritical] = useState([]) // Inventory data
  const [inventorieslowest, setInventoriesLowest] = useState([]) // Inventory data
  const [isTableVisible, setIsTableVisible] = useState(true) // Toggle for table visibility
  const [inventoriesoverflow, setInventoriesOverflow] = useState([]) // Inventory data
  const [inventories, setInventories] = useState([]) // Inventory data
  const [lowestItemNb, setLowestItemNb] = React.useState(14) //Item untuk slider lowest
  const [overflowItemNb, setOverflowItemNb] = React.useState(14) //Item untuk slider over flow
  const [itemNb, setItemNb] = React.useState(14) //item untuk critical
  const [chartWidth, setChartWidth] = useState(window.innerWidth)
  const [order, setOrder] = useState('ASC')
  const [selectedChart, setSelectedChart] = useState('critical')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState({ value: 'all', label: 'All' })
  const [modalDashboard, setModalDashboard] = useState(false)
  const [plant, setPlant] = useState([])
  const { getMasterData, getMasterDataById } = useMasterDataService()
  const datePickerRef = useRef(null)
  const [loadingSave, setLoadingSave] = useState(false)
  const apiPlant = 'plant-public'
  const [editData, setEditData] = useState({ incomingDate: null })
  const [isReceivingEdited, setIsReceivingEdited] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState({
    planning: '',
    actual: '',
    incomingDate: '',
  })
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
//test
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
            // Jika chart title adalah "Critical Stock" dan stok < 1.5, warnai merah
            if (chartTitle === 'Critical Stock' && item.stock < 1.5) {
              return '#F95454' // Merah untuk stok di bawah 1.5 (Critical)
            }

            // Jika chart title adalah "Overflow Stock" dan stok lebih dari 6, warnai hitam
            if (chartTitle === 'Overflow Stock' && item.stock > 5) {
              return '#EB5B00' // Hitam untuk stok lebih dari 6 (Overflow)
            }

            // Check if incoming value is filled (>= 1) and apply forestgreen
            if (item.Incomings && item.Incomings.length > 0 && item.Incomings[0].planning > 0) {
              return 'forestgreen' // Jika incoming >= 1, warna forestgreen
            }

            // Apply color based on chart title for "Low Stock" and other conditions
            switch (chartTitle) {
              case 'Critical Stock':
                return '#FFAF00' // Goldenrod untuk Critical Stock
              case 'Low Stock':
                return '#FF8225' // Light Coral untuk Low Stock
              case 'Overflow Stock':
                return '#FFAF00' // Goldenrod untuk Overflow Stock
              default:
                return 'gray' // Default color untuk chart lainnya
            }
          }),
        },
      ],
      shiftLevel, // Used to draw red line (shiftLevel digunakan untuk menggambar garis merah)
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
            size: 11,
          },
          color: 'black', // Menetapkan warna font untuk ticks pada sumbu Y menjadi hitam
        },

        title: {
          display: true,
          text: 'Stock Levels',
          font: {
            size: 11,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 8, // Ukuran font
            color: 'black', // Menetapkan warna font menjadi hitam
            weight: 'bold', // Menjadikan font bold
          },
          callback: function (value, index, ticks) {
            const item = data[index]

            const materialNo = item.Material.materialNo
            const plantName = item.Address_Rack.Storage.Plant.plantName
            const description = item.Material.description

            // Ambil hanya 10 karakter pertama dari description
            return `${description.substring(0, 17)}..`
          },
          maxRotation: 0, // Mencegah rotasi diagonal
          autoSkip: false, // Pastikan label ditampilkan tanpa di-skip
        },
        title: {
          display: true,
          text: 'Inventory Items',
          font: {
            size: 10,
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
        annotations: [
          // Garis untuk 5 (Max Stock/Min Stock)
          {
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
              yAdjust: -16,
              color: 'white',
            },
          },

          // Garis untuk 6 (Max Stock Line)
          {
            type: 'line',
            yMin: 8, // Garis pada nilai 6
            yMax: 8, // Garis pada nilai 6
            borderColor: 'orange', // Warna orange
            borderWidth: 1,
            borderDash: [5, 5], // Garis putus-putus
            label: {
              display: true,
              content: `Overflow Stock: 8 Shift`, // Label untuk garis 6
              position: 'end',
              font: {
                size: 9,
              },
              yAdjust: -1,
              color: 'white',
            },
          },

          // Garis untuk 1.5 hanya muncul jika selectedChart === 'critical'
          ...(selectedChart === 'critical'
            ? [
                {
                  type: 'line',
                  yMin: 1.5, // Garis pada nilai 1.5
                  yMax: 1.5, // Garis pada nilai 1.5
                  borderColor: 'red', // Warna merah
                  borderWidth: 0.5,
                  borderDash: [5, 5], // Garis putus-putus
                  label: {
                    display: true, // Menampilkan label
                    content: 'Critical Stock 1.5 Shift', // Isi label
                    position: 'end', // Menentukan posisi label di akhir garis
                    font: {
                      size: 9,
                    },
                    yAdjust: -6, // Menyesuaikan posisi label di sumbu Y
                    color: 'white', // Warna label
                  },
                },
              ]
            : []), // Jika bukan Critical Stock, tidak akan menambahkan garis ini
        ],
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
    setModalDashboard(true)
  }
  const handleEditMaterial = (material) => {
    const selectedUOM = uomOptions.find((option) => option.value === material.uom)
    const selectedType = typeOptions.find((option) => option.value === material.type)
    const selectedCategory = categoryOptions.find((option) => option.id === material.Category.id)
    const selectedMRPType = mrpTypeOptions.find((option) => option.value === material.mrpType)
    const selectedPackaging = packagingOptions.find(
      (option) => option?.value === material.Packaging?.packaging,
    )
    const selectedSupplier = supplierOptions.find((option) => option?.id === material.Supplier?.id)
    const selectedStorage = storageOptions.find((option) => option?.id === material.Storages[0]?.id)
    const selectedPlant = plantOptions.find((p) => p.id === material.Storages[0]?.Plant?.id)
    setIsEdit(true)
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: selectedUOM || null,
      price: material.price,
      type: selectedType || null,
      mrpType: selectedMRPType || null,
      categoryId: selectedCategory || null,
      supplierId: selectedSupplier || null,
      packaging: selectedPackaging || null,
      unitPackaging: material.Packaging?.unitPackaging,
      minStock: material.minStock,
      maxStock: material.maxStock,
      minOrder: material.minOrder,
      img: material.img,
      storageId: selectedStorage || null,
      plantId: selectedPlant || null,
    })
    setModal(true)
  }


  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#ccc',
    }),
  }

  const typeOptions = [
    { value: 'not_delivery', label: '❌', icon: '❌', color: 'red' },
    { value: 'delivery', label: '✔️', icon: '✔️', color: 'green' },
    { value: 'partial_delay', label: '⚠️', icon: '⚠️', color: 'orange' },
  ]

  const getStatusLabel = (type) => {
    switch (type?.value) {
      case 'not_delivery':
        return 'Not Delivery'
      case 'delivery':
        return 'Delivery'
      case 'partial_delay':
        return 'Partial Delay'
      default:
        return ''
    }
  }
  const handleIconClick = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setFocus() // Focus the input to trigger the calendar
    }
  }

  // Handle Form Submission
  const handlePlanningChange = (value) => {
    setEditData((prev) => ({
      ...prev,
      planning: value,
      actual: isReceivingEdited ? prev.actual : value, // Mirror only if not manually edited
    }))
  }
  
  // Handle Quantity Actual Change
  const handleReceivingChange = (value) => {
    setIsReceivingEdited(true) // Mark as manually edited
    setEditData((prev) => ({
      ...prev,
      actual: value,
    }))
  }
  
  // Handle Form Submission
  const handleSave = async () => {
    setLoadingSave(true)
  
    try {
      // Save the incoming plan
      await createIncomingPlan({
        ...editData,
        incomingDate: editData.incomingDate || new Date(),
      })
  
      // Update the inventory with actual data
      await updateIncoming({
        id: editData.id,
        actual: editData.actual,
      })
  
      // Update the table data
      await fetchInventoryCriticalStock(itemNb, order, selectedPlant.value)
      await fetchInventoryLowestStock(lowestItemNb, order, selectedPlant.value)
      await fetchInventoryOverflowStock(overflowItemNb, order, selectedPlant.value)
  
      setModalDashboard(false) // Close the modal
    } catch (error) {
      console.error('Error saving inventory data:', error)
    } finally {
      setLoadingSave(false)
    }
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
                options={chartvalue.filter((option) => option.value !== 'lowest')} // Sembunyikan opsi "Lowest"
                value={chartvalue.find((option) => option.value === selectedChart)} // Tetap tetapkan value berdasarkan state
                onChange={handleChartChange} // Tetap gunakan fungsi onChange
                isClearable={false} // Non-clearable
                placeholder="Select Status"
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
                        backgroundColor: '#FFAF00',
                        color: 'black',

                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 'bold', // Menambahkan teks menjadi bold
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>Follow Up by TL Up</div>
                    </div>
                  </CCol>

                  {/* Not Yet Incoming (Red) */}
                  {selectedChart === 'critical' && (
                    <CCol xs="auto">
                      <div
                        style={{
                          backgroundColor: '#F95454',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1px',
                          fontWeight: 'bold',
                        }}
                      >
                        <div style={{ fontSize: '12px' }}>Follow Up by Dph Up</div>
                      </div>
                    </CCol>
                  )}
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
                  options={chartOptions(inventoriescritical, 0, 4.9, 4.5, 1.5)} // Pastikan options mengandung annotation yang sudah diperbarui
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
                  options={chartOptions(inventoriesoverflow, 0, 8, 5)}
                  height={410}
                />
              )}
            </Box>

            <CModal
              visible={modalOpen}
              onClose={handleCloseModal}
              alignment="center" // This aligns the modal in the center of the screen
              size="lg" // You can change it to 'sm', 'lg', or 'xl'
            >
              <CModalHeader>
                <CModalTitle>Detail Information</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedData && (
                  <>
                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Material Number:</strong>
                      </CCol>
                      <CCol xs={9}>
                        {selectedData.Material.materialNo}{' '}
                        <span className="fw-light">
                          ({selectedData.Address_Rack.Storage.Plant.plantName} )
                        </span>
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Description:</strong>
                      </CCol>
                      <CCol xs={9}>
                        {selectedData.Material.description}{' '}
                        <span className="fw-light">({selectedData.Material.type} )</span>
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Supplier:</strong>
                      </CCol>
                      <CCol xs={9}>{selectedData.Material.Supplier.supplierName}</CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Stock Actual:</strong>
                      </CCol>
                      <CCol xs={9}>
                        {selectedData.quantityActualCheck} {selectedData.Material.uom}{' '}
                        <span className="fw-light">({selectedData.estimatedStock} Shift)</span>
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Planning Incoming:</strong>
                      </CCol>
                      <CCol xs={9}>
                        {selectedData.Incomings.length > 0 ? selectedData.Incomings[0].planning : 0}{' '}
                        {selectedData.Material.uom}
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Estimation Stock:</strong>
                      </CCol>
                      <CCol xs={9}>{selectedData.estimatedStock} Shift</CCol>
                    </CRow>
                  </>
                )}
              </CModalBody>
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
                <Column field="Material.materialNo" header="Material No" />
                <Column field="Material.description" header="Description" sortable />
                <Column field="Material.uom" header="UoM" />
                <Column field="Material.Supplier.supplierName" header="Supplier" />

                {/* Conditional rendering of minStock/maxStock based on selected chart */}
                {selectedChart === 'critical' || selectedChart === 'lowest' ? (
                  <Column field="Material.minStock" header="Min" />
                ) : selectedChart === 'overflow' ? (
                  <Column field="Material.maxStock" header="Max" />
                ) : null}

                <Column field="quantityActualCheck" header="Actual" />
                <Column field="stock" header="Stock (Shift)" />
                <Column field="Incomings[0].createdAt" header="Delivery Date" />
                <Column field="planning" header="Qty Planning" />
                <Column field="actual" header="Qty Receiving" />
                <Column field="Incomings[0].planning" header="Stock Outload" />
                <Column field="estimatedStock" header="Delivery Status" />
                <Column
                  header="Action"
                  body={actionBodyTemplate}
                  headerStyle={{ width: '5%' }}
                  bodyStyle={{ textAlign: 'center' }}
                  frozen
                  alignFrozen="right"
                />
              </DataTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CModal visible={modalDashboard} onClose={() => setModalDashboard(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Inventory Input</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={editData?.Material?.description || ''}
            label="Description"
            disabled
            className="mb-3"
          />
          <CRow>
            <CCol md={6}>
              <CFormInput
                type="text"
                value={editData?.Material?.materialNo || ''}
                label="Material No."
                disabled
                className="mb-3"
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="text"
                value={editData?.stock || ''}
                disabled
                label="Stock (Shift)"
                className="mb-3"
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="text"
                value={editData?.quantityActualCheck || ''}
                disabled
                label="Qty Actual"
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={7}>
              <span htmlFor="incomingDate" className="form-label">
                Delivery Date <span style={{ color: 'red' }}>*</span>
              </span>

              <CInputGroup className="mt-2">
                <DatePicker
                  ref={datePickerRef} // Attach the ref to the DatePicker
                  selected={editData.incomingDate}
                  onChange={(date) => setEditData({ ...editData, incomingDate: date })}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />

                <CInputGroupText onClick={handleIconClick}>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
              </CInputGroup>
            </CCol>
            <CCol md={5}>
              <CFormInput
                type="number"
                min="0" // Prevent negative numbers
                value={editData?.planning || ''}
                onChange={(e) => handlePlanningChange(e.target.value)}
                label={
                  <span>
                    Quantity Planning <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                className="mb-3"
              />
            </CCol>

            <CCol md={5}>
              <CFormInput
                type="number"
                min="0" // Prevent negative numbers
                value={editData?.actual || ''}
                onChange={(e) => handleReceivingChange(e.target.value)}
                label={
                  <span>
                    Quantity Receiving <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                className="mb-3"
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="number"
                min="0" // Prevent negative numbers
                value={
                  parseFloat(editData?.actual || 0) + parseFloat(editData?.quantityActualCheck || 0)
                } // Sum of Quantity Planning and Quantity Actual
                label="Total"
                disabled
                className="mb-3"
              />
            </CCol>

            <CCol md={4}>
              <CFormInput
                type="text"
                label="Stock Outlock"
                disabled
                className="mb-3"
                value={`${(
                  ((parseFloat(editData?.planning || 0) +
                    parseFloat(editData?.quantityActualCheck || 0)) /
                    parseFloat(editData?.Material?.minStock || 1)) *
                  4.5
                ).toFixed(1)} (Shift)`} // Calculate the Stock Outlock value and format to 1 decimal place
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

export default Dashboard
