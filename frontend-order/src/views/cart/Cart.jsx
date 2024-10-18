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
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
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
  cilTrash,
} from '@coreui/icons'
import useManageStockService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useCartService from '../../services/CartService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'

// Icon mapping based on your category names

const Cart = () => {
  const [cartData, setCartData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { checkout } = useOrderService()
  const [debouncedQuantities, setDebouncedQuantities] = useState({})
  const { getCart, postCart, updateCart, deleteCart } = useCartService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [quantities, setQuantities] = useState({})

  const [modalVisible, setModalVisible] = useState(false)

  const [currentProducts, setCurrentProducts] = useState([])
  const { warehouse } = useContext(GlobalContext)

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getCarts = async () => {
    try {
      const response = await getCart(warehouse.id)
      setCartData(response.data)
      console.log(cartData)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const checkouts = async () => {
    try {
      const response = await checkout({ cartIds: [18] })
      console.log(response)

      navigate('/confirmrec', { state: { verifiedCartItems: response.data } })
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleDeleteCart = async (productId) => {
    try {
      console.log(productId)
      await deleteCart(productId)
      setCartData(cartData.filter((product) => product.id !== productId))
    } catch (error) {
      console.error('Error deleting cart:', error)
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
          await updateCart(updateCartItem)
          console.log(`Updated product ${productId} to quantity ${quantity}`)
        } catch (error) {
          console.error(`Error updating product ${productId}:`, error)
        }
      }
    }

    if (Object.keys(debouncedQuantities).length > 0) {
      updateServerQuantities()
    }
  }, [debouncedQuantities, updateCart])

  const handleDeleteAll = () => {
    setCurrentProducts([])
  }
  // Total harga produk
  // Total harga produk
  useEffect(() => {
    const newTotal = cartData.reduce((acc, product) => {
      if (checkedItems[product.id]) {
        const quantity = quantities[product.id] || product.quantity
        return acc + product.Inventory.Material.price * quantity
      }
      return acc
    }, 0)
    setTotalAmount(newTotal)
  }, [checkedItems, quantities, cartData])

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
    setModalVisible(true)
  }

  const handleConfirm = () => {
    setModalVisible(false)
    checkouts()
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  return (
    <>
      <CRow className="mt-3">
        <CCard style={{ border: 'none' }}>
          <h3 className="fw-bold fs-4">Your Cart</h3>
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
              className="btn-sm p-1 mb-2 text-white" // CoreUI class names
            >
              Delete All
            </CButton>
          </div>

          <CRow className="g-2">
            {cartData.map((product, index) => (
              <CCard className="h-80" key={index}>
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CRow className="align-items-center">
                    {/* <CCol xs="1">
                      <CFormCheck
                        id={`product-checkbox-${product.id}`}
                        checked={checkedItems[product.id] || false}
                        onChange={() =>
                          handleCheckboxChange(product.id, product.Iventory.Material.price)
                        }
                      />
                    </CCol> */}
                    <CCol xs="2">
                      <CCardImage
                        src={product.Inventory.Material.img || 'https://via.placeholder.com/150'}
                        alt={product.Inventory.Material.description}
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </CCol>
                    <CCol xs="6">
                      <div>
                        <label className="fw-bold fs-6">
                          {product.Inventory.Material.description}
                        </label>
                        <br></br>
                        <label>{product.Inventory.Material.materialNo}</label>
                      </div>
                    </CCol>
                    <CCol xs="2">
                      <div
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
                        <span className="px-2">({product.Inventory.Material?.uom || 'UOM'})</span>
                      </div>
                    </CCol>

                    <CCol xs="1" className="d-flex justify-content-end align-items-center">
                      <CIcon
                        icon={cilTrash}
                        className="text-danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteCart(product.id)}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ))}
          </CRow>

          {/* Sticky Footer */}
          <div className="p-3 bg-light shadow-sm sticky-bottom d-flex justify-content-between align-items-center">
            <h5>Total: Rp {totalAmount.toLocaleString('id-ID')}</h5>
            <CButton color="primary" onClick={handleCheckout}>
              Checkout
            </CButton>
            <CModal visible={modalVisible} onClose={handleCancel}>
              <CModalHeader>
                <CModalTitle>Confirm Checkout</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <label className="fs-6"> Are you sure you want to proceed to checkout?</label>
                <br />
                <label className="fw-bold">
                  Total Items: {Object.keys(checkedItems).filter((id) => checkedItems[id]).length}{' '}
                  Item
                </label>
              </CModalBody>
              <CModalFooter>
                <CButton color="danger" onClick={handleCancel}>
                  Cancel
                </CButton>
                <CButton color="success" onClick={handleConfirm}>
                  OK
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        </CCard>
      </CRow>
    </>
  )
}

export default Cart
