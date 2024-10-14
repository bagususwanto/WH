import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardImage,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CBadge,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CImage,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCart, cilClipboard, cilHeart } from '@coreui/icons';
import useManageStockService from '../../services/ManageStockService';
import useMasterDataService from '../../services/MasterDataService';

const Wishlist = () => {
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const { getInventory } = useManageStockService();
  const { getMasterData } = useMasterDataService();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOrder, setModalOrder] = useState(false);
  const [allVisible, setAllVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());

  const apiCategory = 'category';
  const navigate = useNavigate();

  const getProducts = async () => {
    const response = await getInventory();
    setProductsData(response.data);
  };

  const getCategories = async () => {
    const response = await getMasterData(apiCategory);
    setCategoriesData(response.data);
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  const calculateStockStatus = (product) => {
    const { quantityActualCheck } = product;
    const { minStock, maxStock } = product.Material;
    if (quantityActualCheck == null) return 'Out of Stock';
    if (quantityActualCheck > maxStock) return 'In Stock';
    if (quantityActualCheck <= minStock) return 'Low Stock';
    return 'Out of Stock';
  };

  const filteredProducts = productsData.filter((product) =>
    product.Material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleWishlist = (productId) => {
    const updatedWishlist = new Set(wishlist);
    updatedWishlist.has(productId) ? updatedWishlist.delete(productId) : updatedWishlist.add(productId);
    setWishlist(updatedWishlist);
  };

  const isInWishlist = (productId) => wishlist.has(productId);

  const handleModalCart = (product) => {
    setSelectedProduct(product);
    setModalOrder(true);
  };

  const handleCloseModalOrder = () => {
    setModalOrder(false);
    setQuantity(1);
  };

  const handleAddToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.id === product.Material.id);
    if (existingProduct) {
      const updatedCart = cart.map((item) =>
        item.id === product.Material.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setCartCount(cartCount + quantity);
    setModalOrder(false);
    navigate('/cart'); // Navigate to the cart page
  };

  return (
    <>
     
     <CRow>
  {filteredProducts.slice(0, allVisible ? filteredProducts.length : 10).map((product) => (
    <CCol xs="6" sm="6" md="3" lg="3" xl="2" key={product.Material.id} className="mb-4">
      <CCard className="h-100">
        <CCardImage
          orientation="top"
          src={product.Material.img || 'https://via.placeholder.com/150'}
          alt={product.Material.description}
          style={{ height: '150px', objectFit: 'cover' }}
        />
        <CCardBody className="d-flex flex-column justify-content-between">
          <div>
            <CCardTitle style={{ fontSize: '14px' }}>{product.Material.description}</CCardTitle>
            <CCardTitle style={{ fontSize: '12px' }}>
              Rp {product.Material.price.toLocaleString('id-ID')}
            </CCardTitle>
          </div>
          <CRow className="mt-auto align-items-center">
            <CCol sm="auto" className="mb-2">
              <CBadge color={calculateStockStatus(product) === 'Out of Stock' ? 'primary' : ''}>
                {calculateStockStatus(product)}
              </CBadge>
            </CCol>

            {calculateStockStatus(product) !== 'Out of Stock' && (
              <CCol sm="auto" className="ms-2">
                <CButton className="box" color="primary" onClick={() => handleModalCart(product)}>
                  + Add Cart
                </CButton>
              </CCol>
            )}

            <CCol sm="auto" className="ms-2">
              <CButton
                className="box"
                color="secondary"
                onClick={() => handleToggleWishlist(product.Material.id)}
                style={{
                  backgroundColor: isInWishlist(product.Material.id) ? 'red' : 'white',
                  border: '1px solid white',
                  color: isInWishlist(product.Material.id) ? 'white' : 'black',
                  borderRadius: '50%',
                }}
              >
                <CIcon
                  icon={cilHeart}
                  className={isInWishlist(product.Material.id) ? '' : 'border border-secondary rounded-circle'}
                  style={{ fontSize: '1.5rem' }}
                />
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  ))}
</CRow>

      {!allVisible && filteredProducts.length > 20 && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={() => setAllVisible(true)}>
            Load More
          </CButton>
        </div>
      )}

      {selectedProduct && (
        <CModal visible={modalOrder} onClose={handleCloseModalOrder}>
          <CModalHeader>Add to Cart</CModalHeader>
          <CModalBody>
            <CRow>
              <CCol md="4">
                <CImage
                  src={selectedProduct.Material.img || 'https://via.placeholder.com/150'}
                  alt={selectedProduct.Material.description}
                  fluid
                  className="rounded"
                />
              </CCol>
              <CCol md="8">
                <strong>{selectedProduct.Material.description}</strong>
                <p>Rp {selectedProduct.Material.price.toLocaleString('id-ID')}</p>
                <div className="d-flex align-items-center">
                  <CButton color="primary" onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>-</CButton>
                  <span className="mx-3">{quantity} ({selectedProduct.Material.uom})</span>
                  <CButton color="primary" onClick={() => setQuantity((prev) => prev + 1)}>+</CButton>
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="primary" onClick={() => handleAddToCart(selectedProduct, quantity)}>
              Add to Cart
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  );
};

export default Wishlist;
