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

const Storage = () => {
  const [storages, setStorages] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentStorage, setCurrentStorage] = useState({
    id: '',
    storageName: '',
    shopId: '',
  });
  
  useEffect(() => {
    getStorage();
  }, []);

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditStorage(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteStorage(rowData.id)} />
        </div>
       );
    };

  const getStorage = async () => {
    try {
      const response = await axiosInstance.get('/storage');
      setStorages(response.data);
    } catch (error) {
      console.error('Error fetching storage:', error);
    }
  };

  const handleAddStorage = () => {
    setIsEdit(false);
    setCurrentStorage({
      id: '',
      storageName: '',
      shopId: '',
    });
    setModal(true);
  };

  const handleEditStorage= (storage) => {
    setIsEdit(true);
    setCurrentStorage({
      id: storage.id,
      storageName: storage.storageName,
      shopId: storage.shopId,
      createdAt: storage.createdAt,
      updatedAt: storage.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteStorage = (storage) => {
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
        confirmDelete(storage);
      }
    });
  };
  

  const confirmDelete = async (storage) => {
    try {
      await axiosInstance.get(`/storage-delete/${storage}`);
      Swal.fire(
        'Deleted!',
        'The Supplier has been deleted.',
        'success'
      );
      getStorage();
    } catch (error) {
      console.error('Error deleting storage:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the storage.',
        'error'
      );
    }
  };
  
  


  const handleSaveStorage = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/storage/${currentStorage.id}`, currentStorage);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/storage', currentStorage);
        Swal.fire(
          'Added!',
          'The storage has been added.',
          'success'
        );
      }
      setModal(false);
      getStorage();
    } catch (error) {
      console.error('Error saving storage:', error);
      Swal.fire(
        'Error!',
        'Failed to save the storage.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Storage</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddStorage}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable value={storages} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }} className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap">
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="storageName" header="Nama Storage" style={{ width: '25%' }}></Column>\
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
          <CModalTitle>{isEdit ? 'Edit Storage' : 'Add Storage'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentStorage.storageName}
              onChange={(e) => setCurrentStorage({ ...currentStorage, storageName: e.target.value })}
              placeholder="Enter storage name"
              label="Supplier Name"
            />
            <CFormInput
              type="text"
              value={currentStorage.shopId}
              onChange={(e) => setCurrentStorage({ ...currentStorage, shopId: e.target.value })}
              placeholder="Enter storage code"
              label="Supplier Code"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveStorage}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Storage;
