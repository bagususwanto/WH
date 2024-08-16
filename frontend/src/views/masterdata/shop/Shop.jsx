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


const Shop = () => {
  const [shops, setShops] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentShop, setCurrentShop] = useState({
    id: '',
    shopName: '',
    plantId: '',
  });
  
  useEffect(() => {
    getShop();
  }, []);

  const getShop = async () => {
    try {
      const response = await axiosInstance.get('/shop');
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  };

  const handleAddShop = () => {
    setIsEdit(false);
    setCurrentShop({
      id: '',
      shopName: '',
      plantId: '',
    });
    setModal(true);
  };

  const handleEditShop= (shop) => {
    setIsEdit(true);
    setCurrentShop({
      id: shop.id,
      shopName: shop.shopName,
      plantId: shop.plantId,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    });
    setModal(true);
  };

  const handleDeleteShop = (shop) => {
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
      getShop();
    } catch (error) {
      console.error('Error deleting shop:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the shop.',
        'error'
      );
    }
  };
  
  


  const handleSaveShop = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/shop/${currentShop.id}`, currentShop);
        Swal.fire(
          'Updated!',
          'The Supplier has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/shop', currentShop);
        Swal.fire(
          'Added!',
          'The shop has been added.',
          'success'
        );
      }
      setModal(false);
      getShop();
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
          <CCardHeader>Master Data Shop</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddShop}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Shop Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Plant Id</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {shops.map((shop, index) => (
                  <CTableRow key={shop.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{shop.shopName}</CTableDataCell>
                    <CTableDataCell>{shop.plantId}</CTableDataCell>
                    <CTableDataCell>{shop.createdAt}</CTableDataCell>
                    <CTableDataCell>{shop.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CButton color="success" onClick={() => handleEditShop(shop)}>Edit</CButton>
                        <CButton color="danger" onClick={() => handleDeleteShop(shop.id)}>Delete</CButton>
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
              value={currentShop.shopName}
              onChange={(e) => setCurrentShop({ ...currentShop, shopName: e.target.value })}
              placeholder="Enter shop name"
              label="Shop Name"
            />
            <CFormInput
              type="text"
              value={currentShop.plantId}
              onChange={(e) => setCurrentShop({ ...currentShop, plantId: e.target.value })}
              placeholder="Enter shop code"
              label="Plant Id"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveShop}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Shop;
