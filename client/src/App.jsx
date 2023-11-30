import React from 'react'
import axios from 'axios'
import { UserContextProvider } from './context/UserContext'
import Routes from './routes/Routes'

const App = () => {
  axios.defaults.baseURL = 'http://localhost:3000'
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App




