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
  const [cartData, setCartData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const { checkout } = useOrderService()
  const { getMasterData } = useMasterDataService()
  const { getCart } = useCartService()
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
  const { warehouse } = useContext(GlobalContext)
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
      }
    })
  }
  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/history') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
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
              {!isPickup && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Schedule Delivery</label>
                  <CFormSelect value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                    <option  className="fw-light" value="">Select Cycle</option>
                    {verifiedCartItems.length > 0 &&
                      verifiedCartItems[0].Inventory.Address_Rack.Storage.Plant.Warehouse.Service_Hours.map(
                        (serviceHour) => (
                          <option key={serviceHour.id} value={`shift${serviceHour.shiftId}`}>
                            {`Shift ${serviceHour.shiftId}: ${new Date(serviceHour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
