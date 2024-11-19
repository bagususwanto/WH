import React, { useEffect, useState,useContext } from 'react'
import {useLocation, useNavigate } from 'react-router-dom'
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
import { GlobalContext } from '../../context/GlobalProvider'
import useWarehouseService from '../../services/WarehouseService'
import '../../scss/modal.scss'

const Confirm = () => {
  const [productsData, setProductsData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const [modalConfirm, setModalConfirm] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const { roleName } = useVerify()
  const location = useLocation()
  const { initialShopping } = location.state
  const { getWarehouseConfirm } = useWarehouseService()
  const [ShoppingWarehouse, setShoppingWarehouse] = useState(initialShopping)
  const { warehouse } = useContext(GlobalContext)

  const navigate = useNavigate()
  const [selectedCardIndexes, setSelectedCardIndexes] = useState([]) // Store multiple selected card indexes
  const apiCategory = 'category'

  useEffect(() => {
    // Add a specific class to body
    document.body.classList.add('body-gray-background')

    // Remove the class on component unmount
    return () => {
      document.body.classList.remove('body-gray-background')
    }
  }, [])
  useEffect(() => {
    if (ShoppingWarehouse.deliveryMethod == 'Pickup') {
      setIsPickup(true)
    } else {
      setIsPickup(false)
    }
  }, [initialShopping])
  console.log('initial', initialShopping)

  return (
    <CContainer>
      <CRow className="mt-1">
        <CCol xs={4}>
        <CCard className="mt-2 rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
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
                    <strong>FORM:</strong> {ShoppingWarehouse.User.name}
                  </div>
                  <div>
                    <strong>LINE:</strong> {ShoppingWarehouse.User.Organization.Line.lineName}
                  </div>
                  <div>
                    <small>
                      Request at {format(parseISO(ShoppingWarehouse.createdAt), 'dd/MM/yyyy')}
                    </small>
                  </div>
                </div>
              </div>
              {/* )} */}
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
                  <div>
                    <CFormInput
                      type="text"
                      value={ShoppingWarehouse.scheduleDelivery} // Bind the input value to state
                      readOnly // Make the input readonly so users cannot change it
                    />
                  </div>
                </>
              )}
              <hr />
              <label className="fw-bold mb-2">Payment</label>
              <CFormCheck
                type="radio"
                id="payment2"
                label={`${ShoppingWarehouse.paymentMethod} = ${ShoppingWarehouse.paymentNumber}`} // Corrected syntax
                checked={iswbs}
                onChange={() => setIswbs(false)} // Corrected to set `iswbs` to false
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
            </CCardBody>
          </CCard>
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
            {ShoppingWarehouse.Detail_Orders.map(
              (
                product,
                index, // Change from productsData to currentProducts
              ) => (
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
