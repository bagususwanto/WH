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
    setModalVisible(true)
  }
  const handleConfirm = () => {
    setModalVisible(false)
    navigate('/history') // Use navigate instead of history.push
  }

  const handleCancel = () => {
    setModalVisible(false)
  }

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
                  <label className="fw-light" style={{ marginLeft: '8px' }}>
                    Warehouse Issuing Plant
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
                <label className="fw-bold">Total Items: {totalItems} Items</label>
                <CButton color="primary" onClick={handleCheckout}>
                  Order Now
                </CButton>
                <CModal visible={modalVisible} onClose={handleCancel}>
                  <CModalHeader>
                    <CModalTitle>Confirm Checkout</CModalTitle>
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
                        <label className="fw-bold">
                          {data.Inventory.Material.description} (
                          {data.Inventory.Material?.uom || 'UOM'}){' '}
                        </label>
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
