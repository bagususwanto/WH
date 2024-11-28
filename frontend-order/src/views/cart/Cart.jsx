import React, { useEffect, useState, useContext } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import '../../scss/stickyfooter.scss'
import config from '../../utils/Config'
import { CCard, CCardBody, CCardImage, CButton, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import useManageStockService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useCartService from '../../services/CartService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// Icon mapping based on your category names

const Cart = () => {
  const [cartData, setCartData] = useState([])
  const { checkout } = useOrderService()
  const [debouncedQuantities, setDebouncedQuantities] = useState({})
  const { getCart, postCart, updateCart, deleteCart } = useCartService()
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [quantities, setQuantities] = useState({})

  const [isLoading, setIsLoading] = useState(true) // Track loading state

  const [modalVisible, setModalVisible] = useState(false)
  const MySwal = withReactContent(Swal)

  const [currentProducts, setCurrentProducts] = useState([])
  const { warehouse, setCart, setCartCount } = useContext(GlobalContext)

  const navigate = useNavigate()

  const getCarts = async () => {
    try {
      const response = await getCart(warehouse.id)
      setCartData(response.data)
      setIsLoading(false) // Data finished loading
    } catch (error) {
      console.error('Error fetching cart:', error)
      setIsLoading(false) // In case of error, set loading to false
    }
  }

  const checkouts = async () => {
    try {
      const cartIds = cartData.map((item) => item.id)
      const response = await checkout({ cartIds: cartIds }, warehouse.id)

      navigate('/confirmrec', { state: { verifiedCartItems: response.data } })
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleDeleteCart = async (productId) => {
    const MySwal = withReactContent(Swal)
    // Show confirmation dialog
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true, // This option will reverse the positions of the buttons
    })
    // Proceed with deletion if confirmed
    if (result.isConfirmed) {
      try {
        await deleteCart(productId, warehouse.id)
        setCartData(cartData.filter((product) => product.id !== productId))
        setCartCount(cartData.length - 1)
        setCart(cartData.filter((product) => product.id !== productId))
        MySwal.fire('Deleted!', 'Your item has been deleted.', 'success')
      } catch (error) {
        console.error('Error deleting cart:', error)
      }
    }
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getCarts()
    }
  }, [warehouse])

  // Debounce Effect to Batch API Requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuantities(quantities)
    }, 500) // Debounce delay of 500ms

    return () => clearTimeout(timer)
  }, [quantities])

  useEffect(() => {
    const updateServerQuantities = async () => {
      for (const productId in debouncedQuantities) {
        const quantity = debouncedQuantities[productId]
        try {
          const updateCartItem = {
            inventoryId: productId,
            quantity: quantity,
          }
          await updateCart(updateCartItem, warehouse.id)
        } catch (error) {
          console.error(`Error updating product ${productId}:`, error)
        }
      }
    }

    if (Object.keys(debouncedQuantities).length > 0) {
      updateServerQuantities()
    }
  }, [debouncedQuantities, updateCart])

  const handleDeleteAll = async () => {
    const MySwal = withReactContent(Swal) // Make sure to initialize MySwal

    // Show confirmation dialog
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true, // This option will reverse the positions of the buttons
    })

    // Proceed only if confirmed
    if (result.isConfirmed) {
      try {
        // Call the API to delete all cart items
        await Promise.all(cartData.map((product) => deleteCart(product.id, warehouse.id)))

        // Clear the cart data in state
        setCartData([])
        setCart([])
        setCartCount(0)
        // Show success message
        MySwal.fire({
          title: 'Success!',
          text: 'All items have been successfully deleted from your cart.',
          icon: 'success',
          confirmButtonText: 'OK',
        })
      } catch (error) {
        console.error('Error deleting all cart items:', error)
      }
    }
  }

  // Total harga produk
  // useEffect(() => {
  //   const newTotal = cartData.reduce((acc, product) => {
  //     if (checkedItems[product.id]) {
  //       const quantity = quantities[product.id] || product.quantity
  //       return acc + product.Inventory.Material.price * quantity
  //     }
  //     return acc
  //   }, 0)
  //   setTotalAmount(newTotal)
  // }, [checkedItems, quantities, cartData])

  // const handleIncreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => ({
  //     ...prevQuantities,
  //     [productId]:
  //       (prevQuantities[productId] || cartData.find((p) => p.id === productId).quantity) + 1,
  //   }))
  // }

  // const handleDecreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => ({
  //     ...prevQuantities,
  //     [productId]: Math.max(
  //       (prevQuantities[productId] || cartData.find((p) => p.id === productId).quantity) - 1,
  //       1,
  //     ),
  //   }))
  // }

  // Handle Increase and Decrease Quantity
  const handleIncreaseQuantity = (inventoryId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [inventoryId]:
        (prevQuantities[inventoryId] ||
          cartData.find((p) => p.inventoryId === inventoryId).quantity) + 1,
    }))
  }

  const handleDecreaseQuantity = (inventoryId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [inventoryId]: Math.max(
        (prevQuantities[inventoryId] ||
          cartData.find((p) => p.inventoryId === inventoryId).quantity) - 1,
        1,
      ),
    }))
  }
  const handleCheckout = () => {
    MySwal.fire({
      title: 'Confirm Checkout',
      text: 'Are you sure you want to proceed to checkout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel',
      reverseButtons: true, // This option will reverse the positions of the buttons
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika pengguna mengonfirmasi, panggil fungsi checkout
        checkouts()
      }
    })
  }

  const totalQuantity = cartData.reduce((acc, product) => {
    // Check if the product's inventoryId has already been added to the accumulator
    if (!acc.includes(product.inventoryId)) {
      acc.push(product.inventoryId)
    }
    return acc
  }, []).length // Return the length of the array which holds distinct inventoryIds

  const handleCancel = () => {
    setModalVisible(false)
  }
  return (
    <>
      <CRow className="mt-1">
        <CCard style={{ border: 'none' }}>
          <h3 className="fw-bold fs-3">Your Cart</h3>
          <div
            className="ms-auto"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            {/* <CFormCheck
              id="flexCheckDefault"
              label="Confirm All"
              checked={selectAll}
              onChange={handleSelectAllChange}
            /> */}
            <CButton
              color="danger"
              onClick={handleDeleteAll}
              className="btn-sm p-1 mb-1 text-white" // CoreUI class names
            >
              Delete All
            </CButton>
          </div>

          <CRow className="g-1">
            {isLoading
              ? // Render skeleton loaders when loading is true
                [...Array(5)].map((_, index) => (
                  <CCard className="h-70" key={index}>
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center" style={{ height: '100%' }}>
                        {/* Image Column */}
                        <CCol xs="2" className="d-flex justify-content-center align-items-center">
                          <Skeleton height={82} width="43%" />
                        </CCol>

                        {/* Description Column */}
                        <CCol xs="6" className="d-flex flex-column justify-content-start">
                          <div>
                            <Skeleton width="80%" height={20} />
                            <Skeleton width="60%" height={20} />
                          </div>
                        </CCol>

                        {/* Quantity Column */}
                        <CCol xs="2" className="d-flex justify-content-center align-items-center">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <CButton color="secondary" variant="outline" size="sm" disabled>
                              <Skeleton width={12} />
                            </CButton>
                            <span className="mx-3">
                              <Skeleton width={30} />
                            </span>
                            <CButton color="secondary" variant="outline" size="sm" disabled>
                              <Skeleton width={12} />
                            </CButton>
                            <span className="px-2">
                              <Skeleton width={40} />
                            </span>
                          </div>
                        </CCol>

                        {/* Delete Column */}
                        <CCol xs="1" className="d-flex justify-content-end align-items-center">
                          <Skeleton circle width={30} height={30} />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))
              : // Render actual cart data when loading is false
                cartData.map((product, index) => (
                  <CCard className="h-70" key={index}>
                    {/* Fixed card height */}
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center" style={{ height: '90%' }}>
                        {/* Image Column */}
                        <CCol xs="2" className="d-flex justify-content-center align-items-center">
                          <CCardImage
                            src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
                            alt={product.Inventory.Material.description}
                            style={{
                              width: '100%', // Ensure it takes the full width
                              height: '150px', // Fixed height for uniformity
                              objectFit: 'contain', // Keep the aspect ratio
                            }}
                          />
                        </CCol>

                        {/* Description Column */}
                        <CCol xs="6" className="d-flex flex-column justify-content-start">
                          <div>
                            <label className="fw-bold fs-6">
                              {product.Inventory.Material.description}
                            </label>
                            <br />
                            <label>{product.Inventory.Material.materialNo}</label>
                          </div>
                        </CCol>

                        {/* Quantity Column */}
                        <CCol xs="2" className="d-flex justify-content-center align-items-center">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <CButton
                              color="secondary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecreaseQuantity(product.inventoryId)}
                            >
                              -
                            </CButton>
                            <span className="mx-3">
                              {quantities[product.inventoryId] || product.quantity}
                            </span>
                            <CButton
                              color="secondary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleIncreaseQuantity(product.inventoryId)}
                            >
                              +
                            </CButton>
                            <span className="px-2">
                              ({product.Inventory.Material?.uom || 'UOM'})
                            </span>
                          </div>
                        </CCol>

                        {/* Delete Column */}
                        <CCol xs="1" className="d-flex justify-content-end align-items-center">
                          <CIcon
                            icon={cilTrash}
                            className="text-danger"
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteCart(product.id)}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
          </CRow>
        </CCard>
      </CRow>

      {/* Sticky Footer */}
      <div className="sticky-footer">
        <h5>Total Item: {totalQuantity}</h5>
        <CButton color="primary" onClick={handleCheckout}>
          Checkout
        </CButton>
      </div>
    </>
  )
}

export default Cart
