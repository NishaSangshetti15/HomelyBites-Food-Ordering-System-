const express = require('express')
const multer = require('multer')
const path = require('path')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// Add menu item with image upload
router.post('/', upload.single('image'), (req, res) => {
  const chef_id = req.user.chef_id
  const { name, basePrice, description } = req.body || {}

  // Validate required fields
  if (!name || !basePrice) {
    return res.send(result.createResult('Name and price are required'))
  }

  // Get uploaded file info
  let image_url = null
  if (req.file) {
    image_url = `/uploads/${req.file.filename}` // You can serve this folder statically
  }

  const sql = `
    INSERT INTO MenuItems 
    (chef_id, name, base_price, description, image_url)
    VALUES (?, ?, ?, ?, ?)
  `

  pool.query(sql, [chef_id, name, basePrice, description, image_url], (err, data) => {
    res.send(result.createResult(err, data))
  })
})

// Update menu item with optional image
router.put('/:item_id', upload.single('image'), (req, res) => {
  const chef_id = req.user.chef_id
  const { item_id } = req.params
  const { name, base_price, is_available } = req.body || {}

  // Validate required fields
  if (!name || !base_price) {
    return res.send(result.createResult('Name and price are required'))
  }

  let updateSql = `
    UPDATE MenuItems 
    SET name = ?, base_price = ?, is_available = ?
    WHERE item_id = ? AND chef_id = ?
  `
  let values = [name, base_price, is_available, item_id, chef_id]

  // If image is provided, update it too
  if (req.file) {
    const image_url = `/uploads/${req.file.filename}`
    updateSql = `
      UPDATE MenuItems 
      SET name = ?, base_price = ?, is_available = ?, image_url = ?
      WHERE item_id = ? AND chef_id = ?
    `
    values = [name, base_price, is_available, image_url, item_id, chef_id]
  }

  pool.query(updateSql, values, (err, data) => {
    res.send(result.createResult(err, data))
  })
})

// Get all menu items for a chef
router.get('/', (req, res) => {
  const chef_id = req.user.chef_id

  const sql = `
    SELECT * FROM MenuItems 
    WHERE chef_id = ?
    ORDER BY created_at DESC
  `

  pool.query(sql, [chef_id], (err, data) => {
    res.send(result.createResult(err, data))
  })
})

module.exports = router









