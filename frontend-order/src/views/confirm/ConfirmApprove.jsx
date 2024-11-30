import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import '../../scss/body_gray.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { format, parseISO } from 'date-fns'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import config from '../../utils/Config'

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
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CImage,
  CPagination,
  CPaginationItem,
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
import useApprovalService from '../../services/ApprovalService'
import { GlobalContext } from '../../context/GlobalProvider'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

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
  const MySwal = withReactContent(Swal)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7) // Limit to 5 items per page
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const { roleName } = useVerify()
  const location = useLocation()
  const { initialConfirmApproval } = location.state
  const { deleteOrderItemApproval, postApproval } = useApprovalService()
  const { warehouse } = useContext(GlobalContext)
  const navigate = useNavigate()
  const [Confirmapproval, setConfirmapproval] = useState(initialConfirmApproval)
  const [loading, setLoading] = useState(true) // Add loading state

  const apiCategory = 'category'
  useEffect(() => {
    // Simulate data fetching or processing delay
    const timeout = setTimeout(() => {
      setLoading(false) // Set loading to false after fetching data
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    // Add a specific class to body
    document.body.classList.add('body-gray-background')

    // Remove the class on component unmount
    return () => {
      document.body.classList.remove('body-gray-background')
    }
  }, [])
  useEffect(() => {
    if (Confirmapproval.deliveryMethod == 'Pickup') {
      setIsPickup(true)
    } else {
      setIsPickup(false)
    }
  }, [initialConfirmApproval])
  console.log('initial', initialConfirmApproval)

  // This is where currentProducts is initialized
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = productsData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(productsData.length / itemsPerPage)

 useEffect(() => {
  // Hitung ulang total harga berdasarkan kuantitas terbaru
  const newTotal = Confirmapproval.Detail_Orders.reduce((acc, product) => {
    const quantity = quantities[product.id] || 1;
    const price = product.Inventory.Material?.price || 0;
    return acc + price * quantity;
  }, 0);

  setTotalAmount(newTotal);
}, [Confirmapproval, quantities]); // Tambahkan 'quantities' ke dependencies
  //useeffect quantity
  useEffect(() => {
    // Map the quantities from the API response (Confirmapproval.Detail_Orders)
    const initialQuantities = Confirmapproval.Detail_Orders.reduce((acc, product) => {
      acc[product.id] = product.quantity // Store the quantity with the product id
      return acc
    }, {})
    setQuantities(initialQuantities) // Set the quantities state
  }, [Confirmapproval])

  const handleDelete = async (detailorderId) => {
    try {
      if (warehouse && warehouse.id) {
        // Menentukan parameter berdasarkan isApproved
        const result = await MySwal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true, // This option will reverse the positions of the buttons
        })
        if (result.isConfirmed) {
          try {
            const response = await deleteOrderItemApproval(detailorderId, warehouse.id)

            // Update Confirmapproval state by removing the deleted item
            const updatedDetailOrders = Confirmapproval.Detail_Orders.filter(
              (order) => order.id !== detailorderId,
            )

            // Set the new state with updated Detail_Orders
            setConfirmapproval((prevConfirmapproval) => ({
              ...prevConfirmapproval,
              Detail_Orders: updatedDetailOrders,
            }))

            Swal.fire('Deleted!', 'Delete success.', 'success')
          } catch (error) {
            console.error('Error deleting item approval:', error)
          }
        }
      } else {
        console.log('warehouse id not found')
      }
    } catch (error) {
      console.error('Error fetching Approval:', error)
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleApprove = async () => {
    // Collect the necessary data
    const orderId = Confirmapproval.id // Assuming orderId is stored in Confirmapproval object
    const warehouseId = warehouse.id // Assuming warehouseId is available in `warehouse` state

    // Create the updateQuantity array with the updated quantities
    const updateQuantity = Confirmapproval.Detail_Orders.map((product) => ({
      detailOrderId: product.id, // Detail order ID from API
      quantity: quantities[product.id] || product.quantity, // Get updated quantity from state or use the original quantity
    }))

    // Construct the data object to send in the POST request
    const data = {
      updateQuantity,
    }

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
          const response = await postApproval(orderId, warehouseId, data)

          if (response && response.status === 200) {
            Swal.fire('Approved!', 'The order has been approved successfully.', 'success')
            // Optionally, update the state or navigate after successful approval
            navigate('/approveall')
          }
        } catch (error) {
          console.error('Error in approval:', error)
        }
      }
    })
  }

  const handleIncreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => {
      const newQuantity = (prevQuantities[productId] || 1) + 1 // Increase quantity by 1

      // Update total amount directly
      const updatedTotalAmount =
        totalAmount +
        (Confirmapproval.Detail_Orders.find((p) => p.id === productId)?.Inventory.Material.price ||
          0)
      setTotalAmount(updatedTotalAmount)

      return {
        ...prevQuantities,
        [productId]: newQuantity, // Update the quantity for the specific product
      }
    })
  }

  const handleDecreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[productId] || 1
      const newQuantity = Math.max(currentQuantity - 1, 1) // Decrease by 1, but prevent it from going below 1
      // Update total amount directly, subtracting price only if quantity decreased
      if (currentQuantity > 1) {
        const updatedTotalAmount =
          totalAmount -
          (Confirmapproval.Detail_Orders.find((p) => p.id === productId)?.Inventory.Material
            .price || 0)
        setTotalAmount(updatedTotalAmount)
      }
      return {
        ...prevQuantities,
        [productId]: newQuantity,
      }
    })
  }

  const handleQuantityChange = (productId, value) => {
    const newQuantity = parseInt(value, 10)
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantities((prevQuantities) => {
        // Calculate the price difference
        const product = Confirmapproval.Detail_Orders.find((p) => p.id === productId)
        const price = product?.Inventory.Material.price || 0
        const quantityDifference = newQuantity - (prevQuantities[productId] || 1)

        // Update total amount based on the quantity difference
        setTotalAmount(totalAmount + price * quantityDifference)

        return {
          ...prevQuantities,
          [productId]: newQuantity,
        }
      })
    }
  }
  const handleButtonClick = () => {
    setClicked(true)
    navigate('/order')
  }

  return (
    <CContainer>
      <CRow>
        <CCol xs={4}>
          {/* Total Section */}
          <CCard className="rounded-0 " style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {loading ? (
                  <>
                    <Skeleton width={100} height={20} />
                    <Skeleton width={80} height={30} />
                  </>
                ) : (
                  <>
                    <label className="fw-bold mb-1">
                      Total: Rp {totalAmount.toLocaleString('id-ID')}
                    </label>
                    <CButton color="primary" onClick={handleApprove}>
                      Approve Now
                    </CButton>
                  </>
                )}
              </div>
            </CCardBody>
          </CCard>

          {/* User Detail Section */}
          <CCard className="mt-2 rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                {loading ? (
                  <>
                    <Skeleton
                      circle={true}
                      height={60}
                      width={60}
                      style={{ marginRight: '16px' }}
                    />
                    <Skeleton width="100%" height={50} />
                  </>
                ) : (
                  <>
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
                        <strong>FROM:</strong> {Confirmapproval.User.name}
                      </div>
                      <div>
                        <strong>LINE:</strong> {Confirmapproval.User.Organization.Line.lineName}
                      </div>
                      <div>
                        <small className="fw-light" style={{ marginRight: '5px' }}>
                          Request at
                        </small>
                        <small>
                          {format(parseISO(Confirmapproval.transactionDate), 'dd/MM/yyyy')}{' '}
                        </small>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <label className="fw-bold mb-2">Select Delivery Type</label>
              {loading ? (
                <Skeleton width="100%" height={20} />
              ) : (
                <CFormCheck
                  className="me-3"
                  type="radio"
                  id="pickup"
                  label={`${Confirmapproval.deliveryMethod.charAt(0).toUpperCase()}${Confirmapproval.deliveryMethod.slice(1)}`}
                  checked={!isPickup}
                  onChange={() => setIsPickup()}
                  disabled
                />
              )}

              <hr />
              <label className="fw-bold mb-2">Address Detail Confirmation</label>
              {loading ? (
                <Skeleton count={3} height={20} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CIcon icon={cilHome} size="lg" />
                    <label style={{ marginLeft: '8px' }}>Warehouse Issuing Plant</label>
                  </div>
                  {Confirmapproval.deliveryMethod !== 'pickup' && (
                    <>
                      <CIcon icon={cilArrowBottom} size="lg" />
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                        <CIcon icon={cilLocationPin} size="lg" />
                        <label style={{ marginLeft: '8px' }}>ASSY PLANT 1 KARAWANG</label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {Confirmapproval.deliveryMethod !== 'pickup' && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Deadline Order</label>
                  {loading ? (
                    <Skeleton width="100%" height={30} />
                  ) : (
                    <div>
                      <CFormInput type="text" value={Confirmapproval.scheduleDelivery} readOnly />
                    </div>
                  )}
                </>
              )}

              <hr />
              <label className="fw-bold mb-2">GI Method</label>
              {loading ? (
                <Skeleton width="100%" height={20} />
              ) : (
                <CFormCheck
                  type="radio"
                  id="payment2"
                  label={`${Confirmapproval.paymentMethod} = ${Confirmapproval.paymentNumber}`}
                  checked={iswbs}
                  onChange={() => setIswbs(false)}
                  disabled
                />
              )}

              <hr />
              <label className="fw-bold mb-2">Message</label>
              {loading ? (
                <Skeleton width="100%" height={60} />
              ) : (
                <CFormTextarea
                  className="mt-3"
                  rows={3}
                  value={Confirmapproval.remarks || 'No message'} // Jika remarks null, tampilkan "No message"
                  onChange={(e) => setMessage(e.target.value)}
                  disabled
                />
              )}
            </CCardBody>
          </CCard>

          <CButton
            className={`box mt-5 ${clicked ? 'btn-clicked' : ''}`}
            color="secondary"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '55px',
              height: '55px',
              border: '1px solid white',
              color: 'white',
              borderRadius: '50%',
              boxShadow: clicked ? '0px 4px 6px rgba(0,0,0,0.2)' : 'none',
            }}
            onClick={handleButtonClick}
          >
            <CIcon icon={cilCart} size="lg" />
          </CButton>
        </CCol>

        <CCol xs={8}>
          <CRow className="g-2">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CCard className="h-80 rounded-45 bg-grey" key={index}>
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center">
                        <CCol xs="1">
                          <Skeleton height="100%" width="100%" />
                        </CCol>
                        <CCol xs="6">
                          <div>
                            <Skeleton height={20} width="80%" />
                            <Skeleton height={15} width="60%" style={{ marginTop: '5px' }} />
                          </div>
                        </CCol>
                        <CCol xs="3">
                          <Skeleton height={40} width="100%" />
                        </CCol>
                        <CCol xs="1" className="d-flex justify-content-end align-items-center">
                          <Skeleton circle height={20} width={20} />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))
              : Confirmapproval.Detail_Orders.map((product) => (
                  <CCard className="h-80 rounded-45 bg-grey" key={product.id}>
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center">
                        <CCol xs={2} sm={2} md={1}>
                          <CCardImage
                            src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
                            alt={product.Inventory.Material.description}
                            style={{ height: '130%', width: '130%' }}
                          />
                        </CCol>
                        <CCol xs={6} sm={5} md={5}>
                          <div>
                            <label>{product.Inventory.Material.description}</label>
                            <br />
                            <label className="fw-bold fs-6">
                              Rp {product.Inventory.Material.price.toLocaleString('id-ID')}
                            </label>
                          </div>
                        </CCol>
                        <CCol xs={3} sm={3} md={3} >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
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
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              style={{
                                textAlign: 'center', // Pusatkan teks secara horizontal
                                verticalAlign: 'middle', // Pusatkan teks secara vertikal
                                height: '100%', // Pastikan input sesuai tinggi kontainer jika perlu
                                border: 'none', // Hilangkan border
                                outline: 'none', // Hilangkan garis biru/oranye saat fokus
                              }}
                            />

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

                        <CCol xs={2} sm={2} md={2} className="d-flex justify-content-end align-items-center">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <span style={{ fontSize: '0.9em' }}>
                              ({product.Inventory.Material?.uom || 'UOM'})
                            </span>
                            <CIcon
                              icon={cilTrash}
                              className="text-danger"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleDelete(product.id)}
                            />
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
          </CRow>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            {loading ? (
              <Skeleton height={30} width={200} />
            ) : (
              <CPagination>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <CPaginationItem
                    key={index + 1}
                    active={index + 1 === currentPage}
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
            )}
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
