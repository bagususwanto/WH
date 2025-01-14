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
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
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
                <Dropdown
                  label="Dept"
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
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
              <CCol xs={12} sm={6} md={4}>
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
                <CButton color="primary" onClick={() => setVisibleA(!visibleA)}>
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
                  <CButton color="primary" onClick={() => setVisibleB(!visibleB)}>
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
                  <CButton color="primary" onClick={() => setVisibleC(!visibleC)}>
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
          <CCardHeader>Basic Data/Data Utama </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
                <CFormInput
                  label=" Description / Deskripsi"
                  placeholder="Select  Description"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
                <CFormInput
                  label="Type / Tipe"
                  placeholder="Select Type"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} sm={8} md={8}>
                <CFormInput
                  label="Maker / Merk"
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Unit of Measure / Satuan"
                  placeholder="Select Unit of Measure"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Alternative UoM"
                  placeholder="Select UoM"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={3}>
                <CFormInput
                  label="Line"
                  placeholder="Select Line"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={5}>
                <CFormInput
                  label="Process / Proses"
                  placeholder="Select Process"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Equipment / Mesin"
                  placeholder="Select Equipment"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Material Number"
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
          <CCardHeader>MRP (Material Requirement Planning) / Standard Stock</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                <CRow>
                  <CCol xs={12} sm={4} md={4}>
                    <h6 className=" fs-6">New Material Requistion Form</h6>
                  </CCol>
                  <CCol xs={12} sm={6} md={6}>
                    <CFormCheck
                      id="flexCheckDefault"
                      label=" ROP (Stock avalable & maintained) / Stock tersedia & dikelola oleh Warehouse"
                    />
                    <CFormCheck
                      id="flexCheckDefault"
                      label=" OTH (Stock 0 order by Reservation) / Stock tidak tersedia Order via RFOnline"
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>

            <CRow>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Gentan-i"
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Reorder Point / Titik order"
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Unit of Measure / Satuan"
                  placeholder="Select Maker"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={6} sm={4} md={4}>
                <CFormInput
                  label="Alternative UoM"
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
          <CCardHeader>MRP (Material Requirement Planning) / Standard Stock</CCardHeader>
          <CCardBody>
            <CCol xs={6} sm={4} md={4}>
              <CFormInput
                label=" Standard, Average Prive / Harga"
                placeholder="Select Standard"
                className="p-column-filter mb-2"
                showClear
                style={{ width: '100%', borderRadius: '5px' }}
              />
            </CCol>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardHeader> Others / Lain - lain</CCardHeader>
          <CCardBody>
            <CFormInput
              label="Storage Bin / Alamat Rack"
              placeholder="Select Standard"
              className="p-column-filter mb-2"
              showClear
              style={{ width: '100%', borderRadius: '5px' }}
            />
            <CRow>
              <CCol xs={4} sm={4} md={4}>
                <CButton color="primary" onClick={() => setVisibleC(!visibleC)}>
                  Reason C
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
                              label="Can be Repaired / Dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                          </CCol>
                          <CCol xs={6}>
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can be Repaired / Dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                          </CCol>
                        </CRow>
                        <hr />
                        <CRow>
                          <CCol xs={6}>
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can be Repaired / Dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                          </CCol>
                          <CCol xs={6}>
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can be Repaired / Dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
                            />
                            <CFormCheck
                              id="flexCheckDefault"
                              label="Can Not be Repaired / Tidak dapat diperbaiki"
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
