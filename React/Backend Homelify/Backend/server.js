const express = require('express')
const cors = require('cors')
const path = require('path')

const authorizeUser = require('./utils/authuser')
const customerRouter = require('./routes/customer')
const homechefRouter = require('./routes/homeChef')
const feedbackRouter = require('./routes/feedback')
const deliveryRouter = require('./routes/deliveryperson')
const adminRouter = require('./routes/admin')
const chefRouter = require('./routes/chef')
const app = express()

app.use(cors())
app.use(express.json())

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Apply authorization middleware
app.use(authorizeUser)

// Mount all routers
app.use('/customer', customerRouter)
app.use('/homechef', homechefRouter)
app.use('/feedback', feedbackRouter)
app.use('/delivery-personnel', deliveryRouter)
app.use('/admin', adminRouter)
app.use('/chef', chefRouter)

app.listen(4000,'localhost',()=>{
    console.log('server started at port 4000')
})