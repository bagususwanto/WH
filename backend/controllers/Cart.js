import React, { createContext, useState, useContext } from 'react';

const Cart = createContext();

export const useCart = () => useContext(Cart);

export const Cart = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity) => {
    setCart((prevCart) => [...prevCart, { ...product, quantity }]);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  return (
    <Cart.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </Cart.Provider>
  );
};