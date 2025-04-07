'use strict'

const jwt = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { HEADER } = require('../constants')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../models/repositories/keytoken.model')

const createTokenPair = (payload, privateKey) => {
  try {
    // create access token
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days',
    })

    // create refresh token
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days',
    })

    return {
      accessToken,
      refreshToken,
    }
  } catch (error) {
    console.log(error)
  }
}

// const authentication = asyncHandler(async (req, res, next) => {
//   /*
//         1 - get userid from header
//         2 - get access token from header
//         3 - find Keystore with user in database
//         4 - verify token
//         5 - ok all => return next()
//     */
//   const userId = req.headers[HEADER.CLIENT_ID]
//   if (!userId) throw new AuthFailureError('Invalid Request')

//   const keyStore = await findByUserId(userId)
//   if (!keyStore) throw new AuthFailureError('Invalid Request')

//   const accessToken = req.headers[HEADER.AUTHORIZATION]
//   if (!accessToken) throw new AuthFailureError('Invalid Request')

//   try {
//     const decodedUser = verifyJWT(accessToken, keyStore.publicKey)
//     if (userId !== decodedUser.userId) throw new AuthFailureError('Invalid token')
//     req.keyStore = keyStore
//     req.user = decodedUser
//     return next()
//   } catch (error) {
//     throw error
//   }
// })

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
        1 - get userid from header
        2 - get access token from header
        3 - find Keystore with user in database
        4 - verify token
        5 - ok all => return next()
    */
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request')

  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new AuthFailureError('Invalid Request')

  if (req.originalUrl === '/v1/api/auth/refreshToken' && req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decode = verifyJWT(refreshToken, keyStore.publicKey)
      if (decode.userId !== userId) throw new AuthFailureError('Invalid token')
      req.keyStore = keyStore
      req.user = decode
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')
  try {
    const decode = verifyJWT(accessToken, keyStore.publicKey)
    if (decode.userId !== userId) throw new AuthFailureError('Invalid token')
    req.keyStore = keyStore
    req.user = decode
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = (accessToken, keySecret) => {
  return jwt.verify(accessToken, keySecret)
}
module.exports = {
  createTokenPair,
  authenticationV2,
  verifyJWT,
}
