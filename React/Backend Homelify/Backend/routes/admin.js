const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

// Test endpoint to verify admin route is accessible
router.get('/test', (req, res) => {
    res.send({ status: 'success', message: 'Admin route is accessible' })
})

//give all customers

router.get('/',(req,res)=>{
    const sql = `SELECT * FROM Customers`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

// admin login (fallback to config credentials)
router.post('/login', (req, res) => {
    console.log('Admin login attempt received')
    console.log('Request body:', req.body)
    
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
        console.log('Missing email or password')
        return res.status(400).send({
            status: 'error',
            message: 'Email and password are required'
        })
    }

    console.log('Checking credentials against:', config.ADMIN_EMAIL)
    console.log('Email match:', email === config.ADMIN_EMAIL)
    console.log('Password length:', password.length, 'Expected:', config.ADMIN_PASSWORD.length)
    console.log('Password match:', password === config.ADMIN_PASSWORD)
    
    // Trim whitespace and check against config fallback credentials
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    if (trimmedEmail === config.ADMIN_EMAIL && trimmedPassword === config.ADMIN_PASSWORD) {
        console.log('Admin credentials matched!')
        const payload = { is_admin: true, email: trimmedEmail }
        const token = jwt.sign(payload, config.SECRET)
        return res.status(200).send({
            status: 'success',
            message: 'Login successful',
            data: {
                token: token,
                email: trimmedEmail,
                role: 'Admin',
                name: 'System Administrator'
            }
        })
    }

    console.log('Credentials did not match fallback, checking database...')
    
    //check admin database
    const sql = `SELECT * FROM Admins WHERE email = ?`
    pool.query(sql, [email], (err, data) => {
        // If Admins table doesn't exist, try fallback credentials first
        if (err && err.code === 'ER_NO_SUCH_TABLE') {
            console.log('Admins table does not exist')
            return res.status(401).send({
                status: 'error',
                message: 'Invalid email or password'
            })
        }
        if (err) {
            console.error('Database error:', err)
            return res.status(500).send({
                status: 'error',
                message: 'Database error: ' + err.message
            })
        }
        if (!data || data.length === 0) {
            console.log('No admin found with email:', email)
            return res.status(401).send({
                status: 'error',
                message: 'Invalid email or password'
            })
        }

        bcrypt.compare(password, data[0].password_hash, (err, ok) => {
            if (err) {
                console.error('Bcrypt error:', err)
                return res.status(500).send({
                    status: 'error',
                    message: 'Error during authentication'
                })
            }
            if (!ok) {
                console.log('Password does not match')
                return res.status(401).send({
                    status: 'error',
                    message: 'Invalid email or password'
                })
            }
            console.log('Admin authenticated from database')
            const payload = { is_admin: true, admin_id: data[0].admin_id }
            const token = jwt.sign(payload, config.SECRET)
            res.status(200).send({
                status: 'success',
                message: 'Login successful',
                data: {
                    token: token,
                    admin_id: data[0].admin_id,
                    email: data[0].email,
                    role: 'Admin',
                    name: 'Administrator'
                }
            })
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