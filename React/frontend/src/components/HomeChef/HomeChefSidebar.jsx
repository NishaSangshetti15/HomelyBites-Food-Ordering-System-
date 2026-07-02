import React from 'react'
import './HomeChefSidebar.css'
import { NavLink } from 'react-router-dom'

const HomeChefSidebar = () => {
  return (
    <div className='homechef-sidebar'>
      <div className='sidebar-options'>
        <NavLink to='/homechef/dashboard/menu' className='sidebar-option'>
          <span className='icon'>📋</span>
          <p>Menu Items</p>
        </NavLink>

        <NavLink to='/homechef/dashboard/add-item' className='sidebar-option'>
          <span className='icon'>➕</span>
          <p>Add Item</p>
        </NavLink>

        <NavLink to='/homechef/dashboard/orders' className='sidebar-option'>
          <span className='icon'>📦</span>
          <p>Orders</p>
        </NavLink>

        <NavLink to='/homechef/dashboard/service-area' className='sidebar-option'>
          <span className='icon'>📍</span>
          <p>Service Areas</p>
        </NavLink>

        <NavLink to='/homechef/dashboard/earnings' className='sidebar-option'>
          <span className='icon'>💰</span>
          <p>Earnings</p>
        </NavLink>

        <NavLink to='/homechef/dashboard/profile' className='sidebar-option'>
          <span className='icon'>👤</span>
          <p>Profile</p>
        </NavLink>
      </div>
    </div>
  )
}

export default HomeChefSidebar
