import React, { useContext } from 'react'
import './HomeChefDashboard.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomeChefNavbar from '../../components/HomeChef/HomeChefNavbar'
import HomeChefSidebar from '../../components/HomeChef/HomeChefSidebar'
import MenuItems from './MenuItems'
import AddMenuItem from './AddMenuItem'
import Orders from './Orders'
import ServiceArea from './ServiceArea'
import Earnings from './Earnings'
import Profile from './Profile'
import { StoreContext } from '../../context/StoreContext'

const HomeChefDashboard = () => {
  const { isAuthenticated, userRole } = useContext(StoreContext)

  if (!isAuthenticated || userRole !== 'Home Chef') {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className='homechef-dashboard'>
      <HomeChefNavbar />
      <div className='dashboard-content'>
        <HomeChefSidebar />
        <div className='dashboard-main'>
          <Routes>
            <Route path='menu' element={<MenuItems />} />
            <Route path='add-item' element={<AddMenuItem />} />
            <Route path='orders' element={<Orders />} />
            <Route path='service-area' element={<ServiceArea />} />
            <Route path='earnings' element={<Earnings />} />
            <Route path='profile' element={<Profile />} />
            <Route path='*' element={<Navigate to='menu' replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default HomeChefDashboard
