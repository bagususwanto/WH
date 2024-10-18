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
  cilCart,
  cilHeart,
  cilArrowRight,
  cilArrowLeft,
  cilTrash,
  cilCarAlt,
  cilPin,
  cilLocationPin,
  cilClipboard,
  cilTruck,
  cilTask,
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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(null)
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

  const handleStatusFilterClick = (status) => {
    setSelectedStatus(status)
    // Call any other logic you need here, such as fetching/filtering data based on status
  }

  

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
  }

  return (
    <>
      <CRow className="mt-1">
        <CCard style={{ border: 'none' }} >
          <CCardBody>
            <h3 className="fw-bold fs-4">Warehouse Confirmation</h3>
          </CCardBody>
        </CCard>
      </CRow>

      <CTabs activeItemKey={2}>
        <CTabList variant="pills">
          <CTab aria-controls="home-tab-pane" itemKey={1}>
            Confirmation
          </CTab>
          <CTab aria-controls="Shopping-tab-pane" itemKey={2}>
            Shopping
          </CTab>
          <CTab aria-controls="Ready Delivery-tab-pane" itemKey={3}>
            Ready To Delivery
          </CTab>
          <CTab aria-controls="Ready Pickup-tab-pane" itemKey={4}>
            Ready To Pickup
          </CTab>
          <CTab aria-controls="Delivered-tab-pane" itemKey={5}>
            Delivered
          </CTab>

          <CTab aria-controls="Rejected-tab-pane" itemKey={6}>
            Rejected
          </CTab>
        </CTabList>

        <CTabContent>
          <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={1}>
            {/* You can use the same product card structure for each tab panel */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilCart} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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
                                <label>{product.Material.description}..</label>
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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewProduct(product)}
                                  color="secondary"
                                  size="sm"
                                >
                                 Confirmation Detail 
                                </CButton>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>

          <CTabPanel className="p-3" aria-labelledby="shopping-tab-pane" itemKey={2}>
            {/* You can use the same product card structure for each tab panel */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilClipboard} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewProduct(product)}
                                  color="secondary"
                                  size="sm"
                                >
                                  Shopping Detail
                                </CButton>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>

          <CTabPanel className="p-3" aria-labelledby="Ready Delivery-tab-pane" itemKey={3}>
            {/* Same structure for the Profile tab */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilTruck} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewProduct(product)}
                                  color="secondary"
                                  size="sm"
                                >
                                  Ready Delivery Detail
                                </CButton>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>

          <CTabPanel className="p-3" aria-labelledby="Ready Pickup-tab-pane" itemKey={4}>
            {/* Same structure for the Contact tab */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilTruck} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                                <CButton
                                  onClick={() => handleViewProduct(product)}
                                  color="secondary"
                                  size="sm"
                                >
                                  Ready Pickup Detail
                                </CButton>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>
          <CTabPanel className="p-3" aria-labelledby="Completed-tab-pane" itemKey={5}>
            {/* Same structure for the Profile tab */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilTask} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                             
                                 <CBadge color="success">Completed</CBadge>
                               
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>
          <CTabPanel className="p-3" aria-labelledby="Rejected-tab-pane" itemKey={6}>
            {/* Same structure for the Profile tab */}
            <CRow className="mt-1">
              <CCard style={{ border: 'none' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                  <CRow className="g-1 mt-1">
                    {productsData.map((product, index) => (
                      <CCard className="h-78 mb-2" key={index}>
                        <CCardBody className="d-flex flex-column justify-content-between">
                          <CRow className="align-items-center">
                            <CCol>
                              <CIcon className="me-2" icon={cilCart} />
                              <label className="me-2 fs-6">3 Oktober 2024</label>
                              <CBadge className="me-2" size="sm" color={getSeverity('Completed')}>
                                ON PROCESS
                              </CBadge>
                              <label className="me-2 fw-light">X21000000000/20/20</label>
                            </CCol>

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

                            <CRow xs="1" className="d-flex justify-content-end align-items-center">
                              <CCol xs={4} className="d-flex justify-content-end">
                              <CBadge color="danger">Rejected</CBadge>
                              </CCol>
                            </CRow>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    ))}
                  </CRow>
                </div>
              </CCard>
            </CRow>
          </CTabPanel>
        </CTabContent>
      </CTabs>
    </>
  )
}

export default ApproveAll
