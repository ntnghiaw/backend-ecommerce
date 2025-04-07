'use strict'

const keyTokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
      // const publicKeyString = publicKey.toString()
      // const token = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKeyString,
      // })

      // return token ? publicKeyString : null
      const filter = {
          user: userId,
        },
        update = {
          publicKey,
          privateKey,
          refreshToken, usedRefreshTokens: []
        },
        options = {
          upsert: true,
          new: true
        }
      const token = await keyTokenModel.findOneAndUpdate(filter, update, options).lean()
      return token ? token.publicKey : null
    
  }
}

module.exports = KeyTokenService
