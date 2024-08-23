import React, { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
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
} from '@coreui/react'
import Swal from 'sweetalert2'
import axiosInstance from '../../../utils/AxiosInstance'
import useMasterDataService from '../../../services/MasterDataService'

const User = () => {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    password: '',
    name: '',
    roleId: '',
    costCenterId: '',
  })
  const { getMasterData } = useMasterDataService()
  const api = 'user'

  useEffect(() => {
    getUser()
  }, [])

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
          label="Edit"
          icon="pi pi-pencil"
          className="p-button-success"
          onClick={() => handleEditUser(rowData)}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={() => handleDeleteUser(rowData.id)}
        />
      </div>
    )
  }

  const getUser = async () => {
    const response = await getMasterData(api)
    setUsers(response.data)
  }

  const handleAddUser = () => {
    setIsEdit(false)
    setCurrentUser({
      id: '',
      username: '',
      password: '',
      name: '',
      roleId: '',
      costCenterId: '',
    })
    setModal(true)
  }

  const handleEditUser = (user) => {
    setIsEdit(true)
    setCurrentUser({
      id: user.id,
      username: user.username,
      password: user.password,
      name: user.name,
      roleId: user.roleId,
      costCenterId: user.costCenterId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    setModal(true)
  }

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this plant!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(user)
      }
    })
  }

  const confirmDelete = async (user) => {
    try {
      await axiosInstance.get(`/user-delete/${user}`)
      Swal.fire('Deleted!', 'The Supplier has been deleted.', 'success')
      getUser()
    } catch (error) {
      console.error('Error deleting user:', error)
      Swal.fire('Error!', 'Failed to delete the user.', 'error')
    }
  }

  const handleSaveUser = async () => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/user/${currentUser.id}`, currentUser)
        Swal.fire('Updated!', 'The Supplier has been updated.', 'success')
      } else {
        await axiosInstance.post('/user', currentUser)
        Swal.fire('Added!', 'The user has been added.', 'success')
      }
      setModal(false)
      getUser()
    } catch (error) {
      console.error('Error saving user:', error)
      Swal.fire('Error!', 'Failed to save the user.', 'error')
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Supplier</CCardHeader>
          <CCardBody>
            <CButton color="primary" onClick={handleAddUser}>
              Add
            </CButton>
            <CRow className="mb-3"></CRow>
            <DataTable
              value={users}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: '50rem' }}
            >
              <Column field="id" header="No" body={(data, options) => options.rowIndex + 1} />
              <Column field="username" header="Username" style={{ width: '25%' }}></Column>
              <Column field="password" header="Password" style={{ width: '25%' }}></Column>
              <Column field="name" header="Nama" style={{ width: '25%' }}></Column>
              <Column field="roleId" header="Role" style={{ width: '25%' }}></Column>
              <Column field="createdAt" header="Created At" style={{ width: '25%' }}></Column>
              <Column field="updateAt" header="Update At" style={{ width: '25%' }}></Column>
              <Column header="Action" body={actionBodyTemplate} />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Edit Supplier' : 'Add User'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              value={currentUser.username}
              onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
              placeholder="Enter user name"
              label="User Name"
            />
            <CFormInput
              type="text"
              value={currentUser.password}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              placeholder="Enter user name"
              label="Password"
            />
            <CFormInput
              type="text"
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              placeholder="Enter user name"
              label="Name"
            />
            <CFormInput
              type="number"
              value={currentUser.roleId}
              onChange={(e) => setCurrentUser({ ...currentUser, roleId: e.target.value })}
              placeholder="Enter user name"
              label="Role ID"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveUser}>
            {isEdit ? 'Update' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default User
