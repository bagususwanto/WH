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


const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    uom: '',
    price: '',
    stdStock: '',
    addressId: '',
    categoryId: '',
    supplierId: '',
  });
  
  useEffect(() => {
    getMaterial();
  }, []);

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditMaterial(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteMaterial(rowData.id)} />
        </div>
       );
    };
  

  const getMaterial = async () => {
    try {
      const response = await axiosInstance.get('/material');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching Material:', error);
    }
  };

  const handleAddMaterial = () => {
    setIsEdit(false);
    setCurrentMaterial({
      id: '',
      materialNo: '',
      description:'',
      uom: '',
      price: '',
      stdStock: '',
      addressId: '',
      categoryId: '',
      supplierId: '',
    });
    setModal(true);
  };

  const handleEditMaterial= (material) => {
    setIsEdit(true);
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: material.uom,
      price: material.price,
      stdStock: material.stdStock,
      addressId: material.addresId,
      categoryId: material.categoryId,
      supplierId: material.supplierId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteMaterial = (material) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this material!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(material);
      }
    });
  };
  

  const confirmDelete = async (material) => {
    try {
      await axiosInstance.get(`/material-delete/${material}`);
      Swal.fire(
        'Deleted!',
        'The Material has been deleted.',
        'success'
      );
      getMaterial();
    } catch (error) {
      console.error('Error deleting material:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the material.',
        'error'
      );
    }
  };
  
  


  const handleSaveMaterial = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/material/${currentMaterial.id}`, currentMaterial);
        Swal.fire(
          'Updated!',
          'The Material has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/material', currentMaterial);
        Swal.fire(
          'Added!',
          'The material has been added.',
          'success'
        );
      }
      setModal(false);
      getMaterial();
    } catch (error) {
      console.error('Error saving material:', error);
      Swal.fire(
        'Error!',
        'Failed to save the material.',
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
            <CButton color="primary" onClick={handleAddMaterial}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable value={materials} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="materialNo" header="No Material" style={{ width: '25%' }}></Column>\
                <Column field="description" header="description" style={{ width: '25%' }}></Column>
                <Column field="uom" header="uom" style={{ width: '25%' }}></Column>
                <Column field="price" header="Price" style={{ width: '25%' }}></Column>
                <Column field="stdstock" header="Standar Stock" style={{ width: '25%' }}></Column>
                <Column field="addresId" header="Addres" style={{ width: '25%' }}></Column>
                <Column field="categoryId" header="Category" style={{ width: '25%' }}></Column>
                <Column field="supplierId" header="Supplier" style={{ width: '25%' }}></Column>
                <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentMaterial.materialNo}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })}
              placeholder="Enter Material name"
              label="Material No"
            />
            <CFormInput
              type="text"
              value={currentMaterial.description}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
              placeholder="Enter Material code"
              label="Description"
            />
            <CFormInput
              type="text"
              value={currentMaterial.uom}
              onChange={(e) => setCurrentMaterial({ ...currentSupplier, uom: e.target.value })}
              placeholder="Enter Material code"
              label="uom"
            />
            <CFormInput
              type="text"
              value={currentMaterial.price}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: e.target.value })}
              placeholder="Enter Material code"
              label="Price"
            />
            <CFormInput
              type="text"
              value={currentMaterial.stdStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, stdStock: e.target.value })}
              placeholder="Enter material code"
              label="Standar Stock"
            />
            <CFormInput
              type="text"
              value={currentMaterial.categoryId}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, categoryId: e.target.value })}
              placeholder="Enter material code"
              label="Supplier Code"
            />
            <CFormInput
              type="text"
              value={currentMaterial.addresId}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, addresId: e.target.value })}
              placeholder="Enter material code"
              label="Addres Rack"
            />
            

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveMaterial}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Material;
