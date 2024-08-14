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


const Plant = () => {
  const [plants, setPlants] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPlant, setCurrentPlant] = useState({
    id: '',
    plantCode: '',
    plantName: '',
  });
  
  useEffect(() => {
    getPlants();
  }, []);

  const getPlants = async () => {
    try {
      const response = await axiosInstance.get('/plant');
      setPlants(response.data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleAddPlant = () => {
    setIsEdit(false);
    setCurrentPlant({
      id: '',
      plantCode: '',
      plantName: '',
    });
    setModal(true);
  };

  const handleEditPlant = (plant) => {
    setIsEdit(true);
    setCurrentPlant({
      id: plant.id,
      plantCode: plant.plantCode,
      plantName: plant.plantName,
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt
    });
    setModal(true);
  };

  const handleDeletePlant = (plant) => {
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
        confirmDelete(plant);
      }
    });
  };
  

  const confirmDelete = async (plant) => {
    try {
      await axiosInstance.get(`/plant-delete/${plant}`);
      Swal.fire(
        'Deleted!',
        'The plant has been deleted.',
        'success'
      );
      getPlants();
    } catch (error) {
      console.error('Error deleting plant:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the plant.',
        'error'
      );
    }
  };
  
  


  const handleSavePlant = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/plant/${currentPlant.id}`, currentPlant);
        Swal.fire(
          'Updated!',
          'The plant has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/plant', currentPlant);
        Swal.fire(
          'Added!',
          'The plant has been added.',
          'success'
        );
      }
      setModal(false);
      getPlants();
    } catch (error) {
      console.error('Error saving plant:', error);
      Swal.fire(
        'Error!',
        'Failed to save the plant.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Plant</CCardHeader>
          <CCardBody>
            
            <CButton color="primary" onClick={handleAddPlant}>Add</CButton>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Plant Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Plant Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {plants.map((plant, index) => (
                  <CTableRow key={plant.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{plant.plantCode}</CTableDataCell>
                    <CTableDataCell>{plant.plantName}</CTableDataCell>
                    <CTableDataCell>{plant.createdAt}</CTableDataCell>
                    <CTableDataCell>{plant.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="success" onClick={() => handleEditPlant(plant)}>Edit</CButton>
                      <CButton color="danger" onClick={() => handleDeletePlant(plant.id)}>Delete</CButton>
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
          <CModalTitle>{isEdit ? 'Edit Plant' : 'Add Plant'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentPlant.plantName}
              onChange={(e) => setCurrentPlant({ ...currentPlant, plantName: e.target.value })}
              placeholder="Enter plant name"
              label="Plant Name"
            />
            <CFormInput
              type="text"
              value={currentPlant.plantCode}
              onChange={(e) => setCurrentPlant({ ...currentPlant, plantCode: e.target.value })}
              placeholder="Enter plant code"
              label="Plant Code"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSavePlant}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Plant;
