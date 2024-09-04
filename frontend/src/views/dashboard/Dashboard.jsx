import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CCol, CRow } from '@coreui/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/nano/theme.css';
import 'primereact/resources/primereact.min.css';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { BarChart } from '@mui/x-charts/BarChart';
import useManageStockService from '../../services/ManageStockService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Tag } from 'primereact/tag';
import { Box } from '@mui/material';

const MySwal = withReactContent(Swal);

// Translation object
const translations = {
 
};

// Function to add labels
export function tambahLabel(series) {
  return series.map(item => ({
    ...item,
    label: translations[item.dataKey],
    valueFormatter: v => (v ? ` ${v.toLocaleString()}` : '-'),
  }));
}

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const { getInventory } = useManageStockService(); // Service
  const [inventories, setInventories] = useState([]); // Inventory data

  useEffect(() => {
    fetchInventory();
    setLoading(false);
  }, []);

  const getInventories = async () => {
    try {
      const response = await getInventory();
      setInventories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getSeverity = (status) => {
    switch (status) {
      case 'shortage':
        return 'danger';
      case 'ok':
        return 'success';
      case 'over':
        return 'warning';
      default:
        return 'default';
    }
  };

  const statusBodyTemplate = (rowData) => {
    const { quantityActualCheck, Material } = rowData;
    const minStock = Material?.minStock;
    const maxStock = Material?.maxStock;

    if (quantityActualCheck < minStock)
      return <Tag value="shortage" severity={getSeverity('shortage')} />;
    if (quantityActualCheck > maxStock)
      return <Tag value="over" severity={getSeverity('over')} />;
    return <Tag value="ok" severity={getSeverity('ok')} />;
  };

  const fetchInventory = async () => {
    try {
      const response = await getInventory();
      const dataWithFormattedFields = response.data.map((item) => {
        const evaluation =
          item.quantityActual < item.Material.minStock
            ? 'shortage'
            : item.quantityActual > item.Material.maxStock
              ? 'over'
              : 'ok';

        const stockDifference = item.quantityActual - item.Material.minStock; // Selisih antara quantityActual dan maxStock

        return {
          ...item,
          evaluation,
          stockDifference, // Tambahkan stockDifference
        };    
      })  

      .filter(item => {
        // Pastikan semua nilai yang digunakan valid dan tidak kosong
        return (
          item.quantityActual != null &&
          item.Material.maxStock != null &&
          item.quantityActual !== '' &&
          item.Material.maxStock !== ''
        );
      });

      // Set data berdasarkan penilaian
      setInventories({
        critical: dataWithFormattedFields.filter(item => item.evaluation === 'shortage'),
        lowest: dataWithFormattedFields.filter(item => item.evaluation === 'shortage'),
        overflow: dataWithFormattedFields.filter(item => item.evaluation === 'over')
      });
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch inventory data.',
      });
      console.error('Error fetching inventory:', error);
    }
  };

  const prepareBarChartData = (data, type) => {
    // Ambil hanya 10 item pertama
    const limitedData = data.slice(0, 10);
  
    // Siapkan data dengan field yang diperbarui berdasarkan jenis kategori
    return limitedData.map(item => ({
      MaterialNo: item.Material.materialNo,
      quantityActual: item.quantityActual,
      description: item.Material.description,
      maxStock: item.Material.maxStock,
      stockDifference: type === 'overflow'
        ? item.quantityActual - item.Material.maxStock  // Untuk overflow, actual - maxStock
        : item.Material.minStock - item.quantityActual, // Untuk critical dan lowest, maxStock - actual
    }));
  };
  

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Critical</CCardHeader>
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
            <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 'auto',
                  marginBottom: '0.5rem', // Jarak antara grafik dan tabel
                }}
              >
                <BarChart
                  dataset={prepareBarChartData(inventories.critical || [])}
                  series={tambahLabel([
                    { dataKey: 'quantityActual', stack: 'Stock Difference', color: 'blue' },
                    { dataKey: 'stockDifference', stack: 'Stock Difference', color: 'red' },
                  ])}
                  xAxis={[{ scaleType: 'band', dataKey: 'description' }]}  
                  slotProps={{ legend: { hidden: true } }}
                  width={1400}
                  height={400}
                />
              </Box>
            </ThemeProvider>
            <DataTable
              value={inventories.critical || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column
                field="quantityActual"
                header="Stok Inv."
                style={{ width: '5%' }}
                sortable
              />
              
              <Column
                field="evaluation"
                header="Penilaian"
                body={statusBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              />
            </DataTable>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Lowest</CCardHeader>
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <BarChart
                 dataset={prepareBarChartData(inventories.critical || [])}
                 series={tambahLabel([
                   { dataKey: 'quantityActual', stack: 'Stock Difference', color: 'blue' },
                   { dataKey: 'stockDifference', stack: 'Stock Difference', color: 'red' },
 
                 ])}
                 xAxis={[{ scaleType: 'band', dataKey: 'description' }]}
                 slotProps={{ legend: { hidden: true } }}
                 width={2100}
                 height={400}
               />
              </Box>
            </ThemeProvider>
            <DataTable
              value={inventories.lowest || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column
                field="quantityActual"
                header="Stok Inv."
                style={{ width: '5%' }}
                sortable
              />
              <Column
                field="quantityActualCheck"
                header="SoH"
                sortable
              />
              <Column
                field="stockDifference" // Kolom baru untuk selisih stock
                header="Selisih Max Stock"
                body={(rowData) => rowData.stockDifference.toLocaleString()} // Format sebagai angka
                sortable
              />
              <Column
                field="evaluation"
                header="Penilaian"
                body={statusBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              />
            </DataTable>
          </CCardBody>
        </CCard>
        <CCard className="mb-3">
          <CCardHeader>Overflow</CCardHeader>
          <CCardBody>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <BarChart
                dataset={prepareBarChartData(inventories.overflow || [], 'overflow')}
                series={tambahLabel([
                  { dataKey: 'maxStock', stack: 'Stock Levels', color: 'blue' },
                  { dataKey: 'stockDifference', stack: 'Stock Levels', color: 'red' },
                ])}
                xAxis={[{ scaleType: 'band', dataKey: 'description' }]}
                slotProps={{ legend: { hidden: true } }}
                width={2000}
                height={400}
              />

              </Box>
            </ThemeProvider>
            <DataTable
              value={inventories.overflow || []}
              tableStyle={{ minWidth: '30rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="Tidak ada data inventaris."
              size="small"
              scrollable
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column
                field="Material.description"
                header="Deskripsi"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Alamat" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column
                field="quantityActual"
                header="Stok Inv."
                style={{ width: '5%' }}
                sortable
              />
              <Column
                field="quantityActualCheck"
                header="SoH"
                sortable
              />
              <Column
                field="stockDifference" // Kolom baru untuk selisih stock
                header="Selisih Max Stock"
                body={(rowData) => rowData.stockDifference.toLocaleString()} // Format sebagai angka
                sortable
              />
              <Column
                field="evaluation"
                header="Penilaian"
                body={statusBodyTemplate}
                bodyStyle={{ textAlign: 'center' }}
                sortable
              />
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Dashboard;
