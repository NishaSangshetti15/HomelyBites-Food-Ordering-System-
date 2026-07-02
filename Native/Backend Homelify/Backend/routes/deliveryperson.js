const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

// Create delivery personnel
router.post('/', (req, res) => {
  const { first_name, last_name, phone_number } = req.body

  const sql = `INSERT INTO DeliveryPersonnel (first_name, last_name, phone_number) VALUES (?, ?, ?)`
  pool.query(sql, [first_name, last_name, phone_number], (err, data) => {
    res.send(result.createResult(err, data))
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
