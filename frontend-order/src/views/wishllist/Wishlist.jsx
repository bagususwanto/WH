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
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import config from '../../utils/Config'

const Wishlist = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { getWishlist, clearWishlist } = useOrderService()
  const [wishlistData, setWishlistData] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [isAdjustMode, setIsAdjustMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  const { warehouse, wishlist } = useContext(GlobalContext)

  const MySwal = withReactContent(Swal)

  const apiCategory = 'category-public'
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
    return wishlist.some((item) => item.id === productId)
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

  // Toggle mode Adjust
  const handleAdjustToggle = () => {
    setIsAdjustMode(!isAdjustMode)
    // Reset selected items jika keluar dari Adjust Mode
    if (isAdjustMode) {
      setSelectedItems([])
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (productId) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter((id) => id !== productId)
      } else {
        return [...prevSelected, productId]
      }
    })
  }

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      MySwal.fire('Error', 'Please select products to delete.', 'error')
      return
    }

    // Tampilkan dialog konfirmasi
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete the selected items?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete them!',
      reverseButtons: true, // Membalik posisi tombol
    })

    // Jika pengguna menekan tombol "Yes"
    if (result.isConfirmed) {
      try {
        await clearWishlist({ inventoryIds: selectedItems })
        MySwal.fire('Deleted!', 'Selected products have been deleted.', 'success')

        // Kosongkan selectedItems setelah penghapusan berhasil
        setSelectedItems([])

        getFavorite()
      } catch (error) {
        console.error('Error deleting products:', error)
        MySwal.fire('Error', 'Failed to delete selected products.', 'error')
      }
    }
  }

  return (
    <>
      <CRow className="mb-2">
        <p>
          {!isAdjustMode && (
            <>
              <span className="me-2 fw-bold">{wishlistData ? wishlistData.length : 0}</span>
              Item
              <CButton
                size="sm"
                className="ms-2 me-2 text-primary fw-bold"
                onClick={handleAdjustToggle}
              >
                Adjust
              </CButton>
            </>
          )}
          {isAdjustMode && (
            <>
              <CButton
                size="sm"
                color="danger"
                className="text-white ms-2"
                disabled={selectedItems.length === 0}
                onClick={handleDelete}
              >
                Delete ({selectedItems.length})
              </CButton>
              <CButton
                size="sm"
                className="ms-2 me-2 text-primary fw-bold"
                onClick={handleAdjustToggle}
              >
                Cancel
              </CButton>
            </>
          )}
        </p>
      </CRow>

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
              {/* Checkbox di pojok kanan atas jika dalam mode adjust */}
              {isAdjustMode && (
                <input
                  type="checkbox"
                  className="position-absolute"
                  style={{
                    right: '10px',
                    top: '10px',
                    width: '20px',
                    height: '20px',
                    transform: 'scale(0.9)',
                  }}
                  onChange={() => handleCheckboxChange(product.Inventory.id)} // Handle checkbox click
                />
              )}

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
                  <CCol sm="auto">
                    <CButton
                      className="box btn-sm"
                      color="primary"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '10px' }}
                      onClick={() => handleModalCart(product)}
                    >
                      Add to Cart
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

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
                <p>{selectedProduct.Inventory.Material.materialNo}</p>
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
