import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import animationData1 from '../../assets/lottie/Animation - 1729582034020.json'
import animationData2 from '../../assets/lottie/Animation - wh location.json'
import animationData3 from '../../assets/lottie/Animation - incoming.json'
import animationData4 from '../../assets/lottie/Animation - 1729593009638.json'
import animationData5 from '../../assets/lottie/Animation - Forklift.json'

const lottieStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
}

const Home = () => {
  const animations = [
    animationData1,
    animationData2,
    animationData3,
    animationData4,
    animationData5,
  ]
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0) // Indeks animasi yang aktif

  useEffect(() => {
    const animationInterval = setInterval(() => {
      // Update animasi ke indeks berikutnya, reset ke 0 jika sudah mencapai akhir array
      setCurrentAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length)
    }, 4000) // Interval dalam milidetik (3000 ms = 3 detik)

    // Cleanup interval ketika komponen di-unmount
    return () => clearInterval(animationInterval)
  }, []) // [] untuk menjalankan useEffect sekali saat komponen mount

  const lottieStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
  }

  return (
    <div style={lottieStyle} className="mb-1">
      <Lottie animationData={animations[currentAnimationIndex]} loop={true} />
    </div>
  )
}

export default Home
