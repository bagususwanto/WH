import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { format, parseISO } from 'date-fns'
import Select from 'react-select'
import '../../scss/body_gray.scss'
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
  const { getWarehouseConfirm, postWarehouseConfirm, postWarehouseShopping,rejectWarehouseConfirm } = useWarehouseService()
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
  const [selectedItems, setSelectedItems] = useState([]) // Harus array
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')


  const [loading, setLoading] = useState(true) // Add loading state
  useEffect(() => {
    // Map the quantities from the API response (Confirmapproval.Detail_Orders)
    const initialQuantities = Confirmwarehouse.Detail_Orders.reduce((acc, product) => {
      acc[product.id] = product.quantity // Store the quantity with the product id
      return acc
    }, {})
    setQuantities(initialQuantities) // Set the quantities state
  }, [Confirmwarehouse])

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

  useEffect(() => {
    // Inisialisasi sortedOrders dengan produk asli
    if (Confirmwarehouse.Detail_Orders) {
      setSortedOrders(Confirmwarehouse.Detail_Orders)
    }
  }, [Confirmwarehouse.Detail_Orders])

  // This is where currentProducts is initialized

  const handleAddressCodeChange = (selectedOption) => {
    const selectedCode = selectedOption ? selectedOption.label : ''
    setSelectedAddressCode(selectedCode)

    let filteredOrders

    if (selectedCode === 'All' || selectedCode === '') {
      // Tampilkan semua produk jika "All" dipilih
      filteredOrders = Confirmwarehouse.Detail_Orders || []
    } else {
      // Filter produk berdasarkan Address Rack Name
      filteredOrders = [...Confirmwarehouse.Detail_Orders].filter((product) =>
        product.Inventory.Address_Rack.addressRackName.startsWith(selectedCode),
      )
    }

    // Urutkan produk agar item yang dipilih tetap di atas
    filteredOrders.sort((a, b) => {
      const isSelectedA = selectedItems.some((item) => item.id === a.id)
      const isSelectedB = selectedItems.some((item) => item.id === b.id)

      if (isSelectedA && !isSelectedB) return -1 // Prioritaskan yang dipilih
      if (!isSelectedA && isSelectedB) return 1 // Prioritaskan yang lain
      return 0 // Tetap sesuai urutan
    })

    setSortedOrders(filteredOrders) // Perbarui state
  }

  const handleCardClick = (item) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id)

    if (isSelected) {
      // Jika item sudah dipilih, hapus dari daftar
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id))
    } else {
      // Tambahkan item ke daftar yang dipilih
      setSelectedItems([...selectedItems, item])
    }
  }

  const toggleSelectItem = (index) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedItems = [...prevSelectedItems]
      if (updatedItems.includes(index)) {
        // Jika sudah dipilih, hapus dari daftar
        return updatedItems.filter((item) => item !== index)
      } else {
        // Jika belum dipilih, tambahkan ke daftar
        updatedItems.push(index)
        return updatedItems
      }
    })
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

  const handleIncreaseQuantity = (productId) => {
    setQuantities((prevQuantities) => {
      // Cari produk berdasarkan productId
      const product = Confirmwarehouse.Detail_Orders.find((p) => p.productId === productId);

      // Pastikan produk ditemukan
      if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return prevQuantities; // Jika produk tidak ditemukan, kembalikan state sebelumnya
      }

      const maxQuantity = product.quantity; // Batas maksimum
      const currentQuantity = prevQuantities[productId] || 1; // Kuantitas saat ini, default ke 1 jika tidak ada

      // Periksa apakah kuantitas saat ini masih di bawah batas maksimum
      if (currentQuantity < maxQuantity) {
        return {
          ...prevQuantities,
          [productId]: currentQuantity + 1, // Tambah 1 ke kuantitas saat ini
        };
      }

      // Jika sudah mencapai batas maksimum, tetap return state sebelumnya
      return prevQuantities;
    });
  };

  console.log('Confirmwarehouse.Detail_Orders:', Confirmwarehouse.Detail_Orders);

  // ... (Lanjutkan kode lainnya)


const handleDecreaseQuantity = (productId) => {
  setQuantities((prevQuantities) => ({
    ...prevQuantities,
    [productId]: Math.max(
      (prevQuantities[productId] ||
        Confirmwarehouse.Detail_Orders.find((p) => p.productId === productId).quantity) - 1,
      1
    ),
  }));
};

const handleQuantityChange = (productId, value) => {
  const newQuantity = parseInt(value, 10); // Parsing input sebagai angka
  const product = Confirmwarehouse.Detail_Orders.find((p) => p.productId === productId);

  // Pastikan produk ditemukan
  if (!product) {
    console.error(`Product with ID ${productId} not found`);
    return;
  }

  const maxQuantity = product.quantity; // Batas maksimum

  // Periksa apakah nilai yang dimasukkan valid dan tidak melebihi batas
  if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= maxQuantity) {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: newQuantity, // Set nilai baru
    }));
  } else {
    console.warn(`Invalid quantity: ${newQuantity}. Must be between 1 and ${maxQuantity}.`);
  }
};

