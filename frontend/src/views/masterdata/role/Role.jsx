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
  CForm,
  
} from '@coreui/react';
import axiosInstance from '../../../utils/AxiosInstance';
import Swal from 'sweetalert2'; 


const Supplier = () => {
  const [Roles, setRoles] = useState([]);
  const [role, setRole] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRole, setcurrentRole] = useState({
    id: '',
    roleName: '',
  });
  
  useEffect(() => {
    getRole();
  }, []);

  const getRole = async () => {
    try {
      const response = await axiosInstance.get('/supplier');
      setRole(response.data);
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
      text: 'You will not be able to recover this plant!',
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
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Role Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated at</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody color="light">
                {suppliers.map((role, index) => (
                  <CTableRow key={role.id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{role.roleName}</CTableDataCell>
                    <CTableDataCell>{role.createdAt}</CTableDataCell>
                    <CTableDataCell>{role.updatedAt}</CTableDataCell>
                    <CTableDataCell>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CButton color="success" onClick={() => handleEditRole(role)}>Edit</CButton>
                        <CButton color="danger" onClick={() => handleDeleteRole(role.id)}>Delete</CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
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
