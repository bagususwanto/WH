import React, { useState, useEffect,useRef } from 'react'
import '../../scss/_tabels.scss'
import { NumericFormat } from 'react-number-format';
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
import {getDummyApproval} from '../../services/DummyService';
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'; // Icon bawaan PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeicons/primeicons.css';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { MdInventory2,MdScience  } from 'react-icons/md'; // contoh icon material
import {  cilClipboard } from '@coreui/icons';
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
  CFormInput,
  CProgress,
  CTooltip,
  CRow,
  CTable,
  CCollapse,
  CFormCheck,
  CTabContent,
  CTabPane,
  CTabList,
  CTab,
  CTabs,
  CFormSelect,
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
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
   const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [visibleA, setVisibleA] = useState(true)
    const [visibleB, setVisibleB] = useState(true)
    const [visibleC, setVisibleC] = useState(true)
    const [MaterialNo, setMaterialNo] = useState(false)
    const [Replace, setReplace] = useState(false)
    const [plant, setPlant] = useState('');
    const [storage, setStorage] = useState('');
    const [division, setDivision] = useState('');
    const [dept, setDept] = useState('');
    const [ext, setExt] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [newMaterial, setNewMaterial] = useState(false);
    const [extendMaterial, setExtendMaterial] = useState(false);
    const [replaceMaterial, setReplaceMaterial] = useState(false);
    const [addProcess, setAddProcess] = useState(false);
    const [improvement, setImprovement] = useState(false);
    const [others, setOthers] = useState(false);
    const [canBeRepaired, setCanBeRepaired] = useState(false);
    const [cannotBeRepaired, setCannotBeRepaired] = useState(false);
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [maker, setMaker] = useState('');
    const [unit, setUnit] = useState('');
    const [uom, setUom] = useState('');
    const [line, setLine] = useState('');
    const [process, setProcess] = useState('');
    const [equipment, setEquipment] = useState('');
    const [nomaterial, setNoMaterial] = useState('');
    const [rop, setRop] = useState(false);
    const [oth, setOth] = useState(false);
    const [gentani, setGentani] = useState('');
    const [point, setPoint] = useState('');
    const [rounding, setRounding] = useState('');
    const [usage, setUsage] = useState('');
    const [price, setPrice] = useState('');
    const [rack, setRack] = useState('');
    const itemsPerPage = 5; // jumlah item per halaman

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(data.length / itemsPerPage);
  
   const [ showModalInput, setShowModalInput] = useState({
      state: false,
      enableSubmit: false
    })
      useEffect(() => {
            const approvalData = getDummyApproval();
            setData(approvalData);
            setFilteredData(approvalData);
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


  const handleOpenDetail = (item) => {
    setShowModal(true);
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
            <CTabs activeItemKey={'waiting approval'}>
                  <CTabList variant="underline-border">
                    <CTab
                      aria-controls="Confirmation-tab-pane"
                      itemKey={'waiting approval'}
                      onClick={() => handleTabChange()}
                    >
                      Waiting Approve
                    </CTab>
                    <CTab
                      aria-controls="Ready Pickup-tab-pane"
                      itemKey={'approved'}
                      onClick={() => handleTabChange('approved')}
                    >
                      Approved
                    </CTab>
                  </CTabList>
            {currentItems.map((item, index) => (
              <div key={index}>
           <CCard className='mb-2 mt-3 '>
             <CCardBody>
              <CRow>
              <CCol xs={4} md={4} lg={4} className="d-flex align-items-center">
                <CFormLabel
                  className="me-2"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {index + 1}
                </CFormLabel>
                <CFormLabel style={{fontSize:'14px'}} className="me-2">12/12/1990</CFormLabel>
                <CFormLabel style={{fontWeight:'100',fontSize:'14px'}}>Req-Form-122222222</CFormLabel>
              </CCol>

              <CCol xs={8} md={8} lg={8} className="d-flex align-items-center justify-content-end">
                <CBadge color="warning" className="me-2">Waiting Approval</CBadge>
              </CCol>
            </CRow>
            <hr className="my-1" />

            <CRow className="mt-2">
              <CCol xs={6} md={6} lg={6}>
               <CRow>
                    <CCol xs={2} md={2} lg={2}>
                      <strong className='me-2'>Form </strong>
                    </CCol>
                    <CCol xs={12} md={4} lg={4}>
                        <CFormLabel>: Jhames Anderson</CFormLabel>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs={2} md={2} lg={2}>
                      <strong className='me-2'>Role </strong>
                    </CCol>
                    <CCol xs={12} md={4} lg={4}>
                      <CFormLabel>: Team leader</CFormLabel>
                    </CCol>
                </CRow>
                
                <CRow>
                    <CCol xs={2} md={2} lg={2}>
                      <strong>Section </strong>
                    </CCol>
                    <CCol xs={12} md={4} lg={4}>
                      <CFormLabel>: Assy Barat</CFormLabel>
                    </CCol>
                </CRow>
                </CCol>
                {/* ///Sebelah kanan/// */}
               
                <CCol xs={6} md={6} lg={6}>
                <div className="d-flex justify-content-end">
                  <div>
                    <CRow>
                      <CCol xs={9}>
                        <CFormLabel>Soda Baskil Matr</CFormLabel>
                      </CCol>
                      <CCol xs={3}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                          }}
                        >
                            <MdInventory2 size={14} color="#333" />
                        </div>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol xs={9}>
                        <CFormLabel>Non Chemical</CFormLabel>
                      </CCol>
                      <CCol xs={3}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                          }}
                        >
                            <MdScience size={14} color="#007bff" />
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                </div>
              </CCol>
              </CRow>
              <CRow>
                <CCol xs={12} md={12} lg={12}>
                  <div className="d-flex justify-content-end">
                <CButton 
                style={{color:'white', backgroundColor:'#3674B5'}} 
                className='mt-2 me-1 '
                onClick={() => handleOpenDetail(item)}
                >
                  <CIcon icon={cilClipboard} className="me-2" />
                  <label>Detail Req.Form</label>
                </CButton>
                </div>
                </CCol>
              </CRow>
            </CCardBody>
         </CCard>
         </div>
        ))}
        <CPagination align="center" className="mt-3">
          <CPaginationItem 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </CPaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <CPaginationItem 
              key={i} 
              active={currentPage === i + 1} 
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </CPaginationItem>
          ))}

          <CPaginationItem 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </CPaginationItem>
        </CPagination>

         <CModal visible={showModal} onClose={() => setShowModal(false)} size="xl">
          <CModalHeader >
            <CModalTitle>Detail New Material Request </CModalTitle>
          </CModalHeader>
          <CModalBody>
          <CCard className="mb-3">
            <CCardHeader style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold' }}>
                Biodata
              </CCardHeader>
              <CCardBody>
                <CRow>
                <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label={
                    <>
                    <span style={{ fontWeight:'620' }}>Plant</span> 
                    <span style={{ color: 'red' }}>*</span>
                    </>}
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  value={plant}
                  onChange={(e) => setPlant(e.target.value)}
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label={<>
                    <span style={{ fontWeight:'620' }}> Storage</span> 
                    <span style={{ color: 'red' }}>*</span>
                    </>}
                  placeholder="Select Storage"
                  className="p-column-filter mb-2"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  style={{ width: '100%', borderRadius: '5px' }}
                  disabled={!plant}
                />
              </CCol>

              <CCol xs={12} sm={4} md={2}>
                <CFormLabel>Date</CFormLabel>
                <Flatpickr
                  value={date}
                  onChange={(selectedDates) => setDate(selectedDates[0])}
                  options={{
                    dateFormat: "Y-m-d",
                    enableTime: false,
                  }}
                  placeholder="Select Date"
                  className="p-column-filter mb-2 form-control"
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                label={<>
                  <span style={{ fontWeight:'620' }}> Division</span> 
                  <span style={{ color: 'red' }}>*</span>
                  </>}
                  placeholder="Select Division"
                  className="p-column-filter mb-2"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  style={{ width: '100%', borderRadius: '5px' }}
                  disabled={!storage}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                label={<>
                  <span style={{ fontWeight:'620' }}> Dept</span> 
                  <span style={{ color: 'red' }}>*</span>
                  </>}
                  placeholder="Select Dept."
                  className="p-column-filter mb-2"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  style={{ width: '100%', borderRadius: '5px' }}
                  disabled={!division}
                />
              </CCol>

              <CCol xs={12} sm={6} md={2}>
                <CFormInput
                  label={<>
                    <span style={{ fontWeight:'620' }}> Ext</span> 
                    <span style={{ color: 'red' }}>*</span>
                    </>}
                  placeholder="Select Ext"
                  className="p-column-filter mb-2"
                  value={ext}
                  onChange={(e) => setExt(e.target.value)}
                  style={{ width: '100%', borderRadius: '5px' }}
                  disabled={!division}
                />
              </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <CCard className="mb-3">
            <CCardHeader style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold' }}>
                Reason
              </CCardHeader>
              <CCardBody>
                <CRow >
                  <CCol xs={4} sm={4} md={4}>
                    <CButton color="primary" variant="ghost"onClick={() => setVisibleA(!visibleA)}>
                    <span style={{ fontWeight:'620' }}>  Reason A</span> 
                    <span style={{ color: 'red' }}>*</span>
                    </CButton>
                  </CCol>
                  <CRow>
                    <CCol xs={4}>
                      <CCollapse visible={visibleA}>
                        <CCard className="mt-2 mb-3">
                          <CCardBody>
                            <CFormCheck id="flexCheckDefault" label="New Material / Item Baru"
                              checked={newMaterial}
                              onChange={() => setNewMaterial(!newMaterial)} />
                            <CFormCheck
                              id="check-extend-material"
                              label="Extend Material From WH . . . . . . . . ."
                              checked={MaterialNo}
                              onChange={() => setMaterialNo(!MaterialNo)}
                            />
                            <CFormCheck
                              id="check-replace-material"
                              label="Replace Material / Menggantikan Material "
                              checked={Replace}
                              onChange={() => setReplace(!Replace)}
                            />
                          </CCardBody>
                        </CCard>
                      </CCollapse>
                    </CCol>
                    <CCol xs={6} sm={6} md={3}>
                      <CCollapse visible={MaterialNo}>
                        <CFormInput
                          label="Material No"
                          placeholder="B....-........"
                          className="p-column-filter mb-2"
                          showClear
                          style={{ width: '100%', borderRadius: '5px' }}
                        />
                      </CCollapse>
                    </CCol>
                    <CCol xs={6} sm={6} md={3}>
                      <CCollapse visible={Replace}>
                        <CFormInput
                          label="Replace Material No"
                          placeholder="B....-........"
                          className="p-column-filter mb-2"
                          showClear
                          style={{ width: '100%', borderRadius: '5px' }}
                        />
                      </CCollapse>
                    </CCol>
                  </CRow>
                  <hr />
                  <CRow>
                  <CCol xs={6} sm={6} md={6}>
                    <CButton
                      color="primary"
                      variant="ghost"
                      onClick={() => setVisibleB(!visibleB)}
                      className="mb-2"
                    >
                      <span style={{ fontWeight:'620' }}> Reason B</span> 
                      <span style={{ color: 'red' }}>*</span>
                      
                    </CButton>
                    <CCollapse visible={visibleB}>
                      <CCard className="mt-2 mb-3">
                        <CCardBody>
                          <CFormCheck
                          label="Add Process / Penambahan Proses"
                          checked={addProcess}
                          onChange={() => setAddProcess(!addProcess)} />
                          <CFormCheck 
                          label="Improvement / Peningkatan" 
                          checked={improvement}
                          onChange={() => setImprovement(!improvement)}/>
                          <CFormCheck
                          label="Others / Lain-lain" 
                          checked={others}
                          onChange={() => setOthers(!others)}/>
                        </CCardBody>
                      </CCard>
                    </CCollapse>
                  </CCol>

                  <CCol xs={6} sm={6} md={6}>
                    <CButton
                      color="primary"
                      variant="ghost"
                      onClick={() => setVisibleC(!visibleC)}
                      className="mb-2"
                    >
                      <span style={{ fontWeight:'620' }}>Reason C</span> 
                      <span style={{ color: 'red' }}>*</span>
                    </CButton>
                    <CCollapse visible={visibleC}>
                      <CCard className="mt-2 mb-3">
                        <CCardBody>
                          <CFormCheck 
                          label="Can be Repaired / Dapat diperbaiki" 
                          checked={canBeRepaired}
                          onChange={() => setCanBeRepaired(!canBeRepaired)}
                          />
                          <CFormCheck 
                          label="Can Not be Repaired / Tidak dapat diperbaiki"
                          checked={cannotBeRepaired}
                          onChange={() => setCannotBeRepaired(!cannotBeRepaired)}
                          />
                        </CCardBody>
                      </CCard>
                    </CCollapse>
                  </CCol>
                </CRow>
                    </CRow>
                  </CCardBody>
                </CCard>
            {/* Basic data */}
            <CCard className="mb-3">
            <CCardHeader style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold' }}>
            Basic Data/Data Utama
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol xs={12} sm={8} md={8}>
                  <CFormLabel style={{ fontWeight: "620" }}>Description / Deskripsi 
                    <span style={{color:'red'}}>*</span></CFormLabel>
                  <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                    <CFormInput
                      placeholder="Select  Description"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    </CCol>
                </CRow>
                <CRow>
                  <CCol xs={12} sm={8} md={8}>
                  <CFormLabel style={{ fontWeight: "620" }}>Type / Tipe
                  <span style={{color:'red'}}>*</span></CFormLabel>
                  <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                    <CFormInput
                      placeholder="Select Type"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={!description}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol xs={12} sm={8} md={8}>
                  <CFormLabel style={{ fontWeight: "620" }}>Maker / Merk
                  <span style={{color:'red'}}>*</span></CFormLabel>
                  <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                    <CFormInput
                      placeholder="Select Maker"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={maker}
                      onChange={(e) => setMaker(e.target.value)}
                      disabled={!type}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol xs={6} sm={4} md={3}>
                  <CFormLabel style={{ fontWeight: "620" }}>Unit of Measure / Satuan
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="(Pc/Unit/Set/KG, etc)"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      disabled={!maker}
                    />
                  </CCol>
                  <CCol xs={6} sm={4} md={3}>
                  <CFormLabel style={{ fontWeight: "620" }}>Alternative UoM</CFormLabel>
                    <CFormInput
                      placeholder="(Box/Ltr/Unit, etc)"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={uom}
                      onChange={(e) => setUom(e.target.value)}
                      disabled={!unit}
                    />
                  </CCol>
                </CRow>
                <hr/>
                <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}>
                  This Material will be used for / Material akan digunakan sebagai :
                </label>
                <CRow>
                  <CCol xs={6} sm={4} md={3}>
                  <CFormLabel style={{ fontWeight: "620" }}>Line
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Line"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={line}
                      onChange={(e) => setLine(e.target.value)}
                    />
                  </CCol>
                  </CRow>
                  <CRow>
                  <CCol xs={6} sm={4} md={5}>
                  <CFormLabel style={{ fontWeight: "620" }}>Process / Proses
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Process"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={process}
                      onChange={(e) => setProcess(e.target.value)}
                      disabled={!line}
                    />
                  </CCol>
                  </CRow>
                  <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Equipment / Mesin
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Equipment"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      disabled={!process}
                    />
                  </CCol>
                </CRow>
                <hr/>
                <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}>
                Fill in by Warehouse / Diisi oleh Warehouse
                </label>
                <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Material Number</CFormLabel>
                    <CFormInput
                      placeholder="Select Material Number"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      disabled
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <CCard className="mb-3">
              <CCardHeader 
              style={{ position:'relative',textAlign: 'center',fontWeight: "bold" }}>MRP (Material Requirement Planning) / Standard Stock
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol>
                    <CRow className='mb-2'>
                      <CCol xs={12} sm={4} md={4}>
                        <span className=" fs-6  " style={{paddingTop: '10px',fontWeight:'620'}}>MRP Type / Tipe Stock</span>
                        <span style={{color:'red'}}>*</span>
                      </CCol>
                      <CCol xs={12} sm={4} md={8}>
                        <CRow>
                        <CCol xs={12} sm={4} md={12}>
                  
                        <CFormCheck
                          id="check-rop-material"
                          checked={rop}
                          onChange={() => setRop(!rop)}
                        />
                        <CFormLabel className='px-2' style={{ fontWeight: "bold" }}>ROP</CFormLabel>
                        <label className='px-2' style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}> 
                          (Stock avalable & maintained) / Stock tersedia & dikelola oleh Warehouse</label>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol xs={12} sm={12} md={12}>
                            <CFormCheck
                                id="check-oth-material"
                                checked={oth}
                                onChange={() => setOth(!oth)}
                              />
                              <CTooltip content="Jika Material tidak diambil /digunakan dalam waktu 3 tahun, maka user wajib bertanggung jawab atas stock yang tersisa di warehouse (wajib diambil)."
                                placement="top">
                              <CFormLabel className='px-2' style={{ fontWeight: "bold" }}>OTH</CFormLabel>
                            </CTooltip>
                            <label className='px-2' style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}> 
                            (Stock 0 order by Reservation) / Stock tidak tersedia Order via RFOnline</label>
                          </CCol>
                        </CRow>
                        </CCol>
                    </CRow>
                  </CCol>
                </CRow>
                <hr/>
                <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Gentan-i
                  <span style={{color:'red'}}>*</span></CFormLabel>
                  <CFormInput
                      placeholder="Select Maker"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: "100%", borderRadius: "5px" }}
                      checked={gentani}
                      onChange={(e) => setGentani(e.target.value)}
                    />
                  </CCol>
                  </CRow>
                  <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Reorder Point / Titik order
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Maker"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={point}
                      onChange={(e) => setPoint(e.target.value)}
                      disabled={!gentani}
                    />
                  </CCol>
                  </CRow>
                <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Rounding Value / Kelipatan Order
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Maker"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={rounding}
                      onChange={(e) => setRounding(e.target.value)}
                      disabled={!point}
                      
                    />
                  </CCol>
                  </CRow>
                  <CRow>
                  <CCol xs={6} sm={4} md={4}>
                  <CFormLabel style={{ fontWeight: "620" }}>Usage / Pemakaian
                  <span style={{color:'red'}}>*</span></CFormLabel>
                    <CFormInput
                      placeholder="Select Maker"
                      className="p-column-filter mb-2"
                      showClear
                      style={{ width: '100%', borderRadius: '5px' }}
                      checked={usage}
                      onChange={(e) => setUsage(e.target.value)}
                      disabled={!rounding}
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <CCard>
              <CCardHeader style={{position:'relative', textAlign: 'center',fontWeight: "bold" }}>Accounting
              </CCardHeader>
              <CCardBody>
                <CRow>
                <CCol xs={6} sm={4} md={4}>
                <CFormLabel style={{ fontWeight: "630" }}>Standard, Average Prive / Harga</CFormLabel>
                <span style={{color:'red'}}>*</span>
                <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    allowNegative={false}
                    className="form-control p-column-filter mb-2"
                    placeholder="Rp 0"
                    style={{ width: '100%', borderRadius: '5px' }}
                    value={price}
                    onValueChange={(values) => setPrice(values.value)}
                  />
                </CCol>
                  <CCol xs={6} sm={6} md={6} style={{ textAlign: 'left', paddingTop: '35px', fontStyle: 'italic', fontWeight: '200' }}>
                    (Please submit Quotation / Lampirkan Penawaran Harga)
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <CCard className='mt-3 mb-3'>
              <CCardHeader 
              style={{ position:'relative',textAlign: 'center',fontWeight: "bold" }}> Others / Lain - lain
              </CCardHeader>
              <CCardBody>
              <CCol xs={4} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Storage Bin / Alamat Rack</CFormLabel>
                <CFormInput
                  placeholder="Select Standard"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                />
                </CCol>
                <CRow>
                  <CCol xs={4} sm={4} md={4}>
                  <CButton 
                      color="primary"  
                      variant="ghost" 
                      style={{ fontWeight: "bold", fontStyle: "italic", textDecoration: "underline" }} 
                      onClick={() => setVisibleC(!visibleC)}
                    >
                      (Required) For Chemical Material
                  </CButton>

                  </CCol>

                  <CRow>
                    <CCol>
                      <CCollapse visible={visibleC}>
                        <CCard className="mt-2 mb-3">
                          <CCardBody>
                            <CRow>
                              <CCol xs={4}>
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="MSDS"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="SoC Free Letter"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Proper Storage (grounding, etc)"
                                />
                              </CCol>
                              <CCol xs={5}>
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Flammable"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Corrosives, Toxic"
                                />
                              </CCol>
                              <CCol xs={3}>
                              <span
                                  style={{
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    fontWeight: 'bold',
                                    color: 'black',
                                    backgroundColor: 'yellow',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Please Plant Environment Secretary Acknowledge
                                </span>
                              </CCol>
                            </CRow>
                            <hr />
                            <CRow>
                              <CCol xs={6}>
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Cost Reduction / Penurunan Biaya"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Drawing / Gambar teknik"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Trial Result / Hasil Trial"
                                />
                                <CFormCheck
                                  id="flexCheckDefault"
                                  label="Improvement Report"
                                />
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCollapse>
                    </CCol>
                  </CRow>
                </CRow>
                <CRow className="mt-2 ">
                <CCol xs={12} sm={12} md={12} className='text-end'>

                <CButton 
                style={{color:'white', backgroundColor:'#328E6E'}} 
                className='mt-2 me-1 '
                // onClick={() => handleOpenDetail(item)}
                >
                  <CIcon icon={cilClipboard} className="me-2" />
                  <label>Approval</label>
                </CButton>
                </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            </CModalBody>
        </CModal>
        </CTabs>
       </CCardBody>   
       </CCard>
        </CRow>
       
  </CContainer>
  )
}

export default ApprovalRequest
