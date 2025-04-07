'use strict'

const { getUnselectedFields, convertToObjectIdMongodb } = require('../../utils')
const { BadRequestError } = require('../../core/error.response')
const { discount } = require('../discount.model')

const createDiscountCode = async ({payload, shopId}) => {
  const {
    name,
    description,
    type,
    value,
    code,
    startDate,
    endDate,
    maxUses,
    usedCount,
    usersUsed,
    maxUsesPerUser,
    minOrderValue,
    isActive,
    appliesTo,
    productIds,
  } = payload

  if (
    new Date(startDate) < new Date() ||
    new Date() > new Date(endDate) ||
    new Date(startDate) >= new Date(endDate)
  ) {
    throw new BadRequestError('Discount code has expired')
  }
  const foundDiscount = await findOneDiscountCode({
      discount_code: code,
      discount_shop: convertToObjectIdMongodb(shopId),
   
  })

  if (foundDiscount) {
    throw new BadRequestError('Discount exists')
  }

  const newDiscount = await discount.create({
    discount_name: name,
    discount_description: description,
    discount_type: type,
    discount_value: value,
    discount_code: code,
    discount_start_date: startDate,
    discount_end_date: endDate,
    discount_max_uses: maxUses,
    discount_used_count: usedCount,
    discount_users_used: usersUsed,
    discount_max_uses_per_user: maxUsesPerUser,
    discount_min_order_value: minOrderValue || 0,
    discount_shop: shopId,
    discount_is_active: isActive,
    discount_applies_to: appliesTo,
    discount_products: appliesTo === 'all' ? [] : productIds,
  })

  return newDiscount
}

const findAllDiscountCodes = async ({ limit, sort = 'ctime', page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const discounts = await discount
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean()
  return discounts
}

const findOneDiscountCode = async ( filter ) => {
  return await discount.findOne(filter).lean()
}

/**
 * Get all discount codes with specific fields unselected
 * @param {String[]} unselect  fields that dont need to select
 * @returns List of discount codes
 */
const findAllDiscountCodesUnselect = async ({ limit, sort, page, filter, unselect }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const discounts = await discount
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getUnselectedFields(unselect))
    .lean()
  return discounts
}

module.exports = {
  createDiscountCode,
  findOneDiscountCode,
  findAllDiscountCodes,
  findAllDiscountCodesUnselect,
}
