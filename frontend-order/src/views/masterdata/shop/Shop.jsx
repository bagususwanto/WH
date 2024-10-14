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

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditShop(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteShop(rowData.id)} />
        </div>
       );
    };

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
            <DataTable value={shops} paginator rows={10} rowsPerPageOptions={[10,10, 25, 50]} tableStyle={{ minWidth: '50rem' }}className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap">
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="shopName" header="Nama Supplier" style={{ width: '25%' }}></Column>\
                <Column field="plantId" header="Plant Id" style={{ width: '25%' }}></Column>
                <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
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
