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
            <CCardTitle className="text-center fs-4" style={{ flexGrow: 1 }}>
              <strong>Approval New Material Request</strong>
            </CCardTitle>
          </div>
        </CCardHeader>
        <CCardBody className='px-4' style={{overflow: 'auto'}}> 
         <CCard>
          <CCardBody>
            </CCardBody>
         </CCard>
       </CCardBody>   
       </CCard>
        </CRow>
  </CContainer>
  )
}

export default ApprovalRequest
