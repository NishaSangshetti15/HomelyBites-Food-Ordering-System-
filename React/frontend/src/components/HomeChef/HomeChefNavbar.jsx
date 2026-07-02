import React from 'react'
import './HomeChefNavbar.css'
import { homeChefService } from '../../services/homeChefService'
import { useNavigate } from 'react-router-dom'

const HomeChefNavbar = () => {
  const navigate = useNavigate()
  const chefInfo = homeChefService.getCurrentChef()

  const handleLogout = () => {
    homeChefService.signout()
    navigate('/homechef/login')
  }

  return (
    <div className='homechef-navbar'>
      <div className='navbar-left'>
        <h2 className='navbar-title'>HomelyBites - Chef Dashboard</h2>
      </div>
      <div className='navbar-right'>
        <div className='chef-info'>
          <p className='business-name'>{chefInfo?.business_name || 'Chef'}</p>
          <p className='rating'>⭐ {chefInfo?.average_rating || '0.00'}</p>
        </div>
        <button onClick={handleLogout} className='logout-btn'>
          Logout
        </button>
      </div>
    </div>
  )
}

export default HomeChefNavbar
