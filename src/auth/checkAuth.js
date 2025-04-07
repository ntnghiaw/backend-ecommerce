'use strict'

const { findById } = require('../models/repositories/apikey.repo')
const HEADER = require('../constants')


/**
 * This function is used to check if the request has a valid API key in the headers
 */
const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString()
    if (!key) {
      return res.status(403).json({
        message: 'Forbidden Error',
      })
    }

    // check objKey
    const objKey = await findById(key)
    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error 2',
      })
    }

    req.objKey = objKey
    return next()

  } catch (error) {}
}

/**
 * Check if the user has the permission to access the route
 * @param {string} permission - The permission to check for
 */
const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: 'Permission required',
      })
    }
    if (!req.objKey.permissions.includes(permission)) {
      return res.status(403).json({
        message: 'Permission denied',
      })
    }
    return next()
  }
}





module.exports = {
  apiKey,
  permission,

}