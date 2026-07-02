const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Submit feedback

router.post('/', (req, res) => {
  const user_id = req.user.customer_id
  const { order_id, rating, comment } = req.body

  const sql = `
    INSERT INTO feedback(order_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `
  pool.query(sql, [order_id, user_id, rating, comment],
    (err, data) => res.send(result.createResult(err, data))
  )
})

module.exports = router
