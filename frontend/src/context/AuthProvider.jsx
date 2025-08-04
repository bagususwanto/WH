import { createContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    name: '',
    roleName: '',
    warehouseId: 0,
    token: '',
    expire: 0,
    isWarehouse: 0,
    imgProfile: '',
  })

  // Ambil token dari localStorage saat pertama kali load
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        if (decoded.exp * 1000 > Date.now()) {
          setAuth({
            name: decoded.name,
            roleName: decoded.roleName,
            warehouseId: decoded.anotherWarehouseId,
            token: storedToken,
            expire: decoded.exp,
            isWarehouse: decoded.isWarehouse,
            imgProfile: decoded.img,
          })
        } else {
          // Token expired
          localStorage.removeItem('accessToken')
        }
      } catch (err) {
        console.error('Invalid token in localStorage:', err)
        localStorage.removeItem('accessToken')
      }
    }
  }, [])

  // Saat login / refresh token berhasil
  const setTokenAndDecode = (accessToken) => {
    const decoded = jwtDecode(accessToken)
    setAuth({
      name: decoded.name,
      roleName: decoded.roleName,
      warehouseId: decoded.anotherWarehouseId,
      token: accessToken,
      expire: decoded.exp,
      isWarehouse: decoded.isWarehouse,
      imgProfile: decoded.img,
    })
    localStorage.setItem('accessToken', accessToken)
  }

  // Tambahkan logout opsional
  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    setAuth({
      name: '',
      roleName: '',
      warehouseId: 0,
      token: '',
      expire: 0,
      isWarehouse: 0,
      imgProfile: '',
    })
  }

  return (
    <AuthContext.Provider value={{ auth, setTokenAndDecode, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
