const jwt = require('jsonwebtoken')
const result = require('./result')
const config = require('./config')

function authorizeUser(req, res, next) {
  const openUrls = [
    '/customer/signup',
    '/customer/signin',
    '/homechef/signup',
    '/homechef/signin',
    '/delivery-personnel/signup',
    '/delivery-personnel/signin',
    '/admin/login',
    '/admin/signup'
  ]

  const openPaths = ['/homechef/all', '/homechef/search', '/chef/menu']

  // Check exact match
  if (openUrls.includes(req.originalUrl)) {
    return next()
  }

  // Check prefix match (for routes with params like /homechef/:chef_id/menu)
  if (openPaths.some(path => req.originalUrl.startsWith(path))) {
    return next()
  }

  // Get token from headers (try both Authorization header and direct token header)
  let token = req.headers.token
  
  // If not in token header, try Authorization header (Bearer token)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7) // Remove 'Bearer ' prefix
    }
  }

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