import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../../../context/StoreContext'
import '../styles/DashboardOrders.css'

const DashboardOrders = () => {
  const { token } = useContext(StoreContext)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      setLoading(true)
      setError(null)
      fetchOrders()
      fetchStats()
    }
  }, [statusFilter, token])

  const fetchOrders = async () => {
    try {
      const url = statusFilter === 'all' 
        ? 'http://localhost:4000/customer/dashboard/orders' 
        : `http://localhost:4000/customer/dashboard/orders?status=${statusFilter}`

      console.log('Fetching orders from:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.status === 'success' && data.data) {
        console.log('Orders loaded:', data.data)
        setOrders(Array.isArray(data.data) ? data.data : [])
        setError(null)
      } else {
        const errorMsg = data.error || 'Failed to load orders'
        console.error('Error:', errorMsg)
        setError(errorMsg)
        setOrders([])
      }
    } catch (err) {
      const errorMsg = 'Error fetching orders: ' + err.message
      console.error(errorMsg)
      setError(errorMsg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...')
      const response = await fetch('http://localhost:4000/customer/dashboard/orders/stats/summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Stats response status:', response.status)
      const data = await response.json()
      console.log('Stats data:', data)
      
      if (data.status === 'success' && data.data) {
        console.log('Stats loaded:', data.data)
        setStats(data.data)
      } else {
        console.error('Stats error:', data.error)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      setOrderDetailsLoading(true)
      const response = await fetch(`http://localhost:4000/customer/dashboard/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        setOrderDetails(data.data)
        setSelectedOrder(orderId)
        setIsModalOpen(true)
        // prevent background scroll while modal is open
        document.body.style.overflow = 'hidden'
      } else {
        setError(data.error || 'Failed to load order details')
      }
    } catch (err) {
      setError('Error fetching order details: ' + err.message)
    } finally {
      setOrderDetailsLoading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setOrderDetails(null)
    setSelectedOrder(null)
    document.body.style.overflow = ''
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      const response = await fetch(`http://localhost:4000/customer/dashboard/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success') {
        alert('Order cancelled successfully')
        fetchOrders()
        setSelectedOrder(null)
        setOrderDetails(null)
      } else {
        setError(data.error || 'Failed to cancel order')
      }
    } catch (err) {
      setError('Error cancelling order: ' + err.message)
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'Placed': '#FFA500',
      'Accepted': '#4169E1',
      'Preparing': '#FF6347',
      'Ready': '#32CD32',
      'Picked Up': '#1E90FF',
      'Delivered': '#228B22',
      'Cancelled': '#696969'
    }
    return statusColors[status] || '#666'
  }

  if (!token) {
    return <div className="dashboard-orders"><div className="error-message">Please log in to view your orders</div></div>
  }

  if (loading) {
    return <div className="dashboard-orders"><div className="loading">Loading orders...</div></div>
  }

  return (
    <div className="dashboard-orders">
      {/* Stats */}
      {stats && (
        <div className="order-stats">
          <div className="stat-box">
            <h4>Total Orders</h4>
            <p className="stat-value">{stats?.total_orders || 0}</p>
          </div>
          <div className="stat-box">
            <h4>Total Spent</h4>
            <p className="stat-value">₹{(stats?.total_spent ? parseFloat(stats.total_spent).toFixed(2) : (0).toFixed(2))}</p>
          </div>
          <div className="stat-box">
            <h4>Delivered</h4>
            <p className="stat-value">{stats?.delivered_orders || 0}</p>
          </div>
          <div className="stat-box">
            <h4>Avg Order Value</h4>
            <p className="stat-value">₹{(stats?.avg_order_value ? parseFloat(stats.avg_order_value).toFixed(2) : (0).toFixed(2))}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-section">
        <div className="filter-header">
          <label>Filter by Status:</label>
          <button 
            className="refresh-btn"
            onClick={() => {
              setLoading(true)
              fetchOrders()
              fetchStats()
            }}
            title="Refresh orders"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Placed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Placed')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Delivered')}
          >
            Delivered
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>📦 No Orders Found</h2>
          <p>You haven't placed any orders yet. Start ordering from the Home tab!</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <article key={order.order_id} className="order-card" onClick={(e) => { e.stopPropagation(); fetchOrderDetails(order.order_id); }}>
              <div className="card-top">
                <h4>Order #{order.order_id}</h4>
                <div className="muted">{new Date(order.order_time).toLocaleDateString()}</div>
              </div>

              <div className="card-middle">
                <div className="chef">{order.business_name || 'N/A'}</div>
                <div className="meta">{order.item_count || 0} items • ₹{(order.grand_total ? parseFloat(order.grand_total).toFixed(2) : '0.00')}</div>
                <div className="location">{order.city || 'N/A'}, {order.pincode || 'N/A'}</div>
              </div>

              <div className="card-bottom">
                <div className="status-pill" style={{ backgroundColor: getStatusColor(order.status) }}>{order.status}</div>
                <div className="actions">
                  <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); fetchOrderDetails(order.order_id); }}>Details</button>
                  {order.status === 'Delivered' && <a href={`/customer/dashboard#feedback`} className="feedback-btn">Feedback</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Details */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {orderDetailsLoading ? (
              <div className="loading">Loading details...</div>
            ) : orderDetails ? (
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Order #{orderDetails.order_id}</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="modal-section">
                    <h4>Status</h4>
                    <div className="status-large" style={{ backgroundColor: getStatusColor(orderDetails.status) }}>{orderDetails.status}</div>
                  </div>

                  <div className="modal-section">
                    <h4>Chef</h4>
                    <p><strong>{orderDetails.business_name || 'N/A'}</strong></p>
                    <p>Phone: {orderDetails.chef_phone || 'N/A'}</p>
                  </div>

                  <div className="modal-section">
                    <h4>Items</h4>
                    <div className="items-table">
                      {orderDetails.items && orderDetails.items.map(it => (
                        <div key={it.order_item_id} className="item-row">
                          <span>{it.name}</span>
                          <span>x{it.quantity}</span>
                          <span>₹{((it.unit_price_at_purchase || 0) * (it.quantity || 0)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Delivery Address</h4>
                    <p>{orderDetails.house_no || 'N/A'}, {orderDetails.street || ''}</p>
                    <p>{orderDetails.city || 'N/A'}, {orderDetails.pincode || 'N/A'}</p>
                  </div>

                  <div className="modal-section total-section">
                    <h4>Total</h4>
                    <p className="total-amount">₹{(orderDetails.grand_total ? parseFloat(orderDetails.grand_total).toFixed(2) : '0.00')}</p>
                  </div>

                  {orderDetails.status === 'Placed' && (
                    <button className="cancel-order-btn" onClick={() => handleCancelOrder(orderDetails.order_id)}>Cancel Order</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="loading">No details available</div>
            )}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default DashboardOrders
