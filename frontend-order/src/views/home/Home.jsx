import React, { useEffect, useState, useMemo, useContext } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { AiFillHeart } from 'react-icons/ai'
import InventoryVideo from '/src/assets/home/INVENTORY.mp4'
import Slide1 from '/src/assets/home/1.jpg'
import Slide2 from '/src/assets/home/2.jpg'
import Slide3 from '/src/assets/home/3.jpg'

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
  CModalTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBatteryEmpty,
  cilDeaf,
  cilFax,
  cilFolder,
  cilPencil,
  cilFactory,
  cilPaintBucket,
  cilFootball,
  cilCut,
  cilTags,
  cilHome,
  cilInbox,
  cilBan,
  cilUser,
  cilCart,
  cilHeart,
  cilArrowRight,
  cilArrowLeft,
  cilLifeRing,
  cilClipboard,
  cilCheckCircle,
  cilTruck,
  cilWalk,
  cilCircle,
} from '@coreui/icons'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { format, parseISO } from 'date-fns'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'
import useCartService from '../../services/CartService'
import { GlobalContext } from '../../context/GlobalProvider'
import config from '../../utils/Config'

// Icon mapping based on your category names
const iconMap = {
  'Office Supp.': cilPencil,
  'Oper. Supply': cilFactory,
  'Support Oper': cilInbox,
  'Raw Matr.': cilPaintBucket,
  'Spare Part': cilFootball,
  Tools: cilCut,
  Others: cilTags,
}

