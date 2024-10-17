import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

const ProductList = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getMasterData } = useMasterDataService()
  const { getProduct, getProductByQuery } = useProductService()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { getCart, postCart, updateCart, deleteCart } = useCartService()
  const [modalOrder, setModalOrder] = useState(false)
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlist, setWishlist] = useState(new Set())
  const [visibleCount, setVisibleCount] = useState(12)

  const location = useLocation() // Ambil informasi
  const { warehouse } = useContext(GlobalContext)

  const apiCategory = 'category'
  const navigate = useNavigate()

  const getCarts = async () => {
    try {
      const response = await getCart(warehouse.id)
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('q') // Ambil parameter 'q'

    if (warehouse && warehouse.id) {
      if (query) {
        getProductByQueries(query)
      } else {
        getProducts()
      }
      getCarts()
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
  const getProductByQueries = async (query) => {
    try {
      const response = await getProductByQuery(warehouse.id, query)
      if (!response.data) {
        console.error('No products found')
        setProductsData([])
        return
      }
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching products by query:', error)
    }
  }

  const getCategories = async () => {
    const response = await getMasterData(apiCategory)
    setCategoriesData(response.data)
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

  const handleToggleWishlist = (productId) => {
    const updatedWishlist = new Set(wishlist)
    updatedWishlist.has(productId)
      ? updatedWishlist.delete(productId)
      : updatedWishlist.add(productId)
    setWishlist(updatedWishlist)
  }

  const isInWishlist = (productId) => wishlist.has(productId)

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }
  const handleLoadMore = () => {
    setVisibleCount(visibleCount + 20) // Load 12 more products
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
    console.log('tes', product)
    try {
      // Find the existing product in the cart by matching inventoryId
      const existingProduct = cart.find((item) => item.Inventory.materialId === product.Material.id)
      console.log('-', existingProduct)
      if (existingProduct) {
        // If product exists in the cart, update the quantity
        const updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + quantity,
        }
        console.log('1231414', product.id)

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

      // Navigate to the cart page
      navigate('/cart')
    } catch (error) {
      // Handle error
      console.error('Failed to add to cart:', error)
    }
  }

  return (
    <>
      {productsData.length === 0 && <div>Product not found...</div>}
      <CRow>
        {filteredProducts.slice(0, allVisible ? filteredProducts.length : 18).map((product) => (
          <CCol xs="6" sm="6" md="3" lg="4" xl="2" key={product.Material.id} className="mb-3">
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
                      {/* Show "Out of Stock" badge if applicable */}
                      {calculateStockStatus(product) === 'Out of Stock' && (
                        <CCol sm="auto" className="mb-1">
                          <CBadge textBgColor="light">Out of Stock</CBadge>
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
                        color="black"
                        onClick={() => handleToggleWishlist(product.Material.id)}
                        style={{
                          backgroundColor: isInWishlist(product.Material.id) ? 'red' : 'white',
                          border: '1px solid gray',
                          color: isInWishlist(product.Material.id) ? 'white' : 'black',
                          borderRadius: '50%',
                        }}
                      >
                        <CIcon
                          icon={cilHeart}
                          className={isInWishlist(product.Material.id)}
                          size="lg"
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
