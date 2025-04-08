'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const {
  createDiscountCode,
  findAllDiscountCodes,
  findAllDiscountCodesUnselect,
  findOneDiscountCode,
} = require('../models/repositories/discount.repo')
/*
  Discount Services
  1 - Generate Discount Code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [User | Shop]
  4 - Verify discount code [User]
  5 - Delete discount code [Admin | Shop]
  6 - Cancel discount code [User]
*/
const { discount } = require('../models/discount.model')
const { convertToObjectIdMongodb } = require('../utils')
const {
  findAllProducts,
  getListProductsByShop,
  findProductById,
} = require('../models/repositories/product.repo')

class DiscountService {
  static async createDiscount({ payload, shopId }) {
    return await createDiscountCode({ payload, shopId })
  }

  static async updateDiscountCode({}) {}

  // QUERY ////

  static async getAllProductsWithDiscountCode({ discountCode, limit, page, shopId }) {
    console.log(`limit:: ${+limit} \n page:: ${page}`)
    const foundDiscount = await discount
      .findOne({
        discount_code: discountCode,
        discount_shop: convertToObjectIdMongodb(shopId),
      })
      .lean()

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Not found discount')
    }

    let products
    // check discount range ? all or speficic products

    const { discount_applies_to } = foundDiscount
    if (discount_applies_to === 'all') {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_thumb', 'product_name', 'product_price', 'product_quantity'],
      })
    } else {
      products = await findAllProducts({
        filter: {
          _id: { $in: foundDiscount.discount_products },
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_thumb', 'product_name', 'product_price', 'product_quantity'],
      })
    }

    return products
  }

  static async getAllDiscountCodeByShop({ limit = 50, page = 1, shopId }) {
    const filter = {
      discount_shop: convertToObjectIdMongodb(shopId),
    }
    return await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      filter,
      unselect: ['__v', 'discount_shopId', 'createdAt', 'updatedAt'],
    })
  }

  static async getDiscountAmount({ discountCode, shopId, userId, products }) {
    // check discount code exist
    const foundDiscount = await findOneDiscountCode({
      discount_code: discountCode,
      discount_shop: shopId,
    })

    if (!foundDiscount) throw new NotFoundError('Not found discount')

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_value,
      discount_type,
      discount_products,
      discount_applies_to
    } = foundDiscount

    if (!discount_is_active) throw new NotFoundError('Discount has expired')
    if (discount_max_uses <= 0) throw new NotFoundError('Discount not available')
    if (discount_applies_to === 'specific') {
      products.forEach((product) => {
        console.log(product)
        const existProduct = discount_products.find((pro) => {
          return pro.toString() === product.productId
        })
        if (!existProduct) throw new NotFoundError('Discount not available')
      })
    }
    let totalOrder = 0

    const foundProducts = await Promise.all(
      products.map(async (pro) => {
        const { product_price } = await findProductById({
          product_id: convertToObjectIdMongodb(pro.productId),
        })
        const res = {
          productId: pro.productId,
          quantity: pro.quantity,
          price: product_price,
        }
        return res
      })
    )

    // check total order if min_order_value is required for the discount code
    if (discount_min_order_value > 0) {
      totalOrder = foundProducts.reduce((acc, product, idx) => {
        return acc + product.quantity * product.price
      }, 0)
      if (totalOrder < discount_min_order_value)
        throw new NotFoundError(
          `Discount requires a minimum order value of  ${discount_min_order_value}`
        )
    }

    // check max uses per user
    if (discount_max_uses_per_user > 0) {
      // count number usage by userId
      const numOfUsage = discount_users_used.filter((user) => user.userId === userId).length
      if (numOfUsage >= discount_max_uses_per_user)
        throw new NotFoundError('User reached the limit usage of the discount')
    }

    // check discount type and calculate amount
    const amount =
      discount_type === 'fixed_amount' ? discount_type : totalOrder * (discount_value / 100)

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    }
  }

  // level naive =)))
  static async deleteDiscountCode({ shopId, code }) {
    const deleted = await discount.findOneAndDelete({
      discount_shop: convertToObjectIdMongodb(shopId),
      discount_code: code,
    })
    if (!deleted) throw new NotFoundError('Not found code')
    return deleted
  }

  static async cancelDiscountCode({ code, userId, shopId }) {
    const foundDiscount = await findOneDiscountCode({
      discount_code: code,
      discount_shop: shopId,
    })
    if (!foundDiscount) throw new NotFoundError('Discount not found')

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_used_count: -1,
      },
    })
    return result
  }
}

module.exports = DiscountService
