import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

import animationData2 from '../../assets/lottie/Animation - order.json'
import animationData3 from '../../assets/lottie/Animation - incoming.json'
import animationData4 from '../../assets/lottie/Animation - 1729593009638.json'
import animationData5 from '../../assets/lottie/Animation - Forklift.json'
import animationData6 from '../../assets/lottie/Animation - 1729819077387.json'
import { CRow, CCol } from '@coreui/react'
import backgroundImage from '../../assets/brand/bghome.png'
const lottieStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
}

const Home = () => {
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
    position: 'fixed', // Fix the position relative to the viewport
    right: '0', // Align to the right edge
    top: '50%', // Align vertically to the middle
    transform: 'translateY(-50%)', // Keep the element vertically centered
    width: '40vw', // Responsive width based on viewport width
    height: '30vh', // Responsive height based on viewport height
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
    justifyContent: 'center', // Center vertically within the column
    alignItems: 'center', // Center horizontally within the column
    height: '100%', // Use full height of the column
  }

  return (
    <div
      className="bg-body-tertiary d-flex flex-row align-items-center"
      style={{
        backgroundImage: `url(${backgroundImage})`, // Using imported image
        backgroundSize: 'cover', // Ensure the image covers the entire viewport
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        height: '100vh', // Full viewport height
        width: '100vw', // Full viewport width
        margin: '0', // Ensure no margin around the container
        padding: '0', // Ensure no padding inside the container
        overflow: 'hidden', // Prevent overflow issues
      }}
    >
      <CRow>
        <CCol xs={5}>
          <div style={containerStyle}>
            <label style={labelStyle}>
              Makes it Easier and Shortens the Time to Order Goods. Awesome!
            </label>
            <label style={secondaryLabelStyle}>
              Please choose what you want, ordering up to inventory is very easy with TWIIS!
            </label>
          </div>
        </CCol>
        <CCol xs={5}>
          <div style={lottieStyle} className="mb-1">
            <Lottie animationData={animations[currentAnimationIndex]} loop={true} />
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default Home
