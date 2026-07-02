const jwt = require('jsonwebtoken')
const result = require('./result')
const config = require('./config')

function authorizeUser(req, res, next) {
  const openUrls = [
    '/customer/signup',
    '/customer/signin',
    '/homechef/signup',
    '/homechef/signin',
    '/homechef/all',
    '/admin/login'
  ]

  const openPaths = ['/delivery-personnel', '/food', '/homechef/menu/business', '/homechef/menu']

  // Check exact match
  if (openUrls.includes(req.originalUrl)) {
    return next()
  }

  // Check prefix match (for routes with params like /delivery-personnel/:id or /food/:id)
  if (openPaths.some(path => req.originalUrl.startsWith(path))) {
    return next()
  }

  const token = req.headers.token
  if (!token) {
    return res.send({ status: 'error', error: 'Token is Missing' })
  }

  try {
    const payload = jwt.verify(token, config.SECRET)
    req.user = payload
    next()
  } catch (err) {
    res.send({ status: 'error', error: 'Invalid Token' })
  }
}



module.exports = authorizeUser