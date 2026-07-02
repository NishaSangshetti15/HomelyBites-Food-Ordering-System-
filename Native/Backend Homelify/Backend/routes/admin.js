const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

//give all customers

router.get('/',(req,res)=>{
    const sql = `SELECT * FROM Customers`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// admin login (fallback to config credentials)
router.post('/login', (req, res) => {
    const { email, password } = req.body

    // check against config fallback credentials
    if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
        const payload = { is_admin: true, email }
        const token = jwt.sign(payload, config.SECRET)
        return res.send(result.createResult(null, { token }))
    }

    //check admin
    const sql = `SELECT * FROM Admins WHERE email = ?`
    pool.query(sql, [email], (err, data) => {
        // If Admins table doesn't exist, just return Invalid Email (fallback is primary)
        if (err && err.code === 'ER_NO_SUCH_TABLE') {
            return res.send(result.createResult('Invalid Email (use fallback admin@local)'))
        }
        if (err) return res.send(result.createResult(err))
        if (!data || data.length === 0) return res.send(result.createResult('Invalid Email'))

        bcrypt.compare(password, data[0].password_hash, (err, ok) => {
            if (err || !ok) return res.send(result.createResult('Invalid Password'))
            const payload = { is_admin: true, admin_id: data[0].admin_id }
            const token = jwt.sign(payload, config.SECRET)
            res.send(result.createResult(null, { token }))
        })
    })
})

// middleware to require admin
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.is_admin) {
        return res.send(result.createResult('Unauthorized'))
    }
    next()
}

// router.use(requireAdmin);

// Get all chefs
router.get('/chefs', requireAdmin, (req, res) => {
    const sql = `SELECT * FROM HomeChefs`
    pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Get all customers
router.get('/customers', requireAdmin, (req, res) => {
    const sql = `SELECT * FROM Customers`
    pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Get all orders
router.get('/orders', requireAdmin, (req, res) => {
    const sql = `SELECT * FROM Orders`
    pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Get feedbacks
router.get('/feedbacks', requireAdmin, (req, res) => {
    const sql = `SELECT * FROM feedback`
    pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Add service area
router.post('/service-areas', requireAdmin, (req, res) => {
    const { chef_id, pincode, delivery_fee } = req.body
    const sql = `INSERT INTO ServiceAreas (chef_id, pincode, delivery_fee) VALUES (?, ?, ?)`
    pool.query(sql, [chef_id, pincode, delivery_fee], (err, data) => res.send(result.createResult(err, data)))
})

// Get delivery personnel list
router.get('/delivery-personnel', requireAdmin, (req, res) => {
    const sql = `SELECT * FROM DeliveryPersonnel`
    pool.query(sql, (err, data) => res.send(result.createResult(err, data)))
})

// Approve a home chef (set is_active = true)
router.put('/chefs/:chefid/approve', (req, res) => {
    const chefId = req.params.chefid
    const sql = `UPDATE HomeChefs SET is_active = TRUE WHERE chef_id = ?`
    pool.query(sql, [chefId], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// Block a home chef (set is_active = false)
router.put('/chefs/:chefid/block', (req, res) => {
    const chefId = req.params.chefid
    const sql = `UPDATE HomeChefs SET is_active = FALSE WHERE chef_id = ?`
    pool.query(sql, [chefId], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

module.exports = router