import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { format, parseISO } from 'date-fns'
import '../../scss/body_gray.scss'
import '../../scss/modal_backdrop.scss'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
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
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilCart, cilTrash, cilLocationPin, cilArrowBottom } from '@coreui/icons'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useVerify from '../../hooks/UseVerify'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useWarehouseService from '../../services/WarehouseService'
import { GlobalContext } from '../../context/GlobalProvider'
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
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalConfirm, setModalConfirm] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const { roleName } = useVerify()
  const location = useLocation()
  const { getWarehouseConfirm, rejectWarehouseConfirm, postWarehouseConfirm } =
    useWarehouseService()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7) // Limit to 5 items per page
  const savedConfirmWarehouse = JSON.parse(localStorage.getItem('confirmWarehouse'))
  const [Confirmwarehouse, setConfirmwarehouse] = useState(savedConfirmWarehouse)
  const MySwal = withReactContent(Swal)
  const navigate = useNavigate()
  const { warehouse } = useContext(GlobalContext)
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
      localStorage.setItem('confirmWarehouse', JSON.stringify(Confirmwarehouse))
    }
  }, [Confirmwarehouse])

  // Pastikan initialConfirmWarehouse tetap sinkron

  useEffect(() => {
    return () => {
      // Bersihkan data dari localStorage ketika halaman tidak lagi digunakan
      localStorage.removeItem('confirmWarehouse')
    }
  }, [])

  // This is where currentProducts is initialized
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = productsData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(productsData.length / itemsPerPage)

  useEffect(() => {
    const newTotal = Confirmwarehouse.Detail_Orders.reduce((acc, product) => {
      // Ensure that the product is checked
      const quantity = quantities[product.id] || 1
      const price = product.Inventory.Material?.price || 0
      acc += price * quantity
      return acc
    }, 0)
  })

  //useeffect quantity
  useEffect(() => {
    // Map the quantities from the API response (Confirmapproval.Detail_Orders)
    const initialQuantities = Confirmwarehouse.Detail_Orders.reduce((acc, product) => {
      acc[product.id] = product.quantity // Store the quantity with the product id
      return acc
    }, {})
    setQuantities(initialQuantities) // Set the quantities state
  }, [Confirmwarehouse])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleApprove = async () => {
    // Collect the necessary data
    const orderId = Confirmwarehouse.id // Assuming orderId is stored in Confirmapproval object
    const warehouseId = warehouse.id // Assuming warehouseId is available in `warehouse` state

    // Create the updateQuantity array with   the updated quantities
    const updateQuantity = Confirmwarehouse.Detail_Orders.map((product) => ({
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
          const response = await postWarehouseConfirm(warehouseId, orderId, data)

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
  // Handle Increase and Decrease Quantity
  const handleIncreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]:
        (prevQuantities[productId] ||
          Confirmwarehouse.Detail_Orders.find((p) => p.productId === productId).quantity) + 1,
    }))
  }

  const handleDecreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max(
        (prevQuantities[productId] ||
          Confirmwarehouse.Detail_Orders.find((p) => p.productId === productId).quantity) - 1,
        1,
      ),
    }))
  }
  // const handleIncreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => {
  //     const newQuantity = (prevQuantities[productId] || 1) + 1 // Increase quantity by 1

  //     // Update total amount directly
  //     const updatedTotalAmount =
  //       totalAmount +
  //       (Confirmwarehouse.Detail_Orders.find((p) => p.id === productId)?.Inventory.Material.price ||
  //         0)
  //     setTotalAmount(updatedTotalAmount)

  //     return {
  //       ...prevQuantities,
  //       [productId]: newQuantity, // Update the quantity for the specific product
  //     }
  //   })
  // }

  // const handleDecreaseQuantity = (productId) => {
  //   setQuantities((prevQuantities) => {
  //     const currentQuantity = prevQuantities[productId] || 1
  //     return {
  //       ...prevQuantities,
  //       [productId]: newQuantity,
  //     }
  //   })
  // }

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
  const totalQuantity = (Confirmwarehouse.Detail_Orders || []).reduce((acc, product) => {
    // Ensure only unique Inventory items are counted
    if (!acc.some((item) => item.id === product.Inventory.id)) {
      acc.push(product.Inventory) // Add unique Inventory
    }
    return acc
  }, []).length

  // Handle rejection reason change
  const handleInputChange = (e) => {
    setRejectionReason(e.target.value)
  }

  useEffect(() => {
    if (modalConfirm) {
      document.body.classList.add('blurred') // Tambahkan kelas blur ketika modal dibuka
    } else {
      document.body.classList.remove('blurred') // Hapus kelas blur ketika modal ditutup
    }
    // Cleanup to avoid issues on unmount
    return () => {
      document.body.classList.remove('blurred')
    }
  }, [modalConfirm])

  const handleModalCart = (product) => {
    setSelectedProduct(product)
    setModalConfirm(true) // Tampilkan modal
  }

  const handleConfirmRejection = async () => {
    if (!rejectionReason) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a rejection reason',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    try {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'You are about to reject this order.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })

      if (result.isConfirmed) {
        try {
          const data = {
            remarks: rejectionReason,
          }
          console.log('warehouse', warehouse)
          console.log('selectedProduct', selectedProduct)
          console.log('dataaa', data)
          const response = await rejectWarehouseConfirm(warehouse.id, selectedProduct.id, data)
          // Update Confirmapproval state by removing the deleted item
          const updatedDetailOrders = Confirmwarehouse.Detail_Orders.filter(
            (order) => order.id !== selectedProduct.id,
          )

          // Set the new state with updated Detail_Orders
          setConfirmwarehouse((prevConfirmwarehouse) => ({
            ...prevConfirmwarehouse,
            Detail_Orders: updatedDetailOrders,
          }))

          // Handle success
          MySwal.fire(
            'Rejected!',
            'The order has been rejected.,sudah masuk tab untuk item rejected',
            'success',
          )

          // Optionally update the UI here
          setModalConfirm(false) // Tutup modal
          setRejectionReason('') // Reset alasan penolakan
        } catch (error) {
          console.error('Error in rejection API call:', error)
          MySwal.fire('Error!', 'An unexpected error occurred.', 'error')
        }
      }
    } catch (error) {
      console.error('Error confirming rejection:', error)
    }
  }

  return (
    <CContainer>
      <CRow>
        <CCol xs={4}>
          <CCard className=" rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {/* {roleName === 'super admin' && ( */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label className="fw-bold mb-2">
                  {loading ? <Skeleton width={80} height={20} /> : `Total: ${totalQuantity} Item`}
                </label>
                {loading ? (
                  <Skeleton width={100} height={35} />
                ) : (
                  <CButton color="primary" onClick={handleApprove}>
                    Confirm Now
                  </CButton>
                )}
              </div>
            </CCardBody>
          </CCard>
          {/* sticky Detail */}
          <CCard className="mt-2 rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                {loading ? (
                  <Skeleton circle={true} height={60} width={60} />
                ) : (
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
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <strong>FROM:</strong>{' '}
                    {loading ? <Skeleton width={120} /> : Confirmwarehouse.User.name}
                  </div>
                  <div>
                    <strong>LINE:</strong>{' '}
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      Confirmwarehouse.User.Organization.Line.lineName
                    )}
                  </div>
                  <div>
                    <small className="fw-light" style={{ marginRight: '5px' }}>
                      Request at
                    </small>
                    {loading ? (
                      <Skeleton width={80} />
                    ) : (
                      <small>{format(parseISO(Confirmwarehouse.transactionDate), 'dd/MM/yyyy')}</small>
                    )}
                  </div>
                </div>
              </div>
              {/* )} */}
              <label className="fw-bold mb-2">Select Delivery Type</label>
              {loading ? (
                <Skeleton width={150} height={20} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <CFormCheck
                    className="me-3"
                    type="radio"
                    id="pickup"
                    label={`${Confirmwarehouse.deliveryMethod.charAt(0).toUpperCase()}${Confirmwarehouse.deliveryMethod.slice(1)}`}
                    checked={!isPickup}
                    onChange={() => setIsPickup()}
                    disabled
                  />
                </div>
              )}
              <hr />
              <label className="fw-bold mb-2">Address Detail Confirmation</label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  {loading ? (
                    <Skeleton circle={true} height={24} width={24} />
                  ) : (
                    <CIcon icon={cilHome} size="lg" />
                  )}
                  <label style={{ marginLeft: '8px' }}>
                    {loading ? <Skeleton width={200} /> : 'Warehouse Issuing Plant'}
                  </label>
                </div>

                {loading ? (
                  <>
                    <Skeleton height={20} width={24} />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <Skeleton circle={true} height={24} width={24} />
                      <Skeleton width={200} style={{ marginLeft: '8px' }} />
                    </div>
                  </>
                ) : (
                  Confirmwarehouse.deliveryMethod !== 'pickup' && (
                    <>
                      <CIcon icon={cilArrowBottom} size="lg" />
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                        <CIcon icon={cilLocationPin} size="lg" />
                        <label style={{ marginLeft: '8px' }}>ASSY PLANT 1 KARAWANG</label>
                      </div>
                    </>
                  )
                )}
              </div>

              {loading ? (
                <Skeleton height={20} width={150} />
              ) : (
                Confirmwarehouse.deliveryMethod !== 'pickup' && (
                  <>
                    <hr />
                    <label className="fw-bold mb-2">Deadline Order</label>
                    <div>
                      <CFormInput
                        type="text"
                        value={`${Confirmwarehouse.scheduleDelivery || ''} WIB `}
                        readOnly
                        style={{
                          backgroundColor: '#FBFBFB', // Latar belakang abu-abu muda
                          color: '#888', // Warna teks abu-abu
                          border: '1px solid #ccc', // Border abu-abu
                        }}
                      />
                    </div>
                  </>
                )
              )}
              <hr />
              <label className="fw-bold mb-2">GI Method</label>
              {loading ? (
                <Skeleton width={250} height={20} />
              ) : (
                <CFormCheck
                  type="radio"
                  id="payment2"
                  label={`${Confirmwarehouse.paymentMethod} = ${Confirmwarehouse.paymentNumber}`}
                  checked={false}
                  disabled
                />
              )}

              <hr />
              {loading ? (
                <Skeleton count={3} />
              ) : (
                <CFormTextarea
                  className="mt-3"
                  rows={3}
                  value={Confirmwarehouse.remarks || 'No message'}
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
            {loading ? (
              <Skeleton circle={true} height={24} width={24} />
            ) : (
              <CIcon icon={cilCart} size="lg" />
            )}
          </CButton>
        </CCol>

        <CCol xs={8}>
          <CRow className="g-2">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <CCard className="h-80 rounded-45 bg-grey" key={index}>
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center">
                        <CCol xs="1">
                          <Skeleton height={60} width={60} />
                        </CCol>
                        <CCol xs="6">
                          <Skeleton count={2} />
                        </CCol>
                        <CCol xs="3">
                          <Skeleton width={100} height={40} />
                        </CCol>
                        <CCol xs="2">
                          <Skeleton width={80} height={30} />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))
              : Confirmwarehouse.Detail_Orders.map((product) => (
                  <CCard className="h-80 rounded-45 bg-grey" key={product.id}>
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
                            <br />
                            <label className="fw-bold">
                              {product.Inventory.Address_Rack.addressRackName}
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
                            <CButtonGroup role="group" aria-label="Basic outlined example">
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
                                className="text-center" // Utility class for centering text
                              />

                              <CButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                onClick={() => handleIncreaseQuantity(product.id)}
                              >
                                +
                              </CButton>
                            </CButtonGroup>
                            <span className="px-2 fw-light">
                              ({product.Material?.uom || 'UOM'})
                            </span>
                          </div>
                        </CCol>
                        <CCol xs="2" className="d-flex justify-content-end align-items-center">
                          {product.isReject == 1 ? (
                            <CBadge color="danger">Rejected</CBadge> // Show rejection badge
                          ) : (
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleModalCart(product)}
                            >
                              Reject
                            </CButton>
                          )}
                        </CCol>
                      </CRow>
                      <CRow>
                        {/* modal */}
                        {modalConfirm && selectedProduct && (
                          <CModal visible={modalConfirm} onClose={() => setModalConfirm(false)}>
                            <CModalHeader>
                              <CModalTitle>Provide Rejection Reason</CModalTitle>
                            </CModalHeader>
                            <CModalBody>
                              <CRow className="mb-2">
                                <CCol md="4">
                                  <CImage
                                    src={'https://via.placeholder.com/150'}
                                    // alt={selectedProduct.Material.description}
                                    fluid
                                    className="rounded"
                                  />
                                </CCol>
                                <CCol md="8">
                                  <strong>{selectedProduct.Inventory.Material.description}</strong>
                                  <p> {selectedProduct.Inventory.Material.materialNo}</p>
                                  <div className="d-flex align-items-center"></div>
                                </CCol>
                              </CRow>
                              <CFormInput
                                type="text"
                                placeholder="Enter rejection reason"
                                value={rejectionReason}
                                onChange={handleInputChange}
                              />
                            </CModalBody>
                            <CModalFooter>
                              <CButton color="danger" onClick={handleConfirmRejection}>
                                Submit Reject
                              </CButton>
                            </CModalFooter>
                          </CModal>
                        )}
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
            ,
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
