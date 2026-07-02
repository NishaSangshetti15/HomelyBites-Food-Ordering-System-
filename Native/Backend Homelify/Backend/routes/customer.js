const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool =require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()

//customer Registration
router.post('/signup', (req, res) => {
    const { first_name, last_name, email, password_hash, phone_number } = req.body

    const sql = `
        INSERT INTO Customers 
        (first_name, last_name, email, password_hash, phone_number) 
        VALUES (?, ?, ?, ?, ?)
    `

    bcrypt.hash(password_hash, config.SALT_ROUND, (err, hashedPassword) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        pool.query(
            sql,
            [first_name, last_name, email, hashedPassword, phone_number],
            (err, data) => {
                res.send(result.createResult(err, data))
            }
        )
    })
})


//customer Login
router.post('/signin', (req, res) => {
    const { email, password } = req.body

    const sql = `SELECT * FROM Customers WHERE email = ?`

    pool.query(sql, [email], (err, data) => {
        if (err) {
            res.send(result.createResult(err))
        }
        else if (data.length === 0) {
            res.send(result.createResult('Invalid Email'))
        }
        else {
            // Customer record exists at index 0
            bcrypt.compare(password, data[0].password_hash, (err, passwordStatus) => {

                if (passwordStatus) {
                    const payload = {
                        customer_id: data[0].customer_id
                    }

                    const token = jwt.sign(payload, config.SECRET)

                    const customer = {
                        token: token,
                        name: `${data[0].first_name} ${data[0].last_name}`,
                        first_name: data[0].first_name,
                        last_name: data[0].last_name,
                        email: data[0].email,
                        phone_number: data[0].phone_number
                    }

                    res.send(result.createResult(null, customer))
                }
                else {
                    res.send(result.createResult('Invalid Password'))
                }
            })
        }
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

module.exports = router