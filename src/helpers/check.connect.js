'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECOND = 5000

// This function counts the number of connections to the MongoDB database and logs it to the console.
const countConnect = () => {
  const numConnections = mongoose.connections.length
  console.log(`Number of connections:: ${numConnections}`)
}


// Check overloaded connections and log them to the console.
const checkOverload =  () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss / (1024 * 1024) // Convert to MB
    // Example threshold based on CPU cores
    const maxConnections = numCores * 5

    console.log(`Active connections:: ${numConnections}`)
    console.log(`Memory usage:: ${memoryUsage.toFixed(2)} MB`)

    if (numConnections > maxConnections) {
      console.log(`Connection overload detected!`)
    }


  }, _SECOND) // Monitor every 5 seconds
}

module.exports = {
  countConnect,
  checkOverload,
}