'use strict'

const express = require('express')
const router = express.Router()
const discountController = require('../../controllers/discount.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// get amount discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list_products', asyncHandler(discountController.getAllProductsWithDiscount))


// authentication
router.use(authenticationV2)

router.post('/', asyncHandler(discountController.createDiscountCode))
router.delete('/:discountCode', asyncHandler(discountController.deleteDiscount))

router.get('/', asyncHandler(discountController.getAllDiscountCodes))


module.exports = router