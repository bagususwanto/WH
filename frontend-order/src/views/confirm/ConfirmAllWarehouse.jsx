import React, { useEffect, useState, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { format, parseISO } from 'date-fns'
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
  cilTrash,
  cilCarAlt,
  cilPin,
  cilLocationPin,
  cilClipboard,
  cilTruck,
  cilTask,
  cilX,
  cilXCircle,
} from '@coreui/icons'
import { GlobalContext } from '../../context/GlobalProvider'
import useWarehouseService from '../../services/WarehouseService'
import { InputText } from 'primereact/inputtext'
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
  const { warehouse } = useContext(GlobalContext)
  const [selectedProduct, setSelectedProduct] = useState(null) // Add this state
  const [visible, setVisible] = useState(false) // State for modal visibility

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

  const getWarehouseConfirmations = async (activeTab) => {
    try {
      if (warehouse && warehouse.id) {
        const response = await getWarehouseConfirm(warehouse.id, activeTab, '')
        //jika ada isi di API
        if (response) {
          setProductsData(response.data)
        }
        //  jika kosong
        else {
          setProductsData([])
        }
        console.log('warehuse id :', warehouse.id)
      } else {
        console.log('warehouse id not found')
      }
      console.log(activeTab)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }
  console.log(productsData)
  useEffect(() => {
    getWarehouseConfirmations(activeTab)
  }, [warehouse, activeTab])

  const handleTabChange = (newStatus) => {
    setActiveTab(newStatus)
  }
  // Total harga produk
  const handleWarehouseConfirmationproduct = (product) => {
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
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1)
      setMyOrderData([])
      getMyorders()
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
                <CCard style={{ border: 'none' }}>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                    <CRow className="g-1 mt-1">
                      {productsData.length > 0 ? (
                        productsData.map((product) => (
                          <CCard className="d-block w-100 p-3 mb-3" key={product.id}>
                            <CRow className="align-items-center">
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <CCol>
                                  <CIcon className="me-2" icon={cilCart} />
                                  <label className="me-2 fs-6">
                                    {format(parseISO(product.createdAt), 'dd/MM/yyyy')}
                                  </label>
                                  <CBadge className="me-2" color={getSeverity(product.status)}>
                                    {product.isReject === 1
                                      ? 'REJECTED'
                                      : product.status.toUpperCase()}
                                  </CBadge>
                                  <label className="me-2 fw-light">
                                    {product.transactionNumber
                                      ? `${product.transactionNumber}`
                                      : `${product.requestNumber}`}
                                  </label>
                                </CCol>
                              </div>
                              <CRow className="py-2" xs="1">
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
                                      <strong>Form:</strong> {product.User.name}
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
                                      (total, order) =>
                                        total + (order.Inventory.Material.price || 0),
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
                  </div>
                </CCard>
              </CRow>
            </CTabPanel>
          ))}
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
