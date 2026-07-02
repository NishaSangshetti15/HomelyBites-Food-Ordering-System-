const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../utils/db')
const result = require('../utils/result')
const config = require('../utils/config')

const router = express.Router()


// Home Chef Registration
router.post('/signup', (req, res) => {
    const { business_name, email, password_hash, phone_number } = req.body

    const sql = `
        INSERT INTO HomeChefs
        (business_name, email, password_hash, phone_number)
        VALUES (?, ?, ?, ?)
    `

    bcrypt.hash(password_hash, config.SALT_ROUND, (err, hashedPassword) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        pool.query(
            sql,
            [business_name, email, hashedPassword, phone_number],
            (err, data) => {
                res.send(result.createResult(err, data))
            }
        )
    })
})


// Home Chef Login
router.post('/signin', (req, res) => {
    const { email, password } = req.body

    const sql = `SELECT * FROM HomeChefs WHERE email = ?`

    pool.query(sql, [email], (err, data) => {
        if (err) {
            res.send(result.createResult(err))
        }
        else if (data.length === 0) {
            res.send(result.createResult('Invalid Email'))
        }
        else {
            // Chef record exists
            bcrypt.compare(password, data[0].password_hash, (err, passwordStatus) => {

                if (!passwordStatus) {
                    return res.send(result.createResult('Invalid Password'))
                }

                // Block login if admin has not approved chef
                if (!data[0].is_active) {
                    return res.send(result.createResult('Account not approved by admin'))
                }

                const payload = {
                    chef_id: data[0].chef_id
                }

                const token = jwt.sign(payload, config.SECRET)

                const chef = {
                    token: token,
                    chef_id: data[0].chef_id,
                    business_name: data[0].business_name,
                    email: data[0].email,
                    phone_number: data[0].phone_number,
                    average_rating: data[0].average_rating
                }

                res.send(result.createResult(null, chef))
            })
        }
    })
})

//Add serviceAreas

router.post('/service-area', (req, res) => {
  const chef_id = req.user.chef_id
  const { pincode, delivery_fee } = req.body

  const sql = `
    INSERT INTO ServiceAreas (chef_id, pincode, delivery_fee)
    VALUES (?, ?, ?)
  `

  pool.query(sql, [chef_id, pincode, delivery_fee], (err, data) => {
    res.send(result.createResult(err, data))
  })
})


//add food menu item

router.post('/menu', (req, res) => {
  const chef_id = req.user.chef_id
  const { name, base_price, description } = req.body

  const sql = `
    INSERT INTO MenuItems 
    (chef_id, name, base_price, description)
    VALUES (?, ?, ?, ?)
  `

  pool.query(sql, [chef_id, name, base_price, description], (err, data) => {
    res.send(result.createResult(err, data))
  })
})


//get food items
router.get('/menu', (req, res) => {
  const chef_id = req.user.chef_id

  pool.query(
    `SELECT * FROM MenuItems WHERE chef_id = ?`,
    [chef_id],
    (err, data) => res.send(result.createResult(err, data))
  )
})


//update food menu item

router.put('/menu/:id', (req, res) => {
  const chef_id = req.user.chef_id
  const { name, base_price, is_available } = req.body

  const sql = `
    UPDATE MenuItems
    SET name=?, base_price=?, is_available=?
    WHERE item_id=? AND chef_id=?
  `

  pool.query(
    sql,
    [name, base_price, is_available, req.params.id, chef_id],
    (err, data) => res.send(result.createResult(err, data))
  )
})


//get food menu by business name

router.get('/menu/business/:businessName', (req, res) => {
  const { businessName } = req.params

  const sql = `
    SELECT mi.* FROM MenuItems mi
    JOIN HomeChefs hc ON mi.chef_id = hc.chef_id
    WHERE hc.business_name = ?
  `

  pool.query(sql, [businessName], (err, data) => {
    res.send(result.createResult(err, data))
  })
})


//get all chefs

router.get('/all', (req, res) => {
  const sql = `SELECT chef_id, business_name, email, phone_number, average_rating FROM HomeChefs WHERE is_active = 1`

  pool.query(sql, (err, data) => {
    res.send(result.createResult(err, data))
  })
})


//get chef menu by chef_id

router.get('/menu/:chef_id', (req, res) => {
  const { chef_id } = req.params

  const sql = `SELECT * FROM MenuItems WHERE chef_id = ?`

  pool.query(sql, [chef_id], (err, data) => {
    res.send(result.createResult(err, data))
  })
})


module.exports = router