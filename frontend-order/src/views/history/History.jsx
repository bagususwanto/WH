import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCart,
  cilCalendar,
  cilSearch,
  cilLocationPin,
  cilHome,
  cilClipboard,
  cilUser,
  cilCarAlt,
  cilCheckCircle,
  cilTruck,
  cilWalk,
  cilCircle,
} from '@coreui/icons'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { format, parseISO } from 'date-fns'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'
import { GlobalContext } from '../../context/GlobalProvider'

const iconMap = {
  'Office Supp.': cilCart,
  'Oper Supp.': cilCart,
  'Support Oper': cilCart,
  'Raw.Matr': cilCart,
  'Spare Part': cilCart,
  Tools: cilCart,
}

const History = () => {
  const [myOrderData, setMyOrderData] = useState([])
  const [visible, setVisible] = useState(false)
  const [dates, setDates] = useState([null, null]) // State for date range
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('') // New state for search query
  const [globalFilterValue, setGlobalFilterValue] = useState('') // State for global search filter
  const { getMyorder, getOrderHistory } = useOrderService()
  const { warehouse } = useContext(GlobalContext)
  const [activeTab, setActiveTab] = useState('all')
  const [orderHistory, setOrderHistory] = useState([])
  const navigate = useNavigate()

  const icons = {
    cilClipboard,
    cilHome,
    cilUser,
    cilCheckCircle,
    cilTruck,
    cilWalk,
    cilCircle,
  }

  const getMyorders = async (activeTab) => {
    try {
      if (warehouse && warehouse.id) {
        const response = await getMyorder(warehouse.id, activeTab)
        setMyOrderData(response.data)
        console.log('warehuse id :', warehouse.id)
      } else {
        console.log('warehouse id not found')
      }
      console.log(activeTab)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const getOrderHistories = async (id) => {
    try {
      const response = await getOrderHistory(id)
      setOrderHistory(response.data)
    } catch (error) {
      console.error('Error fetching Order History:', error)
    }
  }

  const handleTabChange = (newStatus) => {
    setActiveTab(newStatus)
  }

  useEffect(() => {
    getMyorders(activeTab)
  }, [warehouse, activeTab])

  const getSeverity = (status) => {
    switch (status) {
      case 'waiting approval':
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
  // Function to handle search input changes and filter suggestions
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
  // Search filter handler
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value)
  }

  // Filtered order data based on search input
  // const filteredOrders = myOrderData.filter(
  //   (order) =>
  //     order.transactionNumber.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
  //     order.Detail_Orders.some((detail) =>
  //       detail.Inventory.Material.description
  //         .toLowerCase()
  //         .includes(globalFilterValue.toLowerCase()),
  //     ),
  // )
  const handleViewHistoryOrder = (product) => {
    getOrderHistories(product.id)
    setSelectedProduct(product)
    setVisible(true)
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'waiting approval', label: 'Waiting Approval' },
    { key: 'waiting confirmation', label: 'Waiting Confirmation' },
    { key: 'on process', label: 'On Process' },
    { key: 'ready to deliver', label: 'Delivery' },
    { key: 'ready to pickup', label: 'Pickup' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
  ]
  return (
    <>
      <CRow>
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            <h3 className="fw-bold fs-4">YOUR HISTORY</h3>

            <CRow>
              {/* Left side: Search field */}
              <CCol xs={3} className="py-2">
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

                  {/* Input Text Field */}
                  <InputText
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search"
                    style={{ width: '100%', border: 'none', outline: 'none' }}
                  />
                </div>
              </CCol>
              <CCol xs={9} className="d-flex justify-content-end">
                {/* Right side: Date picker */}
                <div
                  className="d-flex align-items-center border rounded p-2"
                  style={{ width: '250px' }}
                >
                  <CIcon icon={cilCalendar} size="xl" className="px-1" />
                  <Flatpickr
                    value={dates}
                    onChange={(selectedDates) => setDates(selectedDates)}
                    options={{
                      mode: 'range',
                      dateFormat: 'Y-m-d',
                      placeholder: 'Select a date range',
                    }}
                    className="border-0 fw-light"
                    style={{
                      outline: 'none',
                      boxShadow: 'none',
                      width: '100%', // Ensures Flatpickr fills container width
                    }}
                  />
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
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
              <CRow className="g-1 mt-2">
                {myOrderData.length > 0 ? (
                  myOrderData.map((order) => (
                    <CCard className="d-block w-100 p-3 mb-3" key={order.id}>
                      <CRow className="align-items-center">
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <CCol>
                            <CIcon className="me-2" icon={cilCart} />
                            <label className="me-2 fs-6">
                              {format(parseISO(order.createdAt), 'dd/MM/yyyy')}
                            </label>
                            <CBadge
                              className="me-2"
                              color={getSeverity(order.isReject === 1 ? 'rejected' : order.status)}
                            >
                              {order.isReject === 1 ? 'REJECTED' : order.status.toUpperCase()}
                            </CBadge>
                            <label className="me-2 fw-light">
                              {order.transactionNumber
                                ? `${order.transactionNumber}`
                                : `${order.requestNumber}`}
                            </label>
                          </CCol>
                        </div>

                        <CRow className="d-flex justify-content-between my-2">
                          <CCol xs="1">
                            <CCardImage
                              src={'https://via.placeholder.com/150'}
                              style={{ height: '100%', width: '100%' }}
                            />
                          </CCol>

                          <CCol xs="8">
                            {order.Detail_Orders.length === 1 ? (
                              <label>{order.Detail_Orders[0].Inventory.Material.description}</label>
                            ) : (
                              <label>
                                {order.Detail_Orders[0].Inventory.Material.description}...
                              </label>
                            )}
                            <br />
                            <label className="fw-bold fs-6">
                              Total: {order.Detail_Orders.length} Item
                            </label>
                          </CCol>
                          <CCol xs="3" className="text-end">
                            <label>{order.paymentMethod}</label>
                            <br />
                            <span className="fw-bold">{order.paymentNumber}</span>
                          </CCol>
                        </CRow>

                        <CRow className="d-flex justify-content-end align-items-center">
                          <CCol xs={4} className="d-flex justify-content-end">
                            <CButton
                              onClick={() => handleViewHistoryOrder(order)}
                              color="primary"
                              size="sm"
                            >
                              View Detail Order
                            </CButton>
                          </CCol>
                        </CRow>
                      </CRow>
                    </CCard>
                  ))
                ) : (
                  <p>No orders available.</p>
                )}
              </CRow>
              {selectedProduct && (
                <CModal visible={visible} onClose={() => setVisible(false)} className="modal-lg">
                  <CModalHeader>
                    <CModalTitle>Order Details</CModalTitle>
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
                              <CBadge className="me-2" color={getSeverity(selectedProduct.status)}>
                                {selectedProduct.status.toUpperCase()}
                              </CBadge>
                              <label className="me-2 fw-light">
                                {selectedProduct.transactionNumber}
                              </label>
                            </CCol>
                          </CRow>

                          {selectedProduct.Detail_Orders.map((detail, index) => (
                            <CRow className="align-items-center mb-3" key={index}>
                              <CCol xs="1">
                                <CCardImage
                                  src={'https://via.placeholder.com/150'}
                                  style={{ height: '100%', width: '100%' }}
                                />
                              </CCol>
                              <CCol xs="9">
                                <label>{detail.Inventory.Material.description}</label>
                              </CCol>
                            </CRow>
                          ))}

                          {orderHistory.map((item, index) => (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: '16px',
                                }}
                              >
                                <label style={{ marginRight: '8px' }}>
                                  {format(parseISO(item.createdAt), 'dd MMM yyyy')}
                                  {', '}
                                  {format(parseISO(item.createdAt), 'HH:mm')}
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
                                  {' '}
                                  {item.status.charAt(0).toUpperCase() +
                                    item.status.slice(1).toLowerCase()}
                                </label>
                              </div>
                            </div>
                          ))}
                        </CCardBody>
                      </CCard>
                    </CRow>
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                      Close
                    </CButton>
                  </CModalFooter>
                </CModal>
              )}
            </CTabPanel>
          ))}
        </CTabContent>
      </CTabs>
    </>
  )
}

export default History
