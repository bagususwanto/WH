import React, { useEffect, useState, useMemo } from 'react'
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
  cilHome,
  cilInbox,
  cilKeyboard,
  cilUser,
  cilCart,
  cilCalendar,
  cilHeart,
  cilArrowRight,
  cilArrowLeft,
  cilTrash,
  cilCarAlt,
  cilPin,
  cilLocationPin,
} from '@coreui/icons'
import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'

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

  const apiCategory = 'category'
  const apiUser = 'user'

  const getProducts = async () => {
    const response = await getProduct(1)
    setProductsData(response.data)
  }

  const getUsers = async () => {
    const response = await getMasterData(apiUser)
    setUserData(response.data)
  }

  useEffect(() => {
    getProducts()
    getUsers()
  }, [])

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

  const handleViewHistoryOrder = (product) => {
    setSelectedProduct(product)
    setVisible(true)
    navigate('/confirmapp', { state: { product } })
  }

  return (
    <>
      {/* <CRow >
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            
            <div className="sticky-top bg-white p-1" style={{ zIndex: 10 }}>
              <h3 className="fw-bold fs-4">Order Approval</h3>
            </div>

           
            <div className="mt-0 mb-1 d-flex justify-content-end">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc', // Border around the icon and date picker
                  borderRadius: '4px', // Optional: rounded corners
                  padding: '5px', // Optional: padding inside the border
                }}
              >
                <CIcon icon={cilCalendar} size="xl" className="px-1" /> 
                <Flatpickr
                  value={dates}
                  onChange={(selectedDates) => {
                    setDates(selectedDates); // Update the state with the selected date range
                    // Logic to filter products based on selected date range can go here
                  }}
                  options={{
                    mode: 'range', // Enable range selection
                    dateFormat: 'Y-m-d', // Desired date format
                    placeholder: 'Select a date range',
                  }}
                  className="border-0 fw-light" // Remove the border from Flatpickr
                  style={{
                    outline: 'none', // Remove outline
                    boxShadow: 'none', // Remove any box shadow
                  }}
                />
              </div>
            </div> */}

      {/*           
            <div>
              <CButton className="me-2" color="secondary" variant="outline">
                Waiting Approve LH
              </CButton>
              <CButton className="me-2" color="secondary" variant="outline">
                Waiting Approve SH
              </CButton>
              <CButton className="me-2" color="secondary" variant="outline">
                Waiting Approve DPH
              </CButton>
              <CButton className="me-2" color="secondary" variant="outline">
                Approved
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CRow> */}

      <CRow className="mt-1">
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            <h3 className="fw-bold fs-4">Order Approval</h3>
          </CCardBody>
        </CCard>
      </CRow>
      <div className="mt-0 mb-1 d-flex justify-content-end">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #ccc', // Border around the icon and date picker
            borderRadius: '4px', // Optional: rounded corners
            padding: '5px', // Optional: padding inside the border
          }}
        >
          <CIcon icon={cilCalendar} size="xl" className="px-1" /> {/* Your calendar icon */}
          <Flatpickr
            value={dates}
            onChange={(selectedDates) => {
              setDates(selectedDates) // Update the state with the selected date range
              // Logic to filter products based on selected date range can go here
            }}
            options={{
              mode: 'range', // Enable range selection
              dateFormat: 'Y-m-d', // Desired date format
              placeholder: 'Select a date range',
            }}
            className="border-0 fw-light" // Remove the border from Flatpickr
            style={{
              outline: 'none', // Remove outline
              boxShadow: 'none', // Remove any box shadow
            }}
          />
        </div>
      </div>
      <CTabs activeItemKey={2}>
        <CTabList variant="pills">
          <CTab aria-controls="Confirmation-tab-pane" itemKey={1}>
            Waiting Approve LH
          </CTab>
          <CTab aria-controls="Shopping-tab-pane" itemKey={2}>
            Waiting Approve SH
          </CTab>
          <CTab aria-controls="Ready Delivery-tab-pane" itemKey={3}>
            Waiting Approve DPH
          </CTab>
          <CTab aria-controls="Ready Pickup-tab-pane" itemKey={4}>
            Approved
          </CTab>
        </CTabList>

        {/* Container for product cards with scroll */}

        <CTabContent>
          <CTabPanel className="p-3" aria-labelledby="Confirmation-tab-pane" itemKey={1}>
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                {/* Scrollable product cards */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            {/* Order information */}
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CCol>
                                <CIcon className="me-2" icon={cilUser} />
                                <label className="me-2 fs-6">3 Oktober 2024</label>
                                <CBadge className="me-2" size="sm" color={getSeverity('On Process')}>
                                 Waiting Approval
                                </CBadge>
                                <label className="me-2 fw-light">X21000000000/20/20</label>
                              </CCol>
                            </div>

                            {/* Product and user information */}
                            <CRow xs="1">
                              <CCol xs="1">
                                {userData.map((user) => (
                                  <CCardImage
                                    key={user.id}
                                    src={user.img}
                                    alt={user.name}
                                    style={{ height: '100%', width: '100%' }}
                                  />
                                ))}
                              </CCol>
                              <CCol xs="4">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div>
                                    <strong>Form:</strong> ANDI (TEAM LEADER)
                                  </div>
                                  <div>
                                    <strong>Grup:</strong> ASSY PRE TRIM 2 OPR RED
                                  </div>
                                  <div>
                                    <small>Request at 11:19</small>
                                  </div>
                                </div>
                              </CCol>
                              <CCol xs="4">
                                <label>{product.Material.description}</label>
                                <br />
                                <label className="fw-bold fs-6">Total: 4 Item</label>
                              </CCol>
                              <CCol className="text-end">
                                <label className="fw-bold fs-6">
                                  Rp {product.Material.price.toLocaleString('id-ID')}
                                </label>
                                <br />
                                <label className="me-2">WBS : 20000000</label>
                              </CCol>
                            </CRow>

                            {/* View Detail button */}
                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewHistoryOrder(product)}
                                  color="primary"
                                  size="sm"
                                >
                                  View Detail Order
                                </CButton>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>

                {/* Modal for product details */}
                <CModal visible={visible} onClose={() => setVisible(false)} className="modal-lg">
                  <CModalHeader>
                    <CModalTitle>Product Details</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    {selectedProduct && (
                      <CRow className="g-1 mt-2">
                        <CCard className="h-80">
                          <CCardBody className="d-flex flex-column justify-content-between">
                            <CRow className="align-items-center">
                              <CCol xs="1">
                                <CCardImage
                                  src={
                                    selectedProduct.Material.img ||
                                    'https://via.placeholder.com/150'
                                  }
                                  alt={selectedProduct.Material.description}
                                  style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                                />
                              </CCol>
                              <CCol xs="6" className="mb-2">
                                <div>
                                  <label>{selectedProduct.Material.description}</label>
                                  <br />
                                  <label className="fw-bold fs-6">
                                    Rp {selectedProduct.Material.price.toLocaleString('id-ID')}
                                  </label>
                                </div>
                              </CCol>
                              <CCol xs="5">
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <label className="d-flex flex-column justify-content-between fs-6">
                                    Status:
                                  </label>
                                  <CBadge
                                    className="me-2"
                                    size="sm"
                                    color={getSeverity('Completed')}
                                  >
                                    ON PROCESS
                                  </CBadge>
                                </div>
                              </CCol>
                            </CRow>

                            <hr />

                            {/* History Order Timeline */}
                            <label className="fw-bold mb-2">MY HISTORY ORDER</label>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                              }}
                            >
                              {[
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilLocationPin,
                                  label: 'YOUR ITEM RECEIVED',
                                },
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilCarAlt,
                                  label: 'DELIVERY OTODOKE',
                                },
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilHome,
                                  label: 'ACCEPTED WAREHOUSE STAFF',
                                },
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilUser,
                                  label: 'APPROVAL SECTION HEAD',
                                },
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilUser,
                                  label: 'APPROVAL LINE HEAD',
                                },
                                {
                                  date: '20 JANUARI 2024 20:34 WIB',
                                  icon: cilUser,
                                  label: 'ORDER CREATED',
                                },
                              ].map((item, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                  }}
                                >
                                  <label style={{ marginRight: '8px' }}>{item.date}</label>
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
                                    <CIcon icon={item.icon} size="lg" />
                                  </div>
                                  <label style={{ marginLeft: '8px' }}>{item.label}</label>
                                </div>
                              ))}
                            </div>

                            <CRow></CRow>
                          </CCardBody>
                        </CCard>
                      </CRow>
                    )}
                  </CModalBody>
                </CModal>
              </CCard>
            </CRow>
          </CTabPanel>
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
