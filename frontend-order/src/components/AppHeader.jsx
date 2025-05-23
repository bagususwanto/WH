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
  const [markAsReadLocally, setMarkAsReadLocally] = useState(false)
  const { warehouse, setWarehouse, cartCount, cart, setCart } = useContext(GlobalContext)
  const dropdownRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useRef(null) // Ref untuk modal dropdown
  const [modalCloseTimer, setModalCloseTimer] = useState(null)
  const [dropdownNotif, setDropdownNotif] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const categoryButtonRef = useRef(null)
  const categoryDropdownRef = useRef(null)
  // Cek apakah 4 digit terakhir dari searchQuery adalah angka
  const lastFourDigits = searchQuery.slice(-4)
  const isLastFourDigitsNumber = /^\d{4}$/.test(lastFourDigits)

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

  const loadMoreNotifications = async () => {
    try {
      // Lakukan panggilan API untuk memuat lebih banyak notifikasi
      const response = await fetch(`/api/notifications?limit=5&offset=${notifDesc.length}`)
      if (!response.ok) {
        throw new Error('Failed to load more notifications')
      }

      const data = await response.json()

      // Mengembalikan data notifikasi
      return data.notifications || []
    } catch (error) {
      console.error('Error loading more notifications:', error)
      return []
    }
  }

  const handleLoadMore = async () => {
    try {
      // Tandai semua notifikasi sebagai sudah dibaca
      await postAllNotification(warehouse.id)

      // Perbarui state notifikasi menjadi sudah dibaca (isRead: 1)
      setNotifDesc((prevNotifDesc) => prevNotifDesc.map((notif) => ({ ...notif, isRead: 1 })))

      // Memuat lebih banyak notifikasi dari server dan menambahkannya ke state
      const moreNotifications = await loadMoreNotifications()
      setNotifDesc((prevNotifDesc) => [...prevNotifDesc, ...moreNotifications])

      // Arahkan pengguna ke halaman profil
      navigate('/profile')

      // Tutup dropdown setelah memuat lebih banyak notifikasi
      if (modalRef.current) {
        modalRef.current.classList.remove('show') // Menutup dropdown
      }
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

  const handleMarkAllAsRead = async () => {
    if (notifDesc.length > 0) {
      const updatedNotifs = notifDesc.map((notif) => ({
        ...notif,
        isRead: 1,
      }))
      setNotifDesc(updatedNotifs)
      setNotifCount(0) // Update notifCount setelah semua notifikasi dibaca
      try {
        await postAllNotification(warehouse.id) // Sinkronkan dengan server
        setIsModalOpen(true) // Menutup dropdown setelah Mark All As Read
      } catch (error) {
        console.error('Error marking notifications as read on server:', error)
      }
    }
  }



  const handleFocus = () => {
    setShowRecentSearches(searchHistory.length > 0)
  }

 const handleMouseEnter = () => {
    if (!showCategories) setShowCategories(true) // Menampilkan kategori hanya jika dropdown belum terbuka
  }

  // Handle ketika mouse meninggalkan tombol Category
  const handleMouseLeave = () => {
    // Dropdown tetap terbuka jika sudah terbuka, tidak menyembunyikan secara otomatis
    setShowCategories(false) // Menyembunyikan kategori hanya jika dropdown belum terbuka
  }

  const handleClickOutside = (e) => {
    // Memeriksa apakah klik berada di luar tombol kategori dan dropdown
    if (
      categoryButtonRef.current && !categoryButtonRef.current.contains(e.target) && // Klik di luar tombol Category
      categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target) // Klik di luar dropdown kategori
    ) {
      setShowCategories(false) // Menutup dropdown jika klik di luar
    }
  }

  useEffect(() => {
    // Tambahkan event listener saat komponen di-mount
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('click', handleClickOutside)
  
    // Bersihkan event listener saat komponen di-unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleClickOutsideSearch = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowRecentSearches(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideSearch)
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSearch)
    }
  }, [])
  

  return (
    <CHeader position="sticky" className="mb-4 p-0" onMouseLeave={handleMouseLeave}>
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
          ref={categoryButtonRef}
          onClick={handleToggleCategories} // Toggle kategori saat diklik
          onMouseEnter={handleMouseEnter} // Menampilkan kategori saat hover
          // onMouseLeave={handleMouseLeave} // Menyembunyikan kategori saat mouse meninggalkan
          style={{
            backgroundColor: showCategories ? '#E4E0E1' : '', // Ubah warna saat kategori aktif
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
                        onClick={() =>
                          isLastFourDigitsNumber
                            ? handleSuggestionClick(product.Material.materialNo)
                            : handleSuggestionClick(product.Material.description)
                        }
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
          <CDropdown
            variant="nav-item"
            autoClose="outside"
            visible={isCartOpen && !isNotifOpen && !isDropdownOpen} // Hanya tampilkan Cart jika Notif tertutup
            onMouseEnter={() => {
              setIsCartOpen(true)
              setIsNotifOpen(false) // Tutup Notif
              setIsDropdownOpen(false) // Tutup Notif
            }}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <CDropdownToggle
              className="my-1 py-0 pe-0 d-flex align-items-center position-relative me-3"
              caret={false}
            >
              <CIcon icon={cilCart} size="lg" />
              {cartCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute translate-middle"
                  style={{ top: '-4px', right: '-26px' }}
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

          <CDropdown
            variant="nav-item"
            autoClose="outside"
            visible={isNotifOpen} // Tampilkan jika terbuka
            onMouseEnter={() => {
              setIsNotifOpen(true)
              setIsCartOpen(false) // Tutup Cart
              setIsDropdownOpen(false) // Tutup Cart
            }}
            onMouseLeave={() => setIsNotifOpen(false)}
          >
            <CDropdownToggle className="my-1 d-flex align-items-center position-relative" caret={false}>
              <CIcon icon={cilBell} size="lg" />
              {notifCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute translate-middle"
                  style={{ top: '5px', right: '-15px' }}
                >
                  {notifCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu
              className="pt-0"
              placement="bottom-end"
              style={{
                position: 'relative',
                width: '400px',
                minWidth: '400px',
              }}
              ref={modalRef} // Menghubungkan ref dengan dropdown
              onMouseEnter={() => setDropdownNotif(false)} // Nonaktifkan autoClose saat mouse di dropdown
              onMouseLeave={() => setDropdownNotif(true)} // Aktifkan autoClose saat mouse keluar dropdown
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
                 {notifCount ? `Anda memiliki (${notifCount}) notifikasi` : "Tidak ada notifikasi"}
                </div>
              </CDropdownHeader>

              <div
                style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}
              >
                {notifDesc.length > 0 ? (
                  notifDesc.slice(0, 5).map((notif) => (
                    <CDropdownItem
                      key={notif.id}
                      onClick={() => handleNotifselect(notif)}
                      style={{
                        backgroundColor: notif.isRead === 0 ? '#E4E0E1' : 'white',
                        cursor: 'pointer',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      <CRow className="fw-light py-0 mb-0">
                        <label
                          style={{
                            fontSize: '0.75em',
                            whiteSpace: 'normal',
                            color:
                              notif.title === 'request approval'
                                ? 'yellow'
                                : notif.title === 'Order Completed'
                                  ? 'green'
                                  : notif.title === 'Item Rejected'
                                    ? 'red'
                                    : 'inherit', // Default color
                          }}
                        >
                          <CIcon icon={cilEnvelopeClosed} size="sm" /> {notif.title}
                        </label>
                      </CRow>
                      <CRow className="py-0 mb-1">
                        <label style={{ fontSize: '0.85em', whiteSpace: 'normal' }}>
                          {notif.description}
                        </label>
                      </CRow>
                      <hr className="mt-1 mb-1" />
                    </CDropdownItem>
                  ))
                ) : (
                  <div>No notifications</div>
                )}
              </div>

              <CDropdownHeader>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <CLink
                    onClick={handleMarkAllAsRead} // Panggil dengan event
                    className="text-primary"
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Mark as Read
                  </CLink>
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
        <CCollapse visible={showCategories} ref={categoryDropdownRef}>
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
