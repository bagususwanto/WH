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
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Material No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">UoM</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Price</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Standart Stock</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Addres</CTableHeaderCell>
                  <CTableHeaderCell scope="col">category</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Supplier</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {materials.map((material, index) => (
                  <CTableRow key={material.id}>
 
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{material.materialNo}</CTableDataCell>
                    <CTableDataCell>{material.description}</CTableDataCell>
                    <CTableDataCell>{material.uom}</CTableDataCell>
                    <CTableDataCell>{material.price}</CTableDataCell>
                    <CTableDataCell>{material.stdStock}</CTableDataCell>
                    <CTableDataCell>{material.addresId}</CTableDataCell>
                    <CTableDataCell>{material.categoryId}</CTableDataCell>
                    <CTableDataCell>{material.supplierId}</CTableDataCell>
                    <CTableDataCell>{material.createdAt}</CTableDataCell>
                    <CTableDataCell>{material.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CButton color="success" onClick={() => handleEditMaterial(material)}>Edit</CButton>
                        <CButton color="danger" onClick={() => handleDeleteMaterial(material.id)}>Delete</CButton>
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
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentMaterial.materialNo}
              onChange={(e) => setCurrentSupplier({ ...currentMaterial, materialNo: e.target.value })}
              placeholder="Enter Material name"
              label="Material No"
            />
            <CFormInput
              type="text"
              value={currentMaterial.description}
              onChange={(e) => setCurrentSupplier({ ...currentMaterial, description: e.target.value })}
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
              onChange={(e) => setCurrentMater({ ...currentMaterial, price: e.target.value })}
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
