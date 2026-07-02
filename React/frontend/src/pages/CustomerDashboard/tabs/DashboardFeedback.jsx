import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../../../context/StoreContext'
import { customerService } from '../../../services/customerService'
import '../styles/DashboardFeedback.css'

const DashboardFeedback = () => {
  const { token } = useContext(StoreContext)
  const [feedbacks, setFeedbacks] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    if (token) {
      fetchFeedbacks()
      fetchOrdersForFeedback()
    }
  }, [token])

  const fetchFeedbacks = async () => {
    try {
      console.log('Fetching customer feedbacks...')
      const data = await customerService.getFeedbacks()
      console.log('Feedbacks data:', data)

      if (data.status === 'success' && data.data) {
        setFeedbacks(Array.isArray(data.data) ? data.data : [])
        setError(null)
      } else {
        console.error('Error fetching feedbacks:', data.error)
        setFeedbacks([])
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrdersForFeedback = async () => {
    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        // Filter for delivered orders
        const deliveredOrders = Array.isArray(data.data) 
          ? data.data.filter(order => order.status === 'Delivered')
          : []
        setOrders(deliveredOrders)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const handleOrderSelect = async (orderId) => {
    setSelectedOrderId(orderId)
    
    // Find order info
    const order = orders.find(o => o.order_id === orderId)
    setSelectedOrderInfo(order)

    // Check if feedback already exists for this order
    try {
      const feedbackCheck = await customerService.checkOrderFeedback(orderId)
      if (feedbackCheck.has_feedback) {
        setError('You have already submitted feedback for this order')
        setSelectedOrderId(null)
        setSelectedOrderInfo(null)
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('Error checking feedback:', err)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()

    if (!selectedOrderId) {
      setError('Please select an order')
      return
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    if (!formData.comment || formData.comment.trim().length === 0) {
      setError('Please share your thoughts in the comment field')
      return
    }

    try {
      setSubmitting(true)
      console.log('Submitting feedback for order:', selectedOrderId)
      
      const response = await customerService.submitFeedback(
        selectedOrderId,
        formData.rating,
        formData.comment
      )
      
      console.log('Feedback response:', response)

      if (response.status === 'success') {
        setSuccess('✓ Feedback submitted successfully! Thank you for your review.')
        setFormData({ rating: 5, comment: '' })
        setSelectedOrderId(null)
        setSelectedOrderInfo(null)
        setShowFeedbackForm(false)
        
        setTimeout(() => {
          setSuccess(null)
          fetchFeedbacks()
          fetchOrdersForFeedback()
        }, 2000)
      } else {
        setError(response.error || 'Failed to submit feedback')
      }
    } catch (err) {
      const errorMsg = 'Error submitting feedback: ' + err.message
      console.error(errorMsg)
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating: rating
    })
  }

  const handleCommentChange = (e) => {
    setFormData({
      ...formData,
      comment: e.target.value
    })
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#228B22'
    if (rating >= 3) return '#FFA500'
    return '#DC143C'
  }

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    }
    return labels[rating] || 'Unknown'
  }

  if (!token) {
    return <div className="dashboard-feedback"><div className="error-message">Please log in to view feedbacks</div></div>
  }

  if (loading) {
    return <div className="dashboard-feedback"><div className="loading">Loading feedbacks...</div></div>
  }

  return (
    <div className="dashboard-feedback">
      {/* Success Message */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Submit Feedback Section */}
      {orders.length > 0 && (
        <div className="feedback-submit-section">
          <h2>📝 Share Your Feedback</h2>
          {!showFeedbackForm ? (
            <button 
              className="submit-feedback-btn"
              onClick={() => setShowFeedbackForm(true)}
            >
              + Leave Feedback for a Chef
            </button>
          ) : (
            <form className="feedback-form" onSubmit={handleSubmitFeedback}>
              <div className="form-group">
                <label>Select Delivered Order *</label>
                <div className="orders-grid">
                  {orders.map(order => (
                    <div 
                      key={order.order_id}
                      className={`order-card ${selectedOrderId === order.order_id ? 'selected' : ''}`}
                      onClick={() => handleOrderSelect(order.order_id)}
                    >
                      <div className="order-content">
                        <h4>#{order.order_id}</h4>
                        <p className="chef-name">📍 {order?.business_name || 'Chef'}</p>
                        <p className="order-amount">₹{order?.grand_total?.toFixed(2) || '0.00'}</p>
                      </div>
                      {selectedOrderId === order.order_id && <div className="check-mark">✓</div>}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrderInfo && (
                <>
                  <div className="selected-order-info">
                    <h4>Feedback for: <strong>{selectedOrderInfo?.business_name || 'Chef'}</strong></h4>
                    <p>Order #{selectedOrderInfo?.order_id} - ₹{selectedOrderInfo?.grand_total?.toFixed(2)}</p>
                  </div>

                  <div className="form-group">
                    <label>Your Rating (1-5 stars) *</label>
                    <div className="rating-input-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                          onClick={() => handleRatingChange(star)}
                          title={`${star} - ${getRatingLabel(star)}`}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="rating-label">{formData.rating}/5 - {getRatingLabel(formData.rating)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Feedback *</label>
                    <textarea 
                      value={formData.comment}
                      onChange={handleCommentChange}
                      placeholder="Tell us about your experience with this chef... What did you like? Any suggestions?"
                      rows="5"
                      maxLength="500"
                      required
                    />
                    <small>{formData.comment.length}/500 characters</small>
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowFeedbackForm(false)
                        setFormData({ rating: 5, comment: '' })
                        setSelectedOrderId(null)
                        setSelectedOrderInfo(null)
                        setError(null)
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      )}

      {orders.length === 0 && (
        <div className="empty-orders">
          <p>No delivered orders yet. Complete an order to leave feedback!</p>
        </div>
      )}

      {/* Feedbacks List */}
      {feedbacks.length === 0 ? (
        <div className="empty-feedbacks">
          <h2>📭 No Feedbacks Yet</h2>
          <p>You haven't submitted any feedback yet.</p>
        </div>
      ) : (
        <div className="feedbacks-section">
          <h2>⭐ Your Feedback ({feedbacks.length})</h2>
          <div className="feedbacks-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.feedback_id} className="feedback-card">
                <div className="feedback-header">
                  <div className="feedback-info">
                    <h3>Order #{feedback?.order_id || 'N/A'}</h3>
                    <p className="feedback-chef">👨‍🍳 {feedback?.business_name || 'Chef'}</p>
                    <p className="feedback-date">{feedback?.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="feedback-rating">
                    <div 
                      className="rating-stars"
                      style={{ color: getRatingColor(feedback?.rating) }}
                    >
                      {'⭐'.repeat(feedback?.rating || 0)}
                    </div>
                    <p className="rating-label">{feedback?.rating || 0}/5 - {getRatingLabel(feedback?.rating)}</p>
                  </div>
                </div>

                {feedback?.comment && (
                  <div className="feedback-comment">
                    <p>"{feedback.comment}"</p>
                  </div>
                )}

                <div className="feedback-footer">
                  <p className="status-badge delivered">✓ Order Delivered</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardFeedback

  useEffect(() => {
    if (token) {
      fetchFeedbacks()
      fetchOrdersForFeedback()
    }
  }, [token])

  const fetchFeedbacks = async () => {
    try {
      console.log('Fetching feedbacks...')
      const response = await fetch('http://localhost:4000/customer/feedbacks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Feedbacks response status:', response.status)
      const data = await response.json()
      console.log('Feedbacks data:', data)

      if (data.status === 'success' && data.data) {
        console.log('Feedbacks loaded:', data.data)
        setFeedbacks(Array.isArray(data.data) ? data.data : [])
        setError(null)
      } else {
        const errorMsg = data.error || 'Failed to load feedbacks'
        console.error('Error:', errorMsg)
        setFeedbacks([])
      }
    } catch (err) {
      const errorMsg = 'Error fetching feedbacks: ' + err.message
      console.error(errorMsg)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrdersForFeedback = async () => {
    try {
      const response = await fetch('http://localhost:4000/customer/dashboard/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        // Filter for delivered orders that don't have feedback yet
        const deliveredOrders = Array.isArray(data.data) 
          ? data.data.filter(order => order.status === 'Delivered')
          : []
        setOrders(deliveredOrders)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()

    if (!selectedOrderId) {
      setError('Please select an order')
      return
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    try {
      console.log('Submitting feedback for order:', selectedOrderId)
      const response = await fetch('http://localhost:4000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: selectedOrderId,
          rating: parseInt(formData.rating),
          comment: formData.comment
        })
      })

      const data = await response.json()
      console.log('Feedback response:', data)

      if (data.status === 'success') {
        alert('✓ Feedback submitted successfully!')
        setFormData({ rating: 5, comment: '' })
        setSelectedOrderId(null)
        setShowFeedbackForm(false)
        fetchFeedbacks()
        fetchOrdersForFeedback()
      } else {
        setError(data.error || 'Failed to submit feedback')
      }
    } catch (err) {
      const errorMsg = 'Error submitting feedback: ' + err.message
      console.error(errorMsg)
      setError(errorMsg)
    }
  }

  const handleRatingChange = (e) => {
    setFormData({
      ...formData,
      rating: parseInt(e.target.value)
    })
  }

  const handleCommentChange = (e) => {
    setFormData({
      ...formData,
      comment: e.target.value
    })
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#228B22'
    if (rating >= 3) return '#FFA500'
    return '#DC143C'
  }

  if (!token) {
    return <div className="dashboard-feedback"><div className="error-message">Please log in to view feedbacks</div></div>
  }

  if (loading) {
    return <div className="dashboard-feedback"><div className="loading">Loading feedbacks...</div></div>
  }

  return (
    <div className="dashboard-feedback">
      {/* Submit Feedback Section */}
      {orders.length > 0 && (
        <div className="feedback-submit-section">
          <h2>📝 Share Your Feedback</h2>
          {!showFeedbackForm ? (
            <button 
              className="submit-feedback-btn"
              onClick={() => setShowFeedbackForm(true)}
            >
              + Add New Feedback
            </button>
          ) : (
            <form className="feedback-form" onSubmit={handleSubmitFeedback}>
              <div className="form-group">
                <label>Select Order *</label>
                <select 
                  value={selectedOrderId || ''} 
                  onChange={(e) => setSelectedOrderId(parseInt(e.target.value))}
                  required
                >
                  <option value="">-- Choose an order --</option>
                  {orders.map(order => (
                    <option key={order.order_id} value={order.order_id}>
                      Order #{order.order_id} - {order.business_name} (₹{order.grand_total.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rating (1-5 stars) *</label>
                <div className="rating-input">
                  <select 
                    value={formData.rating}
                    onChange={handleRatingChange}
                    className="rating-select"
                  >
                    <option value="1">⭐ 1 - Poor</option>
                    <option value="2">⭐⭐ 2 - Fair</option>
                    <option value="3">⭐⭐⭐ 3 - Good</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  </select>
                  <div className="rating-display">
                    {'⭐'.repeat(formData.rating)}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Comments</label>
                <textarea 
                  value={formData.comment}
                  onChange={handleCommentChange}
                  placeholder="Share your thoughts about this order... (optional)"
                  rows="4"
                  maxLength="500"
                />
                <small>{formData.comment.length}/500 characters</small>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Submit Feedback
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowFeedbackForm(false)
                    setFormData({ rating: 5, comment: '' })
                    setSelectedOrderId(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Feedbacks List */}
      {feedbacks.length === 0 ? (
        <div className="empty-feedbacks">
          <h2>📭 No Feedbacks Yet</h2>
          <p>You haven't submitted any feedback yet. Complete an order to leave feedback!</p>
        </div>
      ) : (
        <div className="feedbacks-section">
          <h2>📋 Your Feedbacks ({feedbacks.length})</h2>
          <div className="feedbacks-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.feedback_id} className="feedback-card">
                <div className="feedback-header">
                  <div className="feedback-order">
                    <h3>Order #{feedback.order_id}</h3>
                    <p className="feedback-date">{new Date(feedback.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="feedback-rating">
                    <div 
                      className="rating-stars"
                      style={{ color: getRatingColor(feedback.rating) }}
                    >
                      {'⭐'.repeat(feedback.rating)}
                    </div>
                    <p className="rating-value">{feedback.rating}/5</p>
                  </div>
                </div>

                {feedback.comment && (
                  <div className="feedback-comment">
                    <p>{feedback.comment}</p>
                  </div>
                )}

                {feedback.business_name && (
                  <div className="feedback-chef">
                    <p>Chef: <strong>{feedback.business_name}</strong></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default DashboardFeedback
