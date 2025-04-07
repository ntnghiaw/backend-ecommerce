'use strict'

const _ = require('lodash')

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const getSelectedFields = (fields = []) => {
  return Object.fromEntries(fields.map( field => [field, 1]))
}

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
  console.log(`Berfore parser::` ,final)
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
  console.log(`After parser::`, final)
  
  return final
}

module.exports = {
  getInfoData,
  getSelectedFields,
  getUnselectedFields,
  removeUndefinedObject,
  nestedObjectParser,
}
