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
  CFormLabel,
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
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import config from '../../../utils/Config'
import { IMaskMixin } from 'react-imask'

const MySwal = withReactContent(swal)

const User = () => {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [plantOptions, setPlantOptions] = useState([])
  const [storage, setStorage] = useState([])
  const [positionOptions, setPositionOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [lineOptions, setLineOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [divisionOptions, setDivisionOptions] = useState([])
  const [warehouseOptions, setWarehouseOptions] = useState([])
  const [storageId, setStorageId] = useState()
  const [plantId, setPlantOptionsId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    roleId: '',
    position: '',
    noHandphone: '',
    email: '',
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
  const [loadingImport, setLoadingImport] = useState(false)
  const [modalUpload, setModalUpload] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [uploadData, setUploadData] = useState({
    importDate: date,
    file: null,
  })
  const [imported, setImported] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [isClearable, setIsClearable] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const animatedComponents = makeAnimated()

  const {
    getMasterData,
    getMasterDataById,
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
    uploadMasterData,
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

  const apiStorage = 'storage-plant'
  const apiMasterMaterial = 'material'
  const apiUser = 'user'
  const apiMaterialDelete = 'material-delete'
  const apiUpload = 'upload-master-material'
  const apiDeleteImgMaterial = 'material-delete-image'
  const apiUploadImageMaterial = 'material-upload-image'
  const apiPosition = 'position'
  const apiRole = 'role-public'
  const apiGroup = 'group-public'
  const apiLine = 'line-public'
  const apiSection = 'section-public'
  const apiDepartment = 'department-public'
  const apiDivision = 'division-public'
  const apiPlant = 'plant-public'
  const apiWarehouse = 'warehouse-public'

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
  }, [])

  // useEffect(() => {
  //   if (!shouldFetch) return
  //   getMaterial()
  // }, [plantId, storageId, type, shouldFetch, imported])

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
        return {
          ...item,
          production,
          warehouse,
          warehouses,
          formattedCreatedAt,
          formattedUpdatedAt,
        }
      })
      setUsers(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching incoming:', error)
    } finally {
      setShouldFetch(false)
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  const handleAddMaterial = () => {
    setIsEdit(false)
    setCurrentUser({
      id: '',
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      roleId: '',
      position: '',
      noHandphone: '',
      email: '',
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
  )

  const handleEditMaterial = (user) => {
    const selectedRole = roleOptions.find((option) => option.value === user.role)
    const selectedPosition = positionOptions.find((option) => option.value === user.position)
    const selectedGroup = groupOptions.find((option) => option.value === user.groupId)
    const selectedLine = lineOptions.find((option) => option.value === user.lineId)
    const selectedSection = sectionOptions.find((option) => option.value === user.sectionId)
    const selectedDepartment = departmentOptions.find(
      (option) => option.value === user.departmentId,
    )
    const selectedDivision = divisionOptions.find((option) => option.value === user.divisionId)
    const selectedWarehouses = warehouseOptions.find((option) => option.value === user.warehouseId)
    const selectedPlant = plantOptions.find((option) => option.value === user.plantId)
    const selectedIsProduction = isProductionOptions.find(
      (option) => option.value === user.isProduction,
    )
    const selectedIsWarehouse = isWarehouseOptions.find(
      (option) => option.value === user.isWarehouse,
    )

    setIsEdit(true)
    setCurrentUser({
      id: user.id,
      username: user.username,
      password: password,
      confirmPassword: confirmPassword,
      name: user.name,
      roleId: selectedRole || null,
      position: selectedPosition || null,
      noHandphone: user.noHandphone,
      email: user.email,
      groupId: selectedGroup || null,
      lineId: selectedLine || null,
      sectionId: selectedSection || null,
      departmentId: selectedDepartment || null,
      divisionId: selectedDivision || null,
      warehouseIds: user.warehouses,
      plantId: selectedPlant || null,
      isProduction: selectedIsProduction || null,
      isWarehouse: selectedIsWarehouse || null,
    })
    setModal(true)
  }

  const handleDeleteMaterial = (materialId) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'This material cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(materialId)
      }
    })
  }

  const confirmDelete = async (materialId) => {
    try {
      await deleteMasterDataById(apiMaterialDelete, materialId)
      MySwal.fire('Deleted!', 'User deleted successfully.', 'success')
      await getMaterial() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus material:', error)
    }
  }

  const validateMaterial = (material) => {
    const requiredFields = [
      { field: 'materialNo', message: 'User No. is required' },
      { field: 'description', message: 'Description is required' },
      { field: 'uom', message: 'UOM is required' },
      { field: 'price', message: 'Price is required' },
      { field: 'type', message: 'Type is required' },
      { field: 'categoryId', message: 'Category is required' },
      { field: 'supplierId', message: 'Supplier is required' },
      { field: 'minStock', message: 'Minimum Stock is required' },
      { field: 'maxStock', message: 'Maximum Stock is required' },
    ]

    for (const { field, message } of requiredFields) {
      if (!material[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveMaterial = async () => {
    setLoading(true)

    if (!validateMaterial(currentUser)) {
      setLoading(false)
      return
    }

    try {
      const materialToSave = { ...currentUser }

      if (isEdit) {
        await updateMasterDataById(apiMasterMaterial, currentUser.id, materialToSave)
        MySwal.fire('Updated!', 'User has been updated.', 'success')
      } else {
        delete materialToSave.id
        await postMasterData(apiMasterMaterial, materialToSave)
        MySwal.fire('Added!', 'User has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving material:', error)
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
      className="w-full sm:w-20rem mb-2 mt-2"
      display="chip"
      placeholder="Show Hiden Columns"
      style={{ borderRadius: '5px' }}
    />
  )

  const handleCategoryChange = (selectedOption) => {
    setCurrentUser({
      ...currentUser,
      categoryId: selectedOption ? selectedOption.value : '',
    })
  }

  const handleSupplierChange = (selectedOption) => {
    setCurrentUser({
      ...currentUser,
      supplierId: selectedOption ? selectedOption.value : '',
    })
  }

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = users.map((item) => ({
        id: item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        type: item.type,
        category: item.Category?.categoryName,
        price: item.price,
        mrpType: item.mrpType,
        minStock: item.minStock,
        maxStock: item.maxStock,
        minOrder: item.minOrder,
        packaging: item.Packaging?.packaging,
        unitPackaging: item.Packaging?.unitPackaging,
        supplier: item.Supplier?.supplierName,
        storage: item.Storages[0]?.storageName,
        plant: item.Storages[0]?.Plant?.plantName,
        CreatedAt: item.formattedCreatedAt,
        UpdatedAt: item.formattedUpdatedAt,
      }))

      // Deklarasikan worksheet hanya sekali
      const worksheet = xlsx.utils.json_to_sheet(mappedData)
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'material')

      // Tulis workbook ke dalam buffer array
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Panggil fungsi untuk menyimpan file Excel
      saveAsExcelFile(excelBuffer, 'master_data_material')
    })
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
          img: '',
          minOrder: '',
          packaging: '',
          unitPackaging: '',
          category: '',
          supplier: '',
          storageName: '',
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

  const handleImport = async () => {
    setLoadingImport(true)
    try {
      if (!uploadData.file) {
        MySwal.fire('Error', 'Please select a file', 'error')
        return
      }

      await uploadMasterData(apiUpload, uploadData)
      MySwal.fire('Success', 'File uploaded successfully', 'success')

      setImported(true)
      setShouldFetch(true)
    } catch (error) {
      console.error('Error during import:', error)
    } finally {
      setLoadingImport(false)
      setModalUpload(false)
    }
  }

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate[0])
    setUploadData((prevData) => ({
      ...prevData,
      importDate: selectedDate[0],
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setUploadData((prevData) => ({
      ...prevData,
      file: file,
    }))
  }

  const showModalUpload = () => {
    setModalUpload(true)
  }

  const initFilters = () => {
    setFilters({
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
    setGlobalFilterValue('')
    setPlantOptionsId(null)
    setStorageId(null)
    setType(null)
    setUsers([])
  }

  const clearFilter = () => {
    initFilters()
  }

  const getStorageByPlantId = async (id) => {
    if (!id) {
      return
    }
    try {
      const response = await getMasterDataById(apiStorage, id)
      const storageOptions = response.map((storage) => ({
        label: storage.storageName,
        value: storage.storageName,
        id: storage.id,
      }))
      setStorage(storageOptions)
    } catch (error) {
      console.error('Error fetching storage by ID:', error)
    }
  }

  const handlePlantChange = (e) => {
    const selectedPlantName = e.value
    const selectedPlant = plantOptions.find((p) => p.value === selectedPlantName) // Cari objek plant berdasarkan plantName
    const plantId = selectedPlant?.id // Dapatkan plant.id

    setPlantOptionsId(plantId)
    getStorageByPlantId(plantId)

    let _filters = { ...filters }
    _filters['plant'].value = selectedPlantName
    setFilters(_filters)
    setShouldFetch(true)
  }

  const handleStorageChange = (e) => {
    const selectedStorageName = e.value
    const selectedStorage = storage.find((s) => s.value === selectedStorageName) // Cari objek storage berdasarkan storageName
    const storageId = selectedStorage?.id // Dapatkan storage.id
    setStorageId(storageId)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['storage'].value = e.value
    setFilters(_filters)
  }

  const handleTypeChange = (e) => {
    const selectedTypeName = e.value
    setType(selectedTypeName)
    setShouldFetch(true)
    let _filters = { ...filters }
    _filters['type'].value = e.value
    setFilters(_filters)
  }

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading material data...</p>
    </div>
  )

  const imageBodyTemplate = (rowData) => {
    return (
      <img src={`${config.BACKEND_URL}${rowData.img}`} style={{ width: '50px', height: '50px' }} />
    )
  }

  const handleDeleteImage = async (id) => {
    try {
      await updateMasterDataById(apiDeleteImgMaterial, id)
      setCurrentUser({
        ...currentUser,
        img: '',
      })
      MySwal.fire('Success', 'Image deleted successfully', 'success')
      setShouldFetch(true)
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
          const response = await uploadImageMaterial(apiUploadImageMaterial, id, formData)
          console.log('Image uploaded successfully:', response.data)

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

  return (
    <CRow>
      <CCol>
        <CCard>
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
                        className="rounded-5 me-2 mb-2"
                        onClick={handleAddMaterial}
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
                  value={filteredUsers}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  tableStyle={{ minWidth: '30rem' }}
                  className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
                  scrollable
                  globalFilter={filters.global.value} // Aplikasikan filter global di sini
                  header={header}
                >
                  <Column
                    header="No"
                    body={(data, options) => options.rowIndex + 1}
                    frozen
                    alignFrozen="left"
                  />
                  <Column header="Image" body={imageBodyTemplate} frozen alignFrozen="left" />
                  <Column
                    field="username"
                    header="Username"
                    style={{ width: '25%' }}
                    frozen
                    alignFrozen="left"
                  />
                  <Column field="name" header="Name" style={{ width: '25%' }} />
                  <Column header="Position" field="position" style={{ width: '25%' }} />
                  <Column header="Role" field="Role.roleName" style={{ width: '25%' }} />
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
                  className="d-flex justify-content-center align-items-center mb-3"
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
                        src={`${config.BACKEND_URL}${currentUser.img}`}
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
                      className="d-flex justify-content-center align-items-center border border-secondary"
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
                      <label className="mb-2 required-label" htmlFor="username">
                        Username <span>*</span>
                      </label>
                      <CFormInput
                        id="username"
                        value={currentUser.username}
                        onChange={(e) =>
                          setCurrentUser({ ...currentUser, username: e.target.value })
                        }
                        disabled={isEdit}
                        readOnly={isEdit}
                      />
                    </CCol>
                    <CCol xs={12} md={12} lg={6}>
                      <label className="mb-2 required-label" htmlFor="fullname">
                        Fullname <span>*</span>
                      </label>
                      <CFormInput
                        id="fullname"
                        value={currentUser.name}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value
                              .toLowerCase()
                              .split(' ')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' '),
                          })
                        }
                      />
                    </CCol>
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
                  </CRow>
                </CCol>
              </div>

              {/* Password & Confirmation Password */}
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
                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  />
                  <CButton onClick={togglePasswordVisibility} type="button" className="icon-button">
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
                    onChange={(e) => setCurrentUser({ ...currentUser, roleId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Organization */}
              <CCol xs={12}>
                <h5>Organization</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="group">
                    Group <span>*</span>
                  </label>
                  <Select
                    value={currentUser.groupId}
                    options={groupOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="group"
                    onChange={(e) => setCurrentUser({ ...currentUser, groupId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="line">
                    Line <span>*</span>
                  </label>
                  <Select
                    value={currentUser.lineId}
                    options={lineOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="line"
                    onChange={(e) => setCurrentUser({ ...currentUser, lineId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="section">
                    Section <span>*</span>
                  </label>
                  <Select
                    value={currentUser.sectionId}
                    options={sectionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="section"
                    onChange={(e) => setCurrentUser({ ...currentUser, sectionId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="department">
                    Department <span>*</span>
                  </label>
                  <Select
                    value={currentUser.departmentId}
                    options={departmentOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="department"
                    onChange={(e) => setCurrentUser({ ...currentUser, departmentId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="division">
                    Division <span>*</span>
                  </label>
                  <Select
                    value={currentUser.divisionId}
                    options={divisionOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={isClearable}
                    id="division"
                    onChange={(e) => setCurrentUser({ ...currentUser, divisionId: e })}
                    styles={customStyles}
                  />
                </div>
              </CCol>

              {/* Section: Warehouse & Plant */}
              <CCol xs={12}>
                <h5>Warehouse & Plant</h5>
              </CCol>
              <CCol className="mb-3" sm={12} md={12} lg={6}>
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
              <CCol className="mb-3" sm={12} md={6} lg={6}>
                <div className="form-group">
                  <label className="mb-2 required-label" htmlFor="plantAccess">
                    Plant <span>*</span>
                  </label>
                  <Select
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
            <CButton color="primary" onClick={handleSaveMaterial}>
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

      <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Upload Master User</CModalTitle>
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
              onChange={handleFileChange} // Handle perubahan file
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
