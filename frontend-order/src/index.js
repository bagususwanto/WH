import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import './custom.css'

import App from './App'
import store from './store'
import { AuthProvider } from '../../frontend/src/context/AuthProvider'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
           <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>,
)
