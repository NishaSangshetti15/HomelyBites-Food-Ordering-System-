const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool =require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

//customer Registration
router.post('/signup', (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body

    // Validate input
    if (!email || !password || !first_name) {
        return res.status(400).send({
            status: 'error',
            message: 'Email, password, and first name are required'
        })
    }

    const sql = `
        INSERT INTO Customers 
        (first_name, last_name, email, password_hash, phone_number) 
        VALUES (?, ?, ?, ?, ?)
    `

    bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error hashing password: ' + err.message
            })
        }

        pool.query(
            sql,
            [first_name, last_name, email, hashedPassword, phone_number],
            (err, data) => {
                if (err) {
                    // Check for duplicate email
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).send({
                            status: 'error',
                            message: 'Email already exists'
                        })
                    }
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error creating account: ' + err.message
                    })
                }

                // After successful signup, generate token for auto-login
                const customer_id = data.insertId
                const payload = { customer_id: customer_id }
                const token = jwt.sign(payload, config.SECRET)

                const customer = {
                    token: token,
                    customer_id: customer_id,
                    name: `${first_name} ${last_name}`,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone_number: phone_number
                }

                res.status(201).send({
                    status: 'success',
                    message: 'Account created successfully',
                    data: customer
                })
            }
        )
    })
})


//customer Login
router.post('/signin', (req, res) => {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
        return res.status(400).send({
            status: 'error',
            message: 'Email and password are required'
        })
    }

    const sql = `SELECT * FROM Customers WHERE email = ?`

    pool.query(sql, [email], (err, data) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Database error: ' + err.message
            })
        }

        if (data.length === 0) {
            return res.status(401).send({
                status: 'error',
                message: 'Invalid email or password'
            })
        }

        // Customer record exists at index 0
        bcrypt.compare(password, data[0].password_hash, (err, passwordStatus) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error during authentication'
                })
            }

            if (!passwordStatus) {
                return res.status(401).send({
                    status: 'error',
                    message: 'Invalid email or password'
                })
            }

            // Password is correct - generate token
            const payload = {
                customer_id: data[0].customer_id
            }

            const token = jwt.sign(payload, config.SECRET)

            const customer = {
                token: token,
                customer_id: data[0].customer_id,
                name: `${data[0].first_name} ${data[0].last_name}`,
                first_name: data[0].first_name,
                last_name: data[0].last_name,
                email: data[0].email,
                phone_number: data[0].phone_number
            }

            res.status(200).send({
                status: 'success',
                message: 'Login successful',
                data: customer
            })
        })
    })
})


