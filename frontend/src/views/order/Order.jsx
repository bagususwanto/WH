import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardImage,
  CCardTitle,
  CCardText,
  CButton,
  CRow,
  CCol,
  CBadge,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart } from '@coreui/icons'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Slider from 'react-slick'

const ProductList = () => {
  // Data produk dummy
  const productsData = Array.from({ length: 50 }, (_, index) => {
    const stockStatus = ['In Stock', 'Low Stock', 'Out of Stock'][Math.floor(Math.random() * 3)]
    return {
      id: index + 1,
      name: `Product ${index + 1}`,
      price: Math.floor(Math.random() * 100000) + 10000,
      stockStatus, // Keterangan stok
      imageUrl: 'https://via.placeholder.com/150',
    }
  })

  // Data kategori dummy
  const categories = [
    { id: 1, name: 'Category 1', imageUrl: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Category 2', imageUrl: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Category 3', imageUrl: 'https://via.placeholder.com/100' },
    { id: 4, name: 'Category 4', imageUrl: 'https://via.placeholder.com/100' },
    { id: 5, name: 'Category 5', imageUrl: 'https://via.placeholder.com/100' },
    { id: 6, name: 'Category 6', imageUrl: 'https://via.placeholder.com/100' },
  ]

  // State untuk produk yang ditampilkan
  const [visibleProducts, setVisibleProducts] = useState(productsData.slice(0, 20))
  const [allVisible, setAllVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fungsi untuk menampilkan semua produk
  const handleLoadMore = () => {
    setVisibleProducts(productsData)
    setAllVisible(true)
  }

  const handleOrder = (product) => {
    console.log(`Order product: ${product.name}`)
  }

  // Fungsi untuk menentukan warna berdasarkan status stok
  const getStockBadgeColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'success'
      case 'Low Stock':
        return 'warning'
      case 'Out of Stock':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  // Filter produk berdasarkan query pencarian
  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Slider settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3, // Menampilkan 3 kategori sekaligus di layar lebih lebar
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // Ketika layar lebih kecil dari 768px (mobile)
        settings: {
          slidesToShow: 2, // Menampilkan 2 kategori sekaligus di layar lebih kecil
        },
      },
      {
        breakpoint: 480, // Ketika layar lebih kecil dari 480px
        settings: {
          slidesToShow: 1, // Menampilkan 1 kategori sekaligus di layar sangat kecil
        },
      },
    ],
  }

  const handleCategoryClick = (category) => {
    console.log(`Category clicked: ${category.name}`)
    // Tambahkan logika yang diperlukan, misalnya filter produk berdasarkan kategori
  }

  return (
    <>
      {/* Input pencarian */}
      <CFormInput
        type="search"
        placeholder="Search product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Tombol untuk kategori produk */}
      <CCard className="mb-4">
        <CCardHeader>Category</CCardHeader>
        <CCardBody>
          <Slider {...settings} className="mb-4">
            {categories.map((category) => (
              <div key={category.id} className="d-flex flex-column align-items-center">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="rounded-circle"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    marginBottom: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCategoryClick(category)}
                />
                <div style={{ fontSize: '12px', textAlign: 'center' }}>{category.name}</div>
              </div>
            ))}
          </Slider>
        </CCardBody>
      </CCard>

      <CRow>
        {filteredProducts.slice(0, allVisible ? filteredProducts.length : 20).map((product) => (
          <CCol xs="12" sm="6" md="4" lg="4" xl="3" key={product.id} className="mb-4">
            <CCard className="h-100">
              <CCardImage
                orientation="top"
                src={product.imageUrl}
                alt={product.name}
                style={{ height: '150px', objectFit: 'cover' }}
              />
              <CCardBody>
                <CCardTitle>{product.name}</CCardTitle>
                <CCardText>Price: Rp {product.price.toLocaleString('id-ID')}</CCardText>
                <CRow>
                  <CCol sm="12" className="mb-2">
                    <CBadge color={getStockBadgeColor(product.stockStatus)}>
                      {product.stockStatus}
                    </CBadge>
                  </CCol>
                  <CCol sm="3">
                    {product.stockStatus !== 'Out of Stock' ? (
                      <CButton
                        className="rounded-circle"
                        color="primary"
                        onClick={() => handleOrder(product)}
                      >
                        <CIcon icon={cilCart} />
                      </CButton>
                    ) : (
                      ''
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Tampilkan tombol "Muat Lebih Banyak" hanya jika belum semua produk ditampilkan */}
      {!allVisible && filteredProducts.length > 20 && (
        <div className="text-center mt-4 mb-4">
          <CButton color="secondary" onClick={handleLoadMore}>
            Load More
          </CButton>
        </div>
      )}
    </>
  )
}

export default ProductList
