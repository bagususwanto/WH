import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { MultiSelect } from 'primereact/multiselect'
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

  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [uploadData, setUploadData] = useState({
    importDate: date,
    file: null,
  })

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

  return (
    <CRow>
      <h3 className="fw-bold fs-4">New Material Requistion Form</h3>

      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Biodata </CCardHeader>
          <CCardBody>
            <CRow>
            <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label="Plant"
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label="Storage"
                  placeholder="Select Storage"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={4} md={2}>
                  <CFormLabel>Date</CFormLabel>
                  <Flatpickr
                    value={date}
                    onChange={(selectedDates) => setDate(selectedDates[0])}
                    options={{
                      dateFormat: "Y-m-d",
                      enableTime: false, // Set to true if you need time selection
                    }}
                    placeholder="Select Date"
                    className="p-column-filter mb-2 form-control"
                    style={{ width: "100%", borderRadius: "5px" }}
                  />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label="Division"
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <CFormInput
                  label="Dept."
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={2}>
                <CFormInput
                  label="Ext"
                  placeholder="Select Type"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Reason </CCardHeader>
          <CCardBody>
            <CRow className="mt-2">
              <CCol xs={4} sm={4} md={4}>
                <CButton color="primary" variant="ghost"onClick={() => setVisibleA(!visibleA)}>
                  Reason A
                </CButton>
              </CCol>

              <CRow>
                <CCol xs={4}>
                  <CCollapse visible={visibleA}>
                    <CCard className="mt-2 mb-3">
                      <CCardBody>
                        <CFormCheck id="flexCheckDefault" label="New Material / Item Baru" />
                        <CFormCheck
                          id="flexCheckDefault"
                          label="Extend Material From WH . . . . . . . . ."
                          onClick={() => setMaterialNo(!MaterialNo)}
                        />
                        <CFormCheck
                          id="flexCheckDefault"
                          label="Replace Material / Menggantikan Material "
                          onClick={() => setReplace(!Replace)}
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
                <CCol xs={4} sm={4} md={4}>
                  <CButton color="primary" variant="ghost" onClick={() => setVisibleB(!visibleB)}>
                    Reason B
                  </CButton>
                </CCol>
                <CRow>
                  <CCol xs={4}>
                    <CCollapse visible={visibleB}>
                      <CCard className="mt-2 mb-3">
                        <CCardBody>
                          <CFormCheck
                            id="flexCheckDefault"
                            label="Add Process / Penambahan Proses"
                          />
                          <CFormCheck id="flexCheckDefault" label="Improvement / Peningkatan" />
                          <CFormCheck id="flexCheckDefault" label="Others / Lain-lain" />
                        </CCardBody>
                      </CCard>
                    </CCollapse>
                  </CCol>
                </CRow>
              </CRow>
              <CRow>
                <hr />
                <CCol xs={4} sm={4} md={4}>
                  <CButton color="primary" variant="ghost" onClick={() => setVisibleC(!visibleC)}>
                    Reason C
                  </CButton>
                </CCol>
              </CRow>
            </CRow>
            <CRow>
              <CCol xs={4}>
                <CCollapse visible={visibleC}>
                  <CCard className="mt-2 mb-3">
                    <CCardBody>
                      <CFormCheck
                        id="flexCheckDefault"
                        label="Can be Repaired / Dapat diperbaiki"
                      />
                      <CFormCheck
                        id="flexCheckDefault"
                        label="Can Not be Repaired / Tidak dapat diperbaiki"
                      />
                    </CCardBody>
                  </CCard>
                </CCollapse>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        {/* Basic data */}
        <CCard className="mb-3">
          <CCardHeader  style={{ textAlign: 'center',fontWeight: "bold" }}>Basic Data/Data Utama </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
              <CFormLabel style={{ fontWeight: "bold" }}>Description / Deskripsi</CFormLabel>
              <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                <CFormInput
                  placeholder="Select  Description"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
                 </CCol>
           

            </CRow>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
              <CFormLabel style={{ fontWeight: "bold" }}>Type / Tipe</CFormLabel>
              <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                <CFormInput
                  placeholder="Select Type"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
              <CFormLabel style={{ fontWeight: "bold" }}>Maker / Merk</CFormLabel>
              <CFormLabel className='px-1' style={{ fontWeight: "lighter" }}>(Max. Characters :40 Letters)</CFormLabel>
                <CFormInput
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={3}>
              <CFormLabel style={{ fontWeight: "bold" }}>Unit of Measure / Satuan</CFormLabel>
                <CFormInput
                  placeholder="(Pc/Unit/Set/KG, etc)"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={3}>
              <CFormLabel style={{ fontWeight: "bold" }}>Alternative UoM</CFormLabel>
                <CFormInput
                  placeholder="(Box/Ltr/Unit, etc)"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <hr/>
            <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}>
              This Material will be used for / Material akan digunakan sebagai :
            </label>
            <CRow>
              <CCol xs={6} sm={4} md={3}>
              <CFormLabel style={{ fontWeight: "bold" }}>Line</CFormLabel>
                <CFormInput
                  placeholder="Select Line"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              </CRow>
              <CRow>
              <CCol xs={6} sm={4} md={5}>
              <CFormLabel style={{ fontWeight: "bold" }}>Process / Proses</CFormLabel>
                <CFormInput
                  placeholder="Select Process"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              </CRow>
              <CRow>
              <CCol xs={6} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Equipment / Mesin</CFormLabel>
                <CFormInput
                  placeholder="Select Equipment"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <hr/>
            <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}>
            Fill in by Warehouse / Diisi oleh Warehouse
            </label>
            <CRow>
              <CCol xs={6} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Material Number</CFormLabel>
                <CFormInput
                  placeholder="Select Material Number"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader  style={{ textAlign: 'center',fontWeight: "bold" }}>MRP (Material Requirement Planning) / Standard Stock</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                <CRow className='mb-2'>
                  <CCol xs={12} sm={4} md={4}>
                    <h6 className=" fs-6 fw-bold" style={{paddingTop: '20px',}}>MRP Type / Tipe Stock</h6>
                  </CCol>
                  <CCol xs={12} sm={4} md={8}>
                    <CRow>
                    <CCol xs={12} sm={4} md={1}>
                   
                    <CFormCheck
                      id="flexCheckDefault"
                    />
                     <CFormLabel className='px-1' style={{ fontWeight: "bold" }}>ROP</CFormLabel>
                    </CCol>
                    <CCol xs={12} sm={10} md={10}>
                    <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}> 
                      (Stock avalable & maintained) / Stock tersedia & dikelola oleh Warehouse</label>
                    </CCol>
                    </CRow>
                    <CRow>
                    <CCol xs={12} sm={4} md={1}>
                     
                    <CFormCheck
                      id="flexCheckDefault"
                    />
                    
                     <CTooltip content="Jika Material tidak diambil /digunakan dalam waktu 3 tahun, maka user wajib bertanggung jawab atas stock yang tersisa di warehouse (wajib diambil)."
                       placement="top">
                     <CFormLabel className='px-1' style={{ fontWeight: "bold" }}>OTH</CFormLabel>
                     </CTooltip>
                     </CCol>
                     <CCol xs={12} sm={10} md={10}>
                    <label style={{ textAlign: 'right', fontStyle: 'italic',fontWeight: '300'}}> 
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
              <CFormLabel style={{ fontWeight: "bold" }}>Gentan-i</CFormLabel>
              <CFormInput
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </CCol>
              </CRow>
              <CRow>
              <CCol xs={6} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Reorder Point / Titik order</CFormLabel>
                <CFormInput
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Rounding Value / Kelipatan Order</CFormLabel>
                <CFormInput
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              </CRow>
              <CRow>
              <CCol xs={6} sm={4} md={4}>
              <CFormLabel style={{ fontWeight: "bold" }}>Usage / Pemakaian</CFormLabel>
                <CFormInput
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardHeader style={{ textAlign: 'center',fontWeight: "bold" }}>Accounting</CCardHeader>
          <CCardBody>
            <CRow>
            <CCol xs={6} sm={4} md={4}>
            <CFormLabel style={{ fontWeight: "bold" }}>Standard, Average Prive / Harga</CFormLabel>
              <CFormInput
                placeholder="Select Standard"
                className="p-column-filter mb-2"
                showClear
                style={{ width: '100%', borderRadius: '5px' }}
              />
            </CCol>
              <CCol xs={6} sm={6} md={6} style={{ textAlign: 'right', paddingTop: '35px', fontStyle: 'italic', fontWeight: '300' }}>
                (Please submit Quotation / Lampirkan Penawaran Harga)
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        <CCard className='mt-3'>
          <CCardHeader style={{ textAlign: 'center',fontWeight: "bold" }}> Others / Lain - lain</CCardHeader>
          <CCardBody>
          <CCol xs={4} sm={4} md={4}>
          <CFormLabel style={{ fontWeight: "bold" }}>Storage Bin / Alamat Rack</CFormLabel>
            <CFormInput
              placeholder="Select Standard"
              className="p-column-filter mb-2"
              showClear
              style={{ width: '100%', borderRadius: '5px' }}
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
                          <CCol xs={6}>
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
                              label="Proper Storage (grounding, etc)
"
                            />
                          </CCol>
                          <CCol xs={6}>
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Flammable"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Corrosives, Toxic"
                            />
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Request
