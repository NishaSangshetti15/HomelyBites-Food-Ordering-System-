const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

// Delivery Person Sign Up
router.post('/signup', (req, res) => {
  const { first_name, last_name, phone_number, password } = req.body

  // Validate input
  if (!first_name || !last_name || !phone_number || !password) {
    return res.status(400).send({
      status: 'error',
      message: 'All fields are required (first_name, last_name, phone_number, password)'
    })
  }

  // Validate phone number format
  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).send({
      status: 'error',
      message: 'Phone number must be 10 digits'
    })
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).send({
      status: 'error',
      message: 'Password must be at least 6 characters'
    })
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Password hashing error:', err)
      return res.status(500).send({
        status: 'error',
        message: 'Error processing signup'
      })
    }

    const sql = `INSERT INTO DeliveryPersonnel (first_name, last_name, phone_number, password_hash, status) VALUES (?, ?, ?, ?, ?)`
    pool.query(sql, [first_name, last_name, phone_number, hash, 'Offline'], (err, data) => {
      if (err) {
        console.error('Database error:', err)
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send({
            status: 'error',
            message: 'Phone number already registered'
          })
        }
        return res.status(500).send({
          status: 'error',
          message: 'Error creating account'
        })
      }

      const driver_id = data.insertId
      const payload = { driver_id, phone_number, role: 'Delivery Person' }
      const token = jwt.sign(payload, config.SECRET)

      return res.status(201).send({
        status: 'success',
        message: 'Signup successful',
        data: {
          token,
          driver_id,
          first_name,
          last_name,
          phone_number,
          role: 'Delivery Person'
        }
      })
    })
  })
})

// Delivery Person Sign In
router.post('/signin', (req, res) => {
  const { phone_number, password } = req.body

  if (!phone_number || !password) {
    return res.status(400).send({
      status: 'error',
      message: 'Phone number and password are required'
    })
  }

  // Validate phone number format
  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).send({
      status: 'error',
      message: 'Phone number must be 10 digits'
    })
  }

  const sql = `SELECT driver_id, first_name, last_name, phone_number, password_hash, status FROM DeliveryPersonnel WHERE phone_number = ?`
  pool.query(sql, [phone_number], (err, data) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).send({
        status: 'error',
        message: 'Error during login'
      })
    }

    if (!data || data.length === 0) {
      return res.status(401).send({
        status: 'error',
        message: 'Invalid phone number or password'
      })
    }

    const deliveryPerson = data[0]

    // If password_hash is null, user hasn't set a password yet
    if (!deliveryPerson.password_hash) {
      return res.status(401).send({
        status: 'error',
        message: 'Please set a password first. Contact admin.'
      })
    }

    bcrypt.compare(password, deliveryPerson.password_hash, (err, isValid) => {
      if (err) {
        console.error('Bcrypt error:', err)
        return res.status(500).send({
          status: 'error',
          message: 'Authentication error'
        })
      }

      if (!isValid) {
        return res.status(401).send({
          status: 'error',
          message: 'Invalid phone number or password'
        })
      }

      const payload = { driver_id: deliveryPerson.driver_id, phone_number, role: 'Delivery Person' }
      const token = jwt.sign(payload, config.SECRET)

      return res.status(200).send({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          driver_id: deliveryPerson.driver_id,
          first_name: deliveryPerson.first_name,
          last_name: deliveryPerson.last_name,
          phone_number: deliveryPerson.phone_number,
          status: deliveryPerson.status,
          role: 'Delivery Person'
        }
      })
    })
  })
})

// Create delivery personnel (Admin only)
router.post('/', (req, res) => {
  const { first_name, last_name, phone_number, password } = req.body

  // Validate input
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).send({
      status: 'error',
      message: 'All fields are required'
    })
  }

  const defaultPassword = password || '123456'

  bcrypt.hash(defaultPassword, 10, (err, hash) => {
    if (err) {
      return res.status(500).send({
        status: 'error',
        message: 'Error hashing password'
      })
    }

    const sql = `INSERT INTO DeliveryPersonnel (first_name, last_name, phone_number, password_hash) VALUES (?, ?, ?, ?)`
    pool.query(sql, [first_name, last_name, phone_number, hash], (err, data) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send({
            status: 'error',
            message: 'Phone number already registered'
          })
        }
        return res.status(500).send(result.createResult(err, null))
      }

      res.status(201).send({
        status: 'success',
        message: 'Delivery personnel created successfully',
        data: {
          driver_id: data.insertId,
          first_name,
          last_name,
          phone_number
        }
      })
    })
  })
})

