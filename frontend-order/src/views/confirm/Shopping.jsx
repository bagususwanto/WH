import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import { format, parseISO } from 'date-fns'
import Select from 'react-select'
import '../../scss/body_gray.scss'
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
  const [selectedItems, setSelectedItems] = useState([]) // Harus array
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
                  {loading ? <Skeleton width={100} /> : 'Delivery Now'}
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
                      <small>{format(parseISO(Confirmwarehouse.createdAt), 'dd/MM/yyyy')}</small>
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
              <label className="fw-bold mb-2">GI Methode</label>
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
                disabled
              />
            )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={8}>
          {/* Address Code Form */}

          <CRow className="g-2">
            <CFormLabel className="mb-1" htmlFor="address">
              Address Code
            </CFormLabel>
            <Select
              className="basic-single mt-1"
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
                  style={{
                    backgroundColor: selectedItems.some((item) => item.id === product.id)
                      ? '#C6EBC5'
                      : 'white', // Highlight item yang dipilih
                    cursor: 'pointer', // Tambahkan gaya pointer untuk indikasi klik
                  }}
                >
                  <CCardBody>
                    <CRow className="align-items-center">
                      <CCol xs="1">
                        <CCardImage
                          src={'https://via.placeholder.com/150'}
                          style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                        />
                      </CCol>

                      <CCol xs="8">
                        <div>
                          <label style={{ fontSize: '1em' }}>
                            {product.Inventory.Material?.description}
                          </label>
                          <br />
                          <label style={{ fontSize: '0.9em' }} className="fw-bold">
                            {product.Inventory.Address_Rack?.addressRackName}
                          </label>
                        </div>
                      </CCol>
                      <CCol xs="3">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '0.8em',
                          }}
                        >
                          <label style={{ fontSize: '1rem', lineHeight: '2' }}>
                            {`${product.quantity} ${product.Inventory.Material.uom}`}
                          </label>
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
              ))
            )}
          </CRow>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Confirm
