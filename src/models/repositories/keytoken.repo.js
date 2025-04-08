'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const keyTokenModel = require('./keytoken.repo')
const {Types} = require('mongoose')


const findByUserId = async (userId) => {
  return await keyTokenModel.findOne({ user: convertToObjectIdMongodb(userId) })
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