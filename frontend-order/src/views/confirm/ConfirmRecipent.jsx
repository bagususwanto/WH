import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import config from '../../utils/Config'
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import {
  CCard,
  CCardBody,
  CCardImage,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
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
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBatteryEmpty,
  cilDeaf,
  cilFax,
  cilFolder,
  cilHome,
  cilLocationPin,
  cilArrowBottom,
} from '@coreui/icons'
import useOrderService from '../../services/OrderService'
import useVerify from '../../hooks/UseVerify'
import useProductService from '../../services/ProductService'
import useCartService from '../../services/CartService'
import useMasterDataService from '../../services/MasterDataService'
import { GlobalContext } from '../../context/GlobalProvider'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Confirm = () => {
  const { createOrder } = useOrderService()
  const { warehouse } = useContext(GlobalContext)
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [currentProducts, setCurrentProducts] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const MySwal = withReactContent(Swal)
  const { verifiedCartItems } = location.state

  const totalQuantity = verifiedCartItems.reduce((acc, product) => {
    if (!acc.includes(product.inventoryId)) {
      acc.push(product.inventoryId)
    }
    return acc
  }, []).length

  const totalPages = Math.ceil(verifiedCartItems.length / itemsPerPage)

  // Get current items based on the current page
  const currentItems = verifiedCartItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }
  const handleCheckout = () => {
    MySwal.fire({
      title: 'Confirm Checkout',
      text: `Are you sure you want to proceed to checkout products?\n\n Total items: ${totalQuantity}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        order() // Call the order function directly
      }
    })
  }

  const order = async () => {
    try {
      const cartIds = verifiedCartItems.map((item) => item.id)

      if (cartIds.length === 0) {
        return MySwal.fire({
          icon: 'error',
          title: 'Order Error',
          text: 'No items to order. Please add items to the cart before proceeding.',
        })
      }

      const orderTime = deadline

      // Validate if "Otodoke" is selected
      if (!isPickup) {
        if (orderTime == null) {
          return MySwal.fire({
            icon: 'error',
            title: 'Order Error',
            text: 'Please Select Cycle.',
          })
        }
      }

      const paymentNumber = iswbs
        ? verifiedCartItems[0].User.Organization.Section
          ? verifiedCartItems[0].User.Organization.Section.WB.wbsNumber
          : '' // WBS number
        : verifiedCartItems[0].User.Organization.Section
          ? verifiedCartItems[0].User.Organization.Section.GIC.gicNumber
          : '' // GIC number

      const paymentMethod = iswbs ? 'WBS' : 'GIC' // Determine payment method
      const deliveryMethod = isPickup ? 'pickup' : 'otodoke' // Delivery method

      // Validate order details
      if ((!isPickup && !orderTime) || !paymentNumber || !paymentMethod || !deliveryMethod) {
        return MySwal.fire({
          icon: 'error',
          title: 'Order Error',
          text: 'Please ensure all order details are filled out before proceeding.',
        })
      }

      await createOrder(
        {
          cartIds,
          orderTime: orderTime || null, // Provide orderTime only if it's Otodoke
          paymentNumber,
          paymentMethod,
          deliveryMethod,
          remarks: message,
        },
        warehouse.id,
      )

      navigate('/history') // Navigate to history page after successful order
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  useEffect(() => {
    // Reset deadline if verifiedCartItems change
    if (verifiedCartItems.length > 0) {
      setDeadline('') // Reset the deadline when cart items are updated
    }
  }, [verifiedCartItems])
  console.log(verifiedCartItems)

  const totalItems = currentProducts.length

  return (
    <CContainer>
      <CRow>
        <CCol xs={4}>
          <CCard style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              <label className="fw-bold mb-2">Select Delivery Type</label>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <CFormCheck
                  className="me-3"
                  type="radio"
                  id="pickup"
                  label="Pickup"
                  checked={isPickup}
                  onChange={() => setIsPickup(true)}
                />
                <CFormCheck
                  type="radio"
                  id="otodoke"
                  label="Otodoke"
                  checked={!isPickup}
                  onChange={() => setIsPickup(false)}
                />
              </div>
              <hr />
              <label className="fw-bold mb-2">Address Detail Confirmation</label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CIcon icon={cilHome} size="lg" />
                  <label style={{ marginLeft: '8px' }}>
                    {
                      verifiedCartItems[0].Inventory.Address_Rack.Storage.Plant.Warehouse
                        .warehouseName
                    }
                  </label>
                </div>
                {!isPickup && (
                  <>
                    <CIcon icon={cilArrowBottom} size="lg" />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                      <CIcon icon={cilLocationPin} size="lg" />
                      <label style={{ marginLeft: '8px' }}>
                        {verifiedCartItems[0].User.Organization.Line?.lineName}
                      </label>
                    </div>
                  </>
                )}
              </div>
              {/* Render the dropdown for schedule selection */}
              {!isPickup && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Schedule Otodoke</label>
                  <CFormSelect value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                    <option className="fw-light" value="">
                      Select Cycle
                    </option>
                    {verifiedCartItems.length > 0 &&
                      verifiedCartItems[0].Inventory.Address_Rack.Storage.Plant.Warehouse.Service_Hours.map(
                        (serviceHour) => (
                          <option key={serviceHour.id} value={`${serviceHour.time}`}>
                            {`Shift ${serviceHour.shiftId}: ${serviceHour.time}`}
                          </option>
                        ),
                      )}
                  </CFormSelect>
                </>
              )}

              <hr />
              <label className="fw-bold mb-2">Payment</label>
              {verifiedCartItems.length > 0 && (
                <>
                  <CFormCheck
                    type="radio"
                    id="payment1"
                    label={`WBS: ${verifiedCartItems[0].User.Organization.Section ? verifiedCartItems[0].User.Organization.Section.WB.wbsNumber : ''}`}
                    checked={iswbs}
                    onChange={() => setIswbs(true)}
                  />
                  <CFormCheck
                    type="radio"
                    id="payment2"
                    label={`GIC: ${verifiedCartItems[0].User.Organization.Section ? verifiedCartItems[0].User.Organization.Section.GIC.gicNumber : ''}`}
                    checked={!iswbs}
                    onChange={() => setIswbs(false)}
                  />
                </>
              )}
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
                <label className="fw-bold">Total Items: {totalQuantity} Items</label>
                <CButton color="primary" onClick={handleCheckout}>
                  Order Now
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={8}>
          <CRow className="g-2">
            {currentItems.map((data) => (
              <CCard className="h-100" key={data.id}>
                {' '}
                {/* Fixed height for the card */}
                <CCardBody
                  className="d-flex flex-column justify-content-between"
                  style={{ height: '100%' }}
                >
                  <CRow className="align-items-start" style={{ height: '100%' }}>
                    {/* Image Column */}
                    <CCol xs="2" className="d-flex justify-content-center align-items-center">
                      <CCardImage
                        src={`${config.BACKEND_URL}${data.Inventory.Material.img}`}
                        alt={data.Inventory.Material.description}
                        style={{
                          height: '75px', // Fixed height for image
                          objectFit: 'cover', // Ensure image doesn't distort and scales to fit the space
                          width: '60%', // Make image take the full width of the column
                        }}
                      />
                    </CCol>

                    <CCol xs="9" className="d-flex flex-column justify-content-start">
                      <div>
                        <label className="fw-bold">{data.Inventory.Material.description}</label>
                        <br />
                        <label className="fw-light fs-6">
                          {data.Inventory.Material.materialNo}
                        </label>
                      </div>
                    </CCol>

                    {/* Quantity Column */}
                    <CCol xs="1" className="d-flex justify-content-start align-items-center">
                      <label>{`${data.quantity} ${data.Inventory.Material.uom}`}</label>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ))}
          </CRow>

          {/* Pagination */}
          <CRow className="mt-4">
            <CCol className="d-flex justify-content-center sticky-pagination">
              <CPagination aria-label="Page navigation example">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <CPaginationItem
                    key={index}
                    active={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
