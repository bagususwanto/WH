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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButtonGroup,
  CFormLabel,
  CImage,
  CCardHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilCart, cilTrash, cilLocationPin, cilArrowBottom } from '@coreui/icons'
import Select from 'react-select'
import useVerify from '../../hooks/UseVerify'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import '../../scss/modal.scss'

const Confirm = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const { getMasterData } = useMasterDataService()
  const { getProduct } = useProductService()
  const [clicked, setClicked] = useState(false)
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalConfirm, setModalConfirm] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const { roleName } = useVerify()
  const [currentProducts, setCurrentProducts] = useState([])
  const [isClearable, setIsClearable] = useState(true)
  const [addressData, setAddressData] = useState([]) // List of addresses
  const [selectedAddressCode, setSelectedAddressCode] = useState(null) // Selected address code
  const [selectedDescription, setSelectedDescription] = useState(null) // Selected product description
  const navigate = useNavigate()
  const [selectedCardIndexes, setSelectedCardIndexes] = useState([]) // Store multiple selected card indexes
  const apiCategory = 'category'

  const getProducts = async () => {
    try {
      const response = await getProduct(1)
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  useEffect(() => {
    getProducts()
  }, [])

  const handleCheckout = () => {
    setModalVisible(true)
  }
  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/confirmall') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  const handleModalCart = (product) => {
    console.log(product)
    setSelectedProduct(product)
    setModalConfirm(true)
  }
  const handleCloseModalOrder = () => {
    setModalConfirm(false)
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

  const handleDeleteClick = (productId) => {
    setSelectedProductId(productId)
    setIsModalVisible(true)
  }
  const handleInputChange = (e) => {
    setRejectionReason(e.target.value)
  }
  const handleConfirmRejection = () => {
    console.log('test')
    // Update the product state with the rejection flag and reason
    setCurrentProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === selectedProductId
          ? { ...product, rejected: true, rejectionReason } // Update the product with rejection details
          : product,
      ),
    )

    // Close the modal and reset states
    setIsModalVisible(false)
    setSelectedProductId(null)
    setRejectionReason('')
  }
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

  const totalItems = currentProducts.length

  const handleButtonClick = () => {
    setClicked(true) // Change the button state to clicked
    navigate('/order') // Redirect to the Order page
  }
  useEffect(() => {
    if (productsData.length > 0) {
      const initialCheckedItems = {}
      productsData.forEach((product) => {
        initialCheckedItems[product.id] = false // Initialize each product as unchecked
      })
      setCheckedItems(initialCheckedItems)
    }
  }, [productsData])
  // Fetch product and address data
  const getProductsAndAddresses = async () => {
    try {
      const responseProducts = await getProduct(1)
      setProductsData(responseProducts.data)

      const responseMasterData = await getMasterData('address') // Assuming 'address' is the correct master data type
      setAddressData(responseMasterData.data)
    } catch (error) {
      console.error('Error fetching products or address data:', error)
    }
  }

  useEffect(() => {
    getProductsAndAddresses()
  }, [])

  const handleAddressCodeChange = (selectedOption) => {
    setSelectedAddressCode(selectedOption)
  }

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption)
  }

  // Filter the products based on the description search
  const filteredProducts = productsData.filter((product) =>
    product.Material.description
      .toLowerCase()
      .includes(selectedDescription ? selectedDescription.label.toLowerCase() : ''),
  )

  const sortedAddressData = addressData
  .map((address) => ({
    value: address.id,
    label: address.Address_Rack.addressRackName,
  }))
  .sort((a, b) => {
    if (a.label === selectedAddressCode?.label) {
      return -1;  // Put the selected address at the top
    }
    if (b.label === selectedAddressCode?.label) {
      return 1;   // Put the selected address at the top
    }
    return 0;  // Keep the order of other addresses unchanged
  });


  return (
    <CContainer>
      <CRow className="mt-1">
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
              />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                className="mt-4"
              >
                <label className="fw-bold">Total Items: {totalItems} Items</label>
                <CButton color="primary" onClick={handleCheckout}>
                  Delivery Now
                </CButton>
                <CModal visible={modalVisible} onClose={handleCancel}>
                  <CModalHeader>
                    <CModalTitle>Confirm Order</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <label className="fs-6"> Are you sure you want to proceed to checkout?</label>
                    <br />
                    <label className="fw-bold">
                      Total Items:{' '}
                      {Object.keys(checkedItems).filter((id) => checkedItems[id]).length} Item
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
          {/* Address Code Form */}
          <CRow className="g-1   mb-2">
            <CFormLabel htmlFor="address">Address Code</CFormLabel>
            <Select
              id="address"
              isClearable
              options={sortedAddressData}
              value={selectedAddressCode}
              onChange={handleAddressCodeChange}
            />
          </CRow>

          {/* Scrollable Products Section */}
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <CRow className="g-2">
              {productsData.map((product, index) => (
                <CCard
                  className={`h-80 ${selectedCardIndexes.includes(index) ? 'bg-success text-white' : ''}`} // Apply green background if selected
                  key={index}
                  onClick={() => handleCardClick(index)} // Handle card click
                  style={{
                    cursor: 'pointer', // Show pointer cursor on hover to indicate it's clickable
                    transition: 'background-color 0.3s', // Smooth transition for background color change
                  }}
                >
                  <CCardBody className="d-flex flex-column justify-content-between">
                    <CRow className="align-items-center">
                      <CCol xs="1">
                        <CCardImage
                          src={'https://via.placeholder.com/150'}
                          style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                        />
                      </CCol>
                      <CCol xs="8">
                        <div>
                          <label>{product.Material.description}</label>
                          <br />
                          <label className="fw-bold">{product.Address_Rack.addressRackName}</label>
                        </div>
                      </CCol>
                      <CCol xs="2">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <span>2</span>
                          <span className="px-2 fw-light">{product.Material?.uom || 'UOM'}</span>
                        </div>
                      </CCol>
                    </CRow>

                    {/* Show the rejection reason under the product if rejected */}
                    {product.rejected && (
                      <div style={{ marginTop: '10px' }}>
                        <label className="fw-bold">Rejection Reason:</label>
                        <p>{product.rejectionReason}</p>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              ))}
            </CRow>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
