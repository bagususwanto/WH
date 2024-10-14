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
  CForm
} from '@coreui/react';
import axiosInstance from '../../../utils/AxiosInstance';

const Address = () => {
  const [addriess, setAddriess] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    addressRackName: '',
    storageId: '',
    flag: '',
  });

  useEffect(() => {
    getAddress();
  }, []);
  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditAddress(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteAddress(rowData.id)} />
        </div>
       );
    };

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
    setCurrentStorage({
      id: address.id,
      addressRackName: address.addressRackName,
      storageId: address.storageId,
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
            <DataTable value={addriess} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="addressRackName" header="Nama Rack" style={{ width: '25%' }}></Column>
                <Column field="storageId" header="Storage" style={{ width: '25%' }}></Column>
                <Column field="flag" header="Flag" style={{ width: '25%' }}></Column>
                <Column field="CreatedAt" header="Crate At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
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
              value={currentAddress.storageId}
              onChange={(e) => setCurrentAddress({ ...currentAddress, storageId: e.target.value })}
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