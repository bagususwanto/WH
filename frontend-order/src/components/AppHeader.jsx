import React, { useEffect, useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CCol,
  CHeader,
  CHeaderNav,
  CButton,
  CFormInput,
  COffcanvasBody,
  CCloseButton,
  CDropdown,
  CCollapse,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownHeader,
  CBadge,
  CLink,
  CRow,
  CCardImage,
  CCardTitle,
  CDropdownDivider,
  CFormLabel,
  CModal,
  CCardText,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CModalBody,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBabyCarriage,
  cilBell,
  cilCart,
  cilLibrary,
  cilLocationPin,
  cilFolder,
  cilStar,
  cilHeart,
  cilInbox,
  cilFax,
  cilLifeRing,
  cilKeyboard,
  cilFactory,
  cilPaintBucket,
  cilFootball,
 cilPencil,
 cilInputHdmi,
 cilCog,
 cilCut,
 cilTags
} from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import useMasterDataService from '../services/MasterDataService'
import useProductService from '../services/ProductService'
import useCartService from '../services/CartService'
import '../scss/appheader.scss'
import { GlobalContext } from '../context/GlobalProvider'

const AppHeader = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [productsData, setProductsData] = useState([])
  const [allProductsData, setAllProductsData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const { getMasterData } = useMasterDataService()
  const { getProduct, getAllProduct } = useProductService()
  const { getCartCount, getCart } = useCartService()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showRecentSearches, setShowRecentSearches] = useState(false) // For controlling recent searches visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const notificationCount = 0
  const [showCategories, setShowCategories] = useState(false)
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false)
  const [temporaryWarehouse, setTemporaryWarehouse] = useState('')
  const [visible, setVisible] = useState(false)
  const [warehouseId, setWarehouseId] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [cart, setCart] = useState([])
  const [category, setCategory] = useState([])

  const { warehouse, setWarehouse } = useContext(GlobalContext)
  const dropdownRef = useRef(null)

  const iconMap = {
    'Office Supp.': cilPencil,
    'Oper. Supply': cilFactory,
    'Support Oper': cilInbox,
    'Raw Matr.': cilPaintBucket,
    'Spare Part': cilFootball,
    'Tools': cilCut,
    'Others': cilTags,
  }

  const apiWarehouseUser = 'warehouse-user'
  const apiCategory = 'category'
  const apiWarehouse = 'warehouse'

  // Fetch products from API
  const getProducts = async () => {
    try {
      const response = await getProduct(warehouse.id)
      setProductsData(response.data) // Assuming response.data is an array of products
    } catch (error) {
      console.error('Failed to fetch products:', error) // Log any errors
    }
  }

  const getAllProducts = async () => {
    try {
      const response = await getAllProduct(warehouse.id)
      setAllProductsData(response.data) // Assuming response.data is an array of products
    } catch (error) {
      console.error('Failed to fetch products:', error) // Log any errors
    }
  }

  const getDefaultWarehouse = async () => {
    try {
      const response = await getMasterData(apiWarehouseUser)
      setWarehouse(response.data) // Update warehouse state langsung di sini
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const getWarehouse = async () => {
    try {
      const response = await getMasterData(apiWarehouse)
      setWarehouseData(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getCategories = async () => {
    try {
      const response = await getMasterData(apiCategory)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getCartCounts = async () => {
    try {
      const response = await getCartCount(warehouse.id)
      setCartCount(response.totalItems)
    } catch (error) {
      console.error('Error fetching carts:', error)
    }
  }

  const getCarts = async () => {
    try {
      const response = await getCart(warehouse.id)
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching carts:', error)
    }
  }

  useEffect(() => {
    getDefaultWarehouse()
    getWarehouse() // Fetch products on mount
    getCategories()
  }, []) // Empty dependency array ensures it only runs once

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getProducts()
      getCartCounts()
      getCarts()
      getAllProducts()
    }
  }, [warehouse])

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
    setSearchHistory(savedHistory)
  }, [])

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

  // Update this function to search through productsData
  const searchProducts = (query) => {
    if (!query) return []
    const lowerCaseQuery = query.toLowerCase()

    return allProductsData.filter((product) => {
      const productName = product.Material.description?.toLowerCase() // Use optional chaining
      const productMaterialNumber = product.Material.materialNo?.toLowerCase() // Use optional chaining

      return (
        (productName && productName.includes(lowerCaseQuery)) || // Check if productName is defined
        (productMaterialNumber && productMaterialNumber.includes(lowerCaseQuery)) // Check if productMaterialNumber is defined
      )
    })
  }

  const addToSearchHistory = (query) => {
    if (!query) return
    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const handleSuggestionClick = (query) => {
    setSearchQuery(query)
    setFilteredSuggestions([])
    addToSearchHistory(query)

    // Contoh query params yang dibutuhkan
    const warehouseId = warehouse.id // Misalnya ID warehouse
    const page = 1 // Default halaman pertama
    const limit = 20 // Default limit produk per halaman

    // Membuat query string berdasarkan input pencarian dan params default
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      q: query,
    })

    // Mengarahkan pengguna ke URL yang berisi query parameters
    navigate(`/order/${warehouseId}?${params.toString()}`)
  }

  const handleSearchHistoryClick = (query, e) => {
    e.preventDefault() // Prevent default button behavior

    setSearchQuery(query)
    setFilteredSuggestions([])
    //addToSearchHistory(query)

    // Contoh query params yang dibutuhkan
    const warehouseId = warehouse.id // Misalnya ID warehouse
    const page = 1 // Default halaman pertama
    const limit = 20 // Default limit produk per halaman

    // Membuat query string berdasarkan input pencarian dan params default
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      q: query,
    })
    // Mengarahkan pengguna ke URL yang berisi query parameters
    navigate(`/order/${warehouseId}?${params.toString()}`)
  }

  const handleDeleteSearch = (item, e) => {
    e.preventDefault() // Prevent default button behavior
    e.stopPropagation() // Prevent event from propagating to parent elements

    // Filter out the deleted item from the searchHistory
    const newHistory = searchHistory.filter((historyItem) => historyItem !== item)

    // Update the state and local storage with the new history
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory)) // Change 'searchHistory' to 'recentSearches'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addToSearchHistory(searchQuery)
    setSearchQuery('')
    setShowRecentSearches(false)

    // Contoh query params yang dibutuhkan
    const warehouseId = warehouse.id // Misalnya ID warehouse
    const page = 1 // Default halaman pertama
    const limit = 20 // Default limit produk per halaman

    // Membuat query string berdasarkan input pencarian dan params default
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      q: searchQuery,
    })

    // Mengarahkan pengguna ke URL yang berisi query parameters
    navigate(`/order/${warehouseId}?${params.toString()}`)
  }

  const handleCategoryHeadClick = (categoryId) => {
    // Membuat query string berdasarkan input pencarian dan params default
    const params = new URLSearchParams({
      id: categoryId,
    })

    // Mengarahkan pengguna ke URL yang berisi query parameters
    navigate(`/order/category?${params.toString()}`)
  }

  const handleFocus = () => {
    setShowRecentSearches(searchHistory.length > 0)
  }

  const handleBlur = (e) => {
    setTimeout(() => {
      // Pastikan e.currentTarget tidak null sebelum memanggil contains
      if (e.currentTarget && (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget))) {
        setShowRecentSearches(false)
      }
    }, 150) // Small delay to allow for delete to work
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Show and close modal functions
  const handleShowModal = () => setModalVisible(true)
  const handleCloseModal = () => setModalVisible(false)

  // Show and close confirmation modal
  const handleShowConfirmationModal = () => setConfirmationModalVisible(true)
  const handleCloseConfirmationModal = () => setConfirmationModalVisible(false)

  // Handle warehouse selection (temporary state before confirmation)
  const handleSelectWarehouse = (warehouse) => {
    setTemporaryWarehouse(warehouse) // Set the warehouse to be confirmed
  }

  // Save changes and update selectedWarehouse
  const handleSaveChanges = () => {
    setSelectedWarehouse(temporaryWarehouse) // Confirm and set the new warehouse
    setConfirmationModalVisible(false) // Close confirmation modal
    setModalVisible(false)
  }
  const handleToggleCategories = () => {
    setShowCategories(!showCategories)
  }

  const handleSaveLocation = () => {
    const selectedId = Number(warehouseId) // Convert to number if necessary
    const selectedWarehouseData = warehouseData.find((warehouse) => warehouse.id === selectedId)
    if (selectedWarehouseData) {
      // Ensure that the warehouse is found
      setWarehouse(selectedWarehouseData)
      setModalVisible(false)
    } else {
      // Handle case where no warehouse was selected
      console.error('No warehouse selected')
    }
  }

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowRecentSearches(false) // Tutup dropdown jika klik di luar
    }
  }

  useEffect(() => {
    // Tambahkan event listener saat komponen di-mount
    document.addEventListener('mousedown', handleClickOutside)

    // Hapus event listener saat komponen di-unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0">
      <CContainer className="border-bottom px-4 py-2 mb-2" style={{ minHeight: '10px' }} fluid>
        <span>
          <CIcon
            icon={cilLocationPin}
            size="lg"
            style={{ transition: 'color 0.3s', color: '#333', marginRight: '5px' }}
          />
          <b className="me-2">{warehouse.warehouseName}</b>
          <CLink
            color="primary"
            onClick={handleShowModal}
            style={{ cursor: 'pointer' }}
            className="text-decoration-none text-color-primary"
          >
            Change
          </CLink>
        </span>
        <CModal visible={modalVisible} onClose={handleCloseModal}>
          <CModalHeader>
            <CModalTitle>Select Warehouse</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormSelect
              size="xs"
              className="mb-3"
              onChange={(e) => setWarehouseId(e.target.value)}
              value={warehouseId}
            >
              {warehouseData.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="primary" onClick={handleSaveLocation}>
              Save Changes
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>

      <CContainer className="border-bottom px-4" fluid>
        <CCol sm={2}>
          <a href="/" className="d-flex align-items-center">
            <img
              src="/src/assets/brand/TWIIS-NEW.png"
              alt="Logo"
              style={{ height: '40px', marginLeft: '20px' }}
            />
          </a>
        </CCol>
        <CCol sm={2}>
          <CButton onClick={handleToggleCategories}>Category</CButton>
        </CCol>
        <CCol sm={4}>
          <form ref={dropdownRef} onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <CFormInput
              type="search"
              placeholder="Search product..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="border-0 p-2 me-3"
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: 'none',
                outline: '1px solid #ddd',
                width: '500px',
              }}
            />
            {(filteredSuggestions.length > 0 ||
              (showRecentSearches && searchHistory.length > 0)) && (
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  position: 'absolute',
                  width: '500px',
                  marginTop: '5px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  zIndex: 10,
                }}
              >
                {searchQuery
                  ? filteredSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(product.Material.description)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {product.Material.description} ({product.Material.materialNo})
                      </div>
                    ))
                  : showRecentSearches && (
                      <div>
                        <div
                          style={{
                            padding: '10px',
                            borderBottom: '1px solid #ddd',
                            fontWeight: 'bold',
                          }}
                        >
                          Recent Searches
                        </div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #ddd',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f0f0' // Warna saat hover
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fff' // Kembalikan ke warna default
                            }}
                          >
                            <div
                              className="d-flex justify-content-between align-items-center"
                              style={{ width: '100%' }}
                            >
                              <button
                                onClick={(e) => handleSearchHistoryClick(item, e)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  width: '100%',
                                  textAlign: 'left',
                                }}
                              >
                                {item}
                              </button>
                              <button
                                onClick={(e) => handleDeleteSearch(item, e)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                }}
                              >
                                &#10005;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
              </div>
            )}
          </form>
        </CCol>

        <CHeaderNav className="d-flex align-items-center ms-auto">
          {/* Button Order */}
          {/* <CButton onClick={() => navigate('/order')} className="text-dark ms-3">
            <CIcon icon={cilLibrary} size="lg" />
          </CButton> */}

          {/* Button Cart */}
          <CDropdown variant="nav-item">
            <CDropdownToggle
              className="py-0 pe-0 d-flex align-items-center position-relative"
              caret={false}
            >
              <CIcon icon={cilCart} size="lg" className="ms-3" />
              {cartCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute translate-middle"
                  style={{ top: '-5px', right: '-10px' }}
                >
                  {cartCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu
              className="pt-0"
              placement="bottom-end"
              style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}
            >
              <CDropdownHeader className="bg-body-secondary fw-semibold d-flex justify-content-between align-items-center">
                <span>Your Cart ({cartCount})</span>
                <CLink
                  onClick={() => navigate('/cart')}
                  className="text-primary ms-auto"
                  style={{ cursor: 'pointer' }}
                >
                  Show
                </CLink>
              </CDropdownHeader>
              {cart.map((product) => (
                <CDropdownItem key={product.id} href="#" className="d-flex align-items-center">
                  <CRow className="w-100">
                    <CCol xs="8" className="mb-2">
                      <CCardTitle style={{ fontSize: '12px' }}>
                        {product.Inventory.Material.description.length > 25
                          ? product.Inventory.Material.description.substring(0, 25) + '...'
                          : product.Inventory.Material.description}
                      </CCardTitle>
                      <CCardText style={{ fontSize: '12px' }}>
                        {product.Inventory.Material.materialNo}
                      </CCardText>
                    </CCol>
                    <CCol xs="4" className="text-end">
                      <CCardText style={{ fontSize: '12px' }}>
                        <b>{product.quantity} Item</b>
                      </CCardText>
                    </CCol>
                  </CRow>
                </CDropdownItem>
              ))}
            </CDropdownMenu>
          </CDropdown>

          {/* Button Notifications */}
          <CDropdown variant="nav-item">
            <CDropdownToggle
              className="py-0 pe-0 d-flex align-items-center position-relative"
              caret={false}
            >
              <CIcon icon={cilBell} size="lg" className="ms-3" />
              {notificationCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute translate-middle"
                  style={{ top: '-5px', right: '-10px' }}
                >
                  {notificationCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownHeader className="bg-body-secondary fw-semibold">
                Anda memiliki ({notificationCount}) notifikasi
              </CDropdownHeader>
              {/* <CDropdownItem href="#">Notifikasi 1</CDropdownItem>
              <CDropdownItem href="#">Notifikasi 2</CDropdownItem>
              <CDropdownItem href="#">Notifikasi 3</CDropdownItem> */}
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer>
        <CRow>
          <CCollapse visible={showCategories}>
            <div className="p-3">
              <CRow>
                {category.map((cat) => (
                  <CCol xs="auto" key={cat.id}>
                    <CButton className="text-start" onClick={() => handleCategoryHeadClick(cat.id)}>
                      <CIcon icon={iconMap[cat.categoryName] || cilFolder} className="me-2" />
                      {cat.categoryName}
                    </CButton>
                  </CCol>
                ))}
              </CRow>
            </div>
          </CCollapse>
        </CRow>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
