import React, { createContext, useState } from 'react'

export const GlobalContext = createContext()

export const GlobalProvider = ({ children }) => {
  const [warehouse, setWarehouse] = useState([
    { id: 1, warehouseName: 'Warehouse Issuing Karawang 1 & 2' },
  ])

  return (
    <GlobalContext.Provider value={{ warehouse, setWarehouse }}>{children}</GlobalContext.Provider>
  )
}