//add address for customer
router.post('/address', (req,res)=>{
    const {street,city,pincode,house_no,label,latitude,longitude} = req.body
    const customer_id = req.user.customer_id

    const sql = `
        INSERT INTO Addresses
        (entity_type, entity_id, street, city, pincode, house_no, label, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    pool.query(
        sql,
        ['Customer', customer_id, street, city, pincode, house_no, label, latitude, longitude],
        (err, data) => {
            res.send(result.createResult(err, data))
        }
    )
})

//get customer profile
router.get('/profile', (req, res) => {
  const customer_id = req.user.customer_id

  const sql = `
    SELECT customer_id, first_name, last_name, email, phone_number
    FROM Customers
    WHERE customer_id = ?
  `

  pool.query(sql, [customer_id], (err, data) => {
    if (err)
      return res.send(result.createResult(err))

    if (data.length === 0)
      return res.send(result.createResult('Customer not found'))

    res.send(result.createResult(null, data[0]))
  })
})


//update customer profile
router.put('/profile', (req, res) => {
  const customer_id = req.user.customer_id
  const { first_name, last_name, phone_number } = req.body

  const sql = `UPDATE Customers SET first_name = ?, last_name = ?, phone_number = ? WHERE customer_id = ?`
  pool.query(sql, [first_name, last_name, phone_number, customer_id], (err, data) =>
    res.send(result.createResult(err, data))
  )
})


// ==================== DASHBOARD - HOME TAB ====================
// Get featured chefs and popular menu items
router.get('/dashboard/home', (req, res) => {
  const customer_id = req.user.customer_id

  // Get customer's pincode from their saved address
  const getPincodeSQL = `
    SELECT pincode FROM Addresses 
    WHERE entity_type = 'Customer' AND entity_id = ? 
    LIMIT 1
  `

  pool.query(getPincodeSQL, [customer_id], (err, addressData) => {
    if (err) return res.send(result.createResult(err))

    const pincode = addressData.length > 0 ? addressData[0].pincode : null

    // Get featured chefs with service in customer's area
    const chefSQL = `
      SELECT DISTINCT 
        hc.chef_id, 
        hc.business_name, 
        hc.average_rating,
        COUNT(oi.order_item_id) as total_orders
      FROM HomeChefs hc
      LEFT JOIN Orders o ON hc.chef_id = o.chef_id
      LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
      LEFT JOIN ServiceAreas sa ON hc.chef_id = sa.chef_id
      WHERE hc.is_active = TRUE
      ${pincode ? `AND sa.pincode = ?` : ''}
      GROUP BY hc.chef_id
      ORDER BY hc.average_rating DESC
      LIMIT 10
    `

    const params = pincode ? [pincode] : []

    pool.query(chefSQL, params, (err, chefs) => {
      if (err) return res.send(result.createResult(err))

      // Get popular menu items
      const menuSQL = `
        SELECT 
          mi.item_id,
          mi.name,
          mi.base_price,
          mi.description,
          mi.image_url,
          hc.business_name,
          hc.chef_id,
          COUNT(oi.order_item_id) as order_count
        FROM MenuItems mi
        JOIN HomeChefs hc ON mi.chef_id = hc.chef_id
        LEFT JOIN OrderItems oi ON mi.item_id = oi.item_id
        WHERE hc.is_active = TRUE
        GROUP BY mi.item_id
        ORDER BY order_count DESC, mi.base_price ASC
        LIMIT 20
      `

      pool.query(menuSQL, (err, menuItems) => {
        if (err) return res.send(result.createResult(err))

        const dashboardData = {
          featuredChefs: chefs,
          popularItems: menuItems
        }

        res.send(result.createResult(null, dashboardData))
      })
    })
  })
})


// ==================== DASHBOARD - CART TAB ====================
// Get cart items (from session/localStorage, but we can store temp cart in DB)
// This endpoint manages cart operations
router.get('/dashboard/cart', (req, res) => {
  const customer_id = req.user.customer_id

  // Get customer's default addresses
  const addressSQL = `
    SELECT address_id, street, city, pincode, house_no, label
    FROM Addresses
    WHERE entity_type = 'Customer' AND entity_id = ?
  `

  pool.query(addressSQL, [customer_id], (err, addresses) => {
    if (err) return res.send(result.createResult(err))

    res.send(result.createResult(null, { addresses }))
  })
})

// Place order from cart
router.post('/dashboard/place-order', (req, res) => {
  const customer_id = req.user.customer_id
  const { chef_id, delivery_address_id, cartItems, grand_total } = req.body

  if (!chef_id || !delivery_address_id || !cartItems || cartItems.length === 0) {
    return res.send(result.createResult('Missing required fields'))
  }

  const orderSQL = `
    INSERT INTO Orders (customer_id, chef_id, delivery_address_id, grand_total, status)
    VALUES (?, ?, ?, ?, 'Placed')
  `

  pool.query(orderSQL, [customer_id, chef_id, delivery_address_id, grand_total], (err, orderResult) => {
    if (err) return res.send(result.createResult(err))

    const orderId = orderResult.insertId
    let insertedItems = 0

    // Insert order items
    cartItems.forEach((item) => {
      const itemSQL = `
        INSERT INTO OrderItems (order_id, item_id, quantity, unit_price_at_purchase)
        VALUES (?, ?, ?, ?)
      `

      pool.query(itemSQL, [orderId, item.item_id, item.quantity, item.base_price], (err) => {
        if (err) return res.send(result.createResult(err))
        insertedItems++

        if (insertedItems === cartItems.length) {
          res.send(result.createResult(null, { order_id: orderId, status: 'Placed' }))
        }
      })
    })
  })
})


// ==================== DASHBOARD - ORDERS TAB ====================
// Get all customer orders with details
router.get('/dashboard/orders', (req, res) => {
  const customer_id = req.user.customer_id
  const { status, limit = 10, offset = 0 } = req.query

  let orderSQL = `
    SELECT 
      o.order_id,
      o.customer_id,
      o.chef_id,
      o.status,
      o.grand_total,
      o.order_time,
      hc.business_name,
      hc.average_rating,
      a.street,
      a.city,
      a.pincode,
      COUNT(oi.order_item_id) as item_count
    FROM Orders o
    JOIN HomeChefs hc ON o.chef_id = hc.chef_id
    JOIN Addresses a ON o.delivery_address_id = a.address_id
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    WHERE o.customer_id = ?
  `

  const params = [customer_id]

  if (status) {
    orderSQL += ` AND o.status = ?`
    params.push(status)
  }

  orderSQL += ` GROUP BY o.order_id ORDER BY o.order_time DESC LIMIT ? OFFSET ?`
  params.push(parseInt(limit), parseInt(offset))

  pool.query(orderSQL, params, (err, orders) => {
    if (err) return res.send(result.createResult(err))

    res.send(result.createResult(null, orders))
  })
})

// Get order statistics for dashboard (MUST be before /:order_id route)
router.get('/dashboard/orders/stats/summary', (req, res) => {
  const customer_id = req.user.customer_id

  const statsSQL = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(grand_total) as total_spent,
      AVG(grand_total) as avg_order_value,
      COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered_orders,
      COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_orders
    FROM Orders
    WHERE customer_id = ?
  `

  pool.query(statsSQL, [customer_id], (err, stats) => {
    if (err) return res.send(result.createResult(err))

    res.send(result.createResult(null, stats[0]))
  })
})

