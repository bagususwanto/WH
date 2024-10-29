import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link } from 'react-router-dom'
import config from '../../utils/Config'
import animationData2 from '../../assets/lottie/Animation - order.json'
import animationData3 from '../../assets/lottie/Animation - incoming.json'
import animationData4 from '../../assets/lottie/Animation - 1729593009638.json'
import animationData5 from '../../assets/lottie/Animation - Forklift.json'
import animationData6 from '../../assets/lottie/Animation - 1729819077387.json'
import useVerify from '../../hooks/UseVerify'
import {
  CRow,
  CCol,
  CButton,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
} from '@coreui/react'
import backgroundImage from '../../assets/brand/bghome.png'
const lottieStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
}

const Home = () => {
  const { roleName } = useVerify()
  const animations = [
    animationData2,
    animationData3,
    animationData4,
    animationData5,
    animationData6,
  ]
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0) // Indeks animasi yang aktif

  useEffect(() => {
    const animationInterval = setInterval(() => {
      // Update animasi ke indeks berikutnya, reset ke 0 jika sudah mencapai akhir array
      setCurrentAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length)
    }, 6000) // Interval dalam milidetik (3000 ms = 3 detik)

    // Cleanup interval ketika komponen di-unmount
    return () => clearInterval(animationInterval)
  }, []) // [] untuk menjalankan useEffect sekali saat komponen mount

  const lottieStyle = {
    position: 'relative', // Fix the position relative to the viewport
    right: '0', // Align to the right edge
    top: '100%', // Align vertically to the middle
    transform: 'translateY(100%)', // Keep the element vertically centered
    transform: 'translateX(20%)', // Keep the element vertically centered
    width: '42vw', // Responsive width based on viewport width
    height: '34vh', // Responsive height based on viewport height
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
  const labelStyle = {
    fontSize: '3vw', // Responsive font size, adjusts based on viewport width
    fontWeight: '900', // Adjust for boldness
    color: '#343a40', // Text color
    textAlign: 'center', // Center the text horizontally
    marginBottom: '1rem', // Add some space below the heading
  }

  const secondaryLabelStyle = {
    fontSize: '1vw', // Smaller responsive font size for the secondary text
    color: '#343a40',
    textAlign: 'center',
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',

    height: '100%', // Use full height of the column
    paddingTop: '2rem', // Add padding at the top to give some space from the top
  }

  return (
    <div
      className="bg-body-tertiary d-flex flex-row align-items-start"
      style={{
        backgroundImage: `url(${backgroundImage})`, // Using imported image
        backgroundSize: 'cover', // Ensure the image covers the entire viewport
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        height: '88vh', // Full viewport height
        width: '100vw', // Full viewport width
        margin: '0', // Ensure no margin around the container
        padding: '0', // Ensure no padding inside the container
        overflow: 'hidden', // Prevent overflow issues
        maxWidth: '100%',
      }}
    >
      <CRow className="align-items-center mt-5">
        <CCol xs={12} md={6} lg={5}>
          <div style={containerStyle}>
            <label style={labelStyle}>
              Makes it Easier and Shortens the Time to Order Goods. Awesome!
            </label>
            <label style={secondaryLabelStyle}>
              Please choose what you want, ordering up to inventory is very easy with TWIIS!
            </label>
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center mt-4">
              <CButton
                className="py-2 px-4 py-md-3 px-md-5 me-md-4 mb-3 mb-md-0"
                color="primary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault() // Prevent default button behavior

                  // Define the URL based on the user's role
                  let url
                  if (roleName === 'super admin') {
                    url = `${config.ORDER_URL}/home`
                  } else if (roleName === 'group head') {
                    url = `${config.ORDER_URL}/home`
                     } else if (roleName === 'line head') {
                    url = `${config.ORDER_URL}/approveall`
                        } else if (roleName === 'group head') {
                    url = `${config.ORDER_URL}/approveall`
                       } else if (roleName === 'section head') {
                    url = `${config.ORDER_URL}/approveall`
                  } else {
                    // Optional: handle other roles or show a message if the role is not recognized
                    alert('You do not have access to this link.')
                    return
                  }

                  // Open the determined URL in a new tab
                  window.open(url, '_blank')
                }}
              >
                GO TO ORDER
              </CButton>

              <CDropdown>
                <CDropdownToggle className="px-4 py-2 px-md-5 py-md-3" color="secondary" size="sm">
                  INVENTORY
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>
                    <Link to="/inventory/input" style={{ textDecoration: 'none' }}>
                      INPUT INVENTORY
                    </Link>
                  </CDropdownItem>
                  <CDropdownItem>
                    <Link to="/inventory/data" style={{ textDecoration: 'none' }}>
                      TABEL INVENTORY
                    </Link>
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </div>
          </div>
        </CCol>
        <CCol xs={6} md={6} lg={7}>
          <div
            style={{
              ...lottieStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lottie animationData={animations[currentAnimationIndex]} loop={true} />
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default Home
