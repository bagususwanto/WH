import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilClipboard } from '@coreui/icons'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Slider from 'react-slick'
import useManageStockService from '../../services/ManageStockService'
import useMasterDataService from '../../services/MasterDataService'

const ProductList = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([]) // State untuk menyimpan item keranjang
  const [cartCount, setCartCount] = useState(0)

  const apiCategory = 'category'

  const navigate = useNavigate()

  // Ambil quantityActualCheck dari selectedProduct
  const quantityActualCheck = selectedProduct?.quantityActualCheck || 0

  const getProducts = async () => {
    try {
      const response = await getInventory()
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const getCategories = async () => {
    try {
      const response = await getMasterData(apiCategory)
      setCategoriesData(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    getProducts()
    getCategories()
  }, [])

  // Fungsi untuk menghitung status stok
  const calculateStockStatus = (product) => {
    const { quantityActualCheck } = product
    const { minStock, maxStock } = product.Material
    if (quantityActualCheck == null) return 'Out of Stock'
    if (quantityActualCheck > maxStock) return 'In Stock'
    if (quantityActualCheck <= minStock) return 'Low Stock'
    return 'Out of Stock'
  }

  const getStockBadgeColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'success'
      case 'Low Stock':
        return 'warning'
      case 'Out of Stock':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  // Fungsi untuk menampilkan semua produk
  const handleLoadMore = () => {
    setAllVisible(true)
  }

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  // Filter produk berdasarkan query pencarian
  const filteredProducts = productsData.filter((product) =>
    product.Material.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Slider settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }

  const handleCategoryClick = (category) => {
    console.log(`Category clicked: ${category.categoryName}`)
  }

  // Fungsi untuk menambah atau mengurangi quantity
  const handleQuantityChange = (action) => {
    if (action === 'increment') {
      setQuantity((prev) => {
        // Jangan lebih dari quantityActualCheck
        return prev < quantityActualCheck ? prev + 1 : quantityActualCheck
      })
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  // Fungsi untuk mengubah quantity secara manual melalui input
  const handleManualQuantityChange = (e) => {
    const value = e.target.value
    // Validasi input hanya untuk angka dan tidak melebihi quantityActualCheck
    if (/^\d*$/.test(value)) {
      const numberValue = Number(value) || 1
      if (numberValue <= quantityActualCheck) {
        setQuantity(numberValue)
      }
    }
  }

  // Fungsi untuk menambah item ke keranjang
  const handleAddToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.id === product.Material.id)
    if (existingProduct) {
      // Jika produk sudah ada di keranjang, tambahkan jumlahnya
      const updatedCart = cart.map((item) =>
        item.id === product.Material.id ? { ...item, quantity: item.quantity + quantity } : item,
      )
      setCart(updatedCart)
    } else {
      // Jika produk belum ada di keranjang, tambahkan produk baru
      setCart([...cart, { ...product, quantity }])
    }

    // Update jumlah item di keranjang
    setCartCount(cartCount + quantity)
    setModalOrder(false) // Tutup modal setelah menambah ke keranjang
  }

  return (
    <>
      <CRow className="align-items-center py-2 border rounded mb-3 sticky-search-bar shadow-sm">
        {/* Kategori Produk */}
        <CCol xs={12} sm={2} className="text-center text-sm-start mb-2 mb-sm-0">
          <CDropdown className="w-100 text-center">
            <CDropdownToggle style={{ fontSize: '16px', color: '#555' }}>Category</CDropdownToggle>
            <CDropdownMenu>
              {categoriesData.map((category) => (
                <CDropdownItem key={category.id} onClick={() => handleCategoryClick(category)}>
                  {category.categoryName}
                </CDropdownItem>
              ))}
            </CDropdownMenu>
          </CDropdown>
        </CCol>

        {/* Input Pencarian */}
        <CCol xs={12} sm={8} className="mb-2 mb-sm-0">
          <CFormInput
            type="search"
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 p-2 mb-2"
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: 'none',
              width: '100%',
              outline: '1px solid #ddd', // Outline warna biru (bisa disesuaikan)
            }}
          />
        </CCol>

        {/* Icon My Order */}
        <CCol xs={6} sm={1} className="text-center mb-2 mb-sm-0">
          <CNavLink
            className="d-flex justify-content-center align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/my-order')}
          >
            <CIcon
              icon={cilClipboard}
              size="lg"
              style={{ transition: 'color 0.3s', color: '#333' }}
            />
          </CNavLink>
        </CCol>

        {/* Icon Cart */}
        <CCol xs={6} sm={1} className="text-center">
          <CNavLink
            className="d-flex justify-content-center align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/cart')}
          >
            <CIcon icon={cilCart} size="lg" style={{ transition: 'color 0.3s', color: '#333' }} />
            {cartCount > 0 && (
              <CBadge
                color="danger"
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: '0.75rem' }}
              >
                {cartCount}
              </CBadge>
            )}
          </CNavLink>
        </CCol>
      </CRow>

      {/* Produk yang difilter */}
      <CRow>
        {filteredProducts.slice(0, allVisible ? filteredProducts.length : 20).map((product) => (
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
                  <CCardTitle style={{ fontSize: '14px' }}>
                    {product.Material.description}
                  </CCardTitle>
                  <CCardTitle style={{ fontSize: '12px' }}>
                    Rp {product.Material.price.toLocaleString('id-ID')}
                  </CCardTitle>
                </div>
                <CRow className="mt-auto">
                  <CCol sm="12" className="mb-2">
                    {calculateStockStatus(product) == 'Out of Stock' && (
                      <CBadge color="primary">{calculateStockStatus(product)}</CBadge>
                    )}
                  </CCol>
                  <CCol sm="12" className="text-start">
                    {calculateStockStatus(product) !== 'Out of Stock' && (
                      <CButton
                        className="rounded-circle"
                        color="primary"
                        onClick={() => handleModalCart(product)}
                        style={{ position: 'relative', bottom: '0' }}
                      >
                        <CIcon icon={cilCart} />
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Tampilkan tombol "Muat Lebih Banyak" */}
      {!allVisible && filteredProducts.length > 20 && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}

      {/* Modal Add to Cart */}
      {selectedProduct && (
        <CModal visible={modalOrder} onClose={() => handleCloseModalOrder(false)}>
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

                {/* Counter untuk menambah atau mengurangi jumlah */}
                <div className="d-flex align-items-center">
                  <CButton color="primary" onClick={() => handleQuantityChange('decrement')}>
                    -
                  </CButton>
                  <CFormInput
                    type="text"
                    value={quantity}
                    onChange={handleManualQuantityChange}
                    className="mx-3 text-center"
                    style={{ width: '60px' }}
                    min="1"
                  />
                  <CButton color="primary" onClick={() => handleQuantityChange('increment')}>
                    +
                  </CButton>

                  {/* UOM (Unit of Measurement) */}
                  <span className="mx-3">({selectedProduct.Material.uom})</span>
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="primary"
              onClick={() => handleAddToCart(selectedProduct, quantity)}
              disabled={quantity > selectedProduct.quantityActualCheck}
            >
              Add to Cart
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}

export default ProductList
