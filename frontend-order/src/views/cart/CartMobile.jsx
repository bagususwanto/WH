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
} from '@coreui/icons'
import Carousel from 'react-bootstrap/Carousel'
import useManageStockService from '../../services/ManageStockService'
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

const ProductList = () => {
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const [selectAll, setSelectAll] = useState(false) // New state for "Confirm All"
  const [checkedItems, setCheckedItems] = useState({}) // New state for individual checkboxes

  const [currentProducts, setCurrentProducts] = useState([])

  const navigate = useNavigate()

  const apiCategory = 'category'

  const getProducts = async () => {
    try {
      const response = await getInventory()
      setProductsData(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
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

  // Handle individual checkbox change
  const handleCheckboxChange = (productId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleDelete = (productId) => {
    setCurrentProducts(currentProducts.filter((product) => product.id !== productId))
  }
  const handleDeleteAll = () => {
    setCurrentProducts([])
  }
  // Total harga produk
  const totalAmount = currentProducts.reduce((total, product) => {
    return total + (product.Material.price || 0)
  }, 0)

  const handleCheckout = () => {
    alert(`Proceeding to checkout. Total Amount: Rp ${totalAmount.toLocaleString('id-ID')}`)
    // Tambahkan fungsi lain sesuai kebutuhan
  }

  return (
    <>
      <CRow className="mt-3">
        <CCard>
          <h3 className="fw-bold fs-4">Your Cart</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CFormCheck
              id="flexCheckDefault"
              label="Confirm All"
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
            <CButton
              color="danger"
              onClick={handleDeleteAll}
              className="btn-sm p-1 mb-2 text-white" // CoreUI class names
            >
              Delete All
            </CButton>
          </div>

          <CRow className="g-2">
            {currentProducts.map((product, index) => (
              <CCard className="h-80" key={index}>
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CRow className="align-items-center">
                    <CCol xs="1">
                      <CFormCheck
                        id={`product-checkbox-${product.id}`}
                        checked={checkedItems[product.id] || false}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                    </CCol>
                    <CCol xs="3">
                      <CCardImage
                        src={product.Material.img || 'https://via.placeholder.com/150'}
                        alt={product.Material.description}
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </CCol>
                    <CCol xs="5">
                      <div>
                        <CCardTitle style={{ fontSize: '14px' }}>
                          {product.Material.description}
                        </CCardTitle>
                        <CCardTitle style={{ fontSize: '14px' }}>No GIC/WBS: test ae</CCardTitle>
                        <CCardTitle style={{ fontSize: '14px' }}>
                          Rp {product.Material.price.toLocaleString('id-ID')}
                        </CCardTitle>
                      </div>
                    </CCol>
                    <CCol xs="2">
                      <CFormInput type="number" aria-label="default input example" />{' '}
                      {product.Material.uom}
                    </CCol>
                    <CCol xs="1">
                      <CIcon
                        icon={cilTrash}
                        className="text-danger"
                        onClick={() => handleDelete(product.id)}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ))}
          </CRow>

          {/* Sticky Footer */}
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <h5>Total: Rp {totalAmount.toLocaleString('id-ID')}</h5>
            <CButton color="primary" onClick={handleCheckout}>
              Checkout
            </CButton>
          </div>
        </CCard>
      </CRow>
    </>
  )
}

export default ProductList
