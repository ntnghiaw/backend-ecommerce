'use strict'

const {  convertToObjectIdMongodb, getUnselectedFields } = require('../../utils')
const { product, electronic, clothing, furniture } = require('../product.model')
const { Types } = require('mongoose')

const searchProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const result = await product
    .find(
      {
        isPublished: true,
        $text: {
          $search: regexSearch,
          $diacriticSensitive: true,
        },
      },
      {
        score: { $meta: 'textScore' },
      }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()
  return result
}

const publishProductByShop = async ({ productId, product_shop }) => {
  const foundProduct = await product.findOne({
    _id: convertToObjectIdMongodb(productId),
    product_shop: convertToObjectIdMongodb(product_shop),
    isDraft: true,
    isPublished: false,
  })
  if (!foundProduct) return null

  foundProduct.isDraft = false
  foundProduct.isPublished = true

  const { modifiedCount } = await foundProduct.updateOne(foundProduct)

  return modifiedCount
}

const unpublishProductByShop = async ({ productId, product_shop }) => {
  const foundProduct = await product.findOne({
    _id: convertToObjectIdMongodb(productId),
    product_shop: convertToObjectIdMongodb(product_shop),
    isDraft: false,
    isPublished: true,
  })
  if (!foundProduct) return null

  foundProduct.isDraft = true
  foundProduct.isPublished = false

  const { modifiedCount } = await foundProduct.updateOne(foundProduct)

  return modifiedCount
}


const updateProductById = async ({ productId, product_shop, payload, model, isNew = true }) => {

  return await model.findOneAndUpdate({
    _id: convertToObjectIdMongodb(productId),
    product_shop: convertToObjectIdMongodb(product_shop),
  }, payload, { new: isNew })

}

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return queryProduct({ query, limit, skip })
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean()
  return products
}

const findProductById = async ({ product_id, unselect }) => {
  return await product.findById(product_id).select(getUnselectedFields(unselect)).lean()
}

const getTypeOfProduct = async ({ productId }) => {
  const foundProduct =  await product.findById(productId).select('product_type').lean()
  return foundProduct.product_type
}
  
const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
}

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProductById,
  updateProductById,
  getTypeOfProduct,
}
