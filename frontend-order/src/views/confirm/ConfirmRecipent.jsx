import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)

  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')

  const [currentProducts, setCurrentProducts] = useState([])

  const navigate = useNavigate()
  const location = useLocation()
  const MySwal = withReactContent(Swal)
  const { verifiedCartItems } = location.state
  console.log(verifiedCartItems)
  // const apiCategory = 'category'

  // const getCarts = async () => {
  //   console.log(warehouse.id, 'TESTT')
  //   const response = await getCart(warehouse.id)
  //   setCartsData(response.data)
  // }

  // useEffect(() => {
  //   if (warehouse && warehouse.id) {
  //     getCarts()
  //   }
  // }, [warehouse])

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
      reverseButtons: true, // This option will reverse the positions of the buttons
    }).then((result) => {
      if (result.isConfirmed) {
        // If confirmed, proceed with checkout function
        order()
      }
    })
  }

  const order = async () => {
    try {
      const cartIds = verifiedCartItems.map((item) => item.id)
      console.log('Cart IDs:', cartIds)

      // Check if no items in the cart
      if (cartIds.length === 0) {
        return MySwal.fire({
          icon: 'error',
          title: 'Order Error',
          text: 'No items to order. Please add items to the cart before proceeding.',
        })
      }

      // Find the selected service hour based on the deadline
      const selectedServiceHour =
        verifiedCartItems[0].Inventory.Address_Rack.Storage.Plant.Warehouse.Service_Hours.find(
          (serviceHour) => `shift${serviceHour.shiftId}` === deadline,
        )

      // Enforce orderTime selection, prevent "No specific time"
      if (!selectedServiceHour) {
        return MySwal.fire({
          icon: 'error',
          title: 'Order Error',
          text: 'Please select a valid schedule for your order. Order time is required.',
        })
      }

      const orderTime = selectedServiceHour.time
      const paymentNumber = iswbs
        ? verifiedCartItems[0].User.Organization.Section.WB.wbsNumber // WBS number
        : verifiedCartItems[0].User.Organization.Section.GIC.gicNumber // GIC number
      const paymentMethod = iswbs ? 'WBS' : 'GIC' // Payment method based on user choice
      const deliveryMethod = isPickup ? 'Pickup' : 'Otodoke' // Dynamic delivery method

      // Validate if all fields are provided
      if (!orderTime || !paymentNumber || !paymentMethod || !deliveryMethod) {
        return MySwal.fire({
          icon: 'error',
          title: 'Order Error',
          text: 'Please ensure all order details are filled out before proceeding.',
        })
      }

      console.log('XYZ', orderTime, paymentNumber, paymentMethod, deliveryMethod)

      const response = await createOrder({
        cartIds: cartIds, // Cart item IDs
        orderTime: orderTime, // Ensure orderTime is provided
        paymentNumber: paymentNumber,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
      })

      console.log('Order response:', response)
      navigate('/history') // Navigate to history page after successful order
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const totalQuantity = verifiedCartItems.reduce((acc, product) => {
    // Check if the product's inventoryId has already been added to the accumulator
    if (!acc.includes(product.inventoryId)) {
      acc.push(product.inventoryId)
    }
    return acc
  }, []).length // Return the length of the array which holds distinct inventoryIds

  // // Total harga produk
  // useEffect(() => {
  //   const newTotal = currentProducts.reduce((acc, product) => {
  //     if (checkedItems[product.id]) {
  //       const quantity = quantities[product.id] || 1 // Ambil jumlah dari quantities atau gunakan 1 sebagai default
  //       return acc + product.Material.price * quantity
  //     }
  //     return acc
  //   }, 0)
  //   setTotalAmount(newTotal)
  // }, [checkedItems, quantities, currentProducts])

  // const handleIncreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => ({
  //     ...prevQuantities,
  //     [productId]: (prevQuantities[productId] || 1) + 1,
  //   }))
  // }

  // const handleDecreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => ({
  //     ...prevQuantities,
  //     [productId]: Math.max((prevQuantities[productId] || 1) - 1, 1),
  //   }))
  // }
  // const handleQuantityChange = (productId, value) => {
  //   // Validasi jika nilai yang dimasukkan adalah angka
  //   if (!isNaN(value) && value >= 0) {
  //     setQuantities({
  //       ...quantities,
  //       [productId]: parseInt(value, 10),
  //     })
  //   }
  // }

  const totalItems = currentProducts.length

  return (
    <CContainer>
      <CRow>
        <CCol xs={4}>
          <CCard cstyle={{ position: 'sticky', top: '0', zIndex: '10' }}>
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
                        {verifiedCartItems[0].User.Organization.Line.lineName}
                      </label>
                    </div>
                  </>
                )}
              </div>

              <hr />
              <label className="fw-bold mb-2">Schedule {isPickup ? 'Pickup' : 'Otodoke'}</label>
              <CFormSelect value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                <option className="fw-light" value="">
                  Select Cycle
                </option>
                {verifiedCartItems.length > 0 &&
                  verifiedCartItems[0].Inventory.Address_Rack.Storage.Plant.Warehouse.Service_Hours.map(
                    (serviceHour) => (
                      <option key={serviceHour.id} value={`shift${serviceHour.shiftId}`}>
                        {`Shift ${serviceHour.shiftId}: ${serviceHour.time}`}
                      </option>
                    ),
                  )}
              </CFormSelect>

              <hr />
              <label className="fw-bold mb-2">Payment</label>
              {verifiedCartItems.length > 0 && (
                <>
                  <CFormCheck
                    type="radio"
                    id="payment1"
                    label={`WBS: ${verifiedCartItems[0].User.Organization.Section.WB.wbsNumber}`}
                    checked={iswbs}
                    onChange={() => setIswbs(true)}
                  />
                  <CFormCheck
                    type="radio"
                    id="payment2"
                    label={`GIC: ${verifiedCartItems[0].User.Organization.Section.GIC.gicNumber}`}
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
            {verifiedCartItems.map((data) => (
              <CCard className="h-80" key={data.id}>
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CRow className="align-items-center">
                    <CCol xs="1">
                      <CCardImage
                        src={data.Inventory.Material.img || 'https://via.placeholder.com/150'}
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </CCol>
                    <CCol xs="10">
                      <div>
                        <label className="fw-bold">{data.Inventory.Material.description}</label>
                        <br></br>
                        <label className="fw-light fs-6">
                          {data.Inventory.Material.materialNo}
                        </label>
                      </div>
                    </CCol>
                    <CCol xs="1">
                      <label>{`${data.quantity} ${data.Inventory.Material.uom}`}</label>
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
