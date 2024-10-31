import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { AiFillHeart } from 'react-icons/ai'
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
  cilPencil,
  cilFactory,
  cilPaintBucket,
  cilFootball,
  cilCut,
  cilTags,
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
  const { getWishlist, deleteWishlist, addWishlist, getMyorder } = useOrderService()
  const { postCart, updateCart } = useCartService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleCount, setVisibleCount] = useState(20)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [products, setProducts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const { warehouse, wishlist, setWishlist, cart, setCart, cartCount, setCartCount } =
    useContext(GlobalContext)

  const MySwal = withReactContent(Swal)

  const navigate = useNavigate()

  const apiCategory = 'category-public'

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
      const response = await getMyorder(warehouse.id, 'all')
      setMyOrderData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
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

  const handleAddToCart = async (product, quantity) => {
    try {
      // Find the existing product in the cart by matching inventoryId
      const existingProduct = cart.find((item) =>
        item.Inventory.materialId === product.Inventory
          ? product.Inventory.materialId
          : product.materialId,
      )
      if (existingProduct) {
        // If product exists in the cart, update the quantity
        const updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + quantity,
        }

        // Update the cart with the new quantity (use API updateCart)
        const updatedCartResponse = await updateCart({
          inventoryId: product.id,
          quantity: updatedProduct.quantity,
        })
        if (updatedCartResponse) {
          // Update the cart state with the updated product
          setCart(cart.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
        }
      } else {
        // If product doesn't exist in the cart, add a new product
        const newCartItem = {
          inventoryId: product.id,
          quantity: quantity,
        }

        const arraycartIds = []

        // Post the new cart item to the API (use postCart)
        const addToCartResponse = await postCart(newCartItem)
        if (addToCartResponse) {
          // Add the new product to the cart state
          setCart([...cart, { ...newCartItem, Inventory: product.Inventory }])
        }
      }

      // Update cart count
      setCartCount(cartCount + quantity)
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
          // Navigasi ke halaman wishlist
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
        await deleteWishlist(product.Inventory.id)
        // Update state wishlist di frontend setelah berhasil menghapus dari database
        setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== product.id))
        MySwal.fire('Success', 'Product removed from wishlist', 'success')
      } catch (error) {
        console.error('Error removing product from wishlist:', error)
      }
    } else {
      // Jika produk belum ada di wishlist (love), lakukan POST
      try {
        await addWishlist({ inventoryId: product.Inventory.id })
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
        await deleteWishlist(product.id)
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
        await addWishlist({ inventoryId: product.id })
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
                    src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
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
                      src={`${config.BACKEND_URL}${product.Material.img}`}
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
                src={`${config.BACKEND_URL}${product.Material.img}`}
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
                        onClick={() => handleToggleWishlistProduct(product)}
                        style={{
                          backgroundColor: 'transparent', // No background for the button
                          border: 'black', // Menghilangkan border default button
                          padding: '0', // No padding, membuat button sekecil ikon
                          outline: 'none', // Menghapus outline pada focus button
                        }}
                      >
                        <AiFillHeart
                          style={{
                            color: isInWishlistProduct(product.id) ? 'red' : 'white', // Ubah warna ikon sesuai status wishlist
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
                  src={`${config.BACKEND_URL}${selectedProduct.Material.img}`}
                  alt={selectedProduct.Material.description}
                  fluid
                  className="rounded"
                />
              </CCol>
              <CCol md="8">
                <strong>
                  {selectedProduct.Inventory
                    ? selectedProduct.Inventory.Material.description
                    : selectedProduct.Material.description}
                </strong>
                <p>
                  {selectedProduct.Inventory
                    ? selectedProduct.Inventory.Material.materialNo
                    : selectedProduct.Material.materialNo}
                </p>
                <div className="d-flex align-items-center">
                  <CButton
                    color="primary"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  >
                    -
                  </CButton>
                  <span className="mx-3">{quantity}</span>
                  <CButton color="primary" onClick={() => setQuantity((prev) => prev + 1)}>
                    +
                  </CButton>
                  <span className="mx-3">
                    (
                    {selectedProduct.Inventory
                      ? selectedProduct.Inventory.Material.uom
                      : selectedProduct.Material.uom}
                    )
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
