const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Place order
router.post('/', (req, res) => {
  const customer_id = req.user.customer_id
  const { total_amount, foodItems } = req.body

  // For now, use a default chef_id and delivery_address_id
  // In a real app, these would come from the request or be determined by business logic
  const chef_id = 1 // TODO: Determine chef_id based on menu items or request
  const delivery_address_id = 1 // TODO: Get this from customer's saved addresses

  const sql = `
    INSERT INTO Orders
    (customer_id, chef_id, delivery_address_id, grand_total, status, order_time)
    VALUES (?, ?, ?, ?, 'Placed', NOW())
  `

  pool.query(sql, [customer_id, chef_id, delivery_address_id, total_amount], (err, data) => {
    if (err) {
      console.error('Order insert error:', err)
      return res.send(result.createResult(err))
    }

    const order_id = data.insertId

    // Insert order items
    if (foodItems && foodItems.length > 0) {
      let completed = 0

      foodItems.forEach((item) => {
        const itemSql = `
          INSERT INTO OrderItems
          (order_id, item_id, quantity, unit_price_at_purchase)
          VALUES (?, ?, ?, ?)
        `

        // Get the item price from MenuItems table
        const getPriceSql = `SELECT base_price FROM MenuItems WHERE item_id = ?`
        
        pool.query(getPriceSql, [item.fid], (priceErr, priceData) => {
          if (priceErr) {
            console.error('Price fetch error:', priceErr)
            return
          }

          const unitPrice = priceData.length > 0 ? priceData[0].base_price : 0

          pool.query(itemSql, [order_id, item.fid, item.quantity, unitPrice], (itemErr) => {
            if (itemErr) {
              console.error('Order item insert error:', itemErr)
            }
            completed++

            if (completed === foodItems.length) {
              res.send(
                result.createResult(null, {
                  order_id: order_id,
                  total_amount: total_amount,
                  status: 'Placed'
                })
              )
            }
          })
        })
      })
    } else {
      res.send(
        result.createResult(null, {
          order_id: order_id,
          total_amount: total_amount,
          status: 'Placed'
        })
      )
    }
  })
})

// Get customer orders
router.get('/', (req, res) => {
  const customer_id = req.user.customer_id
  console.log('Fetching orders for customer:', customer_id)

  const sql = `
    SELECT o.order_id, o.grand_total as total_amount, o.order_time as order_date, o.status,
           oi.item_id, oi.quantity, m.name as food_name, m.base_price as price, m.image_url
    FROM Orders o
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN MenuItems m ON oi.item_id = m.item_id
    WHERE o.customer_id = ?
    ORDER BY o.order_time DESC
  `

  pool.query(sql, [customer_id], (err, data) => {
    if (err) {
      console.error('Error fetching orders:', err)
      return res.send(result.createResult(err))
    }

    console.log('Raw query data:', data)

    // Group order items by order_id
    const orders = {}
    data.forEach((row) => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          total_amount: row.total_amount,
          order_date: row.order_date,
          status: row.status,
          delivery_date: row.delivery_date,
          items: []
        }
      }

      if (row.item_id) {
        orders[row.order_id].items.push({
          item_id: row.item_id,
          food_name: row.food_name,
          quantity: row.quantity,
          price: row.price,
          image_url: row.image_url
        })
      }
    })

    const ordersArray = Object.values(orders)
    console.log('Formatted orders:', ordersArray)
    
    res.send(result.createResult(null, ordersArray))
  })
})

// Get order details
router.get('/:id', (req, res) => {
  const { id } = req.params
  const customer_id = req.user.customer_id

  const sql = `
    SELECT o.order_id, o.total_amount, o.order_date, o.status,
           oi.food_id, oi.quantity, f.food_name, f.price, f.image_url
    FROM Orders o
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN Foods f ON oi.food_id = f.food_id
    WHERE o.order_id = ? AND o.customer_id = ?
  `

  pool.query(sql, [id, customer_id], (err, data) => {
    if (err)
      return res.send(result.createResult(err))

    if (data.length === 0)
      return res.send(result.createResult('Order not found'))

    const order = {
      order_id: data[0].order_id,
      total_amount: data[0].total_amount,
      order_date: data[0].order_date,
      status: data[0].status,
      items: []
    }

    data.forEach((row) => {
      if (row.food_id) {
        order.items.push({
          food_id: row.food_id,
          food_name: row.food_name,
          quantity: row.quantity,
          price: row.price,
          image_url: row.image_url
        })
      }
    })

    res.send(result.createResult(null, order))
  })
})

module.exports = router
