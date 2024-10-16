import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import {
  CCard,
  CCardBody,
  CCardImage,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CImage,
  CCarousel,
  CCarouselItem,
  CCallout,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBatteryEmpty,
  cilDeaf,
  cilFax,
  cilFolder,
  cilHome,
  cilInbox,
  cilKeyboard,
  cilUser,
  cilCart,
  cilHeart,
  cilArrowRight,
  cilArrowLeft,
} from '@coreui/icons'

import useManageStockService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'

// Icon mapping based on your category names
const iconMap = {
  'Office Supp.': cilFolder,
  'Oper Supp.': cilCart,
  'Support Oper': cilInbox,
  'Raw.Matr': cilFax,
  'Spare Part': cilDeaf,
  Tools: cilKeyboard,
}

const Home = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [wishlistData, setWishlistData] = useState([])
  const { getProduct } = useManageStockService()
  const { getCategory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { getWishlist } = useOrderService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 6
  const [visibleCount, setVisibleCount] = useState(12)
  const [filteredProducts, setFilteredProducts] = useState([])

  const { warehouse } = useContext(GlobalContext)

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProducts = async () => {
    try {
      const response = await getProduct(warehouse.id)
      setProductsData(response.data)
      setFilteredProducts(response.data) // Initially show all products
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

  const getFavorite = async () => {
    try {
      const response = await getWishlist(warehouse.id)
      setWishlistData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Material.id === productId)
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getProducts()
      getFavorite()
    }
    getCategories()
  }, [warehouse])

  const currentProducts = useMemo(() => {
    const start = currentPage * productsPerPage
    const end = start + productsPerPage
    return filteredProducts.slice(start, end)
  }, [filteredProducts, currentPage, productsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)

    if (category) {
      const filtered = productsData.filter((product) => product.Material.categoryId === category.id)
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(productsData)
    }
  }

  const handleQuantityChange = (action) => {
    if (action === 'increment') {
      setQuantity((prev) => Math.min(prev + 1, selectedProduct.quantityActualCheck))
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.Material.id === product.Material.id)
    if (existingProduct) {
      const updatedCart = cart.map((item) =>
        item.Material.id === product.Material.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
      setCart(updatedCart)
    } else {
      setCart([...cart, { ...product, quantity }])
    }
    setCartCount(cartCount + quantity)
    setModalOrder(false)
  }

  const handleToggleWishlist = (productId) => {
    if (isInWishlist(productId)) {
      setWishlist(wishlist.filter((item) => item.Material.id !== productId))
    } else {
      const productToAdd = productsData.find((item) => item.Material.id === productId)
      setWishlist([...wishlist, productToAdd])
    }
  }

  const calculateStockStatus = (product) => {
    if (product.quantityActualCheck <= 0) {
      return 'Out of Stock'
    }
    return 'In Stock'
  }

  const handleLoadMore = () => {
    setVisibleCount(visibleCount + 12) // Load 12 more products
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  const handleViewAll = () => {
    navigate('/history')
  }

  const getSeverity = (status) => {
    switch (status) {
      case 'Waiting':
        return 'gray'
      case 'On Process':
        return 'warning'
      case 'Delivery':
        return 'secondary'
      case 'Pickup':
        return 'blue'
      case 'Completed':
        return 'success'
      case 'Rejected':
        return 'danger'
    }
  }

  return (
    <>
      <CRow>
        <div className="carousel-flex">
          <CCarousel controls indicators>
            <CCarouselItem>
              <video className="d-block w-100" controls autoPlay loop muted>
                <source src="/src/assets/home/INVENTORY.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CCarouselItem>
            {['1.jpg', '2.jpg', '3.jpg'].map((img, index) => (
              <CCarouselItem key={index}>
                <CImage
                  className="d-block w-100"
                  src={`/src/assets/home/${img}`}
                  alt={`slide ${index + 1}`}
                  fluid
                  rounded
                />
              </CCarouselItem>
            ))}
          </CCarousel>
        </div>
      </CRow>

      {/* Your Favorite Item */}
      <CRow className="mt-4">
        <h4>Your Favorite Item</h4>

        {/* Container for displaying product cards */}
        <CRow className="position-relative">
          <CButton
            className="position-absolute start-0"
            color="light"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10, // Memastikan tombol ini di atas elemen lain
            }}
          >
            <CIcon icon={cilArrowLeft} />
          </CButton>

          <CRow className="g-2">
            {wishlistData.map((product) => (
              <CCol
                xs="6"
                sm="6"
                md="3"
                lg="3"
                xl="2"
                key={product.Inventory.Material.id}
                className="mb-3"
              >
                <CCard className="h-100">
                  <CCardImage
                    orientation="top"
                    src={product.Inventory.Material.img || 'https://via.placeholder.com/150'}
                    alt={product.Inventory.Material.description}
                    className="img-fluid custom-card-image" // Menggunakan kelas CoreUI dan kelas kustom
                  />
                  <CCardBody className="d-flex flex-column justify-content-between">
                    <div>
                      <CCardTitle style={{ fontSize: '14px' }}>
                        {product.Inventory.Material.description}
                      </CCardTitle>
                      <CCardTitle style={{ fontSize: '12px' }}>
                        Rp{' '}
                        {product.Inventory.Material.price
                          ? product.Inventory.Material.price.toLocaleString('id-ID')
                          : 'Price not available'}
                      </CCardTitle>
                    </div>

                    <CRow className="mt-auto align-items-center">
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <CCol sm="Auto" className="mb-2">
                          {calculateStockStatus(product) === 'Out of Stock' ? (
                            <>
                              <CBadge color="secondary" className="me-2">
                                {calculateStockStatus(product)}
                              </CBadge>

                              <CButton
                                className="box me-4"
                                color="secondary"
                                onClick={() => handleToggleWishlist(product.Inventory.Material.id)}
                                style={{
                                  backgroundColor: isInWishlist(product.Inventory.Material.id)
                                    ? 'red'
                                    : 'white',
                                  border: '1px solid white',
                                  color: isInWishlist(product.Inventory.Material.id)
                                    ? 'white'
                                    : 'black',
                                  borderRadius: '50%',
                                }}
                              >
                                <CIcon
                                  icon={cilHeart}
                                  className={
                                    isInWishlist(product.Inventory.Material.id)
                                      ? ''
                                      : 'border border-secondary rounded-circle'
                                  }
                                  style={{ fontSize: '1rem' }}
                                />
                              </CButton>
                            </>
                          ) : (
                            <>
                              <CButton
                                className="box btn-sm"
                                color="primary"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  marginRight: '10px',
                                }} // Custom styling for smaller button
                                onClick={() => handleModalCart(product)}
                              >
                                Add to Cart
                              </CButton>

                              <CButton
                                className="box"
                                color="secondary"
                                onClick={() => handleToggleWishlist(product.Inventory.Material.id)}
                                style={{
                                  backgroundColor: isInWishlist(product.Inventory.Material.id)
                                    ? 'red'
                                    : 'white',
                                  border: '1px solid white',
                                  color: isInWishlist(product.Inventory.Material.id)
                                    ? 'white'
                                    : 'black',
                                  borderRadius: '50%',
                                }}
                              >
                                <CIcon
                                  icon={cilHeart}
                                  className={
                                    isInWishlist(product.Inventory.Material.id)
                                      ? ''
                                      : 'border border-secondary rounded-circle'
                                  }
                                  style={{ fontSize: '1rem' }}
                                />
                              </CButton>
                            </>
                          )}
                        </CCol>
                      </div>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>

          <CButton
            className="position-absolute end-0"
            color="light"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10, // Memastikan tombol ini di atas elemen lain
            }}
          >
            <CIcon icon={cilArrowRight} />
          </CButton>
        </CRow>
      </CRow>

      {/* HISTORY */}
      {/* <CRow className="mt-3">
        <CCard className="d-block w-100 responsive-container">
          Judul History Order dengan tombol View All
          <div className="d-flex justify-content-between align-items-center">
            <h3 style={{ fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold' }}>
              History Order
            </h3>
            <CButton
              color="primary"
              onClick={handleViewAll}
              style={{ fontSize: '14px', padding: '2px 10px' }}
            >
              View All
            </CButton>
          </div>

          Kartu produk
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {currentProducts.map((product) => (
              <CCard className="d-block w-100 p-3 mb-3" key={product.Inventory.Material.id}>
                <CRow className="align-items-center">
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CCol>
                      <CIcon className="me-2" icon={cilCart} />
                      <label className="me-2 fs-6" size="sm ">
                        {' '}
                        3 Oktober 2024
                      </label>
                      <CBadge className=" me-2 " size="sm" color={getSeverity('Completed')}>
                        ON PROCESS
                      </CBadge>

                      <label className=" me-2 fw-light ">X21000000000/20/20</label>
                    </CCol>
                  </div>
                  <CCol xs="5"></CCol>
                 
                  <CRow xs="1" className="d-flex justify-content-between my-2 ">
                    <CCol xs="1">
                      <CCardImage
                        src={product.Material.img || 'https://via.placeholder.com/150'}
                        alt={product.Material.description}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </CCol>
                    <CCol >
                      <label>{product.Material.description}</label>
                      <br />
                      <label className="fw-bold fs-6">Total: 4 Item</label>
                    </CCol>
                  </CRow>

                  <CRow xs="1" className="d-flex justify-content-end align-items-center">
                    <CCol xs={4} className="d-flex justify-content-end">
                      <CButton
                        onClick={() => handleViewHistoryOrder(product)}
                        color="primary"
                        size="sm"
                      >
                        View Detail Order
                      </CButton>
                    </CCol>
                  </CRow>
                </CRow>
              </CCard>
            ))}
          </div>
        </CCard>
      </CRow> */}

      {/* Order By Category */}
      <CRow className="mt-3">
        <CCard className="d-block w-100 responsive-container shadow-sm">
          <CCallout
            color="primary"
            style={{ width: '280px', padding: '4px', marginBottom: '20px' }}
          >
            <b>Order By Category</b>
          </CCallout>
          <CRow>
            {categoriesData.map((category) => (
              <CCol
                key={category.id}
                xs="12"
                sm="6"
                md="4"
                lg="2"
                style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}
              >
                <CCard
                  onClick={() => handleCategoryClick(category)}
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    padding: '1px',
                    margin: '10px',
                    backgroundColor:
                      selectedCategory && selectedCategory.id === category.id ? 'navy' : 'white',
                    color:
                      selectedCategory && selectedCategory.id === category.id ? 'white' : 'black',
                  }}
                >
                  <CCardBody style={{ display: 'flex', alignItems: 'center' }}>
                    <CIcon
                      icon={iconMap[category.categoryName] || cilFolder}
                      style={{ marginRight: '8px' }}
                    />
                    <h6 style={{ margin: 0 }}>{category.categoryName}</h6>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCard>
      </CRow>

      {/* Daftar Produk */}
      <CRow className="mt-3">
        {filteredProducts.slice(0, visibleCount).map((product) => (
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
                <CRow className="mt-auto align-items-center">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      {/* Show "Out of Stock" badge if applicable */}
                      {calculateStockStatus(product) === 'Out of Stock' && (
                        <CCol sm="auto" className="mb-1">
                          <CBadge color="secondary">Out of Stock</CBadge>
                        </CCol>
                      )}
                      {/* Show "Low Stock" badge if applicable */}
                      {calculateStockStatus(product) === 'Low Stock' && (
                        <CCol sm="auto" className="mb-1">
                          <CBadge color="warning">Low Stock</CBadge>
                        </CCol>
                      )}
                      {/* Show "Add Cart" only if the stock status is not "Out of Stock" */}
                      {calculateStockStatus(product) !== 'Out of Stock' && (
                        <CCol sm="auto">
                          <CButton
                            className="box btn-sm"
                            color="primary"
                            style={{ padding: '5px 10px', fontSize: '12px', marginRight: '10px' }} // Custom styling for smaller button
                            onClick={() => handleModalCart(product)}
                          >
                            Add to Cart
                          </CButton>
                        </CCol>
                      )}
                    </div>

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
                          className={
                            isInWishlist(product.Material.id)
                              ? ''
                              : 'border border-secondary rounded-circle'
                          }
                          style={{ fontSize: '1rem' }}
                        />
                      </CButton>
                    </CCol>
                  </div>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Tombol Load More */}
      {visibleCount < filteredProducts.length && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}

      {/* Modal for adding product to cart */}
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
                  <CButton
                    color="primary"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  >
                    -
                  </CButton>
                  <span className="mx-3">
                    {quantity} ({selectedProduct.Material.uom})
                  </span>
                  <CButton color="primary" onClick={() => setQuantity((prev) => prev + 1)}>
                    +
                  </CButton>
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
  )
}

export default Home
