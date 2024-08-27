import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/mira/theme.css';
import 'primeicons/primeicons.css'
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
import useAxiosWithAuth from '../../../utils/AxiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';

const axiosInstance = useAxiosWithAuth();

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [address, setAddress] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    uom: '',
    price: '',
    type: '',
    stdStock: '',
    addressId: '',
    categoryId: '',
    supplierId: '',
  });
  
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
      color: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '' : 'white',
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
      const response = await axiosInstance.get('/address-rack');
      setAddress(response.data);
    } catch (error) {
      console.error('Error fetching Address:', error);
    }

  };
  const getCategory = async () => {
    try {
      const response = await axiosInstance.get('/Category');
      setAddress(response.data);
    } catch (error) {
      console.error('Error fetching Address:', error);
    }
  };

  const getMaterial = async () => {
    try {
      const response = await axiosInstance.get('/material');
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

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditMaterial(rowData)} />
        <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteMaterial(rowData.id)} />
      </div>
    );
  };



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
      addressId: material.Address_Rack.id, // Menjaga array jika perlu
    });
    setModal(true);
  };

  const handleDeleteMaterial = (material) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this material!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(material);
      }
    });
  };

  const confirmDelete = async (material) => {
    try {
      await axiosInstance.delete(`/material/${material}`);
      Swal.fire('Deleted!', 'The Material has been deleted.', 'success');
      getMaterial();
    } catch (error) {
      console.error('Error deleting material:', error);
      Swal.fire('Error!', 'Failed to delete the material.', 'error');
    }
  };

  const handleSaveMaterial = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/material/${currentMaterial.id}`, currentMaterial);
        Swal.fire('Updated!', 'The Material has been updated.', 'success');
      } else {
        await axiosInstance.post('/material', currentMaterial);
        Swal.fire('Added!', 'The material has been added.', 'success');
      }
      setModal(false);
      getMaterial();
    } catch (error) {
      console.error('Error saving material:', error);
      Swal.fire('Error!', 'Failed to save the material.', 'error');
    }
  };

  const selectAddress = address.map(addr => ({
    value: addr.id,
    label: `${addr.addressRackName}`
  }));

  const handleAddressChange = (selectedOption) => {
    // Ensure selectedOption is an object, not an array
    setCurrentMaterial({
      ...currentMaterial,
      address_Rack: selectedOption ? selectedOption.value : null // Handle single object
    });
  };

  // Find selected address object for setting initial value
  const selectedAddressOption = selectAddress.find(addr => addr.value === currentMaterial.id);
  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = visibleData.map((item) => {
        const { quantityActual, Material } = item
        const stdStock = Material?.stdStock

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
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'inventory')
    })
  }

  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        let EXCEL_EXTENSION = '.xlsx'
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        })

        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION)
      }
    })
  }


  return (
    <CRow>
      <CCol>
   
        <CCard>
          <CCardHeader>Master Data Supplier</CCardHeader>
          <CCardBody>  
          <CCol xs={6} sm={6} md={3}>
                <Button
                  type="button"
                  label="Excel"
                  icon="pi pi-file-excel"
                  severity="success"
                  className="rounded-5"
                  onClick={exportExcel}
                  data-pr-tooltip="XLS"
                />
              </CCol>
            <CButton color="primary" onClick={handleAddMaterial}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable 
              value={materials} 
              paginator 
              rows={10} 
              rowsPerPageOptions={[10, 25, 50]} 
              tableStyle={{ minWidth: '50rem' }} 
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
            >
              <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
              <Column field="materialNo" header="No Material" style={{ width: '25%' }} />
              <Column field="description" header="Description" style={{ width: '25%' }} />
              <Column field="uom" header="UOM" style={{ width: '25%' }} />
              <Column field="price" header="Price" style={{ width: '25%' }} />
              <Column field="type" header="Type" style={{ width: '25%' }} />
              <Column field="stdStock" header="Standard Stock" style={{ width: '25%' }} />
              <Column 
                header="Address Rack" 
                body={(rowData) => rowData.Address_Rack ? rowData.Address_Rack.addressRackName : ''} 
                style={{ width: '25%' }} 
              />
              <Column field="categoryId" header="Category" style={{ width: '25%' }} />
              <Column field="supplierId" header="Supplier" style={{ width: '25%' }} />
              <Column field="createdAt" header="Created At" style={{ width: '25%' }} />
              <Column field="updatedAt" header="Updated At" style={{ width: '25%' }} />
              <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentMaterial.materialNo}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })}
              placeholder="Enter Material Number"
              label="Material No"
            />
            <CFormInput
              type="text"
              value={currentMaterial.description}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
              placeholder="Enter Description"
              label="Description"
            />
            <CFormInput
              type="text"
              value={currentMaterial.uom}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e.target.value })}
              placeholder="Enter UOM"
              label="UOM"
            />
            <CFormInput
              type="text"
              value={currentMaterial.price}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: e.target.value })}
              placeholder="Enter Price"
              label="Price"
            />
            <CFormInput
              type="text"
              value={currentMaterial.type}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
              placeholder="Enter Type"
              label="Type"
            />
            <CFormInput
              type="text"
              value={currentMaterial.stdStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, stdStock: e.target.value })}
              placeholder="Enter Standard Stock"
              label="Standard Stock"
            />
            <CFormInput
              type="text"
              value={currentMaterial.categoryId}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, categoryId: e.target.value })}
              placeholder="Enter Category ID"
              label="Category"
            />
            <div className="mb-3">
            <label className="form-label">Address Rack</label>
             <Select
              value={selectedAddressOption}
              onChange={handleAddressChange}
              options={selectAddress}
              isClearable
              placeholder="Select Address"
              styles={customStyles} // Terapkan gaya kustom 
            />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveMaterial}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Material;
