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

//Plant adalah komponen digunakan di navigation unutk halaman 
const Plant  = () => {
//plants variabel untuk menampung dari data base,
//setPlants untuk meng set untuk suatu nilai dari fuction getPlants 
  const [plants, setPlants] = useState([]);
//setModal true akan tampil bila false 
// modal dialog dan pop up sama saja
  const [modal, setModal] = useState(false);
//setIsEdit ditunjjukan untuk form edit bila TRUE,kalau untuk tambah data = FALSE 
  const [isEdit, setIsEdit] = useState(false);
// setcategory untuk mendapatkan nilai "Plant" dari dta base
  const [currentPlantCode, setCurrentPlantCode] = useState({
    plantCode: '',
  });
  const [currentPlantName, setCurrentPlantName] = useState({
    plantName: '',
  });
//useEffect akan dijalankan saat membuaka halaman
  useEffect(() => {
    getPlants();
  }, []);
//fuction getplants dimana kita lihat slug('/plant') dan metode (get) dari postman
  const getPlants = async () => {
    try {
      const response = await axiosInstance.get('/plant');
      setPlants(response.data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };
//function untuk tambah data
  const handleAddPlant = () => {
    setIsEdit(false); // tambah data
    setCurrentPlantCode({ plantCode: '' }); //inputan kosong karen manambah data
    setCurrentPlantName({ plantName: '' }); //inputan kosong karen manambah data
    setModal(true); // maka tampil pop up/modal
  };
//function edit 
  const handleEditPlant = (plantCode,plantName) => {
    setIsEdit(true); //dinyatakan untuk edit
    setCurrentPlantCode(plantCode);
    setCurrentPlantName(plantName);
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
                      <CButton color="success" onClick={() => handleEditCategory(category)}>Edit</CButton>
                      <CButton color="danger" onClick={() => handleDeleteCategory(category.id)}>Delete</CButton>
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