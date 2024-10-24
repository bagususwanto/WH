import React, { Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

const AppContent = () => {
  const location = useLocation()

  return (
    <>
      {location.pathname !== '/home' ? (
        <CContainer className="px-4" fluid>
          <Suspense fallback={<CSpinner color="primary" />}>
            <Routes>
              {routes.map((route, idx) => {
                return (
                  route.element && (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      element={<route.element />}
                    />
                  )
                )
              })}
              <Route path="/" element={<Navigate to="home" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CContainer>
      ) : (
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {routes.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              )
            })}
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  )
}

export default React.memo(AppContent)