// Get all delivery personnel
router.get('/', (req, res) => {
  const sql = `SELECT driver_id, first_name, last_name, phone_number, status, created_at FROM DeliveryPersonnel`
  pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Get single delivery person by id
router.get('/:id', (req, res) => {
  const sql = `SELECT driver_id, first_name, last_name, phone_number, status, created_at FROM DeliveryPersonnel WHERE driver_id = ?`
  pool.query(sql, [req.params.id], (err, data) => res.send(result.createResult(err, data && data[0] ? data[0] : null)))
})

// Get delivery person's assigned orders
router.get('/:id/orders', (req, res) => {
  const sql = `
    SELECT 
      o.order_id, 
      o.status, 
      o.grand_total,
      o.order_time,
      o.customer_id,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.phone_number as customer_phone,
      a.street,
      a.city,
      a.pincode,
      h.business_name as chef_name
    FROM Orders o
    JOIN Customers c ON o.customer_id = c.customer_id
    JOIN HomeChefs h ON o.chef_id = h.chef_id
    JOIN Addresses a ON o.delivery_address_id = a.address_id
    WHERE o.delivery_person_id = ?
    ORDER BY o.order_time DESC
  `
  pool.query(sql, [req.params.id], (err, data) => {
    res.send(result.createResult(err, data || []))
  })
})

// Get available orders for delivery person
router.get('/:id/available-orders', (req, res) => {
  const sql = `
    SELECT 
      o.order_id, 
      o.status, 
      o.grand_total,
      o.order_time,
      o.customer_id,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.phone_number as customer_phone,
      a.street,
      a.city,
      a.pincode,
      h.business_name as chef_name
    FROM Orders o
    JOIN Customers c ON o.customer_id = c.customer_id
    JOIN HomeChefs h ON o.chef_id = h.chef_id
    JOIN Addresses a ON o.delivery_address_id = a.address_id
    WHERE o.delivery_person_id IS NULL AND o.status IN ('Ready', 'Picked Up')
    ORDER BY o.order_time DESC
  `
  pool.query(sql, (err, data) => {
    res.send(result.createResult(err, data || []))
  })
})

// Accept/Assign order to delivery person
router.put('/:id/accept-order', (req, res) => {
  const { order_id } = req.body
  const driver_id = req.params.id

  if (!order_id) {
    return res.status(400).send({
      status: 'error',
      message: 'Order ID is required'
    })
  }

  const sql = `UPDATE Orders SET delivery_person_id = ?, status = ? WHERE order_id = ? AND delivery_person_id IS NULL`
  pool.query(sql, [driver_id, 'On Delivery', order_id], (err, data) => {
    if (err) {
      return res.status(500).send(result.createResult(err, null))
    }

    if (data.affectedRows === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'Order cannot be assigned or already assigned'
      })
    }

    res.send({
      status: 'success',
      message: 'Order assigned successfully'
    })
  })
})

// Update order delivery status
router.put('/:id/update-order-status', (req, res) => {
  const { order_id, status } = req.body
  const driver_id = req.params.id
  const allowed = ['On Delivery', 'Delivered']

  if (!order_id || !status || !allowed.includes(status)) {
    return res.status(400).send({
      status: 'error',
      message: 'Valid order ID and status are required'
    })
  }

  const sql = `UPDATE Orders SET status = ? WHERE order_id = ? AND delivery_person_id = ?`
  pool.query(sql, [status, order_id, driver_id], (err, data) => {
    if (err) {
      return res.status(500).send(result.createResult(err, null))
    }

    if (data.affectedRows === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'Order not found or not assigned to you'
      })
    }

    res.send({
      status: 'success',
      message: 'Order status updated successfully'
    })
  })
})

// Get delivery person's earnings/statistics
router.get('/:id/statistics', (req, res) => {
  const driver_id = req.params.id

  const sql = `
    SELECT 
      COUNT(*) as total_deliveries,
      SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as completed_deliveries,
      SUM(CASE WHEN status != 'Delivered' THEN 1 ELSE 0 END) as pending_deliveries,
      SUM(o.grand_total) as total_amount,
      AVG(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(COALESCE(f.rating, 5), '.', 1), '.', -1) AS DECIMAL)) as average_rating
    FROM Orders o
    LEFT JOIN Feedback f ON o.order_id = f.order_id
    WHERE o.delivery_person_id = ?
  `
  pool.query(sql, [driver_id], (err, data) => {
    if (err) {
      return res.status(500).send(result.createResult(err, null))
    }

    const stats = data[0] || {
      total_deliveries: 0,
      completed_deliveries: 0,
      pending_deliveries: 0,
      total_amount: 0,
      average_rating: 0
    }

    res.send({
      status: 'success',
      data: stats
    })
  })
})

// Update delivery person status
router.put('/:id/status', (req, res) => {
  const { status } = req.body
  const allowed = ['Available', 'On Delivery', 'Offline']
  if (!allowed.includes(status)) {
    return res.send(result.createResult('Invalid status'))
  }

  const sql = `UPDATE DeliveryPersonnel SET status = ? WHERE driver_id = ?`
  pool.query(sql, [status, req.params.id], (err, data) => res.send(result.createResult(err, data)))
})

// Delete delivery person
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM DeliveryPersonnel WHERE driver_id = ?`
  pool.query(sql, [req.params.id], (err, data) => res.send(result.createResult(err, data)))
})

module.exports = router
