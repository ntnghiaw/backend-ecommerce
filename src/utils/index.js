'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

/**
 * Create ObjectId from string
 * @param {String} id 
 * @returns ObjectId
 */
const convertToObjectIdMongodb = (id) => Types.ObjectId.createFromHexString(id)


/**
 * 
 * @param {*} param0 
 * @returns 
 */
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

/**
 * Convert arrays of fields that don't need to select when querying
 * @param {*} fields fields 
 * @returns Object that contains a pair of key-values corresponded fields that need to be unselected with values equal to 0
 */
const getUnselectedFields = (fields = []) => {
  return Object.fromEntries(fields.map( field => [field, 0]))
}

const removeUndefinedObject = (obj) => {

  Object.keys(obj).forEach(key => {
    if(obj[key] && typeof obj[key] === 'object') removeUndefinedObject(obj[key])
    else if (obj[key] == null) delete obj[key]
  })

  return obj
}

const nestedObjectParser = (obj) => {
  const final = {}
  Object.keys(obj).forEach( key => {
    if(obj[key] && typeof obj[key] === 'object') {
      // recur 
      const res = nestedObjectParser(obj[key])
      Object.keys(res).forEach( k => {
        final[`${key}.${k}`] = res[k]
      })
    }
    else {
      final[key] = obj[key]
    }
    
  })
  return final
}

module.exports = {
  getInfoData,
  getUnselectedFields,
  removeUndefinedObject,
  nestedObjectParser,
  convertToObjectIdMongodb,
}
