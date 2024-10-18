import React, { createContext, useEffect, useState } from 'react'
import useOrderService from '../services/OrderService'

// Membuat context
const GlobalContext = createContext()

// Provider untuk menyediakan data global
const GlobalProvider = ({ children }) => {
  const [warehouse, setWarehouse] = useState([])
  const [wishlist, setWishlist] = useState([])

  const { getWishlist } = useOrderService()

  const fetchWishlists = async () => {
    try {
      const response = await getWishlist(warehouse.id)
      setWishlist(response.data)
    } catch (error) {
      console.error('Error fetching wishlists:', error)
    }
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      fetchWishlists()
    }
  }, [warehouse])

  return (
    <GlobalContext.Provider value={{ warehouse, setWarehouse, wishlist, setWishlist }}>
      {children}
    </GlobalContext.Provider>
  )
}

export { GlobalContext, GlobalProvider }
