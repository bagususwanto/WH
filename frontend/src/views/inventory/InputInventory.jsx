import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormTextarea,
  CTableRow,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTableCaption,
} from '@coreui/react'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CFormInput, CButton, CFormLabel, CForm, CTable } from '@coreui/react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import { CIcon } from '@coreui/icons-react'
import { cilXCircle } from '@coreui/icons'

import useMasterDataService from '../../services/MasterDataService'
import useManageStockService from '../../services/ManageStockService'

const MySwal = withReactContent(Swal)

const InputInventory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isClearable, setIsClearable] = useState(true)
  const [plant, setPlant] = useState([])
  const [storage, setStorage] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [inventory, setInventory] = useState([])

  const { getMasterData } = useMasterDataService()
  const { getInventory } = useManageStockService()

  const apiPlant = 'plant'
  const apiStorage = 'storage'

  useEffect(() => {
    getPlant()
    getStorage()
  }, [])

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      setPlant(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getStorage = async () => {
    try {
      const response = await getMasterData(apiStorage)
      setStorage(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getInventories = async (id) => {
    try {
      const response = await getInventory(id)
      setInventory(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const materialNoOptions = inventory.map((i) => ({
    value: i.materialId,
    label: i.Material.materialNo,
  }))

  const descriptionOptions = inventory.map((i) => ({
    value: i.materialId,
    label: i.Material.description,
  }))

  const addressOptions = inventory.map((i) => ({
    value: i.addressId,
    label: i.Address_Rack.addressRackName,
  }))

  const uomOptions = inventory.map((i) => ({
    value: i.materialId,
    label: i.Material.uom,
  }))

  const plantOptions = plant.map((plant) => ({
    value: plant.id,
    label: plant.plantName,
  }))

  const handlePlantChange = (selectedPlant) => {
    if (selectedPlant) {
      const filteredStorages = storage
        .filter((s) => s.plantId === selectedPlant.value)
        .map((s) => ({
          value: s.id,
          label: s.storageName,
        }))
      setStorageOptions(filteredStorages)
    } else {
      setStorageOptions([])
    }
  }

  const handleStorageChange = (selectedStorage) => {
    if (selectedStorage) {
      getInventories(selectedStorage.value)
    } else {
      setInventory([])
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Form Input</CCardHeader>
          <CForm>
            <CCardBody>
              <CRow>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="plant">Plant</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={plantOptions}
                    id="plant"
                    onChange={handlePlantChange}
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="storage">Storage</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={storageOptions}
                    id="storage"
                    onChange={handleStorageChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="materialNo">Material No</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={materialNoOptions}
                    id="materialNo"
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="description">Description</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={descriptionOptions}
                    id="description"
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="address">Address</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={addressOptions}
                    id="address"
                  />
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CFormLabel htmlFor="uom">UoM</CFormLabel>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={isLoading}
                    isClearable={isClearable}
                    options={uomOptions}
                    id="uom"
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12} sm={6} md={3}>
                  <CFormInput
                    type="number"
                    id="quantity"
                    label="Quantity"
                    placeholder="Input.."
                    text="Must be number."
                    aria-describedby="quantity"
                    required
                  />
                </CCol>
                <CCol
                  xs={12}
                  sm={6}
                  md={3}
                  className="d-flex justify-content-start align-items-center"
                >
                  <CButton color="primary">Add</CButton>
                </CCol>
              </CRow>
              <hr />
              <CRow>
                <CTable striped align="middle" responsive className="text-center">
                  <CTableCaption>List of items</CTableCaption>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Material No</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Address</CTableHeaderCell>
                      <CTableHeaderCell scope="col">UoM</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableHeaderCell scope="row">1</CTableHeaderCell>
                      <CTableDataCell>Mark</CTableDataCell>
                      <CTableDataCell>Otto</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>
                        <CIcon
                          icon={cilXCircle}
                          size="xl"
                          style={{ fontSize: '80px', cursor: 'pointer', color: 'red' }} // Memperbesar ukuran dan ubah warna
                          onClick={() => alert('Icon clicked!')} // Tambahkan handler klik
                        />
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableHeaderCell scope="row">1</CTableHeaderCell>
                      <CTableDataCell>Mark</CTableDataCell>
                      <CTableDataCell>Otto</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>
                        <CIcon
                          icon={cilXCircle}
                          size="xl"
                          style={{ fontSize: '80px', cursor: 'pointer', color: 'red' }} // Memperbesar ukuran dan ubah warna
                          onClick={() => alert('Icon clicked!')} // Tambahkan handler klik
                        />
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableHeaderCell scope="row">1</CTableHeaderCell>
                      <CTableDataCell>Mark</CTableDataCell>
                      <CTableDataCell>Otto</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>@mdo</CTableDataCell>
                      <CTableDataCell>
                        <CIcon
                          icon={cilXCircle}
                          size="xl"
                          style={{ fontSize: '80px', cursor: 'pointer', color: 'red' }} // Memperbesar ukuran dan ubah warna
                          onClick={() => alert('Icon clicked!')} // Tambahkan handler klik
                        />
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CRow>
              <CRow className="mt-3">
                <CCol className="d-flex justify-content-end">
                  <CButton color="primary" className="text-white">
                    Submit
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CForm>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default InputInventory
