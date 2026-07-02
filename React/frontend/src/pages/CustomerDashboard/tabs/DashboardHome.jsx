import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../../../context/StoreContext'
import '../styles/DashboardHome.css'

const DashboardHome = () => {
  const { token } = useContext(StoreContext)
  const [featuredChefs, setFeaturedChefs] = useState([])
  const [allChefs, setAllChefs] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartMessage, setCartMessage] = useState(null)
  const [cartItems, setCartItems] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedChef, setSelectedChef] = useState(null)
  const [chefMenuLoading, setChefMenuLoading] = useState(false)
  useEffect(() => {
    if (token) {
      fetchDashboardHome()
      fetchAllChefs()
    }
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('dashboardCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [token])

  const fetchDashboardHome = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:4000/customer/dashboard/home', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        console.log('Dashboard home data:', data.data)
        setFeaturedChefs(data.data.featuredChefs || [])
        setPopularItems(data.data.popularItems || [])
      } else {
        setError(data.error || 'Failed to load dashboard')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Error fetching data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllChefs = async () => {
    try {
      console.log('Fetching all chefs...')
      const response = await fetch('http://localhost:4000/customer/chefs/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('All chefs response:', data)
      if (data.status === 'success' && data.data) {
        console.log('All chefs loaded:', data.data)
        setAllChefs(data.data)
      }
    } catch (err) {
      console.error('Error fetching all chefs:', err)
    }
  }

  const handleAddToCart = (item) => {
    // Check if cart has items from a different chef
    const currentCartItems = Object.values(cartItems)
    
    if (currentCartItems.length > 0) {
      const existingChefId = currentCartItems[0].chef_id
      
      // If trying to add from different chef, show error and offer to clear cart
      if (existingChefId !== item.chef_id) {
        const confirmation = window.confirm(
          `Your cart has items from "${currentCartItems[0].business_name}". \n\nYou can only order from one chef at a time. \n\nClear cart and add items from "${item.business_name}"?`
        )
        
        if (confirmation) {
          // Clear cart and add new item
          const newCart = {
            [item.item_id]: {
              item_id: item.item_id,
              name: item.name,
              base_price: item.base_price,
              chef_id: item.chef_id,
              business_name: item.business_name,
              quantity: 1
            }
          }
          setCartItems(newCart)
          localStorage.setItem('dashboardCart', JSON.stringify(newCart))
          setCartMessage(`✓ Cart cleared and ${item.name} added from ${item.business_name}!`)
          setTimeout(() => setCartMessage(null), 2000)
        }
        return
      }
    }
    
    // Initialize cart structure if doesn't exist
    const updatedCart = { ...cartItems }
    
    if (!updatedCart[item.item_id]) {
      updatedCart[item.item_id] = {
        item_id: item.item_id,
        name: item.name,
        base_price: item.base_price,
        chef_id: item.chef_id,
        business_name: item.business_name,
        quantity: 1
      }
    } else {
      updatedCart[item.item_id].quantity += 1
    }

    setCartItems(updatedCart)
    localStorage.setItem('dashboardCart', JSON.stringify(updatedCart))
    
    // Show success message
    setCartMessage(`✓ ${item.name} added to cart!`)
    setTimeout(() => setCartMessage(null), 2000)
  }

  const getCartItemsArray = () => {
    return Object.values(cartItems)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults(null)
      setSelectedChef(null)
      return
    }

    // Filter chefs by name from ALL chefs (case-insensitive)
    console.log('Searching for:', query)
    console.log('Searching in chefs:', allChefs)
    const filtered = allChefs.filter(chef =>
      chef.business_name.toLowerCase().includes(query.toLowerCase())
    )
    
    console.log('Search results:', filtered)
    setSearchResults(filtered.length > 0 ? filtered : [])
    setSelectedChef(null)
  }

  const handleSelectChef = async (chef) => {
    setSelectedChef(chef)
    setChefMenuLoading(true)
    
    try {
      console.log('Fetching menu for chef:', chef.chef_id)
      const response = await fetch(`http://localhost:4000/chef/menu/${chef.chef_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('Chef menu response:', data)

      if (data.status === 'success' && data.data) {
        setSelectedChef({
          ...chef,
          menuItems: data.data
        })
      } else {
        setError(data.error || 'Failed to load chef menu')
      }
    } catch (err) {
      console.error('Error fetching chef menu:', err)
      setError('Error fetching chef menu: ' + err.message)
    } finally {
      setChefMenuLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    setSelectedChef(null)
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard-home">
      {/* Cart Message */}
      {cartMessage && (
        <div className="cart-message">
          {cartMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by chef name or kitchen..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>🎯</h3>
          <p>Browse & Order</p>
          <span>Fresh homemade food</span>
        </div>
        <div className="stat-card">
          <h3>⭐</h3>
          <p>Top Rated</p>
          <span>From trusted chefs</span>
        </div>
        <div className="stat-card">
          <h3>🚚</h3>
          <p>Fast Delivery</p>
          <span>To your doorstep</span>
        </div>
        <div className="stat-card">
          <h3>💳</h3>
          <p>Easy Payment</p>
          <span>Secure & convenient</span>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults !== null && (
        <section className="search-results-section">
          <div className="search-results-header">
            <h2>Search Results for "{searchQuery}"</h2>
            <button 
              className="close-results-btn"
              onClick={handleClearSearch}
              title="Close search results"
            >
              ✕ Close
            </button>
          </div>

          {searchResults.length > 0 ? (
            <>
              {/* Chef Selection */}
              <div className="search-chefs-list">
                <h3>Found {searchResults.length} chef(s):</h3>
                <div className="search-chefs-grid">
                  {searchResults.map((chef) => (
                    <div
                      key={chef.chef_id}
                      className={`search-chef-card ${selectedChef?.chef_id === chef.chef_id ? 'selected' : ''}`}
                      onClick={() => handleSelectChef(chef)}
                    >
                      <div className="search-chef-header">
                        <h4>{chef.business_name}</h4>
                        <div className="rating">
                          <span className="stars">⭐</span>
                          <span className="rating-value">{chef.average_rating || 0}</span>
                        </div>
                      </div>
                      <div className="search-chef-info">
                        <p><strong>{chef.menu_count || 0}</strong> items</p>
                        <p><strong>{chef.total_orders || 0}</strong> orders</p>
                      </div>
                      <button className="select-btn">
                        {selectedChef?.chef_id === chef.chef_id ? '✓ Selected' : 'View Menu'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Menu Items */}
              {selectedChef && (
                <div className="chef-menu-section">
                  <div className="chef-menu-header">
                    <div className="chef-title">
                      <h3>Menu from {selectedChef.business_name}</h3>
                      <p className="chef-rating">⭐ {selectedChef.average_rating} • {selectedChef.total_orders} orders</p>
                    </div>
                  </div>

                  {chefMenuLoading ? (
                    <div className="loading">Loading menu items...</div>
                  ) : selectedChef.menuItems && selectedChef.menuItems.length > 0 ? (
                    <div className="items-grid">
                      {selectedChef.menuItems.map((item) => (
                        <div key={item.item_id} className="food-item-card">
                          <div className="item-image">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} />
                            ) : (
                              <div className="placeholder">No Image</div>
                            )}
                          </div>
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p className="description">{item.description}</p>
                            <div className="item-footer">
                              <span className="price">₹{item.base_price}</span>
                              <button 
                                className="add-btn"
                                onClick={() => handleAddToCart({
                                  ...item,
                                  business_name: selectedChef.business_name,
                                  chef_id: selectedChef.chef_id
                                })}
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No items available from this chef</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="no-results">No chefs found matching "{searchQuery}"</p>
          )}
        </section>
      )}

      {/* Featured Chefs - Hidden when searching */}
      {!searchQuery && (
        <section className="home-section">
          <h2>Featured Chefs</h2>
          {featuredChefs.length > 0 ? (
            <div className="chefs-grid">
              {featuredChefs.map((chef) => (
                <div key={chef.chef_id} className="chef-card">
                  <div className="chef-header">
                    <h3>{chef.business_name}</h3>
                    <div className="rating">
                      <span className="stars">⭐</span>
                      <span className="rating-value">{chef.average_rating || 0}</span>
                    </div>
                  </div>
                  <div className="chef-info">
                    <p><strong>Total Orders:</strong> {chef.total_orders || 0}</p>
                  </div>
                  <button className="view-btn">View Menu</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No featured chefs available in your area</p>
          )}
        </section>
      )}

      {/* Popular Items - Hidden when searching */}
      {!searchQuery && (
        <section className="home-section">
          <h2>Popular Items</h2>
          {popularItems.length > 0 ? (
            <div className="items-grid">
              {popularItems.map((item) => (
              <div key={item.item_id} className="food-item-card">
                <div className="item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="chef-name">By {item.business_name}</p>
                  <p className="description">{item.description}</p>
                  <div className="item-footer">
                    <span className="price">₹{item.base_price}</span>
                    <button 
                      className="add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No items available yet</p>
        )}
        </section>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default DashboardHome
