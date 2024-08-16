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
  CForm,
  
} from '@coreui/react';
import axiosInstance from '../../../utils/AxiosInstance';
import Swal from 'sweetalert2'; 


const Location = () => {
  const [locations, setLocations] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    id: '',
    locationName: '',
    shopId: '',
  });
  
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const response = await axiosInstance.get('/location');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleAddLocation = () => {
    setIsEdit(false);
    setCurrentLocation({
      id: '',
      locationName: '',
      shopId: '',
    });
    setModal(true);
  };

  const handleEditLocation= (location) => {
    setIsEdit(true);
    setCurrentLocation({
      id: location.id,
      locationName: location.locationName,
      shopId: location.shopId,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteLocation = (location) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this plant!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(location);
      }
    });
  };
  

  const confirmDelete = async (location) => {
    try {
      await axiosInstance.get(`/location-delete/${location}`);
      Swal.fire(
        'Deleted!',
        'The Supplier has been deleted.',
        'success'
      );
      getLocation();
    } catch (error) {
      console.error('Error deleting location:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the location.',
        'error'
      );
    }
  };
  
  


  const handleSaveLocation = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/location/${currentLocation.id}`, currentLocation);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/location', currentLocation);
        Swal.fire(
          'Added!',
          'The location has been added.',
          'success'
        );
      }
      setModal(false);
      getLocation();
    } catch (error) {
      console.error('Error saving location:', error);
      Swal.fire(
        'Error!',
        'Failed to save the location.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Location</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddLocation}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Location Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Shop Id</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {locations.map((location, index) => (
                  <CTableRow key={location.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{location.locationName}</CTableDataCell>
                    <CTableDataCell>{location.shopId}</CTableDataCell>
                    <CTableDataCell>{location.createdAt}</CTableDataCell>
                    <CTableDataCell>{location.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CButton color="success" onClick={() => handleEditLocation(location)}>Edit</CButton>
                        <CButton color="danger" onClick={() => handleDeleteLocation(location.id)}>Delete</CButton>
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
          <CModalTitle>{isEdit ? 'Edit Location' : 'Add Location'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentLocation.locationName}
              onChange={(e) => setCurrentLocation({ ...currentLocation, locationName: e.target.value })}
              placeholder="Enter location name"
              label="Supplier Name"
            />
            <CFormInput
              type="text"
              value={currentLocation.shopId}
              onChange={(e) => setCurrentLocation({ ...currentLocation, shopId: e.target.value })}
              placeholder="Enter location code"
              label="Supplier Code"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveLocation}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Location;