// Get order details with items
router.get('/dashboard/orders/:order_id', (req, res) => {
  const customer_id = req.user.customer_id
  const { order_id } = req.params

  const orderSQL = `
    SELECT 
      o.order_id,
      o.customer_id,
      o.chef_id,
      o.status,
      o.grand_total,
      o.order_time,
      hc.business_name,
      hc.average_rating,
      hc.phone_number as chef_phone,
      a.street,
      a.city,
      a.pincode,
      a.house_no,
      dp.first_name as delivery_first_name,
      dp.last_name as delivery_last_name,
      dp.phone_number as delivery_phone
    FROM Orders o
    JOIN HomeChefs hc ON o.chef_id = hc.chef_id
    JOIN Addresses a ON o.delivery_address_id = a.address_id
    LEFT JOIN DeliveryPersonnel dp ON o.delivery_person_id = dp.driver_id
    WHERE o.order_id = ? AND o.customer_id = ?
  `

  pool.query(orderSQL, [order_id, customer_id], (err, orders) => {
    if (err) return res.send(result.createResult(err))

    if (orders.length === 0) {
      return res.send(result.createResult('Order not found'))
    }

    const order = orders[0]

    // Get order items
    const itemsSQL = `
      SELECT 
        oi.order_item_id,
        oi.item_id,
        mi.name,
        oi.quantity,
        oi.unit_price_at_purchase,
        mi.image_url
      FROM OrderItems oi
      JOIN MenuItems mi ON oi.item_id = mi.item_id
      WHERE oi.order_id = ?
    `

    pool.query(itemsSQL, [order_id], (err, items) => {
      if (err) return res.send(result.createResult(err))

      order.items = items
      res.send(result.createResult(null, order))
    })
  })
})

// Cancel order
router.put('/dashboard/orders/:order_id/cancel', (req, res) => {
  const customer_id = req.user.customer_id
  const { order_id } = req.params

  // Check if order belongs to customer and can be cancelled
  const checkSQL = `
    SELECT status FROM Orders 
    WHERE order_id = ? AND customer_id = ?
  `

  pool.query(checkSQL, [order_id, customer_id], (err, orders) => {
    if (err) return res.send(result.createResult(err))

    if (orders.length === 0) {
      return res.send(result.createResult('Order not found'))
    }

    if (orders[0].status !== 'Placed') {
      return res.send(result.createResult('Only placed orders can be cancelled'))
    }

    const cancelSQL = `
      UPDATE Orders SET status = 'Cancelled' WHERE order_id = ?
    `

    pool.query(cancelSQL, [order_id], (err) => {
      if (err) return res.send(result.createResult(err))
      res.send(result.createResult(null, { message: 'Order cancelled successfully' }))
    })
  })
})

// ==================== DASHBOARD - SETTINGS TAB ====================
// Get all customer settings and preferences
router.get('/dashboard/settings', (req, res) => {
  const customer_id = req.user.customer_id

  // Get customer info
  const customerSQL = `
    SELECT customer_id, first_name, last_name, email, phone_number
    FROM Customers
    WHERE customer_id = ?
  `

  pool.query(customerSQL, [customer_id], (err, customers) => {
    if (err) return res.send(result.createResult(err))

    if (customers.length === 0) {
      return res.send(result.createResult('Customer not found'))
    }

    // Get all addresses
    const addressesSQL = `
      SELECT address_id, street, city, pincode, house_no, label
      FROM Addresses
      WHERE entity_type = 'Customer' AND entity_id = ?
    `

    pool.query(addressesSQL, [customer_id], (err, addresses) => {
      if (err) return res.send(result.createResult(err))

      const settings = {
        customer: customers[0],
        addresses: addresses
      }

      res.send(result.createResult(null, settings))
    })
  })
})

