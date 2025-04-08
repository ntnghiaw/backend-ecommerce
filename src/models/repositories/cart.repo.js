'use strict'
const { BadRequestError, NotFoundError } = require('../../core/error.response')
const { convertToObjectIdMongodb } = require('../../utils')
const { cart } = require('../cart.model')
const { product } = require('../product.model')
const { checkProductBelongToShop } = require('./product.repo')

const createUserCart = async ({ userId, product }) => {
  const { productId, shopId } = product
  // check product belong to shopId
  const foundProduct = await checkProductBelongToShop({ shopId, productId })
  if (!foundProduct) throw new NotFoundError('Product do not belong to Shop')
  const query = {
      cart_userId: userId,
      cart_state: 'active',
    },
    updateSet = {
      $addToSet: {
        cart_products: {
          ...product,
          price: foundProduct.product_price,
          name: foundProduct.product_name,
          thumbnail: foundProduct.product_thumb,
        },
      },
      $inc: {
        cart_count_products: 1,
      },
    },
    options = {
      upsert: true,
      new: true,
    }

  return await cart.findOneAndUpdate(query, updateSet, options)
}

/**
 * Add a product to cart

 * @param {*} userId 
 * @param {*} product 
 * @returns updated cart
*/
const addProductToCart = async ({ userId, product }) => {
  const { productId, quantity, shopId } = product
  // check product belong to shopId
  const foundProduct = await checkProductBelongToShop({ shopId, productId })
  if (!foundProduct) throw new NotFoundError('Not Found Product belong to Shop')

  let query = {
      cart_userId: userId,
      cart_state: 'active',
      'cart_products.productId': productId,
    },
    updateSet = {},
    options = { upsert: true, new: true }
  // check product existing in cart
  const productInCart = await cart.findOne(query).lean()
  if (!productInCart) {
    // add new product
    updateSet = {
      $addToSet: {
        cart_products: {
          ...product,
          price: foundProduct.product_price,
          name: foundProduct.product_name,
          thumbnail: foundProduct.product_thumb,
        },
      },
      $inc: {
        cart_count_products: 1,
      },
    }
    query = {
      cart_userId: userId,
      cart_state: 'active',
    }
  } else {
    updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity,
      },
    }
  }
  console.log(`::::::::::::::::`, query)

  return await cart.findOneAndUpdate(query, updateSet, options)
}

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product
  const query = {
      cart_userId: userId,
      cart_state: 'active',
      'cart_products.productId': productId,
    },
    update = {
      $inc: {
        'cart_products.$.quantity': quantity,
      },
    },
    options = {
      upsert: true,
      new: true,
    }
  return await cart.findOneAndUpdate(query, update, options)
}

const removeProductFromCart = async ({ userId, productId }) => {
  const query = {
      cart_userId: userId,
      cart_state: 'active',
    },
    updateSet = {
      $pull: {
        cart_products: {
          productId,
        },
      },
      $inc: {
        cart_count_products: -1,
      },
    }

  const deletedCart = await cart.findOneAndUpdate(query, updateSet)
  return deletedCart
}

const checkUserCartExist = async ({ userId }) => {
  return await cart.findOne({
    cart_userId: userId,
    cart_state: 'active',
  })
}

/**
 * Helper function check product valid
 * @param {*} shopId
 * @param {*} productId
 * @returns Object Product if its valid
 */

module.exports = {
  checkUserCartExist,
  createUserCart,
  removeProductFromCart,
  addProductToCart,
  updateUserCartQuantity,
}
