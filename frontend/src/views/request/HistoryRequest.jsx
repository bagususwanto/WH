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
import {getDummyData} from '../../services/DummyService';
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'; // Icon bawaan PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeicons/primeicons.css';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { cilChart,cilCog} from '@coreui/icons';
import {  FaRegFileAlt   } from "react-icons/fa";
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
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const [selectedRow, setSelectedRow] = useState(null); 
  const [visiblePages, setVisiblePages] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(true); // State to control visibility
  const [ dataDNInquery, setDataDNInquery ] = useState([])
   const [totalPages, setTotalPages] = useState(1);
   const [plants, setPlants] = useState([]); // Plants fetched from API
   const [limitPerPage, setLimitPerPage] = useState({name: 10, code: 10})
   const [isFilterVisible, setIsFilterVisible] = useState(false);
   const [showModal, setShowModal] = useState(false); // State for modal visibility
   const vendorScheduleRef = useRef(null);
   const [ showModalInput, setShowModalInput] = useState({
      state: false,
      enableSubmit: false
    })
    useEffect(() => {
        const dummyData = getDummyData();
        setData(dummyData);
        setFilteredData(dummyData);
      }, []);
    
      const handleFilterSchedule = (selectedOption) => {
        setSelectedStatus(selectedOption);
        if (selectedOption) {
          setFilteredData(data.filter((item) => item.status === selectedOption.value));
        } else {
          setFilteredData(data);
        }
      };
    
      const getStatusColor = (status) => {
        switch (status) {
          case "Rejected":
            return "red";
          case "Approved":
            return "green";
          case "Pending":
            return "orange";
          default:
            return "gray";
        }
      };
    
      const statusBodyTemplate = (rowData) => {
        return (
          <span
            style={{
              backgroundColor: getStatusColor(rowData.status),
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              display: "inline-block",
            }}
          >
            {rowData.status}
          </span>
        );
      };
    
      const groupedOptions = [
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
      ];


  const handleOpenDetail = (rowData) => {
    setSelectedRow(rowData);
    setShowModal(true);
  };

  const detailBodyTemplate = (rowData) => {
    return (
        <CButton style={{ backgroundColor: "transparent", border: "none", padding: 0 }} onClick={() => handleOpenDetail(rowData)}>
        <FaRegFileAlt style={{ color: "blue", fontSize: "1.2rem" }} />
      </CButton>      
    );
  };
  const statusIcons = {
    "Sedang dibuat": "cilClipboard",       // Ikon clipboard untuk dokumen yang baru dibuat
    "Approval SHE": "cilHome",             // Bisa pakai ikon rumah (atau ganti sesuai kebutuhan)
    "Approval Section Head": "cilUser",     // Ikon user untuk level manajerial
    "Approval Dept Head": "cilCheckCircle", // Ikon check circle untuk approval yang lebih tinggi
    "Approval Div Head": "cilTruck",        // Bisa pakai ikon truck sebagai tanda akhir persetujuan
  };
  

      
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
                <CCol md='2'>
                    {/* <div>
                  <CFormText>Filter Plant</CFormText>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    id="plant"
                    options={plants}
                    value={plants.find((opt)=>opt.value === queryFilter.plantId) || ""}
                    styles={{
                      control: (base) => {
                        return ({
                          ...base,
                          width: '250px', // Atur lebar lebih kecil agar lebih proporsional
                          minWidth: '200px',
                          maxWidth: '100%',
                          borderRadius: '5px',
                          padding: '2px',
                          zIndex: 3, // Memberikan prioritas tinggi agar dropdown muncul di atas elemen lain
                          position: 'relative',
                          height: "100%"
                        })
                      },
                      menu: (base) => ({
                        ...base,
                        zIndex: 3, // Pastikan menu dropdown tidak tertutup elemen lain
                      })
                    }}
                  />
                </div> */}
                <div>
                <label className="font-semibold text-gray-700">Filter by Status</label>
                <Select
                onChange={handleFilterSchedule}
                placeholder="All"
                isClearable
                value={selectedStatus}
                options={groupedOptions}
              />
                </div>
                </CCol>
                <DataTable
                  removableSort
                  showGridlines 
                  size="small"
                  value={data}
                  // paginator
                  rows={10}
                  rowsPerPageOptions={[15, 25, 50, 100]}
                  tableStyle={{ minWidth: '50rem' }}
                  filterDisplay="row"
                  className="custom-table"
                >
                    <Column className='' header="No" body={(rowBody, {rowIndex})=>rowIndex+1}></Column>
                    <Column className='' field='reqNo'  header="Req No"></Column>
                    <Column className='' field='reqForm'  header="Req Form" ></Column>
                    <Column className='' field='requser'  header="Req User" ></Column>
                    <Column className='' field='materialRequestion'  header="Material Requestion" ></Column>
                    <Column className='' field='reqDate'  header="Req Date" ></Column>
                    <Column 
                        className='' 
                        field='status'  
                        header="Status"  
                        body={statusBodyTemplate} 
                        bodyStyle={{ textAlign: 'center' }} 
                        ></Column>

                        <Column 
                        className='' 
                        field='detail'  
                        header="Detail"  
                        body={detailBodyTemplate}  
                        bodyStyle={{ textAlign: 'center' }} 
                        ></Column>
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
                          setCurrentPage(page)
                        }}
                      >
                        {page}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => {
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
            {/* Detail Modal */}
            <CModal   visible={showModal} onClose={() => setShowModal(false)} size="xl">
              <CModalHeader>
                <CModalTitle>Detail Information</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedRow && (
                  <CRow>
                    <CCol sm="6">
                      <CFormText>Req No</CFormText>
                      <CFormLabel>{selectedRow.reqNo}</CFormLabel>
                    </CCol>
                    <CCol sm="6">
                      <CFormText>Request Form</CFormText>
                      <CFormLabel>{selectedRow.reqForm}</CFormLabel>
                    </CCol>
                    <CCol sm="6">
                      <CFormText>User</CFormText>
                      <CFormLabel>{selectedRow.requser}</CFormLabel>
                    </CCol>
                    <CCol sm="6">
                      <CFormText>Status</CFormText>
                      <CFormLabel>{selectedRow.status}</CFormLabel>
                    </CCol>
                    <hr/>
<CRow
                    key={item.id}
                    className="mb-3" // Margin bawah antar item
                    style={{
                        alignItems: 'center', // Pastikan elemen rata
                    }}
                    >
                    {/* Kolom Tanggal dan Waktu */}
                    <CCol xs="auto">
                        <label
                        style={{
                            fontSize: '0.8rem',
                            color: isFirst ? '#000' : '#6c757d', // Hitam untuk yang pertama, abu-abu untuk lainnya
                        }}
                        >
                        {format(parseISO(item.createdAt), 'dd MMM yyyy')}
                        {', '}
                        {format(parseISO(item.createdAt), 'HH:mm')}
                        </label>
                    </CCol>

                    {/* Kolom Ikon */}
                    <CCol xs="auto">
                        <div
                        style={{
                            border: `2px solid ${isFirst ? '#000' : '#6c757d'}`, // Warna hitam untuk ikon pertama
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        >
                        <CIcon
                            icon={icons[item.icon]}
                            size="lg"
                            style={{ color: isFirst ? '#000' : '#6c757d' }} // Warna ikon sesuai status
                        />
                        </div>
                    </CCol>

                    {/* Kolom Status */}
                    <CCol>
                        <div
                        style={{
                            fontSize: '0.91rem',
                            textTransform: 'capitalize',
                            color: isFirst ? '#000' : '#495057', // Hitam untuk status pertama, abu-abu gelap untuk lainnya
                        }}
                        >
                        <label style={{ fontSize: '0.96em' }}>{item.status}</label>
                        <div>By : {item.requser}</div>
                        <div>Remark : {item.remarks}</div>
                        </div>
                    </CCol>
                    </CRow>
                  </CRow>
               
                )}
              </CModalBody>
            </CModal>
            </CCard>
            </CRow>
       </CCardBody>   
       </CCard>
        </CRow>
  </CContainer>
  )
}

export default ApprovalRequest
