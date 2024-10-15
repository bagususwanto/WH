import React, { useEffect, useState, useMemo } from 'react'
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

// Icon mapping based on your category names

const Cart = () => {
  const [cartData, setCartData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { getCart, postCart, updateCart, deleteCart } = useCartService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const [currentProducts, setCurrentProducts] = useState([])

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getCarts = async () => {
    try {
      const response = await getCart()
      setCartData(response.data)
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
    getCarts()
  }, [])

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    // Update all individual checkboxes
    const updatedCheckedItems = currentProducts.reduce((acc, product) => {
      acc[product.id] = newSelectAll
      return acc
    }, {})
    setCheckedItems(updatedCheckedItems)
  }

  // Handle individual checkbox change
  const handleCheckboxChange = (productId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleDelete = (productId) => {
    setCurrentProducts(currentProducts.filter((product) => product.id !== productId))
  }
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

  const handleIncreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]:
        (prevQuantities[productId] || cartData.find((p) => p.id === productId).quantity) + 1,
    }))
  }

  const handleDecreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max(
        (prevQuantities[productId] || cartData.find((p) => p.id === productId).quantity) - 1,
        1,
      ),
    }))
  }

  const handleCheckout = () => {
    setModalVisible(true)
  }

  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/app') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  return (
    <>
      <CRow className="mt-3">
        <CCard>
          <h3 className="fw-bold fs-4">Your Cart</h3>
          <div className='ms-auto'style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                          onClick={() => handleDecreaseQuantity(product.id)}
                        >
                          -
                        </CButton>
                        <span className="mx-3">
                          {quantities[product.id] || product.quantity} (
                          {product.Inventory.Material?.uom || 'UOM'})
                        </span>
                        <CButton
                          color="secondary"
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncreaseQuantity(product.id)}
                        >
                          +
                        </CButton>
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
