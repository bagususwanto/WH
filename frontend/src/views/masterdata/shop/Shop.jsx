import React, { useState, useEffect } from 'react'
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CForm
} from '@coreui/react'
import axiosInstance from '../../../utils/AxiosInstance';

const Shop = () => {
    const [shopies, setShopies] = useState([]);
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentShop, setCurrentShop] = useState({
      shopName: '',
    });
  
    useEffect(() => {
      getShopies();
    }, []);
  
    const getShopies = async () => {
      try {
        const response = await axiosInstance.get('/Shop');
        setShopies(response.data);
      } catch (error) {
        console.error('Error fetching shop:', error);
      }
    };
  
    const handleAddShop = () => {
      setIsEdit(false);
      setCurrentShop({ shopName: '' });
      setModal(true);
    };
  
    const handleEditShop = (shop) => {
      setIsEdit(true);
      setCurrentShop(shop);
      setModal(true);
    };
  
    const handleDeleteShop = async (id) => {
      try {
        await axiosInstance.get(`/category-delete/${id}`);
        getShop(); // Refresh the categories list
      } catch (error) {
        console.error('Error deleting shop:', error);
      }
    };
  
    const handleSaveShop = async () => {
      try {
        if (isEdit) {
          // Edit existing category
          await axiosInstance.put(`/shop/${currentShop.id}`, currentShop);
        } else {
          // Add new category
          await axiosInstance.post('/shop', currentShop);
        }
        setModal(false);
        getShop(); // Refresh the categories list
      } catch (error) {
        console.error('Error saving shop:', error);
      }
    };
  
    return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Iventory Tabel</CCardHeader>
          <CCardBody>
          <CRow className='mb-3'>
    <CCol sm="auto">
    <CDropdown >
          <CDropdownToggle color="secondary">Shop</CDropdownToggle>
          <CDropdownMenu>
          <CDropdownItem href="#">Assy</CDropdownItem>
          <CDropdownItem href="#">Tosso</CDropdownItem>
           <CDropdownItem href="#">Welding</CDropdownItem>
           </CDropdownMenu>
           </CDropdown>
    </CCol>
    <CCol sm="auto"><CButton color="primary" onClick={handleAddShop}>Add</CButton></CCol>
  </CRow>
         
           
          
            <CTable bordered responsive>
              <CTableHead >
                <CTableRow>
                  <CTableHeaderCell p class="fw-normal"scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">category name</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell p class="fw-normal"scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {shopies.map((shop, index) => (
                  <CTableRow key={shop.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{shop.shopName}</CTableDataCell>
                    <CTableDataCell>{shop.createdAt}</CTableDataCell>
                    <CTableDataCell>{shop.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <CButton color="success" onClick={() => handleEditShop(shop)}>Edit</CButton>
                    <CButton color="danger"onClick={() => handleDeleteShop(shop.id)}>Delete</CButton>
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
          <CModalTitle>{isEdit ? 'Edit Shop' : 'Add Shop'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentShop.shopName}
              onChange={(e) => setCurrentShop({ ...currentshop, ShopName: e.target.value })}
              placeholder="Enter Shop name"
              label="Shop Name"
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

export default Shop;