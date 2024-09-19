import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Dropdown } from 'primereact/dropdown';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import classNames from 'classnames';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [sortField, setSortField] = useState('');

  const sortOptions = [
    { label: 'Price High to Low', value: '!price' },
    { label: 'Price Low to High', value: 'price' }
  ];

  const onSortChange = (event) => {
    const value = event.value;
    if (value.indexOf('!') === 0) {
      setSortOrder(-1);
      setSortField(value.substring(1));
      setSortKey(value);
    } else {
      setSortOrder(1);
      setSortField(value);
      setSortKey(value);
    }
  };

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

  const header = () => (
    <Dropdown
      options={sortOptions}
      value={sortKey}
      optionLabel="label"
      placeholder="Sort By Price"
      onChange={onSortChange}
      className="w-full sm:w-14rem"
    />
  );

  const itemTemplate = (product, index) => (
    <div className="col-12" key={product.id}>
      <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
        <img
          className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
          src={`https://primefaces.org/cdn/primereact/images/product/${product.Material.img}`}
          alt={product.Material.description}
        />
        <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
          <div className="flex flex-column align-items-center sm:align-items-start gap-3">
            <div className="text-2xl font-bold text-900">{product.Material.description}</div>
            <Rating value={product.Material.rating} readOnly cancel={false} />
            <div className="flex align-items-center gap-3">
              <span className="flex align-items-center gap-2">
                <i className="pi pi-tag"></i>
                <span className="font-semibold">{product.Material.category}</span>
              </span>
              <Tag value={product.Material.inventoryStatus} severity={getSeverity(product)} />
            </div>
          </div>
          <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
            <span className="text-2xl font-semibold">Rp {product.Material.price.toLocaleString('id-ID')}</span>
            <Button
              icon="pi pi-shopping-cart"
              className="p-button-rounded"
              disabled={product.inventoryStatus === 'OUTOFSTOCK'}
              onClick={() => handleAddToCart(product)} // Add function to handle add to cart
            />
          </div>
        </div>
      </div>
    </div>
  );

  const listTemplate = (items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="grid grid-nogutter">
        {items.map((product, index) => itemTemplate(product, index))}
      </div>
    );
  };

  return (
    <div className="card">
      <DataView
        value={cart}
        listTemplate={listTemplate}
        header={header()}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </div>
  );
};

export default Cart;
