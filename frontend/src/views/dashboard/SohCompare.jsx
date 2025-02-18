import React, { useState, useEffect, Suspense } from 'react'
import 
{ CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CFormTextarea,
  CCardTitle,
  CSpinner,
  CFormInput,
  CButton,
  CModal,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel ,
  CModalHeader } from '@coreui/react'
import { cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { FilterMatchMode } from 'primereact/api'
import '../../scss/_tabels.scss'
import 'primeicons/primeicons.css'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { format, parseISO } from 'date-fns'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import Swal from 'sweetalert2'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import withReactContent from 'sweetalert2-react-content'
import { MultiSelect } from 'primereact/multiselect'
import useManageStockService from '../../services/ManageStockService'
import useMasterDataService from '../../services/MasterDataService'
import {

 
} from '@coreui/react'

const MySwal = withReactContent(Swal)

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [plant, setPlant] = useState([])
  const [shop, setShop] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [storage, setStorage] = useState([])
  const [modalUpload, setModalUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visibleData, setVisibleData] = useState([]) // Data yang terlihat di tabel
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [loadingImport, setLoadingImport] = useState(false)
  const [plantId, setPlantId] = useState()
  const [storageId, setStorageId] = useState()
  const [typeId, setTypeId] = useState()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [typeMaterial, setTypeMaterial] = useState()
  const [remarks, setRemarks] = useState('') // State to store remarks entered in CModal
  const { getInventory, updateInventoryById, executeInventory } = useManageStockService()
  const { getMasterData, getMasterDataById } = useMasterDataService()
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

 

  const apiTypeMaterial = 'material-type'
  const apiPlant = 'plant'
  const apiStorage = 'storage'


  useEffect(() => {
    getPlant();
    getStorageByPlantId() // Fetch plant and storage
    getTypeMaterial(); // Fetching type material on component mount
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      fetchInventory();
      setShouldFetch(false);
    }
  }, [shouldFetch]);


  const fetchInventory = async () => {
    setLoading(true);
  
    // Menentukan nilai default jika plantId atau storageId kosong
    const selectedPlantId = plantId || "";
    const selectedStorageId = storageId || "";
    const selectedTypeId = "direct"; // Biarkan kosong jika tidak dipilih
  
    console.log("Fetching inventory with:", { 
      plantId: selectedPlantId, 
      storageId: selectedStorageId, 
      type: selectedTypeId 
    });
  
    try {
      const response = await getInventory(selectedPlantId, selectedStorageId, selectedTypeId);
      
      if (response?.data) {
        console.log("Fetched Inventory Data:", response.data);
        setInventory(response.data);
        setVisibleData(response.data); // Set data yang terlihat di tabel
      } else {
        console.warn("No data received from API.");
        setInventory([]);
        setVisibleData([]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeMaterial = async () => {
    try {
      const response = await getMasterData(apiTypeMaterial);
      console.log("API Response for Type Material:", response.data); // Debugging

      const typeMaterialOptions = response.data.map((tm) => ({
        label: tm.type,
        value: tm.type,
        id: tm.id,
      }));
      setTypeMaterial(typeMaterialOptions);
    } catch (error) {
      console.error('Error fetching type material:', error);
    }
  };

  const getPlant = async () => {
    try {
      const response = await getMasterData(apiPlant)
      const plantOptions = response.data.map((plant) => ({
        label: plant.plantName,
        value: plant.plantName,
        id: plant.id,
      }))
      setPlant(plantOptions)
    } catch (error) {
      console.error('Error fetching plant:', error)
    }
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

  const LoadingComponent = () => (
    <div className="text-center">
      <CSpinner color="primary" />
      <p>Loading inventory data...</p>
    </div>
  )

   const exportExcel = () => {
      import('xlsx').then((xlsx) => {
        // Mapping data untuk ekspor
        const mappedData = visibleData.map((item) => {
          const { quantityActualCheck, Material } = item
          const minStock = Material?.minStock
          const maxStock = Material?.maxStock
  
          let evaluation
          if (quantityActualCheck < minStock) {
            evaluation = 'minim'
          } else if (quantityActualCheck > maxStock) {
            evaluation = 'over'
          } else {
            evaluation = 'ok'
          }
  
          return {
            'Material No': Material.materialNo,
            Description: Material.description,
            Address: item.Address_Rack.addressRackName,
            Type: Material.type,
            UoM: Material.uom,
            Stock: quantityActualCheck,
            'SOH': 'soH',
            'DIFF': 'diff',
            'Status': '',
            Storage: item.Address_Rack.Storage.storageName,
            Plant: item.Address_Rack.Storage.Plant.plantName,
            'Update At': item.lastUpdate
              ? format(parseISO(item.lastUpdate), 'yyyy-MM-dd HH:mm:ss')
              : '', // Kosongkan jika lastUpdate tidak valid
          }
        })
  
        // Timestamp download untuk baris atas
        const downloadTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        const downloadAtRow = [
          {
            'Material No': `downloadAt: ${downloadTimestamp}`,
            Description: '',
            Address: '',
            Type: '',
            UoM: '',
            Stock: '',
            'SOH': '',
            'DIFF': '',
            Status: '',
            Storage: '',
            Plant: '',
            'Update At': '',
          },
        ]
  
        // Header data utama
        const headerRow = [
          {
            'Material No': 'Material No',
            Description: 'Description',
            Address: 'Address',
            Type: 'Type',
            UoM: 'UoM',
            Stock: 'Stock',
            'SOH': 'SoH',
            'DIFF': 'Diff',
            Status: 'Status',
            Storage: 'Storage',
            Plant: 'Plant',
            'Update At': 'Update At',
          },
        ]
  
        // Gabungkan baris downloadAt, header utama, dan data
        const finalData = [...downloadAtRow, ...headerRow, ...mappedData]
  
        // Mengkonversi data ke worksheet tanpa menambahkan header otomatis
        const worksheet = xlsx.utils.json_to_sheet(finalData, { skipHeader: true })
  
        // Auto-width untuk kolom
        const colWidth = finalData.reduce((acc, row) => {
          Object.keys(row).forEach((key) => {
            const cellValue = row[key] ? row[key].toString() : ''
            const currentWidth = acc[key] || 0
            acc[key] = Math.max(currentWidth, cellValue.length)
          })
          return acc
        }, {})
  
        // Menetapkan lebar kolom ke worksheet
        worksheet['!cols'] = Object.keys(colWidth).map((key) => ({
          wch: colWidth[key] + 2, // Menambahkan padding ekstra untuk kolom
        }))
  
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
  
          // Format tanggal menjadi yyyyMMddHHmmss
          const formattedDate = format(new Date(), 'yyyyMMddHHmmss')
  
          // Membuat blob data untuk file
          const data = new Blob([buffer], {
            type: EXCEL_TYPE,
          })
  
          // Menyimpan file dengan nama yang mengandung tanggal terformat
          module.default.saveAs(data, `${fileName}_export_${formattedDate}${EXCEL_EXTENSION}`)
        }
      })
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
      );
    };

      const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
          ...prevFilters,
          global: { value, matchMode: FilterMatchMode.CONTAINS },
        }));
        setGlobalFilterValue(value);
      };
      

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
        const handleFileChange = (e) => {
          const file = e.target.files[0]
          setUploadData((prevData) => ({
            ...prevData,
            file: file,
          }))
        }
        const sohEditor = (options) => {
          return (
            <input
              type="number"
              value={options.value ?? options.rowData.quantityActualCheck}
              onChange={(e) => options.editorCallback(Number(e.target.value))}
              style={{ width: "80px", padding: "3px", textAlign: "center", fontSize: "14px" }}
            />
          );
        };
        
        // Fungsi untuk menangani perubahan data setelah diedit
        const onCellEditComplete = (e) => {
          let { rowData, newValue, field } = e;
          let updatedInventory = [...inventory];
        
          let index = updatedInventory.findIndex((item) => item.id === rowData.id);
          if (index !== -1) {
            updatedInventory[index][field] = newValue;
            setInventory(updatedInventory);
          }
        };
        
        // Template tampilan SoH dengan ikon edit
        const sohBodyTemplate = (rowData) => {
          return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%" }}>
              <span>{rowData.soH ?? rowData.quantityActualCheck}</span>
              <i className="pi pi-pencil" style={{ cursor: "pointer", fontSize: "14px", color: "#007bff" }} 
              onClick={() => options.editorCallback(rowData.soH ?? rowData.quantityActualCheck)}></i>
            </div>
          );
        };
        
        // Hitung Diff (Act - SoH)
        const calculateDiff = (rowData) => {
          if (rowData.quantityActualCheck == null) return "-"; // Jika ACT kosong, diff "-"
          return rowData.quantityActualCheck - (rowData.soH ?? rowData.quantityActualCheck);
        };

        const statusBodyTemplate = (rowData) => {
          const { quantityActualCheck, quantitySoH, Material } = rowData;

          if (quantityActualCheck == null) {
            return <label>-</label>  
          }
          const minStock = Material?.minStock || 0;
          const maxStock = Material?.maxStock || 0;
        
          const diff = calculateDiff(rowData);
        
          if (diff > 0) return <Tag value="Lakukan Konfirmasi Ke Tim Receiving" severity={getSeverity("over")} />;
          if (diff < 0) return <Tag value="Segera Input Good Issue" severity={getSeverity("minim")} />;
          return <Tag value="Lakukan Konfirmasi Ke Tim Receiving" severity="warning" />;
        };
          const getSeverity = (status) => {
            switch (status) {
              case 'minim':
                return 'danger'
              case 'over':
                return 'warning'
            }
          }
          const centeredHeader = (title) => <div style={{ textAlign: "center", width: "100%" }}>{title}</div>;


  return (
    <CRow>
      <CCol>
         <CCard className="mb-3">
                  <CCardHeader>Filter</CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol xs={12} sm={6} md={4}>
                        <Dropdown
                          value={filters['Address_Rack.Storage.Plant.plantName'].value}
                          options={plant}
                          onChange={handlePlantChange}
                          placeholder="Select Plant"
                          className="p-column-filter mb-2"
                          showClear
                          style={{ width: '100%', borderRadius: '5px' }}
                          id={filters['Address_Rack.Storage.Plant.id']?.value}
                        />
                      </CCol>
                      <CCol xs={12} sm={6} md={4}>
                        <Dropdown
                          value={filters['Address_Rack.Storage.storageName'].value}
                          options={storage}
                          onChange={handleStorageChange}
                          placeholder="Select Storage"
                          className="p-column-filter mb-2"
                          showClear
                          style={{ width: '100%', borderRadius: '5px' }}
                        />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
        <CCard className="mb-3">
          <CCardHeader>
          <CButton color="transparent" onClick={fetchInventory} className="p-0">
            Actual x SoH
            </CButton>
            </CCardHeader>
          <CCardBody>
          {loading ? (
              <LoadingComponent /> // Render loading component when loading is true
            ) : (
              <>
               
            <CRow>
            <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
            <div className="d-flex flex-wrap justify-content-start">
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
                </div>
                </CCol>
                <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
                </CCol>
        
                </CRow>
                <CRow>

                <DataTable
                  value={inventory}
                  filters={filters} // 🔍 Filter untuk pencarian global
                  globalFilterFields={["Material.materialNo", "Material.description"]} // 🎯 Pencarian berdasarkan Material No & Description
                  tableStyle={{ minWidth: "50rem" }}
                  className="p-datatable-gridlines text-nowrap custom-table"
                  paginator
                  rowsPerPageOptions={[12, 50, 100, 500]}
                  rows={12}
                  dataKey="id"
                  emptyMessage="No inventory found."
                  size="small"
                  scrollable
                  removableSort
                  editMode="cell" 
                  onCellEditComplete={onCellEditComplete} 
                >
                  <Column
                    field="Material.materialNo"
                    header={centeredHeader("Material")}
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column
                    field="Material.description"
                    header="Description"
                    frozen
                    alignFrozen="left"
                    sortable
                  />
                  <Column field="Address_Rack.addressRackName" header="Address" sortable />
                  <Column field="Material.uom" header="UoM" sortable />
                  <Column field="quantityActualCheck" header="Act" sortable />
                  <Column
                    field="soH"
                    header="SoH"
                    editor={(options) => sohEditor(options)}
                    body={(rowData) => sohBodyTemplate(rowData)}
                    sortable
                  />
                  <Column
                    field="diff"
                    header="Diff"
                    body={(rowData) => calculateDiff(rowData)}
                    sortable
                  />
                  <Column
                    field="status"
                    header="Status"
                    body={statusBodyTemplate}
                    bodyStyle={{ textAlign: "center" }}
                    sortable
                  />
                </DataTable>
                </CRow>
              </>
            )}
          </CCardBody>
            <CModal visible={modalUpload} onClose={() => setModalUpload(false)}>
              <CModalHeader>
                <CModalTitle id="LiveDemoExampleLabel">Upload Master SoH By IWMS</CModalTitle>
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
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Inventory
