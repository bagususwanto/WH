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


const Supplier = () => {
  const [shops, setShops] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentShop, setCurrentShop] = useState({
    id: '',
    shopName: '',
  });
  
  useEffect(() => {
    getShop();
  }, []);

  const getShop = async () => {
    try {
      const response = await axiosInstance.get('/shop');
      setShop(response.data);
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  };

  const handleAddShop = () => {
    setIsEdit(false);
    setCurrentShop({
      id: '',
      shopName: '',
    });
    setModal(true);
  };

  const handleEditShop= (shop) => {
    setIsEdit(true);
    setCurrentSupplier({
      id: shop.id,
      shopName: shop.shopName,
      plantId
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteSupplier = (shop) => {
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
        confirmDelete(shop);
      }
    });
  };
  

  const confirmDelete = async (shop) => {
    try {
      await axiosInstance.get(`/shop-delete/${shop}`);
      Swal.fire(
        'Deleted!',
        'The Supplier has been deleted.',
        'success'
      );
      getSupplier();
    } catch (error) {
      console.error('Error deleting shop:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the shop.',
        'error'
      );
    }
  };
  
  


  const handleSaveSupplier = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/shop/${currentSupplier.id}`, currentSupplier);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/shop', currentSupplier);
        Swal.fire(
          'Added!',
          'The shop has been added.',
          'success'
        );
      }
      setModal(false);
      getSupplier();
    } catch (error) {
      console.error('Error saving shop:', error);
      Swal.fire(
        'Error!',
        'Failed to save the shop.',
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
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Supplier Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {suppliers.map((shop, index) => (
                  <CTableRow key={shop.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{shop.shopName}</CTableDataCell>
                    <CTableDataCell>{shop.createdAt}</CTableDataCell>
                    <CTableDataCell>{shop.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CButton color="success" onClick={() => handleEditSupplier(shop)}>Edit</CButton>
                        <CButton color="danger" onClick={() => handleDeleteSupplier(shop.id)}>Delete</CButton>
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
          <CModalTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentSupplier.SupplierName}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, shopName: e.target.value })}
              placeholder="Enter shop name"
              label="Supplier Name"
            />
            <CFormInput
              type="text"
              value={currentSupplier.supplierCode}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, supplierCode: e.target.value })}
              placeholder="Enter shop code"
              label="Supplier Code"
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
