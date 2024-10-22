import React, { useEffect, useState, useContext } from 'react'
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
} from '@coreui/icons'

import { format, parseISO } from 'date-fns'

import useProductService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import useOrderService from '../../services/OrderService'

import { GlobalContext } from '../../context/GlobalProvider'

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
  const { getMyorder } = useOrderService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes
  const [totalAmount, setTotalAmount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentProducts, setCurrentProducts] = useState([])
  const [myOrderData, setMyOrderData] = useState([])
  const navigate = useNavigate()

  const { warehouse } = useContext(GlobalContext)

  const apiCategory = 'category'

  const getMyorders = async () => {
    try {
      const response = await getMyorder(warehouse.id)
      setMyOrderData(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
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
    if (warehouse && warehouse.id) {
      getMyorders()
    }
  }, [warehouse])

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
      case 'waiting approval':
        return 'warning'
      case 'on process':
        return 'warning'
      case 'ready to deliver':
        return 'secondary'
      case 'ready to pickup':
        return 'secondary'
      case 'delivered':
        return 'success'
      case 'rejected':
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
      <CRow className="mt-1">
        <CCard style={{ border: 'none' }}>
          <CCardBody>
            <h3 className="fw-bold fs-4">YOUR HISTORY</h3>
          </CCardBody>
        </CCard>
      </CRow>
      {/* <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
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
          </div> */}
      <CTabs activeItemKey={1}>
        <CTabList variant="pills">
          <CTab aria-controls="All-tab-pane" itemKey={1}>
            All
          </CTab>
          <CTab aria-controls="Waiting-tab-pane" itemKey={2}>
            Waiting Approval
          </CTab>
          <CTab aria-controls="Process-tab-pane" itemKey={3}>
            On Process
          </CTab>
          <CTab aria-controls="Delivery-tab-pane" itemKey={4}>
            Delivery
          </CTab>
          <CTab aria-controls="Pickup-tab-pane" itemKey={5}>
            Pickup
          </CTab>
          <CTab aria-controls="Completed-tab-pane" itemKey={6}>
            Completed
          </CTab>
          <CTab aria-controls="Rejected-tab-pane" itemKey={7}>
            Rejected
          </CTab>
        </CTabList>

        <CTabContent>
          <CTabPanel className="p-3" aria-labelledby="All-tab-pane" itemKey={1}>
            <CRow className="g-1 mt-2">
              
                <CCard className="d-block w-100 p-3 mb-3" key={order.id}>
                  <CRow className="align-items-center">
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <CCol>
                        <CIcon className="me-2" icon={cilCart} />
                        <label className="me-2 fs-6" size="sm ">
                        02 februari 2024
                        </label>
                        <CBadge
                          className=" me-2 "
                          size="sm"
                          color={getSeverity(order.isReject == 1 ? 'rejected' : order.status)}
                        >
                          Rejected
                        </CBadge>
                        <label className=" me-2 fw-light ">20000-30000-43555</label>
                      </CCol>
                    </div>

                    <CRow className="d-flex justify-content-between my-2 ">
                      <CCol xs="1">
                        <CCardImage
                          src={
                            // order.Detail_Orders[0].Inventory.Material.img ||
                            'https://via.placeholder.com/150'
                          }
                          // alt={order.Detail_Orders[0].Inventory.Material.description}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </CCol>

                      <CCol xs="5">
                        {order.Detail_Orders.length === 1 ? (
                          <label key={order.Detail_Orders[0].id}>
                            PLASTIC 2000-000
                          </label>
                        ) : (
                          <label>{order.Detail_Orders[0].Inventory.Material.description}...</label>
                        )}
                        <br />
                        <label className="fw-bold fs-6">
                          Total: 3 Item
                        </label>
                      </CCol>
                      <CCol xs="2" className="text-center">
                        <label>{order.paymentMethod}</label>
                        <br />
                        <span className="fw-bold">{order.paymentNumber}</span>
                      </CCol>

                      <CCol xs="4">
                
                          {userData.map((user) => (
                            <CCardImage
                              key={user.id}
                              src={user.img}
                              alt={user.name}
                              style={{ height: '100%', width: '100%' }}
                            />
                          ))}
                    
                       
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
          
            </CRow>

            <CModal visible={visible} onClose={() => setVisible(false)} className="modal-lg">
              <CModalHeader>
                <CModalTitle>Order Details</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedProduct && (
                  <CRow className="g-1 mt-2">
                    <CCard className="h-80">
                      <CCardBody className="d-flex flex-column justify-content-between">
                        <CRow className="align-items-center mb-3">
                          <CCol>
                            <CIcon className="me-2" icon={cilCart} />
                            <label className="me-2 fs-6" size="sm ">
                              {format(parseISO(selectedProduct.createdAt), 'dd/MM/yyyy')}
                            </label>
                            <CBadge
                              className=" me-2 "
                              size="sm"
                              color={getSeverity(selectedProduct.status)}
                            >
                              {selectedProduct.status.toUpperCase()}
                            </CBadge>
                            <label className=" me-2 fw-light ">
                              {selectedProduct.transactionNumber}
                            </label>
                          </CCol>
                        </CRow>

                        {/* Iterasi melalui semua Detail_Orders */}
                        {selectedProduct.Detail_Orders.map((detail, index) => (
                          <CRow className="align-items-center mb-3" key={index}>
                            <CCol xs="1">
                              <CCardImage
                                src={'https://via.placeholder.com/150'} // Ganti dengan gambar yang sesuai
                                style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                              />
                            </CCol>
                            <CCol xs="6" className="mb-2">
                              <div>
                                <label>{detail.Inventory.Material.description}</label>
                                <br />
                                <label className="fs-6 fw-bold">Quantity: {detail.quantity}</label>
                              </div>
                            </CCol>
                          </CRow>
                        ))}

                        <CRow className="mb-3">
                          <CCol>
                            <label>Payment Method: {selectedProduct.paymentMethod}</label>
                            <br />
                            <span>Payment Number: {selectedProduct.paymentNumber}</span>
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
                      </CCardBody>
                    </CCard>
                  </CRow>
                )}
              </CModalBody>
            </CModal>
          </CTabPanel>
        </CTabContent>
      </CTabs>
    </>
  )
}

export default History
