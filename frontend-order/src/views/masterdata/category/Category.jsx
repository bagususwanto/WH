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

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditCategory(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteCategory(rowData.id)} />
        </div>
       );
    };
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
            <DataTable value={categories} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }}  className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap">
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="categoryName" header="Nama Category" style={{ width: '25%' }}></Column>
                <Column field="CreatedAt" header="Crate At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
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