// Update customer settings
router.put('/dashboard/settings/profile', (req, res) => {
  const customer_id = req.user.customer_id
  const { first_name, last_name, phone_number } = req.body

  const sql = `UPDATE Customers SET first_name = ?, last_name = ?, phone_number = ? WHERE customer_id = ?`
  pool.query(sql, [first_name, last_name, phone_number, customer_id], (err, data) => {
    if (err) return res.send(result.createResult(err))
    res.send(result.createResult(null, { message: 'Profile updated successfully' }))
  })
})

// Add new address
router.post('/dashboard/settings/address', (req, res) => {
  const { street, city, pincode, house_no, label, latitude, longitude } = req.body
  const customer_id = req.user.customer_id

  const sql = `
    INSERT INTO Addresses
    (entity_type, entity_id, street, city, pincode, house_no, label, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  pool.query(
    sql,
    ['Customer', customer_id, street, city, pincode, house_no, label, latitude, longitude],
    (err, data) => {
      if (err) return res.send(result.createResult(err))
      res.send(result.createResult(null, { address_id: data.insertId }))
    }
  )
})

// Update address
router.put('/dashboard/settings/address/:address_id', (req, res) => {
  const customer_id = req.user.customer_id
  const { address_id } = req.params
  const { street, city, pincode, house_no, label, latitude, longitude } = req.body

  // Verify address belongs to customer
  const checkSQL = `
    SELECT address_id FROM Addresses 
    WHERE address_id = ? AND entity_type = 'Customer' AND entity_id = ?
  `

  pool.query(checkSQL, [address_id, customer_id], (err, addresses) => {
    if (err) return res.send(result.createResult(err))

    if (addresses.length === 0) {
      return res.send(result.createResult('Address not found'))
    }

    const updateSQL = `
      UPDATE Addresses 
      SET street = ?, city = ?, pincode = ?, house_no = ?, label = ?, latitude = ?, longitude = ?
      WHERE address_id = ?
    `

    pool.query(updateSQL, [street, city, pincode, house_no, label, latitude, longitude, address_id], (err) => {
      if (err) return res.send(result.createResult(err))
      res.send(result.createResult(null, { message: 'Address updated successfully' }))
    })
  })
})

// Delete address
router.delete('/dashboard/settings/address/:address_id', (req, res) => {
  const customer_id = req.user.customer_id
  const { address_id } = req.params

  // Verify address belongs to customer
  const checkSQL = `
    SELECT address_id FROM Addresses 
    WHERE address_id = ? AND entity_type = 'Customer' AND entity_id = ?
  `

  pool.query(checkSQL, [address_id, customer_id], (err, addresses) => {
    if (err) return res.send(result.createResult(err))

    if (addresses.length === 0) {
      return res.send(result.createResult('Address not found'))
    }

    const deleteSQL = `DELETE FROM Addresses WHERE address_id = ?`

    pool.query(deleteSQL, [address_id], (err) => {
      if (err) return res.send(result.createResult(err))
      res.send(result.createResult(null, { message: 'Address deleted successfully' }))
    })
  })
})

// Change password
router.post('/dashboard/settings/change-password', (req, res) => {
  const customer_id = req.user.customer_id
  const { current_password, new_password } = req.body

  const getUserSQL = `SELECT password_hash FROM Customers WHERE customer_id = ?`

  pool.query(getUserSQL, [customer_id], (err, users) => {
    if (err) return res.send(result.createResult(err))

    if (users.length === 0) {
      return res.send(result.createResult('Customer not found'))
    }

    bcrypt.compare(current_password, users[0].password_hash, (err, passwordStatus) => {
      if (!passwordStatus) {
        return res.send(result.createResult('Current password is incorrect'))
      }

      bcrypt.hash(new_password, config.SALT_ROUND, (err, hashedPassword) => {
        if (err) return res.send(result.createResult(err))

        const updateSQL = `UPDATE Customers SET password_hash = ? WHERE customer_id = ?`

        pool.query(updateSQL, [hashedPassword, customer_id], (err) => {
          if (err) return res.send(result.createResult(err))
          res.send(result.createResult(null, { message: 'Password changed successfully' }))
        })
      })
    })
  })
})

// Get customer preferences/favorites
router.get('/dashboard/settings/preferences', (req, res) => {
  const customer_id = req.user.customer_id

  // Get most ordered chefs (favorites)
  const favoritesSQL = `
    SELECT 
      hc.chef_id,
      hc.business_name,
      hc.average_rating,
      COUNT(o.order_id) as order_count
    FROM HomeChefs hc
    JOIN Orders o ON hc.chef_id = o.chef_id
    WHERE o.customer_id = ?
    GROUP BY hc.chef_id
    ORDER BY order_count DESC
    LIMIT 5
  `

  pool.query(favoritesSQL, [customer_id], (err, favorites) => {
    if (err) return res.send(result.createResult(err))

    const preferences = {
      favoriteChefs: favorites
    }

    res.send(result.createResult(null, preferences))
  })
})

// ==================== BROWSE CHEFS ====================
// Get single chef's information and all menu items
router.get('/chef/:chef_id', (req, res) => {
  const { chef_id } = req.params
  const customer_id = req.user.customer_id

  // Get chef info
  const chefSQL = `
    SELECT 
      chef_id,
      business_name,
      description,
      average_rating,
      phone_number,
      COUNT(DISTINCT o.order_id) as total_orders
    FROM HomeChefs hc
    LEFT JOIN Orders o ON hc.chef_id = o.chef_id
    WHERE hc.chef_id = ? AND hc.is_active = TRUE
    GROUP BY hc.chef_id
  `

  pool.query(chefSQL, [chef_id], (err, chefs) => {
    if (err) return res.send(result.createResult(err))

    if (chefs.length === 0) {
      return res.send(result.createResult('Chef not found'))
    }

    const chef = chefs[0]

    // Get all menu items from this chef
    const menuSQL = `
      SELECT 
        item_id,
        chef_id,
        name,
        description,
        base_price,
        image_url,
        is_available
      FROM MenuItems
      WHERE chef_id = ? AND is_available = TRUE
      ORDER BY name ASC
    `

    pool.query(menuSQL, [chef_id], (err, items) => {
      if (err) return res.send(result.createResult(err))

      const chefData = {
        chef: chef,
        items: items
      }

      res.send(result.createResult(null, chefData))
    })
  })
})

// Get all chefs for browse page
router.get('/chefs/all', (req, res) => {
  const customer_id = req.user.customer_id

  // Get customer's pincode from saved addresses
  const getPincodeSQL = `
    SELECT pincode FROM Addresses 
    WHERE entity_type = 'Customer' AND entity_id = ? 
    LIMIT 1
  `

  pool.query(getPincodeSQL, [customer_id], (err, addressData) => {
    if (err) return res.send(result.createResult(err))

    const pincode = addressData.length > 0 ? addressData[0].pincode : null

    // Get all active chefs with service in customer's area
    const chefsSQL = `
      SELECT 
        hc.chef_id,
        hc.business_name,
        hc.description,
        hc.average_rating,
        hc.phone_number,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT mi.item_id) as menu_count
      FROM HomeChefs hc
      LEFT JOIN Orders o ON hc.chef_id = o.chef_id
      LEFT JOIN MenuItems mi ON hc.chef_id = mi.chef_id AND mi.is_available = TRUE
      LEFT JOIN ServiceAreas sa ON hc.chef_id = sa.chef_id
      WHERE hc.is_active = TRUE
      ${pincode ? `AND sa.pincode = ?` : ''}
      GROUP BY hc.chef_id
      ORDER BY hc.average_rating DESC
    `

    const params = pincode ? [pincode] : []

    pool.query(chefsSQL, params, (err, chefs) => {
      if (err) return res.send(result.createResult(err))
      res.send(result.createResult(null, chefs))
    })
  })
})

// ==================== CUSTOMER FEEDBACKS ====================
// Get all feedbacks for a customer
router.get('/feedbacks', (req, res) => {
  const customer_id = req.user.customer_id

  const sql = `
    SELECT 
      f.feedback_id,
      f.order_id,
      f.rating,
      f.comment,
      f.created_at,
      hc.business_name,
      o.status,
      o.grand_total
    FROM feedback f
    LEFT JOIN Orders o ON f.order_id = o.order_id
    LEFT JOIN HomeChefs hc ON o.chef_id = hc.chef_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `

  pool.query(sql, [customer_id], (err, data) => {
    res.send(result.createResult(err, data))
  })
})

module.exports = router
