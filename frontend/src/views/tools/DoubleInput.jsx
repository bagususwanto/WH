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
import useMasterDataService from '../../services/MasterDataService'
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { add, format, parseISO } from 'date-fns'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Dropdown } from 'primereact/dropdown'
import { FaSyncAlt } from "react-icons/fa";
import config from '../../utils/Config'

const MySwal = withReactContent(swal)
// --- DATA DUMMY ---
const DUMMY_MATERIALS = [
  { id: 1, tanggal: '2025-07-05', materialNo: 'A-101', description: 'Bolt M8', qty: 100, costcenter: 'C01', headerText: 'Urgent Order' },
  { id: 2, tanggal: '2025-07-05', materialNo: 'A-102', description: 'Nut M8', qty: 150, costcenter: 'C01', headerText: 'Urgent Order' },
  { id: 3, tanggal: '2025-07-06', materialNo: 'B-201', description: 'Washer', qty: 500, costcenter: 'C02', headerText: 'Stock Replenish' },
  { id: 4, tanggal: '2025-07-07', materialNo: 'C-301', description: 'Screw 3in', qty: 1000, costcenter: 'C03', headerText: 'Project Alpha' },
  { id: 5, tanggal: '2025-07-06', materialNo: 'B-205', description: 'Rivet', qty: 250, costcenter: 'C02', headerText: 'Stock Replenish' },
  { id: 6, tanggal: '2025-07-06', materialNo: 'B-205', description: 'Rivet', qty: 250, costcenter: 'C02', headerText: 'Stock Replenish'},
  
]

