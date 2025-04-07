'use strict'

const shopModel = require('../shop.model')

/**
 * Find shop registered by email
 * @param {*} email - email of the shop to find
 * @param {*} select - fields to select from the database, default is { email: 1, passowrd:1, roles: 1, status: 1, name:1 } 
 * @returns 
 */
const findByEmail = async ({ email, select = {
  email: 1,
  password:1,
  roles: 1,
  status: 1,
  name:1
}}) => {
  return await shopModel.findOne({ email }).select(select).lean()
}


module.exports = {
  findByEmail,
}