import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AiFillHeart } from 'react-icons/ai'
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
import { cilCart, cilClipboard, cilHeart } from '@coreui/icons'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import { GlobalContext } from '../../context/GlobalProvider'
import useCartService from '../../services/CartService'
import useOrderService from '../../services/OrderService'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ProductList = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getMasterData } = useMasterDataService()
  const { getProduct, getProductByQuery, getProductByCategory } = useProductService()
  const { deleteWishlist, addWishlist, getWishlist } = useOrderService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { getCart, postCart, updateCart, deleteCart } = useCartService()
  const [modalOrder, setModalOrder] = useState(false)
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [products, setProducts] = useState([])
  const [visibleCount, setVisibleCount] = useState(12)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const location = useLocation() // Ambil informasi
  const { warehouse, wishlist, setWishlist, cartCount, setCartCount, cart, setCart } =
    useContext(GlobalContext)

  const MySwal = withReactContent(Swal)

  const apiCategory = 'category'
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('q') // Ambil parameter 'q'
    const categoryId = params.get('id')

    if (warehouse && warehouse.id) {
      if (query) {
        getProductByQueries(query)
      } else if (categoryId) {
        setProductsData([])
        getProductByCategories(categoryId, 1)
      } else {
        getProducts()
      }
    }

    getCategories()
  }, [location, warehouse])

  const getProducts = async () => {
    try {
      const response = await getProduct(warehouse.id)
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Fungsi untuk mendapatkan produk berdasarkan query
  const getProductByQueries = async (query, page) => {
    try {
      const response = await getProductByQuery(warehouse.id, query, page)
      if (!response.data) {
        console.error('No products found')
        setProductsData([])
        return
      }
      const newProducts = response.data
      setProductsData((prevProducts) => [...prevProducts, ...newProducts])
      setHasMore(newProducts.length === 25) // Misalkan limit per halaman adalah 24
    } catch (error) {
      console.error('Error fetching products by query:', error)
    }
  }

  const getCategories = async () => {
    const response = await getMasterData(apiCategory)
    setCategoriesData(response.data)
  }

  const getProductByCategories = async (categoryId, page) => {
    try {
      const response = await getProductByCategory(warehouse.id, categoryId, page)
      const newProducts = response.data

      setProductsData((prevProducts) => [...prevProducts, ...newProducts])

      // Set 'hasMore' berdasarkan apakah ada produk yang tersisa untuk di-load
      setHasMore(newProducts.length === 24) // Misalkan limit per halaman adalah 24
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const calculateStockStatus = (product) => {
    const { quantityActualCheck } = product
    const { minStock, maxStock } = product.Material
    if (quantityActualCheck == null) return 'Out of Stock'
    if (quantityActualCheck > maxStock) return 'In Stock'
    if (quantityActualCheck <= minStock) return 'Low Stock'
    return 'Out of Stock'
  }

  const filteredProducts = productsData.filter((product) =>
    product.Material.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      // Jika produk sudah ada di wishlist (unlove), lakukan DELETE
      try {
        await deleteWishlist(product.id)
        // Update state wishlist di frontend setelah berhasil menghapus dari database
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.Inventory.id !== product.id),
        )
        MySwal.fire('Success', 'Product removed from wishlist', 'success')
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

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Inventory.id === productId)
  }

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)

    // setVisibleCount(visibleCount + 12) // Load 12 more products
    const params = new URLSearchParams(location.search)
    const query = params.get('q') // Ambil parameter 'q'
    const categoryId = params.get('id')

    if (warehouse && warehouse.id) {
      if (query) {
        getProductByQueries(query, nextPage)
      } else if (categoryId) {
        // setProductsData([])
        getProductByCategories(categoryId, nextPage)
      } else {
        getProducts()
      }
    }
  }

  // const handleAddToCart = (product, quantity) => {
  //   const existingProduct = cart.find((item) => item.id === product.Material.id)
  //   if (existingProduct) {
  //     const updatedCart = cart.map((item) =>
  //       item.id === product.Material.id ? { ...item, quantity: item.quantity + quantity } : item,
  //     )
  //     setCart(updatedCart)
  //   } else {
  //     setCart([...cart, { ...product, quantity }])
  //   }
  //   setCartCount(cartCount + quantity)
  //   setModalOrder(false)
  //   navigate('/cart') // Navigate to the cart page
  // }

  const handleAddToCart = async (product, quantity) => {
    try {
      // Find the existing product in the cart by matching inventoryId
      const existingProduct = cart.find((item) => item.Inventory.materialId === product.Material.id)
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

  return (
    <>
      {productsData.length === 0 && <div>Product not found...</div>}
      <CRow>
        {productsData.map((product, index) => (
          <CCol
            xs="6"
            sm="6"
            md="3"
            lg="4"
            xl="2"
            key={`${product.Material.id}-${index}`}
            className="mb-3"
          >
            <CCard className="h-100">
              <CCardImage
                orientation="top"
                src={'https://via.placeholder.com/150'}
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
                          <CBadge textBgColor="light">Out of Stock</CBadge>
                        </CCol>
                      )} */}

                      {/* {calculateStockStatus(product) !== 'Out of Stock' && ( */}
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
                      {/* <CButton
                        onClick={() => handleToggleWishlist(product.Material.id)}
                        style={{
                          backgroundColor: isInWishlist(product.Material.id) ? 'red' : 'white',

                          color: isInWishlist(product.Material.id) ? 'white' : 'black',
                        }}
                      >
                        <CIcon
                          icon={cilHeart}
                          className={isInWishlist(product.Material.id)}
                          size="lg"
                        />
                      </CButton> */}
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

      {/* {visibleCount < products.length && ( */}
      {hasMore && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}
      {/* modal add to cart */}
      {selectedProduct && (
        <CModal visible={modalOrder} onClose={handleCloseModalOrder}>
          <CModalHeader>Add to Cart</CModalHeader>
          <CModalBody>
            <CRow>
              <CCol md="4">
                <CImage
                  src={'https://via.placeholder.com/150'}
                  alt={selectedProduct.Material.description}
                  fluid
                  className="rounded"
                />
              </CCol>
              <CCol md="8">
                <strong>{selectedProduct.Material.description}</strong>
                <p> {selectedProduct.Material.materialNo}</p>
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

                  <span className="px-2"> ({selectedProduct.Material.uom})</span>
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

export default ProductList
