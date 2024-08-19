import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/mira/theme.css'
import 'primereact/resources/primereact.min.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow, 
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


const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({
    id: '',
    supplierName: '',
  });
  
  useEffect(() => {
    getSupplier();
  }, []);

  const imageBodyTemplate = (product) => {
    return <img src={'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.image} style={{ width: '100%', height: 'auto' }} className=" shadow-2 border-round" />;
};
const statusBodyTemplate = (product) => {
    return <Tag value={product.inventoryStatus} severity={getSeverity(product)}></Tag>;
};

const getSeverity = (product) => {
    switch (product.inventoryStatus) {
        case 'INSTOCK':
            return 'success';

        case 'LOWSTOCK':
            return 'warning';

        case 'OUTOFSTOCK':
            return 'danger';

        default:
            return null;
    }
};

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditSupplier(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteSupplier(rowData.id)} />
        </div>
       );
    };

  const getSupplier = async () => {
    try {
      const response = await axiosInstance.get('/supplier');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
    }
  };

  const handleAddSupplier = () => {
    setIsEdit(false);
    setCurrentSupplier({
      id: '',
      supplierName: '',
    });
    setModal(true);
  };

  const handleEditSupplier= (supplier) => {
    setIsEdit(true);
    setCurrentSupplier({
      id: supplier.id,
      supplierName: supplier.supplierName,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    });
    setModal(true);
  };

  const handleDeleteSupplier = (supplier) => {
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
        confirmDelete(supplier);
      }
    });
  };
  

  const confirmDelete = async (supplier) => {
    try {
      await axiosInstance.get(`/supplier-delete/${supplier}`);
      Swal.fire(
        'Deleted!',
        'The Supplier has been deleted.',
        'success'
      );
      getSupplier();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the supplier.',
        'error'
      );
    }
  };
  
  


  const handleSaveSupplier = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/supplier/${currentSupplier.id}`, currentSupplier);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/supplier', currentSupplier);
        Swal.fire(
          'Added!',
          'The supplier has been added.',
          'success'
        );
      }
      setModal(false);
      getSupplier();
    } catch (error) {
      console.error('Error saving supplier:', error);
      Swal.fire(
        'Error!',
        'Failed to save the supplier.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Supplier</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddSupplier}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable value={suppliers} paginator rows={5} rowsPerPageOptions={[5,10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column header="Image" body={imageBodyTemplate}></Column>
                <Column field="supplierName" header="Nama Supplier" style={{ width: '25%' }}></Column>
                <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Status" body={statusBodyTemplate}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentSupplier.supplierName}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, supplierName: e.target.value })}
              placeholder="Enter supplier name"
              label="Supplier Name"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveSupplier}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Supplier;
