import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CCardFooter,
  CTableDataCell,
  CFormLabel,
  CForm,
  CFormSelect,
} from '@coreui/react'
import axiosInstance from '../../utils/AxiosInstance'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/dark.css'

const Inventory = () => {
  const [material, setMaterial] = useState([])
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    getMaterial()
  }, [])

  const getMaterial = async () => {
    try {
      const response = await axiosInstance.get('/material')
      setMaterial(response.data)
    } catch (error) {
      console.error('Error fetching material:', error)
    }
  }

  const handleSearch = () => {
    getMaterial()
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Search</CCardHeader>
          <CCardBody>
            <CForm>
              <CRow>
                <CCol md={4}>
                  <CFormLabel htmlFor="dateInput">Date</CFormLabel>
                  <Flatpickr
                    value={date}
                    onChange={(date) => setDate(date)}
                    options={{
                      dateFormat: 'Y-m-d',
                      maxDate: 'today',
                    }}
                    className="form-control"
                    placeholder="Select a date"
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="plantinput">Plant</CFormLabel>
                  <CFormSelect
                    aria-label="Select a plant"
                    options={[
                      'Select a plant',
                      { label: 'Karawang 1', value: '1' },
                      { label: 'Karawang 2', value: '2' },
                      { label: 'Karawang 3', value: '3' },
                    ]}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="locationinput">Location</CFormLabel>
                  <CFormSelect
                    aria-label="Select a location"
                    options={[
                      'Select a location',
                      { label: 'Coat NPI', value: '1' },
                      { label: 'MCP', value: '2' },
                      { label: 'Sealer Welding', value: '3' },
                    ]}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="shiftinput">Shift</CFormLabel>
                  <CFormSelect
                    aria-label="Select a shift"
                    options={[
                      'Select a shift',
                      { label: 'Day', value: '1' },
                      { label: 'Night', value: '2' },
                    ]}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
          <CCardFooter>
            <CRow className="align-items-end">
              <CCol className="d-flex justify-content-end">
                <CButton color="dark" onClick={handleSearch}>
                  Search
                </CButton>
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>

        <CCard className="mt-3">
          <CCardHeader>Inventory Tabel</CCardHeader>
          <CCardBody>
            <CTable small bordered responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Item No
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Material Description
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Address
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    UoM
                  </CTableHeaderCell>
                  <CTableHeaderCell colSpan="2" className="text-center align-middle">
                    Incoming
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Good Issue
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Standar Stock
                  </CTableHeaderCell>
                  <CTableHeaderCell colSpan="2" scope="col" className="text-center align-middle">
                    Stock
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Judgement
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    User
                  </CTableHeaderCell>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    Date
                  </CTableHeaderCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="col" className="text-center align-middle">
                    Plan
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center align-middle">
                    Actual
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center align-middle">
                    Sistem
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center align-middle">
                    Actual
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {material.map((material, index) => (
                  <CTableRow key={material.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{material.materialNo}</CTableDataCell>
                    <CTableDataCell>{material.description}</CTableDataCell>
                    <CTableDataCell>{material.uom}</CTableDataCell>
                    <CTableDataCell>{material.addressRack}</CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell></CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Inventory
