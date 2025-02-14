import React, { useState, useEffect,useRef } from 'react'
import '../../scss/_tabels.scss'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import Pagination from '../../components/Pagination'
import { DatePicker, DateRangePicker } from 'rsuite';
import 'primeicons/primeicons.css'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'; // Icon bawaan PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeicons/primeicons.css';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { cilChart,cilCog} from '@coreui/icons';
import { FaAnglesLeft, FaAnglesRight, FaArrowUpRightFromSquare, FaChevronLeft, FaChevronRight, FaCircleCheck, FaCircleExclamation, FaCircleXmark } from 'react-icons/fa6';
import {
  CAvatar,
  CModal ,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
  CButtonGroup,
  CPagination,
  CPaginationItem,
  CCard,
  CCardBody,
  CBadge,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CContainer,
  CFormLabel,
  CFormText,
  CProgress,
  CTooltip,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import {
  cilCalendar,
} from '@coreui/icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import CIcon from '@coreui/icons-react'


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const ApprovalRequest = () => {
 
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const [visiblePages, setVisiblePages] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dataSchedules, setDataSchedules] = useState([]); // Menyimpan data dari API
  const [isVisible, setIsVisible] = useState(true); // State to control visibility
  const [ dataDNInquery, setDataDNInquery ] = useState([])
   const [totalPages, setTotalPages] = useState(1);
   const [limitPerPage, setLimitPerPage] = useState({name: 10, code: 10})
   const [isFilterVisible, setIsFilterVisible] = useState(false);
   const vendorScheduleRef = useRef(null);
   const [ showModalInput, setShowModalInput] = useState({
      state: false,
      enableSubmit: false
    })
 
  
  const [queryFilter, setQueryFilter] = useState({
    plantId: "",
    rangeDate: [
      new Date(new Date().setHours(0, 0, 0, 1)),  // Today at 00:00
      new Date(new Date().setHours(23, 59, 59, 999))  // Today at 23:59
    ],
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })



      
  return (
  <CContainer fluid>
    <CRow className='mt-1'>
      <CCard
        className="px-0 bg-white text-black mb-1"
        style={{
          overflow: "hidden",
          transitionDuration: "500ms",
          border: "1px solid #6482AD", // Menambahkan border dengan warna #074799
      }}>
        <CCardHeader
          style={{
            zIndex: 4,
            backgroundColor: "#6482AD",
            color: "white",
            padding: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <CTooltip content="Scroll to Vendor Schedule">
              <button
                className="btn d-flex align-items-center justify-content-center me-2 btn-toggle"
                style={{
                  // backgroundColor: "white",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                }}
              >
                <CIcon icon={cilChart} size="lg" className='icon-toggle'/>
              </button>
            </CTooltip>
            <CTooltip content="Toggle Filter Visibility">
              <button
                className="btn d-flex align-items-center justify-content-center btn-toggle"
                style={{
                  // backgroundColor: "#B0B0B0",
                  // backgroundColor: "white",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                }}

              >
                <CIcon icon={cilCog} size="sm" className='icon-toggle' />
              </button>
            </CTooltip>
            <CCardTitle className="text-center fs-4" style={{ flexGrow: 1 }}>
              TABLE MATERIAL REQUESTION FORM
            </CCardTitle>
          </div>
        </CCardHeader>
        <CCardBody className='px-4' style={{overflow: 'auto'}}>
          
          <CRow >
            <CCard className='p-0 overflow-hidden'>
              <CCardBody className="p-0">
                <DataTable
                  removableSort
                 
                  filters={queryFilter}
                  showGridlines 
                  size="small"
                  // paginator
                  rows={10}
                  rowsPerPageOptions={[15, 25, 50, 100]}
                  tableStyle={{ minWidth: '50rem' }}
                  value={dataSchedules}
                  filterDisplay="row"
                  className="custom-table"
                >
                  <Column className='' header="No" body={(rowBody, {rowIndex})=>rowIndex+1}></Column>
                  <Column className='' field=''  header="DN No"></Column>
                  <Column className='' field=''  header="Vendor Name" ></Column>
                  <Column className='' field=''  header="Truck Station" ></Column>
                  <Column className='' field=''  header="Rit" ></Column>
                  <Column className='' field=''  header="Plan Date" ></Column>
                  <Column className='' field=''  header="Plan Time" ></Column>
                  <Column className='' field=''  header="Arriv. Date" ></Column>
                  <Column className='' field=''  header="Arriv. Time" ></Column>
                  {/* <Column className='' field='deliveryNotes.departureActualDate'  header="Departure Date" /> */}
                  <Column className='' field=''  header="Dept. Time" ></Column>
                  <Column className='' field=''  header="Status"  ></Column>
                  <Column className='' field=''  header="Materials"  ></Column>
              
                </DataTable>
                <CCol className="d-flex justify-content-center py-3" style={{ position: "relative" }}>
                  <CPagination aria-label="Page navigation">
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      <FaAnglesLeft/>
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <FaChevronLeft/>
                    </CPaginationItem>

                    {visiblePages.map((page) => (
                      <CPaginationItem
                        key={page}
                        active={currentPage === page}
                        onClick={() => {
                          console.log("page:", page)
                          setCurrentPage(page)
                        }}
                      >
                        {page}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        console.log("currentPage in pagination:", currentPage)
                        setCurrentPage(currentPage + 1)
                      }}
                    >
                      <FaChevronRight/>
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      <FaAnglesRight/>
                    </CPaginationItem>
                  </CPagination>
               
                  <div style={{ position: "absolute", right: "30%"}}>
                    <Dropdown 
                      value={limitPerPage} 
                      onChange={(e) => {
                        fetchChartReceivingData(selectedStatus, 1, e.value.code)
                        setLimitPerPage(e.value)
                      }} 
                      options={[
                        {name: 10, code: 10},
                        {name: 25, code: 25},
                        {name: 50, code: 50},
                      ]} 
                      optionLabel="name" 
                      // placeholder="Select a City" 
                      className="w-full md:w-14rem" 
                    />
                  </div>
                </CCol>
              </CCardBody>

            </CCard>
            </CRow>
            <CModal 
              visible={showModalInput.state}
              onClose={() => setShowModalInput({state: false, enableSubmit: false})}
              size='xl'
              backdrop="static"
            >
              <CModalHeader>
                <CModalTitle>List Materials Received</CModalTitle>
              </CModalHeader>
              <CModalBody> 
                <CRow>
                  <CCol sm='3'>
                    <CFormText>DN NO</CFormText>  
                    <CFormLabel>AA</CFormLabel>
                  </CCol>
                  <CCol>
                    <CFormText>VENDOR NAME</CFormText>  
                    <CFormLabel>AA</CFormLabel>
                  </CCol>
                </CRow>
                <CRow className='pt-1'>
                  <DataTable
                    className="p-datatable-sm custom-datatable text-nowrap"
                    tableStyle={{ minWidth: '50rem' }}
                    removableSort
                    size="small"
                    scrollable
                    scrollHeight="50vh"
                    showGridlines
                    // paginator
                    rows={10}

                    filterDisplay="row"
                  >
                    <Column header="No" body={(rowBody, {rowIndex})=>rowIndex+1} />
                    <Column field=''  header="Material No" />
                    <Column field=''  header="Material Description" />
                    <Column field=''  header="Rack Address" />
                    <Column field="" header="Req. Qty" />
                    <Column field="" header="Act. Qty"  />
                    <Column field="" header="Remain" align="center" />
                    <Column   field=''  header="Status"  />
                  </DataTable>
                </CRow>
                <CRow  className='mt-1 px-2'></CRow>
              </CModalBody>
            </CModal>
       </CCardBody>   
       </CCard>
        </CRow>
  </CContainer>
  )
}

export default ApprovalRequest
