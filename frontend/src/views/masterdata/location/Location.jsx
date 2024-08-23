import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/mira/theme.css'
import 'primereact/resources/primereact.min.css'
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
import useAxiosWithAuth from '../../../utils/AxiosInstance';
import Swal from 'sweetalert2'; 
const axiosInstance = useAxiosWithAuth()

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

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditLocation(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteLocation(rowData.id)} />
        </div>
       );
    };

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
            <DataTable value={locations} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }} className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap">
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="locationName" header="Nama Location" style={{ width: '25%' }}></Column>\
                <Column field="shopId" header="Id Shop" style={{ width: '25%' }}></Column>
                <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
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
