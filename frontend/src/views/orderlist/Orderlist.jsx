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
          <CCardHeader>Iventory Tabel</CCardHeader>
          <CCardBody>
            <CTable bordered responsive>
              <CTableHead >
                <CTableRow>
                  <CTableHeaderCell p class="fw-normal"scope="col">Item No</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Material Description</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Adrees</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Satuan</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Incoming Plan</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Incoming Actual</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Good Issue</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Standar Stock</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Stock Akhir</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Stock Actual</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Judgement</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">User</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Tanggal</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
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
