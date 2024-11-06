import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
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
} from '@coreui/react'
import useMasterDataService from '../../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const MySwal = withReactContent(swal)

const Material = () => {
  const [materials, setMaterials] = useState([])
  const [supplier, setSupplier] = useState([])
  const [category, setCategory] = useState([])
  const [modal, setModal] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState({
    id: '',
    materialNo: '',
    description: '',
    uom: '',
    price: '',
    type: '',
    categoryId: '',
    supplierId: '',
    minStock: '',
    maxStock: '',
  })
  const [loading, setLoading] = useState(false)
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
    deleteMasterDataById,
    updateMasterDataById,
    postMasterData,
    uploadMasterData,
  } = useMasterDataService()
  const [filters, setFilters] = useState({
    global: { value: null },
  })

  const apiMaterial = 'material'
  const apiMaterialDelete = 'material-delete'
  const apiSupplier = 'supplier'
  const apiCategory = 'category'
  const apiUpload = 'upload-master-material'

  useEffect(() => {
    getMaterial()
    getSupplier()
    getCategory()
  }, [])

  useEffect(() => {
    if (imported) {
      getMaterial()
      setImported(false) // Reset state
    }
  }, [imported])

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
  }

  const getCategory = async () => {
    try {
      const response = await getMasterData(apiCategory)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching Category:', error)
    }
  }

  const getSupplier = async () => {
    try {
      const response = await getMasterData(apiSupplier)
      setSupplier(response.data)
    } catch (error) {
      console.error('Error fetching Supplier:', error)
    }
  }

  const getMaterial = async () => {
    try {
      const response = await getMasterData(apiMaterial)
      const dataWithFormattedFields = response.data.map((item) => {
        return {
          ...item,
          formatedPrice: item.price
            ? `Rp. ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.00`
            : '',
          formattedCreatedAt: item.createdAt
            ? format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
            : '',
          formattedUpdatedAt: item.updatedAt
            ? format(parseISO(item.updatedAt), 'yyyy-MM-dd HH:mm:ss')
            : '',
        }
      })
      setMaterials(dataWithFormattedFields)
    } catch (error) {
      console.error('Error fetching Material:', error)
    }
  }

  const handleAddMaterial = () => {
    setIsEdit(false)
    setCurrentMaterial({
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

  const handleEditMaterial = (material) => {
    setIsEdit(true)
    setCurrentMaterial({
      id: material.id,
      materialNo: material.materialNo,
      description: material.description,
      uom: material.uom,
      price: material.price,
      type: material.type,
      categoryId: material.Category ? material.Category.id : '',
      supplierId: material.Supplier ? material.Supplier.id : '',
      minStock: material.minStock,
      maxStock: material.maxStock,
    })
    setModal(true)
  }

  const handleDeleteMaterial = (materialId) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Material ini tidak dapat dipulihkan!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(materialId)
      }
    })
  }

  const confirmDelete = async (materialId) => {
    try {
      await deleteMasterDataById(apiMaterialDelete, materialId)
      MySwal.fire('Terhapus!', 'Material telah dihapus.', 'success')
      await getMaterial() // Refresh the list after deletion
    } catch (error) {
      console.error('Error menghapus material:', error)
    }
  }

  const validateMaterial = (material) => {
    const requiredFields = [
      { field: 'materialNo', message: 'Material No. is required' },
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

    if (!validateMaterial(currentMaterial)) {
      setLoading(false)
      return
    }

    try {
      const materialToSave = { ...currentMaterial }

      if (isEdit) {
        await updateMasterDataById(apiMaterial, currentMaterial.id, materialToSave)
        MySwal.fire('Updated!', 'Material has been updated.', 'success')
      } else {
        delete materialToSave.id
        await postMasterData(apiMaterial, materialToSave)
        MySwal.fire('Added!', 'Material has been added.', 'success')
      }
    } catch (error) {
      console.error('Error saving material:', error)
    } finally {
      setLoading(false)
      setModal(false)
      getMaterial() // Refresh the list
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

  const filteredMaterials = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    return materials.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter),
      )
    })
  }, [materials, filters.global.value])

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

  const selectCategory = category.map((cat) => ({
    value: cat.id,
    label: cat.categoryName,
  }))

  const handleCategoryChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      categoryId: selectedOption ? selectedOption.value : '',
    })
  }

  // Find the selected address option for initial value
  const selectedCategoryOption = selectCategory.find(
    (cat) => cat.value === currentMaterial.categoryId,
  )

  // Prepare address options for Select
  const selectSupplier = supplier.map((supp) => ({
    value: supp.id,
    label: supp.supplierName,
  }))

  const handleSupplierChange = (selectedOption) => {
    setCurrentMaterial({
      ...currentMaterial,
      supplierId: selectedOption ? selectedOption.value : '',
    })
  }

  // Find the selected address option for initial value
  const selectedSupplierOption = selectSupplier.find(
    (supp) => supp.value === currentMaterial.supplierId,
  )

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const mappedData = materials.map((item) => ({
        id: item.id,
        materialNo: item.materialNo,
        description: item.description,
        uom: item.uom,
        price: item.price,
        type: item.type,
        Category: item.Category.categoryName,
        Supplier: item.Supplier.supplierName,
        minStock: item.minStock,
        maxStock: item.maxStock,
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
      <CCol xs={12}>
        <CCard>
          <CCardHeader>Master Data Material</CCardHeader>
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
                    label="Template"
                    icon="pi pi-download"
                    severity="primary"
                    className="rounded-5 mb-2"
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
              value={filteredMaterials}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              scrollable
              globalFilter={filters.global.value} // Aplikasikan filter global di sini
            >
              <Column
                field="id"
                header="No"
                body={(data, options) => options.rowIndex + 1}
                frozen
                alignFrozen="left"
              />
              <Column
                field="materialNo"
                header="No Material"
                style={{ width: '25%' }}
                frozen
                alignFrozen="left"
              />
              <Column
                field="description"
                header="Description"
                style={{ width: '25%' }}
                frozen
                alignFrozen="left"
              />
              <Column field="uom" header="UOM" style={{ width: '25%' }} />
              <Column field="formatedPrice" header="Price" style={{ width: '25%' }} />
              <Column field="type" header="Type" style={{ width: '25%' }} />
              <Column
                header="Category"
                body={(rowData) => (rowData.Category ? rowData.Category.categoryName : '')}
                style={{ width: '25%' }}
              />
              <Column
                header="Supplier"
                body={(rowData) => (rowData.Supplier ? rowData.Supplier.supplierName : '')}
                style={{ width: '25%' }}
              />
              <Column field="minStock" header="Min Stock" style={{ width: '25%' }} />
              <Column field="maxStock" header="Max stock" style={{ width: '25%' }} />
              <Column field="formattedCreatedAt" header="Created At" style={{ width: '25%' }} />
              <Column field="formattedUpdatedAt" header="Updated At" style={{ width: '25%' }} />
              <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Material No"
              className="mb-2"
              value={currentMaterial.materialNo}
              onChange={(e) =>
                setCurrentMaterial({ ...currentMaterial, materialNo: e.target.value })
              }
            />
            <CFormInput
              label="Description"
              className="mb-2"
              value={currentMaterial.description}
              onChange={(e) =>
                setCurrentMaterial({ ...currentMaterial, description: e.target.value })
              }
            />
            <CFormInput
              label="UOM"
              className="mb-2"
              value={currentMaterial.uom}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, uom: e.target.value })}
            />
            <CFormInput
              label="Price"
              className="mb-2"
              type="number"
              value={currentMaterial.price}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, price: e.target.value })}
            />
            <label className="form-label">Supplier</label>
            <Select
              className="mb-2"
              value={selectedSupplierOption}
              onChange={handleSupplierChange}
              options={selectSupplier}
              styles={customStyles}
              placeholder="Select Supplier"
            />

            <label className="form-label">Category</label>
            <Select
              className="mb-2"
              value={selectedCategoryOption}
              onChange={handleCategoryChange}
              options={selectCategory}
              styles={customStyles}
              placeholder="Select Category"
            />
            <CFormInput
              label="Type"
              className="mb-2"
              value={currentMaterial.type}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
            />
            <CFormInput
              label="Min Stock"
              className="mb-2"
              type="number"
              value={currentMaterial.minStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, minStock: e.target.value })}
            />
            <CFormInput
              label="Max Stock"
              className="mb-2"
              type="number"
              value={currentMaterial.maxStock}
              onChange={(e) => setCurrentMaterial({ ...currentMaterial, maxStock: e.target.value })}
            />
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

export default Material
