import React, { useState, useEffect } from 'react'
import './AdminDashboard.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [chefs, setChefs] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const url = 'http://localhost:4000'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth')
      return
    }
    fetchData()
  }, [activeTab])

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'chefs') {
        const response = await axios.get(`${url}/admin/chefs`, {
          headers: getHeaders()
        })
        if (response.data.status === 'success') {
          setChefs(response.data.data)
        }
      } else if (activeTab === 'customers') {
        const response = await axios.get(`${url}/admin/customers`, {
          headers: getHeaders()
        })
        if (response.data.status === 'success') {
          setCustomers(response.data.data)
        }
      } else if (activeTab === 'orders') {
        const response = await axios.get(`${url}/admin/orders`, {
          headers: getHeaders()
        })
        if (response.data.status === 'success') {
          setOrders(response.data.data)
        }
      } else if (activeTab === 'feedbacks') {
        const response = await axios.get(`${url}/admin/feedbacks`, {
          headers: getHeaders()
        })
        if (response.data.status === 'success') {
          setFeedbacks(response.data.data)
        }
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approveChef = async (chefId) => {
    try {
      const response = await axios.put(
        `${url}/admin/chefs/${chefId}/approve`,
        {},
        { headers: getHeaders() }
      )
      if (response.data.status === 'success') {
        alert('Chef approved successfully!')
        fetchData()
      }
    } catch (err) {
      alert('Failed to approve chef')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/auth')
  }

  return (
    <div className='admin-dashboard'>
      <div className='admin-nav'>
        <div className='admin-header'>
          <h1>🔐 Admin Dashboard</h1>
          <button onClick={handleLogout} className='logout-btn'>
            Logout
          </button>
        </div>
      </div>

      <div className='admin-content'>
        <div className='admin-sidebar'>
          <button
            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'chefs' ? 'active' : ''}`}
            onClick={() => setActiveTab('chefs')}
          >
            👨‍🍳 Home Chefs
          </button>
          <button
            className={`sidebar-btn ${
              activeTab === 'customers' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button
            className={`sidebar-btn ${
              activeTab === 'feedbacks' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('feedbacks')}
          >
            ⭐ Feedbacks
          </button>
        </div>

        <div className='admin-main'>
          {error && <div className='error-message'>{error}</div>}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='tab-content'>
              <h2>Dashboard Overview</h2>
              <div className='stats-grid'>
                <div className='stat-card'>
                  <h3>👨‍🍳 Total Chefs</h3>
                  <p className='stat-number'>{chefs.length}</p>
                </div>
                <div className='stat-card'>
                  <h3>👥 Total Customers</h3>
                  <p className='stat-number'>{customers.length}</p>
                </div>
                <div className='stat-card'>
                  <h3>📦 Total Orders</h3>
                  <p className='stat-number'>{orders.length}</p>
                </div>
                <div className='stat-card'>
                  <h3>⭐ Total Feedbacks</h3>
                  <p className='stat-number'>{feedbacks.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chefs Tab */}
          {activeTab === 'chefs' && (
            <div className='tab-content'>
              <h2>Home Chefs Management</h2>
              {loading ? (
                <p className='loading'>Loading...</p>
              ) : chefs.length > 0 ? (
                <div className='table-responsive'>
                  <table className='admin-table'>
                    <thead>
                      <tr>
                        <th>Chef ID</th>
                        <th>Business Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chefs.map((chef) => (
                        <tr key={chef.chef_id}>
                          <td>{chef.chef_id}</td>
                          <td>{chef.business_name}</td>
                          <td>{chef.email}</td>
                          <td>{chef.phone_number}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                chef.is_active ? 'active' : 'inactive'
                              }`}
                            >
                              {chef.is_active ? '✓ Active' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            {!chef.is_active && (
                              <button
                                onClick={() => approveChef(chef.chef_id)}
                                className='approve-btn'
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='no-data'>No chefs found</p>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className='tab-content'>
              <h2>Customers Management</h2>
              {loading ? (
                <p className='loading'>Loading...</p>
              ) : customers.length > 0 ? (
                <div className='table-responsive'>
                  <table className='admin-table'>
                    <thead>
                      <tr>
                        <th>Customer ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.customer_id}>
                          <td>{customer.customer_id}</td>
                          <td>
                            {customer.first_name} {customer.last_name}
                          </td>
                          <td>{customer.email}</td>
                          <td>{customer.phone_number}</td>
                          <td>
                            {new Date(customer.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='no-data'>No customers found</p>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className='tab-content'>
              <h2>Orders Management</h2>
              {loading ? (
                <p className='loading'>Loading...</p>
              ) : orders.length > 0 ? (
                <div className='table-responsive'>
                  <table className='admin-table'>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer ID</th>
                        <th>Chef ID</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.order_id}>
                          <td>{order.order_id}</td>
                          <td>{order.customer_id}</td>
                          <td>{order.chef_id}</td>
                          <td>₹{order.total_amount}</td>
                          <td>
                            <span className='status-badge'>{order.status}</span>
                          </td>
                          <td>
                            {new Date(order.order_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='no-data'>No orders found</p>
              )}
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === 'feedbacks' && (
            <div className='tab-content'>
              <h2>Customer Feedbacks</h2>
              {loading ? (
                <p className='loading'>Loading...</p>
              ) : feedbacks.length > 0 ? (
                <div className='feedbacks-grid'>
                  {feedbacks.map((feedback, index) => (
                    <div key={index} className='feedback-card'>
                      <div className='feedback-header'>
                        <div>
                          <h4>Order #{feedback.order_id}</h4>
                          <p className='feedback-date'>
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className='rating'>
                          {'⭐'.repeat(feedback.rating)}
                        </span>
                      </div>
                      <p className='feedback-text'>{feedback.comments}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='no-data'>No feedbacks found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
