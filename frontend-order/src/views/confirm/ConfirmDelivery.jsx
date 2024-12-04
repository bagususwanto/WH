import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
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
  CModal,
  CModalHeader,
  CModalFooter,
  CModalTitle,
  CModalBody,
  CBadge,
  CContainer,
  CFormInput,
  CFormCheck,
  CFooter,
  CFormLabel,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBatteryEmpty,
  cilClipboard,
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
  cilCarAlt,
  cilPin,
  cilArrowBottom,
  cilLocationPin,
  cilTruck,
} from '@coreui/icons'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import Swal from 'sweetalert2'
import { GlobalContext } from '../../context/GlobalProvider'
import withReactContent from 'sweetalert2-react-content'
import useWarehouseService from '../../services/WarehouseService'

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

const ApproveAll = () => {
  const [productsData, setProductsData] = useState([])
  const [userData, setUserData] = useState([])
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [categoriesData, setCategoriesData] = useState([])
  const { getProduct } = useProductService()
  const { getMasterData } = useMasterDataService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentProducts, setCurrentProducts] = useState([])
  const MySwal = withReactContent(Swal)
  const apiUser = 'user'
  const [isPickup, setIsPickup] = useState(true)
  const [iswbs, setIswbs] = useState(true)
  const { completeWarehouse } = useWarehouseService()
  const savedConfirmWarehouse = JSON.parse(localStorage.getItem('CompleteWarehouse')) || {}
  const [Confirmwarehouse, setConfirmwarehouse] = useState(savedConfirmWarehouse)
  const navigate = useNavigate()
  const [selectedCardIndexes, setSelectedCardIndexes] = useState([]) // Store multiple selected card indexes
  const apiCategory = 'category'
  const { warehouse } = useContext(GlobalContext)
  const [message, setMessage] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [loading, setLoading] = useState(true) // Add loading state

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
      localStorage.setItem('CompleteWarehouse', JSON.stringify(Confirmwarehouse))
    }
  }, [Confirmwarehouse])

  // Pastikan initialConfirmWarehouse tetap sinkron

  useEffect(() => {
    return () => {
      // Bersihkan data dari localStorage ketika halaman tidak lagi digunakan
      localStorage.removeItem('CompleteWarehouse')
    }
  }, [])

  // This is where currentProducts is initialized

  //useeffect quantity
  useEffect(() => {
    // Map the quantities from the API response (Confirmapproval.Detail_Orders)
    const initialQuantities = Confirmwarehouse.Detail_Orders?.reduce((acc, product) => {
      acc[product.id] = product.quantity // Store the quantity with the product id
      return acc
    }, {})
    setQuantities(initialQuantities) // Set the quantities state
  }, [Confirmwarehouse])

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
          const response = await completeWarehouse(warehouseId, orderId, data)

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
  const toggleSelectItem = (index) => {
    setSelectedItems((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle status untuk item berdasarkan index
    }))
  }

  return (
    <CContainer>
      <CRow className="mt-1">
        <CCol xs={4}>
          <CCard className="rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {loading ? (
                <Skeleton height={30} width="100%" />
              ) : (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <label className="fw-bold mb-2">Total: {totalQuantity} Item</label>
                  <CButton color="primary" onClick={handleApprove}>
                    Confirm Now
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>

          <CCard className="mt-2 rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                {loading ? (
                  <>
                    <Skeleton circle width={60} height={60} />
                    <div style={{ marginLeft: '16px', width: '100%' }}>
                      <Skeleton height={20} width="70%" />
                      <Skeleton height={20} width="60%" />
                      <Skeleton height={16} width="50%" />
                    </div>
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
                        <strong>FORM:</strong> {Confirmwarehouse.User?.name}
                      </div>
                      <div>
                        <strong>LINE:</strong> {Confirmwarehouse.User?.Organization.Line.lineName}
                      </div>
                      <div>
                        <small className="fw-light" style={{ marginRight: '5px' }}>
                          Request at
                        </small>
                        <small>
                          {format(parseISO(Confirmwarehouse.transactionDate), 'dd/MM/yyyy')}
                        </small>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <label className="fw-bold mb-2">Select Delivery Type</label>
              {loading ? (
                <Skeleton height={20} width="60%" />
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
                {loading ? (
                  <>
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={20} width="70%" style={{ marginLeft: '16px' }} />
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CIcon icon={cilHome} size="lg" />
                      <label style={{ marginLeft: '8px' }}>Warehouse Issuing Plant</label>
                    </div>
                    {Confirmwarehouse.deliveryMethod !== 'pickup' && (
                      <>
                        <CIcon icon={cilArrowBottom} size="lg" />
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                          <CIcon icon={cilLocationPin} size="lg" />
                          <label style={{ marginLeft: '8px' }}>ASSY PLANT 1 KARAWANG</label>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {Confirmwarehouse.deliveryMethod !== 'pickup' && (
                <>
                  <hr />
                  <label className="fw-bold mb-2">Deadline Order</label>
                  {loading ? (
                    <Skeleton height={30} width="100%" />
                  ) : (
                    <CFormInput
                      type="text"
                      value={`${Confirmwarehouse.scheduleDelivery || ''} WIB `}
                      readOnly
                      style={{
                        backgroundColor: '#f0f0f0',
                        color: '#888',
                        border: '1px solid #ccc',
                      }}
                    />
                  )}
                </>
              )}
              <hr />

              <label className="fw-bold mb-2">GI Method</label>
              {loading ? (
                <Skeleton height={20} width="80%" />
              ) : (
                <CFormCheck
                  type="radio"
                  id="payment2"
                  label={`${Confirmwarehouse.paymentMethod} = ${Confirmwarehouse.paymentNumber}`}
                  checked={iswbs}
                  onChange={() => setIswbs(false)}
                  disabled
                />
              )}
              <hr />

              {loading ? (
                <Skeleton height={60} width="100%" />
              ) : (
                <CFormTextarea
                  className="mt-3"
                  rows={3}
                  value={Confirmwarehouse.remarks || 'No message'}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    backgroundColor: '#FBFBFB', // Latar belakang abu-abu muda
                    color: '#888', // Warna teks abu-abu
                    border: '1px solid #ccc', // Border abu-abu
                  }}
                  disabled
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={8}>
          <CRow className="g-2">
            {loading
              ? // Jika loading, tampilkan skeleton
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <CCard
                      key={index}
                      className="d-flex flex-column justify-content-between"
                      style={{
                        backgroundColor: 'white',
                        cursor: 'default',
                      }}
                    >
                      <CCardBody className="d-flex flex-column justify-content-between">
                        <CRow className="align-items-center">
                          <CCol xs="1">
                            <Skeleton height={60} width={60} />
                          </CCol>
                          <CCol xs="8">
                            <Skeleton height={20} width="100%" />
                            <Skeleton height={16} width="80%" style={{ marginTop: '5px' }} />
                          </CCol>
                          <CCol xs="2">
                            <Skeleton height={20} width="100%" />
                          </CCol>
                        </CRow>
                      </CCardBody>
                    </CCard>
                  ))
              : // Jika tidak loading, tampilkan data sebenarnya
                Confirmwarehouse.Detail_Orders?.map((product, index) => (
                  <CCard
                    key={index}
                    className="d-flex flex-column justify-content-between"
                    onClick={() => toggleSelectItem(index)}
                    style={{
                      backgroundColor: selectedItems[index] ? '#A1C398' : 'white', // Hijau jika dipilih, putih jika tidak
                      cursor: 'pointer', // Tambahkan kursor pointer untuk efek klik
                    }}
                  >
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center">
                        <CCol xs="1">
                          <CCardImage
                            src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
                            style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                          />
                        </CCol>
                        <CCol xs="8">
                          <div style={{ lineHeight: '1.3' }}>
                            <label
                              style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}
                            >
                              {product.Inventory.Material?.description}
                            </label>
                            <label
                              style={{ fontSize: '0.8rem', display: 'block', fontWeight: 'bold' }}
                            >
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
                           <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', marginRight: '0.3rem' }}>
                              {product.quantity}
                            </label>
                            <label style={{ fontSize: '0.9rem' }} className="fw-light">
                              {product.Inventory.Material.uom}
                            </label>
                          </div>
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
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ApproveAll
