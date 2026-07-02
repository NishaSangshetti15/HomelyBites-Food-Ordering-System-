const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Get single chef's information and all menu items
router.get('/menu/:chef_id', (req, res) => {
  const { chef_id } = req.params

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

module.exports = router