const Material = () => {
  // --- STATE MANAGEMENT ---
  const [materials, setMaterials] = useState([])
  const [duplicateMaterials, setDuplicateMaterials] = useState([]) // State baru untuk data duplikat
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [showFilteredTable, setShowFilteredTable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingImport, setLoadingImport] = useState(false)
  const [modalUpload, setModalUpload] = useState(false)
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [uploadData, setUploadData] = useState({ importDate: date, file: null })
  
  // State untuk filter yang sebelumnya tidak terdefinisi
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  
  // State untuk kolom yang bisa disembunyikan/ditampilkan
  const [visibleColumns, setVisibleColumns] = useState([])

  // Definisi kolom untuk MultiSelect
  const columns = [
      { field: 'id', header: 'ID' },
      { field: 'qty', header: 'Quantity' },
      { field: 'costcenter', header: 'Cost Center' }
  ];

  // --- DATA LOADING & INITIALIZATION ---
  useEffect(() => {
    // Simulasi pengambilan data dari API
    setTimeout(() => {
      setMaterials(DUMMY_MATERIALS)
      setLoading(false)
    }, 1000) // 1 detik loading
  }, [])
  
  // --- HANDLERS & FUNCTIONS ---

  const handleEditMaterial = (rowData) => {
    MySwal.fire('Edit', `Editing Material: ${rowData.materialNo}`, 'info')
  }

  const handleDeleteMaterial = (materialId) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This material cannot be recovered!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulasi hapus data
        setMaterials(prev => prev.filter(m => m.id !== materialId));
        MySwal.fire('Deleted!', 'Material deleted successfully.', 'success')
      }
    })
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setFilters({ ...filters, global: { value } })
    setGlobalFilterValue(value)
  }

  // Memo untuk filter pencarian di tabel utama
  const searchFilteredMaterials = useMemo(() => {
    const globalFilter = filters.global.value ? filters.global.value.toLowerCase() : ''
    if (!globalFilter) return materials;
    
    return materials.filter((item) => {
      return Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(globalFilter)
      )
    })
  }, [materials, filters.global.value])

  const handleProcessData = () => {
    setLoadingImport(true);

    // Gunakan 'materials' (state utama) sebagai sumber data
    const counts = {};
    materials.forEach(item => {
        // TAMBAHKAN 'item.qty' ke dalam key
        const key = `${item.tanggal}|${item.headerText}|${item.qty}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    const duplicates = materials.filter(item => {
        // Gunakan key yang SAMA (termasuk qty) untuk memfilter
        const key = `${item.tanggal}|${item.headerText}|${item.qty}`;
        return counts[key] > 1;
    });

    // Set state baru untuk data duplikat
    setDuplicateMaterials(duplicates);
    setShowFilteredTable(duplicates.length > 0);

    setTimeout(() => {
        setLoadingImport(false);
    }, 500);
};
  const handleImport = () => {
    if (!uploadData.file) {
        MySwal.fire('Error', 'Please select a file to import.', 'error');
        return;
    }
    setLoadingImport(true);
    MySwal.fire('Importing', 'Your file is being processed.', 'info');
    setTimeout(() => {
        setLoadingImport(false);
        setModalUpload(false);
        MySwal.fire('Success', 'File imported successfully!', 'success');
    }, 1500);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadData((prev) => ({ ...prev, file }));
  };

  const onColumnToggle = (event) => {
    setVisibleColumns(event.value);
  };

  // --- TEMPLATES & RENDERERS ---

  const actionBodyTemplate = (rowData) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button icon="pi pi-pencil" className="p-button-success" onClick={() => handleEditMaterial(rowData)} />
      <Button icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteMaterial(rowData.id)} />
    </div>
  )
  
  const renderHeader = () => (
    <IconField iconPosition="left">
      <InputIcon className="pi pi-search" />
      <InputText
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
        placeholder="Keyword Search"
        style={{ width: '100%', borderRadius: '5px' }}
      />
    </IconField>
  )
  
  const headerForColumnSelect = () => (
    <div className="d-flex justify-content-between align-items-center">
        {renderHeader()}
        <MultiSelect
            value={visibleColumns}
            options={columns}
            optionLabel="header"
            onChange={onColumnToggle}
            className="w-full sm:w-20rem"
            display="chip"
            placeholder="Show Columns"
            style={{ borderRadius: '5px' }}
        />
    </div>
  );
  
  const filteredHeader = <h5 className="m-0">Filtered Duplicate Entries</h5>;

  const LoadingComponent = () => (
    <div className="text-center p-4">
      <CSpinner color="primary" />
      <p className="mt-2">Loading GI Data...</p>
    </div>
  )
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

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>Master Data Material</CCardHeader>
          <CCardBody>
            {loading ? (
              <LoadingComponent />
            ) : (
              <>
                <Button
                  type="button"
                  label="Upload Data"
                  icon="pi pi-file-import"
                  severity="primary"
                  className="mb-3 rounded-5"
                  onClick={() => setModalUpload(true)}
                  data-pr-tooltip="XLS"
                />
                
                {/* --- TABEL UTAMA --- */}
                <DataTable
                  value={searchFilteredMaterials} // Gunakan hasil search
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
                    <Column header="No" body={(data, options) => options.rowIndex + 1} frozen alignFrozen="left" />
                    <Column field="tanggal" header="Tanggal" sortable frozen alignFrozen="left" />
                    <Column field="materialNo" header="Material No" sortable frozen alignFrozen="left" />
                    <Column field="description" header="Description" sortable />
                    <Column field="qty" header="Qty" sortable />
                    <Column field="costcenter" header="Cost Center" sortable />
                    <Column field="headerText" header="Header Text" sortable />
                  {/* Mapping untuk kolom dinamis */}
                  {visibleColumns.map((col) => (
                    <Column key={col.field} field={col.field} header={col.header} sortable />
                  ))}
                  <Column header="Action" body={actionBodyTemplate} frozen alignFrozen="right" />
                </DataTable>
                
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    onClick={handleProcessData}
                    className='rounded-5'
                    type="button"
                    disabled={loadingImport}
                  >
                    {loadingImport ? (
                      <><CSpinner component="span" size="sm" variant="grow" className="me-2" />Processing...</>
                    ) : (
                      <div className='d-flex align-items-center gap-2'><FaSyncAlt /><span>Process Duplicates</span></div>
                    )}
                  </Button>
                </div>
                
                {/* --- TABEL DUPLIKAT (KONDISIONAL) --- */}
                {showFilteredTable && (
                  <div className="mt-4">
                    <DataTable
                      value={duplicateMaterials} // Gunakan state duplikat
                      paginator
                      rows={5}
                      tableStyle={{ minWidth: '30rem' }}
                      className="p-datatable-gridlines p-datatable-sm text-nowrap"
                      header={filteredHeader}
                    >
                      <Column header="No" body={(data, options) => options.rowIndex + 1} />
                      <Column field="tanggal" header="Tanggal" sortable />
                      <Column field="materialNo" header="Material No" sortable />
                      <Column field="description" header="Description" sortable />
                      <Column field="qty" header="Qty" sortable />
                      <Column field="costcenter" header="Cost Center" sortable />
                      <Column field="headerText" header="Header Text" sortable />
                    </DataTable>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* --- MODAL UPLOAD --- */}
      <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
        <CModalHeader><CModalTitle>Upload Material Data</CModalTitle></CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Date</CFormLabel>
            <Flatpickr
              value={date}
              options={{ dateFormat: 'Y-m-d', maxDate: new Date() }}
              className="form-control"
              onChange={(selectedDates) => setDate(selectedDates[0])}
            />
          </div>
          <div className="mb-3">
            <CFormInput
              onChange={handleFileChange}
              type="file"
              label="Excel File"
              accept=".xlsx, .xls, .csv"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <Button label="Cancel" severity="secondary" onClick={() => setModalUpload(false)} />
          <Button onClick={handleImport} disabled={loadingImport}>
            {loadingImport ? <><CSpinner size="sm" className="me-2" />Importing...</> : 'Import'}
          </Button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Material
