import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Rating } from 'primereact/rating';
import { classNames } from 'primereact/utils';
import { TabView, TabPanel } from 'primereact/tabview';
import { SplitButton } from 'primereact/splitbutton';
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
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

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
        const [orderitemResponse, categoriesResponse] = await Promise.all([
          axiosInstance.get('/inventory'),
          // axiosInstance.get('/category')
        ]);
        setOrderitem(orderitemResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


//header tab View
  const tab1HeaderTemplate = (options) => {
    return (
        <div className="flex align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
            <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />
            <span className="font-bold white-space-nowrap">Amy Elsner</span>
        </div>
    );
};

const tab2HeaderTemplate = (options) => {
    return (
        <div className="flex align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
            <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png" shape="circle" />
            <span className="font-bold white-space-nowrap">Onyama Limba</span>
        </div>
    )
};

const tab3HeaderTemplate = (options) => {
    return (
        <div className="flex align-items-center gap-2 p-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
            <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/ionibowcher.png" shape="circle" />
            <span className="font-bold white-space-nowrap">Ioni Bowcher</span>
            <Badge value="2" />
        </div>
    )
};
//search
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
//Evaluation


  const listItem = (product, index) => (
    <div className="col-12" key={product.id}>
      <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
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
            <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={product.inventoryStatus === 'OUTOFSTOCK'} />
          </div>
        </div>
      </div>
    </div>
  );

  const gridItem = (product) => (
    <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={product.id}>
      <div className="p-4 border-1 surface-border surface-card border-round">
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-tag"></i>
            <span className="font-semibold">{product.category}</span>
          </div>
          <Tag value={product.inventoryStatus} severity={getSeverity(product)} />
        </div>
        <div className="flex flex-column align-items-center gap-3 py-5">
          <img className="w-9 shadow-2 border-round" src={product.img || 'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.name} />
          <div className="text-2xl font-bold">{product.Material.description}</div>
         
        </div>
        <div className="flex align-items-center justify-content-between">
          <span className="text-2xl font-semibold">{product.quantityActual}</span>
          <Button icon="pi pi-shopping-cart" label="Add to Cart" disabled={data.inventoryStatus === 'OUTOFSTOCK'}></Button>
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
            <p className="m-0">
 
    
              <DataView value={orderitem} listTemplate={listTemplate} layout={layout} header={header()} />
            </p>
        </TabPanel>
        <TabPanel headerTemplate={tab2HeaderTemplate} headerClassName="flex align-items-center">
            <p className="m-0">
                
            </p>
        </TabPanel>
        <TabPanel headerTemplate={tab3HeaderTemplate} headerClassName="flex align-items-center">
        <p className="m-0">
              
            </p>
        </TabPanel>
    </TabView>
</div>

    
      
  );
};

export default Orderitem;
