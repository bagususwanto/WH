import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { NumericFormat } from 'react-number-format';
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { MultiSelect } from 'primereact/multiselect'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle, cilWarning } from '@coreui/icons'
import 'primereact/resources/themes/nano/theme.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import {
  CCard,
  CFormLabel ,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CTooltip,
  CFormInput,
  CButton,
  CCollapse,
  CFormCheck,
} from '@coreui/react'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import Select from 'react-select'
import { format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'

const MySwal = withReactContent(swal)

const Request = () => {
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

  const [uploadData, setUploadData] = useState({
    importDate: date,
    file: null,
  })

  const isBiodataFilled = () => {
    const values = [plant, storage, division, dept, ext, date];
    const filledCount = values.filter(Boolean).length;
  
    if (filledCount === values.length) return 'complete';
    if (filledCount > 0) return 'partial';
    return 'empty';
  };
  const isReasonFilled = () => {
    const reasonA = [newMaterial, extendMaterial, replaceMaterial].some(Boolean);
    const reasonB = [addProcess, improvement, others].some(Boolean);
    const reasonC = [canBeRepaired, cannotBeRepaired].some(Boolean);
  
    const totalSelected = [reasonA, reasonB, reasonC].filter(Boolean).length;
  
    if (totalSelected === 3) return 'complete'; // semua section Reason A, B, C terisi
    if (totalSelected > 0) return 'partial';     // minimal satu section terisi
    return 'empty';                              // gak ada yang dipilih
  };
  
  
  const isBasicFilled = () => {
    const values = [
      description,
      type,
      maker,
      unit,
      uom,
      line,
      process,
      equipment,
    ];
    const filledCount = values.filter(Boolean).length;
  
    if (filledCount === values.length) return 'complete';
    if (filledCount > 0) return 'partial';
    return 'empty';
  };
  const isMRPFilled = () => {
    const values = [
      oth,
      rop,
      gentani,
      point,
      rounding,
      usage,
    ];
    const filledCount = values.filter(Boolean).length;
  
    if (filledCount === values.length) return 'complete';
    if (filledCount > 0) return 'partial';
    return 'empty';
  };
  const isAccountingFilled = () => {
    const values = [price];
    const filledCount = values.filter(Boolean).length;
  
    if (filledCount === values.length) return 'complete';
    if (filledCount > 0) return 'partial';
    return 'empty';
  };
  const isOthersFilled = () => {
    const values = [rack];
    const filledCount = values.filter(Boolean).length;
  
    if (filledCount === values.length) return 'complete';
    if (filledCount > 0) return 'partial';
    return 'empty';
  };
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    plant: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    storage: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const BiodataStatusIcon = () => {
    const status = isBiodataFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  const ReasonStatusIcon = () => {
    const status = isReasonFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  const BasicStatusIcon = () => {
    const status = isBasicFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  const MrpStatusIcon = () => {
    const status = isMRPFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  const PriceStatusIcon = () => {
    const status = isAccountingFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  const OtherStatusIcon = () => {
    const status = isOthersFilled();
  
    if (status === 'complete') {
      return <CIcon icon={cilCheckCircle} style={{ color: 'green' }} />;
    }
    if (status === 'partial') {
      return <CIcon icon={cilWarning} style={{ color: 'orange' }} />;
    }
    return <CIcon icon={cilXCircle} style={{ color: 'red' }} />;
  };
  
  const getSectionStatus = () => {
    return [
      isBiodataFilled(),
      isReasonFilled(),
      isBasicFilled(),
      isMRPFilled(),
      isAccountingFilled(),
      isOthersFilled(),
    ];
  };  

  
  const completedCount = getSectionStatus().filter((status) => status === 'complete').length;
  const isAllComplete = completedCount === 6;  

  

  return (
    <CRow>
      <h3 className="fw-bold fs-4">New Material Requistion Form</h3>
      <CCol>
        <CCard className="mb-3">
        <CCardHeader style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold' }}>
            Biodata
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <BiodataStatusIcon />
            </div>
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
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <ReasonStatusIcon />
            </div>
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
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <BasicStatusIcon />
            </div>
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
           <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
           <MrpStatusIcon/>
           </div>
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
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
          <PriceStatusIcon/>
          </div>
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
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
          <OtherStatusIcon/>
          </div>
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
              <strong className='px-3'>{completedCount}/6 Sections Complete</strong>
              <CButton
                  className="px-3" 
                  color={isAllComplete ? 'success' : 'secondary'}
                  disabled={!isAllComplete}
                  style={{
                    transition: 'all 0.3s ease-in-out', // <== ini bikin animasi halus
                    backgroundColor: isAllComplete ? undefined : '#ccc',
                    borderColor: isAllComplete ? undefined : '#ccc',
                    cursor: isAllComplete ? 'pointer' : 'not-allowed',
                    color: isAllComplete ? '#fff' : '#666',
                    fontWeight: isAllComplete ? 'bold' : 'normal', // tebal kalau complete
                  }}
                  
                >
                  Submit
                </CButton>
            </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Request