const handleInputChange = (e) => {
  setRejectionReason(e.target.value)
}

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
      <CRow className="mt-1">
        <CCol xs={4}>
          <CCard className=" rounded-0" style={{ position: 'sticky', top: '0', zIndex: '10' }}>
            <CCardBody>
              {/* {roleName === 'super admin' && ( */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {loading ? (
                  <Skeleton width={100} />
                ) : (
                  <label className="fw-bold mb-2">Total: {totalQuantity} Item</label>
                )}
                <CButton color="primary" onClick={handleApprove} disabled={loading}>
                  {loading ? <Skeleton width={100} /> : 'Deliver Now'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
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
                      <small>
                        {format(parseISO(Confirmwarehouse.transactionDate), 'dd/MM/yyyy')}
                      </small>
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
                  label={`${Confirmwarehouse.paymentMethod} = ${Confirmwarehouse.paymentNumber}`} // Corrected syntax
                  checked={iswbs}
                  onChange={() => setIswbs(false)} // Corrected to set `iswbs` to false
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
                  value={Confirmwarehouse.remarks || 'No message'} // Jika remarks null, tampilkan "No message"
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
          {/* Address Code Form */}

          <CRow className="g-2">
          <CFormLabel htmlFor="address" style={{ fontSize: '0.8rem', marginBottom: '0rem' }}>
              Address Code
            </CFormLabel>
            <Select
              className="basic-single mt-0"
              classNamePrefix="select"
              options={[
                ...Confirmwarehouse.Detail_Orders.map((order) => ({
                  value: order.Inventory.id,
                  label: order.Inventory.Address_Rack.addressRackName.slice(0, 2), // Ambil 2 karakter pertama
                })).filter(
                  (option, index, self) =>
                    index === self.findIndex((o) => o.label === option.label), // Hilangkan duplikat
                ),
              ]}
              id="address"
              onChange={handleAddressCodeChange}
              value={
                selectedAddressCode
                  ? { label: selectedAddressCode, value: selectedAddressCode }
                  : null
              }
            />
            {loading ? (
              <>
                <Skeleton count={3} height={150} />
              </>
            ) : (
              sortedOrders.map((product, index) => (
                <CCard
                  key={product.id}
                  className="d-flex flex-column justify-content-between"
                  onClick={() => handleCardClick(product)}
               
                >
                  <CCardBody>
                  <CRow className="align-items-center">
                        <CCol xs={2} sm={1} md={1}>
                          <CCardImage
                            src={`${config.BACKEND_URL}${product.Inventory.Material.img}`}
                            style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                          />
                        </CCol>
                        <CCol xs={5} sm={5} md={5}>
                          <div style={{ lineHeight: '1.5' }}>
                            <label style={{ fontSize: '0.9em' }}>
                              {product.Inventory.Material.description}
                            </label>
                            <label
                              style={{ fontSize: '0.7em', fontWeight: 'bold', display: 'block' }}
                            >
                              {product.Inventory.Address_Rack.addressRackName}
                            </label>
                            <label style={{ fontSize: '0.65em', display: 'block' }}>
                              Min Order: {product.Inventory.Material.minOrder}{' '}
                              {product.Inventory.Material.uom}
                            </label>
                          </div>
                        </CCol>
                        <CCol xs={3} sm={3} md={3}>
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
                                disable
                                
                              >
                                +
                              </CButton>
                            </CButtonGroup>
                          </div>
                        </CCol>
                        <CCol xs={2} sm={3} md={3} className="d-flex align-items-center">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            {/* UOM di pojok kiri */}
                            <span
                              className="fw-light"
                              style={{
                                fontSize: '0.8em',
                                textAlign: 'left',
                                flex: '1',
                              }}
                            >
                              ({product.Material?.uom || 'UOM'})
                            </span>

                            {/* Badge Reject di pojok kanan */}
                            {product.isReject == 1 ? (
                              <CBadge
                                color="danger"
                                className="ms-auto"
                                style={{
                                  fontSize: '0.6em',
                                  padding: '5px 10px',
                                  borderRadius: '12px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Rejected
                              </CBadge>
                            ) : (
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                className="ms-auto"
                                onClick={() => handleModalCart(product)}
                              >
                             Red Post
                              </CButton>
                            )}
                          </div>
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
                                  <p style={{ fontSize: '0.8em' }}>
                                    {selectedProduct.Inventory.Address_Rack.addressRackName}
                                  </p>
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
              ))
            )}
          </CRow>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
