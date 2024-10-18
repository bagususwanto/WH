import React, { useEffect, useState, useContext } from 'react'
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
import { cilCart, cilClipboard, cilHeart } from '@coreui/icons'
import useManageStockService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'
import { AiFillHeart } from 'react-icons/ai'

const Wishlist = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { getWishlist } = useOrderService()
  const [wishlistData, setWishlistData] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)

  const { warehouse, wishlist } = useContext(GlobalContext)

  const apiCategory = 'category'
  const navigate = useNavigate()

  const getFavorite = async () => {
    try {
      const response = await getWishlist(warehouse.id)
      setWishlistData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const getCategories = async () => {
    const response = await getMasterData(apiCategory)
    setCategoriesData(response.data)
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getFavorite()
    }
    getCategories()
  }, [warehouse])

  // const calculateStockStatus = (product) => {
  //   const { quantityActualCheck } = product
  //   const { minStock, maxStock } = product.Material
  //   if (quantityActualCheck == null) return 'Out of Stock'
  //   if (quantityActualCheck > maxStock) return 'In Stock'
  //   if (quantityActualCheck <= minStock) return 'Low Stock'
  //   return 'Out of Stock'
  // }

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

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Inventory.Material.id === productId)
  }

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalOrder(true)
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }

  const handleAddToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.id === product.Material.id)
    if (existingProduct) {
      const updatedCart = cart.map((item) =>
        item.id === product.Material.id ? { ...item, quantity: item.quantity + quantity } : item,
      )
      setCart(updatedCart)
    } else {
      setCart([...cart, { ...product, quantity }])
    }
    setCartCount(cartCount + quantity)
    setModalOrder(false)
    navigate('/cart') // Navigate to the cart page
  }

  return (
    <>
      <CRow>
        {wishlistData.map((product) => (
          <CCol
            xs="6"
            sm="6"
            md="3"
            lg="3"
            xl="2"
            key={product.Inventory.Material.id}
            className="mb-4"
          >
            <CCard className="h-100">
              <CCardImage
                orientation="top"
                src={product.Inventory.Material.img || 'https://via.placeholder.com/150'}
                alt={product.Inventory.Material.description}
                style={{ height: '150px', objectFit: 'cover' }}
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
                  {/* <CCol sm="auto" className="mb-2">
                    <CBadge
                      color={calculateStockStatus(product) === 'Out of Stock' ? 'primary' : ''}
                    >
                      {calculateStockStatus(product)}
                    </CBadge>
                  </CCol> */}

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

                  <CCol sm="auto" className="ms-2">
                    <CButton
                      onClick={() => handleToggleWishlist(product.Inventory.Material.id)}
                      style={{
                        backgroundColor: 'transparent', // No background for the button
                        border: 'black', // Menghilangkan border default button
                        padding: '0', // No padding, membuat button sekecil ikon
                        outline: 'none', // Menghapus outline pada focus button
                      }}
                    >
                      <AiFillHeart
                        style={{
                          color: isInWishlist(product.Inventory.Material.id) ? 'red' : 'white', // Ubah warna ikon sesuai status wishlist
                          stroke: 'black', // Menambahkan efek garis luar (outline) hitam pada ikon
                          strokeWidth: '15px', // Tebal garis luar
                        }}
                        size={20} // Ukuran ikon
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
                  src={selectedProduct.Inventory.Material.img || 'https://via.placeholder.com/150'}
                  alt={selectedProduct.Inventory.Material.description}
                  fluid
                  className="rounded"
                />
              </CCol>
              <CCol md="8">
                <strong>{selectedProduct.Inventory.Material.description}</strong>
                <p>Rp {selectedProduct.Inventory.Material.price.toLocaleString('id-ID')}</p>
                <div className="d-flex align-items-center">
                  <CButton
                    color="primary"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  >
                    -
                  </CButton>
                  <span className="mx-3">
                    {quantity} ({selectedProduct.Inventory.Material.uom})
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

export default Wishlist
