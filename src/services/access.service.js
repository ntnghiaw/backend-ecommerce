'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keytoken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('../models/repositories/shop.repo')
const {
  removeKeyTokenById,
  removeKeyTokenByUserId,
  findByRefreshTokenUsed,
  findByRefreshToken,
} = require('../models/repositories/keytoken.model')

const Roles = {
  ADMIN: '0000',
  SHOP: '0001',
  WRITER: '0002',
  EDITOR: '0003',
}

class AccessService {
  /**
   * Check refresh token used
   */
  static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const {userId, email} = user

    if (keyStore.usedRefreshTokens.includes(refreshToken)) {
      // delete keyToken
      await removeKeyTokenByUserId(userId)
      throw new ForbiddenError(`Something wrong happened. Please login again`)
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError(`Shop not registered`)
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailureError(`Shop not registered`)

    // create new access token, refresh token
    const newTokens = createTokenPair(
      {
        userId,
        email,
      },
      keyStore.privateKey
    )

    // update refresh token in database
    await keyStore.updateOne({
      $set: {
        refreshToken: newTokens.refreshToken,
      },
      $addToSet: {
        usedRefreshTokens: refreshToken, // add refresh token to usedRefreshTokens array
      },
    })

    return {
      user,
      tokens: newTokens,
    }
 
  }

  static logout = async (keyStore) => {
    return await removeKeyTokenById(keyStore._id)
  }

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new BadRequestError(`Shop not registered`)

    const match = await bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailureError(`Password is incorrect`)

    // generate privateKey, publicKey
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    })

    const { _id: userId } = foundShop._id
    // create accessToken, refreshToken
    const tokens = createTokenPair(
      {
        userId,
        email,
      },
      privateKey
    )

    // store refreshToken, publicKey
    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    })

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens,
    }
  }

  static signUp = async ({ name, email, password }) => {
    // step 1: check email exists
    const holderShop = await shopModel.findOne({ email }).lean()
    if (holderShop) {
      throw new BadRequestError(`Email ${email} is already registered. Please try another email.`)
    }

    // step 2: hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // step 3: create new shop
    const newShop = await shopModel.create({
      name,
      email,
      password: hashedPassword,
      roles: [Roles.SHOP],
    })

    if (!newShop) {
      return {
        code: 'xxx',
        message: 'Error creating new shop',
        status: 'error',
      }
    }

    // step 4: create access token and refresh token if new shop created
    if (newShop) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      })

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      })

      if (!publicKeyString) {
        return {
          code: 'xxx',
          message: 'Error creating key token',
          status: 'error',
        }
      }

      const tokens = createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        privateKey
      )

      return {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: newShop,
        }),
        tokens,
      }
    }

    return null
  }
}

module.exports = AccessService
