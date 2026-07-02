import React, { useState, useEffect, useContext } from 'react'
import './CustomerDashboard.css'
import { StoreContext } from '../../context/StoreContext'
import DashboardHome from './tabs/DashboardHome'
import DashboardCart from './tabs/DashboardCart'
import DashboardOrders from './tabs/DashboardOrders'
import DashboardSettings from './tabs/DashboardSettings'

const CustomerDashboard = () => {
  const { token, customer } = useContext(StoreContext)
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      window.location.href = '/auth'
    }
  }, [token])

  // Handle hash navigation (e.g., #orders, #cart)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      console.log('Hash changed to:', hash)
      if (hash && ['home', 'cart', 'orders', 'settings'].includes(hash)) {
        console.log('Setting active tab to:', hash)
        setActiveTab(hash)
      } else if (!hash) {
        console.log('No hash, setting to home')
        setActiveTab('home')
      }
    }

    // Check current hash on mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'home':
          return <DashboardHome />
        case 'cart':
          return <DashboardCart />
        case 'orders':
          return <DashboardOrders />
        case 'settings':
          return <DashboardSettings />
        default:
          return <DashboardHome />
      }
    } catch (err) {
      console.error('Error rendering tab:', err)
      return <div className="error-container"><p>Error loading tab. Please refresh the page.</p></div>
    }
  }

  return (
    <div className="customer-dashboard">
      <div className={`dashboard-container ${activeTab === 'orders' ? 'full-width' : ''}`}>
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome, {customer?.first_name || 'Customer'}</h1>
          <p className="header-subtitle">Manage your orders, cart, and account settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabClick('home')}
          >
            <span className="tab-icon">🏠</span>
            Home
          </button>
          <button
            className={`tab-button ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => handleTabClick('cart')}
          >
            <span className="tab-icon">🛒</span>
            Cart
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabClick('orders')}
          >
            <span className="tab-icon">📦</span>
            Orders
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabClick('settings')}
          >
            <span className="tab-icon">⚙️</span>
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
