import React, { useState, useEffect } from 'react'
import useVerify from '../../hooks/UseVerify'
import '../../scss/home.scss'
import Lottie from 'lottie-react'
import { Link } from 'react-router-dom'
import config from '../../utils/Config'
import animationData2 from '../../assets/lottie/Animation - order.json'
import orderIcon from '../../assets/icons//shopping-cart.png'; // Contoh: Ganti dengan nama file Anda
import inputIcon from '../../assets/icons/inventory.png'; // Contoh
import dataIcon from '../../assets/icons/registration.png';   // Contoh
import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate =useNavigate();
  const { roleName } = useVerify()
  const animations = [
    animationData2,
  
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



  return (
<section className='home-container'>
  <div className='home-overlay'></div>
  
  <div className='content-wrapper'>
    <div className='text-content'>
      <p className='home-title'>Welcome to </p>
      <p className='home-title'>TWIIS</p>
      <p className='home-Subtitle'>Makes it Easier and Shortens the Time to Order Goods. Awesome!</p>

      <p className='subtitle-little'> Enjoy choice!</p>
      <div className='button-group'>
        <button 
        className='rounded-button'
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
          <img src={orderIcon} alt="Order Icon" className="button-icon" />
          <span>Go To Order</span>
        </button>


        <button 
        className='rounded-button'
        onClick={() => navigate ("/inventory/input")}
        >
          <img src={inputIcon} alt="Input Icon" className="button-icon" />
          <span>Input Inventory</span>
        </button>

        <button 
        className='rounded-button'
        onClick={() => navigate ("/inventory/data")}
        >
          <img src={dataIcon} alt="Data Icon" className="button-icon" />
          <span>Data Inventory</span>
        </button>
      </div>
    </div>

    <div className='lottie-animation'>
      <Lottie animationData={animations[currentAnimationIndex]} loop={true} />
    </div>
  </div>
</section>

  )
}

export default Home
