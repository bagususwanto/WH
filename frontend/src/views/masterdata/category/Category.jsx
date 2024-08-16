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
  CForm
} from '@coreui/react';
import axiosInstance from '../../../utils/AxiosInstance';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    categoryName: '',
  });

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await axiosInstance.get('/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = () => {
    setIsEdit(false);
    setCurrentCategory({ categoryName: '' });
    setModal(true);
  };

  const handleEditCategory = (category) => {
    setIsEdit(true);
    setCurrentCategory(category);
    setModal(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axiosInstance.get(`/category-delete/${id}`);
      getCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (isEdit) {
        // Edit existing category
        await axiosInstance.put(`/category/${currentCategory.id}`, currentCategory);
      } else {
        // Add new category
        await axiosInstance.post('/category', currentCategory);
      }
      setModal(false);
      getCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Inventory Table</CCardHeader>
          <CCardBody>
            <CButton color="primary" onClick={handleAddCategory}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Category Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {categories.map((category, index) => (
                  <CTableRow key={category.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{category.categoryName}</CTableDataCell>
                    <CTableDataCell>{category.createdAt}</CTableDataCell>
                    <CTableDataCell>{category.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', gap: '10px' }}>
                      <CButton color="success" onClick={() => handleEditCategory(category)}>Edit</CButton>
                      <CButton color="danger" onClick={() => handleDeleteCategory(category.id)}>Delete</CButton> 
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
          <CModalTitle>{isEdit ? 'Edit Category' : 'Add Category'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentCategory.categoryName}
              onChange={(e) => setCurrentCategory({ ...currentCategory, categoryName: e.target.value })}
              placeholder="Enter category name"
              label="Category Name"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveCategory}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Category;