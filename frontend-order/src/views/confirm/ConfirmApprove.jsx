import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import '../../scss/body_gray.scss'
import { format, parseISO } from 'date-fns'
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
    const newTotal = Confirmapproval.Detail_Orders.reduce((acc, product) => {
      // Ensure that the product is checked
      const quantity = quantities[product.id] || 1
      const price = product.Inventory.Material?.price || 0
      acc += price * quantity
      return acc
    }, 0)

    setTotalAmount(newTotal)
  }, [Confirmapproval])
  console.log('total', totalAmount)
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

            console.log('warehuse id :', warehouse.id)
            console.log('tess', response.data)

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
            MySwal.fire('Error!', 'There was an error deleting your item.', 'error')
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
          Swal.fire('Error', 'There was an error approving the order.', 'error')
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
          <CCard style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {/* {roleName === 'super admin' && ( */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label className="fw-bold mb-2">
                  Total: Rp {totalAmount.toLocaleString('id-ID')}
                </label>
                <CButton color="primary" onClick={handleApprove}>
                  Approve Now
                </CButton>
              </div>
            </CCardBody>
          </CCard>
          {/* sticky Detail */}
          <CCard className="mt-2" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
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
                    <strong>FORM:</strong> {Confirmapproval.User.name}
                  </div>
                  <div>
                    <strong>LINE:</strong> {Confirmapproval.User.Organization.Line.lineName}
                  </div>
                  <div>
                    <small>
                      Request at {format(parseISO(Confirmapproval.createdAt), 'dd/MM/yyyy')}
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
                      value={Confirmapproval.scheduleDelivery} // Bind the input value to state
                      readOnly // Make the input readonly so users cannot change it
                    />
                  </div>
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
            {Confirmapproval.Detail_Orders.map(
              (
                product,
                index, // Change from productsData to currentProducts
              ) => (
                <CCard className="h-80 rounded-0 bg-grey" key={product.id}>
                  <CCardBody className="d-flex flex-column justify-content-between">
                    <CRow className="align-items-center">
                      <CCol xs="1">
                        <CCardImage
                          src={product.Inventory.Material.img}
                          style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                        />
                      </CCol>
                      <CCol xs="6">
                        <div>
                          <label>{product.Inventory.Material.description}</label>
                          <br></br>
                          <label className="fw-bold fs-6">
                            Rp {product.Inventory.Material.price.toLocaleString('id-ID')}
                          </label>
                        </div>
                      </CCol>
                      <CCol xs="3">
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
                            value={quantities[product.id] || 1} // Dynamically set the value from state
                            aria-label="Number input"
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)} // Update state on change
                          />
                          <CButton
                            color="secondary"
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncreaseQuantity(product.id)}
                          >
                            +
                          </CButton>{' '}
                          {/* Apply margin-left (ms-2) to create space */}
                          <span className="fw-light">
                            ({product.Inventory.Material?.uom || 'UOM'})
                          </span>
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
              ),
            )}
          </CRow>
          <div className="d-flex justify-content-center mt-4">
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
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
