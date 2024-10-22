import React from 'react'
import { CRow } from '@coreui/react'
import Lottie from 'lottie-react'
import animationData from '../../assets/lottie/Animation - 1729582034020.json'

const Home = () => {
  const lottieStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }

  return (
    <CRow style={lottieStyle}>
      <Lottie animationData={animationData} loop={true} />
    </CRow>
  )
}

export default Home
