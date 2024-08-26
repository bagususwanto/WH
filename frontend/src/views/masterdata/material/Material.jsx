import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { saveAs } from 'file-saver';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
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
  const [address, setAddress] = useState([]);
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
    stdStock: '',
    addressId: '',
    categoryId: '',
    supplierId: '',
  });

  const { getMasterData } = useMasterDataService();
  const [filters, setFilters] = useState({
    global: { value: null }
  });
  const apiMaterial = 'material';
  const apiAddress = 'address-rack';

  useEffect(() => {
    getMaterial();
    getAddress();
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

  const getAddress = async () => {
    try {
      const response = await getMasterData(apiAddress);
      setAddress(response.data);
    } catch (error) {
      console.error('Error fetching Address:', error);
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
      stdStock: '',
      addressId: '',
      categoryId: '',
      supplierId: '',
    });
    setModal(true);
  };

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditMaterial(rowData)} />
      <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteMaterial(rowData.id)} />
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
      stdStock: material.stdStock,
      categoryId: material.categoryId,
      supplierId: material.supplierId,
      addressId: material.Address_Rack.id || '', // Handle case when Address_Rack might be null
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
        await axios.put(`/material/${currentMaterial.id}`, currentMaterial);
        Swal.fire('Updated!', 'Material has been updated.', 'success');
      } else {
        await axios.post('/material', currentMaterial);
        Swal.fire('Added!', 'Material has been added.', 'success');
      }
      setModal(false);
      getMaterial();
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

  // Prepare address options for Select
  const selectAddress = address.map(addr => ({
    value: addr.id,
    label: addr.addressRackName,
  }));

  const handleAddressChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      addressId: selectedOption ? selectedOption.value : '',
    });
  };

  // Find the selected address option for initial value
  const selectedAddressOption = selectAddress.find(addr => addr.value === currentMaterial.addressId);

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item) => ({
        'id': item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        price: item.price,
        type: item.type,
        stdStock: item.stdStock,
        categoryId: item.categoryId,
        supplierId: item.supplierId,
        addressId: item.Address_Rack.id,
        'Created At': item.createdAt, // Ensure correct date format
        'Updated At': item.updatedAt, // Ensure correct date format
      }));

      const worksheet = xlsx.utils.json_to_sheet(mappedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'material');
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
              <Column field="stdStock" header="Standard Stock" style={{ width: '25%' }} />
              <Column header="Address Rack" body={(rowData) => rowData.Address_Rack ? rowData.Address_Rack.addressRackName : ''} style={{ width: '25%' }} />
              <Column field="categoryId" header="Category" style={{ width: '25%' }} />
              <Column field="supplierId" header="Supplier" style={{ width: '25%' }} />
              <Column field="createdAt" header="Created At" style={{ width: '25%' }} />
              <Column field="updatedAt" header="Updated At" style={{ width: '25%' }} />
              <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal form */}
      <CModal visible={modal}
       onClose={() => setModal(false)} 
       size="lg"
    
      >
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="Material No"
                  value={currentMaterial.materialNo}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Description"
                  value={currentMaterial.description}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="UOM"
                  value={currentMaterial.uom}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Price"
                  type="number"
                  value={currentMaterial.price}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="Type"
                  value={currentMaterial.type}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Standard Stock"
                  type="number"
                  value={currentMaterial.stdStock}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, stdStock: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
              <label htmlFor="addressSelect" className="form-label">Address Rack</label>
                <Select
                  options={selectAddress}
                  value={selectedAddressOption}
                  onChange={handleAddressChange}
                  placeholder="Select Address Rack"
                  styles={customStyles}
                />
              </CCol>
              <CCol md={5}>
                {/* Implement category and supplier dropdowns if necessary */}
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveMaterial}>Save</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Material;
