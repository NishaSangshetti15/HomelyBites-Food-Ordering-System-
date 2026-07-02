const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Submit feedback for an order
router.post('/', (req, res) => {
  const user_id = req.user.customer_id
  const { order_id, rating, comment } = req.body

  // Validate input
  if (!order_id || !rating || rating < 1 || rating > 5) {
    return res.send(result.createResult('Invalid feedback data. Rating must be between 1-5'))
  }

  const sql = `
    INSERT INTO feedback(order_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `
  
  pool.query(sql, [order_id, user_id, rating, comment], (err, data) => {
    if (err) {
      return res.send(result.createResult(err))
    }

    // Update chef average rating after feedback is submitted
    const updateRatingSQL = `
      UPDATE HomeChefs 
      SET average_rating = (
        SELECT AVG(rating) 
        FROM feedback f
        JOIN Orders o ON f.order_id = o.order_id
        WHERE o.chef_id = HomeChefs.chef_id
      )
      WHERE chef_id = (SELECT chef_id FROM Orders WHERE order_id = ?)
    `

    pool.query(updateRatingSQL, [order_id], (err) => {
      if (err) {
        console.error('Error updating chef rating:', err)
        // Still return success even if rating update fails
      }
      res.send(result.createResult(null, { feedback_id: data.insertId, message: 'Feedback submitted successfully' }))
    })
  })
})

// Get all feedbacks for a specific chef
router.get('/chef/:chef_id', (req, res) => {
  const { chef_id } = req.params
  const { limit = 10, offset = 0 } = req.query

  const sql = `
    SELECT 
      f.feedback_id,
      f.order_id,
      f.rating,
      f.comment,
      f.created_at,
      c.first_name,
      c.last_name,
      o.order_time
    FROM feedback f
    JOIN Orders o ON f.order_id = o.order_id
    JOIN Customers c ON f.user_id = c.customer_id
    WHERE o.chef_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `

  pool.query(sql, [chef_id, parseInt(limit), parseInt(offset)], (err, data) => {
    if (err) {
      return res.send(result.createResult(err))
    }

    // Get feedback stats
    const statsSQL = `
      SELECT 
        COUNT(*) as total_feedbacks,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM feedback f
      JOIN Orders o ON f.order_id = o.order_id
      WHERE o.chef_id = ?
    `

    pool.query(statsSQL, [chef_id], (err, stats) => {
      if (err) {
        return res.send(result.createResult(null, { feedbacks: data, stats: null }))
      }

      res.send(result.createResult(null, {
        feedbacks: data,
        stats: stats[0] || {
          total_feedbacks: 0,
          average_rating: 0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        }
      }))
    })
  })
})

// Get all feedbacks submitted by a customer
router.get('/customer/submitted', (req, res) => {
  const customer_id = req.user.customer_id
  const { limit = 10, offset = 0 } = req.query

  const sql = `
    SELECT 
      f.feedback_id,
      f.order_id,
      f.rating,
      f.comment,
      f.created_at,
      hc.business_name,
      hc.chef_id,
      o.status,
      o.grand_total
    FROM feedback f
    JOIN Orders o ON f.order_id = o.order_id
    JOIN HomeChefs hc ON o.chef_id = hc.chef_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `

  pool.query(sql, [customer_id, parseInt(limit), parseInt(offset)], (err, data) => {
    res.send(result.createResult(err, data || []))
  })
})

// Check if customer has already given feedback for an order
router.get('/order/:order_id', (req, res) => {
  const customer_id = req.user.customer_id
  const { order_id } = req.params

  const sql = `
    SELECT f.* 
    FROM feedback f
    WHERE f.order_id = ? AND f.user_id = ?
  `

  pool.query(sql, [order_id, customer_id], (err, data) => {
    if (err) {
      return res.send(result.createResult(err))
    }

    res.send(result.createResult(null, {
      has_feedback: data && data.length > 0,
      feedback: data && data.length > 0 ? data[0] : null
    }))
  })
})

module.exports = router
