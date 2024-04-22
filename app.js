const express = require('express')
const connectDb = require('./Config/connection')
const dotenv = require('dotenv').config()
const app = express()
const morgan = require('morgan')
const errorHandler = require('./Middleware/errorHandling')



//database connection
connectDb()

//json parser
app.use(express.json())
app.use(morgan('tiny'))


//error handling
app.use(errorHandler)

//api
app.use('/api/user', require('./Routes/userRoute'))
app.use('/api/admin', require('./Routes/adminRoutes'))


//listen on port

const PORT = process.env.PORT || 8001

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})