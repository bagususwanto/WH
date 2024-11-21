import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { format, parseISO } from 'date-fns'
import Select from 'react-select'
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
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
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
  const { getWarehouseConfirm, postWarehouseConfirm, postWarehouseShopping } = useWarehouseService()
  const savedConfirmWarehouse = JSON.parse(localStorage.getItem('shoppingWarehouse')) || {}
  const [Confirmwarehouse, setConfirmwarehouse] = useState(savedConfirmWarehouse)
  const [quantities, setQuantities] = useState({})
  const { warehouse } = useContext(GlobalContext)
  const MySwal = withReactContent(Swal)
  const [selectedAddressCode, setSelectedAddressCode] = useState(null)
  const [sortedOrders, setSortedOrders] = useState([])
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
    if (Confirmwarehouse.deliveryMethod == 'Pickup') {
      setIsPickup(true)
    } else {
      setIsPickup(false)
    }
  }, [savedConfirmWarehouse])
  console.log('initial', savedConfirmWarehouse)

  // Simpan perubahan Confirmwarehouse ke localStorage
  useEffect(() => {
    if (Confirmwarehouse) {
      localStorage.setItem('shoppingWarehouse', JSON.stringify(Confirmwarehouse))
    }
  }, [Confirmwarehouse])

  // Pastikan initialConfirmWarehouse tetap sinkron

  useEffect(() => {
    return () => {
      // Bersihkan data dari localStorage ketika halaman tidak lagi digunakan
      localStorage.removeItem('shoppingWarehouse')
    }
  }, [])

  // This is where currentProducts is initialized

  useEffect(() => {
    // Initialize sortedOrders with Detail_Orders
    setSortedOrders(Confirmwarehouse.Detail_Orders || [])
  }, [Confirmwarehouse.Detail_Orders])

  // Handle address selection and sorting
  const handleAddressCodeChange = (selectedOption) => {
    const selectedCode = selectedOption ? selectedOption.label : ''
    setSelectedAddressCode(selectedCode)

    // Sort orders: items with matching addressRackName's first 2 characters come first
    const updatedOrders = [...Confirmwarehouse.Detail_Orders].sort((a, b) => {
      const rackA = a.Inventory.Address_Rack.addressRackName.slice(0, 2)

      // Check if the rack matches the selected address code
      const isMatchA = rackA === selectedCode

      if (isMatchA) return -1 // a comes first

      return 0 // No change in order
    })

    setSortedOrders(updatedOrders)
  }
  const totalQuantity = (Confirmwarehouse.Detail_Orders || []).reduce((acc, product) => {
    // Ensure only unique Inventory items are counted
    if (!acc.some((item) => item.id === product.Inventory.id)) {
      acc.push(product.Inventory) // Add unique Inventory
    }
    return acc
  }, []).length

  const handleApprove = async () => {
    // Collect the necessary data
    const orderId = Confirmwarehouse.id // Assuming orderId is stored in Confirmapproval object
    const warehouseId = warehouse.id // Assuming warehouseId is available in `warehouse` state

    const data = {}

    // Confirm with the user before proceeding
    MySwal.fire({
      title: 'Confirm Checkout',
      text: `Are you sure you want to proceed to checkout products?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel',
      reverseButtons: true, // Reverse the order of buttons
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call the postApproval function
          const response = await postWarehouseShopping(warehouseId, orderId, data)

          if (response && response.status === 200) {
            Swal.fire('Approved!', 'The order has been Confirm order successfully.', 'success')
            // Optionally, update the state or navigate after successful approval
            navigate('/confirmall')
          }
        } catch (error) {
          console.error('Error in approval:', error)
          Swal.fire('Error', 'There was an error Confirm the order.', 'error')
        }
      }
    })
  }
  console.log('confirm', Confirmwarehouse)
  console.log('saved', savedConfirmWarehouse)

  return (
    <CContainer>
      <CRow className="mt-1">
        <CCol xs={4}>
          <CCard className=" rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {/* {roleName === 'super admin' && ( */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label className="fw-bold mb-2">Total: {totalQuantity} Item</label>
                <CButton color="primary" onClick={handleApprove}>
                  Delivery Now
                </CButton>
              </div>
            </CCardBody>
          </CCard>
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
                    <strong>FROM:</strong> {Confirmwarehouse.User?.name}
                  </div>
                  <div>
                    <strong>LINE:</strong> {Confirmwarehouse.User?.Organization.Line.lineName}
                  </div>
                  <div>
                    <small>
                      Request at {format(parseISO(Confirmwarehouse.createdAt), 'dd/MM/yyyy')}{' '}
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
                  label={`${Confirmwarehouse.deliveryMethod}`}
                  checked={!isPickup}
                  onChange={() => setIsPickup()}
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
                {Confirmwarehouse.deliveryMethod !== 'pickup' && (
                  <>
                    <CIcon icon={cilArrowBottom} size="lg" />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                      <CIcon icon={cilLocationPin} size="lg" />
                      <label style={{ marginLeft: '8px' }}>ASSY PLANT 1 KARAWANG</label>
                    </div>
                  </>
                )}
              </div>
              {Confirmwarehouse.deliveryMethod !== 'pickup' && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Deadline Order</label>
                  <div>
                    <CFormInput
                      type="text"
                      value={Confirmwarehouse.scheduleDelivery} // Bind the input value to state
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
                label={`${Confirmwarehouse.paymentMethod} = ${Confirmwarehouse.paymentNumber}`} // Corrected syntax
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

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <CRow className="g-2">
              <CFormLabel htmlFor="address">Address Code</CFormLabel>
              <Select
                className="basic-single"
                classNamePrefix="select"
                options={Confirmwarehouse.Detail_Orders.map((order) => ({
                  value: order.Inventory.id,
                  label: order.Inventory.Address_Rack.addressRackName.slice(0, 2), // First 2 characters
                })).filter(
                  (option, index, self) =>
                    index === self.findIndex((o) => o.label === option.label), // Remove duplicates
                )}
                id="address"
                onChange={handleAddressCodeChange}
                value={
                  selectedAddressCode
                    ? { label: selectedAddressCode, value: selectedAddressCode }
                    : null
                }
              />
              {Confirmwarehouse.Detail_Orders?.map(
                (
                  product,
                  index, // Change from productsData to currentProducts
                ) => (
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
                          <label>{product.Inventory.Material?.description}</label>
                          <br />
                          <label className="fw-bold">
                            {product.Inventory.Address_Rack?.addressRackName}
                          </label>
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
                ),
              )}
            </CRow>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
