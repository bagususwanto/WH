import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import Flatpickr from 'react-flatpickr'
import { FilterMatchMode } from 'primereact/api'
import { MultiSelect } from 'primereact/multiselect'
import 'primereact/resources/themes/nano/theme.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
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
  CSpinner,
  CImage,
  CFormLabel,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilImagePlus, cilXCircle } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { format, parseISO } from 'date-fns'
import 'flatpickr/dist/flatpickr.min.css'
import config from '../../../utils/Config'
import { IMaskMixin } from 'react-imask'

const MySwal = withReactContent(swal)

const User = () => {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [positionOptions, setPositionOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [lineOptions, setLineOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [divisionOptions, setDivisionOptions] = useState([])
  const [warehouseOptions, setWarehouseOptions] = useState([])
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    id: '',
    noreg: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    roleId: '',
    position: '',
    noHandphone: '',
    email: '',
    img: '',
    unitCode: '',
    groupId: '',
    lineId: '',
    sectionId: '',
    departmentId: '',
    divisionId: '',
    warehouseIds: [],
    plantId: '',
    isProduction: '',
    isWarehouse: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [roleValid, setRoleValid] = useState([])
  const [orgOptions, setOrgOptions] = useState([])
  const [modalUpload, setModalUpload] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const animatedComponents = makeAnimated()
  const [isDisabled, setIsDisabled] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  const {
    getMasterData,
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
    uploadImageMaterial,
  } = useMasterDataService()

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    plant: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    storage: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },

    type: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  })

  const apiUser = 'user'
  const apiMasterUserOrg = 'user-org'
  const apiUserDelete = 'user-delete'
  const apiDeleteImgUser = 'user-delete-image'
  const apiUploadImageUser = 'user-upload-image'
  const apiPosition = 'position'
  const apiRole = 'role-public'
  const apiGroup = 'group-public'
  const apiLine = 'line-public'
  const apiSection = 'section-public'
  const apiDepartment = 'department-public'
  const apiDivision = 'division-public'
  const apiPlant = 'plant-public'
  const apiWarehouse = 'warehouse-public'
  const apiOrg = 'organization-public'
  const apiNoreg = 'user-noreg'

  useEffect(() => {
    setLoading(false)
    getUser()
    getPosition()
    getRole()
    getGroup()
    getLine()
    getSection()
    getDepartment()
    getDivision()
    getPlant()
    getWarehouse()
    getOrg()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getUser()
  }, [shouldFetch])

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '38px', // Sesuaikan dengan tinggi CFormInput
      minHeight: '38px', // Hindari auto-resize
    }),
  }

  const customStylesMultiSelct = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Pastikan dropdown selalu terlihat di atas elemen lain
    }),
    control: (provided) => ({
      ...provided,
      minHeight: '38px', // Tinggi minimum komponen Select
    }),
    valueContainer: (provided) => ({
      ...provided,
      maxHeight: '200px', // Maksimum tinggi kontainer nilai
      overflowY: 'auto', // Gulir jika tinggi melebihi batas
    }),
    multiValue: (provided) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
    }),
  }

  const columns = [
    {
      field: 'email',
      header: 'Email',
      sortable: true,
    },
    { field: 'noHandphone', header: 'Phone Number', sortable: true },
    { field: 'production', header: 'Production', sortable: true },
    { field: 'warehouse', header: 'Warehouse', sortable: true },
    { field: 'warehouses', header: 'Warehouse Access', sortable: true },
    { field: 'Organization.Group.groupName', header: 'Group', sortable: true },
    { field: 'Organization.Line.lineName', header: 'Line', sortable: true },
    { field: 'Organization.Section.sectionName', header: 'Section', sortable: true },
    { field: 'Organization.Department.departmentName', header: 'Department', sortable: true },
    { field: 'Organization.Division.divisionName', header: 'Division', sortable: true },
    { field: 'formattedCreatedAt', header: 'Created At', sortable: true },
    { field: 'formattedUpdatedAt', header: 'Updated At', sortable: true },
    { field: 'createdBy', header: 'Created By', sortable: true },
    { field: 'updatedBy', header: 'Updated By', sortable: true },
  ]

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    )

    setVisibleColumns(orderedSelectedColumns)
  }

  const getPosition = async () => {
    try {
      const response = await getMasterData(apiPosition)
      const positionOptions = response.data.map((position) => ({
        label: position.position,
        value: position.position,
        id: position.id,
      }))
      setPositionOptions(positionOptions)
    } catch (error) {
      console.error('Error fetching Position:', error)
    }
  }

  const getRole = async () => {
    try {
      const response = await getMasterData(apiRole)
      const roleOptions = response.data.map((role) => ({
        label: role.roleName
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        value: role.roleName,
        id: role.id,
      }))
      setRoleOptions(roleOptions)
    } catch (error) {
      console.error('Error fetching Role:', error)
    }
  }

  const getGroup = async () => {
    try {
      const response = await getMasterData(apiGroup)
      const groupOptions = response.data.map((group) => ({
        label: group.groupName,
        value: group.groupName,
        id: group.id,
      }))
      setGroupOptions(groupOptions)
    } catch (error) {
      console.error('Error fetching Group:', error)
    }
  }

  const getLine = async () => {
    try {
      const response = await getMasterData(apiLine)
      const lineOptions = response.data.map((line) => ({
        label: line.lineName,
        value: line.lineName,
        id: line.id,
      }))
      setLineOptions(lineOptions)
    } catch (error) {
      console.error('Error fetching Line:', error)
    }
  }

  const getSection = async () => {
    try {
      const response = await getMasterData(apiSection)
      const sectionOptions = response.data.map((section) => ({
        label: section.sectionName,
        value: section.sectionName,
        id: section.id,
      }))
      setSectionOptions(sectionOptions)
    } catch (error) {
      console.error('Error fetching Section:', error)
    }
  }

  const getDepartment = async () => {
    try {
      const response = await getMasterData(apiDepartment)
      const departmentOptions = response.data.map((department) => ({
        label: department.departmentName,
        value: department.departmentName,
        id: department.id,
      }))
      setDepartmentOptions(departmentOptions)
    } catch (error) {
      console.error('Error fetching Department:', error)
    }
  }

  const getDivision = async () => {
    try {
      const response = await getMasterData(apiDivision)
      const divisionOptions = response.data.map((division) => ({
        label: division.divisionName,
        value: division.divisionName,
        id: division.id,
      }))
      setDivisionOptions(divisionOptions)
    } catch (error) {
      console.error('Error fetching Division:', error)
    }
  }

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      const plantOptions = response.data.map((plant) => ({
        label: plant.plantName,
        value: plant.plantName,
        id: plant.id,
      }))
      setPlantOptions(plantOptions)
    } catch (error) {
      console.error('Error fetching Plant:', error)
    }
  }

  const getOrg = async () => {
    try {
      const response = await getMasterData(apiOrg)
      const orgOptions = response.data.map((org) => ({
        groupId: org.groupId,
        lineId: org.lineId,
        sectionId: org.sectionId,
        departmentId: org.departmentId,
        divisionId: org.divisionId,
        plantId: org.plantId,
        unitCode: org.unitCode,
      }))
      setOrgOptions(orgOptions)
    } catch (error) {
      console.error('Error fetching Plant:', error)
    }
  }

  const getWarehouse = async () => {
    try {
      const response = await getMasterData(apiWarehouse)
      const warehouseOptions = response.data.map((warehouse) => ({
        label: warehouse.warehouseName,
        value: warehouse.warehouseName,
        id: warehouse.id,
      }))
      setWarehouseOptions(warehouseOptions)
    } catch (error) {
      console.error('Error fetching Warehouse:', error)
    }
  }

  const isWarehouseOptions = [
    { label: 'Warehouse', value: 1 },
    { label: 'Non Warehouse', value: 0 },
  ]

  const isProductionOptions = [
    { label: 'Production', value: 1 },
    { label: 'Non Production', value: 0 },
  ]

  const getUser = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiUser)
      const dataWithFormattedFields = response.data.map((item) => {
        const production = item.isProduction == 1 ? 'Production' : 'Non Production'
        const warehouse = item.warehouse == 1 ? 'Warehouse' : 'Non Warehouse'
        const warehouses = item.Warehouses.map((warehouse) => warehouse.warehouseName).join(', ')
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.User?.username
        const updatedBy = item.updatedBy?.[0]?.User?.username
        return {
          ...item,
          production,
          warehouse,
          warehouses,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
        }
      })
      setUsers(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddUser = () => {
    setIsEdit(false)
    setCurrentUser({
      id: '',
       noreg: '',
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      roleId: '',
      position: '',
      noHandphone: '',
      email: '',
      img: '',
       unitCode: '',
      groupId: '',
      lineId: '',
      sectionId: '',
      departmentId: '',
      divisionId: '',
      warehouseIds: [],
      plantId: '',
      isProduction: '',
      isWarehouse: '',
    })
    setModal(true)
  }

  const showModalUpload = () => {
    setModalUpload(true)
  }

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate[0])
    setUploadData((prevData) => ({
      ...prevData,
      importDate: selectedDate[0],
    }))
  }

  const downloadTemplate = () => {
    import('xlsx').then((xlsx) => {
      // Mapping data untuk ekspor
      const mappedData = [
        {
          materialNo: '',
          description: '',
          uom: '',
          price: '',
          type: '',
          mrpType: '',
          minStock: '',
          maxStock: '',
          minOrder: '',
          packaging: '',
          unitPackaging: '',
          category: '',
          supplierCode: '',
          addressRack: '',
        },
      ]

      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = { Sheets: { template: worksheet }, SheetNames: ['template'] }
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      saveAsExcelFile(excelBuffer, 'template_master_data_material')
    })
  }

  const actionBodyTemplate = (rowData) => (
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

  const handleEditUser = (user) => {
    if (user.noreg) {
      setIsDisabled(true)
    }
    const selectedRole = roleOptions.find((option) => option.value === user.Role.roleName)
    setRoleValid(selectedRole.value)
    const selectedPosition = positionOptions.find((option) => option.value === user.position)
    const selectedGroup = groupOptions.find(
      (option) => option.value === user.Organization?.Group?.groupName,
    )
    const selectedLine = lineOptions.find(
      (option) => option.value === user.Organization?.Line?.lineName,
    )
    const selectedSection = sectionOptions.find(
      (option) => option.value === user.Organization?.Section?.sectionName,
    )
    const selectedDepartment = departmentOptions.find(
      (option) => option.value === user.Organization?.Department?.departmentName,
    )
    const selectedDivision = divisionOptions.find(
      (option) => option.value === user.Organization?.Division?.divisionName,
    )
    const selectedWarehouses = warehouseOptions.filter((option) =>
      user.warehouses.includes(option.value),
    )
    const selectedPlant = plantOptions.find(
      (option) => option.value === user.Organization?.Plant?.plantName,
    )
    const selectedIsProduction = isProductionOptions.find(
      (option) => option.value === user.isProduction,
    )
    const selectedIsWarehouse = isWarehouseOptions.find(
      (option) => option.value === user.isWarehouse,
    )

    setIsEdit(true)
    setCurrentUser({
      id: user.id,
      noreg: user.noreg || '',
      username: user.username,
      password: user.password,
      confirmPassword: user.confirmPassword,
      name: user.name,
      roleId: selectedRole || null,
      position: selectedPosition || null,
      noHandphone: user.noHandphone,
      email: user.email,
      img: user.img,
       unitCode: user.Organization?.unitCode || '',
      groupId: selectedGroup || null,
      lineId: selectedLine || null,
      sectionId: selectedSection || null,
      departmentId: selectedDepartment || null,
      divisionId: selectedDivision || null,
      warehouseIds: selectedWarehouses || null,
      plantId: selectedPlant || null,
      isProduction: selectedIsProduction || null,
      isWarehouse: selectedIsWarehouse || null,
    })
    setModal(true)
  }

  const handleDeleteUser = (userId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This user cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(userId)
      }
    })
  }

  const confirmDelete = async (userId) => {
    try {
      await deleteMasterDataById(apiUserDelete, userId)
      MySwal.fire('Deleted!', 'User deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error menghapus user:', error)
    }
  }

  const validateUser = (user) => {
    if (!isEdit) {
      // validasi password dan confirm password
      if (user.password !== user.confirmPassword) {
        MySwal.fire('Error', 'Password and Confirm Password must be the same', 'error')
        return false
      }
    }

    // validasi untuk role warehouse member dan warehouse staff hanya bisa 1 warehouseIds
    if (['warehouse member', 'warehouse staff'].includes(roleValid)) {
      if (user.warehouseIds.length > 1) {
        MySwal.fire('Error', 'Warehouse Access can only be 1 for this role', 'error')
        return false
      }
    }

    let requiredFields = []
    if (roleValid.includes('group head')) {
      requiredFields = [
        { field: 'username', message: 'Username is required' },
        { field: 'name', message: 'Fullname is required' },
        { field: 'roleId', message: 'Role is required' },
        { field: 'position', message: 'Position is required' },
        { field: 'unitCode', message: 'Unit Code is required' },
        { field: 'groupId', message: 'Group is required' },
        { field: 'lineId', message: 'Line is required' },
        { field: 'sectionId', message: 'Section is required' },
        { field: 'departmentId', message: 'Department is required' },
        { field: 'divisionId', message: 'Division is required' },
        { field: 'warehouseIds', message: 'Warehouse Access are required' },
        { field: 'plantId', message: 'Plant is required' },
        { field: 'isProduction', message: 'Production is required' },
        { field: 'isWarehouse', message: 'Warehouse is required' },
      ]
    } else if (roleValid.includes('line head')) {
      requiredFields = [
        { field: 'username', message: 'Username is required' },
        { field: 'name', message: 'Fullname is required' },
        { field: 'roleId', message: 'Role is required' },
        { field: 'position', message: 'Position is required' },
          { field: 'unitCode', message: 'Unit Code is required' },
        { field: 'lineId', message: 'Line is required' },
        { field: 'sectionId', message: 'Section is required' },
        { field: 'departmentId', message: 'Department is required' },
        { field: 'divisionId', message: 'Division is required' },
        { field: 'warehouseIds', message: 'Warehouse Access are required' },
        { field: 'plantId', message: 'Plant is required' },
        { field: 'isProduction', message: 'Production is required' },
        { field: 'isWarehouse', message: 'Warehouse is required' },
      ]
    } else if (roleValid.includes('section head')) {
      requiredFields = [
        { field: 'username', message: 'Username is required' },
        { field: 'name', message: 'Fullname is required' },
        { field: 'roleId', message: 'Role is required' },
        { field: 'position', message: 'Position is required' },
          { field: 'unitCode', message: 'Unit Code is required' },
        { field: 'sectionId', message: 'Section is required' },
        { field: 'departmentId', message: 'Department is required' },
        { field: 'divisionId', message: 'Division is required' },
        { field: 'warehouseIds', message: 'Warehouse Access are required' },
        { field: 'plantId', message: 'Plant is required' },
        { field: 'isProduction', message: 'Production is required' },
        { field: 'isWarehouse', message: 'Warehouse is required' },
      ]
    } else if (roleValid.includes('department head')) {
      requiredFields = [
        { field: 'username', message: 'Username is required' },
        { field: 'name', message: 'Fullname is required' },
        { field: 'roleId', message: 'Role is required' },
        { field: 'position', message: 'Position is required' },
          { field: 'unitCode', message: 'Unit Code is required' },
        { field: 'departmentId', message: 'Department is required' },
        { field: 'divisionId', message: 'Division is required' },
        { field: 'warehouseIds', message: 'Warehouse Access are required' },
        { field: 'plantId', message: 'Plant is required' },
        { field: 'isProduction', message: 'Production is required' },
        { field: 'isWarehouse', message: 'Warehouse is required' },
      ]
    } else {
      requiredFields = [
        { field: 'username', message: 'Username is required' },
        { field: 'name', message: 'Fullname is required' },
        { field: 'roleId', message: 'Role is required' },
        { field: 'position', message: 'Position is required' },
          { field: 'unitCode', message: 'Unit Code is required' },
        { field: 'warehouseIds', message: 'Warehouse Access are required' },
        { field: 'isProduction', message: 'Production is required' },
        { field: 'isWarehouse', message: 'Warehouse is required' },
      ]
    }

    // Tambahkan password dan confirmPassword ke requiredFields jika isEdit adalah false
    if (!isEdit) {
      requiredFields.push(
        { field: 'password', message: 'Password is required' },
        { field: 'confirmPassword', message: 'Confirm Password is required' },
      )
    }

    for (const { field, message } of requiredFields) {
      if (!user[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveUser = async () => {
    setLoading(true)

    if (!validateUser(currentUser)) {
      setLoading(false)
      return
    }

    try {
      const userToSave = { ...currentUser }

      if (isEdit || isUpdate) {
        await updateMasterDataById(apiMasterUserOrg, currentUser.id, userToSave)
        if(isEdit) {
          MySwal.fire('Updated!', 'User has been updated.', 'success')
        } else {
        MySwal.fire('Added!', 'User has been added.', 'success')
        }
      } else {
        delete userToSave.id
        await postMasterData(apiMasterUserOrg, userToSave)
        MySwal.fire('Added!', 'User has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setLoading(false)
      setModal(false)
      setShouldFetch(true)
    }
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setFilters({
      ...filters,
      global: { value },
    })
    setGlobalFilterValue(value)
  }

  const filteredUsers = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return users.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [users, filters.global.value])

  const renderHeader = () => {
    return (
      <div>
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
    )
  }

  const header = () => (
    <MultiSelect
      value={visibleColumns}
      options={columns}
      optionLabel="header"
      onChange={onColumnToggle}
      className="mt-2 mb-2 w-full sm:w-20rem"
      display="chip"
      placeholder="Show Hiden Columns"
      style={{ borderRadius: '5px' }}
    />
  )

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = users.map((item, index) => ({
        No: index + 1,
        Username: item.username,
        Name: item.name,
        Email: item.email,
        'Phone Number': item.noHandphone,
        Position: item.position,
        Role: item.Role?.roleName,
        Group: item.Organization?.Group?.groupName,
        Line: item.Organization?.Line?.lineName,
        Section: item.Organization?.Section?.sectionName,
        Department: item.Organization?.Department?.departmentName,
        Division: item.Organization?.Division?.divisionName,
        Plant: item.Organization?.Plant?.plantName,
        'Warehouse Access': item.warehouses,
        Production: item.isProduction == 1 ? 'Production' : 'Non Production',
        Warehouse: item.isWarehouse == 1 ? 'Warehouse' : 'Non Warehouse',
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
        'Created By': item.createdBy,
        'Updated By': item.updatedBy,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'user')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_user')
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

        if (fileName === 'template_master_data_material') {
          module.default.saveAs(
            data,
            fileName + '_download_' + new Date().getTime() + EXCEL_EXTENSION,
          )
        } else {
          module.default.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION,
          )
        }
      }
    })
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading user data...</p>
    </div>
  )

  const imageBodyTemplate = (rowData) => {
    return (
    <img
  src={
    rowData.img
      ? rowData.img.startsWith('http') || rowData.img.startsWith('//')
        ? rowData.img
        : `${config.BACKEND_URL}${rowData.img}`
      : ''
  }
    style={{ width: '50px', height: '50px' }} 
  />
    )
  }

  const handleDeleteImage = async (id) => {
    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })

      if (result.isConfirmed) {
        await updateMasterDataById(apiDeleteImgUser, id)
        setCurrentUser({
          ...currentUser,
          img: '',
        })
        MySwal.fire('Success', 'Image deleted successfully', 'success')
        setShouldFetch(true)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleAddImage = async (id) => {
    try {
      // Membuat elemen input file secara dinamis
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*' // Hanya menerima file gambar

      // Menangani pemilihan file
      input.onchange = async (event) => {
        const file = event.target.files[0]
        if (!file) {
          return MySwal.fire('Error', 'No file selected', 'error')
        }

        // Membuat FormData untuk mengirim file ke backend
        const formData = new FormData()
        formData.append('image', file)

        try {
          // Melakukan request POST ke endpoint backend
          const response = await uploadImageMaterial(apiUploadImageUser, id, formData)

          setCurrentUser({
            ...currentUser,
            img: response.data.imgPath,
          })
          MySwal.fire('Success', 'Image added successfully', 'success')
          setShouldFetch(true) // Memperbarui data setelah upload sukses
        } catch (error) {
          console.error('Error uploading image:', error)
        }
      }

      // Memicu dialog pemilihan file
      input.click()
    } catch (error) {
      console.error('Error adding image:', error)
    }
  }

  const CFormInputWithMask = IMaskMixin(({ inputRef, ...props }) => (
    <CFormInput {...props} ref={inputRef} />
  ))

  const inputRef = useRef(null) // Ref untuk input

  const handleOnAcceptNoHandphone = (value) => {
    // Menghapus angka 0 setelah +62
    if (value.startsWith('+62 0')) {
      value = '+62 ' + value.slice(5)
    }

    // Hanya perbarui state jika nilai berubah
    if (currentUser.noHandphone !== value) {
      setCurrentUser((prevState) => ({
        ...prevState,
        noHandphone: value,
      }))

      // Kembalikan fokus ke input setelah state diperbarui
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const togglePasswordVisibilityConfirm = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }
  const handleNoregChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '') // Hanya angka

     // jika noreg digit sudah 8 digit akses API untuk mendapatkan data user
    if (value.length === 8) {
     await getMasterData(`${apiNoreg}?no=${value}&flag=0`)
      .then((response) => {
        if (response.data) {

          const selectedPosition = positionOptions.find(
            (option) => option.value === response.data.position,
          )
           const selectedGroup = groupOptions.find(
      (option) => option.value === response.data.Organization?.Group?.groupName,
    )
    const selectedLine = lineOptions.find(
      (option) => option.value === response.data.Organization?.Line?.lineName,
    )
    const selectedSection = sectionOptions.find(
      (option) => option.value === response.data.Organization?.Section?.sectionName,
    )
    const selectedDepartment = departmentOptions.find(
      (option) => option.value === response.data.Organization?.Department?.departmentName,
    )
    const selectedDivision = divisionOptions.find(
      (option) => option.value === response.data.Organization?.Division?.divisionName,
    )
    const selectedPlant = plantOptions.find(
      (option) => option.value === response.data.Organization?.Plant?.plantName,
    )

          setCurrentUser((prevState) => ({
            ...prevState,
            id: response.data.id || '',
            noreg: value,
            username: response.data.username || '',
            name: response.data.name || '',
            roleId:  '',
            position: selectedPosition || '',
            noHandphone:  '',
            email: '',
            img:  '',
             unitCode: response.data.Organization?.unitCode || '',
            groupId: selectedGroup || '',
            lineId: selectedLine || '',
            sectionId: selectedSection || '',
            departmentId: selectedDepartment || '',
            divisionId: selectedDivision || '',
            warehouseIds: [],
            plantId: selectedPlant || '',
            isProduction:  '',
            isWarehouse:  '',
          }))
        }
        setIsDisabled(true) 
        setIsUpdate(true) // Set isUpdate to true when noreg is found
      })
      .catch((error) => {
        setCurrentUser((prevState) => ({
          ...prevState,
          noreg: value,
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          roleId: '',
          position: '',
          noHandphone: '',
          email: '',
          img: '',
           unitCode: '',
          groupId: '',
          lineId: '',
          sectionId: '',
          departmentId: '',
          divisionId: '',
          warehouseIds: [],
          plantId: '',
          isProduction: '',
          isWarehouse: '',
        }))
        setIsDisabled(false) // Reset isDisabled if noreg not found
        setIsUpdate(false) // Reset isUpdate if noreg not found
        console.error('Error fetching user data:', error)
      })
    } else {

    // Perbarui state noreg
        setCurrentUser((prevState) => ({
          ...prevState,
          noreg: value,
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          roleId: '',
          position: '',
          noHandphone: '',
          email: '',
          img: '',
           unitCode: '',
          groupId: '',
          lineId: '',
          sectionId: '',
          departmentId: '',
          divisionId: '',
          warehouseIds: [],
          plantId: '',
          isProduction: '',
          isWarehouse: '',
        }))

         setIsDisabled(false) // Reset isDisabled if noreg not found
        setIsUpdate(false) // Reset isUpdate if noreg not found
      }
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data User</CCardHeader>
          <CCardBody>
            {loading ? (
              <LoadingComponent />
            ) : (
              <>
                <CRow className="mb-2">
                  <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
                    <div className="d-flex flex-wrap justify-content-start">
                      <Button
                        type="button"
                        label="Add"
                        icon="pi pi-plus"
                        severity="primary"
                        className="me-2 mb-2 rounded-5"
                        onClick={handleAddUser}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Upload"
                        icon="pi pi-file-import"
                        severity="primary"
                        className="me-2 mb-2 rounded-5"
                        onClick={showModalUpload}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        className="me-2 mb-2 rounded-5"
                        onClick={exportExcel}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Template"
                        icon="pi pi-download"
                        severity="success"
                        className="mb-2 rounded-5"
                        onClick={downloadTemplate}
                        data-pr-tooltip="XLS"
                      />
                    </div>
                  </CCol>
                  <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                  </CCol>
                </CRow>
                <DataTable
                  value={filteredUsers}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  tableStyle={{ minWidth: '30rem' }}
                  className="p-datatable-gridlines p-datatable-sm text-nowrap custom-datatable"
                  scrollable
                  globalFilter={filters.global.value} // Aplikasikan filter global di sini
                  header={header}
                  onMouseDownCapture={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Column
                    header="No"
                    body={(data, options) => options.rowIndex + 1}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column header="Image" body={imageBodyTemplate} frozen alignFrozen="left" />
                  <Column
                    field="username"
                    header="Username"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column field="name" header="Name" style={{ width: '25%' }} sortable />
                  <Column field="noreg" header="Noreg" style={{ width: '25%' }} sortable />
                  <Column header="Position" field="position" style={{ width: '25%' }} sortable />
                  <Column header="Role" field="Role.roleName" style={{ width: '25%' }} sortable />
                  {visibleColumns.map((col, index) => (
                    <Column
                      key={index}
                      field={col.field}
                      header={col.header}
                      body={col.body}
                      sortable={col.sortable}
                      headerStyle={col.headerStyle}
                      bodyStyle={col.bodyStyle}
                    />
                  ))}
                  <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
                </DataTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal backdrop="static" size="xl" visible={modal} onClose={() => {
        setModal(false)
        setIsDisabled(false) // Reset isDisabled saat modal ditutup
        setIsUpdate(false) // Reset isUpdate saat modal ditutup
      }
        }>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit User' : 'Add User'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi User */}
              <CCol xs={12}>
                <h5>User Information</h5>
              </CCol>
              <div className="clearfix d-flex flex-wrap align-items-start">
                {/* Foto User */}
                <CCol
                  xs={12}
                  lg={3}
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    position: 'relative', // Relative untuk parent gambar
                  }}
                >
                  {currentUser.img ? (
                    <div
                      className="position-relative"
                      style={{
                        width: '160px',
                        height: '160px',
                      }}
                    >
                      {/* Gambar User */}
                      <CImage
                        align="start"
                        rounded
                        src={currentUser.img.startsWith('http') || currentUser.img.startsWith('//') ? currentUser.img : `${config.BACKEND_URL}${currentUser.img}`}
                        className="shadow-sm w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                      {/* Tombol Delete (X) */}
                      <CIcon
                        icon={cilXCircle}
                        size="lg"
                        className="position-absolute"
                        style={{
                          top: '-5px',
                          right: '-5px',
                          cursor: 'pointer',
                          color: 'red',
                        }}
                        onClick={() => handleDeleteImage(currentUser.id)}
                      />
                    </div>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center border border-secondary"
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        position: 'relative', // Untuk memastikan elemen di dalamnya tetap proporsional
                      }}
                    >
                      {/* Tombol Tambah Gambar (+) */}
                      <CIcon
                        icon={cilImagePlus}
                        size="xl"
                        style={{
                          cursor: 'pointer',
                          color: 'green',
                        }}
                        onClick={() => handleAddImage(currentUser.id)}
                      />
                    </div>
                  )}
                </CCol>
                {/* Form User */}
                <CCol xs={12} lg={9}>
                  <CRow className="gy-3">
                    <CCol xs={12} md={12} lg={6}>
                      <label className="mb-2" htmlFor="noreg">
                        Noreg
                      </label>
                      <CFormInput
                        id="noreg"
                        value={currentUser.noreg}
                        onChange={handleNoregChange}
                        disabled={isEdit}
                        readOnly={isEdit}
                      />
                    </CCol>
                    <CCol xs={12} md={12} lg={6}>
                      <label className="mb-2 required-label" htmlFor="username">
                        Username <span>*</span>
                      </label>
                      <CFormInput
                        id="username"
                        value={currentUser.username}
                        onChange={(e) =>
                          setCurrentUser({ ...currentUser, username: e.target.value })
                        }
                        disabled={isEdit || isDisabled}
                        readOnly={isEdit}
                      />
                    </CCol>
                    <CCol xs={12} md={12} lg={12}>
                      <label className="mb-2 required-label" htmlFor="fullname">
                        Fullname <span>*</span>
                      </label>
                      <CFormInput
                        id="fullname"
                        value={currentUser.name}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value,
                          })
                        }
                        disabled={isDisabled}
                      />
                    </CCol>
                  </CRow>
                </CCol>
              </div>
                <CCol className="mb-3" xs={12} md={12} lg={6}>
                      <label className="mb-2" htmlFor="email">
                        Email
                      </label>
                      <CFormInput
                        type="email"
                        id="email"
                        value={currentUser.email}
                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      />
                    </CCol>
                    <CCol className="mb-3" xs={12} md={12} lg={6}>
                      <label className="mb-2" htmlFor="noHandphone">
                        Phone Number
                      </label>
                      <CFormInputWithMask
                        inputRef={inputRef} // Menggunakan inputRef untuk mengontrol fokus
                        mask="+{62} 000-0000-0000"
                        id="noHandphone"
                        value={currentUser.noHandphone}
                        onAccept={(value) => handleOnAcceptNoHandphone(value)}
                      />
                    </CCol>

              {/* Password & Confirmation Password */}
              {!isEdit && (
                <>
                  <CCol xs={12}>
                    <h5>Password</h5>
                  </CCol>
                  <CCol className="mb-3" sm={12} md={12} lg={6}>
                    <label className="mb-2 required-label" htmlFor="password">
                      Password <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={currentUser.password}
                        onChange={(e) =>
                          setCurrentUser({ ...currentUser, password: e.target.value })
                        }
                      />
                      <CButton
                        onClick={togglePasswordVisibility}
                        type="button"
                        className="icon-button"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </CButton>
                    </div>
                  </CCol>
                  <CCol className="mb-3" sm={12} md={12} lg={6}>
                    <label className="mb-2 required-label" htmlFor="confirmPassword">
                      Confirmation Password <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <CFormInput
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={currentUser.confirmPassword}
                        onChange={(e) =>
                          setCurrentUser({ ...currentUser, confirmPassword: e.target.value })
                        }
                      />
                      <CButton
                        onClick={togglePasswordVisibilityConfirm}
                        type="button"
                        className="icon-button"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </CButton>
                    </div>
                  </CCol>
                </>
              )}

              {/* Section: Position & Role */}
              <CCol xs={12}>
                <h5>Position & Role</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="position">
                    Position <span>*</span>
                  </label>
                  <Select
                    value={currentUser.position}
                    options={positionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="position"
                    onChange={(e) => setCurrentUser({ ...currentUser, position: e })}
                    styles={customStyles}
                    isDisabled={isDisabled}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="role">
                    Role <span>*</span>
                  </label>
                  <Select
                    value={currentUser.roleId}
                    options={roleOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="role"
                    onChange={(e) => {
                      setCurrentUser({ ...currentUser, roleId: e })
                      setRoleValid(e.value)
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Organization */}
              <CCol xs={12}>
                <h5>Organization</h5>
              </CCol>
                <CCol className="mb-3" xs={12} md={12} lg={6}>
                      <label className="mb-2 required-label" htmlFor="unitCode">
                        Unit Code <span>*</span>
                      </label>
                      <CFormInput
                        disabled
                        type="unitCode"
                        id="unitCode"
                        value={currentUser.unitCode}
                        onChange={(e) => setCurrentUser({ ...currentUser, unitCode: e.target.value })}
                      />
                    </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Group
                    {['group head'].includes(roleValid) ? <span>*</span> : ''}
                  </label>
                  <Select
                  isDisabled={isDisabled}
                    value={currentUser.groupId}
                    options={groupOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="group"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentUser({
                          ...currentUser,
                           unitCode: '',
                          groupId: '',
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                           plantId: '',
                        })
                        return
                      }
                     
                      const line = lineOptions.find((line) => line.id === org.lineId)
                      const section = sectionOptions.find((section) => section.id === org.sectionId)
                      const department = departmentOptions.find(
                        (department) => department.id === org.departmentId,
                      )
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      const plant = plantOptions.find((plant) => plant.id === org.plantId)

                      const org = orgOptions.find((org) => org.groupId === e.id 
                      && org.lineId === line?.id && org.sectionId === section?.id 
                      && org.departmentId === department?.id && org.divisionId === division?.id 
                      && org.plantId === plant?.id)

                      if (!org) {
                        setCurrentUser({
                          ...currentUser,
                          groupId: e,
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                          plantId: '',
                          unitCode: '',
                        })
                        return
                      }
                      
                      setCurrentUser({
                        ...currentUser,
                        groupId: e,
                        lineId: line ? line : '',
                        sectionId: section ? section : '',
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
                        plantId: plant ? plant : '',
                        unitCode: org.unitCode,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="line">
                    Line {['group head', 'line head'].includes(roleValid) ? <span>*</span> : ''}
                  </label>
                  <Select
                   isDisabled={isDisabled}
                    value={currentUser.lineId}
                    options={lineOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="line"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentUser({
                          ...currentUser,
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                          plantId: '',
                          unitCode: '',
                        })
                        return
                      }
                     
                      const section = sectionOptions.find((section) => section.id === org.sectionId)
                      const department = departmentOptions.find(
                        (department) => department.id === org.departmentId,
                      )
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      const plant = plantOptions.find((plant) => plant.id === org.plantId)

                      const org = orgOptions.find((org) => org.lineId === e.id 
                      && org.sectionId === section?.id && org.departmentId === department?.id 
                      && org.divisionId === division?.id && org.plantId === plant?.id)

                      if (!org) {
                        setCurrentUser({
                          ...currentUser,
                          lineId: e,
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }

                      setCurrentUser({
                        ...currentUser,
                        lineId: e,
                        sectionId: section ? section : '',
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
                        plantId: plant ? plant : '',
                         unitCode: org.unitCode,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="section">
                    Section{' '}
                    {['group head', 'line head', 'section head'].includes(roleValid) ? (
                      <span>*</span>
                    ) : (
                      ''
                    )}
                  </label>
                  <Select
                   isDisabled={isDisabled}
                    value={currentUser.sectionId}
                    options={sectionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="section"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentUser({
                          ...currentUser,
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }
                    
                      const department = departmentOptions.find(
                        (department) => department.id === org.departmentId,
                      )
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      const plant = plantOptions.find((plant) => plant.id === org.plantId)

                      const org = orgOptions.find((org) => org.sectionId === e.id 
                      && org.departmentId === department?.id && org.divisionId === division?.id 
                      && org.plantId === plant?.id)

                      if (!org) {
                        setCurrentUser({
                          ...currentUser,
                          sectionId: e,
                          departmentId: '',
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }

                      setCurrentUser({
                        ...currentUser,
                        sectionId: e,
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
                        plantId: plant ? plant : '',
                         unitCode: org.unitCode,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="department">
                    Department{' '}
                    {['group head', 'line head', 'section head', 'department head'].includes(
                      roleValid,
                    ) ? (
                      <span>*</span>
                    ) : (
                      ''
                    )}
                  </label>
                  <Select
                   isDisabled={isDisabled}
                    value={currentUser.departmentId}
                    options={departmentOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="department"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentUser({
                          ...currentUser,
                          departmentId: '',
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }
                     
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      const plant = plantOptions.find((plant) => plant.id === org.plantId)

                      const org = orgOptions.find((org) => org.departmentId === e.id 
                      && org.divisionId === division?.id && org.plantId === plant?.id)

                      if (!org) {
                        setCurrentUser({
                          ...currentUser,
                          departmentId: e,
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }

                      setCurrentUser({
                        ...currentUser,
                        departmentId: e,
                        divisionId: division ? division : '',
                        plantId: plant ? plant : '',
                         unitCode: org.unitCode,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="division">
                    Division{' '}
                    {['group head', 'line head', 'section head', 'department head'].includes(
                      roleValid,
                    ) ? (
                      <span>*</span>
                    ) : (
                      ''
                    )}
                  </label>
                  <Select
                   isDisabled={isDisabled}
                    value={currentUser.divisionId}
                    options={divisionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="division"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentUser({
                          ...currentUser,
                          divisionId: '',
                           plantId: '',
                            unitCode: '',
                        })
                        return
                      }
                   
                      const plant = plantOptions.find((plant) => plant.id === org.plantId)

                      const org = orgOptions.find((org) => org.divisionId === e.id 
                      && org.plantId === plant?.id)
                      if (!org) {
                        setCurrentUser({
                          ...currentUser,
                          divisionId: e,
                          plantId: '',
                           unitCode: '',
                        })
                        return
                      }

                      setCurrentUser({
                        ...currentUser,
                        divisionId: e,
                        plantId: plant ? plant : '',
                          unitCode: org.unitCode,
                      })
                    }}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plant">
                    Plant{' '}
                    {['group head', 'line head', 'section head', 'department head'].includes(
                      roleValid,
                    ) ? (
                      <span>*</span>
                    ) : (
                      ''
                    )}
                  </label>
                  <Select
                   isDisabled={isDisabled}
                    value={currentUser.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plant"
                    onChange={(e) => setCurrentUser({ ...currentUser, plantId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Warehouse */}
              <CCol xs={12}>
                <h5>Warehouse</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={12}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="warehouseAccess">
                    Warehouse Access (Multiple) <span>*</span>
                  </label>
                  <Select
                    components={animatedComponents}
                    isMulti
                    value={currentUser.warehouseIds}
                    options={warehouseOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="warehouseAccess"
                    onChange={(e) => setCurrentUser({ ...currentUser, warehouseIds: e })}
                    styles={customStylesMultiSelct}
                  />
                </div>
              </CCol>

              {/* Section: Informasi Tambahan */}
              <CCol xs={12}>
                <h5>Other Information</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="production">
                    Production <span>*</span>
                  </label>
                  <Select
                    value={currentUser.isProduction}
                    options={isProductionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="production"
                    onChange={(e) => setCurrentUser({ ...currentUser, isProduction: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={6} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="warehouse">
                    Warehouse <span>*</span>
                  </label>
                  <Select
                    value={currentUser.isWarehouse}
                    options={isWarehouseOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="warehouse"
                    onChange={(e) => setCurrentUser({ ...currentUser, isWarehouse: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>
            Close
          </CButton>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={handleSaveUser}>
              {loading ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  {isEdit ? 'Update' : 'Save'}
                </>
              ) : (
                <>{isEdit ? 'Update' : 'Save'}</>
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>

      {/* Modal Upload Excel */}
      <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Upload Users</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Date</CFormLabel>
            <Flatpickr
              value={date}
              options={{
                dateFormat: 'Y-m-d',
                maxDate: new Date(),
                allowInput: true,
              }}
              onChange={handleDateChange}
              className="form-control"
              placeholder="Select a date"
            />
          </div>
          <div className="mb-3">
            <CFormInput
              // onChange={handleFileChange} // Handle perubahan file
              type="file"
              label="Excel File"
              accept=".xlsx" // Hanya menerima file Excel
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={() => handleImport()}>
              {loadingImport ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default User
