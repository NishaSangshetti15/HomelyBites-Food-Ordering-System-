import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './BrowseChefs.css'
import { StoreContext } from '../../context/StoreContext'

const BrowseChefs = () => {
  const navigate = useNavigate()
  const { token } = useContext(StoreContext)
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchChefs()
  }, [])

  const fetchChefs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verify token exists
      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      // Get featured chefs from dashboard home endpoint
      console.log('Fetching chefs with token:', token.substring(0, 20) + '...')
      
      const response = await axios.get('http://localhost:4000/customer/dashboard/home', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response received:', response.data)

      if (response.data.status === 'success' && response.data.data && response.data.data.featuredChefs) {
        const loadedChefs = response.data.data.featuredChefs
        console.log('Loaded chefs:', loadedChefs)
        
        if (loadedChefs.length === 0) {
          setError('No chefs available in your service area.')
        } else {
          setChefs(loadedChefs)
        }
      } else {
        console.error('Unexpected response format:', response.data)
        setError('Failed to load chefs. Please try again.')
      }
    } catch (err) {
      console.error('Error fetching chefs:', err.response || err.message || err)
      
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load chefs. Please try again.'
      setError(errorMsg)
      setChefs([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewMenu = (chefId) => {
    navigate(`/chef-menu/${chefId}`)
  }

  const filteredChefs = chefs.filter(chef =>
    chef.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className='browse-chefs-container'>
        <div className='loading'>
          <p>Loading chefs...</p>
          <p style={{fontSize: '12px', marginTop: '10px', color: '#999'}}>This may take a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className='browse-chefs-container'>
      <div className='browse-header'>
        <h1>Browse All Chefs</h1>
        <p>Discover and order from talented home chefs in your area</p>
      </div>

      {error && (
        <div className='error-message'>
          <strong>⚠️ Error:</strong> {error}
          <button className='retry-btn' onClick={fetchChefs}>Try Again</button>
        </div>
      )}

      {!error && chefs.length === 0 ? (
        <div className='no-chefs'>
          <p>No chefs available at the moment</p>
          <p style={{fontSize: '14px', marginTop: '10px', color: '#999'}}>Please check back later</p>
          <button className='retry-btn' onClick={fetchChefs}>Refresh</button>
        </div>
      ) : (
        <>
          <div className='search-section'>
            <input
              type='text'
              placeholder='Search for chefs...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='search-input'
            />
          </div>

          {filteredChefs.length === 0 && !error ? (
            <div className='no-chefs'>
              <p>No chefs found matching your search</p>
            </div>
          ) : (
            <div className='chefs-grid'>
              {filteredChefs.map((chef) => (
                <div key={chef.chef_id} className='chef-card'>
                  <div className='chef-header'>
                    <h2>{chef.business_name}</h2>
                    <div className='chef-rating'>
                      <span className='stars'>⭐ {chef.average_rating ? chef.average_rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  <div className='chef-info'>
                    <p className='total-orders'>📦 {chef.total_orders || 0} orders</p>
                  </div>

                  <button 
                    className='view-menu-btn'
                    onClick={() => handleViewMenu(chef.chef_id)}
                  >
                    View Menu
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BrowseChefs
