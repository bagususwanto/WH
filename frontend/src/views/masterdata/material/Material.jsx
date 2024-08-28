import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { saveAs } from 'file-saver';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { read, utils } from 'xlsx';
import * as XLSX from 'xlsx';
import 'primereact/resources/themes/mira/theme.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import { MultiSelect } from 'primereact/multiselect';
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
import useMasterDataService from '../../../services/MasterDataService';
import Swal from 'sweetalert2';
import Select from 'react-select';
import axios from 'axios';

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [category, setCategory] = useState([]);
  const [modal, setModal] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    description: '',
    uom: '',
    price: '',
    type: '',
    categoryId: '',
    supplierId: '',
    minStock: '',
    maxStock: '',
  });

  const { getMasterData, getMasterDataById, updateMasterDataById, postMasterData } = useMasterDataService();
  const [filters, setFilters] = useState({
    global: { value: null }
  });
  const apiMaterial = 'material';
  const apiSupplier = 'supplier';
  const apiCategory = 'category';


  useEffect(() => {
    getMaterial();
    getSupplier();
    getCategory();
  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'White',
      borderColor: 'black',
      color: 'White',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'White',
      color: 'black',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e0e0e0' : 'white',
      color: 'black',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'Black',
    }),
  };

  const getCategory = async () => {
    try {
      const response = await getMasterData(apiCategory);
      setCategory(response.data);
    } catch (error) {
      console.error('Error fetching Category:', error);
    }
  };

  const getSupplier = async () => {
    try {
      const response = await getMasterData(apiSupplier);
      setSupplier(response.data);
    } catch (error) {
      console.error('Error fetching Supplier:', error);
    }
  };

  const getMaterial = async () => {
    try {
      const response = await getMasterData(apiMaterial);
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
      description: '',
      uom: '',
      price: '',
      type: '',
      Category: '',
      Supplier: '',
      minStock: '',
      maxStock: '',
    });
    setModal(true);
  };

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditMaterial(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteMaterial(rowData.id)}
      />
    </div>
  );

  const handleEditMaterial = (material) => {
 
    setIsEdit(true);
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: material.uom,
      price: material.price,
      type: material.type,
      categoryId: material.Category ? material.Category.id:'',
      supplierId: material.Supplier ? material.Supplier.id:'',
      minStock: material.minStock,
      maxStock: material.maxStock,
    });
    setModal(true);
  };

  const handleDeleteMaterial = (materialId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This material cannot be recovered!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(materialId);
      }
    });
  };

  const confirmDelete = async (materialId) => {
    try {
      await axios.delete(`/material/${materialId}`);
      Swal.fire('Deleted!', 'Material has been deleted.', 'success');
      getMaterial();
    } catch (error) {
      console.error('Error deleting material:', error);
      Swal.fire('Error!', 'Failed to delete material.', 'error');
    }
  };

 const handleSaveMaterial = async () => {
  try {
    // Prepare the material data for API request
    const materialToSave = { ...currentMaterial };

    if (isEdit) {
      // Update existing material
      updateMasterDataById(apiMaterial, currentMaterial.id, materialToSave)
      Swal.fire('Updated!', 'Material has been updated.', 'success');
    } else {
      // Create new material
      delete materialToSave.id;
      postMasterData(apiMaterial,  materialToSave)
      Swal.fire('Added!', 'Material has been added.', 'success');
    }
    setModal(false);
    getMaterial(); // Refresh the list
  } catch (error) {
    console.error('Error saving material:', error);
    Swal.fire('Error!', 'Failed to save material.', 'error');
  }
};

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value }
    });
    setGlobalFilterValue(value);
  };

  const filteredMaterials = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : '';
    return materials.filter(item => {
      return Object.values(item).some(val => val && val.toString().toLowerCase().includes(globalFilter));
    });
  }, [materials, filters.global.value]);

  const renderHeader = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{ width: '250px', marginBottom: '10px' }}>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
            style={{ width: '100%', borderRadius: '5px' }}
          />
          
        </IconField>
        </div>
        </div>
    );
  };

  const selectCategory = category.map(cat => ({
    value: cat.id,
    label: cat.categoryName,
  }));

  const handleCategoryChange = (selectedOption) => {
    setCurrentMaterial({
        ...currentMaterial,
        categoryId: selectedOption ? selectedOption.value : '',
    });
};

  // Find the selected address option for initial value
  const selectedCategoryOption = selectCategory.find(cat => cat.value === currentMaterial.categoryId);

  // Prepare address options for Select
  const selectSupplier = supplier.map(supp => ({
    value: supp.id,
    label: supp.supplierName,
  }));

  const handleSupplierChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      supplierId: selectedOption ? selectedOption.value : '',
    });
  };

  // Find the selected address option for initial value
  const selectedSupplierOption = selectSupplier.find(supp => supp.value === currentMaterial.supplierId);

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item) => ({
        id: item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        price: item.price,
        type: item.type,
        Category: item.Category.categoryName,
        Supplier: item.Supplier.supplierName,
        minStock: item.minStock,
        maxStock: item.maxStock,
        'Created At': item.createdAt, // Pastikan format tanggal benar
        'Updated At': item.updatedAt, // Pastikan format tanggal benar
      }));
  
      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'material');
      
      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
  
      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'material');
    });
  };
  
  const saveAsExcelFile = (buffer, fileName) => {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`);
  };
  

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    // Validasi jenis file
    if (!file.type.includes('sheet') && !file.type.includes('excel')) {
      Swal.fire('Error!', 'Silakan unggah file Excel yang valid.', 'error');
      return;
    }
  
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
  
      // Debug: Cek data yang dibaca
      console.log('Data dari file Excel:', json);
  
      // Periksa apakah data JSON sesuai format yang diharapkan
      if (json.length === 0) {
        Swal.fire('Error!', 'Tidak ada data ditemukan dalam file Excel.', 'error');
        return;
      }
  
      // Proses dan validasi data sesuai kebutuhan
      const materialsFromExcel = json.map(item => ({
        ...item,
        id: item.id || '', // Pastikan ID ada jika diperlukan
      }));
  
      // Kirim data ke backend
      await axios.post('/import/material', materialsFromExcel);
  
      Swal.fire('Sukses!', 'Material telah diimpor dan diperbarui.', 'success');
      getMaterial(); // Segarkan daftar material
    } catch (error) {
      console.error('Error saat mengimpor material:', error);
      Swal.fire('Error!', 'Gagal mengimpor material.', 'error');
    }
  };
  

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>Master Data Material</CCardHeader>
          <CCardBody>
            <CRow className="mb-2">
              <CCol>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  label="Add Material"
                  icon="pi pi-plus"
                  className="p-button-success"
                  onClick={handleAddMaterial}
                />
                <Button
                  label="Export to Excel"
                  icon="pi pi-file-excel"
                  className="p-button-info ml-2"
                  onClick={exportExcel}
                />
                 <label htmlFor="importExcel">
                    <Button
                      label="Import from Excel"
                      icon="pi pi-file-excel"
                      className="p-button-info"
                      onClick={() => document.getElementById('importExcel').click()}
                    />
                    <input
                    type="file"
                    id="importExcel"
                    style={{ display: 'none' }}
                    onChange={handleImportExcel}
                  />  
                  </label>
                </div>
              </CCol>
            </CRow>
            <DataTable
              value={filteredMaterials}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              scrollable
              scrollDirection="horizontal"
              globalFilter={filters.global.value} // Aplikasikan filter global di sini
              header={renderHeader()} // Render header dengan filter global
            >
              <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} frozen alignFrozen="left" />
              <Column field="materialNo" header="No Material" style={{ width: '25%' }} frozen alignFrozen="left" />
              <Column field="description" header="Description" style={{ width: '25%' }} frozen alignFrozen="left" />
              <Column field="uom" header="UOM" style={{ width: '25%' }} />
              <Column field="price" header="Price" style={{ width: '25%' }} />
              <Column field="type" header="Type" style={{ width: '25%' }} />
              <Column header="Category" body={(rowData) => rowData.Category ? rowData.Category.categoryName : ''} style={{ width: '25%' }} />
              <Column header="Supplier" body={(rowData) => rowData.Supplier ? rowData.Supplier.supplierName : ''} style={{ width: '25%' }} />   
              <Column field="minStock" header="Min Stock" style={{ width: '25%' }} />
              <Column field="maxStock" header="Max stock" style={{ width: '25%' }} />
              <Column field="createdAt" header="Created At" style={{ width: '25%' }} />
              <Column field="updatedAt" header="Updated At" style={{ width: '25%' }} />
              <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
              
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)} size="lg">
  <CModalHeader onClose={() => setModal(false)}>
    <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
  </CModalHeader>
        <CModalBody>
        <CForm>
            <CFormInput
              label="Material No"
              value={currentMaterial.materialNo}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })}
            />
            <CFormInput
              label="Description"
              value={currentMaterial.description}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
            />
            <CFormInput
              label="UOM"
              value={currentMaterial.uom}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e.target.value })}
            />
            <CFormInput
              label="Price"
              type="number"
              value={currentMaterial.price}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: e.target.value })}
            />
              <div className="mb-3">
              <label className="form-label">Supplier</label>
              <Select
                value={selectedSupplierOption}
                onChange={handleSupplierChange}
                options={selectSupplier}
                styles={customStyles}
                placeholder="Select Supplier"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <Select
                value={selectedCategoryOption}
                onChange={handleCategoryChange}
                options={selectCategory}
                styles={customStyles}
                placeholder="Select Category"
              />
            </div>
            <CFormInput
              label="Type"
              value={currentMaterial.type}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
            />
            <CFormInput
              label="Min Stock"
              type="number"
              value={currentMaterial.minStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, minStock: e.target.value })}
            />
            <CFormInput
              label="Max Stock"
              type="number"
              value={currentMaterial.maxStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, maxStock: e.target.value })}
            />
           
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveMaterial}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Material;

