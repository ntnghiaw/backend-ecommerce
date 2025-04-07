'use strict'
const DiscountService = require('../services/discount.service')

const { SuccessResponse } = require('../core/success.response')

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create code success',
      metadata: await DiscountService.createDiscount({
        payload: req.body,
        shopId: req.user.userId,
      }),
    }).send(res)
  }

  deleteDiscount = async (req, res, next) => {
       new SuccessResponse({
         message: 'Delete code success',
         metadata: await DiscountService.deleteDiscountCode({
           code: req.params.discountCode,
           shopId: req.user.userId,
         }),
       }).send(res)
  }

  // ============== QUERY ======================= 

  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all codes success',
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res)
  }

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all codes success',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res)
  }

  getAllProductsWithDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all products success',
      metadata: await DiscountService.getAllProductsWithDiscountCode({
        ...req.query,
      }),
    }).send(res)
  }


}

module.exports  = new DiscountController()