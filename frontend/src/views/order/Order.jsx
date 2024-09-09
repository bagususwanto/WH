import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart } from '@coreui/icons'
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

  const apiCategory = 'category'

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

  const handleAddToCart = (product) => {
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

  const handleCategoryClick = (category) => {
    console.log(`Category clicked: ${category.name}`)
  }

  return (
    <>
      {/* Input pencarian */}
      <CFormInput
        type="search"
        placeholder="Search product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Tombol untuk kategori produk */}
      <CCard className="mb-4">
        <CCardHeader>Category</CCardHeader>
        <CCardBody>
          <Slider {...settings} className="mb-4">
            {categoriesData.map((category) => (
              <div key={category.id} className="d-flex flex-column align-items-center">
                <img
                  src={category.img || 'https://via.placeholder.com/150'}
                  alt={category.categoryName}
                  className="rounded-circle"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    marginBottom: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCategoryClick(category)}
                />
                <div style={{ fontSize: '12px', textAlign: 'center' }}>{category.categoryName}</div>
              </div>
            ))}
          </Slider>
        </CCardBody>
      </CCard>

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
                        onClick={() => handleAddToCart(product)}
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
        <CModal visible={modalOrder} onClose={() => setModalOrder(false)}>
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
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="primary"
              onClick={() => {
                handleOrder(selectedProduct)
                closeModal()
              }}
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
