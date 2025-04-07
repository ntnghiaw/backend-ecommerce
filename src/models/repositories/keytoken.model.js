'use strict'

const keyTokenModel = require('../keytoken.model')
const {Types} = require('mongoose')


const findByUserId = async (userId) => {
  return await keyTokenModel.findOne({ user: Types.ObjectId.createFromHexString(userId) })
}

const removeKeyTokenById = async (_id) => {
  return await keyTokenModel.deleteOne({ _id})
}

const findByRefreshTokenUsed = async (refreshToken) => {
  return await keyTokenModel.findOne({ usedRefreshTokens: refreshToken })
}

const findByRefreshToken = async (refreshToken) => {
  return await keyTokenModel.findOne({ refreshToken: refreshToken })
}


const removeKeyTokenByUserId = async (userId) => {
  return await keyTokenModel.deleteOne({ user: userId })
}


module.exports = {
  findByUserId,
  removeKeyTokenById,
  removeKeyTokenByUserId,
  findByRefreshTokenUsed,
  findByRefreshToken,
}