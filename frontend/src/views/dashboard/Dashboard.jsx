import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CCol, CRow } from '@coreui/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CascadeSelect } from 'primereact/cascadeselect';
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
  totAss: 'Total Aset',
  currAss: 'Aset Lancar',
  nCurrAss: 'Aset Tidak Lancar',
  totLia: 'Total Kewajiban',
  curLia: 'Kewajiban Lancar',
  nCurLia: 'Kewajiban Tidak Lancar',
  totEq: 'Total Ekuitas',
  capStock: 'Saham Modal',
  retEarn: 'Laba Ditahan',
  treas: 'Kas',
  nonAffect: 'Tidak Terpengaruh',
};

// Function to add labels
export function tambahLabel(series) {
  return series.map(item => ({
    ...item,
    label: translations[item.dataKey],
    valueFormatter: v => (v ? `Rp ${v.toLocaleString()}k` : '-'),
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
  const [selectedCity, setSelectedCity] = useState(null);

  
  useEffect(() => {
    getInventories();
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
            : item.quantityActual > item.Material.minStock
              ? 'over'
              : 'ok';

        const discrepancy = item.quantityActual - item.quantitySistem;

        return {
          ...item,
          discrepancy,
          evaluation,
        };
      });
      setInventories(dataWithFormattedFields);
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch inventory data.',
      });
      console.error('Error fetching inventory:', error);
    }
  };

  // Prepare data for BarChart
  const prepareBarChartData = () => {
    return inventories.map(item => ({
      MaterialNo: item.Material.materialNo,
      quantityActual: item.quantityActual,
      minStock: item.Material.minStock,
      maxStock: item.Material.maxStock
    }));
  };

  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Dashboard</CCardHeader>
          <CCardBody>
          <div className="card flex justify-content-center">
            <CascadeSelect value={evaluation} onChange={e => setSelected(e.value)} options={countries} 
                optionLabel="cname" optionGroupLabel="name" optionGroupChildren={['states', 'cities']} 
                className="w-full md:w-14rem" breakpoint="767px" placeholder="Select a City" itemTemplate={countryOptionTemplate} style={{ minWidth: '14rem' }} />
        </div>
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
                  dataset={prepareBarChartData()}
                  series={tambahLabel([
                    { dataKey: 'minStock', stack: 'Min-Max' },
                    { dataKey: 'maxStock', stack: 'Min-Max' },
                    { dataKey: 'quantityActual', stack: 'Stock Inventory' },
                  ])}
                  xAxis={[{ scaleType: 'band', dataKey: 'MaterialNo' }]}
                  slotProps={{ legend: { hidden: true } }}
                  width={2000}
                  height= {300}
                />
              </Box>
            </ThemeProvider>
            <DataTable
              value={inventories}
              tableStyle={{ minWidth: '50rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              loading={loading}
              emptyMessage="No inventory found."
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
                header="Description"
                frozen={true}
                alignFrozen="left"
                sortable
              />
              <Column field="Address_Rack.addressRackName" header="Address" sortable />
              <Column field="Material.uom" header="UoM" sortable />
              <Column field="Material.minStock" header="Min" sortable />
              <Column field="Material.maxStock" header="Max" sortable />
              <Column
                field="quantityActual"
                header="Stock Inv."
                style={{ width: '5%' }}
                sortable
              />
              <Column
                field="quantityActualCheck"
                header="SoH"
                sortable
              />
              <Column
                field="evaluation"
                header="Eval."
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
