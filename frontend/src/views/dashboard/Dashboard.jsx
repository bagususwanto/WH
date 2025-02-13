import React, { useState, useEffect, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { MultiSelect } from 'primereact/multiselect'
import { Row } from 'primereact/row'
import { ColumnGroup } from 'primereact/columngroup'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import '../../scss/chart.scss'
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
  const { createIncomingPlan, updateIncoming,getInventoryAll} = useDashboardService() // Service
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
  const [dataGetIncoming, setDataGetIncoming] = useState()
  const [selectedChart, setSelectedChart] = useState('critical')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState({ value: 'all', label: 'All' })
  const [modalDashboard, setModalDashboard] = useState(false)
  const [modalActual, setModalActual] = useState(false)
  const [plant, setPlant] = useState([])
  const { getMasterData, getMasterDataById } = useMasterDataService()
  const datePickerRef = useRef(null)
  const [loadingSave, setLoadingSave] = useState(false)
  const apiPlant = 'plant-public'
  const [editData, setEditData] = useState({ incomingDate: null })
  const apiWarehousePlant = 'warehouse-plant'
  const [isReceivingEdited, setIsReceivingEdited] = useState(false)
  const [fetchNow, setFetchNow] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(['Material No', 'Supplier']) // Kolom yang terlihat
  const [currentIncoming, setCurrentIncoming] = useState({
    planning: '',
    incomingDate: '',
  })
  const today = `${format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}`
  //Handle change Desc,Asc
  const handleOrderChange = (event) => {
    setOrder(event.target.value)
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Fetching data every 10 seconds...');
      
      fetchInventoryCriticalStock(itemNb, order, selectedPlant.value);
    }, 10000);
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [itemNb, order, selectedPlant.value]); 

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
  }, [selectedChart, itemNb, lowestItemNb, overflowItemNb, order, selectedPlant, fetchNow])

  // useEffect(() => {
  //   getWarehouse() // Fetch products on mount
  // }, []) // Empty dependency array ensures it only runs once
  useEffect(() => {
    if (!editData.incomingDate) {
      setEditData((prev) => ({ ...prev, incomingDate: new Date() }))
    }
  }, [editData, setEditData])
  const fetchInventoryCriticalStock = async (itemNb, order, id) => {
    try {
      const response = await getInventoryCriticalStock(itemNb, order, id)
      if (response.data && response.data.length > 0) {
        const dataWithFormattedFields = response.data.map((item) => {
          const incomingDate = item.Incomings[0]?.incomingDate
            ? format(parseISO(item.Incomings[0]?.incomingDate), 'yyyy-MM-dd') // Format incomingDate
            : ''
          const planning = item.Incomings[0]?.planning
          const status = item.Incomings[0]?.status
          const actual = item.Incomings[0]?.actual
          const createdAt = item.Log_Entries?.[0]?.createdAt
            ? format(parseISO(item.Log_Entries?.[0]?.createdAt), 'yyyy-MM-dd HH:mm:ss') // Format incomingDate
            : ''
          console.log('apa', createdAt)
          return {
            ...item,
            incomingDate,
            planning,
            status,
            actual,
            createdAt,
          }
        })
        console.log('data', dataWithFormattedFields)

        setInventoriesCritical(dataWithFormattedFields)
      } else {
        setInventoriesCritical([]) // Set empty data if no results
      }
    } catch (error) {
      console.error('Error fetching critical stock data:', error)
      setInventoriesCritical([]) // Set empty data on error
    }
  }

  const fetchData = async () => {
    try {
      fetchInventoryCriticalStock(itemNb, order, selectedPlant.value)
      // const data = await getInventoryCriticalStock() // Ganti dengan API fetch yang sesuai
      // setInventoriesCritical(data) // Update state dengan data terbaru
    } catch (error) {
      console.error('Error fetching data:', error)
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
  const getWarehouseId = async (plantValue) => {
    const apiWarehousePlant = 'warehouse-plant'
    try {
      const warehouseData = await getMasterDataById(apiWarehousePlant, plantValue)
      return warehouseData?.id || null
    } catch (error) {
      console.error('Error fetching warehouse ID:', error)
      return null
    }
  }

  // Function to fetch overflow stock data and handle empty data
  const fetchInventoryOverflowStock = async (overflowItemNb, order, id) => {
    try {
      const response = await getInventoryOverflowStock(overflowItemNb, order, id)
      if (response.data && response.data.length > 0) {
        const dataWithFormattedFields = response.data.map((item) => {
          const incomingDate = item.Incomings[0]?.incomingDate
            ? format(parseISO(item.Incomings[0]?.incomingDate), 'yyyy-MM-dd') // Format incomingDate
            : ''
          const planning = item.Incomings[0]?.planning
          const status = item.Incomings[0]?.status
          const actual = item.Incomings[0]?.actual
          return {
            ...item,
            incomingDate,
            planning,
            status,
            actual,
          }
        })
        setInventoriesOverflow(dataWithFormattedFields)
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
  const handleChartChange = (selectedOption) => {
    setSelectedChart(selectedOption.value) // Update selected chart based on user's choice
  }
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
            if (chartTitle === 'Critical Stock' && item.stock < 1.5) {
              return '#F95454' // Red for stock < 1.5 (Critical)
            }
            if (chartTitle === 'Critical Stock' && item.stock < 2.5) {
              return '#FFAF00' // Red for stock < 1.5 (Critical)
            }
            if (chartTitle === 'Critical Stock' && item.stock < 4.5) {
              return '#638C6D' // Red for stock < 1.5 (Critical)
            }

            if (chartTitle === 'Overflow Stock' && item.stock > 5) {
              return '#F95454' // Orange for stock > 5 (Overflow)
            }

            if (item.Incomings && item.Incomings.length > 0 && item.Incomings[0].actual > 0) {
              return '#FCC737' // Yellow for incoming >= 1
            }

            switch (chartTitle) {
              case 'Critical Stock':
                return '#FFAF00' // Goldenrod for Critical Stock
              case 'Low Stock':
                return '#FF8225' // Light Coral for Low Stock
              case 'Overflow Stock':
                return '#FFAF00' // Goldenrod for Overflow Stock
              default:
                return 'gray' // Default color for other charts
            }
          }),
          borderColor: data.map((item) => {
            if (item.Incomings && item.Incomings.length > 0 && item.Incomings[0].actual > 0) {
              return '#7E99A3' // Green border for incoming >= 1
            }

            return 'transparent' // No border by default
          }),
          borderWidth: data.map((item) => {
            if (item.Incomings && item.Incomings.length > 0 && item.Incomings[0].actual > 0) {
              return 5 // Border width for incoming >= 1
            }

            return 0 // No border width by default
          }),
          animation: data.map((item) => {
            if (chartTitle === 'Critical Stock' && item.stock < 1.5) {
              return {
                backgroundColor: {
                  easing: 'easeInOutQuart',
                  from: 'red', // Start color when stock is low
                  to: 'transparent', // End color
                  duration: 1000, // Animation duration
                  loop: true, // Loop the animation
                },
              }
            }

            // No animation for other stocks
            return null
          }),
        },
      ],
      shiftLevel, // Used to draw red line (shiftLevel digunakan untuk menggambar garis merah)
    }
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
            size: 10, // Ukuran font
            color: 'black', // Menetapkan warna font menjadi hitam
            weight: 'bold', // Menjadikan font bold
          },
          callback: function (value, index, ticks) {
            const item = data[index]

            const materialNo = item.Material.materialNo
            const plantName = item.Address_Rack.Storage.Plant.plantName
            const description = item.Material.description
            const descSubstring = `${description.substring(0, 19)}`

            // Ambil hanya 10 karakter pertama dari description
            // return `${description.substring(0, 17)}..`

            // Convert the description into an array of words
            const arrayDesc = descSubstring.split(' ')

            // Return the array for multiline labels
            return arrayDesc
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
            size: 15,
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
            return context.dataset.label === 'Actual Stock' ? value?.toLocaleString() : ''
          },
        },

        formatter: (value) => value?.toLocaleString(), // Format the label value
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
                  : `Max Stock: ${referenceLineValue} Shift`,
              position: 'end',
              font: {
                size: 13,
                weight: 'bold', // Menambah ketebalan font jika diperlukan
                color: 'red', // Mengubah warna teks menjadi merah
              },
              yAdjust: -16,
              backgroundColor: 'rgba(0,0,0,0)', // Transparan
              color: 'black',

            },
          },
         
          // Garis untuk 6 (Max Stock Line)
          // {
          //   type: 'line',
          //   yMin: 0, // Garis pada nilai 6
          //   yMax: 0, // Garis pada nilai 6
          //   borderColor: 'orange', // Warna orange
          //   borderWidth: 1,
          //   borderDash: [5, 5], // Garis putus-putus
          //   label: {
          //     display: true,
          //     content: `Overflow Stock: 8 Shift`, // Label untuk garis 6
          //     position: 'end',
          //     font: {
          //       size: 9,
          //     },
          //     yAdjust: -1,
          //     color: 'white',
          //   },
          // },

          // Garis untuk 1.5 hanya muncul jika selectedChart === 'critical'
          ...(selectedChart === 'critical'
            ? [
                {
                  type: 'line',
                  yMin: 2.5, // Garis pada nilai 2.5
                  yMax: 2.5, // Garis pada nilai 2.5
                  borderColor: 'orange', // Warna garis orange
                  borderWidth: 1.3,
                  borderDash: [5, 5], // Garis putus-putus
                  label: {
                    display: true, // Menampilkan label
                    content: 'Min Stock 2.5 Shift', // Isi label
                    position: 'start', // Posisi label di awal garis
                    font: {
                      size: 8,
                      weight: 'bold', // Menambah ketebalan font jika diperlukan
                      color: 'red', // Mengubah warna teks menjadi merah
                    },
                    yAdjust: -12, // Menyesuaikan posisi label di sumbu Y
                    backgroundColor: '#FFAF00', // Transparan
                    color: 'black', // Warna teks menjadi merah
                  },
                },
                {
                  type: 'line',
                  yMin: 1.5, // Garis pada nilai 1.5
                  yMax: 1.5, // Garis pada nilai 1.5
                  borderColor: 'red', // Warna garis merah
                  borderWidth: 0.9,
                  borderDash: [5, 5], // Garis putus-putus
                  label: {
                    display: true, // Menampilkan label
                    content: 'Critical Stock 1.5 Shift', // Isi label
                    position: 'end', // Posisi label di akhir garis
                    font: {
                      size: 8,
                      weight: 'bold', // Menambah ketebalan font jika diperlukan
                      color: 'red', // Mengubah warna teks menjadi merah
                    },
                    yAdjust: -12, // Menyesuaikan posisi label di sumbu Y
                    backgroundColor: 'red', // Transparan
                    color: 'white', // Warna teks menjadi merah
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

  const actionBodyIncom = (rowData) => (
    <div className="d-flex justify-content-center align-items-center">
      <Button
        icon="pi pi-pencil"
        className="p-row-editor-init p-link"
        onClick={() => handleInputInventory(rowData)}
      />
    </div>
  )
  const actionBodyReceiv = (rowData) => (
    <div className="d-flex justify-content-center align-items-center">
      <Button
        icon="pi pi-box" // Ikon barang dari PrimeIcons
        className="p-row-editor-init p-link"
        onClick={() => handleInputActual(rowData)}
      />
    </div>
  )
  const handleInputActual = (rowData) => {
    setEditData({
      ...rowData,
      plantId: rowData?.Address_Rack?.Storage?.Plant?.id || null, // Ambil plantId dari struktur data
    })
    setModalActual(true)
  }

  const handleInputInventory = (rowData) => {
    setEditData({
      ...rowData,
      plantId: rowData?.Address_Rack?.Storage?.Plant?.id || null, // Ambil plantId dari struktur data
    })
    setModalDashboard(true)
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#ccc',
    }),
  }

  const renderDeliveryStatus = (type) => {
    const typeOptions = [
      {
        value: 'not complete',
        icon: (
          <div
            style={{
              backgroundColor: 'red',
              color: 'white',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            X
          </div>
        ),
      },
      {
        value: 'completed',
        icon: (
          <div
            style={{
              backgroundColor: 'green',
              color: 'white',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            ✓
          </div>
        ),
      },
      {
        value: 'partial',
        icon: (
          <div
            style={{
              backgroundColor: 'orange',
              color: 'white',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            !
          </div>
        ),
      },
    ]

    const option = typeOptions.find((option) => option.value === type)

    return option ? (
      <span style={{ color: option.color, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '5px' }}>{option.icon}</span> {option.label}
      </span>
    ) : null
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

  const handleSave = async () => {
    setLoadingSave(true)

    try {
      console.log('Saving data:', editData)

      // Validasi plantId
      const plantId = editData?.plantId
      if (!plantId) {
        throw new Error('Plant ID is missing')
      }

      // Ambil warehouseId berdasarkan plantId
      const warehouseId = await getWarehouseId(plantId)
      if (!warehouseId) {
        throw new Error('Warehouse ID is missing')
      }

      // Simpan data inventory menggunakan warehouseId
      await createIncomingPlan(warehouseId, {
        incomingDate: editData.incomingDate,
        planning: editData.planning,
        inventoryId: editData.id,
      })

      // Tutup modal
      setModalDashboard(false)
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Failed to save data.')
    } finally {
      setLoadingSave(false)

      // Fetch ulang data untuk refresh
      setFetchNow(true)
      await fetchData() // Pastikan fetchData adalah fungsi yang memperbarui data di state
    }
  }

  const handleInputReceive = async () => {
    setLoadingSave(true)

    try {
      console.log('Saving data:', editData)

      // Validasi plantId
      const plantId = editData?.plantId
      if (!plantId) {
        throw new Error('Plant ID is missing')
      }

      const incomingId = editData?.Incomings?.[0]?.id 
    if (!incomingId) {
      throw new Error('Incoming ID is missing')
    }
      // Ambil warehouseId berdasarkan plantId
      const warehouseId = await getWarehouseId(plantId)
      if (!warehouseId) {
        throw new Error('Warehouse ID is missing')
      }


 console.log('Update data Actual:', editData.actual);
 
      await updateIncoming(incomingId,warehouseId, {
        actual: editData.actual,
        // inventoryId: editData.id,
      })

      // Tutup modal
      setModalActual(false)
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Failed to save data.')
    } finally {
      setLoadingSave(false)

      // Fetch ulang data untuk refresh dengan retry mekanisme
 // Fetch ulang data untuk refresh
      setFetchNow(true)
      await fetchData() // Pastikan fetchData adalah fungsi yang memperbarui data di state
    }
  }

  const columns = [
    { field: 'Material.materialNo', header: 'Material No' },
    { field: 'Log_Entries?.[0]?.createdAt', header: 'lastUpdate' },
    { field: 'Material.Supplier.supplierName', header: 'Supplier' },
  ]

  const onColumnToggle = (e) => {
    const selectedColumns = e.value.map((col) => col.header)
    setVisibleColumns(selectedColumns)
  }

  const header = () => (
    <MultiSelect
      value={columns.filter((col) => visibleColumns.includes(col.header))}
      options={columns}
      optionLabel="header"
      onChange={onColumnToggle}
      className="w-full sm:w-20rem mb-2 mt-2"
      display="chip"
      placeholder="Show/Hide Columns"
      style={{ borderRadius: '5px' }}
    />
  )

  // Header Group untuk kolom
  const headerGroup = (
    <ColumnGroup>
      <Row>
        {visibleColumns.includes('Material No') && (
          <Column header="Material No" rowSpan={2} frozen />
        )}
        <Column header="Description" rowSpan={2} frozen />
        {visibleColumns.includes('Supplier') && <Column header="Supplier" rowSpan={2} />}
        <Column header="UoM" rowSpan={2} />

        <Column header="Actual Stock" colSpan={3} align="center" />
        <Column header="Incoming" colSpan={4} align="center" />
        <Column header="Stock (Shift)" rowSpan={2} />

        <Column header="Follow Up By" colSpan={2} align="center" frozen />
      </Row>
      <Row>
        {selectedChart === 'critical' ? (
          <Column field="Material.minStock" header="Min" align="center" />
        ) : selectedChart === 'overflow' ? (
          <Column field="Material.maxStock" header="Max" align="center" />
        ) : null}

        <Column header="Actual" align="center" />
        <Column header="lastUpdate" align="center" />
        <Column header="Delivery Date" align="center" />
        <Column header="Qty Plan" align="center" />
        <Column header="Qty Receive" align="center" />
        <Column header="Status" align="center" />
        <Column header="Order" align="center" frozen />
        <Column header="Receip" align="center" frozen />
      </Row>
    </ColumnGroup>
  )

  const backgroundColor =
    selectedChart === 'critical' ? '#FFAF00' : selectedChart === 'overflow' ? '#F95454' : 'white'
     const color =
    selectedChart === 'critical' ? 'black' : selectedChart === 'overflow' ? 'white' : 'white'

  return (
    <CRow>
      <CCol>
        <CCard className="mb-2">
          <CCardHeader>Filter Dashboard</CCardHeader>
          <CCardBody>
            <div className="mb-1" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div className="form-group">
                <label
                  htmlFor="filter-options"
                  className="form-label"
                  style={{
                    fontSize: '0.7rem', // Ukuran font
                    fontWeight: 500, // Ketebalan font
                    marginBottom: '0.1rem', // Jarak bawah
                    display: 'block', // Pastikan label muncul di atas elemen Select
                  }}
                >
                  Sort By:
                </label>
                <CButtonGroup id="filter-options">
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
              </div>

              <div className="form-group">
                <label
                  htmlFor="plant"
                  className="form-label"
                  style={{
                    fontSize: '0.7rem', // Ukuran font
                    fontWeight: 500, // Ketebalan font

                    marginBottom: '0.1rem', // Jarak bawah
                    display: 'block', // Pastikan label muncul di atas elemen Select
                  }}
                >
                  Plant:
                </label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  options={plantOptions} // plantOptions termasuk "All"
                  value={selectedPlant} // Menetapkan state sebagai value yang dipilih
                  id="plant"
                  onChange={handlePlantChange} // Event handler saat memilih plant
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="status"
                  className="form-label"
                  style={{
                    fontSize: '0.7rem', // Ukuran font
                    fontWeight: 500, // Ketebalan font

                    marginBottom: '0.1rem', // Jarak bawah
                    display: 'block', // Pastikan label muncul di atas elemen Select
                  }}
                >
                  Status By:
                </label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  options={chartvalue.filter((option) => option.value !== 'lowest')} // Sembunyikan opsi "Lowest"
                  value={chartvalue.find((option) => option.value === selectedChart)} // Tetap tetapkan value berdasarkan state
                  onChange={handleChartChange} // Tetap gunakan fungsi onChange
                  isClearable={false} // Non-clearable
                  id="status"
                  placeholder="Select Status"
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="hide"
                  className="form-label"
                  style={{
                    fontSize: '0.7rem', // Ukuran font
                    fontWeight: 500, // Ketebalan font

                    marginBottom: '0.1rem', // Jarak bawah
                    display: 'block', // Pastikan label muncul di atas elemen Select
                  }}
                >
                  Table
                </label>
                <CButton
                  className="ms-2"
                  color="secondary"
                  onClick={() => setIsTableVisible(!isTableVisible)}
                  id="hide"
                >
                  {isTableVisible ? 'Hide Table' : 'Show Table'}
                </CButton>
              </div>
              {/* Adding the green and red boxes with labels */}

              <div style={{ marginLeft: 'auto' }}>
                <Link to="/dashboardall" style={{ textDecoration: 'none' }}>
                  <CButton color="black" variant="outline">
                    {today}
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
                  <CRow style={{ justifyContent: 'flex-start' }}>
                    <CCol xs="auto">
                      <div>
                        <div
                          style={{
                            backgroundColor: backgroundColor,
                            color: color,
                            padding: '5px 10px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: 'bold',
                          }}
                        >
                          <div style={{ fontSize: '12px' }}>Follow Up by TL Up</div>
                        </div>
                      
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
                          <div style={{ fontSize: '12px' }}>Follow Up by SH Up</div>
                        </div>
                      </CCol>
                    )}

                    <CCol xs="auto">
                      <div
                        style={{
                          backgroundColor: 'transparent',
                          color: '#7E99A3', // Warna teks sesuai border
                          padding: '2px 10px',
                          borderRadius: '3px',
                          border: '3px solid #7E99A3', // Border warna merah
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        Item Received
                      </div>
                    </CCol>
                  </CRow>
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
                  options={chartOptions(inventoriescritical, 0, 4.9, 4.5, 2.5, 1.5)} // Pastikan options mengandung annotation yang sudah diperbarui
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
                  options={chartOptions(inventoriesoverflow, 0, 9, 5.5)}
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
                        <span className="fw-light">({selectedData.stock} Shift)</span>
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol md={6}>
                        <strong>Planning Incoming:</strong>{' '}
                        {selectedData.Incomings.length > 0
                          ? selectedData.Incomings[0]?.planning
                          : 0}{' '}
                        {selectedData.Material.uom}
                      </CCol>
                      <CCol md={6}>
                        <strong>Receive Incoming:</strong>{' '}
                        {selectedData.Incomings.length > 0 ? selectedData.Incomings[0]?.actual : 0}{' '}
                        {selectedData.Material.uom}
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol xs={3}>
                        <strong>Estimation Stock:</strong>
                      </CCol>
                      <CCol xs={9}>{selectedData.stock} Shift</CCol>
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
                headerColumnGroup={headerGroup}
                tableStyle={{ minWidth: '30rem' }}
                className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                emptyMessage="Tidak ada data inventaris."
                size="small"
                scrollable
                header={header} // Tambahkan header di sini
                onMouseDownCapture={(e) => {
                  e.stopPropagation()
                }}
              >
                {visibleColumns.includes('Material No') && (
                  <Column field="Material.materialNo" header="Material No" frozen />
                )}
                <Column field="Material.description" header="Description" frozen />
                {visibleColumns.includes('Supplier') && (
                  <Column field="Material.Supplier.supplierName" header="Supplier" />
                )}
                <Column field="Material.uom" header="UoM" />
                {selectedChart === 'critical' || selectedChart === 'lowest' ? (
                  <Column field="Material.minStock" header="Min" />
                ) : selectedChart === 'overflow' ? (
                  <Column field="Material.maxStock" header="Max" />
                ) : null}
                <Column field="quantityActualCheck" header="Actual" />
                <Column field="createdAt" header="lastUpdate" />
                <Column field="incomingDate" header="Delivery Date" />
                <Column field="planning" header="Qty Plan." />
                <Column field="actual" header="Qty Receive" />

                <Column
                  field="status"
                  header="Status"
                  body={(rowData) => renderDeliveryStatus(rowData.status)}
                  bodyStyle={{ justifyContent: 'center', alignItems: 'center' }} // Isi di tengah
                />

                <Column
                  field="stock"
                  header="Stock (Shift)"
                  body={(rowData) =>
                    rowData.stock !== undefined ? parseFloat(rowData.stock).toFixed(1) : '0.00'
                  }
                  bodyStyle={{ textAlign: 'center' }} // Center the content
                />

                <Column
                  header="Order"
                  body={actionBodyIncom}
                  headerStyle={{ width: '5%' }}
                  bodyStyle={{ textAlign: 'center' }}
                  frozen
                  alignFrozen="right"
                />
                <Column
                  header="Receiv"
                  body={actionBodyReceiv}
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
          <CModalTitle id="LiveDemoExampleLabel">Order Input</CModalTitle>
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
                label="Stock (Qty)"
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
                  selected={editData.incomingDate} // Gunakan incomingDate dari state
                  onChange={(date) => setEditData({ ...editData, incomingDate: date })}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
                <CInputGroupText onClick={handleIconClick}>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
              </CInputGroup>
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="number"
                min="0" // Prevent negative numbers
                value={editData?.planning || ''}
                onChange={(e) => handlePlanningChange(e.target.value)}
                label={
                  <span>
                    Qty Plan <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                className="mb-3"
              />
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="text"
                value={editData?.Material?.uom || ''}
                label="UoM."
                disabled
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
      <CModal visible={modalActual} onClose={() => setModalActual(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Receiv Input</CModalTitle>
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
            <CCol md={4}>
              <CFormInput
                type="text"
                value={editData?.Material?.materialNo || ''}
                label="Material No."
                disabled
                className="mb-3"
              />
            </CCol>
            <CCol md={8}>
              <CFormInput
                type="text"
                min="0" // Prevent negative numbers
                value={editData?.Material?.Supplier.supplierName || ''}
                label={<span>Supplier</span>}
                disabled
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={4}>
              <CFormInput
                type="number"
                selected={editData.actual}
                onChange={(e) => setEditData({ ...editData, actual: e.target.value })}
                label="Qty Receiv"
                className="mb-3"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="text"
                value={editData?.Material?.uom || ''}
                label="UoM."
                disabled
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
            <CButton color="primary" onClick={handleInputReceive}>
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
