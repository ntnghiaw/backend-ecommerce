'use strict'
const CartService = require('../services/cart.service')

const { SuccessResponse } = require('../core/success.response')

class CartController {
  addProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add product to cart success',
      metadata: await CartService.addToCart(req.body),
    }).send(res)
  }

  updateQuantity = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update  cart success',
      metadata: await CartService.updateProductQuantityInCart(req.body),
    }).send(res)
  }

  removeProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Remove product from cart success',
      metadata: await CartService.removeProduct(req.body),
    }).send(res)
  }

  // ============== QUERY =======================
  getUserCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get user cart success',
      metadata: await CartService.getListUserCart(req.query.userId),
    }).send(res)
  }
}

module.exports = new CartController()