const Home = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [wishlistData, setWishlistData] = useState([])
  const [myOrderData, setMyOrderData] = useState([])
  const { getProductByCategory } = useProductService()
  const { getCategory } = useProductService()
  const { getMasterData } = useMasterDataService()
  const { getWishlist, deleteWishlist, addWishlist, getMyorder, getOrderHistory } =
    useOrderService()
  const { postCart, updateCart } = useCartService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const minOrder = selectedProduct?.Material?.minOrder;
  const [quantity, setQuantity] = useState(minOrder);
  
  const [selectedCategory, setSelectedCategory] = useState(null)
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleCount, setVisibleCount] = useState(20)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [products, setProducts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true) // Track loading state
  const [orderHistory, setOrderHistory] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [visible, setVisible] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [hoveredItemId, setHoveredItemId] = useState(null)
  const { warehouse, wishlist, setWishlist, cart, setCart, cartCount, setCartCount } =
    useContext(GlobalContext)

  const MySwal = withReactContent(Swal)

  const navigate = useNavigate()

  const apiCategory = 'category-public'
  const getTabIcon = (status) => {
    switch (status) {
      case 'all':
        return cilApplications // Icon kertas
      case 'waiting approval':
        return cilUser // Icon kertas

      case 'waiting confirmation':
        return cilClipboard // Icon kertas
      case 'on process':
        return cilCart // Icon keranjang
      case 'ready to deliver':
      case 'ready to pickup':
        return cilTruck // Icon truck
      case 'completed':
        return cilCheckCircle // Icon ceklis
      case 'rejected':
        return cilBan // Icon silang
      default:
        return cilBan // Default icon
    }
  }

  const icons = {
    cilClipboard,
    cilHome,
    cilUser,
    cilCheckCircle,
    cilTruck,
    cilWalk,
    cilCircle,
  }

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
      setIsLoading(false) // Data finished loading
    } catch (error) {
      console.error('Error fetching categories:', error)
      setIsLoading(false) // In case of error, set loading to false
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
      const response = await getMyorder({ id: warehouse.id })
      setMyOrderData(response.data.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const getOrderHistories = async (id) => {
    try {
      const response = await getOrderHistory(id)
      setOrderHistory(response.data)
    } catch (error) {
      console.error('Error fetching Order History:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId)
  }

  const isInWishlistProduct = (productId) => {
    return wishlist.some((item) => item.Inventory.id === productId)
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
  }, [warehouse, wishlist])

  const totalPages = Math.ceil(wishlistData.length / itemsPerPage)

  const handleModalCart = (product) => {
    setSelectedProduct(product);
    setQuantity(product.Material?.minOrder || 1);
    setModalOrder(true);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setProducts([])
    getProductByCategories(category.id, 1)
  }

  const handleQuantityChange = (action) => {
    if (action === 'increment') {
      setQuantity((prev) => Math.min(prev + 1, selectedOrder.quantityActualCheck))
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = async (product, quantity) => {
    try {
      // Cek inventoryId yang sesuai dari product
      const inventoryId = product.Inventory ? product.Inventory.id : product.id

      // Cari produk yang ada di cart berdasarkan inventoryId
      const existingProduct = cart.find((item) => item.inventoryId === inventoryId)

      if (existingProduct) {
        // Jika produk ada di cart, update kuantitasnya
        const updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + quantity,
        }

        // Update cart menggunakan API updateCart
        const updatedCartResponse = await updateCart(
          {
            inventoryId,
            quantity: updatedProduct.quantity,
          },
          warehouse.id,
        )

        if (updatedCartResponse) {
          // Update state cart dengan produk yang sudah diperbarui
          setCart(cart.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
        }
      } else {
        // Jika produk tidak ada di cart, tambahkan produk baru
        const newCartItem = {
          inventoryId,
          quantity,
        }

        setCartCount(cartCount + quantity)

        // Posting produk baru ke API menggunakan postCart
        const addToCartResponse = await postCart(newCartItem, warehouse.id)

        if (addToCartResponse) {
          // Tambahkan produk baru ke state cart
          setCart([
            ...cart,
            { ...newCartItem, Inventory: product.Inventory ? product.Inventory : product },
          ])
        }
      }

      setModalOrder(false)

      MySwal.fire({
        title: 'Success',
        text: 'Product added to cart',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Go to Cart',
        cancelButtonText: 'Stay Here',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart')
        }
      })
    } catch (error) {
      // Handle error
      console.error('Failed to add to cart:', error)
    }
  }

  const handleToggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      // Jika produk sudah ada di wishlist (unlove), lakukan DELETE
      try {
        await deleteWishlist(product.Inventory.id, warehouse.id)
        // Update state wishlist di frontend setelah berhasil menghapus dari database
        setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== product.id))
        MySwal.fire('Success', 'Product removed from wishlist', 'success')
      } catch (error) {
        console.error('Error removing product from wishlist:', error)
      }
    } else {
      // Jika produk belum ada di wishlist (love), lakukan POST
      try {
        await addWishlist({ inventoryId: product.Inventory.id }, warehouse.id)
        // Update state wishlist di frontend setelah berhasil menambahkan ke database
        const responseWish = await getWishlist(warehouse.id)
        setWishlist((prevWishlist) => [...prevWishlist, ...responseWish.data])

        // Menampilkan SweetAlert dengan tombol "Go to Wishlist"
        MySwal.fire({
          title: 'Success',
          text: 'Product added to wishlist',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Go to Wishlist',
          cancelButtonText: 'Stay Here',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigasi ke halaman wishlist
            navigate('/wishlist')
          }
        })
      } catch (error) {
        console.error('Error adding product to wishlist:', error)
      }
    }
  }

  const handleToggleWishlistProduct = async (product) => {
    if (isInWishlistProduct(product.id)) {
      // Jika produk sudah ada di wishlist (unlove), lakukan DELETE
      try {
        await deleteWishlist(product.id, warehouse.id)
        // Update state wishlist di frontend setelah berhasil menghapus dari database
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.Inventory.id !== product.id),
        )
      } catch (error) {
        console.error('Error removing product from wishlist:', error)
      }
    } else {
      // Jika produk belum ada di wishlist (love), lakukan POST
      try {
        await addWishlist({ inventoryId: product.id }, warehouse.id)
        // Update state wishlist di frontend setelah berhasil menambahkan ke database
        const responseWish = await getWishlist(warehouse.id)
        setWishlist((prevWishlist) => [...prevWishlist, ...responseWish.data])
        // Menampilkan SweetAlert dengan tombol "Go to Wishlist"
        MySwal.fire({
          title: 'Success',
          text: 'Product added to wishlist',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Go to Wishlist',
          cancelButtonText: 'Stay Here',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigasi ke halaman wishlist
            navigate('/wishlist')
          }
        })
      } catch (error) {
        console.error('Error adding product to wishlist:', error)
      }
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
        return 'warning'
      case 'waiting confirmation':
        return 'warning'
      case 'on process':
        return 'warning'
      case 'ready to deliver':
        return 'secondary'
      case 'ready to pickup':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'rejected':
        return 'danger'
    }
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }
  // Banner Skeleton
  const renderBannerSkeleton = () => <Skeleton height={250} width="100%" />

  // Favorite Item Card Skeleton
  const renderFavoriteCardSkeleton = () => (
    <CCol sm="4" md="3">
      <CCard>
        <CCardImage>
          <Skeleton height={200} width="100%" />
        </CCardImage>
        <CCardBody>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={20} />
        </CCardBody>
      </CCard>
    </CCol>
  )

  // Order History Card Skeleton
  const renderOrderHistoryCardSkeleton = () => (
    <CCol sm="4" md="3">
      <CCard>
        <CCardBody>
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={20} />
          <Skeleton width="50%" height={20} />
        </CCardBody>
      </CCard>
    </CCol>
  )

  // Item Card Skeleton
  const renderItemCardSkeleton = () => (
    <CCol sm="4" md="3">
      <CCard>
        <CCardImage>
          <Skeleton height={200} width="100%" />
        </CCardImage>
        <CCardBody>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={20} />
        </CCardBody>
      </CCard>
    </CCol>
  )

  const handleViewHistoryOrder = (product) => {
    getOrderHistories(product.id)
    setSelectedOrder(product)
    setVisible(true)
  }
  const totalQuantity = new Set(
    (selectedOrder?.Detail_Orders || []).map((detail) => detail.Inventory.Material.description),
  ).size

  // Pastikan minOrder dideklarasikan sebelum digunakan
  const handleIncrease = () => {
    const minOrder = selectedProduct?.Material?.minOrder || 1
    setQuantity((prev) => prev + minOrder)
  }

  const handleDecrease = () => {
    const minOrder = selectedProduct?.Material?.minOrder || 1
    setQuantity((prev) => Math.max(prev - minOrder, minOrder))
  }

  return (
    <>
      <CRow>
        <div className="carousel-flex">
          <CCarousel controls indicators>
            <CCarouselItem>
              {isLoading ? (
                <Skeleton height={250} width="100%" />
              ) : (
                <video className="d-block w-100" controls autoPlay loop muted>
                  <source src={InventoryVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </CCarouselItem>
            {[Slide1, Slide2, Slide3].map((img, index) => (
              <CCarouselItem key={index}>
                {isLoading ? (
                  <Skeleton height={250} width="100%" />
                ) : (
                  <CImage
                    className="d-block w-100"
                    src={img}
                    alt={`slide ${index + 1}`}
                    fluid
                    rounded
                  />
                )}
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
            {isLoading
              ? Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <CCol xs="6" sm="6" md="3" lg="3" key={index} className="mb-3">
                      <CCard>
                        <Skeleton height={200} width="100%" />
                        <CCardBody>
                          <Skeleton width="50%" height={20} />
                          <Skeleton width="30%" height={20} />
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))
              : currentWishlist.map((product) => (
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
                        src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
                        alt={product.Inventory.Material.description}
                        style={{
                          width: '100%', // Ensure it takes the full width
                          height: '150px', // Fixed height for uniformity
                          objectFit: 'contain', // Keep the aspect ratio
                        }}
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
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                              }}
                            >
                              {/* {calculateStockStatus(product) === 'Out of Stock' && (
                            <CCol sm="auto" className="mb-1">
                              <CBadge textBgColor="light">Out of Stock</CBadge>
                            </CCol>
                          )} */}

                              {/* {calculateStockStatus(product) !== 'Out of Stock' && ( */}
                              <CCol sm="auto">
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
                              </CCol>
                              {/* )} */}
                            </div>

                            <CCol sm="auto" className="ms-2">
                              <CButton
                                onClick={() => handleToggleWishlist(product)}
                                style={{
                                  backgroundColor: 'transparent', // No background for the button
                                  border: 'black', // Menghilangkan border default button
                                  padding: '0', // No padding, membuat button sekecil ikon
                                  outline: 'none', // Menghapus outline pada focus button
                                }}
                              >
                                <AiFillHeart
                                  style={{
                                    color: isInWishlist(product.id) ? 'red' : 'white', // Ubah warna ikon sesuai status wishlist
                                    stroke: 'black', // Menambahkan efek garis luar (outline) hitam pada ikon
                                    strokeWidth: '15px', // Tebal garis luar
                                  }}
                                  size={20} // Ukuran ikon
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
          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : myOrderData && myOrderData.length === 0 ? (
            <p>No orders available.</p>
          ) : (
            myOrderData &&
            myOrderData.map((order) => (
              <CCard className="d-block w-100 p-3 mb-3" key={order.id}>
                <CRow className="align-items-center">
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CCol>
                      <CIcon className="me-2" icon={cilCart} />
                      <label className="me-2 fs-6" size="sm ">
                        {format(parseISO(order.transactionDate), 'dd/MM/yyyy')}
                      </label>
                      <CBadge
                        className=" me-2 "
                        size="sm"
                        color={getSeverity(order.isReject == 1 ? 'rejected' : order.status)}
                      >
                        {order.isReject == 1 ? 'REJECTED' : order.status.toUpperCase()}
                      </CBadge>
                      <label className=" me-2 fw-light ">
                        {order.transactionNumber ? order.transactionNumber : order.requestNumber}
                      </label>
                    </CCol>
                  </div>
                  <CCol xs="5"></CCol>

                  <CRow className="d-flex justify-content-between my-2 ">
                    <CCol xs="1">
                      <CCardImage
                        src={`${config.BACKEND_URL}${order.Detail_Orders[0]?.Inventory.Material.img}`}
                        alt={order.Detail_Orders[0]?.Inventory.Material.description}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </CCol>

                    <CCol>
                      {order.Detail_Orders.length === 1 ? (
                        <label key={order.Detail_Orders[0]?.id}>
                          {order.Detail_Orders[0]?.Inventory.Material.description}
                        </label>
                      ) : (
                        <label>{order.Detail_Orders[0]?.Inventory.Material.description}...</label>
                      )}
                      <br />
                      <label className="fw-bold fs-6">
                        Total: {order.Detail_Orders.length} Item
                      </label>
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
            ))
          )}
        </div>

        {selectedOrder && (
          <CModal visible={visible} onClose={() => setVisible(false)} className="modal-lg">
            <CModalHeader>
              <CModalTitle>Order Details</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow className="g-1 ">
                <CCard className="h-80 mt-1">
                  <CCardBody>
                    <CRow className="align-items-center mb-2">
                      <CCol className="d-flex justify-content-between align-items-center">
                        <div>
                          <CIcon className="me-2" icon={getTabIcon(selectedOrder?.status)} />
                          <label className="me-2 fs-6">
                            {format(parseISO(selectedOrder.transactionDate), 'dd/MM/yyyy')}
                          </label>
                          <CBadge
                            color={getSeverity(
                              selectedOrder.Detail_Orders[0].isReject == 1
                                ? 'rejected'
                                : selectedOrder.status,
                            )}
                          >
                            {selectedOrder.Detail_Orders[0].isReject == 1
                              ? 'REJECTED'
                              : selectedOrder.status.toUpperCase()}
                          </CBadge>
                          <label className=" fw-light">
                            {selectedOrder.transactionNumber
                              ? `${selectedOrder.transactionNumber}`
                              : `${selectedOrder.requestNumber}`}
                          </label>
                        </div>
                        <div>
                          <label>Total: {totalQuantity} Item</label>
                        </div>
                      </CCol>
                    </CRow>
                    <hr style={{ height: '2px', backgroundColor: 'black', margin: '2px ' }} />
                    <label
                      className="fw-light mb-1"
                      style={{
                        fontSize: '0.85rem', // Ukuran font kecil
                      }}
                    >
                      List of Product
                    </label>

                    {selectedOrder.Detail_Orders.map((detail) => (
                      <CRow className="align-items-center mb-2" key={detail.id}>
                        <CCol xs="1">
                          <CCardImage
                            src={`${config.BACKEND_URL}${detail.Inventory.Material.img}`}
                            style={{ height: '40px', width: '40px', objectFit: 'contain' }} // Smaller image
                          />
                        </CCol>
                        <CCol xs="8">
                          <label style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                            {detail.Inventory.Material.description}
                          </label>
                        </CCol>

                        {/* Kolom Kuantitas di Pojok Kanan */}
                        <CCol xs="3" className="d-flex justify-content-end">
                          <label style={{ fontSize: '0.8rem', lineHeight: '2' }}>
                            {`${detail.quantity} ${detail.Inventory.Material.uom}`}
                          </label>
                        </CCol>
                      </CRow>
                    ))}
                    <hr style={{ height: '5px', margin: '5px ' }} />
                    <CRow
                      className="mb-1" // Margin bawah antar elemen
                      style={{
                        alignItems: 'center', // Pastikan elemen sejajar secara vertikal
                        justifyContent: 'space-between', // Elemen kiri dan kanan berjarak
                      }}
                    >
                      {/* Kolom Kiri */}
                      <CCol xs="6">
                        {' '}
                        {/* Mengatur List GI & Delivery di sebelah kiri */}
                        <label
                          className="fw-light mb-1"
                          style={{
                            fontSize: '0.85rem', // Ukuran font kecil
                          }}
                        >
                          List GI & Delivery
                        </label>
                      </CCol>

                      {/* Kolom Kanan */}
                      <CCol xs="6" className="text-end">
                        {' '}
                        {/* Payment Method di sebelah kanan */}
                        <label
                          style={{
                            fontSize: '0.85rem', // Ukuran font serupa
                          }}
                        >
                          {selectedOrder.paymentMethod} :
                        </label>
                        <span style={{ marginLeft: '8px' }}>{selectedOrder.paymentNumber}</span>
                      </CCol>
                    </CRow>

                    <hr style={{ height: '5px', margin: '5px ' }} />
                    <label
                      className="fw-light mb-1"
                      style={{
                        fontSize: '0.85rem', // Ukuran font kecil
                      }}
                    >
                      Tracking Item
                    </label>
                    {orderHistory.map((item, index) => {
                      const isFirst = index === 0 // Memeriksa apakah item adalah yang pertama

                      return (
                        <CRow
                          key={item.id}
                          className="mb-3" // Margin bawah antar item
                          style={{
                            alignItems: 'center', // Pastikan elemen rata
                          }}
                        >
                          {/* Kolom Tanggal dan Waktu */}
                          <CCol xs="auto">
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: isFirst ? '#000' : '#6c757d', // Hitam untuk yang pertama, abu-abu untuk lainnya
                              }}
                            >
                              {format(parseISO(item.createdAt), 'dd MMM yyyy')}
                              {', '}
                              {format(parseISO(item.createdAt), 'HH:mm')}
                            </label>
                          </CCol>

                          {/* Kolom Ikon */}
                          <CCol xs="auto">
                            <div
                              style={{
                                border: `2px solid ${isFirst ? '#000' : '#6c757d'}`, // Warna hitam untuk ikon pertama
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <CIcon
                                icon={icons[item.icon]}
                                size="lg"
                                style={{ color: isFirst ? '#000' : '#6c757d' }} // Warna ikon sesuai status
                              />
                            </div>
                          </CCol>

                          {/* Kolom Status */}
                          <CCol>
                            <div
                              style={{
                                fontSize: '0.91rem',
                                textTransform: 'capitalize',
                                color: isFirst ? '#000' : '#495057', // Hitam untuk status pertama, abu-abu gelap untuk lainnya
                              }}
                            >
                              <label style={{ fontSize: '0.96em' }}>{item.status}</label>
                              <div>By : {item.User.name}</div>
                              <div>Remark : {item.remarks}</div>
                            </div>
                          </CCol>
                        </CRow>
                      )
                    })}
                  </CCardBody>
                </CCard>
              </CRow>
            </CModalBody>
          </CModal>
        )}
      </CRow>
      <hr />
      {/* Order By Category */}
      <CRow className="mt-4">
        {isLoading ? (
          // Show Skeleton Loader while loading
          <CRow>
            {[...Array(6)].map((_, index) => (
              <CCol
                key={index}
                xs="12"
                sm="6"
                md="4"
                lg="2"
                style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}
              >
                <CCard style={{ cursor: 'pointer', width: '100%', padding: '1px', margin: '10px' }}>
                  <CCardBody style={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton circle width={30} height={30} style={{ marginRight: '8px' }} />
                    <Skeleton width={60} height={20} />
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        ) : (
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
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    padding: '1px',
                    margin: '7px',
                    backgroundColor:
                      selectedCategory && selectedCategory.id === category.id
                        ? '#E4E0E1' // Warna navy jika kategori terpilih
                        : hoveredCategory === category.id
                          ? '#E4E0E1' // Warna saat hover
                          : index === 0 &&
                              (!selectedCategory || selectedCategory.id === categoriesData[0].id)
                            ? '#E4E0E1' // Warna navy untuk kategori pertama jika belum ada yang dipilih atau kategori pertama dipilih
                            : 'white', // Warna default putih
                    color:
                      selectedCategory && selectedCategory.id === category.id
                        ? 'black' // Warna teks hitam untuk kategori yang dipilih
                        : hoveredCategory === category.id
                          ? 'black' // Warna teks saat hover
                          : index === 0 &&
                              (!selectedCategory || selectedCategory.id === categoriesData[0].id)
                            ? 'black' // Warna teks hitam untuk kategori pertama jika dipilih
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
        )}
      </CRow>
      {/* Daftar Produk */}
      <CRow className="mt-3">
        {isLoading
          ? // Render Skeleton Loader
            [...Array(6)].map((_, index) => (
              <CCol key={index} xs="6" sm="6" md="3" lg="3" xl="2" className="mb-4">
                <CCard className="h-100">
                  <Skeleton
                    height={150}
                    style={{ width: '100%', objectFit: 'contain' }} // Same as the image styles
                  />
                  <CCardBody className="d-flex flex-column justify-content-between">
                    <div>
                      <Skeleton height={20} width="60%" style={{ marginBottom: '8px' }} />
                      <Skeleton height={15} width="40%" />
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
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Skeleton width={90} height={30} />
                        </div>

                        <CCol sm="auto" className="ms-2">
                          <Skeleton circle height={30} width={30} />
                        </CCol>
                      </div>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            ))
          : products.map((product, index) => (
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
                    src={`${config.BACKEND_URL}${product.Material.img}`}
                    alt={product.Material.description}
                    style={{
                      width: '100%', // Ensure it takes the full width
                      height: '150px', // Fixed height for uniformity
                      objectFit: 'contain', // Keep the aspect ratio
                    }}
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
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          }}
                        >
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
                            onClick={() => handleToggleWishlistProduct(product)}
                            style={{
                              backgroundColor: 'transparent', // No background for the button
                              border: 'black', // Menghilangkan border default button
                              padding: '0', // No padding, membuat button sekecil ikon
                              outline: 'none', // Menghapus outline pada focus button
                            }}
                          >
                            <AiFillHeart
                              onMouseEnter={() => setHoveredItemId(product.id)} // Simpan ID item saat di-hover
                              onMouseLeave={() => setHoveredItemId(null)} // Hapus hover ID saat kursor meninggalkan
                              style={{
                                color:
                                  hoveredItemId === product.id && !isInWishlist(product.id)
                                    ? 'red' // Warna merah saat di-hover
                                    : isInWishlist(product.id)
                                      ? 'red' // Warna merah jika sudah ada di wishlist
                                      : 'white', // Warna default putih
                                stroke: 'black', // Garis luar hitam
                                strokeWidth: '15px', // Tebal garis luar
                                cursor: 'pointer', // Menunjukkan bahwa ikon bisa diklik
                              }}
                              size={20} // Ukuran ikon
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
          <CButton color="primary" variant="outline" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}
      {/* )} */}

      {selectedProduct && (
        <CModal visible={modalOrder} onClose={handleCloseModalOrder}>
          <CModalHeader>Add Item to Cart</CModalHeader>
          <CModalBody>
            <CRow>
              <CCol md="4">
                {selectedProduct && (
                  <CImage
                    src={`${config.BACKEND_URL}${selectedProduct.Inventory ? selectedProduct.Inventory.Material.img : selectedProduct.Material.img}`}
                    alt={
                      selectedProduct.Inventory
                        ? selectedProduct.Inventory.Material.description
                        : selectedProduct.Material.description
                    }
                    fluid
                    className="rounded"
                  />
                )}
              </CCol>
              <CCol md="8">
                <div>
                  <label style={{ fontWeight: 'bold' }}>
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.description
                      : selectedProduct.Material.description}
                  </label>
                </div>

                <div>
                  <label style={{ fontWeight: 'lighter' }}>
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.materialNo
                      : selectedProduct.Material.materialNo}
                  </label>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.85rem' }}>
                    Min Order:{' '}
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.minOrder
                      : selectedProduct.Material.minOrder}{' '}
                    {''}
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.uom
                      : selectedProduct.Material.uom}
                  </label>
                </div>

                <div className="d-flex align-items-center">
                  <CButton
                    color="primary"
                    onClick={handleDecrease}
                    style={{
                      backgroundColor: 'white',
                      color: '#219fee',
                      border: '1px solid #219fee',
                    }}
                  >
                    -
                  </CButton>

                  <CFormInput
                    type="text"
                    value={quantity}
                    className="w-25 text-center border-0"
                    readOnly
                  />

                  <CButton
                    color="primary"
                    onClick={handleIncrease}
                    style={{
                      backgroundColor: 'white',
                      color: '#219fee',
                      border: '1px solid #219fee',
                    }}
                  >
                    +
                  </CButton>

                  <span className="mx-3 fw-light">
                    ({' '}
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.minOrder
                      : selectedProduct.Material.minOrder}{' '}
                    {''})
                  </span>
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
