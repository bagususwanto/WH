import React, { useEffect, useState } from 'react'
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
  CFormSelect,
  CContainer,
  CFormTextarea,
  CButtonGroup,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CImage,
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
  cilLocationPin,
  cilArrowBottom,
} from '@coreui/icons'

import useVerify from '../../hooks/UseVerify'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'

const categoriesData = [
  { id: 1, categoryName: 'Office Supp.' },
  { id: 2, categoryName: 'Oper Supp.' },
  { id: 3, categoryName: 'Support Oper' },
  { id: 4, categoryName: 'Raw.Matr' },
  { id: 5, categoryName: 'Spare Part' },
  { id: 6, categoryName: 'Tools' },
]

// Icon mapping based on your category names
const iconMap = {
  'Office Supp.': cilFolder,
  'Oper Supp.': cilCart,
  'Support Oper': cilInbox,
  'Raw.Matr': cilFax,
  'Spare Part': cilDeaf,
  Tools: cilKeyboard,
}

const Confirm = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { getMasterData } = useMasterDataService()
  const { getProduct } = useProductService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState('')
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const { roleName } = useVerify()
  const [currentProducts, setCurrentProducts] = useState([])

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProducts = async () => {
    try {
      const response = await getProduct(1)
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
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
    getProducts()
  }, [])

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const responseProducts = await getInventory()
        setProductsData(responseProducts.data)
        setCurrentProducts(responseProducts.data) // Set currentProducts here

        // Initialize checkedItems with all products set to true
        const initialCheckedItems = {}
        responseProducts.data.forEach((product) => {
          initialCheckedItems[product.id] = true // Set all to true
        })
        setCheckedItems(initialCheckedItems) // Update checkedItems state
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

  useEffect(() => {
    const newTotal = currentProducts.reduce((acc, product) => {
      if (checkedItems[product.id]) {
        const quantity = quantities[product.id] || 1 // Get quantity or default to 1
        return acc + product.Material.price * quantity
      }
      return acc
    }, 0)
    setTotalAmount(newTotal)
  }, [checkedItems, quantities, currentProducts])

  const handleCheckout = () => {
    setModalVisible(true)
  }
  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/history') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
  }

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
      [productId]: !prev[productId], // Toggle the checked state
    }))
  }

  const handleDelete = (productId) => {
    setCurrentProducts(currentProducts.filter((product) => product.id !== productId))
    setCheckedItems((prev) => {
      const { [productId]: _, ...newCheckedItems } = prev
      return newCheckedItems
    })
  }

  // Total harga produk
  useEffect(() => {
    const newTotal = currentProducts.reduce((acc, product) => {
      if (checkedItems[product.id]) {
        // Check if the product is selected
        const quantity = quantities[product.id] || 1 // Use the quantity or default to 1
        return acc + product.Material.price * quantity // Calculate price * quantity
      }
      return acc
    }, 0)
    setTotalAmount(newTotal) // Set the total amount
  }, [checkedItems, quantities, currentProducts])

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

  const handleQuantityChange = (productId, value) => {
    // Validasi jika nilai yang dimasukkan adalah angka
    if (!isNaN(value) && value >= 0) {
      setQuantities({
        ...quantities,
        [productId]: parseInt(value, 10),
      })
    }
  }
  const handleButtonClick = () => {
    setClicked(true) // Change the button state to clicked
    navigate('/order') // Redirect to the Order page
  }

  return (
    <CContainer>
      <CRow>
        <CCol xs={4}>
          <CCard style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {roleName === 'super admin' && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <img
                    src="path-to-user-photo.jpg"
                    alt="User Profile"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      marginRight: '16px',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <strong>FORM:</strong> ANDI (TEAM LEADER)
                    </div>
                    <div>
                      <strong>GRUP:</strong> ASSY PRE TRIM 2 OPR RED
                    </div>
                    <div>
                      <small>Request at 11:19</small>
                    </div>
                  </div>
                </div>
              )}
              <label className="fw-bold mb-2">Select Delivery Type</label>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <CFormCheck
                  className="me-3"
                  type="radio"
                  id="pickup"
                  label="Pickup"
                  checked={isPickup}
                  onChange={() => setIsPickup(true)}
                  disabled
                />
                <CFormCheck
                  type="radio"
                  id="otodoke"
                  label="Otodoke"
                  checked={!isPickup}
                  onChange={() => setIsPickup(false)}
                  disabled
                />
              </div>
              <hr />
              <label className="fw-bold mb-2">Address Detail Confirmation</label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CIcon icon={cilHome} size="lg" />
                  <label style={{ marginLeft: '8px' }}>Warehouse Issuing Plant</label>
                </div>
                {!isPickup && (
                  <>
                    <CIcon icon={cilArrowBottom} size="lg" />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                      <CIcon icon={cilLocationPin} size="lg" />
                      <label style={{ marginLeft: '8px' }}>ASSY PLANT 1 KARAWANG</label>
                    </div>
                  </>
                )}
              </div>
              {!isPickup && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Deadline Order</label>
                  <CFormSelect value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                    <option value="">Select Shift</option>
                    <option value="dayShift1">Day Shift 1: 08:00</option>
                    <option value="dayShift2">Day Shift 2: 10:00</option>
                    <option value="nightShift1">Night Shift 1: 22:00</option>
                    <option value="nightShift2">Night Shift 2: 10:00</option>
                  </CFormSelect>
                </>
              )}
              <hr />
              <label className="fw-bold mb-2">Payment</label>
              <CFormCheck
                type="radio"
                id="payment1"
                label="WBS - ####-###-###"
                checked={iswbs}
                onChange={() => setIswbs(true)}
                disabled
              />
              <CFormCheck
                type="radio"
                id="payment2"
                label="GIC - ####-###-###"
                checked={!iswbs}
                onChange={() => setIswbs(false)}
                disabled
              />
              <hr />
              <CFormTextarea
                className="mt-3"
                placeholder="Leave a message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled
              />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                className="mt-4"
              >
                <label className="fw-bold mb-2">
                  Total: Rp {totalAmount.toLocaleString('id-ID')}
                </label>
                <CButton color="primary" onClick={handleCheckout}>
                  Approve Now
                </CButton>

                <CModal visible={modalVisible} onClose={handleCancel}>
                  <CModalHeader>
                    <CModalTitle>Confirm Approve</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <label className="fs-6"> Are you sure you want to proceed to checkout?</label>
                    <br />
                    <label className="fw-bold">
                      Total: Rp {totalAmount.toLocaleString('id-ID')}
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
            </CCardBody>
          </CCard>
          <CButton
            className={`box mt-5 ${clicked ? 'btn-clicked' : ''}`} // Add a class for when clicked
            color="secondary"
            style={{
              position: 'fixed',
              bottom: '20px', // Position the button 20px from the bottom
              right: '20px', // Position the button 20px from the right
              width: '55px', // Set a fixed width
              height: '55px', // Set a fixed height (same as width for a perfect circle)
              border: '1px solid white',
              color: 'white',
              borderRadius: '50%', // This ensures it's perfectly circular
              boxShadow: clicked ? '0px 4px 6px rgba(0,0,0,0.2)' : 'none', // Add a shadow when clicked
            }}
            onClick={handleButtonClick}
          >
            <CIcon icon={cilCart} size="lg" /> {/* Adjust the icon size with size="lg" */}
          </CButton>
        </CCol>

        <CCol xs={8}>
          <CRow className="g-2">
            {productsData.map((product, index) => (
              <CCard className="h-80" key={index}>
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CRow className="align-items-center">
                    <CCol xs="1">
                      <CCardImage
                        src={product.Material.img || 'https://via.placeholder.com/150'}
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </CCol>
                    <CCol xs="6">
                      <div>
                        <label>
                          {product.Material.description} ({product.Material?.uom || 'UOM'}){' '}
                        </label>
                        <br></br>
                        <label className="fw-bold fs-6">
                          Rp {product.Material.price.toLocaleString('id-ID')}
                        </label>
                      </div>
                    </CCol>
                    <CCol xs="3">
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
                        <CFormInput
                          type="text"
                          value={quantities[product.id] || 1}
                          aria-label="Number input"
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />

                        <CButton
                          color="secondary"
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncreaseQuantity(product.id)}
                        >
                          +
                        </CButton>

                        <span className="px-2">({product.Material?.uom || 'UOM'})</span>
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
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
