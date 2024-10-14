import React, { useEffect, useRef, useState, useContext } from 'react'
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
} from '@coreui/icons'
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import useManageStockService from '../services/ManageStockService'
import useMasterDataService from '../services/MasterDataService'
import '../scss/appheader.scss'
import { GlobalContext } from '../context/GlobalProvider'

const AppHeader = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [productsData, setProductsData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const headerRef = useRef()
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showRecentSearches, setShowRecentSearches] = useState(false) // For controlling recent searches visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const notificationCount = 3
  const [showCategories, setShowCategories] = useState(false)
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false)
  const [temporaryWarehouse, setTemporaryWarehouse] = useState('')
  const [visible, setVisible] = useState(false)
  const [warehouseId, setWarehouseId] = useState(0)

  const { warehouse, setWarehouse } = useContext(GlobalContext)
  console.log('warehouse', warehouse)

  const apiWarehouseUser = 'warehouse-user'

  const apiWarehouse = 'warehouse'
  // Fetch products from API
  const getProducts = async () => {
    try {
      const response = await getInventory()
      setProductsData(response.data) // Assuming response.data is an array of products
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
  useEffect(() => {
    getProducts()
    getWarehouse() // Fetch products on mount
    getDefaultWarehouse()
  }, []) // Empty dependency array ensures it only runs once

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
    setSearchHistory(savedHistory)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data') // Example API call
        if (!response.ok) throw new Error('Network response was not ok')
        const json = await response.json()
        setData(json)
      } catch (error) {
        console.error('Fetch data error:', error)
      }
    }

    fetchData()
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

    return productsData.filter((product) => {
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
  }

  const handleDeleteSearch = (query) => {
    const newHistory = searchHistory.filter((item) => item !== query)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addToSearchHistory(searchQuery)
    setSearchQuery('')
    setShowRecentSearches(false)
  }

  const handleFocus = () => {
    setShowRecentSearches(searchHistory.length > 0)
  }

  const handleBlur = () => {
    setShowRecentSearches(false)
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

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4 py-2 mb-2" style={{ minHeight: '10px' }} fluid>
        <span>
          <CIcon
            icon={cilLocationPin}
            size="lg"
            style={{ transition: 'color 0.3s', color: '#333', marginRight: '5px' }}
          />
          <b>{warehouse.warehouseName}</b>
          <CLink
            color="primary"
            onClick={handleShowModal}
            style={{ marginLeft: '7px', cursor: 'pointer' }}
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
        {/* Confirmation modal to confirm the selection */}
        <CModal visible={confirmationModalVisible} onClose={handleCloseConfirmationModal}>
          <CModalHeader>
            <CModalTitle>Confirm Warehouse Change</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Are you sure you want to switch to <b>{temporaryWarehouse}</b>?
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseConfirmationModal}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSaveChanges}>
              Yes, Change
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>

      <CContainer className="border-bottom px-4 mb-2" fluid>
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
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
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
                  width: '100%',
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
                          >
                            <span onClick={() => handleSuggestionClick(item)}>{item}</span>
                            <button
                              onClick={() => handleDeleteSearch(item)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              &#10005; {/* Cross icon */}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
              </div>
            )}
          </form>
        </CCol>

        {/* Button Order */}
        <CHeaderNav className="d-flex align-items-center ms-auto">
          <CButton onClick={() => navigate('/order')} className="text-dark ms-3">
            <CIcon icon={cilLibrary} size="lg" />
          </CButton>

          {/* Button Cart */}
          <CDropdown variant="nav-item" isOpen={isDropdownOpen}>
            <CDropdownToggle
              className="py-0 pe-0 d-flex align-items-center position-relative"
              caret={false}
            >
              <CIcon icon={cilCart} size="lg" className="ms-3" />
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
            <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: '300px' }}>
              <CDropdownHeader className="bg-body-secondary fw-semibold d-flex justify-content-between align-items-center">
                <span>Your Cart ({notificationCount})</span>
                <CLink
                  onClick={() => navigate('/cart')}
                  className="text-primary ms-auto"
                  style={{ cursor: 'pointer' }}
                >
                  Show In
                </CLink>
              </CDropdownHeader>
              <CDropdownItem href="#" className="d-flex align-items-center">
                <CRow className="w-100">
                  <CCol xs="3" className="d-flex justify-content-center">
                    <CCardImage
                      src="https://via.placeholder.com/150"
                      alt="Product Image"
                      className="w-100"
                      style={{ height: '50px', objectFit: 'cover' }}
                    />
                  </CCol>
                  <CCol xs="6">
                    <CCardTitle className="mb-0" style={{ fontSize: '12px' }}>
                      ALABAMA
                    </CCardTitle>
                    <CCardText className="mb-0" style={{ fontSize: '12px' }}>
                      Material No
                    </CCardText>
                  </CCol>
                  <CCol xs="3" className="text-end">
                    <CCardText className="mb-0" style={{ fontSize: '12px' }}>
                      2 x Rp 1000
                    </CCardText>
                  </CCol>
                </CRow>
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* Button Notifications */}
          <CDropdown variant="nav-item" isOpen={isDropdownOpen} toggle={handleDropdownToggle}>
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
              <CDropdownItem href="#">Notifikasi 1</CDropdownItem>
              <CDropdownItem href="#">Notifikasi 2</CDropdownItem>
              <CDropdownItem href="#">Notifikasi 3</CDropdownItem>
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
              <label className="fw-bold">Kategori Utama</label>
              <CRow>
                <CCol xs="auto">
                  <CButton className="text-start" onClick={() => navigate('/kategori1')}>
                    <CIcon icon={cilFolder} className="me-2" /> {/* Ikon Kategori 1 */}
                    Kategori 1
                  </CButton>
                </CCol>
                <CCol xs="auto">
                  <CButton className="text-start" onClick={() => navigate('/kategori2')}>
                    <CIcon icon={cilStar} className="me-2" /> {/* Ikon Kategori 2 */}
                    Kategori 2
                  </CButton>
                </CCol>
                <CCol xs="auto">
                  <CButton className="text-start" onClick={() => navigate('/kategori3')}>
                    <CIcon icon={cilHeart} className="me-2" /> {/* Ikon Kategori 3 */}
                    Kategori 3
                  </CButton>
                </CCol>
                <CCol xs="auto">
                  <CButton className="text-start" onClick={() => navigate('/kategori2')}>
                    <CIcon icon={cilStar} className="me-2" /> {/* Ikon Kategori 2 */}
                    Kategori 2
                  </CButton>
                </CCol>
                <CCol xs="auto">
                  <CButton className="text-start" onClick={() => navigate('/kategori3')}>
                    <CIcon icon={cilHeart} className="me-2" /> {/* Ikon Kategori 3 */}
                    Kategori 3
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </CCollapse>
        </CRow>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
