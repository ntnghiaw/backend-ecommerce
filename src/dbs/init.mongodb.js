'use strict'

const mongoose = require('mongoose')
const { db : { host, port, name } } = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`

console.log(`Connect string: ${connectString}`)
// Singleton Pattern < unecessary for this project but good to know>

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }

    mongoose
      .connect(connectString)
      .then((_) => console.log('Connected Mongodb Success'))
      .catch((err) => console.log(`Connect Mongodb Failed`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
      return Database.instance
    }
  }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
