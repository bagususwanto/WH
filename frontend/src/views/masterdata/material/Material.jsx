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
    Category: '',
    Supplier: '',
    minStock: '',
    maxStock: '',
  });

  const { getMasterData, updateMasterDataById } = useMasterDataService();
  const [filters, setFilters] = useState({
    global: { value: null }
  });
  const apiMaterial = 'material';
  const apiSupplier = 'Supplier';
  const apiCategory = 'Category';

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
      addressId: '',
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
    console.log('Editing material:', material); // Debugging
    setIsEdit(true);
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: material.uom,
      price: material.price,
      type: material.type,
      Category: material.Category ? material.categoryName:'',
      Supplier: material.Supplier ? material.supplierName:'',
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
    if (isEdit) {
      // Update existing material
      updateMasterDataById(apiMaterial, currentMaterial.id, currentMaterial)
      Swal.fire('Updated!', 'Material has been updated.', 'success');
    } else {
      // Create new material
      updateMasterDataById(apiMaterial, currentMaterial.id, currentMaterial)
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
    setCurrentCategory({
      ...currentMaterial,
      Category: selectedOption ? selectedOption.value : '',
    });
  };

  // Find the selected address option for initial value
  const selectedCategoryOption = selectCategory.find(cat => cat.value === currentMaterial.Category);

  // Prepare address options for Select
  const selectSupplier = supplier.map(supp => ({
    value: supp.id,
    label: supp.supplierName,
  }));

  const handleSupplierChange = (selectedOption) => {
    setCurrentSupplier({
      ...currentMaterial,
      Supplier: selectedOption ? selectedOption.value : '',
    });
  };

  // Find the selected address option for initial value
  const selectedSupplierOption = selectSupplier.find(supp => supp.value === currentMaterial.Supplier);

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item) => ({
        id: item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        price: item.price,
        type: item.type,
        Category: item.Category,
        Supplier: item.Supplier,
        minStock: item.minStock,
        maxStock: item.maxStock,
        'Created At': item.createdAt, // Ensure correct date format
        'Updated At': item.updatedAt, // Ensure correct date format
      }));

<<<<<<< HEAD
        let evaluation
        if (quantityActual < stdStock) {
          evaluation = 'shortage'
        } else if (quantityActual > stdStock) {
          evaluation = 'over'
        } else {
          evaluation = 'ok'
        }

        return {
          'Material No': Material.materialNo,
          Description: Material.description,
          Address: Material.Address_Rack.addressRackName,
          UoM: Material.uom,
          'Standar Stock': Material.stdStock,
          'Actual Stock': quantityActual,
          Evaluation: evaluation, // Perbaiki typo dari Evalution ke Evaluation
          Plant: Material.Address_Rack.Storage.Shop.Plant.plantName,
          Shop: Material.Address_Rack.Storage.Shop.shopName,
          Storage: Material.Address_Rack.Storage.storageName,
          'Update By': Material.Log_Entries[0]?.User?.userName || '',
          'Update At': format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
        }
      })

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
=======
      const worksheet = xlsx.utils.json_to_sheet(mappedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'material');
>>>>>>> e5d483434ddd492e2506a340cae639d33a3adc1c
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

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
  
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(sheet);
      
      // Anda bisa menyesuaikan struktur data sesuai kebutuhan
      const materialsFromExcel = json.map(item => ({
        ...item,
        id: item.id || '', // Pastikan ID ada jika diperlukan
      }));
  
      // Kirim data ke backend untuk diupdate
      await axios.post('/import/material', materialsFromExcel);
      
      Swal.fire('Success!', 'Materials have been imported and updated.', 'success');
      getMaterial(); // Refresh the material list
    } catch (error) {
      console.error('Error importing materials:', error);
      Swal.fire('Error!', 'Failed to import materials.', 'error');
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
