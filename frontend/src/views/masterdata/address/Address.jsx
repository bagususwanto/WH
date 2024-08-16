import React, { useState, useEffect } from 'react';
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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CForm
} from '@coreui/react';
import axiosInstance from '../../../utils/AxiosInstance';

const Address = () => {
  const [addriess, setAddriess] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    addressRackName: '',
    locationId: '',
    flag: '',
  });

  useEffect(() => {
    getAddress();
  }, []);

  const getAddress = async () => {
    try {
      const response = await axiosInstance.get('/address');
      setAddriess(response.data);
    } catch (error) {
      console.error('Error fetching addriess:', error);
    }
  };

  const handleAddAddress = () => {
    setIsEdit(false);
    setCurrentAddress({ categoryName: '' });
    setModal(true);
  };

  const handleEditAddress= (address) => {
    setIsEdit(true);
    setCurrentLocation({
      id: address.id,
      addressRackName: address.addressRackName,
      locationId: address.locationId,
      flag: address.flag,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axiosInstance.get(`/address-delete/${id}`);
      getAddress(); // Refresh the addriess list
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (isEdit) {
        // Edit existing address
        await axiosInstance.put(`/address/${currentAddress.id}`, currentAddress);
      } else {
        // Add new address
        await axiosInstance.post('/address', currentAddress);
      }
      setModal(false);
      getAddress(); // Refresh the addriess list
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Inventory Address</CCardHeader>
          <CCardBody>
            <CButton color="primary" onClick={handleAddAddress}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Address Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Location Id</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Flag</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {addriess.map((address, index) => (
                  <CTableRow key={address.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{address.addressRackName}</CTableDataCell>
                    <CTableDataCell>{address.locationId}</CTableDataCell>
                    <CTableDataCell>{address.flag}</CTableDataCell>
                    <CTableDataCell>{address.createdAt}</CTableDataCell>
                    <CTableDataCell>{address.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', gap: '10px' }}>
                      <CButton color="success" onClick={() => handleEditAddress(address)}>Edit</CButton>
                      <CButton color="danger" onClick={() => handleDeleteAddress(address.id)}>Delete</CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Address' : 'Add Address'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentAddress.addressRackName}
              onChange={(e) => setCurrentAddress({ ...currentAddress, addressRackName: e.target.value })}
              placeholder="Enter address name"
              label="Address Name"
            />
             <CFormInput
              type="text"
              value={currentAddress.locationId}
              onChange={(e) => setCurrentAddress({ ...currentAddress, locationId: e.target.value })}
              placeholder="Enter address name"
              label="Address Name"
            />
             <CFormInput
              type="text"
              value={currentAddress.flag}
              onChange={(e) => setCurrentAddress({ ...currentAddress, flag: e.target.value })}
              placeholder="Enter address name"
              label="Address Name"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveAddress}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Address;