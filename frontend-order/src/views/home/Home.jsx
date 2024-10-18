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
  CLink,
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
  cilLifeRing,
} from '@coreui/icons'

import { format, parseISO } from 'date-fns'

import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'

// Icon mapping based on your category names
const iconMap = {
  'Office Supp.': cilFolder,
  'Oper Supp.': cilCart,
  'Support Oper': cilInbox,
  'Raw.Matr': cilFax,
  'Spare Part': cilLifeRing,
  Tools: cilKeyboard,
}

const Home = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [wishlistData, setWishlistData] = useState([])
  const [myOrderData, setMyOrderData] = useState([])
  const { getProductByCategory } = useProductService()
  const { getCategory } = useProductService()
  const { getMasterData } = useMasterDataService()
  const { getWishlist, getMyorder } = useOrderService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleCount, setVisibleCount] = useState(20)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [products, setProducts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const { warehouse, wishlist } = useContext(GlobalContext)

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProductByCategories = async (categoryId, page) => {
    try {
      const response = await getProductByCategory(warehouse.id, categoryId, page)
      const newProducts = response.data

      setProducts((prevProducts) => [...prevProducts, ...newProducts])

      // Set 'hasMore' berdasarkan apakah ada produk yang tersisa untuk di-load
      setHasMore(newProducts.length === 24) // Misalkan limit per halaman adalah 24
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

  const getMyorders = async () => {
    try {
      const response = await getMyorder(warehouse.id)
      setMyOrderData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Inventory.Material.id === productId)
  }

  useEffect(() => {
    getCategories()
  }, [])

  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      getProductByCategories(categoriesData[0].id, 1)
      setProducts([])
    }
  }, [categoriesData, warehouse])

  useEffect(() => {
    if (warehouse && warehouse.id) {
      // if (selectedCategory && selectedCategory.id) {
      //   getProductByCategories(selectedCategory.id, 1)
      // }
      getFavorite()
      getMyorders()
    }
  }, [warehouse])

  const totalPages = Math.ceil(wishlistData.length / itemsPerPage)

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setProducts([])
    getProductByCategories(category.id, 1)
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
    // setVisibleCount(visibleCount + 12) // Load 12 more products
    const nextPage = page + 1
    setPage(nextPage)
    getProductByCategories(selectedCategory ? selectedCategory.id : categoriesData[0].id, nextPage)
  }

  // Fungsi untuk navigasi ke halaman sebelumnya
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  // Fungsi untuk navigasi ke halaman berikutnya
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  // Dapatkan produk yang ditampilkan pada halaman saat ini
  const currentWishlist = wishlistData.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  )

  // const visibleProducts = products.slice(0, visibleCount)

  const handleShowAll = () => {
    navigate('/history')
  }

  const getSeverity = (status) => {
    switch (status) {
      case 'waiting approval':
        return 'gray'
      case 'on process':
        return 'warning'
      case 'ready to deliver':
        return 'secondary'
      case 'ready to pickup':
        return 'blue'
      case 'delivered':
        return 'success'
      case 'rejected':
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
        <div className="d-flex flex-wrap align-items-center">
          <h4 className="me-3">Your Favorite Item</h4>
          <CLink
            component="button"
            color="primary"
            onClick={() => navigate('/wishlist')}
            style={{ cursor: 'pointer' }}
            className="text-decoration-none text-color-primary fw-bold"
          >
            Show All
          </CLink>
        </div>

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
            {currentWishlist.map((product) => (
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
                    className="img-fluid custom-card-image"
                  />
                  <CCardBody className="d-flex flex-column justify-content-between">
                    <div>
                      <CCardTitle style={{ fontSize: '14px' }}>
                        {product.Inventory.Material.description}
                      </CCardTitle>
                      <CCardTitle style={{ fontSize: '12px' }}>
                        {product.Inventory.Material.materialNo}
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
                                }}
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
              zIndex: 10,
            }}
          >
            <CIcon icon={cilArrowRight} />
          </CButton>
        </CRow>
      </CRow>
      <hr />
      {/* HISTORY */}
      <CRow className="mt-4">
        {/* Judul History Order dengan tombol View All */}
        <div className="d-flex flex-wrap align-items-center">
          <h4 className="me-3">History Order</h4>
          <CLink
            component="button"
            color="primary"
            onClick={() => navigate('/history')}
            style={{ cursor: 'pointer' }}
            className="text-decoration-none text-color-primary fw-bold"
          >
            Show All
          </CLink>
        </div>

        {/* Kartu produk */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {myOrderData.map((order) => (
            <CCard className="d-block w-100 p-3 mb-3" key={order.id}>
              <CRow className="align-items-center">
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CCol>
                    <CIcon className="me-2" icon={cilCart} />
                    <label className="me-2 fs-6" size="sm ">
                      {format(parseISO(order.createdAt), 'dd/MM/yyyy')}
                    </label>
                    <CBadge
                      className=" me-2 "
                      size="sm"
                      color={getSeverity(order.isReject == 1 ? 'rejected' : order.status)}
                    >
                      {order.isReject == 1 ? 'REJECTED' : order.status.toUpperCase()}
                    </CBadge>
                    <label className=" me-2 fw-light ">{order.transactionNumber}</label>
                  </CCol>
                </div>
                <CCol xs="5"></CCol>

                <CRow className="d-flex justify-content-between my-2 ">
                  <CCol xs="1">
                    <CCardImage
                      src={
                        order.Detail_Orders[0].Inventory.Material.img ||
                        'https://via.placeholder.com/150'
                      }
                      alt={order.Detail_Orders[0].Inventory.Material.description}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </CCol>

                  <CCol>
                    {order.Detail_Orders.length === 1 ? (
                      <label key={order.Detail_Orders[0].id}>
                        {order.Detail_Orders[0].Inventory.Material.description}
                      </label>
                    ) : (
                      <label>{order.Detail_Orders[0].Inventory.Material.description}...</label>
                    )}
                    <br />
                    <label className="fw-bold fs-6">Total: {order.Detail_Orders.length} Item</label>
                  </CCol>
                </CRow>

                <CRow className="d-flex justify-content-end align-items-center">
                  <CCol xs={4} className="d-flex justify-content-end">
                    <CButton
                      onClick={() => handleViewHistoryOrder(order)}
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
      </CRow>
      <hr />
      {/* Order By Category */}
      <CRow className="mt-4">
        <CRow>
          {categoriesData.map((category, index) => (
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
                    selectedCategory && selectedCategory.id === category.id
                      ? 'navy' // Warna navy jika kategori terpilih
                      : index === 0 &&
                          (!selectedCategory || selectedCategory.id === categoriesData[0].id)
                        ? 'navy' // Warna navy untuk kategori pertama jika belum ada yang dipilih atau kategori pertama dipilih
                        : 'white', // Warna default putih
                  color:
                    selectedCategory && selectedCategory.id === category.id
                      ? 'white' // Warna teks putih untuk kategori yang dipilih
                      : index === 0 &&
                          (!selectedCategory || selectedCategory.id === categoriesData[0].id)
                        ? 'white' // Warna teks putih untuk kategori pertama jika dipilih
                        : 'black', // Warna teks default
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
      </CRow>

      {/* Daftar Produk */}
      <CRow className="mt-3">
        {products.map((product, index) => (
          <CCol
            xs="6"
            sm="6"
            md="3"
            lg="3"
            xl="2"
            key={`${product.Material.id}-${index}`}
            className="mb-4"
          >
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
                    {product.Material.materialNo}
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
                      {/* {calculateStockStatus(product) === 'Out of Stock' && (
                        <CCol sm="auto" className="mb-1">
                          <CBadge color="secondary">Out of Stock</CBadge>
                        </CCol>
                      )}
                      {calculateStockStatus(product) === 'Low Stock' && (
                        <CCol sm="auto" className="mb-1">
                          <CBadge color="warning">Low Stock</CBadge>
                        </CCol>
                      )}
                      {calculateStockStatus(product) !== 'Out of Stock' && ( */}
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
                      {/* )} */}
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
      {/* {visibleCount < products.length && ( */}
      {hasMore && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}
      {/* )} */}

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
                <p>{product.Inventory.Material.materialNo}</p>
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
