import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
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

const Organization = () => {
  const [organizations, setOrganizations] = useState([])
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
  const [currentOrg, setCurrentOrg] = useState({
    id: '',
    groupId: '',
    lineId: '',
    sectionId: '',
    departmentId: '',
    divisionId: '',
    plantId: '',
  })
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [roleValid, setRoleValid] = useState([])
  const [orgOptions, setOrgOptions] = useState([])

  const animatedComponents = makeAnimated()

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

  const apiUser = 'organizations'
  const apiMasterUserOrg = 'organizations-org'
  const apiUserDelete = 'organizations-delete'
  const apiDeleteImgUser = 'organizations-delete-image'
  const apiUploadImageUser = 'organizations-upload-image'
  const apiPosition = 'position'
  const apiRole = 'role-public'
  const apiGroup = 'group-public'
  const apiLine = 'line-public'
  const apiSection = 'section-public'
  const apiDepartment = 'department-public'
  const apiDivision = 'division-public'
  const apiPlant = 'plant-public'
  const apiWarehouse = 'warehouse-public'
  const apiOrg = 'organization'

  useEffect(() => {
    setLoading(false)
    getOrganizations()
    // getPosition()
    // getRole()
    // getGroup()
    // getLine()
    // getSection()
    // getDepartment()
    // getDivision()
    // getPlant()
    // getWarehouse()
    // getOrg()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getOrganizations()
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
        label: `${section.sectionName} - ${section.sectionCode}`,
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

  const getOrganizations = async () => {
    setLoading(true)
    try {
      const response = await getMasterData(apiOrg)
      const dataWithFormattedFields = response.data.map((item) => {
        const formattedCreatedAt = item.createdAt
          ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const formattedUpdatedAt = item.updatedAt
          ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
          : ''
        const createdBy = item.createdBy?.[0]?.Organization?.username
        const updatedBy = item.updatedBy?.[0]?.Organization?.username
        return {
          ...item,
          formattedCreatedAt,
          formattedUpdatedAt,
          createdBy,
          updatedBy,
        }
      })
      setOrganizations(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddOrg = () => {
    setIsEdit(false)
    setCurrentOrg({
      id: '',
      groupId: '',
      lineId: '',
      sectionId: '',
      departmentId: '',
      divisionId: '',
      plantId: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditOrg(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteUser(rowData.id)}
      />
    </div>
  )

  const handleEditOrg = (organizations) => {
    console.log('organizations:', organizations)
    const selectedPosition = positionOptions.find(
      (option) => option.value === organizations.position,
    )

    setIsEdit(true)
    setCurrentOrg({
      id: '',
      groupId: '',
      lineId: '',
      sectionId: '',
      departmentId: '',
      divisionId: '',
      plantId: '',
    })
    setModal(true)
  }

  const handleDeleteUser = (userId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This organizations cannot be recovered!',
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
      MySwal.fire('Deleted!', 'Organization deleted successfully.', 'success')
      setShouldFetch(true)
    } catch (error) {
      console.error('Error menghapus organizations:', error)
    }
  }

  const validateUser = (organizations) => {
    if (!isEdit) {
      // validasi password dan confirm password
      if (organizations.password !== organizations.confirmPassword) {
        MySwal.fire('Error', 'Password and Confirm Password must be the same', 'error')
        return false
      }
    }

    // validasi untuk role warehouse member dan warehouse staff hanya bisa 1 warehouseIds
    if (['warehouse member', 'warehouse staff'].includes(roleValid)) {
      if (organizations.warehouseIds.length > 1) {
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
      if (!organizations[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveUser = async () => {
    setLoading(true)

    if (!validateUser(currentOrg)) {
      setLoading(false)
      return
    }

    try {
      const userToSave = { ...currentOrg }

      if (isEdit) {
        await updateMasterDataById(apiMasterUserOrg, currentOrg.id, userToSave)
        MySwal.fire('Updated!', 'Organization has been updated.', 'success')
      } else {
        delete userToSave.id
        await postMasterData(apiMasterUserOrg, userToSave)
        MySwal.fire('Added!', 'Organization has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving organizations:', error)
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

  const filteredOrganizations = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return organizations.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [organizations, filters.global.value])

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
      className="w-full sm:w-20rem mb-2 mt-2"
      display="chip"
      placeholder="Show Hiden Columns"
      style={{ borderRadius: '5px' }}
    />
  )

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = organizations.map((item, index) => ({
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
      xlsx.utils.book_append_sheet(workbook, worksheet, 'organizations')

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
      <p>Loading organizations data...</p>
    </div>
  )

  const imageBodyTemplate = (rowData) => {
    return (
      <img src={`${config.BACKEND_URL}${rowData.img}`} style={{ width: '50px', height: '50px' }} />
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
        setCurrentOrg({
          ...currentOrg,
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
          console.log('Image uploaded successfully:', response.data)

          setCurrentOrg({
            ...currentOrg,
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
    if (currentOrg.noHandphone !== value) {
      setCurrentOrg((prevState) => ({
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

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Organization</CCardHeader>
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
                        className="rounded-5 me-2 mb-2"
                        onClick={handleAddOrg}
                        data-pr-tooltip="XLS"
                      />
                      <Button
                        type="button"
                        label="Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        className="rounded-5 me-2 mb-2"
                        onClick={exportExcel}
                        data-pr-tooltip="XLS"
                      />
                    </div>
                  </CCol>
                  <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                  </CCol>
                </CRow>
                <DataTable
                  value={filteredOrganizations}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  tableStyle={{ minWidth: '30rem' }}
                  className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
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
                  <Column
                    field="Group.groupName"
                    header="Group"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column field="Line.lineName" header="Line" style={{ width: '25%' }} sortable />
                  <Column
                    field="Section.sectionName"
                    header="Section"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Department.departmentName"
                    header="Department"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Division.divisionName"
                    header="Division"
                    style={{ width: '25%' }}
                    sortable
                  />
                  <Column
                    field="Plant.plantName"
                    header="Plant"
                    style={{ width: '25%' }}
                    sortable
                  />
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

      <CModal backdrop="static" size="xl" visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Organization' : 'Add Organization'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Organization */}
              <CCol xs={12}>
                <h5>Organization Information</h5>
              </CCol>

              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Group
                    {['group head'].includes(roleValid) ? <span>*</span> : ''}
                  </label>
                  <Select
                    value={currentOrg.groupId}
                    options={groupOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="group"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentOrg({
                          ...currentOrg,
                          groupId: '',
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                        })
                        return
                      }
                      const org = orgOptions.find((org) => org.groupId === e.id)
                      if (!org) {
                        setCurrentOrg({
                          ...currentOrg,
                          groupId: e,
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
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
                      setCurrentOrg({
                        ...currentOrg,
                        groupId: e,
                        lineId: line ? line : '',
                        sectionId: section ? section : '',
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
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
                    value={currentOrg.lineId}
                    options={lineOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="line"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentOrg({
                          ...currentOrg,
                          lineId: '',
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                        })
                        return
                      }
                      const org = orgOptions.find((org) => org.lineId === e.id)
                      if (!org) {
                        setCurrentOrg({
                          ...currentOrg,
                          lineId: e,
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
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
                      setCurrentOrg({
                        ...currentOrg,
                        lineId: e,
                        sectionId: section ? section : '',
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
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
                    value={currentOrg.sectionId}
                    options={sectionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="section"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentOrg({
                          ...currentOrg,
                          sectionId: '',
                          departmentId: '',
                          divisionId: '',
                        })
                        return
                      }
                      const org = orgOptions.find((org) => org.sectionId === e.id)
                      if (!org) {
                        setCurrentOrg({
                          ...currentOrg,
                          sectionId: e,
                          departmentId: '',
                          divisionId: '',
                        })
                        return
                      }
                      const department = departmentOptions.find(
                        (department) => department.id === org.departmentId,
                      )
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      setCurrentOrg({
                        ...currentOrg,
                        sectionId: e,
                        departmentId: department ? department : '',
                        divisionId: division ? division : '',
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
                    value={currentOrg.departmentId}
                    options={departmentOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="department"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentOrg({
                          ...currentOrg,
                          departmentId: '',
                          divisionId: '',
                        })
                        return
                      }
                      const org = orgOptions.find((org) => org.departmentId === e.id)
                      if (!org) {
                        setCurrentOrg({
                          ...currentOrg,
                          departmentId: e,
                          divisionId: '',
                        })
                        return
                      }
                      const division = divisionOptions.find(
                        (division) => division.id === org.divisionId,
                      )
                      setCurrentOrg({
                        ...currentOrg,
                        departmentId: e,
                        divisionId: division ? division : '',
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
                    value={currentOrg.divisionId}
                    options={divisionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="division"
                    onChange={(e) => {
                      if (!e) {
                        setCurrentOrg({
                          ...currentOrg,
                          divisionId: '',
                        })
                        return
                      }
                      setCurrentOrg({ ...currentOrg, divisionId: e })
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
                    value={currentOrg.plantId}
                    options={plantOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="plant"
                    onChange={(e) => setCurrentOrg({ ...currentOrg, plantId: e })}
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
    </CRow>
  )
}

export default Organization
