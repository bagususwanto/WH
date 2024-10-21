import React, { createContext, useEffect, useState } from 'react'
import useOrderService from '../services/OrderService'
import useCartService from '../services/CartService'

// Membuat context
const GlobalContext = createContext()

// Provider untuk menyediakan data global
const GlobalProvider = ({ children }) => {
  const [warehouse, setWarehouse] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [cart, setCart] = useState([])

  const { getWishlist } = useOrderService()
  const { getCartCount, getCart } = useCartService()

  const fetchWishlists = async () => {
    try {
      const response = await getWishlist(warehouse.id)
      setWishlist(response.data)
    } catch (error) {
      console.error('Error fetching wishlists:', error)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await getCartCount(warehouse.id)
      setCartCount(response.totalItems)
    } catch (error) {
      console.error('Error fetching carts:', error)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await getCart(warehouse.id)
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching carts:', error)
    }
  }

  useEffect(() => {
    if (warehouse && warehouse.id) {
      fetchWishlists()
      fetchCartCount()
      fetchCart()
    }
  }, [warehouse])

  return (
    <GlobalContext.Provider
      value={{
        warehouse,
        setWarehouse,
        wishlist,
        setWishlist,
        cartCount,
        setCartCount,
        cart,
        setCart,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export { GlobalContext, GlobalProvider }
