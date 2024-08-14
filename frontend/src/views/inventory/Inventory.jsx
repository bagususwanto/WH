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
import CIcon from '@coreui/icons-react'
import { cilDataTransferDown, cilZoom } from '@coreui/icons'
import { func } from 'prop-types'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [location, setLocation] = useState([])
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    // getInventory()
    getPlant()
    // getShop()
    // getLocation()
  }, [])

  const getInventory = async () => {
    try {
      const response = await axiosInstance.get('/inventory')
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const getPlant = async () => {
    try {
      const response = await axiosInstance.get('/plant')
      setPlant(response.data)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
  }

  const getShop = async () => {
    try {
      const response = await axiosInstance.get('/shop')
      setShop(response.data)
    } catch (error) {
      console.error('Error fetching shop:', error)
    }
  }

  const getShopByPlantId = async (id) => {
    try {
      const response = await axiosInstance.get(`/shop-plant/${id}`)
      setShop(response.data)
    } catch (error) {
      console.error('Error fetching shop by ID:', error)
    }
  }

  const getLocation = async () => {
    try {
      const response = await axiosInstance.get('/location')
      setLocation(response.data)
    } catch (error) {
      console.error('Error fetching location:', error)
    }
  }

  const handleSearch = () => {
    getInventory()
  }

  const handlePlantChange = (id) => {
    getShopByPlantId(id)
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Search</CCardHeader>
          <CCardBody>
            <CForm>
              <CRow>
                <CCol md={3} className="mb-3">
                  <CFormLabel htmlFor="dateInput">Date</CFormLabel>
                  <Flatpickr
                    value={date}
                    onChange={(date) => setDate(date)}
                    options={{
                      dateFormat: 'Y-m-d',
                      maxDate: 'today',
                      allowInput: true,
                    }}
                    className="form-control"
                    placeholder="Select a date"
                  />
                </CCol>
                <CCol md={2} className="mb-3">
                  <CFormLabel htmlFor="plantinput">Plant</CFormLabel>
                  <CFormSelect
                    aria-label="Select a plant"
                    onChange={(e) => handlePlantChange(e.target.value)}
                  >
                    <option>Select a plant</option>
                    {plant.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.plantName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2} className="mb-3">
                  <CFormLabel htmlFor="shopinput">Shop</CFormLabel>
                  <CFormSelect aria-label="Select a plant">
                    <option>Select a shop</option>
                    {shop.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.shopName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3} className="mb-3">
                  <CFormLabel htmlFor="locationinput">Location</CFormLabel>
                  <CFormSelect aria-label="Select a plant">
                    <option>Select a location</option>
                    {location.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.locationName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2} className="mb-3">
                  <CFormLabel htmlFor="shiftinput">Shift</CFormLabel>
                  <CFormSelect aria-label="Select a plant">
                    <option>Select a shift</option>
                    <option value={1}>Day</option>
                    <option value={2}>Night</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
          <CCardFooter>
            <CRow className="align-items-end">
              <CCol className="d-flex justify-content-end">
                <CButton color="dark" onClick={handleSearch}>
                  <CIcon icon={cilZoom} /> Search
                </CButton>
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>Inventory Table</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol className="mb-1">
                <CButton color="success">
                  <CIcon icon={cilDataTransferDown} /> Excel
                </CButton>
              </CCol>
            </CRow>
            <DataTable value={inventory} tableStyle={{ minWidth: '50rem' }}>
              <Column field="materialNo" header="materialNo"></Column>
              <Column field="description" header="description"></Column>
              <Column field="address" header="address"></Column>
              <Column field="uom" header="uom"></Column>
            </DataTable>
            <CTable small bordered responsive className="text-nowrap">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell rowSpan="2" scope="col" className="text-center align-middle">
                    No
                  </CTableHeaderCell>
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
                {inventory.map((inventory, index) => (
                  <CTableRow key={inventory.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{inventory.Material.materialNo}</CTableDataCell>
                    <CTableDataCell>{inventory.Material.description}</CTableDataCell>
                    <CTableDataCell>
                      {inventory.Material.Address_Rack.addressRackName}
                    </CTableDataCell>
                    <CTableDataCell>{inventory.Material.uom}</CTableDataCell>
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
