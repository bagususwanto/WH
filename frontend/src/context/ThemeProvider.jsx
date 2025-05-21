/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [colorModeContext, setColorModeContext] = useState(
    () => localStorage.getItem('coreui-free-react-admin-template-theme') || 'light',
  )

  useEffect(() => {
    localStorage.setItem('coreui-free-react-admin-template-theme', colorModeContext)
  }, [colorModeContext])

  return (
    <ThemeContext.Provider value={{ colorModeContext, setColorModeContext }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
