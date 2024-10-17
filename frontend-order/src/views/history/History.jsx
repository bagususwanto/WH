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

const History = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getMasterData } = useMasterDataService()
  const { getProduct } = useProductService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentProducts, setCurrentProducts] = useState([])
  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProducts = async () => {
    try {
    const response = await getProduct(1)
    setProductsData(response.data)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
  }

  const getCategories = async () => {
    try {
      const response = await getMasterData(apiCategory)
      setCategoriesData(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.Material.id === productId)
  }

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
  
  useEffect(() => {
    getProducts()
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
    setSelectedProduct(product) // Set the selected product
    setVisible(true) // Open the modal
  }

  return (
    <>
      <CRow className="mt-1" >
        <CCard style={{ border: 'none' }}>
          <h3 className="fw-bold fs-4">History Order</h3>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <CButton className="me-2" color="secondary" variant="outline">
              ALL
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              WAITING
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              ON PROCESS
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              DELIVERY
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              PICKUP
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              COMPLETED
            </CButton>
            <CButton className="me-2" color="secondary" variant="outline">
              REJECTED
            </CButton>
          </div>
          <CRow className="g-1 mt-2">
          {productsData.map((product, index) => (
              <CCard className="h-80" key={index}>
                <CCardBody className="d-flex flex-column justify-content-between ">
                  <CRow className="align-items-center">
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <CCol>
                        <CIcon className="me-2" icon={cilCart} />
                        <label className="me-2 fs-6" size="sm ">
                          {' '}
                          3 Oktober 2024
                        </label>
                        <CBadge className=" me-2 " size="sm" color={getSeverity('Completed')}>
                          ON PROCESS
                        </CBadge>

                        <label className=" me-2 fw-light ">X21000000000/20/20</label>
                      </CCol>
                    </div>
                 
                    <CRow xs="1" className="d-flex justify-content-between my-2 ">
                      <CCol xs="1">
                        <CCardImage
                          src={product.Material.img }
                          alt={product.Material.description}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </CCol>
                      <CCol xs="4">
                        <label>{product.Material.description}</label>
                        <br />
                        <label className="fw-bold fs-6">Total: 4 Item</label>
                      </CCol>
                      <CCol className="text-end">
                        <label className="me-2 ">WBS : 20000000</label>
                      </CCol>
                    </CRow>

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

export default History
