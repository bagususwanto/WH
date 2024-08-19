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


const Role = () => {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRole, setcurrentRole] = useState({
    id: '',
    roleName: '',
  });
  
  useEffect(() => {
    getRole();
  }, []);

  const actionBodyTemplate = (rowData) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button label="Edit" icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditRole(rowData)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteRole(rowData.id)} />
        </div>
       );
    };

  const getRole = async () => {
    try {
      const response = await axiosInstance.get('/supplier');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const handleAddRole = () => {
    setIsEdit(false);
    setcurrentRole({
      id: '',
      roleName: '',
    });
    setRole(true);
  };

  const handleEditRole= (role) => {
    setIsEdit(true);
    setcurrentRole({
      id: role.id,
      roleName: role.roleName,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    });
    setRole(true);
  };

  const handleDeleteRole = (role) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this role!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(role);
      }
    });
  };
  

  const confirmDelete = async (role) => {
    try {
      await axiosInstance.get(`/role-delete/${role}`);
      Swal.fire(
        'Deleted!',
        'The Role has been deleted.',
        'success'
      );
      getRole();
    } catch (error) {
      console.error('Error deleting role:', error);
      Swal.fire(
        'Error!',
        'Failed to delete the role.',
        'error'
      );
    }
  };
  
  


  const handleSaveRole = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/role/${currentRole.id}`, currentRole);
        Swal.fire(
          'Updated!',
          'The Role has been updated.',
          'success'
        );
      } else {
        await axiosInstance.post('/role', currentRole);
        Swal.fire(
          'Added!',
          'The role has been added.',
          'success'
        );
      }
      setRole(false);
      getRole();
    } catch (error) {
      console.error('Error saving role:', error);
      Swal.fire(
        'Error!',
        'Failed to save the role.',
        'error'
      );
    }
  };
  

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Role</CCardHeader>
          <CCardBody>  
            <CButton color="primary" onClick={handleAddRole}>Add</CButton>
            <CRow className='mb-3'></CRow>
            <DataTable value={roles} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} tableStyle={{ minWidth: '50rem' }}className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap">
                <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
                <Column field="roleName" header="Role Name" style={{ width: '25%' }}></Column>\
                <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
                <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
                <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={role} onClose={() => setRole(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Role' : 'Add Role'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentRole.roleName}
              onChange={(e) => setcurrentRole({ ...currentRole, roleName: e.target.value })}
              placeholder="Enter role name"
              label="Role Name"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setRole(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveRole}>{isEdit ? 'Update' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Role;
