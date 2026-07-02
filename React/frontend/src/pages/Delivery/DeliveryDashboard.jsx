import React, { useState, useEffect } from 'react'
import './DeliveryDashboard.css'
import { useNavigate } from 'react-router-dom'
import {
  getDeliveryPersonProfile,
  updateDeliveryPersonStatus,
  getAssignedOrders,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getDeliveryStatistics,
  getAllDeliveryPersonnel
} from '../../services/deliveryService'

const DeliveryDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [deliveryPerson, setDeliveryPerson] = useState(null)
  const [allDeliveryPersons, setAllDeliveryPersons] = useState([])
  const [assignedOrders, setAssignedOrders] = useState([])
  const [availableOrders, setAvailableOrders] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const driverId = localStorage.getItem('driverId')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    if (!token || userRole !== 'Delivery Person') {
      navigate('/auth')
      return
    }
    fetchAllData()
  }, [activeTab, refreshTrigger])

  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      if (driverId) {
        // Fetch profile
        const profileRes = await getDeliveryPersonProfile(driverId)
        if (profileRes.status === 'success') {
          setDeliveryPerson(profileRes.data)
        }

        // Fetch assigned orders
        const ordersRes = await getAssignedOrders(driverId)
        if (ordersRes.status === 'success') {
          setAssignedOrders(ordersRes.data || [])
        }

        // Fetch available orders
        const availableRes = await getAvailableOrders(driverId)
        if (availableRes.status === 'success') {
          setAvailableOrders(availableRes.data || [])
        }

        // Fetch statistics
        const statsRes = await getDeliveryStatistics(driverId)
        if (statsRes.status === 'success') {
          setStatistics(statsRes.data)
        }
      }

      // Fetch all delivery persons
      const allRes = await getAllDeliveryPersonnel()
      if (allRes.status === 'success') {
        setAllDeliveryPersons(allRes.data || [])
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateDeliveryPersonStatus(driverId, newStatus)
      if (res.status === 'success') {
        setDeliveryPerson({ ...deliveryPerson, status: newStatus })
        alert('Status updated successfully!')
      } else {
        alert(res.message || 'Failed to update status')
      }
    } catch (err) {
      alert('Error updating status')
    }
  }

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await acceptOrder(driverId, orderId)
      if (res.status === 'success') {
        alert('Order accepted! It will appear in your assigned orders.')
        setRefreshTrigger(prev => prev + 1)
      } else {
        alert(res.message || 'Failed to accept order')
      }
    } catch (err) {
      alert('Error accepting order')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(driverId, orderId, newStatus)
      if (res.status === 'success') {
        alert(`Order status updated to ${newStatus}!`)
        setRefreshTrigger(prev => prev + 1)
      } else {
        alert(res.message || 'Failed to update order status')
      }
    } catch (err) {
      alert('Error updating order status')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('driverId')
    localStorage.removeItem('userInfo')
    navigate('/auth')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='delivery-dashboard'>
      <div className='delivery-nav'>
        <div className='delivery-header'>
          <h1>🛵 Delivery Dashboard</h1>
          {deliveryPerson && <p>Welcome, {deliveryPerson.first_name}!</p>}
          <button onClick={handleLogout} className='logout-btn'>
            Logout
          </button>
        </div>
      </div>

      <div className='delivery-content'>
        <div className='delivery-sidebar'>
          <button
            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            📦 Assigned Orders ({assignedOrders.length})
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            ⭐ Available Orders ({availableOrders.length})
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📈 Statistics
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'all-staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-staff')}
          >
            👥 All Delivery Staff
          </button>
        </div>

        <div className='delivery-main'>
          {error && <div className='error-message'>{error}</div>}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='tab-content'>
              <h2>Delivery Overview</h2>
              {deliveryPerson && (
                <div className='overview-container'>
                  <div className='status-card'>
                    <h3>Current Status</h3>
                    <div className='status-display'>
                      <span
                        className={`status-badge ${deliveryPerson.status.toLowerCase().replace(' ', '-')}`}
                      >
                        {deliveryPerson.status}
                      </span>
                    </div>
                    <div className='status-buttons'>
                      <button
                        onClick={() => handleStatusChange('Available')}
                        className={`status-btn ${
                          deliveryPerson.status === 'Available' ? 'active' : ''
                        }`}
                      >
                        ✓ Available
                      </button>
                      <button
                        onClick={() => handleStatusChange('On Delivery')}
                        className={`status-btn ${
                          deliveryPerson.status === 'On Delivery' ? 'active' : ''
                        }`}
                      >
                        📍 On Delivery
                      </button>
                      <button
                        onClick={() => handleStatusChange('Offline')}
                        className={`status-btn ${
                          deliveryPerson.status === 'Offline' ? 'active' : ''
                        }`}
                      >
                        ⏸ Offline
                      </button>
                    </div>
                  </div>

                  <div className='info-grid'>
                    <div className='info-card'>
                      <h4>Driver ID</h4>
                      <p>{deliveryPerson.driver_id}</p>
                    </div>
                    <div className='info-card'>
                      <h4>Name</h4>
                      <p>
                        {deliveryPerson.first_name} {deliveryPerson.last_name}
                      </p>
                    </div>
                    <div className='info-card'>
                      <h4>Phone</h4>
                      <p>{deliveryPerson.phone_number}</p>
                    </div>
                    <div className='info-card'>
                      <h4>Joined Date</h4>
                      <p>
                        {new Date(
                          deliveryPerson.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {statistics && (
                    <div className='stats-summary'>
                      <div className='stat-box'>
                        <h4>Total Deliveries</h4>
                        <p className='stat-value'>
                          {statistics.total_deliveries || 0}
                        </p>
                      </div>
                      <div className='stat-box'>
                        <h4>Completed</h4>
                        <p className='stat-value success'>
                          {statistics.completed_deliveries || 0}
                        </p>
                      </div>
                      <div className='stat-box'>
                        <h4>Pending</h4>
                        <p className='stat-value warning'>
                          {statistics.pending_deliveries || 0}
                        </p>
                      </div>
                      <div className='stat-box'>
                        <h4>Avg Rating</h4>
                        <p className='stat-value'>
                          {statistics.average_rating
                            ? statistics.average_rating.toFixed(2)
                            : '0.00'}
                          ⭐
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assigned Orders Tab */}
          {activeTab === 'assigned' && (
            <div className='tab-content'>
              <h2>My Assigned Orders</h2>
              {loading ? (
                <p className='loading'>Loading orders...</p>
              ) : assignedOrders.length > 0 ? (
                <div className='orders-container'>
                  {assignedOrders.map((order) => (
                    <div key={order.order_id} className='order-card'>
                      <div className='order-header'>
                        <div>
                          <h4>Order #{order.order_id}</h4>
                          <p className='order-time'>
                            {formatDate(order.order_time)}
                          </p>
                        </div>
                        <span
                          className={`status-badge ${order.status
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className='order-details'>
                        <div className='detail-group'>
                          <h5>Customer Info</h5>
                          <p>
                            <strong>Name:</strong> {order.customer_first_name}{' '}
                            {order.customer_last_name}
                          </p>
                          <p>
                            <strong>Phone:</strong> {order.customer_phone}
                          </p>
                        </div>

                        <div className='detail-group'>
                          <h5>Delivery Address</h5>
                          <p>
                            {order.street}, {order.city} - {order.pincode}
                          </p>
                        </div>

                        <div className='detail-group'>
                          <h5>Chef</h5>
                          <p>{order.chef_name}</p>
                        </div>

                        <div className='detail-group'>
                          <h5>Total Amount</h5>
                          <p className='amount'>₹{order.grand_total}</p>
                        </div>
                      </div>

                      <div className='order-actions'>
                        {order.status === 'On Delivery' && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.order_id, 'Delivered')
                            }
                            className='btn-primary'
                          >
                            ✓ Mark as Delivered
                          </button>
                        )}
                        {order.status === 'Picked Up' && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.order_id, 'On Delivery')
                            }
                            className='btn-primary'
                          >
                            📍 Start Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='no-data'>No assigned orders at the moment</p>
              )}
            </div>
          )}

          {/* Available Orders Tab */}
          {activeTab === 'available' && (
            <div className='tab-content'>
              <h2>Available Orders to Deliver</h2>
              {loading ? (
                <p className='loading'>Loading available orders...</p>
              ) : availableOrders.length > 0 ? (
                <div className='orders-container'>
                  {availableOrders.map((order) => (
                    <div key={order.order_id} className='order-card available'>
                      <div className='order-header'>
                        <div>
                          <h4>Order #{order.order_id}</h4>
                          <p className='order-time'>
                            {formatDate(order.order_time)}
                          </p>
                        </div>
                        <span className='status-badge ready'>
                          {order.status}
                        </span>
                      </div>

                      <div className='order-details'>
                        <div className='detail-group'>
                          <h5>Customer Info</h5>
                          <p>
                            <strong>Name:</strong> {order.customer_first_name}{' '}
                            {order.customer_last_name}
                          </p>
                          <p>
                            <strong>Phone:</strong> {order.customer_phone}
                          </p>
                        </div>

                        <div className='detail-group'>
                          <h5>Pickup Location (Chef)</h5>
                          <p>{order.chef_name}</p>
                        </div>

                        <div className='detail-group'>
                          <h5>Delivery Address</h5>
                          <p>
                            {order.street}, {order.city} - {order.pincode}
                          </p>
                        </div>

                        <div className='detail-group'>
                          <h5>Order Amount</h5>
                          <p className='amount'>₹{order.grand_total}</p>
                        </div>
                      </div>

                      <div className='order-actions'>
                        <button
                          onClick={() => handleAcceptOrder(order.order_id)}
                          className='btn-accept'
                        >
                          ⭐ Accept Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='no-data'>
                  No available orders at the moment. Check back later!
                </p>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className='tab-content'>
              <h2>My Profile</h2>
              {loading ? (
                <p className='loading'>Loading...</p>
              ) : deliveryPerson ? (
                <div className='profile-container'>
                  <div className='profile-card'>
                    <div className='profile-header'>
                      <h3>
                        {deliveryPerson.first_name} {deliveryPerson.last_name}
                      </h3>
                      <span className='driver-id'>
                        ID: {deliveryPerson.driver_id}
                      </span>
                    </div>

                    <div className='profile-details'>
                      <div className='detail-item'>
                        <label>First Name</label>
                        <p>{deliveryPerson.first_name}</p>
                      </div>
                      <div className='detail-item'>
                        <label>Last Name</label>
                        <p>{deliveryPerson.last_name}</p>
                      </div>
                      <div className='detail-item'>
                        <label>Phone Number</label>
                        <p>{deliveryPerson.phone_number}</p>
                      </div>
                      <div className='detail-item'>
                        <label>Current Status</label>
                        <span
                          className={`status-badge ${deliveryPerson.status
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {deliveryPerson.status}
                        </span>
                      </div>
                      <div className='detail-item'>
                        <label>Member Since</label>
                        <p>
                          {new Date(
                            deliveryPerson.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className='info-text'>
                      📱 Note: Contact admin to update your profile information.
                    </p>
                  </div>
                </div>
              ) : (
                <p className='no-data'>Profile not found</p>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className='tab-content'>
              <h2>My Statistics</h2>
              {loading ? (
                <p className='loading'>Loading statistics...</p>
              ) : statistics ? (
                <div className='stats-container'>
                  <div className='stats-grid'>
                    <div className='stat-card'>
                      <h4>Total Deliveries</h4>
                      <p className='stat-number'>
                        {statistics.total_deliveries || 0}
                      </p>
                    </div>
                    <div className='stat-card'>
                      <h4>Completed Deliveries</h4>
                      <p className='stat-number success'>
                        {statistics.completed_deliveries || 0}
                      </p>
                    </div>
                    <div className='stat-card'>
                      <h4>Pending Deliveries</h4>
                      <p className='stat-number warning'>
                        {statistics.pending_deliveries || 0}
                      </p>
                    </div>
                    <div className='stat-card'>
                      <h4>Total Amount Handled</h4>
                      <p className='stat-number'>
                        ₹{(statistics.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className='stat-card'>
                      <h4>Average Rating</h4>
                      <p className='stat-number'>
                        {statistics.average_rating
                          ? statistics.average_rating.toFixed(2)
                          : '0.00'}
                        ⭐
                      </p>
                    </div>
                    <div className='stat-card'>
                      <h4>Success Rate</h4>
                      <p className='stat-number'>
                        {statistics.total_deliveries > 0
                          ? (
                              (
                                (statistics.completed_deliveries /
                                  statistics.total_deliveries) *
                                100
                              ).toFixed(1)
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='no-data'>No statistics available yet</p>
              )}
            </div>
          )}

          {/* All Staff Tab */}
          {activeTab === 'all-staff' && (
            <div className='tab-content'>
              <h2>All Delivery Staff</h2>
              <div className='filter-container'>
                <label>Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='filter-select'
                >
                  <option value='All'>All Status</option>
                  <option value='Available'>Available</option>
                  <option value='On Delivery'>On Delivery</option>
                  <option value='Offline'>Offline</option>
                </select>
              </div>

              {loading ? (
                <p className='loading'>Loading...</p>
              ) : allDeliveryPersons.length > 0 ? (
                <div className='staff-grid'>
                  {allDeliveryPersons
                    .filter(
                      (staff) =>
                        statusFilter === 'All' || staff.status === statusFilter
                    )
                    .map((staff) => (
                      <div key={staff.driver_id} className='staff-card'>
                        <div className='staff-header'>
                          <h4>
                            {staff.first_name} {staff.last_name}
                          </h4>
                          <span
                            className={`status-badge ${staff.status
                              .toLowerCase()
                              .replace(' ', '-')}`}
                          >
                            {staff.status}
                          </span>
                        </div>
                        <div className='staff-info'>
                          <p>
                            <strong>ID:</strong> {staff.driver_id}
                          </p>
                          <p>
                            <strong>Phone:</strong> {staff.phone_number}
                          </p>
                          <p>
                            <strong>Joined:</strong>{' '}
                            {new Date(staff.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className='no-data'>No delivery staff found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryDashboard

