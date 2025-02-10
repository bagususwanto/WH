import React, { useState, useEffect, useMemo, Suspense } from 'react'
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
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import config from '../../../utils/Config'

const MySwal = withReactContent(swal)

const category = () => {
  const [categorys, setCategorys] = useState([])

  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const [type, setType] = useState()
  const [categoryOptions, setCategoryOptions] = useState([])
  const [storageId, setStorageId] = useState()
  const [plantId, setPlantOptionsId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [currentCategory, setCurrentCategory] = useState({
    id: '',
    categoryName: '',
    createdAt: '',
    updatedAt: '',
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

  const apiPlant = 'plant-public'
  const apiStorage = 'storage-plant'
  const apiCategory = 'category'

  useEffect(() => {
    setLoading(false)
    getCategory()
    getPlant()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    getCategory()
  }, [shouldFetch])

  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '38px', // Sesuaikan dengan tinggi CFormInput
      minHeight: '38px', // Hindari auto-resize
    }),
  }

  const columns = [{ field: 'category', header: 'Category', sortable: true }]

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    )

    setVisibleColumns(orderedSelectedColumns)
  }

  const getCategory = async () => {
    try {
      const response = await getMasterData(apiCategory)
      const categoryOptions = response.data.map((category) => ({
        id: category.id,
        label: category.categoryName,
        value: category.categoryName,
      }))
      setCategoryOptions(categoryOptions)
    } catch (error) {
      console.error('Error fetching Category:', error)
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

  const handleAddCategory = () => {
    setIsEdit(false)
    setCurrentCategory({
      id: '',
      categoryName: '',
      createdAt: '',
      updatedAt: '',
    })
    setModal(true)
  }

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-success"
        onClick={() => handleEditCategory(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeleteCategory(rowData.id)}
      />
    </div>
  )

  const handleEditCategory = (category) => {
    setIsEdit(true)
    setCurrentCategory({
      id: category.id,
      selectedCategory: category.categoryName,
    })
    setModal(true)
  }

  const handleDeleteCategory = (materialId) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'This material cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
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
      MySwal.fire('Deleted!', 'Material deleted successfully.', 'success')
      await getMaterial() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus material:', error)
    }
  }

  const validateCategory = (material) => {
    const requiredFields = [{ field: 'categoryName', message: 'Material No. is required' }]

    for (const { field, message } of requiredFields) {
      if (!material[field]) {
        MySwal.fire('Error', message, 'error')
        return false
      }
    }
    return true
  }

  const handleSaveCategory = async () => {
    setLoading(true)

    if (!validateCategory(currentCategory)) {
      setLoading(false)
      return
    }

    try {
      const categoryToSave = { ...currentCategory }

      if (isEdit) {
        await updateMasterDataById(apiCategory, currentCategory.id, categoryToSave)
        MySwal.fire('Updated!', 'Material has been updated.', 'success')
      } else {
        delete categoryToSave.id
        await postMasterData(apiCategory, categoryToSave)
        MySwal.fire('Added!', 'Material has been added.', 'success')
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

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = categorys.map((item) => ({
        id: item.id,
        categoryName: item.categoryName,
        'Created At': item.formattedCreatedAt,
        'Updated At': item.formattedUpdatedAt,
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

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Master Data Category</CCardHeader>
          <CCardBody>
            <CRow className="mb-2">
              <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
                <div className="d-flex flex-wrap justify-content-start">
                  <Button
                    type="button"
                    label="Add"
                    icon="pi pi-plus"
                    severity="primary"
                    className="rounded-5 me-2 mb-2"
                    onClick={handleAddCategory}
                    data-pr-tooltip="XLS"
                  />
                  <Button
                    type="button"
                    label="Upload"
                    icon="pi pi-file-import"
                    severity="primary"
                    className="rounded-5 me-2 mb-2"
                    onClick={showModalUpload}
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
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              scrollable
            >
              <Column
                header="No"
                body={(data, options) => options.rowIndex + 1}
                frozen
                alignFrozen="left"
              />

              <Column
                field="categoryName"
                header="Category"
                style={{ width: '25%' }}
                frozen
                alignFrozen="left"
              />
              <Column field="createdAt" header="Created" style={{ width: '25%' }} />
              <Column field="updatedAt" header="Update" style={{ width: '25%' }} />
              <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal backdrop="static" size="md" visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Category' : 'Add Category'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              {/* Section: Informasi Material */}
              <CCol xs={12}>
                <h5>Category Information</h5>
              </CCol>
              <div className="clearfix d-flex flex-wrap align-items-start">
                {/* Foto Material */}

                {/* Form Material */}
                {console.log(currentCategory)}
                <CCol xs={12} lg={12}>
                  <CRow className="gy-3">
                    <CCol xs={12} md={12} lg={12}>
                      <label className="mb-2 required-label" htmlFor="materialNo">
                        Category <span>*</span>
                      </label>
                      <CFormInput
                        value={currentCategory.categoryName}
                        onChange={(e) =>
                          setCurrentCategory({ ...currentCategory, categoryName: e.target.value })
                        }
                      />
                    </CCol>
                  </CRow>
                </CCol>
              </div>
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
            <CButton color="primary" onClick={handleSaveCategory}>
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
          <CModalTitle id="LiveDemoExampleLabel">Upload Master Material</CModalTitle>
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

export default category
