'use strict'

const { BadRequestError } = require('../core/error.response')
const { cart } = require('../models/cart.model')
const {
  checkUserCartExist,
  createUserCart,
  addProductToCart,
  removeProductFromCart,
  updateUserCartQuantity,
} = require('../models/repositories/cart.repo')
const { checkProductBelongToShop } = require('../models/repositories/product.repo')

/*
  Key features:
  - add product to cart [user]
  - reduce product quantity by one [user]
  - increase product quantity by one [User]
  - get cart [User]
  - delete cart [User]
  - delete cart item [User] 
  
 */

class CartService {
  /*
   === Feature: User add product to cart ===
  1. if cart not exist -> create new cart and insert products
  2. if cart exist: 
    - check product exist in cart
        + yes -> update quantity
        - no -> insert

  
  */

  static async addToCart({ userId, product = {} }) {
    const userCart = await checkUserCartExist({ userId })
    if (!userCart) {
      //create new cart
      return await createUserCart({ userId, product })
    }

    return await addProductToCart({ userId, product })
  }

  static async updateProductQuantityInCart({ userId, shop_order_ids = {} }) {
    const { quantity, old_quantity, productId, shopId } = shop_order_ids[0]?.item_products[0]
    const foundProduct = await checkProductBelongToShop({ shopId, productId })
    if (!foundProduct) throw new NotFoundError('Not Found Product')
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product do not belong to Shop')
    }

    if (quantity === 0) {
      // remove product from cart
      return await this.removeProduct({ userId, productId })
    }

    return await updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    })
  }

  static async removeProduct({ userId, productId }) {
    return await removeProductFromCart({ userId, productId })
  }

  static async getListUserCart(userId) {
    return await cart.findOne({ cart_userId: userId}).lean()
  }
}

module.exports = CartService
