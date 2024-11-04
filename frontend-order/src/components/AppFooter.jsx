import React from 'react'
import { CFooter } from '@coreui/react'
import { useLocation } from 'react-router-dom'

const AppFooter = () => {
  const location = useLocation()

  // Check if the current path is the cart screen
  const isCartScreen = location.pathname.includes('/cart') // Adjust based on your actual cart path

  return (
    <CFooter 
      className={`px-4 ${isCartScreen ? 'custom-footer' : ''}`}
      style={isCartScreen ? { backgroundColor: 'white', height: '55px' } : {}}
    >
      {!isCartScreen && (
        <div>
          <span className="ms-1">&copy; 2024 DX Warehouse.</span>
        </div>
      )}
    </CFooter>
  )
}

export default React.memo(AppFooter)
