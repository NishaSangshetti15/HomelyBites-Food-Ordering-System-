import React, { useState, useEffect } from 'react'
import './Orders.css'
import { homeChefService } from '../../services/homeChefService'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await homeChefService.getOrders()
      if (response.data) {
        setOrders(Array.isArray(response.data) ? response.data : [])
        setError('')
      } else {
        setError(response.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Error fetching orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await homeChefService.updateOrderStatus(orderId, newStatus)
      if (response.data) {
        await fetchOrders()
      } else {
        setError(response.error || 'Failed to update status')
      }
    } catch (err) {
      setError('Error updating order status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'preparing': '#9c27b0',
      'ready': '#4caf50',
      'completed': '#8bc34a',
      'cancelled': '#f44336'
    }
    return colors[status] || '#666'
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.order_status === filter
  )

  return (
    <div className='orders-dashboard'>
      <h2>Orders</h2>

      {error && <div className='error-message'>{error}</div>}

      <div className='filter-section'>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className='filter-select'
        >
          <option value='all'>All Orders</option>
          <option value='pending'>Pending</option>
          <option value='confirmed'>Confirmed</option>
          <option value='preparing'>Preparing</option>
          <option value='ready'>Ready</option>
          <option value='completed'>Completed</option>
          <option value='cancelled'>Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className='loading'>Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className='empty-state'>
          <p>No orders found</p>
        </div>
      ) : (
        <div className='orders-grid'>
          {filteredOrders.map(order => (
            <div key={order.order_id} className='order-card'>
              <div className='order-header'>
                <h3>Order #{order.order_id}</h3>
                <span 
                  className='status-badge'
                  style={{ backgroundColor: getStatusColor(order.order_status) }}
                >
                  {order.order_status}
                </span>
              </div>
              <div className='order-details'>
                <p><strong>Customer:</strong> {order.first_name} {order.last_name}</p>
                <p><strong>Phone:</strong> {order.phone_number}</p>
                <p><strong>Items:</strong> {order.item_count || 0}</p>
                <p><strong>Amount:</strong> ₹{order.total_amount}</p>
                <p><strong>Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className='order-actions'>
                <select 
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                  className='status-select'
                >
                  <option value='pending'>Pending</option>
                  <option value='confirmed'>Confirmed</option>
                  <option value='preparing'>Preparing</option>
                  <option value='ready'>Ready</option>
                  <option value='completed'>Completed</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
