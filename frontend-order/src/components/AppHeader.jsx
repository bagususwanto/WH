import React, { useEffect, useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import config from '../utils/Config'
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
  CImage,
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
  cilSearch,
  cilFactory,
  cilPaintBucket,
  cilFootball,
  cilPencil,
  cilEnvelopeClosed,
  cilCog,
  cilCut,
  cilTags,
} from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import useMasterDataService from '../services/MasterDataService'
import useProductService from '../services/ProductService'
import useCartService from '../services/CartService'
import useNotificationService from '../services/NotificationService'
import '../scss/appheader.scss'
import { GlobalContext } from '../context/GlobalProvider'
import logo from 'src/assets/brand/TWIIS-NEW.png'

const AppHeader = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [allProductsData, setAllProductsData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const { getMasterData } = useMasterDataService()
  const { getProduct, getAllProduct } = useProductService()
  const { getCartCount, getCart } = useCartService()
  const { getNotification, getNotificationCount, postNotification, postAllNotification } =
    useNotificationService()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showRecentSearches, setShowRecentSearches] = useState(false) // For controlling recent searches visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const [showCategories, setShowCategories] = useState(false)
  const [warehouseId, setWarehouseId] = useState(0)
  const [category, setCategory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [notifDesc, setNotifDesc] = useState([])
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const { warehouse, setWarehouse, cartCount, cart, setCart } = useContext(GlobalContext)
  const dropdownRef = useRef(null)

  const iconMap = {
    'Office Supp.': cilPencil,
    'Oper. Supply': cilFactory,
    'Support Oper': cilInbox,
    'Raw Matr.': cilPaintBucket,
    'Spare Part': cilFootball,
    Tools: cilCut,
    Others: cilTags,
  }

  const apiWarehouseUser = 'warehouse-user'
  const apiCategory = 'category-public'
  const apiWarehouse = 'warehouse-public'

  // Fetch products from API
  // const getProducts = async () => {
  //   try {
  //     const response = await getProduct(warehouse.id)
  //     setProductsData(response.data) // Assuming response.data is an array of products
  //   } catch (error) {
  //     console.error('Failed to fetch products:', error) // Log any errors
  //   }
  // }

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

  const getNotifCount = async () => {
    try {
      const response = await getNotificationCount(warehouse.id)
      setNotifCount(response.unreadCount)
    } catch (error) {
      console.error('Error fetching notif:', error)
    }
  }

  const getNotifDesc = async () => {
    try {
      const response = await getNotification(warehouse.id)
      setNotifDesc(response)
    } catch (error) {
      console.error('Error fetching notif:', error)
    }
  }

  useEffect(() => {
    getDefaultWarehouse()
    getWarehouse() // Fetch products on mount
    getCategories()
  }, []) // Empty dependency array ensures it only runs once

  useEffect(() => {
    if (warehouse && warehouse.id) {
      // getProducts()
      getCarts()
      getAllProducts()
      getNotifDesc()
      const interval = setInterval(() => {
        getNotifCount() // Poll every 5 seconds
      }, 5000)

      return () => clearInterval(interval) // Clear interval on component unmount
    }
  }, [warehouse, cartCount])

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

  const handleCartItemClick = (query) => {
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
    // Find the selected category based on the clicked categoryId
    const selectedCat = category.find((cat) => cat.id === categoryId)
    // Create a query string based on the selected categoryId
    const params = new URLSearchParams({
      id: categoryId,
    })
    // Navigate to the URL with the query parameters
    navigate(`/order/category?${params.toString()}`)
    // Set the selected category to the clicked category
    setSelectedCategory(selectedCat)
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

  const handleToggleCategories = () => {
    setShowCategories((prev) => !prev)
  }

  const handleSaveLocation = () => {
    const selectedId = Number(warehouseId) // Convert to number if necessary
    const selectedWarehouseData = warehouseData.find((warehouse) => warehouse.id === selectedId)
    if (selectedWarehouseData) {
      // Ensure that the warehouse is found
      setWarehouse(selectedWarehouseData)
      setModalVisible(false)
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
  const handleLoadMore = async () => {
    try {
      // Tandai semua notifikasi sebagai sudah dibaca
      await postAllNotification(warehouse.id)

      // Hapus notifikasi dari App Header
      setNotifDesc([])

      // Arahkan pengguna ke halaman profil
      navigate('/profile')
    } catch (error) {
      console.error('Error handling load more:', error)
    }
  }

  const handleNotifselect = async (notif) => {
    try {
      // Tandai notifikasi sebagai sudah dibaca
      await postNotification(warehouse.id, notif.id)

      // Perbarui state lokal untuk menandai notifikasi sebagai dibaca
      setNotifDesc((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: 1 } : n)))
      // Arahkan ke layar sesuai dengan judul notifikasi

      switch (notif.title) {
        case 'Request Order':
          navigate('/confirmall')
          break
        case 'Request Approval':
          navigate('/approveall')
          break
        case 'Order Completed':
          navigate('/history')
          break
        default:
          console.warn('Unknown notification title:', notif.title)
          break
      }
    } catch (error) {
      console.error('Error handling notification selection:', error)
    }
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0">
      <CContainer className="border-bottom px-4 py-2 mb-2" style={{ minHeight: '10px' }} fluid>
        <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <CIcon
            icon={cilLocationPin}
            size="sm" // Mengubah ukuran ikon menjadi kecil
            style={{ transition: 'color 0.3s', color: '#333', marginRight: '5px' }}
          />
          <b className="me-2" style={{ fontSize: '0.85rem' }}>
            {warehouse?.warehouseName}
          </b>
          <CLink
            color="primary"
            onClick={handleShowModal}
            style={{ cursor: 'pointer', fontSize: '0.85rem' }} // Ukuran teks lebih kecil
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

      <CContainer className="border-bottom pb-2 px-2" fluid>
        <CCol xs={6} sm={1} md={2} lg={2}>
          <a href="/#/home" className="d-flex align-items-center">
            <img src={logo} alt="Logo" className="sidebar-brand-full" height={40} />
          </a>
        </CCol>

        {/* AppHeaderDropdown hanya tampil di kiri pada layar xs */}
        <CCol xs={5} className="d-xs-block d-sm-none">
          <CHeaderNav>
            <AppHeaderDropdown />
          </CHeaderNav>
        </CCol>

        <CCol xs={12} sm={1} md={1} lg={1}>
          <CButton
            onClick={handleToggleCategories}
            style={{
              backgroundColor: showCategories ? '#E4E0E1' : '', // Ubah warna saat aktif/nonaktif
            }}
            onMouseEnter={(e) => {
              if (!showCategories) e.currentTarget.style.backgroundColor = '#E4E0E1'
            }}
            onMouseLeave={(e) => {
              if (!showCategories) e.currentTarget.style.backgroundColor = ''
            }}
          >
            Category
          </CButton>
        </CCol>

        {/* Search bar tetap */}
        <CCol xs={6} sm={3} md={3} lg={5}>
          <form ref={dropdownRef} onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <CIcon
                icon={cilSearch}
                style={{ marginLeft: '8px', color: '#888', fontSize: '1.2em', cursor: 'pointer' }}
              />
              <CFormInput
                type="search"
                placeholder="Search product..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="border-0 p-2"
                style={{
                  border: 'none', // Menghapus border duplikat karena sudah ada di container
                  boxShadow: 'none',
                  outline: 'none',
                  width: '100%', // Pastikan input mengisi ruang yang tersisa
                }}
              />
            </div>

            {/* Konten dropdown untuk saran dan pencarian */}
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
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f0f0'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fff'
                            }}
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
                        ))}
                      </div>
                    )}
              </div>
            )}
          </form>
        </CCol>

        <CHeaderNav className="d-flex align-items-center">
          {/* Konten keranjang dan notifikasi */}
          <CDropdown variant="nav-item">
            <CDropdownToggle
              className="py-0 pe-0 d-flex align-items-center position-relative"
              caret={false}
            >
              <CIcon icon={cilCart} size="lg" className="me-3" />
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
              <CDropdownHeader
                className="bg-body-secondary fw-semibold"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: 'inherit', // Warna latar belakang tetap sama
                  padding: '10px',
                  borderBottom: '1px solid #dee2e6', // Garis pemisah
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Your Cart ({cartCount})</span>
                  <CLink
                    onClick={() => navigate('/cart')}
                    className="text-primary"
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Show
                  </CLink>
                </div>
              </CDropdownHeader>

              <div
                style={{
                  maxHeight: '300px', // Batas tinggi scroll
                  overflowY: 'auto', // Scroll aktif hanya di sini
                }}
              >
                {cart.map((product, index) => (
                  <CDropdownItem
                    key={`${product.id}-${index}`}
                    className="d-flex align-items-center"
                    onClick={() => handleCartItemClick(product.Inventory.Material.description)}
                  >
                    <CRow className="w-100">
                      <CCol xs="2">
                        <CImage
                          src={
                            product?.Inventory?.Material?.img
                              ? `${config.BACKEND_URL}${product.Inventory.Material.img}`
                              : ''
                          }
                          style={{ width: '40px', height: '40px' }}
                        />
                      </CCol>
                      <CCol xs="8" className="mb-2">
                        <CCardTitle style={{ fontSize: '12px' }}>
                          {product.Inventory && product.Inventory.Material
                            ? product.Inventory.Material.description.length > 20
                              ? product.Inventory.Material.description.substring(0, 20) + '...'
                              : product.Inventory.Material.description
                            : 'No description'}
                        </CCardTitle>
                        <CCardText style={{ fontSize: '12px' }}>
                          {product.Inventory && product.Inventory.Material
                            ? product.Inventory.Material.materialNo
                            : 'No material number'}
                        </CCardText>
                      </CCol>
                      <CCol xs="2" className="text-end">
                        <CCardText style={{ fontSize: '12px' }}>
                          <b>{product.quantity} Item</b>
                        </CCardText>
                      </CCol>
                    </CRow>
                  </CDropdownItem>
                ))}
              </div>
            </CDropdownMenu>
          </CDropdown>

          <CDropdown variant="nav-item">
            <CDropdownToggle
              className="px-3 py-0 pe-0 d-flex align-items-center position-relative"
              caret={false}
            >
              <CIcon icon={cilBell} size="lg" className="me-5" />
              {notifCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute translate-middle"
                  style={{ top: '-2px', right: '25px' }}
                >
                  {notifCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu
              className="pt-0"
              placement="bottom-end"
              style={{ width: '460px', position: 'relative' }} // Atur lebar atau sesuaikan sesuai kebutuhan
            >
              <CDropdownHeader
                className="bg-body-secondary fw-semibold"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: 'inherit',
                  padding: '10px',
                  borderBottom: '1px solid #dee2e6',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Anda memiliki ({notifCount}) notifikasi
                </div>
              </CDropdownHeader>
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {notifDesc.length > 0 ? (
                  notifDesc.slice(0, 6).map((notif, index) => (
                    <CDropdownItem
                      key={index}
                      onClick={() => handleNotifselect(notif)} // Mengirim objek notif sebagai parameter
                      style={{
                        backgroundColor: notif.isRead === 0 ? '#E4E0E1' : 'white', // Latar biru untuk belum dibaca
                        cursor: 'pointer',
                      }}
                    >
                      <CRow className="fw-light py-0 mb-0">
                        <small>
                          <CIcon icon={cilEnvelopeClosed} size="sm" /> {notif.title}
                        </small>
                      </CRow>
                      <CRow className="py-0 mb-1">
                        <small>{notif.description}</small>
                      </CRow>
                      <hr className="mt-1 mb-1" />
                    </CDropdownItem>
                  ))
                ) : (
                  <CDropdownItem>No notification</CDropdownItem>
                )}
              </div>
              <CDropdownHeader>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <CLink
                    onClick={handleLoadMore}
                    className="text-primary"
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Load More
                  </CLink>
                </div>
              </CDropdownHeader>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>

        {/* AppHeaderDropdown di kanan untuk layar sm ke atas */}
        <CHeaderNav className="d-none d-sm-flex">
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer>
        <CRow>
          <CCollapse visible={showCategories}>
            <div className="p-3">
              <CRow>
                {category.map((cat, index) => (
                  <CCol xs="auto" key={cat.id}>
                    <CButton
                      className="text-start"
                      onClick={() => handleCategoryHeadClick(cat.id)}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        backgroundColor:
                          selectedCategory && selectedCategory.id === cat.id
                            ? '#E4E0E1' // Warna navy jika kategori terpilih
                            : hoveredCategory === cat.id
                              ? '#E4E0E1' // Warna saat hover
                              : index === 0 &&
                                  (!selectedCategory || selectedCategory.id === category[0].id)
                                ? '#E4E0E1' // Warna navy untuk kategori pertama jika belum ada yang dipilih atau kategori pertama dipilih
                                : 'white', // Warna default putih
                        color:
                          selectedCategory && selectedCategory.id === cat.id
                            ? 'black' // Warna teks hitam untuk kategori yang dipilih
                            : hoveredCategory === cat.id
                              ? 'black' // Warna teks saat hover
                              : index === 0 &&
                                  (!selectedCategory || selectedCategory.id === category[0].id)
                                ? 'black' // Warna teks hitam untuk kategori pertama jika dipilih
                                : 'black', // Warna teks default
                      }}
                    >
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
