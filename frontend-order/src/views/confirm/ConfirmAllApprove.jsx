import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../scss/home.scss'

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
  const { getProduct } = useProductService()
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

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const responseProducts = await getInventory()
        setProductsData(responseProducts.data)
        setCurrentProducts(responseProducts.data) // Set currentProducts here
      } catch (error) {
        console.error('Error fetching products:', error)
      }

      try {
        const responseCategories = await getMasterData(apiCategory)
        setCategoriesData(responseCategories.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchProductsAndCategories()
  }, [])

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    // Update all individual checkboxes
    const updatedCheckedItems = currentProducts.reduce((acc, product) => {
      acc[product.id] = newSelectAll
      return acc
    }, {})
    setCheckedItems(updatedCheckedItems)
  }

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
    navigate('/confirmapp', { state: { product } });
  }
 
  return (
    <>
 <CRow className="mt-1">
      <CCard style={{ border: 'none' }}>
        <CCardBody>
          {/* Sticky header */}
          <div className="sticky-top bg-white p-1" style={{ zIndex: 10 }}>
            <h3 className="fw-bold fs-4">Order Approval</h3>
            {/* Button group */}
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
          </div>
        </CCardBody>
      </CCard>
    </CRow>
  
    {/* Container for product cards with scroll */}
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
                        <CIcon className="me-2" icon={cilCart} />
                        <label className="me-2 fs-6">3 Oktober 2024</label>
                        <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                          ON PROCESS
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
                            <strong>FORM:</strong> ANDI (TEAM LEADER)
                          </div>
                          <div>
                            <strong>GRUP:</strong> ASSY PRE TRIM 2 OPR RED
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
                          src={selectedProduct.Material.img || 'https://via.placeholder.com/150'}
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
                          <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
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
                          style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}
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
  </>
  
  )
}

export default ApproveAll
