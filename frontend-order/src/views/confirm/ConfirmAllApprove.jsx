import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { InputText } from 'primereact/inputtext'
import { format, parseISO } from 'date-fns'
import useVerify from '../../hooks/UseVerify'
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
  CTabs,
  CTabList,
  CTab,
  CTabContent,
  CTabPanel,
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
  cilInbox,
  cilKeyboard,
  cilUser,
  cilCart,
  cilCalendar,
  cilSearch,
  cilClipboard,
  cilHome,
  cilCheckCircle,
  cilTruck,
  cilWalk,
  cilCircle,
} from '@coreui/icons'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useApprovalService from '../../services/ApprovalService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'
import Pagination from '../../components/Pagination'

import 'react-datepicker/dist/react-datepicker.css' // Import datepicker style

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
  const [categoriesData, setCategoriesData] = useState([])
  const [searchQuery, setSearchQuery] = useState('') // New state for search query
  const [dates, setDates] = useState([null, null]) // State for date range
  const { getProduct } = useProductService()
  const [selectedDate, setSelectedDate] = useState(null) // State for selected date
  const { getMasterData } = useMasterDataService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentProducts, setCurrentProducts] = useState([])
  const navigate = useNavigate()
  const [myApprovalData, setMyApprovalData] = useState([])
  const { getApproval } = useApprovalService()
  const { warehouse } = useContext(GlobalContext)
  const [activeTab, setActiveTab] = useState('line head')
  const { roleName } = useVerify()
  const [orderHistory, setOrderHistory] = useState([])
  const { getMyorder, getOrderHistory } = useOrderService()
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const apiCategory = 'category'
  const apiUser = 'user'
  const icons = {
    cilClipboard,
    cilHome,
    cilUser,
    cilCheckCircle,
    cilTruck,
    cilWalk,
    cilCircle,
  }
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 detik loading simulasi

    return () => clearTimeout(timeout)
  }, [])

  const getApprove = async (page, startDate, endDate) => {
    try {
      if (warehouse && warehouse.id) {
        let response
        if (activeTab == 'approved') {
          response = await getApproval({
            id: warehouse.id,
            page: page,
            isApproved: 1,
            startDate: startDate,
            endDate: endDate,
            q: searchQuery,
          })
        } else {
          response = await getApproval({
            id: warehouse.id,
            page: page,
            startDate: startDate,
            endDate: endDate,
            q: searchQuery,
          })
        }
        if (!response?.data?.orders) {
          console.error('No orders found')
          setMyApprovalData([])
          return
        }
        console.log('response', response)
        const newData = response.data.orders
        setMyApprovalData((prevData) => [...prevData, ...newData])
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching Approval:', error)
    }
  }

  const getUsers = async () => {
    const response = await getMasterData(apiUser)
    setUserData(response.data)
  }

  const getOrderHistories = async (id) => {
    try {
      const response = await getOrderHistory(id)
      setOrderHistory(response.data)
    } catch (error) {
      console.error('Error fetching Order History:', error)
    }
  }

  useEffect(() => {
    if (dates[0] && dates[1]) {
      setMyApprovalData([])
      const startDate = format(dates[0], 'yyyy-MM-dd')
      const endDate = format(dates[1], 'yyyy-MM-dd')
      getApprove(1, startDate, endDate)
      return
    }
    getApprove(1)
  }, [warehouse, activeTab, dates])

  // useEffect(() => {
  //   getApprove(0)
  //   getUsers
  // }, [warehouse])
  // console.log('aba', myApprovalData)
  // console.log('aca', warehouse.id)
  // console.log('ada', activeTab)

  const filteredProducts = selectedDate
    ? productsData.filter((product) => {
        const productDate = new Date(product.date) // Adjust this based on your product date field
        return (
          productDate.getFullYear() === selectedDate.getFullYear() &&
          productDate.getMonth() === selectedDate.getMonth() &&
          productDate.getDate() === selectedDate.getDate()
        )
      })
    : productsData

  const getSeverity = (status) => {
    switch (status) {
      case 'waiting approval':
        return 'warning'
      case 'waiting confirmation':
        return 'warning'
      case 'on process':
        return 'warning'
      case 'approved':
        return 'success'
      case 'ready to deliver':
        return 'secondary'
      case 'ready to pickup':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'primary'
    }
  }

  // Total harga produk
  useEffect(() => {
    const newTotal = currentProducts.reduce((acc, product) => {
      if (checkedItems[product.id]) {
        const quantity = quantities[product.id] || 1 // Ambil jumlah dari quantities atau gunakan 1 sebagai default
        return acc + product.Material.price * quantity
      }
      return acc
    }, 0)
    setTotalAmount(newTotal)
  }, [checkedItems, quantities, currentProducts])

  const handleViewHistoryOrder = (initialConfirmApproval) => {
    setSelectedProduct(initialConfirmApproval)
    setVisible(true)
    navigate('/approveall/approve-confirm', { state: { initialConfirmApproval } })
  }

  // Function to filter through productsData
  const searchProducts = (query) => {
    if (!query) return []
    const lowerCaseQuery = query.toLowerCase()

    return myOrderData.filter((product) => {
      const productName = product.Detail_Orders[0].Inventory.Material.description?.toLowerCase()
      const productTransaction = product.Detail_Orders[0].order.transactionNumber?.toLowerCase()

      return (
        (productName && productName.includes(lowerCaseQuery)) ||
        (productTransaction && productTransaction.includes(lowerCaseQuery))
      )
    })
  }
  const handleTabChange = (newStatus) => {
    setMyApprovalData([])
    setActiveTab(newStatus)
  }
  const handleApproveDetail = (approval) => {
    // getOrderHistories(product.id)
    getOrderHistories(approval.id)
    setSelectedProduct(approval)
    setVisible(true)
    console.log('aa', approval)
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setMyApprovalData([])
      getApprove(1)
    }
  }
  const handlePageChange = (page) => {
    setMyApprovalData([])
    setCurrentPage(page)
    getApprove(page)
  }

  return (
    <>
      <CRow>
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            <h3 className="fw-bold fs-4">GOOD ISSUE APPROVAL</h3>

            <CRow>
              {/* Left side: Search field */}
              <CCol xs={8} sm={8} md={7} lg={5}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '60%',
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
                      style={{ width: '100%', border: 'none', outline: 'none' }}
                    />
                  </div>
                  <label style={{ fontSize: '0.5em ', marginLeft: '8px' }}>
                    {' '}
                    *Search by No Transaction & Name Recipent
                  </label>
                </div>
              </CCol>
              <CCol xs={4} sm={4} md={5} lg={7} className="d-flex justify-content-end ">
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
          </CCardBody>
        </CCard>
      </CRow>
      <CTabs activeItemKey={'waiting approval'}>
        <CTabList variant="pills">
          <CTab
            aria-controls="Confirmation-tab-pane"
            itemKey={'waiting approval'}
            onClick={() => handleTabChange()}
          >
            Waiting Approve
          </CTab>
          <CTab
            aria-controls="Ready Pickup-tab-pane"
            itemKey={'approved'}
            onClick={() => handleTabChange('approved')}
          >
            Approved
          </CTab>
        </CTabList>

        {/* Container for product cards with scroll */}

        <CTabContent>
          <CTabPanel
            className="p-1"
            aria-labelledby="Confirmation-tab-pane"
            itemKey={'waiting approval'}
          >
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                {/* Scrollable product cards */}

                <CRow className="g-1 mt-1">
                  {isLoading ? (
                    // Tampilkan Skeleton Loader
                    <>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                          <Skeleton height={150} />
                        </div>
                      ))}
                    </>
                  ) : myApprovalData.length > 0 ? (
                    // Data Approval
                    myApprovalData.map((approval) => (
                      <CCard className="h-78 mb-2" key={approval.id}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            {/* Order information */}
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CCol>
                                <CIcon className="me-2" icon={cilUser} />
                                <label className="me-2 fs-6">
                                  {format(parseISO(approval.transactionDate), 'dd/MM/yyyy')}
                                </label>
                                <CBadge
                                  className="me-2"
                                  color={getSeverity(approval.status)}
                                  style={{ textTransform: 'uppercase' }}
                                >
                                  {approval.status}
                                </CBadge>

                                <label className="me-2 fw-light">
                                  {approval.transactionNumber
                                    ? approval.transactionNumber
                                    : approval.requestNumber}
                                </label>
                              </CCol>
                              <label className="fw-bold fs-6">
                                Total: {approval.Detail_Orders.length}
                              </label>
                            </div>
                          </CRow>
                          <hr />

                          {/* Product and user information */}
                          <CRow>
                            <CCol xs="1"></CCol>
                            <CCol xs="4">
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div>
                                  <strong>From:</strong> {approval.User.name}
                                </div>
                                <div>
                                  <strong>Role:</strong> {approval.User.position}
                                </div>
                                <div>
                                  <strong>Section:</strong>{' '}
                                  {approval.User.Organization.Section.sectionName}
                                </div>
                              </div>
                            </CCol>

                            <CCol className="text-end">
                              <label className="fw-bold fs-6 me-1">
                                Rp{' '}
                                {approval.Detail_Orders.reduce(
                                  (total, order) => total + (order.Inventory.Material.price || 0),
                                  0,
                                ).toLocaleString('id-ID')}
                              </label>
                              <br />
                              <label className="me-1">
                                <span className="fw-light">{approval.paymentMethod}:</span>{' '}
                                {approval.paymentNumber}
                              </label>
                            </CCol>
                          </CRow>

                          {/* View Detail button */}
                          <CRow className="d-flex justify-content-end align-items-center">
                            <CCol xs={4} className="d-flex justify-content-end">
                              <CButton
                                onClick={() => handleViewHistoryOrder(approval)} // Pass the approval data when clicked
                                size="sm"
                                style={{
                                  backgroundColor: 'white',
                                  color: '#219fee',
                                  border: '1px solid #219fee', // Optional: if you want a border with the same color as the text
                                }}
                              >
                                View Detail Approved
                              </CButton>
                            </CCol>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))
                  ) : (
                    <p>No Approval available.</p>
                  )}
                </CRow>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </CCard>
            </CRow>
          </CTabPanel>

          <CTabPanel className="p-1" aria-labelledby="Confirmation-tab-pane" itemKey={'approved'}>
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                {/* Scrollable product cards */}
                {console.log('coba data', myApprovalData)}
                <CRow className="g-1 mt-1">
                  {isLoading ? (
                    // Skeleton loading untuk kartu persetujuan
                    Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <CCard className="h-78 mb-2" key={index}>
                          <CCardBody>
                            <Skeleton height={20} width="60%" />
                            <Skeleton height={15} width="40%" />
                            <Skeleton height={15} width="80%" />
                            <hr />
                            <Skeleton height={20} width="50%" />
                            <Skeleton height={20} width="70%" />
                          </CCardBody>
                        </CCard>
                      ))
                  ) : myApprovalData.length > 0 ? (
                    myApprovalData.map((approval) => (
                      <CCard className="h-78 mb-2" key={approval.id}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            {/* Order information */}
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CCol>
                                <CIcon className="me-2" icon={cilUser} />
                                <label className="me-2 fs-6">
                                  {format(parseISO(approval.transactionDate), 'dd/MM/yyyy')}
                                </label>
                                <CBadge
                                  className="me-2"
                                  color={getSeverity(approval.status)}
                                  style={{ textTransform: 'uppercase' }}
                                >
                                  {approval.status}
                                </CBadge>
                                <label className="me-2 fw-light">
                                  {approval.transactionNumber
                                    ? approval.transactionNumber
                                    : approval.requestNumber}
                                </label>
                              </CCol>
                              <label className="fw-bold fs-6">
                                Total: {approval.Detail_Orders.length}
                              </label>
                            </div>
                          </CRow>
                          <hr />

                          {/* Product and user information */}
                          <CRow>
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
                                  <strong>From:</strong> {approval.User.name}
                                </div>
                                <div>
                                  <strong>Role:</strong> {approval.User.position}
                                </div>
                                <div>
                                  <strong>Section:</strong>{' '}
                                  {approval.User.Organization.Section.sectionName}
                                </div>
                              </div>
                            </CCol>

                            <CCol className="text-end">
                              <label className="fw-bold fs-6 me-1">
                                Rp {approval.totalPrice.toLocaleString('id-ID')}
                              </label>
                              <br />
                              <label className="me-1">
                                <span className="fw-light">{approval.paymentMethod}:</span>{' '}
                                {approval.paymentNumber}
                              </label>
                            </CCol>
                          </CRow>

                          {/* View Detail button */}
                          <CRow className="d-flex justify-content-end align-items-center">
                            <CCol xs={4} className="d-flex justify-content-end">
                              <CButton
                                onClick={() => handleApproveDetail(approval)} // Pass the approval data when clicked
                                size="sm"
                                style={{
                                  backgroundColor: 'white',
                                  color: '#219fee',
                                  border: '1px solid #219fee', // Optional: if you want a border with the same color as the text
                                }}
                              >
                                View Detail Approved
                              </CButton>
                            </CCol>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))
                  ) : (
                    // Skeleton Loader untuk kondisi kosong
                    <label>order not found</label>
                  )}
                </CRow>
              </CCard>
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
                              {format(parseISO(selectedProduct.transactionDate), 'dd/MM/yyyy')}
                            </label>
                            <CBadge
                              className="me-2"
                              size="md"
                              color={getSeverity(selectedProduct.status)}
                            >
                              {selectedProduct.status?.toUpperCase()}
                            </CBadge>
                            <label className="me-2 fw-light">{selectedProduct.requestNumber}</label>
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
                                src={`${config.BACKEND_URL}${detail.Inventory.Material.img}`}
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
                                Rp {detail.Inventory.Material.price.toLocaleString('id-ID') || '0'}
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
                                    marginRight: '15px',
                                    fontSize: '0.8rem',
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
                                    fontSize: '0.91rem',
                                    textTransform: 'capitalize',
                                    color: isFirst ? '#000' : '#495057', // Hitam untuk status pertama, abu-abu gelap untuk lainnya
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label> By : {item.User.name}</label>
                                    <label>{item.status}</label>
                                    <label> Remark : {item.remarks}</label>
                                  </div>
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
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
