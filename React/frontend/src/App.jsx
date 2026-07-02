
import React, { useState, useContext, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import HomeChefLogin from './pages/HomeChefDashboard/HomeChefLogin'
import HomeChefDashboard from './pages/HomeChefDashboard/HomeChefDashboard'
import UnifiedAuthPage from './pages/Auth/UnifiedAuthPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import DeliveryDashboard from './pages/Delivery/DeliveryDashboard'
import CustomerDashboard from './pages/CustomerDashboard/CustomerDashboard'
import BrowseChefs from './pages/BrowseChefs/BrowseChefs'
import ChefMenu from './pages/ChefMenu/ChefMenu'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { StoreContext } from './context/StoreContext'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const { isAuthenticated, userRole } = useContext(StoreContext)

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Routes>
          {/* Unified Auth Routes */}
          <Route path='/auth' element={<UnifiedAuthPage />} />
          
          {/* Customer Routes - Protected */}
          <Route path='/' element={
            isAuthenticated && userRole === 'Customer' 
              ? <Navigate to="/customer/dashboard" replace />
              : <Navigate to="/auth" replace />
          } />
          
          {/* Customer Dashboard - Main Customer Interface */}
          <Route path='/customer/dashboard' element={
            isAuthenticated && userRole === 'Customer'
              ? <><Navbar setShowLogin={setShowLogin}/><CustomerDashboard/></>
              : <Navigate to="/auth" replace />
          } />

          {/* Customer Browse/Order Pages */}
          <Route path='/browse' element={
            isAuthenticated && userRole === 'Customer'
              ? <><Navbar setShowLogin={setShowLogin}/><BrowseChefs/></>
              : <Navigate to="/auth" replace />
          } />

          <Route path='/chef-menu/:chefId' element={
            isAuthenticated && userRole === 'Customer'
              ? <><Navbar setShowLogin={setShowLogin}/><ChefMenu/></>
              : <Navigate to="/auth" replace />
          } />
          
          <Route path='/cart' element={
            isAuthenticated && userRole === 'Customer'
              ? <><Navbar setShowLogin={setShowLogin}/><Cart/></>
              : <Navigate to="/auth" replace />
          }/>
          
          <Route path='/order' element={
            isAuthenticated && userRole === 'Customer'
              ? <><Navbar setShowLogin={setShowLogin}/><PlaceOrder/></>
              : <Navigate to="/auth" replace />
          }/>
          
          {/* HomeChef Routes - Protected */}
          <Route path='/homechef/login' element={<HomeChefLogin />} />
          <Route path='/homechef/dashboard/*' element={
            isAuthenticated && userRole === 'Home Chef'
              ? <HomeChefDashboard />
              : <Navigate to="/auth" replace />
          } />
          
          {/* Admin Routes - Protected */}
          <Route path='/admin/dashboard' element={
            isAuthenticated && userRole === 'Admin'
              ? <AdminDashboard />
              : <Navigate to="/auth" replace />
          } />
          
          {/* Delivery Person Routes - Protected */}
          <Route path='/delivery/dashboard' element={
            isAuthenticated && userRole === 'Delivery Person'
              ? <DeliveryDashboard />
              : <Navigate to="/auth" replace />
          } />

          {/* Default redirect to auth if no route matches */}
          <Route path='*' element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
      <Routes>
        <Route path='/' element={
          isAuthenticated && userRole === 'Customer' ? <Footer/> : <></>
        } />
        <Route path='/customer/dashboard' element={
          isAuthenticated && userRole === 'Customer' ? <Footer/> : <></>
        } />
        <Route path='/cart' element={
          isAuthenticated && userRole === 'Customer' ? <Footer/> : <></>
        } />
        <Route path='/order' element={
          isAuthenticated && userRole === 'Customer' ? <Footer/> : <></>
        } />
      </Routes>
    </>
    
  )
}

export default App
