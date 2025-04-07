'use strict'
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const app = express()

// init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())

// init db
require('./dbs/init.mongodb')

// init routes
app.use('/', require('./routes'))

// handle error

app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    console.log(error.stack)
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || 'Internal Server Error',
      status: 'error',
    })  

})


module.exports = app
