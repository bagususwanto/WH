import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { InputText } from 'primereact/inputtext'
import { format, parseISO } from 'date-fns'
import useVerify from '../../hooks/UseVerify'
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

  const getApprove = async (isApproved) => {
    try {
      if (warehouse && warehouse.id) {
        // Menentukan parameter berdasarkan isApproved

        const response = await getApproval(warehouse.id, isApproved)

        setMyApprovalData(response.data)
        console.log('warehuse id :', warehouse.id)
        console.log('tess', response.data)
      } else {
        console.log('warehouse id not found')
      }
      console.log(activeTab)
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
    getApprove(0)
    getUsers
  }, [warehouse])
  console.log('aba', myApprovalData)
  console.log('aca', warehouse.id)
  console.log('ada', activeTab)

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
      case 'Waiting':
        return 'gray'

      case 'On Process':
        return 'warning'

      case 'Delivery':
        return 'secondary'

      case 'Pickup':
        return 'blue'

      case 'Completed':
        return 'success'

      case 'Rejected':
        return 'danger'
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
    navigate('/confirmapp', { state: { initialConfirmApproval } })
  }

  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query) {
      const results = searchProducts(query)
      setFilteredSuggestions(results.slice(0, 5))
      setShowRecentSearches(false)
    } else {
      setFilteredSuggestions([])
      setShowRecentSearches(searchHistory.length > 0)
    }
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
    setActiveTab(newStatus)
    getApprove(newStatus - 1)
  }
  const handleApproveDetail = (approval) => {
    // getOrderHistories(product.id)
    getOrderHistories(approval.id)
    setSelectedProduct(approval)
    setVisible(true)
    console.log('aa', approval)
  }

  return (
    <>
      <CRow>
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            <h3 className="fw-bold fs-4">GOOD ISSUE APPROVAL</h3>

            <CRow>
              {/* Left side: Search field */}
              <CCol xs={6} sm={6} md={3} lg={3} className="py-2">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
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
              </CCol>
              <CCol xs={6} sm={6} md={9} lg={9} className="d-flex justify-content-end py-2">
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
      <CTabs activeItemKey={1}>
        <CTabList variant="pills">
          <CTab
            aria-controls="Confirmation-tab-pane"
            itemKey={1}
            onClick={() => handleTabChange(1)}
          >
            Waiting Approve
          </CTab>
          <CTab
            aria-controls="Ready Pickup-tab-pane"
            itemKey={2}
            onClick={() => handleTabChange(2)}
          >
            Approved
          </CTab>
        </CTabList>

        {/* Container for product cards with scroll */}

        <CTabContent>
          <CTabPanel className="p-1" aria-labelledby="Confirmation-tab-pane" itemKey={1}>
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                {/* Scrollable product cards */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {myApprovalData.length > 0 ? (
                      myApprovalData.map((approval) => (
                        <CCard className="h-78 mb-2" key={approval.id}>
                          <CCardBody className="d-flex flex-column justify-content-between">
                            <CRow className="align-items-center">
                              {/* Order information */}
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <CCol>
                                  <CIcon className="me-2" icon={cilUser} />
                                  <label className="me-2 fs-6">
                                    {format(parseISO(approval.createdAt), 'dd/MM/yyyy')}
                                  </label>
                                  <CBadge className="me-2" size="sm" color="warning">
                                    {approval.status}
                                  </CBadge>
                                  <label className="me-2 fw-light">{approval.requestNumber}</label>
                                </CCol>
                                <label className="fw-bold fs-6">
                                  Total: {approval.Detail_Orders.length}
                                </label>
                              </div>
                            </CRow>
                            <hr />

                            {/* Product and user information */}
                            <CRow xs="1">
                              <CCol xs="1"></CCol>
                              <CCol xs="4">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div>
                                    <strong>Form:</strong> {approval.User.name}
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
                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewHistoryOrder(approval)} // Pass the approval data when clicked
                                  color="primary"
                                  size="sm"
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
                </div>
              </CCard>
            </CRow>
          </CTabPanel>

          <CTabPanel className="p-1" aria-labelledby="Confirmation-tab-pane" itemKey={2}>
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                {/* Scrollable product cards */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {myApprovalData.length > 0 ? (
                      myApprovalData.map((approval) => (
                        <CCard className="h-78 mb-2" key={approval.id}>
                          <CCardBody className="d-flex flex-column justify-content-between">
                            <CRow className="align-items-center">
                              {/* Order information */}
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <CCol>
                                  <CIcon className="me-2" icon={cilUser} />
                                  <label className="me-2 fs-6">
                                    {format(parseISO(approval.createdAt), 'dd/MM/yyyy')}
                                  </label>
                                  <CBadge className="me-2" size="sm" color="success">
                                    {approval.status}
                                  </CBadge>
                                  <label className="me-2 fw-light">{approval.requestNumber}</label>
                                </CCol>
                                <label className="fw-bold fs-6">
                                  Total: {approval.Detail_Orders.length}
                                </label>
                              </div>
                            </CRow>
                            <hr />

                            {/* Product and user information */}
                            <CRow xs="1">
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
                                    <strong>Form:</strong> {approval.User.name}
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
                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleApproveDetail(approval)} // Pass the approval data when clicked
                                  color="primary"
                                  size="sm"
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
                </div>
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
                              {format(parseISO(selectedProduct.createdAt), 'dd/MM/yyyy')}
                            </label>
                            <CBadge className="me-2" size="md" color="success">
                              {selectedProduct.status?.toUpperCase()}
                            </CBadge>
                            <label className="me-2 fw-light">{selectedProduct.requestNumber}</label>
                          </CCol>
                        </CRow>
                        {selectedProduct?.Detail_Orders?.map((detail, index) => (
                          <CRow className="align-items-center mb-3" key={index}>
                            <CCol xs="1">
                              <CCardImage
                                src={detail.Inventory.Material.img}
                                style={{ height: '100%', width: '100%' }}
                              />
                            </CCol>
                            <CCol xs="9">
                              <label>{detail.Inventory.Material.description || 'N/A'}</label>
                            </CCol>
                            <CCol xs="2" className="text-end">
                              <label className="fw-bold">
                                Rp {detail.Inventory.Material.price.toLocaleString('id-ID') || '0'}
                              </label>
                            </CCol>
                          </CRow>
                        ))}
                        {orderHistory?.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              marginBottom: '16px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <label style={{ marginRight: '8px' }}>
                                {item.createdAt
                                  ? format(parseISO(item.createdAt), 'dd MMM yyyy, HH:mm')
                                  : 'N/A'}
                              </label>
                              <div
                                style={{
                                  border: '2px solid #000',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <CIcon icon={icons[item.icon]} size="lg" />
                              </div>
                              <label style={{ marginLeft: '8px' }}>
                                {item.status
                                  ? item.status.charAt(0).toUpperCase() +
                                    item.status.slice(1).toLowerCase()
                                  : 'N/A'}
                              </label>
                            </div>
                          </div>
                        ))}
                      </CCardBody>
                    </CCard>
                  </CRow>
                </CModalBody>
              </CModal>
            )}
          </CTabPanel>
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
