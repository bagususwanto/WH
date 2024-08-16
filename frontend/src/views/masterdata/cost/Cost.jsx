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
import axiosInstance from '../../../utils/AxiosInstance';
import Swal from 'sweetalert2'; 


const Cost = () => {
  const [costs, setCosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCost, setcurrentCost] = useState({
    id: '',
    costCenterCode: '',
    costCenterName: '',
    wbsNumber: '',
    shopId: '',
  });
  
  useEffect(() => {
    getCost();
  }, []);

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditCost(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteCost(rowData.id)} />
        </div>
       );
    };

  const getCost = async () => {
    try {
      const response = await axiosInstance.get('/cost');
      setCosts(response.data);
    } catch (error) {
      console.error('Error fetching cost:', error);
    }
  };
const handleAddCost = () => {
    setIsEdit(false);
    setcurrentCost({
      id: '',
      costCenterCode: '',
      wbsNumber:'',
      shopId:'',
    });
    setModal(true);
  };
const handleEditCost= (cost) => {
    setIsEdit(true);
    setcurrentCost({
      id: cost.id,
      costCenterCode: cost.costCenterCode,
      costCenterName: cost.costCenterName,
      wbsNumber: cost.wbsNumber,
      shopId: cost.shopId,
      createdAt: cost.createdAt,
      updatedAt: cost.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteCost = (cost) => {
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
        confirmDelete(cost);
      }
    });
  };
  

  const confirmDelete = async (cost) => {
    try {
      await axiosInstance.get(`/cost-delete/${cost}`);
      Swal.fire(
        'Deleted!',
        'The Supplier has been deleted.',
        'success'
      );
      getCost();
    } catch (error) {
      console.error('Error deleting cost:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the cost.',
        'error'
      );
    }
  };
  
  


  const handleSaveCost = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/cost/${currentCost.id}`, currentCost);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/cost', currentCost);
        Swal.fire(
          'Added!',
          'The cost has been added.',
          'success'
        );
      }
      setModal(false);
      getCost();
    } catch (error) {
      console.error('Error saving cost:', error);
      Swal.fire(
        'Error!',
        'Failed to save the cost.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Cost</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddCost}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable value={costs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="costCenterCode" header="Cost Cade" style={{ width: '25%' }}></Column>\
                <Column field="costCenterName" header="Nama Code" style={{ width: '25%' }}></Column>
                <Column field="wbsNumber" header="WBS No" style={{ width: '25%' }}></Column>
                <Column field="shopId" header="Shop" style={{ width: '25%' }}></Column>
                <Column field="CreatedAt" header="Crate At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Cost' : 'Add Cost'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentCost.costCenterCode}
              onChange={(e) => setcurrentCost({ ...currentCost, costCenterCode: e.target.value })}
              placeholder="Enter cost code"
              label="Cost Code"
            />
            <CFormInput
              type="text"
              value={currentCost.costCenterName}
              onChange={(e) => setcurrentCost({ ...currentCost, costCenterName: e.target.value })}
              placeholder="Enter cost code"
              label="Cost Code"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveCost}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Cost;
