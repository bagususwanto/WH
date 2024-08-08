import React, { useState, useEffect } from 'react'
import {
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
  CTableDataCell,
} from '@coreui/react'
import axiosInstance from '../../utils/AxiosInstance'

const Inventory = () => {
  const [materials, setMaterials] = useState([])

  useEffect(() => {
    getMaterials()
  }, [])

  const getMaterials = async () => {
    try {
      const response = await axiosInstance.get('/materials')
      setMaterials(response.data)
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Table Inventory</CCardHeader>
          <CCardBody>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Material Number</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">UoM</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Address</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {materials.map((material, index) => (
                  <CTableRow key={material.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{material.materialNo}</CTableDataCell>
                    <CTableDataCell>{material.description}</CTableDataCell>
                    <CTableDataCell>{material.uom}</CTableDataCell>
                    <CTableDataCell>{material.addressRack}</CTableDataCell>
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
