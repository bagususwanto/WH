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
} from '@coreui/react'
import useCartService from '../../services/CartService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import config from '../../utils/Config'

const Wishlist = () => {
  const [productsData, setProductsData] = useState([])
  const { getWishlist, clearWishlist } = useOrderService()
  const [wishlistData, setWishlistData] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOrder, setModalOrder] = useState(false)
  const minOrder = selectedProduct?.Material?.minOrder;
  const [quantity, setQuantity] = useState(minOrder);
  const [isAdjustMode, setIsAdjustMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const { postCart, updateCart } = useCartService()

  const { warehouse, cart, setCart, cartCount, setCartCount } = useContext(GlobalContext)

  const MySwal = withReactContent(Swal)

  const navigate = useNavigate()

  const getFavorite = async () => {
    try {
      const response = await getWishlist(warehouse.id)
      setWishlistData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getFavorite()
    }
  }, [warehouse])

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setQuantity(product.Material?.minOrder || 1);
    setModalOrder(true)
  }

  const handleCloseModalOrder = () => {
    setModalOrder(false)
    setQuantity(1)
  }

  const handleAddToCart = async (product, quantity) => {
    try {
      // Cek inventoryId yang sesuai dari product
      const inventoryId = product.Inventory ? product.Inventory.id : product.id
      console.log('cart', cart)

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
                      border: '1px solid #219fee', // Optional: if you want a border with the same color as the text
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
                      border: '1px solid #219fee', // Optional: if you want a border with the same color as the text
                    }}
                  >
                    +
                  </CButton>
                  <span className="mx-3 fw-light">
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

export default Wishlist
