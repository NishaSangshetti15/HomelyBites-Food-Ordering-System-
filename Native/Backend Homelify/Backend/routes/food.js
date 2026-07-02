const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Get all food items
router.get('/', (req, res) => {
  const sql = `
    SELECT m.item_id as fid, m.name as food_name, m.description, m.base_price as price, m.image_url, m.is_available, m.chef_id, c.business_name as chef_name
    FROM MenuItems m
    LEFT JOIN HomeChefs c ON m.chef_id = c.chef_id
    ORDER BY m.item_id DESC
  `

  pool.query(sql, (err, data) => {
    if (err)
      return res.send(result.createResult(err))
    
    res.send(result.createResult(null, data))
  })
})

// Get food item by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = `
    SELECT m.item_id as fid, m.name as food_name, m.description, m.base_price as price, m.image_url, m.is_available, m.chef_id, c.business_name as chef_name
    FROM MenuItems m
    LEFT JOIN HomeChefs c ON m.chef_id = c.chef_id
    WHERE m.item_id = ?
  `

  pool.query(sql, [id], (err, data) => {
    if (err)
      return res.send(result.createResult(err))
    
    if (data.length === 0)
      return res.send(result.createResult('Food item not found'))
    
    res.send(result.createResult(null, data[0]))
  })
})

module.exports = router
