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
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const { getCart } = useCartService() 
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const [currentProducts, setCurrentProducts] = useState([])

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProducts = async () => {
    try {
      const response = await getInventory()
      setProductsData(response.data)
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
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Material.id === productId)
  }

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const responseProducts = await getInventory()
        setProductsData(responseProducts.data)
        setCurrentProducts(responseProducts.data) // Set currentProducts here
      } catch (error) {
        console.error('Error fetching products:', error)
      }

      try {
        const responseCategories = await getMasterData(apiCategory)
        setCategoriesData(responseCategories.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchProductsAndCategories()
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
    const newTotal = currentProducts.reduce((acc, product) => {
      if (checkedItems[product.id]) {
        const quantity = quantities[product.id] || 1 // Ambil jumlah dari quantities atau gunakan 1 sebagai default
        return acc + product.Material.price * quantity
      }
      return acc
    }, 0)
    setTotalAmount(newTotal)
  }, [checkedItems, quantities, currentProducts]) // Trigger calculation when these change

  const handleIncreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: (prevQuantities[productId] || 1) + 1,
    }))
  }

  const handleDecreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max((prevQuantities[productId] || 1) - 1, 1),
    }))
  }

  const handleCheckout = () => {
    setModalVisible(true)
  }

  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/confirmRec') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  return (
    <>
      <CRow className="mt-3">
        <CCard>
          <h3 className="fw-bold fs-4">Your Cart</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CFormCheck
              id="flexCheckDefault"
              label="Confirm All"
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
            <CButton
              color="danger"
              onClick={handleDeleteAll}
              className="btn-sm p-1 mb-2 text-white" // CoreUI class names
            >
              Delete All
            </CButton>
          </div>

          <CRow className="g-2">
            {currentProducts.map((product, index) => (
              <CCard className="h-80" key={index}>
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CRow className="align-items-center">
                    <CCol xs="1">
                      <CFormCheck
                        id={`product-checkbox-${product.id}`}
                        checked={checkedItems[product.id] || false}
                        onChange={() => handleCheckboxChange(product.id, product.Material.price)}
                      />
                    </CCol>
                    <CCol xs="1">
                      <CCardImage
                        src={product.Material.img || 'https://via.placeholder.com/150'}
                        alt={product.Material.description}
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </CCol>
                    <CCol xs="6">
                      <div>
                        <label className="fw-bold fs-6">{product.Material.description}</label>
                        <br></br>
                        <label>{product.Material.materialNo}</label>
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
                          {quantities[product.id] || 1} ({product.Material?.uom || 'UOM'})
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
                        onClick={() => handleDelete(product.id)}
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
