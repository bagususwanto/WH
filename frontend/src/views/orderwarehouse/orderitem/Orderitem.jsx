import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { TabView, TabPanel } from 'primereact/tabview';
import { CContainer } from '@coreui/react'
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import 'primereact/resources/themes/mira/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { InputText } from 'primereact/inputtext';
import axiosInstance from '../../../utils/AxiosInstance';

const Orderitem = () => {
  const [orderitem, setOrderitem] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [first, setFirst] = useState(0); // State untuk pagination
  const [rows, setRows] = useState(10); // Jumlah baris per halaman

  const responsiveOptions = [
    { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '767px', numVisible: 2, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 }
  ];

  const getSeverity = (product) => {
    switch (product.inventoryStatus) {
      case 'INSTOCK': return 'success';
      case 'LOWSTOCK': return 'warning';
      case 'OUTOFSTOCK': return 'danger';
      default: return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderitemResponse] = await Promise.all([
          axiosInstance.get('/inventory'),
          // axiosInstance.get('/category')
        ]);
        setOrderitem(orderitemResponse.data);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

  }, []);
  const handlePageChange = (e) => {
    setFirst(e.first);
  };

  const tab1HeaderTemplate = (options) => {
    return (
     <CContainer sm>100% wide until small breakpoint
       <div className="flex flex-column align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
        <img
          src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
          alt="Tab Icon"
          className="border-round" // Tambahkan kelas styling jika diperlukan
          style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
        />
        <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
        <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
      </div>
      </CContainer>
       
    );
  };
  const tab2HeaderTemplate = (options) => {
    return (
      <CContainer sm>100% wide until small breakpoint
      <div className="flex flex-column align-items-center gap-2 p-2" style={{ cursor: 'pointer' }} onClick={options.onClick}>
       <img
         src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
         alt="Tab Icon"
         className="border-round" // Tambahkan kelas styling jika diperlukan
         style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
       />
       <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
       <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
     </div>
     </CContainer>
      
    );
  };
  const tab3HeaderTemplate = (options) => {
    return (
      <CContainer sm>100% wide until small breakpoint
       <div className="flex flex-column align-items-center gap-2 p-2" style={{ cursor: 'pointer' }} onClick={options.onClick}>
        <img
          src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
          alt="Tab Icon"
          className="border-round" // Tambahkan kelas styling jika diperlukan
          style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
        />
        <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
        <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
      </div>
      </CContainer>
       
      
    );
  };
  const tab4HeaderTemplate = (options) => {
    return (
      <CContainer sm>100% wide until small breakpoint
      <div className="flex flex-column align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
       <img
         src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
         alt="Tab Icon"
         className="border-round" // Tambahkan kelas styling jika diperlukan
         style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
       />
       <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
       <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
     </div>
     </CContainer>
      
      
    );
  };
  const tab5HeaderTemplate = (options) => {
    return (
      <CContainer sm>100% wide until small breakpoint
      <div className="flex flex-column align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
       <img
         src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
         alt="Tab Icon"
         className="border-round" // Tambahkan kelas styling jika diperlukan
         style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
       />
       <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
       <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
     </div>
     </CContainer>
      
    );
  };
  const tab6HeaderTemplate = (options) => {
    return (
      <CContainer sm>100% wide until small breakpoint
       <div className="flex flex-column align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
        <img
          src="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" // URL gambar yang ingin digunakan
          alt="Tab Icon"
          className="border-round" // Tambahkan kelas styling jika diperlukan
          style={{ width: '3rem', height: '3rem' }} // Sesuaikan ukuran gambar
        />
        <span className="font-bold " style={{ fontSize: '0.02rem' }}>Amy Elsner</span>
        <p style={{ fontSize: '0.635rem', color: '#321', margin:0 }}>OFFICE SUPP.</p> {/* Keterangan tambahan */}
      </div>
      </CContainer>
       

      
    );
  };
 

  const searchTemplate = () => (
    <div className="flex align-items-center p-2">
      <div className="p-inputgroup">
        <InputText 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
        <span className="p-inputgroup-addon">
          <i className="pi pi-search"></i>
        </span>
      </div>
    </div>
  );

  const listItem = (product, index) => (
    <div className="col-12" key={product.id}>
      <div className={`flex flex-column xl:flex-row xl:align-items-start p-4 gap-4 ${index !== 0 ? 'border-top-1 surface-border' : ''}`}>
        <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src={product.img || 'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.name} />
        <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
          <div className="flex flex-column align-items-center sm:align-items-start gap-3">
            <div className="text-2xl font-bold text-900">{product.Material.description}</div>
            <div className="flex align-items-center gap-3">
              <span className="flex align-items-center gap-2">
                <i className="pi pi-tag"></i>
                <span className="font-semibold">{product.category}</span>
              </span>
              <Tag value={product.inventoryStatus} severity={getSeverity(product)} />
            </div>
          </div>
          <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
            <span className="text-2xl font-semibold">{product.quantityActual}</span>
            <Button 
              icon="pi pi-shopping-cart" 
              label="Add to Cart" 
              className="custom-button" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const gridItem = (product) => (
    <div className="col-11 sm:col-5 lg:col-14 xl:col-3 p-2" key={product.id}>
      <div className="p-4 border-1 surface-border surface-card border-round">
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-tag"></i>
            <span className="font-semibold">{product.category}</span>
          </div>
          <Tag value={product.inventoryStatus} severity={getSeverity(product)} />
        </div>
        <div className="flex flex-column align-items-center gap-3 py-4">
          <img className="w-9 shadow-2 border-round" src={product.img || 'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.name} />
          <div className="text-0.7l font">{product.Material.description}</div>
        </div>
        <div className="flex align-items-center justify-content-between">
          <span className="text-1xl font-semibold">{product.quantityActual}</span>
          <Button 
              icon="pi pi-shopping-cart" 
              label="Add to Cart" 
              style={{ fontSize: '0.7rem' }} 
            />
        </div>
      </div>
    </div>
  );

  const itemTemplate = (product, layout, index) => {
    if (!product) return null;
    return layout === 'list' ? listItem(product, index) : gridItem(product);
  };

  const listTemplate = (products, layout) => (
    <div className="grid grid-nogutter">
      {products.map((product, index) => itemTemplate(product, layout, index))}
    </div>
  );

  const header = () => (
    <div className="flex justify-content-between">
      {searchTemplate()}
      <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
    </div>
  );

  return (
    <div className="card">
      <TabView>
        <TabPanel header="Header I" headerTemplate={tab1HeaderTemplate}>
        <DataView
          value={orderitem}
          paginator
          first={first}
          rows={rows}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          rowsPerPageOptions={[10, 25, 50]}
           onPage={handlePageChange}
          listTemplate={listTemplate}
          layout={layout}
          header={header()}
  
        />

        </TabPanel>
        <TabPanel headerTemplate={tab2HeaderTemplate} headerClassName="flex align-items-center">
          <p className="m-0">
            {/* Konten Tab 2 */}
          </p>
        </TabPanel>
        <TabPanel headerTemplate={tab3HeaderTemplate} headerClassName="flex align-items-center">
          <p className="m-0">
            {/* Konten Tab 3 */}
          </p>
        </TabPanel>
        <TabPanel headerTemplate={tab4HeaderTemplate} headerClassName="flex align-items-center">
          <p className="m-0">
            {/* Konten Tab 3 */}
          </p>
        </TabPanel>
        <TabPanel headerTemplate={tab5HeaderTemplate} headerClassName="flex align-items-center">
          <p className="m-0">
            {/* Konten Tab 3 */}
          </p>
        </TabPanel>
        <TabPanel headerTemplate={tab6HeaderTemplate} headerClassName="flex align-items-center">
          <p className="m-0">
            {/* Konten Tab 3 */}
          </p>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Orderitem;
