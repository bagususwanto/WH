import React, { createContext, useState } from 'react'

// Membuat context
const GlobalContext = createContext()

// Provider untuk menyediakan data global
const GlobalProvider = ({ children }) => {
  const [warehouse, setWarehouse] = useState([])

  return (
    <GlobalContext.Provider value={{ warehouse, setWarehouse }}>{children}</GlobalContext.Provider>
  )
}

export { GlobalContext, GlobalProvider }
