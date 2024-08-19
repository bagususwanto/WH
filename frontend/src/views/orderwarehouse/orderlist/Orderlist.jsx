import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Rating } from 'primereact/rating';
import { classNames } from 'primereact/utils';
import 'primereact/resources/themes/mira/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { InputText } from 'primereact/inputtext';
import axiosInstance from '../../../utils/AxiosInstance';

const Orderlist = () => {
  const [Orderlist, setOrderlist] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  const getSeverity = (product) => {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return null;
    }
  };

  useEffect(() => {
    getOrderlist();
    getCategories();
  }, []);

  const getOrderlist = async () => {
    try {
      const response = await axiosInstance.get('/supplier');
      setOrderlist(response.data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
    }
  };

  const getCategories = async () => {
    try {
      const response = await axiosInstance.get('/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const categoryTemplate = (category) => {
    return (
      <div className="border-1 surface-border border-round m-2 text-center py-5 px-3">
        <div className="mb-3">
          <img src={`https://fthmb.tqn.com/5X-Mb_wzrmW542SNSe9THfzz52k=/3867x2578/filters:fill(auto,1)/chemistry-glassware-56a12a083df78cf772680235.jpg`} alt={category.categoryName} className="w-6 shadow-2" />
        </div>
        <div>
          <h4 className="mb-1">{category.categoryName}</h4>
        </div>
      </div>
    );
  };

  const listItem = (product, index) => {
    return (
      <div className="col-12" key={product.id}>
        <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
          <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src={product.imageUrl || 'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.name} />
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900">{product.name}</div>
              <Rating value={product.rating} readOnly cancel={false}></Rating>
              <div className="flex align-items-center gap-3">
                <span className="flex align-items-center gap-2">
                  <i className="pi pi-tag"></i>
                  <span className="font-semibold">{product.category}</span>
                </span>
                <Tag value={product.inventoryStatus} severity={getSeverity(product)}></Tag>
              </div>
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <span className="text-2xl font-semibold">${product.price}</span>
              <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={product.inventoryStatus === 'OUTOFSTOCK'}></Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (product) => {
    return (
      <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={product.id}>
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-tag"></i>
              <span className="font-semibold">{product.category}</span>
            </div>
            <Tag value={product.inventoryStatus} severity={getSeverity(product)}></Tag>
          </div>
          <div className="flex flex-column align-items-center gap-3 py-5">
            <img className="w-9 shadow-2 border-round" src={product.imageUrl || 'https://cf.shopee.co.id/file/6fe06991e71fe2f51ca77eb729b92e11'} alt={product.name} />
            <div className="text-2xl font-bold">{product.name}</div>
            <Rating value={product.rating} readOnly cancel={false}></Rating>
          </div>
          <div className="flex align-items-center justify-content-between">
            <span className="text-2xl font-semibold">${product.price}</span>
            <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={product.inventoryStatus === 'OUTOFSTOCK'}></Button>
          </div>
        </div>
      </div>
    );
  };

  const itemTemplate = (product, layout, index) => {
    if (!product) {
      return;
    }
    if (layout === 'list') return listItem(product, index);
    else if (layout === 'grid') return gridItem(product);
  };

  const listTemplate = (products, layout) => {
    return <div className="grid grid-nogutter">{products.map((product, index) => itemTemplate(product, layout, index))}</div>;
  };

  const searchTemplate = () => {
    return (
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
  };

  const header = () => {
    return (
      <div className="flex justify-content-between">
        {searchTemplate()}
        <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
      </div>
    );
  };

  const filteredOrderlist = Orderlist.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <Carousel value={categories} numScroll={1} numVisible={3} responsiveOptions={responsiveOptions} itemTemplate={categoryTemplate} />
      <DataView value={filteredOrderlist} listTemplate={listTemplate} layout={layout} header={header()} />
    </div>
  );
};

export default Orderlist;
