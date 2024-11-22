import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { format, parseISO } from 'date-fns'
import '../../scss/modal_backdrop.scss'
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
  CTab,
  CTabs,
  CTabList,
  CTabContent,
  CTabPanel,
  CBadge,
  CFormInput,
  CFormCheck,
  CFooter,
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
  cilCalendar,
  cilCart,
  cilHeart,
  cilSearch,
  cilArrowLeft,
  cilBan,
  cilCarAlt,
  cilPin,
  cilCheckCircle,
  cilClipboard,
  cilTruck,
  cilWalk,
  cilCircle,
} from '@coreui/icons'
import { GlobalContext } from '../../context/GlobalProvider'
import useWarehouseService from '../../services/WarehouseService'
import { InputText } from 'primereact/inputtext'
import Pagination from '../../components/Pagination'
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
  const [dates, setDates] = useState([null, null]) // State for date range
  const [productsData, setProductsData] = useState([])
  const [userData, setUserData] = useState([])
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [searchQuery, setSearchQuery] = useState('') // New state for search query
  const [quantities, setQuantities] = useState({})
  const { getWarehouseConfirm } = useWarehouseService()
  const [currentProducts, setCurrentProducts] = useState([])
  const [activeTab, setActiveTab] = useState('Waiting Confirmation')
  const navigate = useNavigate()
  const [orderHistory, setOrderHistory] = useState([])
  const { warehouse } = useContext(GlobalContext)
  const [selectedProduct, setSelectedProduct] = useState(null) // Add this state
  const [visible, setVisible] = useState(false) // State for modal visibility
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const getSeverity = (status) => {
    switch (status) {
      case 'waiting confirmation':
        return 'warning'
      case 'on process':
        return 'success'
      case 'ready to deliver':
        return 'secondary'
      case 'ready to pickup':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'rejected':
        return 'danger'
    }
  }

  const icons = {
    cilClipboard,
    cilHome,
    cilUser,
    cilCheckCircle,
    cilTruck,
    cilWalk,
    cilCircle,
  }

  const getWarehouseConfirmations = async (page, startDate, endDate) => {
    try {
      if (warehouse && warehouse.id) {
        let response
        if (activeTab == 'rejected') {
          response = await getWarehouseConfirm({
            id: warehouse.id,
            page: page,
            isReject: 1,
            startDate: startDate,
            endDate: endDate,
            q: searchQuery,
          })
        } else {
          response = await getWarehouseConfirm({
            id: warehouse.id,
            status: activeTab,
            page: page,
            startDate: startDate,
            endDate: endDate,
            q: searchQuery,
          })
        }
        if (!response?.data?.data) {
          console.error('No confirm found')
          setProductsData([])
          return
        }
        console.log('response', response)
        const newData = response.data.data
        setProductsData((prevData) => [...prevData, ...newData])
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching confirm:', error)
    }
  }
  const getOrderHistories = async (id) => {
    try {
      const response = await getWarehouseConfirm(id)
      setOrderHistory(response.data.data)
      console.log('respon', response)
    } catch (error) {
      console.error('Error fetching Order History:', error)
    }
  }

  useEffect(() => {
    if (dates[0] && dates[1]) {
      setProductsData([])
      const startDate = format(dates[0], 'yyyy-MM-dd')
      const endDate = format(dates[1], 'yyyy-MM-dd')
      getWarehouseConfirmations(1, startDate, endDate)
      return
    }
    getWarehouseConfirmations(1)
  }, [warehouse, activeTab, dates])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setProductsData([])
      getWarehouseConfirmations(1)
    }
  }

  const handlePageChange = (page) => {
    setProductsData([])
    setCurrentPage(page)
    getWarehouseConfirmations(page)
  }

  const handleTabChange = (newStatus) => {
    setActiveTab(newStatus)
    setProductsData([])
    setCurrentPage(1)
  }
  // Total harga produk
  const handleWarehouseConfirmationproduct = (product) => {
    if (activeTab === 'Completed') {
      getOrderHistories(product.id)
      setSelectedProduct(product) // Simpan produk yang dipilih ke state
      setVisible(true) // Tampilkan modal
      return
    }

    const statusHandlerMap = {
      'Waiting Confirmation': handleWaitingConfirmation,
      'On Process': handleOnProcess,
      'Ready to Deliver': handleReadyToDeliver,
      'Ready to Pickup': handleReadyToPickup,
    }

    const handler = statusHandlerMap[activeTab] || handleDefault
    handler(product) // Panggil handler yang sesuai
  }
  const handleWaitingConfirmation = (initialConfirmWarehouse) => {
    setSelectedProduct(initialConfirmWarehouse)
    setVisible(true)
    localStorage.setItem('confirmWarehouse', JSON.stringify(initialConfirmWarehouse))
    navigate('/confirmwer', { state: { initialConfirmWarehouse } })
  }

  const handleOnProcess = (product) => {
    setSelectedProduct(product)
    setVisible(true)
    localStorage.setItem('shoppingWarehouse', JSON.stringify(product))
    navigate('/shopping', { state: { product } })
  }

  const handleReadyToDeliver = (product) => {
    setSelectedProduct(product)
    setVisible(true)
    localStorage.setItem('CompleteWarehouse', JSON.stringify(product))
    navigate('/confirmdel', { state: { product } })
  }

  const handleReadyToPickup = (product) => {
    setSelectedProduct(product)
    localStorage.setItem('CompleteWarehouse', JSON.stringify(product))
    setVisible(true)
    navigate('/confirmdel', { state: { product } })
  }

  // Fallback for unknown statuses
  const handleDefault = (product) => {
    setSelectedProduct(product)
    setVisible(true)
    navigate('/default-route', { state: { product } })
  }

  const tabs = [
    { key: 'Waiting Confirmation', label: 'Waiting Confirmation' },
    { key: 'On Process', label: 'Shopping' },
    { key: 'Ready to Deliver', label: 'Ready to Delivery' },
    { key: 'Ready to Pickup', label: 'Ready to Pickup' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Rejected', label: 'Rejected' },
  ]

  const getTabIcon = (status) => {
    switch (status) {
      case 'waiting confirmation':
        return cilClipboard // Icon kertas
      case 'on process':
        return cilCart // Icon keranjang
      case 'ready to deliver':
      case 'ready to pickup':
        return cilTruck // Icon truck
      case 'completed':
        return cilCheckCircle // Icon ceklis
      case 'rejected':
        return cilBan // Icon silang
      default:
        return cilClipboard // Default icon
    }
  }

  return (
    <>
      <CRow className="mt-0">
        <h3 className="fw-bold fs-4">Warehouse Confirmation</h3>

        <CCol xs={6} sm={6} md={6} lg={6} className="py-2">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '50%',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '4px 8px',
              }}
            >
              {/* CoreUI Search Icon */}
              <CIcon
                icon={cilSearch}
                style={{ marginRight: '8px', color: '#888', fontSize: '1.2em' }}
              />

              <InputText
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Hanya mengupdate state
                onKeyDown={handleKeyDown} // Tambahkan handler untuk event enter
                placeholder="Search"
                style={{ width: '50%', border: 'none', outline: 'none' }}
              />
            </div>
            <label style={{ fontSize: '0.5em ', marginLeft: '8px' }}>
              {' '}
              *Search by No Transaction & Name/Section Recipent
            </label>
          </div>
        </CCol>
        <CCol xs={6} sm={6} md={6} lg={6} className="d-flex justify-content-end py-2">
          <div
            className="flatpickr-wrapper"
            style={{ position: 'relative', width: '300px', height: '36px' }}
          >
            <CIcon
              icon={cilCalendar}
              size="lg"
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <Flatpickr
              value={dates}
              onChange={(selectedDates) => setDates(selectedDates)}
              options={{
                mode: 'range',
                dateFormat: 'Y-m-d',
              }}
              className="form-control"
              placeholder="Select a date"
              style={{
                paddingLeft: '40px', // Beri ruang untuk ikon
                height: '100%',
              }}
            />
          </div>
        </CCol>
      </CRow>
      <CTabs activeItemKey={activeTab}>
        <CTabList variant="pills">
          {tabs.map((tab) => (
            <CTab key={tab.key} itemKey={tab.key} onClick={() => handleTabChange(tab.key)}>
              {tab.label}
            </CTab>
          ))}
        </CTabList>

        <CTabContent>
          {tabs.map((tab) => (
            <CTabPanel key={tab.key} itemKey={tab.key}>
              <CRow className="mt-1">
                {productsData.length > 0 ? (
                  productsData.map((product) => (
                    <CCard className="d-block w-100 p-3 mb-2" key={product.id}>
                      <CRow className="align-items-center">
                        
                          <CCol >
                            <CIcon className="me-2" icon={getTabIcon(product.status)} />
                            <label className="me-2 fs-6">
                              {format(parseISO(product.createdAt), 'dd/MM/yyyy')}
                            </label>
                            <CBadge className="me-2" color={getSeverity(product.status)}>
                              {product.isReject === 1 ? 'REJECTED' : product.status.toUpperCase()}
                            </CBadge>
                            <label className="me-2 fw-light">
                              {product.transactionNumber
                                ? `${product.transactionNumber}`
                                : `${product.requestNumber}`}
                            </label>
                          </CCol>
                      
                        <hr style={{marginTop:'3px'}}/>
                        <CRow className="py-1" >
                          <CCol xs="1">
                            {userData.map((user) => (
                              <CCardImage
                                key={user.id}
                                src={user.img}
                                style={{ height: '100%', width: '100%' }}
                              />
                            ))}
                          </CCol>
                          <CCol xs="4">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div>
                                <strong>From:</strong> {product.User.name}
                              </div>
                              <div>
                                <strong>Role:</strong> {product.User.position}
                              </div>
                              <div>
                                <strong>Section:</strong>{' '}
                                {product?.User?.Organization?.Section?.sectionName}
                              </div>
                            </div>
                          </CCol>
                          <CCol xs="4">
                            {product.Detail_Orders.length === 1 ? (
                              <label>
                                {product.Detail_Orders[0]?.Inventory?.Material?.description}
                              </label>
                            ) : (
                              <label>
                                {product.Detail_Orders[0]?.Inventory?.Material?.description}
                                ...
                              </label>
                            )}
                            <br />
                            <label className="fw-bold fs-6">
                              Total: {product.Detail_Orders.length} Item
                            </label>
                          </CCol>
                          <CCol xs="3" className="text-end">
                            <label className="fw-bold fs-6 me-1">
                              Rp{' '}
                              {product.Detail_Orders.reduce(
                                (total, order) => total + (order.Inventory.Material.price || 0),
                                0,
                              ).toLocaleString('id-ID')}
                            </label>
                            <br />
                            <label className="me-1">
                              <span className="fw-light">{product.paymentMethod}:</span>{' '}
                              {product.paymentNumber}
                            </label>
                          </CCol>
                        </CRow>

                        <CRow className="d-flex justify-content-end align-items-center">
                          <CCol xs={4} className="d-flex justify-content-end">
                            <CButton
                              onClick={() => handleWarehouseConfirmationproduct(product)}
                              color="primary"
                              size="sm"
                            >
                              View Detail Confirm
                            </CButton>
                          </CCol>
                        </CRow>
                      </CRow>
                    </CCard>
                  ))
                ) : (
                  <p>No orders found</p>
                )}
              </CRow>

              {console.log('111111', orderHistory)}
              {selectedProduct && (
                <CModal visible={visible} onClose={() => setVisible(false)} className="modal-lg">
                  <CModalHeader>
                    <CModalTitle>Product Details</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CRow className="g-1 mt-2">
                      <CCard className="h-80">
                        <CCardBody>
                          <CRow className="align-items-center mb-3">
                            <CCol>
                              <CIcon className="me-2" icon={cilCart} />
                              <label className="me-2 fs-6">
                                {format(parseISO(selectedProduct.createdAt), 'dd/MM/yyyy')}
                              </label>
                              <CBadge className="me-2" size="md" color="success">
                                {selectedProduct.status?.toUpperCase()}
                              </CBadge>
                              <label className="me-2 fw-light">
                                {selectedProduct.requestNumber}
                              </label>
                            </CCol>
                          </CRow>
                          <hr style={{ height: '2px', backgroundColor: 'black', margin: '2px ' }} />
                          <label
                            className="fw-light mb-1"
                            style={{
                              fontSize: '0.85rem', // Ukuran font kecil
                            }}
                          >
                            List of Product
                          </label>
                          {selectedProduct?.Detail_Orders?.map((detail, index) => (
                            <CRow className="align-items-center mb-2" key={index}>
                              <CCol xs="1">
                                <CCardImage
                                  src={detail.Inventory.Material.img}
                                  style={{ height: '40px', width: '40px', objectFit: 'contain' }} // Smaller image
                                />
                              </CCol>
                              <CCol xs="9">
                                <label style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                                  {' '}
                                  {/* Smaller text */}
                                  {detail.Inventory.Material.description}
                                </label>
                              </CCol>
                              <CCol
                                xs="2"
                                className="text-end"
                                style={{ fontSize: '0.8rem', lineHeight: '1.2' }}
                              >
                                <label className="fw-bold">
                                  Rp{' '}
                                  {detail.Inventory.Material.price.toLocaleString('id-ID') || '0'}
                                </label>
                              </CCol>
                            </CRow>
                          ))}
                          <hr style={{ height: '5px', margin: '2px ' }} />
                          <label
                            className="fw-light mb-1"
                            style={{
                              fontSize: '0.85rem', // Ukuran font kecil
                            }}
                          >
                            Tracking Item
                          </label>
                          {orderHistory.map((item, index) => {
                            const isFirst = index === 0 // Memeriksa apakah item adalah yang pertama

                            return (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                  }}
                                >
                                  {/* Tanggal dan waktu */}
                                  <label
                                    style={{
                                      marginRight: '7px',
                                      fontSize: '0.95rem',
                                      color: isFirst ? '#000' : '#6c757d', // Hitam untuk yang pertama, abu-abu untuk lainnya
                                    }}
                                  >
                                    {format(parseISO(item.createdAt), 'dd MMM yyyy')}
                                    {', '}
                                    {format(parseISO(item.createdAt), 'HH:mm')}
                                  </label>

                                  {/* Ikon dalam lingkaran */}
                                  <div
                                    style={{
                                      border: `2px solid ${isFirst ? '#000' : '#6c757d'}`, // Warna hitam untuk ikon pertama
                                      borderRadius: '50%',
                                      width: '40px',
                                      height: '40px',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <CIcon
                                      icon={icons[item.icon]}
                                      size="lg"
                                      style={{ color: isFirst ? '#000' : '#6c757d' }} // Warna ikon sesuai status
                                    />
                                  </div>

                                  {/* Status */}
                                  <label
                                    style={{
                                      marginLeft: '8px',
                                      fontSize: '0.95rem',
                                      textTransform: 'capitalize',
                                      color: isFirst ? '#000' : '#495057', // Hitam untuk status pertama, abu-abu gelap untuk lainnya
                                    }}
                                  >
                                    {item.status}
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </CCardBody>
                      </CCard>
                    </CRow>
                  </CModalBody>
                </CModal>
              )}
              <div className="d-flex justify-content-center mt-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </CTabPanel>
          ))}
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
